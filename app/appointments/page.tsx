'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Booking } from '@/types/Booking';
import Header from '@/app/components/Header';

function AppointmentsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const birthDate = searchParams.get('birthDate');
    const phoneNumber = searchParams.get('phoneNumber');
    const healthCard = searchParams.get('healthCard');
    const bookingReference = searchParams.get('bookingReference');

    useEffect(() => {
        const searchBookings = async () => {
            // If we have a booking reference, we don't need to search
            if (bookingReference) {
                return;
            }

            // If we have personal details, search for bookings
            if (firstName && lastName && birthDate) {
                setLoading(true);
                setError(null);

                try {
                    const params = new URLSearchParams({
                        firstName,
                        lastName,
                        birthDate,
                        ...(phoneNumber && { phoneNumber }),
                        ...(healthCard && { healthCard }),
                    });

                    const response = await fetch(`/api/bookings?${params}`);

                    if (!response.ok) {
                        setError('No bookings found for the provided details.');
                        setLoading(false);
                        return;
                    }

                    const bookingData: Booking[] = await response.json();
                    setBookings(bookingData);
                } catch (error) {
                    console.error('Error searching bookings:', error);
                    setError('Failed to search for bookings. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        searchBookings();
    }, [firstName, lastName, birthDate, phoneNumber, healthCard, bookingReference]);

    const handleCheckInClick = () => {
        // Logic for actual check-in process would go here
        alert('Checked In!');
        router.push('/'); // Redirect to home or a thank you page
    };

    const handleNeedHelpClick = () => {
        // Logic for help
        console.log("Need help clicked");
    };

    const handleBackClick = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />

            {/* Main Content */}
            <main className="flex flex-col items-center text-center flex-grow">
                <h1 className="text-6xl font-bold mb-4">Appointments</h1>
                <p className="text-3xl text-gray-600 mb-20">Please confirm your details</p>

                {loading && (
                    <div className="text-2xl text-gray-600 mb-8">Searching for your appointments...</div>
                )}

                {error && (
                    <div className="text-red-500 text-xl mb-8">{error}</div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <div className="bg-gray-100 rounded-3xl shadow-xl p-12 w-4/5 mb-12">
                        <h2 className="text-4xl font-semibold mb-8 text-center">Your Appointments</h2>
                        {bookings.map((booking) => (
                            <div key={booking.id} className="mb-8 p-6 bg-white rounded-xl">
                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <p className="text-2xl"><span className="font-semibold">Service:</span> {booking.service.service}</p>
                                    <p className="text-2xl"><span className="font-semibold">Date:</span> {new Date(booking.startTimeStamp).toLocaleDateString()}</p>
                                    <p className="text-2xl"><span className="font-semibold">Time:</span> {new Date(booking.startTimeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-2xl"><span className="font-semibold">Clinic:</span> {booking.room.clinic.name}</p>
                                    {booking.operator && <p className="text-2xl"><span className="font-semibold">Operator:</span> {booking.operator.name}</p>}
                                    <p className="text-2xl"><span className="font-semibold">Booking Ref:</span> {booking.bookingReference}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                    <button
                        className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-2xl font-semibold"
                        onClick={handleBackClick}
                    >
                        Back
                    </button>
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

export default function AppointmentsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
                <Header />
                <main className="flex flex-col items-center text-center flex-grow">
                    <div className="text-2xl text-gray-600">Loading...</div>
                </main>
            </div>
        }>
            <AppointmentsContent />
        </Suspense>
    );
} 