<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'image', 'parent_id'];

    protected $appends = ['image_url', 'total_products_count'];
    
    // ... existing ...

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            $path = $this->image;
            if (str_starts_with($path, 'http')) return $path;
            $path = ltrim($path, '/');
            if (str_starts_with($path, 'storage/')) {
                return url($path);
            }
            return url('storage/' . $path);
        }
        return null;
    }

    public function getTotalProductsCountAttribute()
    {
        return $this->getTotalProductsCountRecursive($this);
    }

    private function getTotalProductsCountRecursive($category)
    {
        $count = $category->products()->count();
        foreach ($category->children as $child) {
            $count += $this->getTotalProductsCountRecursive($child);
        }
        return $count;
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
