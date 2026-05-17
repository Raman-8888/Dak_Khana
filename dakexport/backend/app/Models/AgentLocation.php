<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentLocation extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'agent_id',
        'lat',
        'lng',
        'accuracy',
        'recorded_at',
    ];

    protected $casts = [
        'lat'         => 'decimal:7',
        'lng'         => 'decimal:7',
        'accuracy'    => 'float',
        'recorded_at' => 'datetime',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
