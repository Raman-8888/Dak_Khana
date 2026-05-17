<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProofOfDelivery extends Model
{
    protected $fillable = [
        'assignment_id',
        'otp_verified',
        'otp_hash',
        'recipient_name',
        'signature_url',
        'photo_url',
        'delivery_notes',
        'delivered_at',
    ];

    protected $casts = [
        'otp_verified' => 'boolean',
        'delivered_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(DeliveryAssignment::class, 'assignment_id');
    }
}
