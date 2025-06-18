'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function CheckinPage() {
    const router = useRouter();

    const handleCheckinClick = () => {
        router.push('/checkin');
    };

    const handleWalkinClick = () => {
        router.push('/walk-in');
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />

            {/* Main Content */}
            <main className="flex flex-col items-center text-center flex-grow">
                <h1 className="text-6xl font-bold mb-4">Check in for your appointment</h1>
                <h1 className="text-6xl font-bold mb-8">or register as walk-in</h1>
                <p className="text-3xl text-gray-600 mb-20">Select an option to proceed</p>

                <div className="flex space-x-12 mb-20">
                    {/* Check-In Card */}
                    <div
                        className="bg-gray-100 rounded-3xl shadow-xl w-96 h-96 flex flex-col items-center justify-center p-8 cursor-pointer transform transition-transform duration-200 hover:scale-105"
                        onClick={handleCheckinClick}
                    >
                        <div className="w-64 h-48 bg-gray-200 rounded-xl mb-6"></div> {/* Placeholder for image/icon */}
                        <h2 className="text-4xl font-bold mb-2">Check-In</h2>
                        <p className="text-xl text-gray-600">I have a scheduled appointment</p>
                    </div>

                    {/* Walk-In Card */}
                    <div
                        className="bg-gray-100 rounded-3xl shadow-xl w-96 h-96 flex flex-col items-center justify-center p-8 cursor-pointer transform transition-transform duration-200 hover:scale-105"
                        onClick={handleWalkinClick}
                    >
                        <div className="w-64 h-48 bg-gray-200 rounded-xl mb-6"></div> {/* Placeholder for image/icon */}
                        <h2 className="text-4xl font-bold mb-2">Walk-In</h2>
                        <p className="text-xl text-gray-600">I don&apos;t have an appointment</p>
                    </div>
                </div>

                {/* Note */}
                <p className="text-xl text-gray-600 mb-12">
                    <span className="font-bold">Please note:</span> You can only check in within 30 minutes of your appointment.
                    <br />
                    Late check-ins by more than 10 minutes are not permitted.
                </p>

                {/* Buttons */}
                <div className="flex space-x-8">
                    <button className="px-12 py-4 border-2 border-purple-500 text-purple-600 rounded-full text-2xl font-semibold">
                        Need help?
                    </button>
                    <button className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-2xl font-semibold flex items-center">
                        Next
                        <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </main>
        </div>
    );
} 