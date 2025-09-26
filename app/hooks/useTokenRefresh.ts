import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';

/**
 * Custom hook to refresh kiosk tokens proactively
 * Refreshes tokens every 10 minutes to prevent expiration (tokens expire in 15 minutes)
 * Only runs on pages that require authentication (not login, logout, or clinic selection pages)
 * 
 * For API call refreshes, the axios interceptor handles them automatically
 */
export const useTokenRefresh = () => {
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const refreshTokens = async () => {
            try {
                await api.get('/auth/refreshKioskToken');
            } catch (error) {
                console.error('❌ Failed to refresh kiosk tokens:', error);
                // If token refresh fails, redirect to logout to clear invalid session
                // if (error && typeof error === 'object' && 'response' in error) {
                //     const axiosError = error as { response?: { status: number } };
                //     if (axiosError.response?.status === 401) {
                //         console.log('🔄 Session expired, redirecting to logout');
                //         router.push('/logout');
                //     } else if (axiosError.response?.status === 404) {
                //         console.warn('⚠️ Token refresh endpoint not available - continuing without refresh');
                //         // Don't redirect on 404, just log a warning and continue
                //     }
                // }
            }
        };

        const startProactiveRefresh = () => {
            // Clear any existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Refresh tokens immediately on page load
            refreshTokens();

            // Set up interval to refresh every 10 minutes (600,000 ms)
            intervalRef.current = setInterval(refreshTokens, 10 * 60 * 1000);
            console.log('🔄 Started proactive token refresh (every 10 minutes)');
        };

        const stopProactiveRefresh = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                console.log('⏹️ Stopped proactive token refresh');
            }
        };

        // Only refresh tokens on pages that require authentication (not login, logout, or clinic selection pages)
        if (typeof window !== 'undefined' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/logout') &&
            !window.location.pathname.includes('/clinic-selection')) {

            startProactiveRefresh();
        } else {
            stopProactiveRefresh();
        }

        // Cleanup on unmount
        return () => {
            stopProactiveRefresh();
        };
    }, [router]);
};