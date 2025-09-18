'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import AppointmentCard from '../components/AppointmentCard';
import RequisitionQRCode from '../components/RequisitionQRCode';
import api from '../lib/axios';
import Button from '../components/Button';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getNexusNumberFromStorage } from '../lib/config';
import { idleTimerManager } from '../lib/idleTimerManager';
import axios from 'axios';

export default function AppointmentsPage() {
    const router = useRouter();
    const bookings = useSelector((state: RootState) => state.booking.bookings);
    const [error, setError] = useState<string | null>(null);
    const [loadingCheckInId, setLoadingCheckInId] = useState<number | null>(null);
    const [checkInError, setCheckInError] = useState<{ [id: number]: string }>({});
    const [selected, setSelected] = useState<number[]>([]);
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrBookingRef, setQrBookingRef] = useState<string>('');

    // Manage idle timer based on QR code dialog state
    useEffect(() => {
        if (showQRCode) {
            // Pause idle timer when QR code dialog is shown
            idleTimerManager.pause();
        } else {
            // Resume idle timer when QR code dialog is closed
            idleTimerManager.resume();
        }

        // Cleanup: ensure timer is resumed when component unmounts
        return () => {
            if (showQRCode) {
                idleTimerManager.resume();
            }
        };
    }, [showQRCode]);

    const handleSelect = (id: number, disabled: boolean, canCheckIn?: boolean) => {
        if (disabled) return;
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

            // Check current requisition status from API
            try {
                const nexusNumber = await getNexusNumberFromStorage();
                const params = new URLSearchParams({
                    bookingReference: booking.bookingReference,
                    nexusNumber
                });
                const response = await api.get(`slots/booking?${params}`);

                if (response.data && response.data.length > 0) {
                    const currentBooking = response.data[0];
                    if (!currentBooking.requisitionUploadStatus || !currentBooking.referringDoctorStatus) {
                        setQrBookingRef(booking.bookingReference);
                        setShowQRCode(true);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking requisition status:', error);
                // If API call fails, use cached data as fallback
                if (!booking.requisitionUploadStatus || !booking.referringDoctorStatus) {
                    setCheckInError((prev) => ({
                        ...prev,
                        [booking.id]: 'Requisition upload status check failed'
                    }));
                    return;
                }
            }

            setLoadingCheckInId(booking.id);
            try {
                // Call the new check-in API endpoint
                await api.get(`check-in/${booking.bookingReference}`);
                lastSuccessBooking = booking;
                // Clear error if check-in succeeds
                setCheckInError((prev) => ({ ...prev, [booking.id]: '' }));
            } catch (error) {
                let message = 'There was an error with the check-in';
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    message = error.response.data.message;
                } else if (error instanceof Error) {
                    message = error.message;
                }
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

    const handleCloseQRCode = () => {
        setShowQRCode(false);
        setQrBookingRef('');
        // Note: idle timer will automatically resume via useEffect when showQRCode changes to false
    };

    // Show QR code content if needed
    if (showQRCode && qrBookingRef) {
        return (
            <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
                <Header />
                <RequisitionQRCode
                    bookingRef={qrBookingRef}
                    onClose={handleCloseQRCode}
                />
            </div>
        );
    }

    // Show normal appointments content
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
                                    disabled={loadingCheckInId !== null}
                                    loading={loadingCheckInId === booking.id}
                                    error={checkInError[booking.id]}
                                    selected={isSelected}
                                    onCheckIn={!loadingCheckInId ? () => handleSelect(booking.id, false) : undefined}
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
                        onClick={() => router.push('/personal-details')}
                    >
                        Back
                    </Button>
                )}
                <Button
                    variant="secondary"
                    className="mr-4"
                    onClick={handleNeedHelpClick}
                >
                    Need help?
                </Button>
                <Button
                    className={`bg-gradient-to-r from-purple-600 to-pink-500 text-white transition-all ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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