<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->query('per_page', 30), 100));

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role'     => ['required', Rule::in(User::ROLES)],
            'phone'    => 'nullable|string|max:20',
        ]);

        if (($validated['role'] ?? '') === 'super_admin' && ! $request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only a super admin may create another super admin account.',
            ], 403);
        }

        $user = User::create([
            'name'     => trim($validated['name']),
            'email'    => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
            'phone'    => $validated['phone'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created.',
            'data'    => $user,
        ], 201);
    }

    public function show(string $id)
    {
        $user = User::query()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = User::query()->findOrFail($id);

        if ($user->isSuperAdmin() && $request->user()->id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the super admin can modify this account via this endpoint.',
            ], 403);
        }

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:100',
            'phone'     => 'nullable|string|max:20',
            'role'      => ['sometimes', Rule::in(User::ROLES)],
            'is_active' => 'sometimes|boolean',
            'password'  => 'nullable|string|min:8|confirmed',
        ]);

        if (array_key_exists('password', $validated) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated.',
            'data'    => $user->fresh(),
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $user = User::query()->findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        if ($user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Super admin account cannot be deleted.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted.',
        ]);
    }
}
