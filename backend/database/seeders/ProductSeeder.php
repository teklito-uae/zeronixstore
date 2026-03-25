<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $processors = Category::where('slug', 'processors')->first();
        $gpus = Category::where('slug', 'graphics-cards')->first();
        $memory = Category::where('slug', 'memory-ram')->first();
        $storage = Category::where('slug', 'storage')->first();
        $laptops = Category::where('slug', 'laptops')->first() ?? Category::firstOrCreate(['name' => 'Laptops', 'slug' => 'laptops']);
        $accessories = Category::where('slug', 'accessories')->first() ?? Category::firstOrCreate(['name' => 'Accessories', 'slug' => 'accessories']);

        // High Quality Hardware Images (Unsplash Tech Curated)
        $intelImg = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1000&q=80'; // CPU Close up
        $amdImg = 'https://images.unsplash.com/photo-1558717738-0b9fbb9b0b21?w=1000&q=80'; // Processor
        $nvidiaImg = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&q=80'; // GPU
        $radeonImg = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1000&q=80'; // PC Component
        $ramImg = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=1000&q=80'; // RAM
        $ssdImg1 = 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1000&q=80'; // Storage 1
        $ssdImg2 = 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1000&q=80'; // Storage 2
        $laptopImg1 = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1000&q=80'; // Laptop Front
        $laptopImg2 = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1000&q=80'; // Laptop Side
        $keybImg = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1000&q=80'; // Keyboard

        // Processors
        Product::create([
            'category_id' => $processors->id,
            'name' => 'Intel Core i9-14900K',
            'slug' => 'intel-core-i9-14900k',
            'description' => '24-Core (8P+16E) Desktop Processor. Unlock your gaming potential with the latest Intel flagship processor.',
            'brand' => 'Intel',
            'price' => 599.99,
            'sale_price' => 549.99,
            'cpu' => 'LGA 1700',
            'featured' => true,
            'specs' => ['Cores' => '24', 'Threads' => '32', 'Base Clock' => '3.2 GHz', 'Boost Clock' => '6.0 GHz'],
            'images' => [$intelImg],
        ]);

        Product::create([
            'category_id' => $processors->id,
            'name' => 'AMD Ryzen 9 7950X3D',
            'slug' => 'amd-ryzen-9-7950x3d',
            'description' => '16-Core, 32-Thread Desktop Processor. The ultimate processor for gaming and creators.',
            'brand' => 'AMD',
            'price' => 699.99,
            'cpu' => 'AM5',
            'featured' => true,
            'specs' => ['Cores' => '16', 'Threads' => '32', 'Base Clock' => '4.2 GHz', 'Boost Clock' => '5.7 GHz'],
            'images' => [$amdImg],
        ]);

        // GPUs
        Product::create([
            'category_id' => $gpus->id,
            'name' => 'NVIDIA GeForce RTX 4090',
            'slug' => 'nvidia-geforce-rtx-4090',
            'description' => 'The ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics.',
            'brand' => 'NVIDIA',
            'price' => 1599.99,
            'gpu' => '24GB GDDR6X',
            'featured' => true,
            'specs' => ['VRAM' => '24GB', 'Cores' => '16384', 'Boost Clock' => '2.52 GHz'],
            'images' => [$nvidiaImg],
        ]);

        Product::create([
            'category_id' => $gpus->id,
            'name' => 'AMD Radeon RX 7900 XTX',
            'slug' => 'amd-radeon-rx-7900-xtx',
            'description' => 'Experience unprecedented performance, visuals, and efficiency at 4K and beyond.',
            'brand' => 'AMD',
            'price' => 999.99,
            'sale_price' => 899.99,
            'gpu' => '24GB GDDR6',
            'featured' => false,
            'specs' => ['VRAM' => '24GB', 'Compute Units' => '96', 'Boost Clock' => '2500 MHz'],
            'images' => [$radeonImg],
        ]);

        // RAM
        Product::create([
            'category_id' => $memory->id,
            'name' => 'Corsair Dominator Titanium 64GB',
            'slug' => 'corsair-dominator-titanium-64gb',
            'description' => '64GB (2x32GB) DDR5 6000MHz C30 Memory Kit Kit.',
            'brand' => 'Corsair',
            'price' => 249.99,
            'ram' => '64GB DDR5',
            'featured' => false,
            'specs' => ['Capacity' => '64GB', 'Type' => 'DDR5', 'Speed' => '6000MHz', 'CAS Latency' => '30'],
            'images' => [$ramImg],
        ]);

        // Storage (Multi-Image)
        Product::create([
            'category_id' => $storage->id,
            'name' => 'Samsung 990 PRO 2TB',
            'slug' => 'samsung-990-pro-2tb',
            'description' => 'PCIe Gen4 NVMe M.2 Internal Solid State Drive.',
            'brand' => 'Samsung',
            'price' => 189.99,
            'sale_price' => 169.99,
            'storage' => '2TB NVMe SSD',
            'featured' => true,
            'specs' => ['Capacity' => '2TB', 'Type' => 'NVMe M.2', 'Read Speed' => '7450 MB/s', 'Write Speed' => '6900 MB/s'],
            'images' => [$ssdImg1, $ssdImg2],
        ]);

        // Laptops (Multi-Image)
        Product::create([
            'category_id' => $laptops->id,
            'name' => 'ASUS ROG Zephyrus G14',
            'slug' => 'asus-rog-zephyrus-g14',
            'description' => '14" 165Hz Gaming Laptop, QHD, AMD Ryzen 9 7940HS, NVIDIA RTX 4070, 16GB DDR5, 1TB PCIe 4.0 SSD.',
            'brand' => 'ASUS',
            'price' => 1849.99,
            'sale_price' => 1749.99,
            'featured' => true,
            'specs' => ['Display' => '14" QHD 165Hz', 'CPU' => 'Ryzen 9 7940HS', 'GPU' => 'RTX 4070', 'RAM' => '16GB DDR5', 'Storage' => '1TB SSD'],
            'images' => [$laptopImg1, $laptopImg2],
        ]);

        // Accessories
        Product::create([
            'category_id' => $accessories->id,
            'name' => 'Logitech G PRO X TKL',
            'slug' => 'logitech-g-pro-x-tkl',
            'description' => 'Wireless Mechanical Gaming Keyboard with Tactile Switches (Brown) and LIGHTSYNC RGB.',
            'brand' => 'Logitech',
            'price' => 199.99,
            'featured' => false,
            'specs' => ['Switch Type' => 'Tactile Brown', 'Connectivity' => 'LIGHTSPEED Wireless, Bluetooth, USB', 'Battery' => 'Up to 50 hours'],
            'images' => [$keybImg],
        ]);
        
        // Add random variants for them to have stock
        foreach (Product::all() as $prod) {
            $prod->variants()->create([
                'sku' => strtoupper(Str::random(8)),
                'name' => 'Standard Edition',
                'price' => $prod->sale_price ?? $prod->price,
                'stock' => rand(10, 50),
            ]);
        }
    }
}
