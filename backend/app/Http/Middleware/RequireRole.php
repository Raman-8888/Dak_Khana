<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequireRole middleware
 *
 * Guards routes to specific user roles.
 *
 * Usage in routes/api.php:
 *   ->middleware('role:admin,super_admin')
 *   ->middleware('role:delivery_agent')
 */
class RequireRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  One or more allowed role slugs
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Insufficient permissions for this resource.',
                'your_role' => $user->role,
                'required_roles' => $roles,
            ], 403);
        }

        return $next($request);
    }
}
