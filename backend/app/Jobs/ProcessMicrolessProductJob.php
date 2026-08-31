<?php

namespace App\Jobs;

use App\Models\ImportJob;
use App\Models\Product;
use App\Jobs\DownloadProductImagesJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessMicrolessProductJob implements ShouldQueue
{
    use Queueable;

    protected $importJob;
    protected $data;

    /**
     * Create a new job instance.
     */
    public function __construct(ImportJob $importJob, array $data)
    {
        $this->importJob = $importJob;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->importJob->refresh();
        if ($this->importJob->status === 'failed') {
            return;
        }

        // Extracting data from Microless JSON structure
        $sourceUrl = $this->data['url'] ?? $this->data['product_url'] ?? '';
        if ($sourceUrl && str_starts_with($sourceUrl, '/')) {
            $sourceUrl = 'https://uae.microless.com' . $sourceUrl;
        }

        if (empty($sourceUrl)) {
            Log::warning("Skipping Microless product: No URL found.");
            return;
        }

        // Create initial log entry
        $log = \App\Models\ImportLog::create([
            'import_job_id' => $this->importJob->id,
            'product_url' => $sourceUrl,
            'status' => 'scraping',
            'message' => 'Starting deep scrape...',
            'data' => ['input_data' => $this->data]
        ]);

        // Duplicate Check
        if (Product::where('source_url', $sourceUrl)->exists()) {
            $log->update([
                'status' => 'success',
                'message' => 'Product already exists, skipping duplicate.'
            ]);
            $this->importJob->increment('processed_count');
            return;
        }

        // Price Mapping Fix
        $price = 0;
        if (isset($this->data['active_offer']['price'])) {
            $price = (float) $this->data['active_offer']['price'];
        } elseif (isset($this->data['price'])) {
            $price = (float) $this->data['price'];
        }

        // Cover Image Fix
        $coverImage = $this->data['cover_image_url'] ?? $this->data['image'] ?? null;
        
        $name = $this->data['title'] ?? $this->data['name'] ?? 'Microless Product';
        $sku = $this->data['sku'] ?? $this->data['SKU'] ?? $this->data['model_number'] ?? null;
        $brand = $this->data['brand_name'] ?? $this->data['brand'] ?? null;
        
        // Create or find Brand record
        $brandModel = \App\Models\Brand::findOrCreateByName($brand);
        
        // DEEP SCRAPE START
        $galleryImages = [];
        $description = 'Imported from Microless API';
        $specs = null;

        try {
            $browser = new \Symfony\Component\BrowserKit\HttpBrowser(\Symfony\Component\HttpClient\HttpClient::create([
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ],
                'verify_peer' => false,
            ]));

            $crawler = $browser->request('GET', $sourceUrl);

            // 1. Refined Title
            if ($crawler->filter('h1.product-title-h1 span')->count() > 0) {
                $name = trim($crawler->filter('h1.product-title-h1 span')->first()->text());
            }

            // 2. Refined Model & SKU
            if ($crawler->filter('.product-model-wrp .value')->count() > 0) {
                $model = trim($crawler->filter('.product-model-wrp .value')->first()->text());
            }
            if ($crawler->filter('.product-sku-wrp .value')->count() > 0) {
                $sku = trim($crawler->filter('.product-sku-wrp .value')->first()->text());
            }

            // 3. Refined Price
            if ($crawler->filter('.product-main-price .price-amount')->count() > 0) {
                $priceText = $crawler->filter('.product-main-price .price-amount')->first()->text();
                $price = (float) filter_var($priceText, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            }

            // 4. Refined Gallery (Hi-Res)
            $crawler->filter('#product-images-slider a.lightbox-opener')->each(function($node) use (&$galleryImages) {
                $href = $node->attr('href');
                if ($href) {
                    // Normalize URL if needed
                    if (str_starts_with($href, '//')) $href = 'https:' . $href;
                    if (!in_array($href, $galleryImages)) {
                        $galleryImages[] = $href;
                    }
                }
            });

            // 5. Build Highlights (Main Specs)
            $highlights = [];
            $crawler->filter('ul.product-attributes-featured li span')->each(function($node) use (&$highlights) {
                $highlights[] = trim($node->text());
            });

            // 6. Extract Description (Clean)
            if ($crawler->filter('.product-description')->count() > 0) {
                $descNode = $crawler->filter('.product-description')->first();
                $html = $descNode->html();
                $description = preg_replace('/<img[^>]+\>/i', '', $html);
            }

            // 7. Full Spec Table
            $fullSpecs = [];
            $crawler->filter('table.table-bordered tr')->each(function($node) use (&$fullSpecs) {
                $th = $node->filter('th');
                $td = $node->filter('td');
                if ($th->count() > 0 && $td->count() > 0) {
                    $key = trim($th->first()->text());
                    $val = trim($td->first()->text());
                    $fullSpecs[$key] = $val;
                }
            });

            $specs = [
                'highlights' => $highlights,
                'full_specs' => $fullSpecs,
                'model' => $model ?? null
            ];

            $log->update([
                'message' => 'Scraped product details and ' . count($galleryImages) . ' images.',
                'status' => 'downloading'
            ]);

        } catch (\Exception $e) {
            Log::warning("Deep Scrape failed for {$sourceUrl}: " . $e->getMessage());
            $log->update([
                'status' => 'failed',
                'message' => 'Deep scrape failed: ' . $e->getMessage()
            ]);
        }

        if (empty($galleryImages) && $coverImage) {
            $galleryImages = [$coverImage];
        }

        try {
            // Optimized Slug Generation (SEO Friendly)
            $slugBase = $name;
            $words = explode(' ', $name);
            if (count($words) > 8) {
                $slugBase = implode(' ', array_slice($words, 0, 8));
            }
            $slug = Str::slug($slugBase) . '-' . Str::random(4);

            // Enhance Description for Zeronix
            $enhancedDescription = '<div class="product-overview-premium">';
            $enhancedDescription .= '<p class="lead text-lg font-semibold text-accent-primary mb-4">Elevate your experience with the ' . $brand . ' ' . ($model ?? 'Performance Component') . '.</p>';
            $enhancedDescription .= '<p class="mb-6">' . $description . '</p>';
            $enhancedDescription .= '</div>';

            // Create or Update Product
            $product = Product::updateOrCreate(
                ['source_url' => $sourceUrl],
                [
                    'name' => $name,
                    'slug' => $slug,
                    'description' => $enhancedDescription,
                    'category_id' => $this->importJob->local_category_id,
                    'brand' => $brand,
                    'brand_id' => $brandModel?->id,
                    'price' => $price > 0 ? $price : 99.99,
                    'status' => 'active',
                    'specs' => $specs,
                    'is_imported' => true,
                    'import_metadata' => [
                        'source' => 'microless_api',
                        'sku' => $sku,
                        'model' => $model ?? null,
                        'original_data' => $this->data
                    ]
                ]
            );

            // Dispatch Image Downloads
            if (!empty($galleryImages)) {
                DownloadProductImagesJob::dispatch($product, $galleryImages);
            }

            $log->update([
                'status' => 'success',
                'message' => 'Product imported successfully and images queued for download.'
            ]);

            $this->importJob->increment('processed_count');

        } catch (\Exception $e) {
            $this->importJob->increment('failed_count');
            Log::error("Failed to process Microless product: " . $e->getMessage());
            $log->update([
                'status' => 'failed',
                'message' => 'Database error: ' . $e->getMessage()
            ]);
        }
    }
}
