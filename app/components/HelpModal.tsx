'use client';

import { useClinicPhone } from '../hooks/useClinicPhone';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
    const { clinicPhone, hasClinicData } = useClinicPhone();

    if (!isOpen) return null;

    return (
        <div className="fixed bg-transparent inset-0 z-50 overflow-y-auto">
            <div className="flex bg-transparent min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-white bg-opacity-20 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative transform overflow-hidden rounded-2xl bg-white px-8 pb-8 pt-8 text-left shadow-lg transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-10">
                    {/* Close button */}
                    <div className="absolute right-0 top-0 pr-4 pt-4">
                        <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-6 sm:mt-0 sm:text-left">
                            <h3 className="text-3xl font-medium leading-6 text-gray-900">
                                Need Help?
                            </h3>
                            <div className="mt-4">
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    For help, please call the receptionist{hasClinicData && (
                                        <> or contact our technical support team. <br /> <span className="font-semibold text-purple-600">Support: {clinicPhone}</span></>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="px-12 py-4 rounded-3xl text-2xl font-semibold transition-all flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:ml-3 sm:w-auto w-full"
                            onClick={onClose}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}