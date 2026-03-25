<?php

namespace App\Jobs;

use App\Models\ImportJob;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\BrowserKit\HttpBrowser;

class ScrapeSingleProductJob implements ShouldQueue
{
    use Queueable;

    public $timeout = 120; // 2 minutes max per product

    protected $importJob;
    protected $url;

    /**
     * Create a new job instance.
     */
    public function __construct(ImportJob $importJob, string $url)
    {
        $this->importJob = $importJob;
        $this->url = $url;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if job was manually stopped
        $this->importJob->refresh();
        if ($this->importJob->status === 'failed') {
            Log::info("Job #{$this->importJob->id} has been stopped. Aborting product scrape.");
            return;
        }

        // Check if product already exists (duplicate prevention)
        if (Product::where('source_url', $this->url)->exists()) {
            Log::info("Skipping duplicate product: " . $this->url);
            return;
        }

        try {
            $browser = new HttpBrowser(HttpClient::create([
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ],
                'verify_peer' => false,
                'verify_host' => false,
            ]));

            $crawler = $browser->request('GET', $this->url);

            // Heuristics for Title (usually h1)
            $name = '';
            if ($crawler->filter('h1')->count() > 0) {
                $name = trim($crawler->filter('h1')->first()->text());
            } else if ($crawler->filter('title')->count() > 0) {
                 $name = trim(str_replace(['Buy', 'Online'], '', $crawler->filter('title')->first()->text()));
            }

            // Heuristics for Price
            $priceText = '';
            $priceSelectors = ['.price', '[class*="price"]', '#price', '[data-price]', '[itemprop="price"]'];
            foreach ($priceSelectors as $sel) {
                if ($crawler->filter($sel)->count() > 0) {
                    $priceText = $crawler->filter($sel)->first()->text();
                    break;
                }
            }
            
            // Clean price text (e.g., "$1,299.99" -> 1299.99)
            $price = (float) filter_var($priceText, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            if ($price == 0) $price = 99.99; // Fallback

            // Heuristics for Images
            $imageUrls = [];
            $crawler->filter('img')->each(function ($node) use (&$imageUrls) {
                // Usually large images have these classes or are inside galleries
                $class = $node->attr('class') ?? '';
                $src = $node->attr('src') ?? $node->attr('data-src');
                
                if ($src && (str_contains($class, 'gallery') || str_contains($class, 'main') || str_contains($class, 'zoom') || str_contains($class, 'product'))) {
                    // Make absolute
                    if (str_starts_with($src, '/')) {
                        $parsedUrl = parse_url($this->url);
                        $src = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? 'uae.microless.com') . $src;
                    }
                    if (!in_array($src, $imageUrls)) {
                        $imageUrls[] = $src;
                    }
                }
            });

            // Fallback for images if none found based on class names
            if (empty($imageUrls)) {
                $crawler->filter('img')->each(function ($node) use (&$imageUrls) {
                     $src = $node->attr('src') ?? $node->attr('data-src');
                     // Only grab large enough images, avoid tiny icons
                     if ($src && str_contains($src, 'http') && (str_contains($src, 'm.media') || str_contains($src, 'cdn'))) {
                         if (!in_array($src, $imageUrls)) {
                             $imageUrls[] = $src;
                         }
                     }
                });
            }

            // Create Product in DB
            $product = Product::create([
                'name' => $name ? $name : 'Imported Product ' . Str::random(5),
                'slug' => Str::slug($name) . '-' . Str::random(4),
                'source_url' => $this->url,
                'category_id' => $this->importJob->local_category_id,
                'price' => $price,
                'description' => 'Imported via Scraper',
                'is_imported' => true,
                'brand_id' => null, // Left null to be categorized later
                'import_metadata' => json_encode(['original_price_text' => $priceText, 'extracted_images' => $imageUrls]),
                'images' => [] // Will be populated by the next job
            ]);

            // Update Progress Counter
            $this->importJob->increment('processed_count');

            // Dispatch Image Download
            if (!empty($imageUrls)) {
                DownloadProductImagesJob::dispatch($product, $imageUrls);
            }

            Log::info("Successfully scraped and saved: " . $product->name);

        } catch (\Exception $e) {
            $this->importJob->increment('failed_count');
            
            $logs = json_decode($this->importJob->error_logs ?? '[]', true);
            $logs[] = ['url' => $this->url, 'error' => $e->getMessage()];
            $this->importJob->update(['error_logs' => json_encode($logs)]);
            
            Log::error("Scrape Single Product Failed [{$this->url}]: " . $e->getMessage());
        }
    }
}
