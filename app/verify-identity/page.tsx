'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Button from '../components/Button';
import { DatePicker } from '../components/DatePicker';
import { format } from 'date-fns';

function VerifyIdentityContent() {
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const bookingFirstName = searchParams.get('firstName');
    const bookingLastName = searchParams.get('lastName');
    const bookingBirthDate = searchParams.get('birthDate');
    const bookingReference = searchParams.get('bookingReference');
    const bookingPhoneNumber = searchParams.get('phoneNumber');
    const bookingHealthCard = searchParams.get('healthCard');

    const handleNextClick = () => {
        if (!dateOfBirth) {
            setErrorMessage('Please enter your Date of Birth.');
            return;
        }

        if (bookingBirthDate && format(dateOfBirth, 'yyyy-MM-dd') === bookingBirthDate) {
            const query = new URLSearchParams({
                firstName: bookingFirstName || '',
                lastName: bookingLastName || '',
                birthDate: bookingBirthDate,
                bookingReference: bookingReference || '',
                phoneNumber: bookingPhoneNumber || '',
                healthCard: bookingHealthCard || '',
            }).toString();
            router.push(`/appointments?${query}`);
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
                <h1 className="text-6xl font-bold mb-4">Verify Your Identity</h1>
                <p className="text-3xl text-gray-600 mb-20">Please enter your date-of-birth to verify your identity</p>

                <div className="rounded-3xl p-12 w-3/5 flex flex-col items-start mb-12 card-shadow">
                    <h2 className="text-4xl font-semibold mb-8">Personal Details</h2>
                    <div className="w-full">
                        <label htmlFor="date-of-birth" className="text-2xl font-semibold mb-4 block">Enter Date of Birth <span className="text-purple-600">*</span></label>
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
                                className="px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xl font-semibold shadow-md"
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
                <Button className="px-12 py-4 border-2 border-purple-500 text-purple-600 rounded-3xl text-2xl font-semibold">
                    Need help?
                </Button>
                <Button
                    className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl text-2xl font-semibold flex items-center"
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

export default function VerifyIdentityPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
                <Header />
                <main className="flex flex-col items-center text-center flex-grow">
                    <div className="text-2xl text-gray-600">Loading...</div>
                </main>
            </div>
        }>
            <VerifyIdentityContent />
        </Suspense>
    );
} 