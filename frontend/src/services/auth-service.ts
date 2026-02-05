import { api } from '@/lib/api';

export const authService = {
    async login(email: string, password: string) {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) {
        const { data } = await api.post('/auth/register', userData);
        return data;
    },

    async getProfile() {
        const { data } = await api.get('/auth/profile');
        return data;
    },

    async refreshToken(refreshToken: string) {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        return data;
    },

    async forgotPassword(email: string) {
        const { data } = await api.post('/auth/forgot-password', { email });
        return data;
    },

    async resetPassword(token: string, password: string) {
        const { data } = await api.post('/auth/reset-password', { token, password });
        return data;
    },

    async logout() {
        const { data } = await api.post('/auth/logout');
        return data;
    },
};
