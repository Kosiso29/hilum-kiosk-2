'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Button from '../components/Button';

export default function CheckinPage() {
    const router = useRouter();

    const handleCheckinClick = () => {
        router.push('/checkin');
    };

    const handleWalkinClick = () => {
        router.push('/walk-in');
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-2 sm:p-4 md:p-8">
            <Header />

            {/* Main Content */}
            <main className="flex flex-col items-center text-center flex-grow w-full">
                <h1 className="text-3xl md:text-4xl font-medium">Check in for your appointment</h1>
                <h1 className="text-3xl md:text-4xl font-medium mb-4 md:mb-4">or register as walk-in</h1>
                <p className="text-lg md:text-3xl text-gray-600 mb-8 md:mb-20">Select an option to proceed</p>

                <div className="flex flex-col md:flex-row md:space-x-12 space-y-8 md:space-y-0 mb-8 md:mb-20 w-full justify-center">
                    {/* Check-In Card */}
                    <div
                        className="rounded-3xl w-64 h-full flex flex-col justify-center p-4 md:p-8 cursor-pointer transform transition-transform duration-200 hover:scale-105 card-shadow"
                        onClick={handleCheckinClick}
                    >
                        <div className="w-32 h-28 md:w-48 md:h-40 bg-[#f5f5f5] rounded-xl mb-4 md:mb-14"></div> {/* Placeholder for image/icon */}
                        <h2 className="text-2xl md:text-3xl text-left font-medium mb-1 md:mb-2">Check-In</h2>
                        <p className="text-base text-left text-gray-600">I have a scheduled appointment</p>
                    </div>

                    {/* Walk-In Card */}
                    <div
                        className="rounded-3xl w-64 h-full flex flex-col justify-center p-4 md:p-8 cursor-pointer transform transition-transform duration-200 hover:scale-105 card-shadow"
                        onClick={handleWalkinClick}
                    >
                        <div className="w-32 h-28 md:w-48 md:h-40 bg-[#f5f5f5] rounded-xl mb-4 md:mb-14"></div> {/* Placeholder for image/icon */}
                        <h2 className="text-2xl md:text-3xl text-left font-medium mb-1 md:mb-2">Walk-In</h2>
                        <p className="text-base text-left text-gray-600">I don&apos;t have an appointment</p>
                    </div>
                </div>

                {/* Note */}
                <p className="text-base text-gray-600 mb-8 md:mb-12">
                    <span className="font-bold">Please note:</span> You can only check in within 30 minutes of your appointment.
                    <br />
                    Late check-ins by more than 10 minutes are not permitted.
                </p>
            </main>

            {/* Sticky footer button group */}
            <div className="w-full bg-white flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 items-center justify-center py-4">
                <Button className="px-8 md:px-12 py-4 border-2 border-purple-500 text-purple-600 rounded-3xl text-lg md:text-2xl font-semibold">
                    Need help?
                </Button>
                <Button className="px-8 md:px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl text-lg md:text-2xl font-semibold flex items-center">
                    Next
                    <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </Button>
            </div>
        </div>
    );
} 