<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Brand extends Model
{
    protected $fillable = ['name', 'slug', 'logo'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Find or create a brand by name.
     */
    public static function findOrCreateByName(?string $name): ?self
    {
        if (!$name || trim($name) === '') return null;
        
        $name = trim($name);
        $slug = Str::slug($name);
        
        return static::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name]
        );
    }
}
