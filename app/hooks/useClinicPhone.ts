import { useState, useEffect } from 'react';
import { clinicStorage } from '../lib/clinicStorage';

/**
 * Custom hook to get the clinic phone number from storage
 * Returns the clinic phone number with a fallback to default
 */
export const useClinicPhone = () => {
    const [clinicPhone, setClinicPhone] = useState<string>('+1 (647) 691-6053'); // Default fallback
    const [loading, setLoading] = useState(true);
    const [hasClinicData, setHasClinicData] = useState(false);

    useEffect(() => {
        const fetchClinicPhone = async () => {
            try {
                const phoneNumber = await clinicStorage.getPhoneNumber();
                if (phoneNumber) {
                    setClinicPhone(phoneNumber);
                    setHasClinicData(true);
                } else {
                    setHasClinicData(false);
                }
            } catch (error) {
                console.error('Failed to get clinic phone number:', error);
                setHasClinicData(false);
                // Keep default fallback phone number
            } finally {
                setLoading(false);
            }
        };
        fetchClinicPhone();
    }, []);

    return { clinicPhone, loading, hasClinicData };
};