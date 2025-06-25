'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import { DatePicker } from '../components/DatePicker';
import { format } from 'date-fns';

export default function PersonalDetailsPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [healthcareNumber, setHealthcareNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleBackClick = () => {
        router.back();
    };

    const handleNextClick = () => {
        if (!firstName || !lastName || !dateOfBirth) {
            setError('Please fill in all required fields (First Name, Last Name, Date of Birth).');
            return;
        }
        setError(null);
        const query = new URLSearchParams({
            firstName,
            lastName,
            birthDate: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : '',
            ...(healthcareNumber && { healthCard: healthcareNumber }),
        }).toString();
        router.push(`/appointments?${query}`);
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />
            <main className="flex flex-col items-center text-center flex-grow">
                <h1 className="text-6xl font-bold mb-4">Check-In</h1>
                <p className="text-3xl text-gray-600 mb-20">Enter personal details</p>
                <div className="rounded-3xl p-12 w-4/5 flex flex-col items-start mb-12 card-shadow">
                    <h2 className="text-4xl font-semibold mb-8">Personal Details</h2>
                    <div className="grid grid-cols-2 gap-10 w-full mb-8">
                        <div>
                            <label htmlFor="first-name" className="text-xl font-semibold mb-4 block">First name <span className="text-purple-600">*</span></label>
                            <Input
                                type="text"
                                id="first-name"
                                placeholder="Enter first name ..."
                                className="w-full p-5 text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="last-name" className="text-xl font-semibold mb-4 block">Last name <span className="text-purple-600">*</span></label>
                            <Input
                                type="text"
                                id="last-name"
                                placeholder="Enter last name ..."
                                className="w-full p-5 text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 w-full mb-8">
                        <div>
                            <label htmlFor="date-of-birth" className="text-xl font-semibold mb-4 block">Date-of-Birth <span className="text-purple-600">*</span></label>
                            <DatePicker
                                date={dateOfBirth}
                                setDate={setDateOfBirth}
                                className="w-full p-5 text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="healthcare-number" className="text-xl font-semibold mb-4 block">Healthcare Number <span className="text-gray-500">(optional)</span></label>
                            <Input
                                type="text"
                                id="healthcare-number"
                                placeholder="Enter healthcare number ..."
                                className="w-full p-5 text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                                value={healthcareNumber}
                                onChange={(e) => setHealthcareNumber(e.target.value)}
                            />
                        </div>
                    </div>
                    <p className="text-xl text-gray-600 text-left mt-8">
                        Please enter all sections with a with the asterisk character <span className="font-bold">&quot;*&quot;</span>
                    </p>
                </div>
                {error && (
                    <div className="text-red-500 text-xl mb-8">{error}</div>
                )}
            </main>
            {/* Sticky footer button group */}
            <div className="w-full bg-white flex space-x-8 items-center justify-center py-4">
                <Button
                    className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl text-2xl font-semibold"
                    onClick={handleBackClick}
                >
                    Back
                </Button>
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