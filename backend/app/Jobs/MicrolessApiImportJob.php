<?php

namespace App\Jobs;

use App\Models\ImportJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MicrolessApiImportJob implements ShouldQueue
{
    use Queueable;

    public $timeout = 600; // 10 minutes for large imports

    protected $importJob;
    protected $filters;

    /**
     * Create a new job instance.
     * @param ImportJob $importJob
     * @param array $filters (includes category_id, brands, query, etc)
     */
    public function __construct(ImportJob $importJob, array $filters = [])
    {
        $this->importJob = $importJob;
        $this->filters = $filters;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->importJob->update(['status' => 'crawling_links']);
        
        $searchPageUrl = 'https://uae.microless.com/search/';
        $apiUrl = 'https://uae.microless.com/search/?decode_brands_filters';
        
        try {
            // STEP 1: Get Initial Session and CSRF Token
            Log::info("Microless: Visiting search page to collect session/CSRF");
            $initialResponse = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ])->get($searchPageUrl);

            if (!$initialResponse->successful()) {
                throw new \Exception("Could not access Microless search page to obtain tokens.");
            }

            // Extract CSRF token from meta tag
            preg_match('/<meta name="csrf-token" content="(.*?)">/', $initialResponse->body(), $matches);
            $csrfToken = $matches[1] ?? null;

            if (!$csrfToken) {
                throw new \Exception("CSRF Token not found in Microless page source.");
            }

            $cookies = $initialResponse->cookies();
            Log::info("Microless session established. CSRF Token: " . substr($csrfToken, 0, 5) . "...");

            $page = 1;
            $hasMore = true;

            while ($hasMore) {
                // Check if manually stopped
                $this->importJob->refresh();
                if ($this->importJob->status === 'failed') {
                    Log::info("Microless Job #{$this->importJob->id} stopped by admin.");
                    return;
                }

                $brands = $this->filters['brands'] ?? '';
                if (is_string($brands) && !empty($brands)) {
                    $brands = array_map('trim', explode(',', $brands));
                } elseif (empty($brands)) {
                    $brands = [];
                }

                $payload = [
                    'page' => $page,
                    'category_id' => (string) ($this->filters['category_id'] ?? ''),
                    'brands' => $brands,
                    'filters' => $this->filters['filters'] ?? [],
                    'query' => $this->filters['query'] ?? '',
                    'sort' => $this->filters['sort'] ?? 'popularity',
                    'discount' => 0,
                    'history' => 0,
                    'include_out_of_stock' => 0,
                    'language' => 1,
                    'seller' => '',
                    'fbm_only' => 0,
                    'new_arrival' => 0,
                    'params' => (object) [],
                    'configurator' => ''
                ];

                Log::info("Fetching Microless API Page {$page} for Job #{$this->importJob->id}");

                $response = Http::withHeaders([
                    'X-CSRF-TOKEN' => $csrfToken,
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Accept' => 'application/json, text/javascript, */*; q=0.01',
                    'Referer' => $searchPageUrl,
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ])->withCookies($cookies->toArray(), 'uae.microless.com')
                  ->asJson()
                  ->post($apiUrl, $payload);

                if (!$response->successful()) {
                    Log::error("Microless API Failed: " . $response->body());
                    throw new \Exception("Microless API Request Failed: Status " . $response->status());
                }

                $data = $response->json();
                $allProducts = [];

                // Microless returns an array of result blocks
                if (is_array($data)) {
                    foreach ($data as $block) {
                        if (isset($block['products']) && is_array($block['products'])) {
                            $allProducts = array_merge($allProducts, $block['products']);
                        }
                    }
                }

                if (empty($allProducts) && isset($data['products'])) {
                    $allProducts = $data['products'];
                }

                if (empty($allProducts)) {
                    Log::info("Microless: No more products found on page {$page}");
                    $hasMore = false;
                    break;
                }

                if ($page === 1) {
                    // Try to find total count in the first block or root
                    $totalFound = $data[0]['total_count'] ?? $data['total_count'] ?? count($allProducts);
                    $this->importJob->update([
                        'total_found' => $totalFound,
                        'status' => 'scraping_products'
                    ]);
                }

                foreach ($allProducts as $productData) {
                    ProcessMicrolessProductJob::dispatch($this->importJob, $productData);
                }

                // Pagination logic
                if (count($allProducts) < 10 || $page >= 50) { 
                    $hasMore = false;
                } else {
                    $page++;
                }

                sleep(3); // respectful delay
            }

            Log::info("Microless API crawling finished. Products queued: " . $this->importJob->total_found);

        } catch (\Exception $e) {
            $this->importJob->update([
                'status' => 'failed',
                'error_logs' => json_encode(['error' => $e->getMessage()]),
            ]);
            Log::error("Microless API Import Failed: " . $e->getMessage());
        }
    }
}
