'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';

function SummaryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const birthDate = searchParams.get('birthDate');
    const phoneNumber = searchParams.get('phoneNumber');
    const healthCard = searchParams.get('healthCard');
    const bookingReference = searchParams.get('bookingReference');

    const handleCheckInClick = () => {
        // Logic for actual check-in process would go here
        alert('Checked In!');
        router.push('/'); // Redirect to home or a thank you page
    };

    const handleNeedHelpClick = () => {
        // Logic for help
        console.log("Need help clicked");
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />

            {/* Main Content */}
            <main className="flex flex-col items-center text-center flex-grow">
                <h1 className="text-6xl font-bold mb-4">Summary</h1>
                <p className="text-3xl text-gray-600 mb-20">Please confirm your details</p>

                <div className="bg-gray-100 rounded-3xl shadow-xl p-12 w-4/5 flex flex-wrap justify-around items-start mb-12 text-left">
                    <h2 className="text-4xl font-semibold mb-8 w-full text-center">Your Details</h2>
                    <p className="text-2xl mb-4 mx-4 flex-auto"><span className="font-semibold">First Name:</span> {firstName}</p>
                    <p className="text-2xl mb-4 mx-4 flex-auto"><span className="font-semibold">Last Name:</span> {lastName}</p>
                    <p className="text-2xl mb-4 mx-4 flex-auto"><span className="font-semibold">Date of Birth:</span> {birthDate}</p>
                    {phoneNumber && <p className="text-2xl mb-4 mx-4 flex-auto"><span className="font-semibold">Phone Number:</span> {phoneNumber}</p>}
                    {healthCard && <p className="text-2xl mb-4 mx-4 flex-auto"><span className="font-semibold">Health Card:</span> {healthCard}</p>}
                    {bookingReference && <p className="text-2xl mb-4 mx-4 flex-auto"><span className="font-semibold">Booking Reference:</span> {bookingReference}</p>}
                </div>

                {/* Buttons */}
                <div className="flex space-x-8 mt-auto">
                    <button className="px-12 py-4 border-2 border-purple-500 text-purple-600 rounded-full text-2xl font-semibold"
                        onClick={handleNeedHelpClick}
                    >
                        Need help?
                    </button>
                    <button className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-2xl font-semibold flex items-center"
                        onClick={handleCheckInClick}
                    >
                        Check In
                        <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default function SummaryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
                <Header />
                <main className="flex flex-col items-center text-center flex-grow">
                    <div className="text-2xl text-gray-600">Loading...</div>
                </main>
            </div>
        }>
            <SummaryContent />
        </Suspense>
    );
} 