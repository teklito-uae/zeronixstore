<?php

namespace App\Console\Commands;

use App\Jobs\DownloadProductImagesJob;
use App\Jobs\ProcessMicrolessProductJob;
use App\Models\Category;
use App\Models\ImportJob;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * One-off catalog seeding: pulls real products (name, price, specs, gallery
 * images) from Microless's public search, using the exact same
 * scrape/download pipeline the admin-triggered import uses
 * (ProcessMicrolessProductJob + DownloadProductImagesJob) so results are
 * indistinguishable from a real import. Products are matched to local
 * categories by search query, not Microless's internal category ids (which
 * nothing in this app has mapped yet).
 */
class SeedMicrolessDemoProducts extends Command
{
    protected $signature = 'products:seed-microless-demo {--per-query=4 : Max products to import per search query}';

    protected $description = 'Seed the catalog with real Microless products (real prices/specs/images) across the Zeronix category taxonomy.';

    /** @var array<string, string> search query => local category slug */
    private array $plan = [
        'gaming laptop' => 'gaming-laptops',
        'business laptop' => 'business-laptops',
        '2 in 1 laptop' => '2-in-1-laptops',
        'gaming desktop pc' => 'gaming-pcs',
        'mini pc' => 'mini-pcs',
        'graphics card' => 'graphics-cards',
        'processor cpu' => 'processors',
        'nvme ssd' => 'storage',
        'gaming monitor' => 'gaming-monitors',
        '4k monitor' => '4k-ultrawide-monitors',
        'office monitor' => 'office-monitors',
        'gaming keyboard' => 'keyboards-mice',
        'wireless mouse' => 'keyboards-mice',
        'gaming headset' => 'headsets',
        'webcam' => 'webcams-streaming',
    ];

    public function handle(): int
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $this->error('No admin user exists to attribute this import to.');
            return self::FAILURE;
        }

        $searchPageUrl = 'https://uae.microless.com/search/';
        $apiUrl = 'https://uae.microless.com/search/?decode_brands_filters';
        $perQuery = (int) $this->option('per-query');

        $this->info('Establishing Microless session...');
        $initial = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ])->get($searchPageUrl);

        if (!$initial->successful()) {
            $this->error('Could not reach Microless search page.');
            return self::FAILURE;
        }

        preg_match('/<meta name="csrf-token" content="(.*?)">/', $initial->body(), $matches);
        $csrfToken = $matches[1] ?? null;
        if (!$csrfToken) {
            $this->error('CSRF token not found on Microless search page.');
            return self::FAILURE;
        }
        // $initial->cookies() is a Guzzle CookieJar; ->toArray() yields each
        // cookie's full attribute set (Name/Value/Domain/...), not a plain
        // name=>value map, which is what withCookies() expects. Build that
        // map explicitly instead of passing the raw jar array straight through.
        $cookies = [];
        foreach ($initial->cookies() as $cookie) {
            $cookies[$cookie->getName()] = $cookie->getValue();
        }

        $totalQueued = 0;

        foreach ($this->plan as $query => $categorySlug) {
            $category = Category::where('slug', $categorySlug)->first();
            if (!$category) {
                $this->warn("Skipping \"{$query}\" — local category \"{$categorySlug}\" not found.");
                continue;
            }

            $response = Http::withHeaders([
                'X-CSRF-TOKEN' => $csrfToken,
                'X-Requested-With' => 'XMLHttpRequest',
                'Accept' => 'application/json, text/javascript, */*; q=0.01',
                'Referer' => $searchPageUrl,
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ])->withCookies($cookies, 'uae.microless.com')
              ->asJson()
              ->post($apiUrl, [
                  'page' => 1,
                  'category_id' => '',
                  'brands' => [],
                  'filters' => [],
                  'query' => $query,
                  'sort' => 'popularity',
                  'discount' => 0,
                  'history' => 0,
                  'include_out_of_stock' => 0,
                  'language' => 1,
                  'seller' => '',
                  'fbm_only' => 0,
                  'new_arrival' => 0,
                  'params' => (object) [],
                  'configurator' => '',
              ]);

            if (!$response->successful()) {
                $this->warn("Search failed for \"{$query}\" (HTTP {$response->status()}).");
                continue;
            }

            $data = $response->json();
            $products = [];
            if (is_array($data)) {
                foreach ($data as $block) {
                    if (isset($block['products']) && is_array($block['products'])) {
                        $products = array_merge($products, $block['products']);
                    }
                }
            }
            if (empty($products) && isset($data['products'])) {
                $products = $data['products'];
            }
            $products = array_slice($products, 0, $perQuery);

            if (empty($products)) {
                $this->warn("No results for \"{$query}\".");
                continue;
            }

            $importJob = ImportJob::create([
                'admin_id' => $admin->id,
                'source_category_url' => "Demo seed: \"{$query}\"",
                'local_category_id' => $category->id,
                'status' => 'scraping_products',
                'total_found' => count($products),
            ]);

            foreach ($products as $productData) {
                ProcessMicrolessProductJob::dispatchSync($importJob, $productData);
                $totalQueued++;
            }

            $this->info("\"{$query}\" -> {$category->name}: " . count($products) . ' products processed.');

            // Respectful delay between search requests, matching the real import job.
            sleep(2);
        }

        $this->info("Done. {$totalQueued} products processed. Downloading images (drains the image-download queue)...");
        $this->call('queue:work', ['--queue' => 'default', '--stop-when-empty' => true, '--timeout' => 60]);

        return self::SUCCESS;
    }
}
