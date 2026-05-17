<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DeliveryAssignment extends Model
{
    protected $fillable = [
        'shipment_id',
        'agent_id',
        'status',
        'assigned_at',
        'picked_at',
        'delivered_at',
        'scheduled_for',
        'attempt_count',
        'notes',
        'pending_otp_hash',
    ];

    protected $casts = [
        'assigned_at'   => 'datetime',
        'picked_at'     => 'datetime',
        'delivered_at'  => 'datetime',
        'scheduled_for' => 'datetime',
    ];

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(ExportRequest::class, 'shipment_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(DeliveryAttempt::class, 'assignment_id');
    }

    public function proofOfDelivery(): HasOne
    {
        return $this->hasOne(ProofOfDelivery::class, 'assignment_id');
    }
}
