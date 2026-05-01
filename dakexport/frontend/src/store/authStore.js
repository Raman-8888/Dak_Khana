import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('token') || null,
    
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: !!token });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
