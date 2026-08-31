<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Processors',
                'slug' => 'processors',
                'description' => 'High performance CPUs from Intel and AMD.',
                'image' => 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
            ],
            [
                'name' => 'Graphics Cards',
                'slug' => 'graphics-cards',
                'description' => 'Powerful GPUs for gaming and rendering.',
                'image' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
            ],
            [
                'name' => 'Memory (RAM)',
                'slug' => 'memory-ram',
                'description' => 'Fast DDR4 and DDR5 memory kits.',
                'image' => 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80',
            ],
            [
                'name' => 'Motherboards',
                'slug' => 'motherboards',
                'description' => 'The foundation of your PC build.',
                'image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
            ],
            [
                'name' => 'Storage',
                'slug' => 'storage',
                'description' => 'Lightning fast NVMe SSDs and HDDs.',
                'image' => 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
