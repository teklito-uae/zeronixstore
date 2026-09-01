<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'cover_image', 'author_name',
        'status', 'published_at', 'meta_title', 'meta_description',
    ];

    protected $appends = ['cover_image_url'];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function getCoverImageUrlAttribute()
    {
        if ($this->cover_image) {
            $path = $this->cover_image;
            if (str_starts_with($path, 'http')) return $path;
            $path = ltrim($path, '/');
            if (str_starts_with($path, 'storage/')) {
                return url($path);
            }
            return url('storage/' . $path);
        }
        return null;
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
