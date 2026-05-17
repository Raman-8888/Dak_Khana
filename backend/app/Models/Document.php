<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'type',
        'file_path',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function exportRequest()
    {
        return $this->belongsTo(ExportRequest::class, 'request_id');
    }
}
