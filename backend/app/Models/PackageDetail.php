<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageDetail extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'weight_grams',
        'length_cm',
        'width_cm',
        'height_cm',
        'content_description',
        'hs_code',
        'declared_value',
        'currency',
        'product_type',
        'image_url',
        'document_url',
    ];

    public function exportRequest()
    {
        return $this->belongsTo(ExportRequest::class, 'request_id');
    }
}
