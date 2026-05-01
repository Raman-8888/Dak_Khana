<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExportRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'weight',
        'destination_country',
        'fraud_score',
        'tracking_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function shipmentLogs()
    {
        return $this->hasMany(ShipmentLog::class);
    }
}
