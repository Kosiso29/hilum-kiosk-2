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
    (error) => {
        idleTimerManager.endApiCall();

        // Handle authentication errors
        if (error.response?.status === 401) {
            // For httpOnly cookies, we can't clear them directly from client-side
            // Redirect to logout page which will handle cookie clearing server-side
            if (typeof window !== 'undefined') {
                window.location.href = '/logout';
            }
        }

        return Promise.reject(error);
    }
);

export default api; 