'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import { DatePicker } from '../components/DatePicker';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { setBookings } from '../store/bookingSlice';
import api from '../lib/axios';
import { Booking } from '@/types/Booking';
import { getNexusNumberFromStorage } from '../lib/config';

export default function PersonalDetailsPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [healthcareNumber, setHealthcareNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleBackClick = () => {
        router.back();
    };

    const handleNextClick = async () => {
        if (!firstName || !lastName || !dateOfBirth) {
            setError('Please fill in all required fields (First Name, Last Name, Date of Birth).');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const nexusNumber = await getNexusNumberFromStorage();
            const params = new URLSearchParams({
                firstName,
                lastName,
                patientDOB: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : '',
                ...(healthcareNumber && { patientHCN: healthcareNumber }),
                nexusNumber,
            });
            const response = await api.get(`slots/booking?${params}`);

            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && 'message' in response.data) {
                setError(response.data.message);
                setLoading(false);
                return;
            }

            if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                setError('No bookings found for the provided details.');
                setLoading(false);
                return;
            }

            const bookings: Booking[] = response.data;
            const today = new Date();
            const todaysBookings = bookings.filter(booking => {
                const bookingDate = new Date(booking.startTimeStamp);
                return bookingDate.getFullYear() === today.getFullYear() &&
                    bookingDate.getMonth() === today.getMonth() &&
                    bookingDate.getDate() === today.getDate();
            });

            if (todaysBookings.length === 0) {
                setError("We found your details, but there are no appointments scheduled for today. Kindly pick a booking scheduled for today.");
                setLoading(false);
                return;
            }

            dispatch(setBookings(todaysBookings));
            router.push('/appointments');
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Failed to find bookings. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />
            <main className="flex flex-col items-center text-center flex-grow">
                <h1 className="text-4xl font-medium mb-4">Check-In</h1>
                <p className="text-3xl text-gray-600 mb-8">Enter personal details</p>
                <div className="rounded-3xl p-12 max-w-[50rem] flex flex-col items-start mb-4 card-shadow text-left">
                    <h2 className="text-2xl font-semibold mb-8">Personal Details</h2>
                    <div className="grid grid-cols-2 gap-10 w-full mb-8">
                        <div>
                            <label htmlFor="first-name" className="text-xl font-semibold mb-4 block">First name <span className="text-purple-600">*</span></label>
                            <Input
                                type="text"
                                id="first-name"
                                placeholder="Enter first name ..."
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
                                className="text-2xl"
                            />
                        </div>
                        <div>
                            <label htmlFor="healthcare-number" className="text-xl font-semibold mb-4 block">Healthcare Number <span className="text-gray-500">(optional)</span></label>
                            <Input
                                type="number"
                                id="healthcare-number"
                                placeholder="Enter healthcare number ..."
                                value={healthcareNumber}
                                onChange={(e) => setHealthcareNumber(e.target.value)}
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                        </div>
                    </div>
                    <p className="text-xl text-gray-600 text-left mt-4">
                        Please enter all sections with a with the asterisk character <span className="font-bold">&quot;*&quot;</span>
                    </p>
                    <div className="w-full flex justify-center items-center mt-2" style={{ minHeight: 48 }}>
                        {loading ? (
                            <>
                                <svg className="animate-spin h-8 w-8 text-purple-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                <span className="text-2xl text-gray-600">Searching for your appointments...</span>
                            </>
                        ) : null}
                        {error && (
                            <div className="text-red-500 text-xl mt-2 text-center max-w-full">{error}</div>
                        )}
                    </div>
                </div>
            </main>
            {/* Sticky footer button group */}
            <div className="w-full bg-white flex space-x-8 items-center justify-center py-4">
                <Button
                    onClick={handleBackClick}
                    disabled={loading}
                >
                    Back
                </Button>
                <Button variant="secondary" disabled={loading}>
                    Need help?
                </Button>
                <Button
                    onClick={handleNextClick}
                    disabled={loading}
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