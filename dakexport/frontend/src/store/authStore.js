import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_ADMIN_WORKSPACE } from '../constants/adminWorkspaces';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ROLE_ROUTES = {
    customer:              '/customer/dashboard',
    delivery_agent:        '/agent/dashboard',
    operations_executive:  '/ops/dashboard',
    warehouse_manager:     '/warehouse/dashboard',
    finance:               '/finance/dashboard',
    compliance_officer:    '/customer/dashboard',
    support_agent:         '/support/dashboard',
    regional_manager:      '/regional/dashboard',
    admin:                 '/admin/dashboard',
    super_admin:           '/admin/dashboard',
};

async function authJson(path, method, body = null, token = null) {
    const headers = {
        Accept:       'application/json',
        'Content-Type': 'application/json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/api/v1/${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
}

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user:            null,
            session:         null,
            token:           null,
            isAuthenticated: false,
            isLoading:       true,

            init: async () => {
                const token = get().token;
                if (!token) {
                    set({ isLoading: false });
                    return;
                }

                const { res, data } = await authJson('auth/me', 'GET', null, token);
                if (!res.ok || !data.success) {
                    set({ user: null, token: null, session: null, isAuthenticated: false, isLoading: false });
                    return;
                }

                set({
                    user:            data.data.user,
                    session:         { type: 'sanctum' },
                    token,
                    isAuthenticated: true,
                    isLoading:       false,
                });
            },

            login: async (email, password) => {
                const { res, data } = await authJson('auth/login', 'POST', { email, password });
                if (!res.ok || !data.success) {
                    throw new Error(data.message || 'Login failed');
                }
                const { user, token } = data.data;
                set({
                    user,
                    token,
                    session:         { type: 'sanctum' },
                    isAuthenticated: true,
                    isLoading:       false,
                });
            },

            register: async ({ name, email, password, password_confirmation, role, phone }) => {
                const { res, data } = await authJson('auth/register', 'POST', {
                    name,
                    email,
                    password,
                    password_confirmation,
                    role,
                    phone,
                });
                if (!res.ok || !data.success) {
                    const msg = data.message || (data.errors && JSON.stringify(data.errors)) || 'Registration failed';
                    throw new Error(typeof msg === 'string' ? msg : 'Registration failed');
                }
                const { user, token } = data.data;
                set({
                    user,
                    token,
                    session:         { type: 'sanctum' },
                    isAuthenticated: true,
                    isLoading:       false,
                });
            },

            logout: async () => {
                const token = get().token;
                if (token) {
                    await authJson('auth/logout', 'POST', null, token);
                }
                set({
                    user: null,
                    session: null,
                    token: null,
                    isAuthenticated: false,
                    adminWorkspace: DEFAULT_ADMIN_WORKSPACE,
                });
            },

            setAdminWorkspace: (workspaceId) => {
                set({ adminWorkspace: workspaceId || DEFAULT_ADMIN_WORKSPACE });
            },

            isFullAccessAdmin: () => {
                const r = get().user?.role;
                return r === 'admin' || r === 'super_admin';
            },

            getDashboardPath: () => {
                const role = get().user?.role;
                return ROLE_ROUTES[role] ?? '/';
            },

            hasRole: (...roles) => roles.includes(get().user?.role),
        }),
        {
            name:       'dak-auth',
            partialize: (state) => ({
                user:             state.user,
                token:            state.token,
                isAuthenticated:  state.isAuthenticated,
                adminWorkspace:   state.adminWorkspace,
            }),
        }
    )
);

export { ROLE_ROUTES };
