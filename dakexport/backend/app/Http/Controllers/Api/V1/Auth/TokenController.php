<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TokenController extends Controller
{
    public function refresh(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Token refresh is not implemented. Sign in again to receive a new token.',
        ], 501);
    }
}
