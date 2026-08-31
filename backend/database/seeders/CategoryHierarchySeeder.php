<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategoryHierarchySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'Computers & Laptops' => [
                'Laptops' => [
                    'Everyday Laptops',
                    'Workstations',
                    '2-in-1 Laptops',
                    'MacBooks',
                ],
                'Desktops' => [
                    'Home & Office PCs',
                    'All-in-One PCs',
                    'Mini PCs',
                    'Apple Mac',
                ],
                'Components' => [
                    'Processors',
                    'Motherboards',
                    'Graphics Cards',
                    'Memory (RAM)',
                    'Storage (SSD & HDD)',
                    'Power Supplies',
                    'Computer Cases',
                    'Cooling',
                ],
                'Networking' => [
                    'Routers',
                    'Switches',
                    'Network Cards',
                ],
            ],
            'Gaming Zone' => [
                'Gaming PCs & Laptops' => [
                    'Gaming Desktops',
                    'Gaming Laptops',
                    'Custom Builds',
                ],
                'Gaming Peripherals' => [
                    'Gaming Keyboards',
                    'Gaming Mice',
                    'Gaming Headsets',
                    'Controllers & Joysticks',
                    'Racing Wheels',
                ],
                'Streaming Gear' => [
                    'Webcams',
                    'Microphones',
                    'Capture Cards',
                    'Green Screens',
                ],
                'Gaming Furniture' => [
                    'Gaming Chairs',
                    'Gaming Desks',
                ],
            ],
            'Accessories & Peripherals' => [
                'Monitors & Displays' => [
                    'Office Monitors',
                    'Gaming Monitors',
                    'Curved Monitors',
                    'Portable Monitors',
                ],
                'Office Peripherals' => [
                    'Standard Keyboards',
                    'Standard Mice',
                    'Printers & Scanners',
                ],
                'Storage & Drives' => [
                    'External Hard Drives',
                    'USB Flash Drives',
                    'NAS Storage',
                ],
                'Cables & Adapters' => [
                    'HDMI & DisplayPort',
                    'USB Cables',
                    'Power Cables',
                    'Hubs & Docks',
                ],
            ]
        ];

        foreach ($data as $mainName => $subs) {
            $main = Category::updateOrCreate(
                ['slug' => Str::slug($mainName)],
                ['name' => $mainName, 'parent_id' => null]
            );

            foreach ($subs as $subName => $subSubs) {
                // Use clean slug
                $subSlug = Str::slug($subName);
                
                $sub = Category::updateOrCreate(
                    ['slug' => $subSlug],
                    [
                        'name' => $subName,
                        'parent_id' => $main->id
                    ]
                );

                foreach ($subSubs as $subSubName) {
                     // Use clean slug
                     $subSubSlug = Str::slug($subSubName);
                     Category::updateOrCreate(
                        ['slug' => $subSubSlug],
                        [
                            'name' => $subSubName,
                            'parent_id' => $sub->id
                        ]
                    );
                }
            }
        }
    }
}
