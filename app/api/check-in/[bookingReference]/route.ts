import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bookingReference: string }> }
) {
    try {
        // Get the session token from the httpOnly cookie
        const sessionToken = request.cookies.get('session-token')?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'No session token found' },
                { status: 401 }
            );
        }

        const { bookingReference } = await params;

        // Make the API call to the external service with the session token
        const response = await axios.get(`${API_BASE_URL}check-in/${bookingReference}`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Cookie': `token=${sessionToken}`,
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        console.error('Error checking in:', error);

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data?: unknown } };

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

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}