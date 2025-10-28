import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';

export async function GET(request: NextRequest) {
    const timestamp = new Date().toISOString();

    // Extract query parameters for logging
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};

    try {
        // Get the session token from the httpOnly cookie
        const sessionToken = request.cookies.get('session-token')?.value;

        if (!sessionToken) {
            console.error('[SERVER] Booking lookup failed - no session token', {
                timestamp,
                endpoint: '/api/slots/booking',
                queryParams
            });
            return NextResponse.json(
                { error: 'No session token found' },
                { status: 401 }
            );
        }

        // Log successful request with all details
        console.log('[SERVER] Booking lookup request received', {
            timestamp,
            endpoint: '/api/slots/booking',
            queryParams,
            hasBookingReference: !!queryParams.bookingReference,
            hasPersonalDetails: !!(queryParams.firstName && queryParams.lastName && queryParams.patientDOB),
            nexusNumber: queryParams.nexusNumber || 'not provided',
            purpose: queryParams.purpose || 'not set'
        });

        // Get query parameters from the request
        const queryString = searchParams.toString();

        // Make the API call to the external service with the session token
        const response = await axios.get(`${API_BASE_URL}slots/booking?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Cookie': `token=${sessionToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Log successful response
        console.log('[SERVER] Booking lookup successful', {
            timestamp,
            endpoint: '/api/slots/booking',
            queryParams,
            bookingsReturned: Array.isArray(response.data) ? response.data.length : 0,
            hasResults: !!response.data && (Array.isArray(response.data) ? response.data.length > 0 : true),
            responseData: response.data
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        const errorTimestamp = new Date().toISOString();

        console.error('[SERVER] Booking lookup error', {
            timestamp: errorTimestamp,
            endpoint: '/api/slots/booking',
            queryParams,
            error
        });

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data?: unknown } };

            console.error('[SERVER] Booking lookup API error', {
                timestamp: errorTimestamp,
                endpoint: '/api/slots/booking',
                queryParams,
                httpStatus: axiosError.response?.status,
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

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}