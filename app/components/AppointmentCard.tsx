import React from 'react';

interface AppointmentCardProps {
    service: string;
    time: string;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    selected?: boolean;
    onCheckIn?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ service, time, disabled, loading, error, selected, onCheckIn }) => {
    return (
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-md px-10 py-8 mb-6 w-[80%] min-h-[100px] max-w-4xl">
            <div className="flex items-center w-full">
                <div className="w-16 h-16 bg-gray-200 rounded-xl mr-8" />
                <div className="flex-1 text-left">
                    <div className="text-2xl font-bold mb-1">{service}</div>
                    <div className="text-lg text-gray-500 font-medium">{time}</div>
                </div>
                <button
                    className={`ml-4 px-10 py-3 rounded-full border-2 text-xl font-semibold transition-all w-[12rem]
                        ${disabled || loading
                            ? 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
                            : selected
                                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-none'
                                : 'border-purple-400 text-purple-500 bg-white hover:bg-purple-50'}
                    `}
                    disabled={disabled || loading}
                    onClick={onCheckIn}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        </span>
                    ) : disabled ? 'Disabled' : selected ? 'Selected' : 'Check-In'}
                </button>
            </div>
            {error && (
                <div className="w-full text-left text-red-500 text-base mt-4">
                    {error}
                </div>
            )}
        </div>
    );
};

export default AppointmentCard; 