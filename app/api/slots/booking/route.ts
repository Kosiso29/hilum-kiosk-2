import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';
import { logKioskInteraction, logKioskError } from '@/app/lib/kioskLogger';

export async function GET(request: NextRequest) {
    const timestamp = new Date().toISOString();

    // Extract query parameters for logging
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        queryParams[key] = value;
    });

    // Prepare data entered for logging
    const dataEntered: Record<string, unknown> = {
        timestamp,
        searchType: queryParams.bookingReference ? 'Booking Reference' : 'Personal Details',
        ...queryParams
    };

    try {
        // Get the session token from the httpOnly cookie
        const sessionToken = request.cookies.get('session-token')?.value;

        if (!sessionToken) {
            logKioskError('Booking lookup failed - no session token', {
                error: 'No session token found'
            }, {
                timestamp,
                endpoint: '/api/slots/booking',
                queryParams
            });
            return NextResponse.json(
                { error: 'No session token found' },
                { status: 401 }
            );
        }

        // Get query parameters from the request
        const queryString = searchParams.toString();
        const fullEndpoint = `${API_BASE_URL}slots/booking?${queryString}`;

        // Make the API call to the external service with the session token
        const response = await axios.get(fullEndpoint, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Cookie': `token=${sessionToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Log the complete interaction
        logKioskInteraction({
            dataEntered,
            endpoint: fullEndpoint,
            requestParams: {
                headers: {
                    'Authorization': 'Bearer [TOKEN]',
                    'Cookie': 'token=[TOKEN]',
                    'Content-Type': 'application/json',
                },
                queryParams
            },
            response: response.data
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        const errorTimestamp = new Date().toISOString();

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data?: unknown; statusText?: string } };

            logKioskError('Booking lookup API error', error, {
                timestamp: errorTimestamp,
                endpoint: `${API_BASE_URL}slots/booking`,
                queryParams,
                httpStatus: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                errorData: axiosError.response?.data
            });

            if (axiosError.response?.status === 401) {
                return NextResponse.json(
                    { error: 'Unauthorized - invalid session' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: axiosError.response?.data || 'Failed to fetch booking data' },
                { status: axiosError.response?.status || 500 }
            );
        }

        logKioskError('Booking lookup error', error, {
            timestamp: errorTimestamp,
            endpoint: '/api/slots/booking',
            queryParams
        });

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}