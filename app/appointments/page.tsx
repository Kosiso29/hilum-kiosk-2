'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import AppointmentCard from '../components/AppointmentCard';
import api from '../lib/axios';
import Button from '../components/Button';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function AppointmentsPage() {
    const router = useRouter();
    const bookings = useSelector((state: RootState) => state.booking.bookings);
    const [error, setError] = useState<string | null>(null);
    const [loadingCheckInId, setLoadingCheckInId] = useState<number | null>(null);
    const [checkInError, setCheckInError] = useState<{ [id: number]: string }>({});
    const [selected, setSelected] = useState<number[]>([]);

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
            try {
                // Call the new check-in API endpoint
                await api.get(`check-in/${booking.bookingReference}`);
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
                    <h2 className="text-4xl font-semibold text-gray-300 mb-2">{bookings[0]?.patient.firstName ? `${bookings[0]?.patient.firstName}'s Appointments` : 'Appointments'}</h2>
                    <div className="text-xl text-gray-500 mb-1">
                        Tap the <span className="text-purple-500 font-semibold">&ldquo;Check in&rdquo;</span> to select appointments
                    </div>
                    <div className="text-base text-gray-400">( Select no more than 2 items )</div>
                </div>

                {bookings.length > 0 && (
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

                            // Extract the time portion (HH:mm) from the ISO string directly
                            const extractTime = (isoString: string) => {
                                // Handles both Z and offset formats
                                const match = isoString.match(/T(\d{2}:\d{2})/);
                                return match ? match[1] : '';
                            };
                            const startTime = extractTime(booking.startTimeStamp);
                            const endTime = extractTime(booking.endTimeStamp);

                            return (
                                <AppointmentCard
                                    key={booking.id}
                                    service={booking.service.service}
                                    time={`${startTime} - ${endTime}`}
                                    disabled={past || loadingCheckInId !== null || !canCheckIn}
                                    loading={loadingCheckInId === booking.id}
                                    error={checkInError[booking.id]}
                                    selected={isSelected}
                                    onCheckIn={canCheckIn && !past && !loadingCheckInId ? () => handleSelect(booking.id, false, true) : undefined}
                                />
                            );
                        })}
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-xl mb-8">{error}</div>
                )}
            </main>

            {/* Sticky footer button group */}
            <div className="w-full bg-white flex justify-between max-w-2xl mx-auto mt-12 items-center py-4 px-4">
                {error && (
                    <Button
                        className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl text-2xl font-semibold"
                        onClick={() => router.push('/personal-details')}
                    >
                        Back
                    </Button>
                )}
                <Button
                    className="px-12 py-4 border-2 border-purple-500 text-purple-600 rounded-3xl text-2xl font-semibold mr-4"
                    onClick={handleNeedHelpClick}
                >
                    Need help?
                </Button>
                <Button
                    className={`px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-3xl text-2xl font-semibold flex items-center transition-all ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selected.length === 0 || loadingCheckInId !== null}
                    onClick={handleNext}
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