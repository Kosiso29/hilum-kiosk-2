/**
 * Custom hook for managing clinic data from IndexedDB
 */

import { useState, useEffect, useCallback } from 'react';
import { clinicStorage, EncryptedClinicData } from '../lib/clinicStorage';
import { Clinic } from '@/types/Clinic';

export function useClinicData() {
    const [clinicData, setClinicData] = useState<EncryptedClinicData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load clinic data from IndexedDB
    const loadClinicData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await clinicStorage.getClinicData();
            setClinicData(data);
        } catch (err) {
            console.error('Failed to load clinic data:', err);
            setError('Failed to load clinic data');
            setClinicData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save clinic data to IndexedDB
    const saveClinicData = useCallback(async (clinic: Clinic) => {
        try {
            setError(null);
            const encryptedData: EncryptedClinicData = {
                id: clinic.id,
                name: clinic.name,
                address: clinic.address,
                phone: clinic.phone,
                nexusNumber: clinic.nexusNumber,
                faxNumber: clinic.faxNumber,
                transferCallNumber: clinic.transferCallNumber,
                direction: clinic.direction,
                email: clinic.email,
                timezone: clinic.timezone,
                timezoneOffset: clinic.timezoneOffset,
                accountId: clinic.accountId,
                account: clinic.account,
                timings: clinic.timings
            };

            await clinicStorage.saveClinicData(encryptedData);
            setClinicData(encryptedData);
        } catch (err) {
            console.error('Failed to save clinic data:', err);
            setError('Failed to save clinic data');
            throw err;
        }
    }, []);

    // Clear clinic data from IndexedDB
    const clearClinicData = useCallback(async () => {
        try {
            setError(null);
            await clinicStorage.clearClinicData();
            setClinicData(null);
        } catch (err) {
            console.error('Failed to clear clinic data:', err);
            setError('Failed to clear clinic data');
        }
    }, []);

    // Get nexus number for API calls
    const getNexusNumber = useCallback(async (): Promise<string | null> => {
        try {
            return await clinicStorage.getNexusNumber();
        } catch (err) {
            console.error('Failed to get nexus number:', err);
            return null;
        }
    }, []);

    // Get phone number
    const getPhoneNumber = useCallback(async (): Promise<string | null> => {
        try {
            return await clinicStorage.getPhoneNumber();
        } catch (err) {
            console.error('Failed to get phone number:', err);
            return null;
        }
    }, []);

    // Check if data is available
    const isDataAvailable = useCallback(async (): Promise<boolean> => {
        try {
            return await clinicStorage.isDataAvailable();
        } catch (err) {
            console.error('Failed to check data availability:', err);
            return false;
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        loadClinicData();
    }, [loadClinicData]);

    return {
        clinicData,
        loading,
        error,
        saveClinicData,
        clearClinicData,
        loadClinicData,
        getNexusNumber,
        getPhoneNumber,
        isDataAvailable
    };
}