import axios from 'axios';
import { getToken, removeToken } from '../auth/storage';

const api = axios.create();

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token && config.url?.startsWith('/api/')) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            !error.config?.url?.endsWith('/login')
        ) {
            removeToken();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
