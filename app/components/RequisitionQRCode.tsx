"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import Button from "./Button";
import { API_BASE_URL } from "../lib/config";

interface RequisitionQRCodeProps {
    bookingRef: string;
    onClose: () => void;
}

export default function RequisitionQRCode({ bookingRef, onClose }: RequisitionQRCodeProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [qrCodeError, setQrCodeError] = useState<string>('');
    const [, setIsGenerating] = useState(true);

    // Remove /api from the base URL and construct the upload URL
    const baseUrl = API_BASE_URL.replace('/api/', '/').replace('/api', '');
    const uploadUrl = `${baseUrl}requisition/upload-requisition?bookingRef=${bookingRef}`;

    useEffect(() => {
        // Generate QR code
        QRCode.toDataURL(uploadUrl, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
            .then((dataUrl) => {
                setQrCodeDataUrl(dataUrl);
                setIsGenerating(false);
            })
            .catch((error) => {
                console.error('Error generating QR code:', error);
                setQrCodeError('Failed to generate QR code');
                setIsGenerating(false);
            });
    }, [uploadUrl]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Upload Requisition Required
                </h1>
                <p className="text-gray-600 text-lg">
                    Please scan the QR code below with your mobile device to upload your requisition form.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <div className="text-center">
                    {qrCodeDataUrl ? (
                        <div className="mb-6">
                            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                                <Image
                                    src={qrCodeDataUrl}
                                    alt="QR Code for requisition upload"
                                    width={256}
                                    height={256}
                                    className="mx-auto"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-3">Scan with your phone</p>
                        </div>
                    ) : qrCodeError ? (
                        <div className="mb-6">
                            <div className="w-64 h-64 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-red-200 rounded-lg mb-2 flex items-center justify-center">
                                        <span className="text-sm text-red-600">QR Error</span>
                                    </div>
                                    <p className="text-sm text-red-500">{qrCodeError}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                    <p className="text-sm text-gray-500">Generating QR Code...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="text-sm text-gray-500">
                            Booking Reference: <span className="font-semibold">{bookingRef}</span>
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <Button
                            onClick={onClose}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium"
                        >
                            Back to Appointments
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-medium text-blue-900 mb-3">Instructions:</h3>
                <ol className="text-sm text-blue-800 space-y-2 text-left">
                    <li>1. Use your mobile device to scan the QR code above</li>
                    <li>2. Upload your requisition form as required</li>
                    <li>3. Return to complete your check-in process</li>
                </ol>
            </div>
        </div>
    );
}