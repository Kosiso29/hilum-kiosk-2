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

    const handleSelect = (id: number, disabled: boolean, canCheckIn?: boolean) => {
        if (disabled) return;
        if (canCheckIn === false) {
            setCheckInError((prev) => ({
                ...prev,
                [id]: 'You can only check in within 30 minutes before and up to 10 minutes after your appointment.'
            }));
            return;
        }
        setCheckInError((prev) => ({ ...prev, [id]: '' }));
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
        setError(null);
        let allSucceeded = true;
        let lastSuccessBooking = null;
        for (const id of selected) {
            const booking = bookings.find((b) => b.id === id);
            if (!booking) continue;
            setLoadingCheckInId(booking.id);
            // TODO: implement when the telelink api is available
            // const velox_id = booking.externalBooking?.externalBookingReference;
            // const mrn = booking.externalBooking?.mrn || "910";
            // if (!velox_id) {
            //     setCheckInError((prev) => ({ ...prev, [booking.id]: "Unable to check in: missing external booking reference." }));
            //     allSucceeded = false;
            //     continue;
            // }
            try {
                // TODO: implement when the telelink api is available
                // await import('axios').then(({ default: axios }) =>
                //     axios.put(`http://15.157.121.170/appointment/check-in/${velox_id}/${mrn}`, { referring_doctor: 'test test' })
                // );
                // simulate api call
                await new Promise(resolve => setTimeout(resolve, 2000));
                lastSuccessBooking = booking;
                // Clear error if check-in succeeds
                setCheckInError((prev) => ({ ...prev, [booking.id]: '' }));
            } catch (error) {
                let message = 'There was an error with the check-in';
                if (error instanceof Error) message = error.message;
                setCheckInError((prev) => ({ ...prev, [booking.id]: message }));
                allSucceeded = false;
            } finally {
                setLoadingCheckInId(null);
            }
        }
        if (allSucceeded && lastSuccessBooking) {
            const params = new URLSearchParams({
                service: lastSuccessBooking.service.service,
                start: lastSuccessBooking.startTimeStamp,
                end: lastSuccessBooking.endTimeStamp,
                clinic: lastSuccessBooking.room.clinic.name,
                reference: lastSuccessBooking.bookingReference,
                operator: lastSuccessBooking.operator?.name || '',
            });
            router.push(`/appointments/success?${params.toString()}`);
        } else if (!allSucceeded) {
            setError('Some check-ins failed. Please review the errors above.');
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
                {/* Patient Name and Instructions */}
                <div className="w-full flex flex-col items-center mb-12">
                    <h2 className="text-4xl font-semibold text-gray-300 mb-2">{firstName ? `${firstName}'s Appointments` : 'Appointments'}</h2>
                    <div className="text-xl text-gray-500 mb-1">
                        Tap the <span className="text-purple-500 font-semibold">“Check in”</span> to select appointments
                    </div>
                    <div className="text-base text-gray-400">( Select no more than 2 items )</div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center text-2xl text-gray-600 mb-8 gap-4">
                        <span>Searching for your appointments </span>
                        <svg className="animate-spin h-7 w-7 text-purple-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                    </div>
                )}

                {!loading && bookings.length > 0 && (
                    <div className="flex flex-col items-center w-full">
                        {bookings.map((booking) => {
                            const now = new Date();
                            const start = new Date(booking.startTimeStamp);
                            const end = new Date(booking.endTimeStamp);
                            const diffToStart = (start.getTime() - now.getTime()) / 60000; // minutes until start
                            const diffFromStart = (now.getTime() - start.getTime()) / 60000; // minutes after start
                            const canCheckIn =
                                diffToStart <= 30 && // within 30 min before
                                diffFromStart <= 10 && // not more than 10 min late
                                diffToStart <= 30 && diffToStart >= -10; // between -10 and 30 min
                            const past = end < now;
                            const isSelected = selected.includes(booking.id);
                            return (
                                <AppointmentCard
                                    key={booking.id}
                                    service={booking.service.service}
                                    time={`${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    disabled={past || loadingCheckInId !== null || !canCheckIn}
                                    loading={loadingCheckInId === booking.id}
                                    error={checkInError[booking.id]}
                                    selected={isSelected}
                                    onCheckIn={() => canCheckIn && !past && !loadingCheckInId ? handleSelect(booking.id, false, true) : undefined}
                                />
                            );
                        })}
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-xl mb-8">{error}</div>
                )}

                {/* Buttons */}
                <div className="flex justify-between w-full max-w-2xl mt-12">
                    {error && (
                        <button
                            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-2xl font-semibold"
                            onClick={() => router.push('/personal-details')}
                        >
                            Back
                        </button>
                    )}
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