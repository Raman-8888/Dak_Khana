<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function enable(Request $request) { /* ... */ }
    public function verify(Request $request) { /* ... */ }
}
