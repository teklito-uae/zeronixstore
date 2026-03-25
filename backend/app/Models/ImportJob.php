<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportJob extends Model
{
    protected $guarded = [];

    public function localCategory()
    {
        return $this->belongsTo(Category::class, 'local_category_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function logs()
    {
        return $this->hasMany(ImportLog::class);
    }
}
