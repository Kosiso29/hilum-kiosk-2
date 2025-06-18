import React from 'react';

interface AppointmentCardProps {
    service: string;
    time: string;
    disabled?: boolean;
    onCheckIn?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ service, time, disabled, onCheckIn }) => {
    return (
        <div className="flex items-center bg-white rounded-2xl shadow-md px-10 py-8 mb-6 w-[80%] min-h-[100px] max-w-4xl">
            <div className="w-16 h-16 bg-gray-200 rounded-xl mr-8" />
            <div className="flex-1 text-left">
                <div className="text-2xl font-bold mb-1">{service}</div>
                <div className="text-lg text-gray-500 font-medium">{time}</div>
            </div>
            <button
                className={`ml-4 px-10 py-3 rounded-full border-2 text-xl font-semibold transition-all ${disabled
                    ? 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
                    : 'border-purple-400 text-purple-500 bg-white hover:bg-purple-50'}`}
                disabled={disabled}
                onClick={onCheckIn}
            >
                Check-In
            </button>
        </div>
    );
};

export default AppointmentCard; 