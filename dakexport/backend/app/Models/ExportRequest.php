<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class ExportRequest extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'tracking_number',
        'customer_id',
        'assigned_staff_id',
        'service_type_id',
        'status',
        'is_priority',
        'rejection_reason',
        'total_charges',
    ];

    protected $casts = [
        'is_priority'   => 'boolean',
        'total_charges' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (ExportRequest $model) {
            if (empty($model->tracking_number)) {
                $model->tracking_number = 'DAK-' . strtoupper(Str::random(10));
            }
        });
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function assignedStaff()
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    public function senderDetail()
    {
        return $this->hasOne(SenderDetail::class, 'request_id');
    }

    public function receiverDetail()
    {
        return $this->hasOne(ReceiverDetail::class, 'request_id');
    }

    public function packageDetail()
    {
        return $this->hasOne(PackageDetail::class, 'request_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'request_id');
    }

    public function trackingEvents()
    {
        return $this->hasMany(TrackingEvent::class, 'request_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'request_id');
    }

    public function shipmentLogs()
    {
        return $this->hasMany(ShipmentLog::class, 'export_request_id');
    }

    public function fraudLogs()
    {
        return $this->hasMany(FraudLog::class, 'export_request_id');
    }

    public function deliveryAssignments()
    {
        return $this->hasMany(DeliveryAssignment::class, 'shipment_id');
    }
}
