<?php

namespace App\Jobs;

use App\Models\ImportJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\BrowserKit\HttpBrowser;

class CrawlCategoryPageJob implements ShouldQueue
{
    use Queueable;

    public $timeout = 300; // 5 minutes max to crawl

    protected $importJob;

    /**
     * Create a new job instance.
     */
    public function __construct(ImportJob $importJob)
    {
        $this->importJob = $importJob;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->importJob->update(['status' => 'crawling_links']);
        
        $browser = new HttpBrowser(HttpClient::create([
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            ],
            'verify_peer' => false,
            'verify_host' => false,
        ]));

        $productUrls = [];
        $currentUrl = $this->importJob->source_category_url;
        
        try {
            // Simplified Crawl Logic (just the first page for MVP)
            // Advanced pagination requires site-specific next-page selectors.
            Log::info("Scraping category URL: " . $currentUrl);
            $crawler = $browser->request('GET', $currentUrl);

            // This is a generic heuristic selector. It looks for typical product link patterns.
            // Needs tuning based on target site, but we grab all anchor tags that look like product details.
            $nodes = $crawler->filter('a[href*="/product/"], a[href*="/p/"], a[href*="/item/"]')->links();
            
            foreach ($nodes as $node) {
                // Ensure absolute URL
                $url = $node->getUri(); 
                if (!in_array($url, $productUrls)) {
                    $productUrls[] = $url;
                }
            }

            // Fallback generic heuristic if the above fails
            if (count($productUrls) === 0) {
                 $nodes = $crawler->filter('a')->links();
                 foreach ($nodes as $node) {
                     $url = $node->getUri();
                     if (strpos($url, '.html') !== false || strlen(parse_url($url, PHP_URL_PATH) ?? '') > 20) {
                         if (!in_array($url, $productUrls)) {
                             $productUrls[] = $url;
                         }
                     }
                 }
            }

            // Limit to max 50 products per scrape action for safety
            $productUrls = array_slice($productUrls, 0, 50);

            $this->importJob->update([
                'status' => 'scraping_products',
                'total_found' => count($productUrls)
            ]);

            Log::info("Found " . count($productUrls) . " products. Dispatching Jobs.");

            foreach ($productUrls as $url) {
                ScrapeSingleProductJob::dispatch($this->importJob, $url);
            }

        } catch (\Exception $e) {
            $this->importJob->update([
                'status' => 'failed',
                'error_logs' => json_encode(['error' => $e->getMessage()]),
            ]);
            Log::error("Category Crawl Failed: " . $e->getMessage());
        }
    }
}
