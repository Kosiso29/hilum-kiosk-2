'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearSession } from '@/app/store/authSlice';
import { AppDispatch } from '@/app/store';
import { useClinicData } from '@/app/hooks/useClinicData';
import { idleTimerManager } from '@/app/lib/idleTimerManager';

export default function Header() {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const { clearClinicData } = useClinicData();

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
            setCurrentDate(now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }));
        };

        updateDateTime(); // Initial call
        const timerId = setInterval(updateDateTime, 60000); // Update every minute

        return () => clearInterval(timerId); // Clean up on unmount
    }, []);


    const handleLogout = async () => {
        // Clear session from Redux store
        dispatch(clearSession());

        // Clear clinic data from IndexedDB
        try {
            await clearClinicData();
        } catch (error) {
            console.error('Failed to clear clinic data:', error);
        }

        // Clear session token cookie using fetch to ensure proper clearing
        try {
            // Pause idle timer during logout API call
            idleTimerManager.startApiCall();
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            idleTimerManager.endApiCall();
        } catch (error) {
            console.error('Logout API error:', error);
            // Ensure timer is resumed even if API call fails
            idleTimerManager.endApiCall();
            // Fallback: try to clear cookie manually
            document.cookie = 'session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; httpOnly=false; secure=false; sameSite=strict';
        }

        // Redirect to login
        router.push('/login');
    };

    return (
        <header className="w-full flex justify-between items-center mb-16">
            <div className="flex items-end space-x-2 text-4xl font-normal">
                <p className='mb-2'>
                    <span>{currentTime.split(' ')[0]}</span>
                    <span className="text-xl self-start ml-2">{currentTime.split(' ')[1]}</span>
                </p>
                <div className="ml-2 text-xl font-normal border-l-2 border-gray-300 pl-4">
                    {currentDate.split(' ')[1]} {currentDate.split(' ')[2]}
                    <br />
                    {currentDate.split(' ')[0]}
                </div>
            </div>
            <div className="flex items-center space-x-4">
                {/* Logo */}
                <div
                    className="flex items-center cursor-pointer select-none"
                    onClick={() => router.push('/')}
                    title="Go to Home"
                >
                    <Image src="/logo.png" alt="Wosler Diagnostics Logo" width={60} height={60} className="mr-4" />
                    <span className="flex flex-col">
                        <span className="text-3xl font-bold">Wosler</span>
                        <span className="text-xl font-normal ml-1">DIAGNOSTICS</span>
                    </span>
                </div>

                {/* Divider - only show on non-login pages */}
                {pathname !== '/login' && (
                    <div className="h-16 w-px bg-gray-300"></div>
                )}

                {/* Logout Button - show on all pages except login */}
                {pathname !== '/login' && (
                    <button
                        onClick={handleLogout}
                        title="Logout"
                    >
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
}

