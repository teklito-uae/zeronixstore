<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportLog extends Model
{
    protected $fillable = ['import_job_id', 'product_url', 'status', 'message', 'data'];

    protected $casts = [
        'data' => 'json'
    ];

    public function importJob()
    {
        return $this->belongsTo(ImportJob::class);
    }
}
