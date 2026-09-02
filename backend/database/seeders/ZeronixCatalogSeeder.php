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
                    'Gaming Laptops' => ['gaming-laptops', 'Gaming Laptops UAE — RTX 40-Series | Zeronix', 'RTX-powered gaming laptops from ASUS ROG, MSI and Lenovo Legion, delivered across the UAE.', 'gaming laptop dubai, rtx 4070 laptop uae, asus rog laptop, msi gaming laptop uae, lenovo legion dubai', 'https://images.unsplash.com/photo-1640955014216-75201056c829?w=800&q=80'],
                    'Business Laptops' => ['business-laptops', 'Business Laptops UAE | Zeronix', 'Lightweight, reliable business and productivity laptops for professionals across the UAE.', 'business laptop dubai, ultrabook uae, dell xps uae, thinkpad dubai, office laptop uae', 'https://images.unsplash.com/photo-1602016736566-7ed6a58894bd?w=800&q=80'],
                    '2-in-1 & Touch' => ['2-in-1-laptops', '2-in-1 & Touchscreen Laptops UAE | Zeronix', 'Convertible and touchscreen 2-in-1 laptops for work and play, shipped across the UAE.', '2 in 1 laptop uae, touchscreen laptop dubai, convertible laptop uae', 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&q=80'],
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
                    'Gaming PCs' => ['gaming-pcs', 'Gaming PCs UAE — Prebuilt & Custom | Zeronix', 'Prebuilt and custom gaming desktops with the latest NVIDIA GPUs, built and shipped in the UAE.', 'gaming pc dubai, gaming desktop uae, custom gaming pc dubai, rtx desktop uae', 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=800&q=80'],
                    'Prebuilt Desktops' => ['prebuilt-desktops', 'Prebuilt Desktop PCs UAE | Zeronix', 'Ready-to-ship prebuilt desktop towers for home and office use across the UAE.', 'prebuilt pc dubai, desktop computer uae, office pc dubai', 'https://images.unsplash.com/photo-1660855551740-4474188debdb?w=800&q=80'],
                    'Mini PCs' => ['mini-pcs', 'Mini PCs UAE | Zeronix', 'Compact mini PCs for home, office and media use, delivered across the UAE.', 'mini pc dubai, small form factor pc uae, compact desktop uae', 'https://images.unsplash.com/photo-1758857087633-938527980d5e?w=800&q=80'],
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
                    'Gaming Monitors' => ['gaming-monitors', 'Gaming Monitors UAE — High Refresh Rate | Zeronix', 'High refresh rate gaming monitors for competitive play, shipped across the UAE.', 'gaming monitor dubai, 144hz monitor uae, 240hz monitor dubai', 'https://images.unsplash.com/photo-1626968361222-291e74711449?w=800&q=80'],
                    '4K & Ultrawide' => ['4k-ultrawide-monitors', '4K & Ultrawide Monitors UAE | Zeronix', '4K and ultrawide monitors for gaming, editing and productivity across the UAE.', '4k monitor dubai, ultrawide monitor uae, curved monitor dubai', 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80'],
                    'Office Monitors' => ['office-monitors', 'Office Monitors UAE | Zeronix', 'Reliable office and productivity monitors, delivered across the UAE.', 'office monitor dubai, budget monitor uae, dell monitor uae', 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=800&q=80'],
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
                    'Keyboards & Mice' => ['keyboards-mice', 'Keyboards & Mice UAE | Zeronix', 'Mechanical keyboards and gaming mice from Razer, Logitech and Corsair, delivered across the UAE.', 'mechanical keyboard dubai, gaming mouse uae, wireless mouse dubai', 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800&q=80'],
                    'Headsets' => ['headsets', 'Gaming Headsets UAE | Zeronix', 'Gaming and wireless headsets for immersive sound, shipped across the UAE.', 'gaming headset dubai, wireless headset uae, razer headset dubai', 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80'],
                    'Webcams & Streaming' => ['webcams-streaming', 'Webcams & Streaming Gear UAE | Zeronix', 'Webcams, microphones and streaming gear for content creators in the UAE.', 'webcam dubai, streaming gear uae, microphone dubai', 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=800&q=80'],
                ],
            ],
            'Networking' => [
                'slug' => 'networking',
                'description' => 'Routers, mesh WiFi and network adapters',
                'image' => 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
                'meta_title' => 'Networking UAE — Routers & WiFi | Zeronix',
                'meta_description' => 'WiFi routers, mesh systems and network adapters delivered across the UAE.',
                'search_keywords' => 'wifi router dubai, mesh wifi uae, network switch dubai, wifi extender uae',
                'children' => [
                    'Routers' => ['routers', 'WiFi Routers UAE | Zeronix', 'WiFi routers and mesh systems for fast, reliable home and office networks across the UAE.', 'wifi router dubai, mesh router uae, gaming router dubai', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'],
                    'Network Adapters' => ['network-adapters', 'Network Adapters UAE | Zeronix', 'USB and PCIe WiFi and ethernet adapters, shipped across the UAE.', 'wifi adapter dubai, ethernet adapter uae, usb network adapter dubai'],
                ],
            ],
            'Printers & Scanners' => [
                'slug' => 'printers-scanners',
                'description' => 'Inkjet, laser printers and scanners',
                'image' => 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80',
                'meta_title' => 'Printers & Scanners UAE | Zeronix',
                'meta_description' => 'Inkjet and laser printers, all-in-one printers and scanners delivered across the UAE.',
                'search_keywords' => 'printer dubai, laser printer uae, scanner dubai, all in one printer uae',
                'children' => [
                    'Laser Printers' => ['laser-printers', 'Laser Printers UAE | Zeronix', 'Laser printers for home and office use, shipped across the UAE.', 'laser printer dubai, hp laser printer uae, office printer dubai'],
                    'All-in-One Printers' => ['all-in-one-printers', 'All-in-One Printers UAE | Zeronix', 'Print, scan and copy all-in-one printers delivered across the UAE.', 'all in one printer dubai, wireless printer uae'],
                ],
            ],
            'Gaming Chairs & Desks' => [
                'slug' => 'gaming-chairs-desks',
                'description' => 'Ergonomic gaming chairs and desks',
                'image' => 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=800&q=80',
                'meta_title' => 'Gaming Chairs & Desks UAE | Zeronix',
                'meta_description' => 'Ergonomic gaming chairs and height-adjustable desks delivered across the UAE.',
                'search_keywords' => 'gaming chair dubai, gaming desk uae, ergonomic chair dubai, standing desk uae',
                'children' => [
                    'Gaming Chairs' => ['gaming-chairs', 'Gaming Chairs UAE | Zeronix', 'Ergonomic gaming chairs from top brands, shipped across the UAE.', 'gaming chair dubai, racing chair uae, ergonomic gaming chair dubai'],
                    'Gaming Desks' => ['gaming-desks', 'Gaming Desks UAE | Zeronix', 'Height-adjustable and RGB gaming desks delivered across the UAE.', 'gaming desk dubai, standing desk uae, rgb desk dubai'],
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

            foreach ($def['children'] as $childName => $child) {
                [$childSlug, $metaTitle, $metaDescription, $keywords] = $child;
                $childImage = $child[4] ?? null;

                Category::updateOrCreate(
                    ['slug' => $childSlug],
                    array_filter([
                        'name' => $childName,
                        'parent_id' => $parent->id,
                        'meta_title' => $metaTitle,
                        'meta_description' => $metaDescription,
                        'search_keywords' => $keywords,
                        'image' => $childImage,
                    ], fn ($value) => $value !== null),
                );
            }
        }
    }
}
