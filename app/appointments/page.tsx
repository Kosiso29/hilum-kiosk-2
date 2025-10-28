'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import AppointmentCard from '../components/AppointmentCard';
import RequisitionQRCode from '../components/RequisitionQRCode';
import api from '../lib/axios';
import Button from '../components/Button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setBookings } from '../store/bookingSlice';
import { getNexusNumberFromStorage } from '../lib/config';
import { idleTimerManager } from '../lib/idleTimerManager';
import axios from 'axios';
import HelpModal from '../components/HelpModal';
import { useHelpModal } from '../hooks/useHelpModal';
import QRKeepAlivePopup from '../components/QRKeepAlivePopup';

export default function AppointmentsPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const bookings = useSelector((state: RootState) => state.booking.bookings);
    const [error, setError] = useState<string | null>(null);
    const [loadingCheckInId, setLoadingCheckInId] = useState<number | null>(null);
    const [checkInError, setCheckInError] = useState<{ [id: number]: string }>({});
    const [selected, setSelected] = useState<number[]>([]);
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrBookingRef, setQrBookingRef] = useState<string>('');
    const [showKeepAlivePopup, setShowKeepAlivePopup] = useState(false);
    const [currentOperation, setCurrentOperation] = useState<string>('');
    const { isHelpModalOpen, openHelpModal, closeHelpModal } = useHelpModal();

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

    // Manage 2-minute keep-alive popup for QR code
    useEffect(() => {
        let keepAliveInterval: NodeJS.Timeout | null = null;

        if (showQRCode && !showKeepAlivePopup) {
            // Start 2-minute interval for keep-alive popup
            keepAliveInterval = setInterval(() => {
                setShowKeepAlivePopup(true);
            }, 2 * 60 * 1000); // 2 minutes
        }

        return () => {
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
            }
        };
    }, [showQRCode, showKeepAlivePopup]);

    const handleSelect = (id: number, disabled: boolean, checkedIn: boolean) => {
        if (disabled || checkedIn) return;
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

        // First, check all selected appointments for requisition and referring doctor status
        setCurrentOperation('Checking requisition and referring doctor status...');

        // Sort selected bookings by time (earliest first)
        const selectedBookings = selected
            .map(id => bookings.find(b => b.id === id))
            .filter(booking => booking !== undefined)
            .slice() // Create a copy before sorting
            .sort((a, b) => new Date(a!.startTimeStamp).getTime() - new Date(b!.startTimeStamp).getTime());

        for (const booking of selectedBookings) {
            if (!booking) continue;

            setLoadingCheckInId(booking.id);

            // Check if requisition and referring doctor status are available
            if (!booking.requisitionUploadStatus || !booking.referringDoctorStatus) {
                // Missing status - fetch from API to get latest data
                try {
                    const nexusNumber = await getNexusNumberFromStorage();
                    const params = new URLSearchParams({
                        bookingReference: booking.bookingReference,
                        nexusNumber,
                        purpose: 'requisition_refdoc_check'
                    });
                    const response = await api.get(`slots/booking?${params}`);

                    if (response.data && response.data.length > 0) {
                        const currentBooking = response.data[0];

                        // Update the existing booking with the new data
                        const updatedBooking = {
                            ...booking,
                            requisitionUploadStatus: currentBooking.requisitionUploadStatus,
                            referringDoctorStatus: currentBooking.referringDoctorStatus
                        };

                        // Update the booking in Redux store
                        const currentBookings = bookings.slice(); // Create a copy to avoid mutation
                        const updatedBookings = currentBookings.map(b =>
                            b.id === booking.id ? updatedBooking : b
                        );
                        dispatch(setBookings(updatedBookings));

                        // If still missing, show QR code and return
                        if (!currentBooking.requisitionUploadStatus || !currentBooking.referringDoctorStatus) {
                            setCurrentOperation('');
                            setQrBookingRef(booking.bookingReference);
                            setShowQRCode(true);
                            setLoadingCheckInId(null);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Error checking requisition status:', error);
                    setCurrentOperation('');
                    setCheckInError((prev) => ({
                        ...prev,
                        [booking.id]: 'Requisition upload status check failed. Please call the receptionist for assistance with your check-in.'
                    }));
                    setLoadingCheckInId(null);
                    return;
                }
            }
        }

        // All requisition and referring doctor checks passed, proceed with check-ins
        setCurrentOperation('Checking in appointments...');
        let allSucceeded = true;
        let lastSuccessBooking = null;

        // Use the same sorted bookings for check-in process
        for (const booking of selectedBookings) {
            if (!booking) continue;

            setLoadingCheckInId(booking.id);

            try {
                // Call the new check-in API endpoint
                await api.get(`check-in/${booking.bookingReference}`);
                lastSuccessBooking = booking;

                // Update the booking's checkedIn status to true in Redux store
                const currentBookings = bookings.slice(); // Create a copy to avoid mutation
                const updatedBookings = currentBookings.map(b =>
                    b.id === booking.id ? { ...b, checkedIn: true } : b
                );
                dispatch(setBookings(updatedBookings));

                // Clear error if check-in succeeds
                setCheckInError((prev) => ({ ...prev, [booking.id]: '' }));
            } catch (error) {
                let message = 'There was an error with the check-in. Please call the receptionist for assistance with your check-in.';
                if (axios.isAxiosError(error) && error.response?.data) {
                    const errorData = error.response.data;
                    // Check for nested error structure from our API route
                    if (errorData.error && errorData.error.message) {
                        message = errorData.error.message;
                    } else if (errorData.message) {
                        message = errorData.message;
                    } else if (typeof errorData === 'string') {
                        message = errorData;
                    }
                } else if (error instanceof Error) {
                    message = error.message;
                }
                console.log('Check-in error details:', error);
                setCheckInError((prev) => ({ ...prev, [booking.id]: message }));
                allSucceeded = false;
            } finally {
                setLoadingCheckInId(null);
            }
        }
        if (allSucceeded && lastSuccessBooking) {
            // Get all successfully checked-in bookings
            // Since we just updated them during the check-in process, use selectedBookings directly
            console.log('🔍 selectedBookings for success page:', selectedBookings);
            console.log('🔍 current bookings state:', bookings.map(b => ({ id: b.id, checkedIn: b.checkedIn })));

            const successfulBookings = selectedBookings.filter(booking => booking !== undefined);

            // Create URL params with all successful bookings
            const params = new URLSearchParams();
            successfulBookings.forEach((booking, index) => {
                if (booking) {
                    params.append(`booking_${index}_service`, booking.service.service);
                    params.append(`booking_${index}_start`, booking.startTimeStamp);
                    params.append(`booking_${index}_end`, booking.endTimeStamp);
                    params.append(`booking_${index}_clinic`, booking.room.clinic.name);
                    params.append(`booking_${index}_reference`, booking.bookingReference);
                    params.append(`booking_${index}_operator`, booking.operator?.name || '');
                }
            });
            params.append('bookingCount', successfulBookings.length.toString());

            setCurrentOperation('');
            router.push(`/appointments/success?${params.toString()}`);
        } else if (!allSucceeded) {
            setCurrentOperation('');
            setError('Some check-ins failed. Please review the errors above.');
        }
    };

    const handleNeedHelpClick = () => {
        openHelpModal();
    };

    const handleCloseQRCode = () => {
        setShowQRCode(false);
        setQrBookingRef('');
        setShowKeepAlivePopup(false);
        // Note: idle timer will automatically resume via useEffect when showQRCode changes to false
    };

    const handleKeepAliveStay = () => {
        setShowKeepAlivePopup(false);
        // The 2-minute interval will restart automatically via useEffect
    };

    const handleKeepAliveLeave = () => {
        // Go back to home screen
        router.push('/');
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
                {showKeepAlivePopup && (
                    <QRKeepAlivePopup
                        onStay={handleKeepAliveStay}
                        onLeave={handleKeepAliveLeave}
                    />
                )}
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

                    {/* Current Operation Status */}
                    {currentOperation && (
                        <div className="text-lg text-purple-600 font-medium mt-4">
                            {currentOperation}
                        </div>
                    )}
                </div>

                {bookings.length > 0 && (
                    <div className="flex flex-col items-center w-full">
                        {bookings
                            .slice() // Create a copy before sorting
                            .sort((a, b) => new Date(a.startTimeStamp).getTime() - new Date(b.startTimeStamp).getTime())
                            .map((booking) => {
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
                                        checkedIn={booking.checkedIn}
                                        onCheckIn={!loadingCheckInId ? () => handleSelect(booking.id, false, booking.checkedIn) : undefined}
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

            {/* Help Modal */}
            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={closeHelpModal}
            />
        </div>
    );
}