'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Booking } from '@/types/Booking';
import Header from '@/app/components/Header';
import AppointmentCard from '../components/AppointmentCard';

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
            setLoading(true);
            setError(null);
            try {
                let params;
                if (bookingReference && birthDate) {
                    // Only use bookingReference and birthDate
                    params = new URLSearchParams({
                        bookingReference,
                        birthDate,
                    });
                } else if (firstName && lastName && birthDate) {
                    // Use personal details
                    params = new URLSearchParams({
                        firstName,
                        lastName,
                        birthDate,
                        ...(phoneNumber && { phoneNumber }),
                        ...(healthCard && { healthCard }),
                    });
                } else {
                    setLoading(false);
                    return;
                }
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
        };
        searchBookings();
    }, [firstName, lastName, birthDate, phoneNumber, healthCard, bookingReference]);

    const handleCheckInClick = (booking: Booking) => {
        // Navigate to the success page with appointment details
        const params = new URLSearchParams({
            service: booking.service.service,
            start: booking.startTimeStamp,
            end: booking.endTimeStamp,
            clinic: booking.room.clinic.name,
            reference: booking.bookingReference,
            operator: booking.operator?.name || '',
        });
        router.push(`/appointments/success?${params.toString()}`);
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
            <main className="flex flex-col items-center text-center flex-grow w-full">
                <h1 className="text-6xl font-bold mb-4">Appointments</h1>
                <p className="text-3xl text-gray-600 mb-20">Please confirm your details</p>

                {loading && (
                    <div className="text-2xl text-gray-600 mb-8">Searching for your appointments...</div>
                )}

                {error && (
                    <div className="text-red-500 text-xl mb-8">{error}</div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <div className="flex flex-col items-center w-full">
                        {bookings.map((booking) => (
                            <AppointmentCard
                                key={booking.id}
                                service={booking.service.service}
                                time={`${new Date(booking.startTimeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTimeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                disabled={new Date(booking.endTimeStamp) < new Date()}
                                onCheckIn={() => handleCheckInClick(booking)}
                            />
                        ))}
                    </div>
                )}

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