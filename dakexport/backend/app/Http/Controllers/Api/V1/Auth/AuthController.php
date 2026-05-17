<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * Accepts: name, email, password, password_confirmation, role
     * Role is limited to customer and delivery_agent for self-registration.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'                  => 'required|string|max:100',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'role'                  => ['nullable', Rule::in(['customer', 'delivery_agent'])],
            'phone'                 => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'     => trim($request->name),
            'email'    => strtolower(trim($request->email)),
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'customer',
            'phone'    => $request->phone,
        ]);

        $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully.',
            'data'    => [
                'user'  => $this->userResponse($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login an existing user.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', strtolower(trim($request->email)))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials. Please check your email and password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Contact support.',
            ], 403);
        }

        // Revoke old tokens and issue a fresh one
        $user->tokens()->delete();
        $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data'    => [
                'user'  => $this->userResponse($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Return the authenticated user's profile.
     * Used by the frontend to hydrate the auth store on page load.
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'user' => $this->userResponse($request->user()),
            ],
        ]);
    }

    /**
     * Revoke the current token (logout).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Consistent user shape returned to all clients.
     * Includes role so the frontend can redirect correctly.
     */
    private function userResponse(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role,
            'phone'       => $user->phone,
            'avatar'      => $user->avatar,
            'is_active'   => $user->is_active,
            'employee_id' => $user->employee_id,
            'created_at'  => $user->created_at?->toISOString(),
        ];
    }
}
