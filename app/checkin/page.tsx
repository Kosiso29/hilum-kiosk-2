'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/Booking';
import Header from '@/app/components/Header';
import api from '../lib/axios';
import Button from '../components/Button';
import Input from '../components/Input';
import { useDispatch } from 'react-redux';
import { setBookings } from '../store/bookingSlice';

const NEXUS_NUMBER = process.env.NEXT_PUBLIC_NEXUS_NUMBER || '6473603374';

export default function CheckinPage() {
    const [referenceCode, setReferenceCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleReferenceCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReferenceCode(event.target.value);
        setErrorMessage(null); // Clear error message when input changes
    };

    const handleNextClick = async () => {
        if (!referenceCode) {
            setErrorMessage('Please enter a booking reference code.');
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                bookingReference: referenceCode,
                nexusNumber: NEXUS_NUMBER
            });

            const response = await api.get(`slots/booking?${params}`);

            if (!response.data || response.data.length === 0) {
                setErrorMessage('Sorry, we cannot find the booking reference. We can get the booking using your other personal details');
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
                setErrorMessage("We found your booking, but it is not scheduled for today. Kindly pick a booking scheduled for today.");
                setLoading(false);
                return;
            }

            if (todaysBookings.length > 0) {
                dispatch(setBookings(todaysBookings));
                // Only pass bookingReference in the query
                const query = new URLSearchParams({
                    bookingReference: referenceCode
                }).toString();
                router.push(`/verify-identity?${query}`);
            } else {
                setErrorMessage('Sorry, we cannot find the booking reference. We can get the booking using your other personal details');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setErrorMessage('Failed to fetch booking data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleNoCodeClick = () => {
        router.push('/personal-details');
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col p-8">
            <Header />

            {/* Main Content */}
            <main className="flex flex-col items-center text-center flex-grow w-full">
                <h1 className="text-4xl font-medium mb-2">Check-In</h1>
                <p className="text-3xl text-gray-600 mb-20">Enter booking reference code</p>

                <div className="rounded-3xl p-12 w-3/5 flex flex-col items-start mb-4 card-shadow">
                    <label htmlFor="reference-code" className="text-3xl font-semibold mb-6">Reference Code</label>
                    <Input
                        type="text"
                        id="reference-code"
                        placeholder="############"
                        className="w-full p-6 text-4xl border-2 border-gray-300 rounded-xl mb-6 focus:outline-none focus:border-purple-500"
                        value={referenceCode}
                        onChange={handleReferenceCodeChange}
                        disabled={loading}
                    />
                    {errorMessage && <p className="text-red-500 text-xl mt-2">{errorMessage}</p>}
                    <p className="text-xl text-gray-600 text-left mt-4">
                        Find the reference code in your appointment
                        <span className="font-semibold"> email</span> or <span className="font-semibold">text</span>
                    </p>
                </div>

                <div className="relative h-20 w-full mb-2">
                    {loading && (
                        <div className="absolute w-full inset-0 flex items-center justify-center text-2xl text-gray-600 gap-4">
                            <span>Searching for your booking</span>
                            <svg className="animate-spin h-7 w-7 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        </div>
                    )}
                </div>

                <Button
                    className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl text-2xl font-semibold mb-8"
                    onClick={handleNoCodeClick}
                >
                    I don&apos;t have a code
                </Button>
                <p className="text-xl text-gray-600 mb-20">
                    <span className="font-bold">We can get the booking using your other personal details.</span>
                </p>
            </main>

            {/* Sticky footer button group */}
            <div className="w-full bg-white flex space-x-8 items-center justify-center py-4">
                <Button variant="secondary">
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
