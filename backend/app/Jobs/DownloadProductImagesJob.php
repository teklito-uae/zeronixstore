<?php

namespace App\Jobs;

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DownloadProductImagesJob implements ShouldQueue
{
    use Queueable;

    public $timeout = 300; // 5 minutes (images can take time)

    protected $product;
    protected $imageUrls;

    /**
     * Create a new job instance.
     */
    public function __construct(Product $product, array $imageUrls)
    {
        $this->product = $product;
        $this->imageUrls = $imageUrls;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $localPaths = [];

        // Keep generated filenames sane regardless of how long the scraped
        // product title is — full titles here can run past 150 characters,
        // which previously produced a path Laravel could `put()` to disk
        // fine but that silently failed to insert into product_images.path
        // (varchar(255)) once the "/storage/products/..." prefix and the
        // "_zeronix_{id}_{index}.{ext}" suffix were added on top.
        $nameWords = explode(' ', $this->product->name);
        $slugBase = count($nameWords) > 8 ? implode(' ', array_slice($nameWords, 0, 8)) : $this->product->name;
        $productNameSlug = Str::slug($slugBase, '_');

        // Cap the gallery: 5-6 images is plenty for a listing, and every
        // extra one is a full HTTP fetch. Applied here (not at the scrape
        // site) so both scraper paths that feed this job — the Microless
        // deep-scrape and the generic URL crawler — get the same limit for
        // free instead of each having to remember to cap on their own.
        $imageUrls = array_slice($this->imageUrls, 0, 6);

        foreach ($imageUrls as $index => $url) {
            try {
                // Fetch image (disabling verify for scraped images to avoid SSL issues)
                $response = Http::withOptions(['verify' => false])->timeout(30)->get($url);
                
                if ($response->successful()) {
                    // Try to guess extension
                    $contentType = $response->header('Content-Type');
                    $extension = 'jpg';
                    if (str_contains($contentType, 'png')) $extension = 'png';
                    if (str_contains($contentType, 'webp')) $extension = 'webp';

                    // New naming convention: product_name_zeronix_productid_index.extension
                    $filename = "products/{$productNameSlug}_zeronix_{$this->product->id}_{$index}.{$extension}";
                    
                    Storage::disk('public')->put($filename, $response->body());
                    
                    $path = '/storage/' . $filename;
                    $localPaths[] = $path;

                    // Store in product_images table
                    \App\Models\ProductImage::updateOrCreate(
                        ['product_id' => $this->product->id, 'path' => $path],
                        [
                            'alt' => $this->product->name,
                            'is_primary' => $index === 0
                        ]
                    );
                }
            } catch (\Exception $e) {
                Log::warning("Failed to download image for product {$this->product->id} from {$url}: " . $e->getMessage());
            }
        }

        // Update the legacy images column for backward compatibility if needed, or leave it null
        if (!empty($localPaths)) {
            $this->product->update(['images' => $localPaths]);
            Log::info("Downloaded " . count($localPaths) . " images for Product: " . $this->product->name);
        }
    }
}
