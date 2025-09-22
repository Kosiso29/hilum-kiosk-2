'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Button from '../components/Button';
import { useClinicData } from '../hooks/useClinicData';
import { Clinic } from '@/types/Clinic';
import { idleTimerManager } from '../lib/idleTimerManager';
import api from '../lib/axios';

export default function ClinicSelectionPage() {
    const [selectedClinicId, setSelectedClinicId] = useState<string>('');
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { saveClinicData } = useClinicData();

    const fetchClinics = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/clinics');

            if (response.data && response.data.clinics) {
                setClinics(response.data.clinics);
            } else {
                setError('No clinics found');
            }
        } catch (error: unknown) {
            console.error('Error fetching clinics:', error);

            // Handle 401 errors specifically
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status: number } };
                if (axiosError.response?.status === 401) {
                    setError('Session expired. Please login again.');
                    router.push('/login');
                    return;
                }
            }

            setError('Failed to load clinics. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchClinics();
    }, [fetchClinics]);

    // Pause idle timer on clinic selection page
    useEffect(() => {
        idleTimerManager.pause();

        // Cleanup: resume timer when component unmounts
        return () => {
            idleTimerManager.resume();
        };
    }, []);

    const handleClinicSelect = (clinicId: string) => {
        setSelectedClinicId(clinicId);
    };

    const handleContinue = async () => {
        if (!selectedClinicId) {
            setError('Please select a clinic to continue');
            return;
        }

        // Try to find clinic with flexible comparison (handle type mismatches)
        let selectedClinic = clinics.find(clinic => clinic.id === selectedClinicId);

        // If not found, try comparing as strings
        if (!selectedClinic) {
            selectedClinic = clinics.find(clinic => String(clinic.id) === String(selectedClinicId));
        }

        // If still not found, try comparing as numbers
        if (!selectedClinic) {
            selectedClinic = clinics.find(clinic => Number(clinic.id) === Number(selectedClinicId));
        }

        if (!selectedClinic) {
            setError('Selected clinic not found');
            return;
        }

        try {
            // Save clinic data to IndexedDB
            await saveClinicData(selectedClinic);

            // Navigate to the home page after clinic selection
            router.push('/');
        } catch (error) {
            console.error('Failed to save clinic data:', error);
            setError('Failed to save clinic selection. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />

            <main className="flex flex-col items-center text-center flex-grow w-full">
                <h1 className="text-4xl font-medium mb-4">Select Clinic</h1>
                <p className="text-3xl text-gray-600 mb-12">Choose the clinic location for this kiosk</p>

                <div className="rounded-3xl p-12 max-w-[60rem] flex flex-col items-center mb-8 card-shadow w-full">
                    <h2 className="text-2xl font-semibold mb-8">Available Clinics</h2>

                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-purple-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span className="text-2xl text-gray-600">Loading clinics...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-xl mb-8 text-center max-w-full">{error}</div>
                    )}

                    {!loading && !error && clinics.length > 0 && (
                        <div className="w-full max-w-2xl">
                            <div className="relative">
                                <select
                                    value={selectedClinicId}
                                    onChange={(e) => handleClinicSelect(e.target.value)}
                                    className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 bg-white appearance-none cursor-pointer"
                                >
                                    <option value="">Select a clinic...</option>
                                    {clinics.map((clinic: Clinic) => (
                                        <option key={clinic.id} value={clinic.id}>
                                            {clinic.name} - {clinic.address}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>

                            {selectedClinicId && (
                                <div className="mt-6 p-6 bg-purple-50 rounded-xl">
                                    <h3 className="text-xl font-semibold text-purple-800 mb-3">Selected Clinic Details</h3>
                                    {(() => {
                                        // Use the same flexible comparison logic as handleContinue
                                        let selectedClinic = clinics.find(clinic => clinic.id === selectedClinicId);

                                        // If not found, try comparing as strings
                                        if (!selectedClinic) {
                                            selectedClinic = clinics.find(clinic => String(clinic.id) === String(selectedClinicId));
                                        }

                                        // If still not found, try comparing as numbers
                                        if (!selectedClinic) {
                                            selectedClinic = clinics.find(clinic => Number(clinic.id) === Number(selectedClinicId));
                                        }

                                        return selectedClinic ? (
                                            <div className="text-left text-gray-700 space-y-2">
                                                <p><span className="font-semibold">Name:</span> {selectedClinic.name}</p>
                                                <p><span className="font-semibold">Address:</span> {selectedClinic.address}</p>
                                                <p><span className="font-semibold">Phone:</span> {selectedClinic.phone}</p>
                                                {selectedClinic.email && (
                                                    <p><span className="font-semibold">Email:</span> {selectedClinic.email}</p>
                                                )}
                                                <p><span className="font-semibold">Nexus Number:</span> {selectedClinic.nexusNumber}</p>
                                            </div>
                                        ) : (
                                            <div className="text-red-500">
                                                <p>Clinic details not found for selected ID: {selectedClinicId}</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !error && clinics.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-xl text-gray-600 mb-4">No clinics available</p>
                            <Button onClick={fetchClinics}>
                                Retry
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer buttons */}
            <div className="w-full bg-white flex justify-center max-w-2xl mx-auto items-center py-4">
                <Button
                    onClick={handleContinue}
                    disabled={!selectedClinicId || loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                >
                    Continue
                    <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </Button>
            </div>
        </div>
    );
}