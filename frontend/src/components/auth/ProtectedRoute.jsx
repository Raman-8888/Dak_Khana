import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * ProtectedRoute
 *
 * Wraps any route requiring authentication and/or specific roles.
 *
 * Usage:
 *   <ProtectedRoute>                          → any authenticated user
 *   <ProtectedRoute roles={['admin']}>        → admin only
 *   <ProtectedRoute roles={['customer','delivery_agent']}> → multiple
 *
 * Behaviour:
 *   • Not logged in          → redirect to /login (saves intended URL)
 *   • Wrong role             → redirect to /unauthorized
 *   • Loading auth           → show spinner
 */
export default function ProtectedRoute({ children, roles = [] }) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const location = useLocation();

    // While auth is hydrating from persisted token, show a minimal loader
    if (isLoading) {
        return (
            <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                height:         '100vh',
                background:     '#0f172a',
            }}>
                <div className="route-spinner" />
            </div>
        );
    }

    // Not authenticated → send to login, remember where they were going
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin & super_admin: full access to every role-gated route (demo / operations preview)
    const isFullAccess = user?.role === 'admin' || user?.role === 'super_admin';

    if (roles.length > 0 && !isFullAccess && !roles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
