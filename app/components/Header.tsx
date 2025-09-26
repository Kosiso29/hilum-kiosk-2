'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { clinicStorage } from '@/app/lib/clinicStorage';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

export default function Header() {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const router = useRouter();

    // Refresh MOA tokens on page load for all pages
    useTokenRefresh();

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

    // Simple IndexedDB data validation - logout if clinic data is corrupted or missing
    useEffect(() => {
        const checkClinicData = async () => {
            try {
                const nexusNumber = await clinicStorage.getNexusNumber();
                if (!nexusNumber) {
                    console.log('No clinic data found - redirecting to logout');
                    window.location.href = '/logout';
                }
            } catch (error) {
                console.error('Clinic data validation failed:', error);
                window.location.href = '/logout';
            }
        };

        // Only check on pages that require clinic data (not login, logout, or clinic selection pages)
        if (typeof window !== 'undefined' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/logout') &&
            !window.location.pathname.includes('/clinic-selection')) {
            checkClinicData();
        }
    }, []);

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

                {/* Logout functionality removed - use /logout path for admin logout */}
            </div>
        </header>
    );
}

