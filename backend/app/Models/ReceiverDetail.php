<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceiverDetail extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'name',
        'company_name',
        'address',
        'from_address',
        'to_address',
        'city',
        'state',
        'postal_code',
        'country_code',
        'phone',
        'email',
        'distance',
    ];

    public function exportRequest()
    {
        return $this->belongsTo(ExportRequest::class, 'request_id');
    }
}
