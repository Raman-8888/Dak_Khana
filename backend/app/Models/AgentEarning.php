<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentEarning extends Model
{
    protected $fillable = [
        'agent_id',
        'assignment_id',
        'base_pay',
        'incentive',
        'deduction',
        'total',
        'period_date',
        'status',
    ];

    protected $casts = [
        'period_date' => 'date',
        'base_pay'    => 'decimal:2',
        'incentive'   => 'decimal:2',
        'deduction'   => 'decimal:2',
        'total'       => 'decimal:2',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(DeliveryAssignment::class, 'assignment_id');
    }
}
