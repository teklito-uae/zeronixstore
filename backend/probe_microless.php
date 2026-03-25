<?php

require 'vendor/autoload.php';

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\BrowserKit\HttpBrowser;

$url = 'https://uae.microless.com/product/lenovo-loq-15iax9e-gaming-laptop-15-6-fhd-ips-144hz-display-intel-core-i5-12450hx-16gb-ram-512gb-ssd-geforce-rtx-3050-6gb-gpu-english-keyboard-win11-luna-grey-83lk00cvus/';

$browser = new HttpBrowser(HttpClient::create([
    'headers' => [
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    'verify_peer' => false,
]));

try {
    $crawler = $browser->request('GET', $url);
    
    ob_start();
    echo "PAGE TITLE: " . $crawler->filter('title')->text() . "\n\n";

    echo "--- GALLERY IMAGES ---\n";
    $crawler->filter('img')->each(function($node) {
        $src = $node->attr('data-src') ?? $node->attr('src');
        if (str_contains($src, 'cdn/products')) {
            echo "Found Product Img: " . $src . "\n";
        }
    });

    echo "\n--- DESCRIPTION CONTAINER ---\n";
    if ($crawler->filter('#product-details-description')->count() > 0) {
        echo "Found #product-details-description\n";
    } elseif ($crawler->filter('.product-description')->count() > 0) {
        echo "Found .product-description\n";
    }

    echo "\n--- SPECS TABLE ---\n";
    $crawler->filter('table')->each(function($node, $i) {
        echo "Table $i classes: " . $node->attr('class') . " ID: " . $node->attr('id') . "\n";
    });

    echo "\n--- TABS ---\n";
    $crawler->filter('a[data-toggle="tab"], .nav-link')->each(function($node) {
        echo "Tab: " . $node->text() . " -> " . $node->attr('href') . "\n";
    });

    $output = ob_get_clean();
    file_put_contents('probe_results.txt', $output);
    echo "Probe completed. Results in probe_results.txt\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
