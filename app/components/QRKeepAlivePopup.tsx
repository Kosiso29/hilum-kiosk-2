/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import Button from "./Button";

interface QRKeepAlivePopupProps {
    onStay: () => void;
    onLeave: () => void;
    timeoutDuration?: number; // in milliseconds, default 2 minutes
}

export default function QRKeepAlivePopup({
    onStay,
    onLeave,
    timeoutDuration = 120000
}: QRKeepAlivePopupProps) {
    const [timeLeft, setTimeLeft] = useState(Math.ceil(timeoutDuration / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onLeave(); // Auto timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onLeave]);

    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Are you still there?
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Please confirm you're still there
                    </p>
                    <p className="text-sm text-gray-500">
                        Auto timeout in: <span className="font-bold text-red-600">{timeLeft}s</span>
                    </p>
                </div>

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={onStay}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    >
                        Yes, I'm here
                    </Button>
                    <Button
                        onClick={onLeave}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3"
                    >
                        No, go back
                    </Button>
                </div>
            </div>
        </div>
    );
}