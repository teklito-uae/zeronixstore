<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    // Deleting a product must never destroy historical order line items.
    // With SoftDeletes, Product::delete() (called from
    // ProductController::destroy) sets deleted_at instead of issuing a real
    // DELETE, so the cascadeOnDelete on order_items.product_id never fires.
    protected $fillable = [
        'name', 'slug', 'description', 'category_id', 'brand', 'brand_id',
        'price', 'sale_price', 'cpu', 'gpu', 'ram', 'storage',
        'specs', 'images', 'featured', 'status', 'stock',
        'badge', 'badge_color',
        'meta_title', 'meta_description', 'search_keywords',
    ];

    protected $appends = ['images_gallery_urls', 'primary_image_url'];

    protected function casts(): array
    {
        return [
            'specs' => 'array',
            'images' => 'array',
            'featured' => 'boolean',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'stock' => 'integer',
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
                if (str_starts_with($path, 'http')) {
                    return $path;
                }
                $path = ltrim($path, '/');
                if (str_starts_with($path, 'storage/')) {
                    return url($path);
                }
                return url('storage/' . $path);
            })->filter()->values();
        }

        // Fallback to legacy images column
        if ($this->images && is_array($this->images)) {
            return collect($this->images)->map(function($path) {
                if (str_starts_with($path, 'http')) {
                    return $path;
                }
                $path = ltrim($path, '/');
                if (str_starts_with($path, 'storage/')) {
                    return url($path);
                }
                return url('storage/' . $path);
            })->filter()->values();
        }

        return [];
    }

    public function getPrimaryImageUrlAttribute()
    {
        $primary = $this->imagesGallery()->where('is_primary', true)->first() ?? $this->imagesGallery()->first();
        if ($primary && isset($primary->path)) {
            $path = $primary->path;
            if (str_starts_with($path, 'http')) {
                return $path;
            }
            $path = ltrim($path, '/');
            if (str_starts_with($path, 'storage/')) {
                return url($path);
            }
            return url('storage/' . $path);
        }

        // Fallback to legacy images column
        if ($this->images && is_array($this->images) && count($this->images) > 0) {
            $path = $this->images[0];
            if (str_starts_with($path, 'http')) {
                return $path;
            }
            $path = ltrim($path, '/');
            if (str_starts_with($path, 'storage/')) {
                return url($path);
            }
            return url('storage/' . $path);
        }

        return null;
    }
}
