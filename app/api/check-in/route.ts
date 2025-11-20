import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';
import { logKioskInteraction, logKioskError } from '@/app/lib/kioskLogger';

export async function GET(request: NextRequest) {
    const timestamp = new Date().toISOString();

    try {
        // Get the session token from the httpOnly cookie
        const sessionToken = request.cookies.get('session-token')?.value;

        if (!sessionToken) {
            logKioskError('Check-in failed - no session token', {
                error: 'No session token found'
            }, {
                timestamp,
                endpoint: '/api/check-in'
            });
            return NextResponse.json(
                { error: 'No session token found' },
                { status: 401 }
            );
        }

        // Get bookingRefs from query parameter
        const bookingRefs = request.nextUrl.searchParams.get('bookingRefs');

        if (!bookingRefs) {
            return NextResponse.json(
                { error: 'bookingRefs query parameter is required' },
                { status: 400 }
            );
        }

        const fullEndpoint = `${API_BASE_URL}check-in?bookingRefs=${bookingRefs}`;

        // Prepare data entered for logging
        const dataEntered = {
            timestamp,
            bookingRefs,
            action: 'Check-in request'
        };

        // Make the API call to the external service with the session token
        const response = await axios.get(fullEndpoint, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Cookie': `token=${sessionToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Log the complete check-in interaction
        logKioskInteraction({
            dataEntered,
            endpoint: fullEndpoint,
            requestParams: {
                headers: {
                    'Authorization': 'Bearer [TOKEN]',
                    'Cookie': 'token=[TOKEN]',
                    'Content-Type': 'application/json',
                },
                bookingRefs
            },
            response: response.data,
            checkInRequest: {
                endpoint: fullEndpoint,
                bookingRefs
            },
            checkInResponse: response.data
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        const errorTimestamp = new Date().toISOString();

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data?: unknown; statusText?: string } };

            const bookingRefs = request.nextUrl.searchParams.get('bookingRefs');
            const endpoint = `${API_BASE_URL}check-in?bookingRefs=${bookingRefs}`;

            logKioskError('Check-in API error', error, {
                timestamp: errorTimestamp,
                endpoint,
                bookingRefs,
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

            // Pass through the original error response from the external API
            const originalError = axiosError.response?.data;
            const statusCode = axiosError.response?.status || 500;

            // If the original error has a message, use it; otherwise use a generic message
            if (originalError && typeof originalError === 'object' && 'message' in originalError) {
                return NextResponse.json(
                    { error: originalError },
                    { status: statusCode }
                );
            }

            return NextResponse.json(
                { error: originalError || 'Failed to check in' },
                { status: statusCode }
            );
        }

        logKioskError('Check-in error', error, {
            timestamp: errorTimestamp,
            endpoint: '/api/check-in'
        });

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
