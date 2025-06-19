'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const router = useRouter();

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

    return (
        <header className="w-full flex justify-between items-center mb-16">
            <div className="flex items-center space-x-2 text-4xl font-semibold">
                <span>{currentTime.split(' ')[0]}</span>
                <span className="text-xl self-start mt-1">{currentTime.split(' ')[1]}</span>
                <div className="ml-8 text-2xl font-normal border-l-2 border-gray-300 pl-4">
                    {currentDate.split(',')[0]}
                    <br />
                    {currentDate.split(',')[1]}
                </div>
            </div>
            <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => router.push('/')}
                title="Go to Home"
            >
                <Image src="/icons/icon-192x192.png" alt="Wosler Diagnostics Logo" width={80} height={80} className="mr-4" />
                <span className="text-3xl font-bold">Wosler</span>
                <span className="text-xl font-normal ml-1">DIAGNOSTICS</span>
            </div>
        </header>
    );
}

