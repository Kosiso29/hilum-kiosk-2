// Configuration file for environment variables and app constants

export const config = {
    // Nexus Number for clinic identification
    NEXUS_NUMBER: process.env.NEXT_PUBLIC_NEXUS_NUMBER || '6473603374',

    // API Configuration
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging.telelink.wosler.ca/api/',

    // App Configuration
    APP_NAME: 'Hilum Kiosk',
    APP_VERSION: '1.0.0',
} as const;

// Export individual values for convenience
export const { NEXUS_NUMBER, API_BASE_URL, APP_NAME, APP_VERSION } = config; 