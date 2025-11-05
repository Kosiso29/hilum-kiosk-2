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
import HelpModal from '../components/HelpModal';
import { useHelpModal } from '../hooks/useHelpModal';

export default function PersonalDetailsPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [healthcareNumber, setHealthcareNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [realError, setRealError] = useState<string | null>(null);
    const [showErrorDetails, setShowErrorDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showKeyboardButtons, setShowKeyboardButtons] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const { isHelpModalOpen, openHelpModal, closeHelpModal } = useHelpModal();

    const handleBackClick = () => {
        router.back();
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
                setError('No bookings found for the provided details for today.');
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
            console.error('Error fetching bookings:', error);

            // Extract real error details
            let errorDetails = '';
            if (error && typeof error === 'object') {
                if ('response' in error && error.response) {
                    // Axios error with response
                    const axiosError = error as { response?: { data?: unknown; status?: number; statusText?: string } };

                    // Check if it's a 404 error
                    if (axiosError.response?.status === 404) {
                        setError('No matching booking was found. Please check your details and make sure you entered them correctly.');
                        setRealError(null); // No need to show technical details for 404
                        setShowErrorDetails(false);
                        setLoading(false);
                        return;
                    }

                    setError('We\'re experiencing some technical difficulties. Please call the receptionist for assistance with your check-in.');
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
                    setError('We\'re experiencing some technical difficulties. Please call the receptionist for assistance with your check-in.');
                    errorDetails = (error as Error).message;
                } else {
                    setError('We\'re experiencing some technical difficulties. Please call the receptionist for assistance with your check-in.');
                    errorDetails = JSON.stringify(error, null, 2);
                }
            } else if (typeof error === 'string') {
                setError('We\'re experiencing some technical difficulties. Please call the receptionist for assistance with your check-in.');
                errorDetails = error;
            } else {
                setError('We\'re experiencing some technical difficulties. Please call the receptionist for assistance with your check-in.');
                errorDetails = String(error);
            }

            setRealError(errorDetails);
            setShowErrorDetails(false); // Start with details hidden
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
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    setError(null);
                                    setRealError(null);
                                    setShowErrorDetails(false);
                                }}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>
                        <div>
                            <label htmlFor="last-name" className="text-xl font-semibold mb-4 block">Last name <span className="text-purple-600">*</span></label>
                            <Input
                                type="text"
                                id="last-name"
                                placeholder="Enter last name ..."
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    setError(null);
                                    setRealError(null);
                                    setShowErrorDetails(false);
                                }}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 w-full mb-8">
                        <div>
                            <label htmlFor="date-of-birth" className="text-xl font-semibold mb-4 block">Date-of-Birth <span className="text-purple-600">*</span></label>
                            <DatePicker
                                date={dateOfBirth}
                                setDate={(date) => {
                                    setDateOfBirth(date);
                                    setError(null);
                                    setRealError(null);
                                    setShowErrorDetails(false);
                                }}
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
                                onChange={(e) => {
                                    setHealthcareNumber(e.target.value);
                                    setError(null);
                                    setRealError(null);
                                    setShowErrorDetails(false);
                                }}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
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
                            <div className="text-red-500 text-xl mt-2 text-center max-w-full">
                                <p>{error}</p>
                                {realError && (
                                    <div className="mt-4 text-left">
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
                    </div>
                </div>

                {
                    showKeyboardButtons && (
                        <div className="w-full bg-white flex space-x-8 items-center justify-center py-4">
                            <Button
                                onClick={handleBackClick}
                                disabled={loading}
                            >
                                Back
                            </Button>
                            <Button variant="secondary" onClick={openHelpModal} disabled={loading}>
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
            </main>
            {/* Sticky footer button group - only show when keyboard buttons are not visible */}
            {!showKeyboardButtons && (
                <div className="w-full bg-white flex space-x-8 items-center justify-center py-4">
                    <Button
                        onClick={handleBackClick}
                        disabled={loading}
                    >
                        Back
                    </Button>
                    <Button variant="secondary" onClick={openHelpModal} disabled={loading}>
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