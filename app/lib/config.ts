// Configuration file for environment variables and app constants

export const config = {
    // Nexus Number for clinic identification - will be set from selected clinic
    NEXUS_NUMBER: process.env.NEXT_PUBLIC_NEXUS_NUMBER || '6473603374',

    // API Configuration
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging.telelink.wosler.ca/api/',

    // App Configuration
    APP_NAME: 'Hilum Kiosk',
    APP_VERSION: '1.0.0',
} as const;

// Export individual values for convenience
export const { API_BASE_URL, APP_NAME, APP_VERSION } = config;

// Import clinic storage for getting nexus number from IndexedDB
import { clinicStorage } from './clinicStorage';

// Export NEXUS_NUMBER as a function that can be called with the selected clinic
export const getNexusNumber = (selectedClinic?: { nexusNumber: string } | null) => {
    return selectedClinic?.nexusNumber || config.NEXUS_NUMBER;
};

// Async function to get nexus number from IndexedDB
export const getNexusNumberFromStorage = async (): Promise<string> => {
    try {
        const nexusNumber = await clinicStorage.getNexusNumber();
        return nexusNumber || config.NEXUS_NUMBER;
    } catch (error) {
        console.error('Failed to get nexus number from storage:', error);
        return config.NEXUS_NUMBER;
    }
};

// Async function to get phone number from IndexedDB
export const getPhoneNumberFromStorage = async (): Promise<string | null> => {
    try {
        return await clinicStorage.getPhoneNumber();
    } catch (error) {
        console.error('Failed to get phone number from storage:', error);
        return null;
    }
}; 