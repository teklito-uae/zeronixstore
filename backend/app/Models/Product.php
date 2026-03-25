<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'category_id', 'brand', 'brand_id',
        'price', 'sale_price', 'cpu', 'gpu', 'ram', 'storage',
        'specs', 'images', 'featured', 'status',
        'source_url', 'is_imported', 'import_metadata',
        'badge', 'badge_color'
    ];

    protected $appends = ['images_gallery_urls', 'primary_image_url'];

    protected function casts(): array
    {
        return [
            'specs' => 'array',
            'images' => 'array',
            'import_metadata' => 'json',
            'featured' => 'boolean',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants()
    {
        return $this->hasMany(Variant::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function imagesGallery()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function getImagesGalleryUrlsAttribute()
    {
        if ($this->imagesGallery->isNotEmpty()) {
            return $this->imagesGallery->map(function($img) {
                $path = $img->path;
                if (str_starts_with($path, 'http')) return $path;
                $path = ltrim($path, '/');
                if (str_starts_with($path, 'storage/')) {
                    return url($path);
                }
                return url('storage/' . $path);
            });
        }

        // Fallback to legacy images column
        if ($this->images && is_array($this->images)) {
            return collect($this->images)->map(function($path) {
                if (str_starts_with($path, 'http')) return $path;
                $path = ltrim($path, '/');
                if (str_starts_with($path, 'storage/')) {
                    return url($path);
                }
                return url('storage/' . $path);
            })->values();
        }

        return [];
    }

    public function getPrimaryImageUrlAttribute()
    {
        $primary = $this->imagesGallery()->where('is_primary', true)->first() ?? $this->imagesGallery()->first();
        if ($primary && isset($primary->path)) {
            $path = $primary->path;
            if (str_starts_with($path, 'http')) return $path;
            $path = ltrim($path, '/');
            if (str_starts_with($path, 'storage/')) {
                return url($path);
            }
            return url('storage/' . $path);
        }
        
        // Fallback to legacy images column
        if ($this->images && is_array($this->images) && count($this->images) > 0) {
            $path = $this->images[0];
            if (str_starts_with($path, 'http')) return $path;
            $path = ltrim($path, '/');
            if (str_starts_with($path, 'storage/')) {
                return url($path);
            }
            return url('storage/' . $path);
        }

        return null;
    }
}
