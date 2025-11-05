'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/Booking';
import Header from '@/app/components/Header';
import api from '../lib/axios';
import Button from '../components/Button';
import Input from '../components/Input';
import HelpModal from '../components/HelpModal';
import { useHelpModal } from '../hooks/useHelpModal';
import { useDispatch } from 'react-redux';
import { setBookings } from '../store/bookingSlice';
import { getNexusNumberFromStorage } from '../lib/config';

export default function CheckinPage() {
    const [referenceCode, setReferenceCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [realError, setRealError] = useState<string | null>(null);
    const [showErrorDetails, setShowErrorDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showKeyboardButtons, setShowKeyboardButtons] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const { isHelpModalOpen, openHelpModal, closeHelpModal } = useHelpModal();

    const handleReferenceCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReferenceCode(event.target.value);
        setErrorMessage(null); // Clear error message when input changes
        setRealError(null); // Clear real error when input changes
        setShowErrorDetails(false); // Hide error details when input changes
    };

    const handleInputFocus = () => {
        setShowKeyboardButtons(true);
    };

    const handleInputBlur = (event: React.FocusEvent) => {
        // Add a small delay to allow button clicks to register before hiding the buttons
        setTimeout(() => {
            // Check if the new focused element is a button or inside a button
            const target = event.relatedTarget as HTMLElement;
            if (!target || (!target.closest('button') && target.tagName !== 'BUTTON')) {
                setShowKeyboardButtons(false);
            }
        }, 150);
    };

    const handleNextClick = async () => {
        if (!referenceCode) {
            setErrorMessage('Please enter a booking reference code.');
            return;
        }

        setLoading(true);
        try {
            const nexusNumber = await getNexusNumberFromStorage();
            const params = new URLSearchParams({
                bookingReference: referenceCode,
                nexusNumber
            });

            const response = await api.get(`slots/booking?${params}`);

            if (!response.data || response.data.length === 0) {
                setErrorMessage('Sorry, we cannot find the booking reference. Please click "I don\'t have a code" to check in with your personal details');
                setLoading(false);
                return;
            }

            if (typeof response.data?.message === 'string') {
                setErrorMessage(response.data?.message || 'Sorry, we cannot find the booking reference. Please click "I don\'t have a code" to check in with your personal details');
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
                // Check if any booking is already checked in
                const checkedInBookings = todaysBookings.filter(booking => booking.checkedIn);
                if (checkedInBookings.length > 0) {
                    setErrorMessage('This booking is already checked in. Please call the receptionist for any further information.');
                    setLoading(false);
                    return;
                }

                dispatch(setBookings(todaysBookings));
                // Only pass bookingReference in the query
                const query = new URLSearchParams({
                    bookingReference: referenceCode
                }).toString();
                router.push(`/verify-identity?${query}`);
            } else {
                setErrorMessage('Sorry, we cannot find the booking reference. Please click "I don\'t have a code" to check in with your personal details');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setErrorMessage('We\'re experiencing some technical difficulties. Please call the receptionist for assistance with your check-in.');

            // Extract real error details
            let errorDetails = '';
            if (error && typeof error === 'object') {
                if ('response' in error && error.response) {
                    // Axios error with response
                    const axiosError = error as { response?: { data?: unknown; status?: number; statusText?: string } };
                    const status = axiosError.response?.status || 'Unknown';
                    const statusText = axiosError.response?.statusText || '';

                    if (axiosError.response?.data) {
                        const data = axiosError.response.data;

                        if (typeof data === 'string') {
                            errorDetails = data;
                        } else if (typeof data === 'object' && data !== null) {
                            // Try to extract structured error information
                            const dataObj = data as Record<string, unknown>;

                            // Check for nested error structure: { error: { errors: [...], message: ... } }
                            if ('error' in dataObj && typeof dataObj.error === 'object' && dataObj.error !== null) {
                                const errorObj = dataObj.error as Record<string, unknown>;

                                // Extract details from errors array if available
                                if ('errors' in errorObj && Array.isArray(errorObj.errors)) {
                                    const detailsList: string[] = [];
                                    errorObj.errors.forEach((err: unknown) => {
                                        if (typeof err === 'object' && err !== null) {
                                            const errObj = err as Record<string, unknown>;
                                            if ('details' in errObj && typeof errObj.details === 'string') {
                                                detailsList.push(errObj.details);
                                            }
                                        }
                                    });

                                    if (detailsList.length > 0) {
                                        errorDetails = detailsList.join('\n');
                                    } else if ('message' in errorObj && typeof errorObj.message === 'string') {
                                        errorDetails = errorObj.message;
                                    }
                                } else if ('message' in errorObj && typeof errorObj.message === 'string') {
                                    errorDetails = errorObj.message;
                                }
                            } else if ('message' in dataObj && typeof dataObj.message === 'string') {
                                // Direct message field
                                errorDetails = dataObj.message;
                            } else {
                                // Fallback to status only if we can't parse the structure
                                errorDetails = `Status: ${status} ${statusText}`;
                            }
                        }
                    } else {
                        errorDetails = `Status: ${status} ${statusText}`;
                    }
                } else if ('message' in error) {
                    // Standard Error object
                    errorDetails = (error as Error).message;
                } else {
                    errorDetails = JSON.stringify(error, null, 2);
                }
            } else if (typeof error === 'string') {
                errorDetails = error;
            } else {
                errorDetails = String(error);
            }

            setRealError(errorDetails);
            setShowErrorDetails(false); // Start with details hidden
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

                <div className='min-w-3/5 max-w-[50rem]'>
                    <div className="rounded-3xl p-12 py-24 flex flex-col items-start mb-8 card-shadow">
                        <div className="flex flex-col items-start w-[65%] min-w-[20rem]">
                            <label htmlFor="reference-code" className="text-3xl font-semibold mb-6">Reference Code</label>
                            <Input
                                type="number"
                                id="reference-code"
                                placeholder="############"
                                className="mb-6"
                                value={referenceCode}
                                onChange={handleReferenceCodeChange}
                                disabled={loading}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>
                        {errorMessage && (
                            <div className="text-red-500 text-left text-xl mt-2">
                                <p>{errorMessage}</p>
                                {realError && (
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowErrorDetails(!showErrorDetails)}
                                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 underline focus:outline-none"
                                        >
                                            <span>{showErrorDetails ? 'Hide' : 'Show'} error details</span>
                                            <svg
                                                className={`w-4 h-4 transition-transform ${showErrorDetails ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        {showErrorDetails && (
                                            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                                                <pre className="text-xs text-red-800 whitespace-pre-wrap break-words font-mono">
                                                    {realError}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-xl text-gray-600 text-left mt-4">
                            Find the reference code in your appointment
                            <span className="font-semibold"> email</span> or <span className="font-semibold">text</span>
                        </p>

                        <div className="w-full">
                            {loading && (
                                <div className="w-full flex items-center justify-center text-2xl text-gray-600 gap-4 mt-4">
                                    <span>Searching for your booking</span>
                                    <svg className="animate-spin h-7 w-7 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end w-full">
                        <Button
                            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl text-2xl font-semibold mb-8"
                            onClick={handleNoCodeClick}
                        >
                            I don&apos;t have a code
                        </Button>
                    </div>

                    {
                        showKeyboardButtons && (
                            <div className="w-full bg-white flex space-x-8 items-center justify-center py-4">
                                <Button variant="secondary" onClick={openHelpModal}>
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
                        )
                    }
                </div>
            </main>

            {/* Sticky footer button group - only show when keyboard buttons are not visible */}
            {!showKeyboardButtons && (
                <div className="w-full bg-white flex space-x-8 items-center justify-center py-4">
                    <Button variant="secondary" onClick={openHelpModal}>
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
            )}

            {/* Help Modal */}
            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={closeHelpModal}
            />
        </div>
    );
}
