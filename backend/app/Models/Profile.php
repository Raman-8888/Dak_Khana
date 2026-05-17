<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    // UUIDs as primary key
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'role',
        'first_name',
        'last_name',
        'phone',
        'gstin',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'is_active',
    ];
}
