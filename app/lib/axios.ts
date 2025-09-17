import axios from 'axios';
import { API_BASE_URL } from './config';
import { idleTimerManager } from './idleTimerManager';

const api = axios.create({
    baseURL: API_BASE_URL,
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

// Response interceptor - resume idle timer when API call completes
api.interceptors.response.use(
    (response) => {
        idleTimerManager.endApiCall();
        return response;
    },
    (error) => {
        idleTimerManager.endApiCall();
        return Promise.reject(error);
    }
);

export default api; 