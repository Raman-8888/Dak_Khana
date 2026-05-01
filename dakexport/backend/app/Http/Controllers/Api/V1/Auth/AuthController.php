<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        return response()->json(['message' => 'Login successful']);
    }

    public function register(Request $request)
    {
        return response()->json(['message' => 'Registration successful']);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'Logout successful']);
    }
}
