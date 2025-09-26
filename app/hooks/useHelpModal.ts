import { useState } from 'react';

/**
 * Custom hook to manage help modal state
 * Returns modal state and handlers for opening/closing
 */
export const useHelpModal = () => {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const openHelpModal = () => {
        setIsHelpModalOpen(true);
    };

    const closeHelpModal = () => {
        setIsHelpModalOpen(false);
    };

    return {
        isHelpModalOpen,
        openHelpModal,
        closeHelpModal,
    };
};