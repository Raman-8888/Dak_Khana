<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'export_request_id',
        'score',
        'rules_triggered',
        'is_flagged',
        'reviewer_notes',
    ];

    protected $casts = [
        'rules_triggered' => 'array',
        'is_flagged'      => 'boolean',
    ];

    public function exportRequest()
    {
        return $this->belongsTo(ExportRequest::class, 'export_request_id');
    }
}
