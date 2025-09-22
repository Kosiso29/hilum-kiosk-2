'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearSession } from '../store/authSlice';
import { useClinicData } from '../hooks/useClinicData';
import { idleTimerManager } from '../lib/idleTimerManager';
import api from '../lib/axios';

export default function LogoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { clearClinicData } = useClinicData();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Clear session from Redux store
                dispatch(clearSession());

                // Clear clinic data from IndexedDB
                try {
                    await clearClinicData();
                } catch (error) {
                    console.error('Failed to clear clinic data:', error);
                }

                // Clear session token cookie using axios
                try {
                    // Pause idle timer during logout API call
                    idleTimerManager.startApiCall();
                    await api.post('/auth/logout');
                    idleTimerManager.endApiCall();
                } catch (error) {
                    console.error('Logout API error:', error);
                    // Ensure timer is resumed even if API call fails
                    idleTimerManager.endApiCall();
                    // Fallback: try to clear cookie manually
                    document.cookie = 'session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; httpOnly=false; secure=false; sameSite=strict';
                }

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push('/login');
                }, 1000);

            } catch (error) {
                console.error('Logout error:', error);
                // Even if there's an error, redirect to login
                router.push('/login');
            }
        };

        performLogout();
    }, [dispatch, clearClinicData, router]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Logging out...</h1>
                <p className="text-gray-600">Please wait while we log you out</p>
            </div>
        </div>
    );
}