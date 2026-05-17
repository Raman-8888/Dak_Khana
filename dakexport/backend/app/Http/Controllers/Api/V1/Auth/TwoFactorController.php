<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function enable(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Two-factor authentication is not enabled in this deployment yet.',
        ], 501);
    }

    public function verify(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Two-factor authentication is not enabled in this deployment yet.',
        ], 501);
    }
}
