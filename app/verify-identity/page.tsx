'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Button from '../components/Button';
import { DatePicker } from '../components/DatePicker';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function VerifyIdentityPage() {
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    // Get bookings from Redux
    const bookings = useSelector((state: RootState) => state.booking.bookings);
    const firstBooking = bookings && bookings.length > 0 ? bookings[0] : null;

    const handleNextClick = () => {
        if (!dateOfBirth) {
            setErrorMessage('Please enter your Date of Birth.');
            return;
        }

        if (firstBooking && format(dateOfBirth, 'yyyy-MM-dd') === new Date(firstBooking.patient.birthDate).toISOString().split('T')[0]) {
            router.push(`/appointments`);
        } else {
            setErrorMessage('We couldn\'t verify your identity with the information provided. Please double-check your date of birth, or try verifying with your personal details below.');
        }
    };

    const handleOtherDetailsClick = () => {
        router.push('/personal-details');
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />

            {/* Main Content */}
            <main className="flex flex-col items-center text-center flex-grow">
                <h1 className="text-4xl font-medium mb-4">Verify Your Identity</h1>
                <p className="text-3xl text-gray-600 mb-8">Please enter your date-of-birth to verify your identity</p>

                <div className="rounded-3xl p-12 w-3/5 flex flex-col items-start mb-12 card-shadow">
                    <h2 className="text-2xl font-semibold mb-8">Personal Details</h2>
                    <div className="w-full">
                        <label htmlFor="date-of-birth" className="text-xl font-semibold mb-4 block">Enter Date of Birth <span className="text-purple-600">*</span></label>
                        <DatePicker
                            date={dateOfBirth}
                            setDate={setDateOfBirth}
                            className="w-full p-6 text-3xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    {errorMessage && (
                        <div className="flex flex-col items-start w-full mt-4">
                            <p className="text-red-500 text-xl mb-4">{errorMessage}</p>
                            <Button
                                className="px-10 py-3 rounded-2xl text-xl shadow-md"
                                onClick={handleOtherDetailsClick}
                            >
                                Try using personal details <span className="inline-flex items-center">instead
                                    <svg className="ml-2 w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </span>
                            </Button>
                        </div>
                    )}
                    <p className="text-xl text-gray-600 text-left mt-8">
                        Please enter your Date of Birth to verify your identity
                    </p>
                </div>
            </main>

            {/* Sticky footer button group */}
            <div className="w-full bg-white flex space-x-8 items-center justify-center py-4 mt-auto">
                <Button variant="secondary">
                    Need help?
                </Button>
                <Button
                    onClick={handleNextClick}
                >
                    Next
                    <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </Button>
            </div>
        </div>
    );
}