import axios from 'axios';
import { idleTimerManager } from './idleTimerManager';

const api = axios.create({
    baseURL: '/api', // Use internal API routes instead of external API
    withCredentials: true, // This ensures httpOnly cookies are sent with requests
    // You can add headers or interceptors here if needed
});

// Request interceptor - pause idle timer when API call starts
api.interceptors.request.use(
    (config) => {
        idleTimerManager.startApiCall();
        return config;
    },
    (error) => {
        idleTimerManager.endApiCall();
        return Promise.reject(error);
    }
);

// Response interceptor - resume idle timer when API call completes and handle auth errors
api.interceptors.response.use(
    (response) => {
        idleTimerManager.endApiCall();
        return response;
    },
    async (error) => {
        idleTimerManager.endApiCall();

        // // Handle authentication errors
        // if (error.response?.status === 401) {
        //     // Don't auto-logout for token refresh endpoint - let the refresh mechanism handle it
        //     if (error.config?.url?.includes('/auth/refreshKioskToken')) {
        //         return Promise.reject(error);
        //     }

        //     // For other 401 errors, try to refresh the token first
        //     try {
        //         await api.get('/auth/refreshKioskToken');
        //         // If refresh succeeds, retry the original request
        //         return api.request(error.config);
        //     } catch (refreshError) {
        //         // If refresh fails, then redirect to logout
        //         console.error('Token refresh failed in interceptor:', refreshError);
        //         if (typeof window !== 'undefined') {
        //             window.location.href = '/logout';
        //         }
        //     }
        // }

        return Promise.reject(error);
    }
);

export default api; 