'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function WalkInPage() {
    const router = useRouter();

    const handleNextClick = () => {
        // Implement navigation to the next page for Walk-In, e.g., a confirmation page or immediate check-in
        console.log("Next button clicked on Walk-In page");
        router.push('/appointments'); // Example: navigate to appointments page for walk-in
    };

    const handleBackClick = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />

            {/* Main Content */}
            <main className="flex flex-col items-center text-center flex-grow">
                <h1 className="text-6xl font-bold mb-4">Check-In</h1>
                <p className="text-3xl text-gray-600 mb-20">Enter personal details</p>

                <div className="bg-gray-100 rounded-3xl shadow-xl p-12 w-3/5 flex flex-col items-start mb-12">
                    <h2 className="text-4xl font-semibold mb-8">Personal Details</h2>
                    <div className="grid grid-cols-2 gap-10 w-full mb-8">
                        <div>
                            <label htmlFor="first-name" className="text-2xl font-semibold mb-4 block">First name <span className="text-purple-600">*</span></label>
                            <input
                                type="text"
                                id="first-name"
                                placeholder="Enter first name ..."
                                className="w-full p-6 text-4xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="last-name" className="text-2xl font-semibold mb-4 block">Last name <span className="text-purple-600">*</span></label>
                            <input
                                type="text"
                                id="last-name"
                                placeholder="Enter last name ..."
                                className="w-full p-6 text-4xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 w-full mb-8">
                        <div>
                            <label htmlFor="date-of-birth" className="text-2xl font-semibold mb-4 block">Date-of-Birth <span className="text-purple-600">*</span></label>
                            <input
                                type="text"
                                id="date-of-birth"
                                placeholder="YYYY-MM-DD"
                                className="w-full p-6 text-4xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone-number" className="text-2xl font-semibold mb-4 block">Phone Number <span className="text-purple-600">*</span></label>
                            <input
                                type="text"
                                id="phone-number"
                                placeholder="Enter phone number ..."
                                className="w-full p-6 text-4xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>
                    <p className="text-xl text-gray-600 text-left mt-8">
                        Please enter all sections with a with the asterisk character <span className="font-bold">&quot;*&quot;</span>
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-8 mt-auto">
                    <button
                        className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-2xl font-semibold"
                        onClick={handleBackClick}
                    >
                        Back
                    </button>
                    <button className="px-12 py-4 border-2 border-purple-500 text-purple-600 rounded-full text-2xl font-semibold">
                        Need help?
                    </button>
                    <button
                        className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-2xl font-semibold flex items-center"
                        onClick={handleNextClick}
                    >
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