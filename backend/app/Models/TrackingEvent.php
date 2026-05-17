<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TrackingEvent extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false; // The schema only has created_at, but let's just let Laravel manage it if we want, actually schema has created_at with default NOW(), so we can set timestamps = false. Wait, no, we need to declare fillable.
    
    protected $fillable = [
        'id',
        'request_id',
        'status',
        'location',
        'notes',
        'created_by',
        'created_at',
    ];

    public function exportRequest()
    {
        return $this->belongsTo(ExportRequest::class, 'request_id');
    }
}
