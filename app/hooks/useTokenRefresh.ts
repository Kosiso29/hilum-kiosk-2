import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';

/**
 * Custom hook to refresh kiosk tokens on page load
 * This ensures that the session token is valid before making API calls
 * Only runs on pages that require authentication (not login, logout, or clinic selection pages)
 * 
 * For API call refreshes, the axios interceptor handles them automatically
 */
export const useTokenRefresh = () => {
    const router = useRouter();

    useEffect(() => {
        const refreshTokens = async () => {
            try {
                await api.get('/auth/refreshKioskToken');
                console.log('Kiosk tokens refreshed successfully on page load');
            } catch (error) {
                console.error('Failed to refresh kiosk tokens:', error);
                // If token refresh fails, redirect to logout to clear invalid session
                if (error && typeof error === 'object' && 'response' in error) {
                    const axiosError = error as { response?: { status: number } };
                    if (axiosError.response?.status === 401) {
                        router.push('/logout');
                    } else if (axiosError.response?.status === 404) {
                        console.warn('Token refresh endpoint not available - continuing without refresh');
                        // Don't redirect on 404, just log a warning and continue
                    }
                }
            }
        };

        // Only refresh tokens on pages that require authentication (not login, logout, or clinic selection pages)
        if (typeof window !== 'undefined' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/logout') &&
            !window.location.pathname.includes('/clinic-selection')) {

            // Refresh tokens on page load
            refreshTokens();
        }
    }, [router]);
};