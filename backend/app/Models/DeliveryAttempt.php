<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryAttempt extends Model
{
    protected $fillable = [
        'assignment_id',
        'attempt_number',
        'status',
        'failure_reason',
        'failure_notes',
        'attempted_at',
        'reattempt_at',
    ];

    protected $casts = [
        'attempted_at' => 'datetime',
        'reattempt_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(DeliveryAssignment::class, 'assignment_id');
    }
}
