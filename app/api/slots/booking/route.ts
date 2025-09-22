import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';

export async function GET(request: NextRequest) {
    try {
        // Get the session token from the httpOnly cookie
        const sessionToken = request.cookies.get('session-token')?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'No session token found' },
                { status: 401 }
            );
        }

        // Get query parameters from the request
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();

        // Make the API call to the external service with the session token
        const response = await axios.get(`${API_BASE_URL}slots/booking?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Cookie': `token=${sessionToken}`,
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        console.error('Error fetching booking data:', error);

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data?: unknown } };

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