<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

/**
 * Category taxonomy for the live storefront. Slugs are shared with the
 * frontend's mock catalog (frontend/src/features/products/mock-data.ts) so
 * the same category pages/nav work whether the app is reading mock data or
 * this real seeded data. Idempotent via updateOrCreate — safe to re-run.
 *
 * meta_title/meta_description drive <title>/<meta description> on category
 * pages (not yet built) — these are what search engines actually still use
 * for SERP snippets, unlike the dead <meta keywords> tag. search_keywords
 * is a separate free-text field consumed by ProductController's `search`
 * filter, not a meta tag — it's there so a shopper's own phrasing ("gaming
 * laptop dubai") can match a category/product even when that exact phrase
 * never appears in the name.
 */
class ZeronixCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $taxonomy = [
            'Laptops' => [
                'slug' => 'laptops',
                'description' => 'Gaming, business and everyday laptops',
                'image' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
                'meta_title' => 'Laptops UAE — Gaming & Business Laptops | Zeronix',
                'meta_description' => 'Shop gaming, business and 2-in-1 laptops in Dubai, Abu Dhabi & across the UAE. Authentic brands, 1-year warranty, fast delivery.',
                'search_keywords' => 'laptop dubai, laptop uae, gaming laptop dubai, business laptop uae, buy laptop online uae, cheap laptop dubai',
                'children' => [
                    'Gaming Laptops' => ['gaming-laptops', 'Gaming Laptops UAE — RTX 40-Series | Zeronix', 'RTX-powered gaming laptops from ASUS ROG, MSI and Lenovo Legion, delivered across the UAE.', 'gaming laptop dubai, rtx 4070 laptop uae, asus rog laptop, msi gaming laptop uae, lenovo legion dubai'],
                    'Business Laptops' => ['business-laptops', 'Business Laptops UAE | Zeronix', 'Lightweight, reliable business and productivity laptops for professionals across the UAE.', 'business laptop dubai, ultrabook uae, dell xps uae, thinkpad dubai, office laptop uae'],
                    '2-in-1 & Touch' => ['2-in-1-laptops', '2-in-1 & Touchscreen Laptops UAE | Zeronix', 'Convertible and touchscreen 2-in-1 laptops for work and play, shipped across the UAE.', '2 in 1 laptop uae, touchscreen laptop dubai, convertible laptop uae'],
                ],
            ],
            'Desktops' => [
                'slug' => 'desktops',
                'description' => 'Prebuilt and custom gaming desktops',
                'image' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
                'meta_title' => 'Desktop PCs UAE — Gaming & Prebuilt Desktops | Zeronix',
                'meta_description' => 'Prebuilt gaming desktops, mini PCs and custom builds delivered across Dubai and the UAE.',
                'search_keywords' => 'desktop pc dubai, gaming pc uae, custom pc build dubai, prebuilt desktop uae, mini pc dubai',
                'children' => [
                    'Gaming PCs' => ['gaming-pcs', 'Gaming PCs UAE — Prebuilt & Custom | Zeronix', 'Prebuilt and custom gaming desktops with the latest NVIDIA GPUs, built and shipped in the UAE.', 'gaming pc dubai, gaming desktop uae, custom gaming pc dubai, rtx desktop uae'],
                    'Prebuilt Desktops' => ['prebuilt-desktops', 'Prebuilt Desktop PCs UAE | Zeronix', 'Ready-to-ship prebuilt desktop towers for home and office use across the UAE.', 'prebuilt pc dubai, desktop computer uae, office pc dubai'],
                    'Mini PCs' => ['mini-pcs', 'Mini PCs UAE | Zeronix', 'Compact mini PCs for home, office and media use, delivered across the UAE.', 'mini pc dubai, small form factor pc uae, compact desktop uae'],
                ],
            ],
            'Components' => [
                'slug' => 'components',
                'description' => 'Graphics cards, processors and storage',
                'image' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
                'meta_title' => 'PC Components UAE — GPUs, CPUs & Storage | Zeronix',
                'meta_description' => 'Graphics cards, processors, motherboards, RAM and storage for your next PC build in the UAE.',
                'search_keywords' => 'pc components dubai, graphics card uae, processor uae, pc parts dubai, pc build uae',
                'children' => [
                    'Graphics Cards' => ['graphics-cards', 'Graphics Cards UAE — NVIDIA & AMD GPUs | Zeronix', 'NVIDIA RTX and AMD Radeon graphics cards in stock, shipped across the UAE.', 'rtx 4070 graphics card uae, graphics card dubai, nvidia gpu uae, amd radeon dubai'],
                    'Processors' => ['processors', 'Processors (CPUs) UAE — Intel & AMD | Zeronix', 'Intel Core and AMD Ryzen desktop processors, delivered across the UAE.', 'intel core i9 processor dubai, amd ryzen processor uae, cpu dubai, buy processor uae'],
                    'Storage' => ['storage', 'SSDs & Storage UAE — NVMe SSDs & HDDs | Zeronix', 'NVMe SSDs, SATA SSDs and hard drives for faster, bigger storage across the UAE.', 'nvme ssd uae, ssd dubai, external hard drive uae, m.2 ssd dubai'],
                    'Motherboards' => ['motherboards', 'Motherboards UAE | Zeronix', 'Motherboards for Intel and AMD builds, shipped across the UAE.', 'motherboard dubai, intel motherboard uae, amd motherboard dubai'],
                    'Memory (RAM)' => ['memory-ram', 'RAM & Memory Kits UAE | Zeronix', 'DDR4 and DDR5 memory kits from Corsair and more, delivered across the UAE.', 'ram dubai, ddr5 ram uae, corsair ram dubai, memory kit uae'],
                ],
            ],
            'Monitors' => [
                'slug' => 'monitors',
                'description' => 'Gaming and productivity displays',
                'image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
                'meta_title' => 'Monitors UAE — Gaming, 4K & Office Displays | Zeronix',
                'meta_description' => 'Gaming, 4K/ultrawide and office monitors from ASUS, Dell and more, delivered across the UAE.',
                'search_keywords' => '4k monitor uae, gaming monitor dubai, ultrawide monitor uae, dell monitor dubai, office monitor uae',
                'children' => [
                    'Gaming Monitors' => ['gaming-monitors', 'Gaming Monitors UAE — High Refresh Rate | Zeronix', 'High refresh rate gaming monitors for competitive play, shipped across the UAE.', 'gaming monitor dubai, 144hz monitor uae, 240hz monitor dubai'],
                    '4K & Ultrawide' => ['4k-ultrawide-monitors', '4K & Ultrawide Monitors UAE | Zeronix', '4K and ultrawide monitors for gaming, editing and productivity across the UAE.', '4k monitor dubai, ultrawide monitor uae, curved monitor dubai'],
                    'Office Monitors' => ['office-monitors', 'Office Monitors UAE | Zeronix', 'Reliable office and productivity monitors, delivered across the UAE.', 'office monitor dubai, budget monitor uae, dell monitor uae'],
                ],
            ],
            'Accessories' => [
                'slug' => 'accessories',
                'description' => 'Keyboards, mice, headsets and more',
                'image' => 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
                'meta_title' => 'PC Accessories UAE — Keyboards, Mice & Headsets | Zeronix',
                'meta_description' => 'Gaming keyboards, mice, headsets and webcams from Razer, Logitech and more, shipped across the UAE.',
                'search_keywords' => 'mechanical keyboard uae, gaming mouse dubai, gaming headset uae, razer dubai, logitech uae',
                'children' => [
                    'Keyboards & Mice' => ['keyboards-mice', 'Keyboards & Mice UAE | Zeronix', 'Mechanical keyboards and gaming mice from Razer, Logitech and Corsair, delivered across the UAE.', 'mechanical keyboard dubai, gaming mouse uae, wireless mouse dubai'],
                    'Headsets' => ['headsets', 'Gaming Headsets UAE | Zeronix', 'Gaming and wireless headsets for immersive sound, shipped across the UAE.', 'gaming headset dubai, wireless headset uae, razer headset dubai'],
                    'Webcams & Streaming' => ['webcams-streaming', 'Webcams & Streaming Gear UAE | Zeronix', 'Webcams, microphones and streaming gear for content creators in the UAE.', 'webcam dubai, streaming gear uae, microphone dubai'],
                ],
            ],
        ];

        foreach ($taxonomy as $name => $def) {
            $parent = Category::updateOrCreate(
                ['slug' => $def['slug']],
                [
                    'name' => $name,
                    'description' => $def['description'],
                    'image' => $def['image'],
                    'parent_id' => null,
                    'meta_title' => $def['meta_title'],
                    'meta_description' => $def['meta_description'],
                    'search_keywords' => $def['search_keywords'],
                ],
            );

            foreach ($def['children'] as $childName => [$childSlug, $metaTitle, $metaDescription, $keywords]) {
                Category::updateOrCreate(
                    ['slug' => $childSlug],
                    [
                        'name' => $childName,
                        'parent_id' => $parent->id,
                        'meta_title' => $metaTitle,
                        'meta_description' => $metaDescription,
                        'search_keywords' => $keywords,
                    ],
                );
            }
        }
    }
}
