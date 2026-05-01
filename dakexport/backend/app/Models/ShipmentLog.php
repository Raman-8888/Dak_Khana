<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShipmentLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'export_request_id',
        'status',
        'location',
        'message',
    ];

    public function exportRequest()
    {
        return $this->belongsTo(ExportRequest::class);
    }
}
