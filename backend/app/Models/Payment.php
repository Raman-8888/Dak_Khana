<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'request_id',
        'status',
        'amount',
        'currency',
        'provider',
        'reference',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function exportRequest(): BelongsTo
    {
        return $this->belongsTo(ExportRequest::class, 'request_id');
    }
}
