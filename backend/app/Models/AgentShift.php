<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentShift extends Model
{
    protected $fillable = [
        'agent_id',
        'status',
        'started_at',
        'ended_at',
        'total_deliveries',
        'total_earnings',
    ];

    protected $casts = [
        'started_at'       => 'datetime',
        'ended_at'         => 'datetime',
        'total_deliveries' => 'integer',
        'total_earnings'   => 'decimal:2',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
