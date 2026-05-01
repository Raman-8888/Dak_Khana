<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'export_request_id',
        'type',
        'file_path',
        'metadata',
    ];

    public function exportRequest()
    {
        return $this->belongsTo(ExportRequest::class);
    }
}
