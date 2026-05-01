import { create } from 'zustand';
import api from '../api/axios';

export const useExportStore = create((set) => ({
    exports: [],
    loading: false,
    
    fetchExports: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/exports');
            set({ exports: response.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },
}));
