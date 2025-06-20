'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Booking } from '@/types/Booking';
import Header from '@/app/components/Header';
import AppointmentCard from '../components/AppointmentCard';
import api from '../lib/axios';

function AppointmentsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingCheckInId, setLoadingCheckInId] = useState<number | null>(null);
    const [checkInError, setCheckInError] = useState<{ [id: number]: string }>({});
    const [selected, setSelected] = useState<number[]>([]);

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
                let response;

                if (bookingReference && birthDate) {
                    // Call external API for bookingReference
                    const params = new URLSearchParams({
                        bookingReference,
                        nexusNumber: '6473603374'
                    });
                    response = await api.get(`slots/booking?${params}`);
                } else if (firstName && lastName && birthDate) {
                    // Call external API for personal details
                    const params = new URLSearchParams({
                        firstName,
                        lastName,
                        patientDOB: birthDate,
                        nexusNumber: '6473603374'
                    });
                    response = await api.get(`slots/booking?${params}`);
                } else {
                    setLoading(false);
                    return;
                }

                if (!response.data || response.data.length === 0) {
                    setError('No bookings found for the provided details.');
                    setLoading(false);
                    return;
                }

                setBookings(response.data);
            } catch (error) {
                console.error('Error searching bookings:', error);
                setError('Failed to search for bookings. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        searchBookings();
    }, [firstName, lastName, birthDate, phoneNumber, healthCard, bookingReference]);

    const handleSelect = (id: number, disabled: boolean) => {
        if (disabled) return;
        setSelected((prev) => {
            if (prev.includes(id)) {
                return prev.filter((x) => x !== id);
            } else if (prev.length < 2) {
                return [...prev, id];
            } else {
                return prev;
            }
        });
    };

    const handleNext = async () => {
        if (selected.length === 0) return;
        // For now, only check in the first selected appointment (can be extended to multiple)
        const booking = bookings.find((b) => selected.includes(b.id));
        if (!booking) return;
        setError(null);
        setCheckInError((prev) => ({ ...prev, [booking.id]: '' }));
        setLoadingCheckInId(booking.id);
        // TODO: Get the right api and implement this
        // const velox_id = booking.externalBooking?.externalBookingReference;
        // const mrn = booking.externalBooking?.mrn || "910";
        // if (!velox_id) {
        //     setError("Unable to check in: missing external booking reference.");
        //     setLoadingCheckInId(null);
        //     return;
        // }
        try {
            // TODO: Get the right api and implement this
            // const response = await fetch(`http://15.157.121.170/appointment/check-in/${velox_id}/${mrn}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ referring_doctor: 'test test' }),
            // });
            const response = { ok: true }
            if (!response.ok) {
                setError("Check-in failed. Please try again or contact the front desk.");
                setLoadingCheckInId(null);
                return;
            }
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
        } catch (error) {
            let message = 'There was an error with the check-in';
            if (error instanceof Error) message = error.message;
            setCheckInError((prev) => ({ ...prev, [booking.id]: message }));
            setLoadingCheckInId(null);
        }
    };

    const handleNeedHelpClick = () => {
        // Logic for help
        console.log("Need help clicked");
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
                    <>
                        <div className="text-red-500 text-xl mb-8">{error}</div>
                        <button
                            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-2xl font-semibold mb-8"
                            onClick={() => router.push('/personal-details')}
                        >
                            Back
                        </button>
                    </>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <div className="flex flex-col items-center w-full">
                        {bookings.map((booking) => {
                            const past = new Date(booking.endTimeStamp) < new Date();
                            const isSelected = selected.includes(booking.id);
                            return (
                                <AppointmentCard
                                    key={booking.id}
                                    service={booking.service.service}
                                    time={`${new Date(booking.startTimeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTimeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    disabled={past || loadingCheckInId !== null}
                                    loading={loadingCheckInId === booking.id}
                                    error={checkInError[booking.id]}
                                    selected={isSelected}
                                    onCheckIn={() => handleSelect(booking.id, past || loadingCheckInId !== null)}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between w-full max-w-2xl mt-12">
                    <button
                        className="px-12 py-4 border-2 border-purple-500 text-purple-600 rounded-full text-2xl font-semibold mr-4"
                        onClick={handleNeedHelpClick}
                    >
                        Need help?
                    </button>
                    <button
                        className={`px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-2xl font-semibold flex items-center transition-all ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={selected.length === 0 || loadingCheckInId !== null}
                        onClick={handleNext}
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