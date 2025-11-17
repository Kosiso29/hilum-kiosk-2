import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';
import { logKioskInteraction, logKioskError } from '@/app/lib/kioskLogger';

export async function POST(request: NextRequest) {
    const timestamp = new Date().toISOString();

    try {
        // Parse the request body
        const body = await request.json();
        const { nfcToken, clinicNexusNumber, kioskId } = body;

        // Prepare data entered for logging
        const dataEntered = {
            timestamp,
            checkInMethod: 'NFC Token',
            clinicNexusNumber,
            kioskId,
            nfcTokenPresent: !!nfcToken
        };

        // Validate required fields
        if (!nfcToken || !clinicNexusNumber) {
            logKioskError('NFC check-in failed - missing required fields', {
                error: 'Missing required fields',
                nfcTokenPresent: !!nfcToken,
                clinicNexusNumberPresent: !!clinicNexusNumber
            }, {
                timestamp,
                endpoint: '/api/mobile/checkin/nfc'
            });
            return NextResponse.json(
                { message: 'NFC token and clinic nexus number are required' },
                { status: 400 }
            );
        }

        const fullEndpoint = `${API_BASE_URL.replace('/api', '')}mobile/checkin/nfc`;

        // Make the API call to the external service
        const response = await axios.post(fullEndpoint, {
            nfcToken,
            clinicNexusNumber,
            kioskId
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Response is an array of bookings (same format as bookingDetails endpoint)
        // Log the complete interaction
        logKioskInteraction({
            dataEntered,
            endpoint: fullEndpoint,
            requestParams: {
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    nfcToken: '[REDACTED]',
                    clinicNexusNumber,
                    kioskId
                }
            },
            response: response.data
        });

        // Return the array directly (same format as bookingDetails)
        return NextResponse.json(response.data);
    } catch (error: unknown) {
        const errorTimestamp = new Date().toISOString();

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data?: unknown; statusText?: string } };

            logKioskError('NFC check-in API error', error, {
                timestamp: errorTimestamp,
                endpoint: `${API_BASE_URL.replace('/api', '')}mobile/checkin/nfc`,
                httpStatus: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                errorData: axiosError.response?.data
            });

            return NextResponse.json(
                { error: axiosError.response?.data || 'NFC check-in failed' },
                { status: axiosError.response?.status || 500 }
            );
        }

        logKioskError('NFC check-in error', error, {
            timestamp: errorTimestamp,
            endpoint: '/api/mobile/checkin/nfc'
        });

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
