import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';

export async function GET(request: NextRequest) {
    try {
        // Get the current session token and refresh token from the httpOnly cookies
        const sessionToken = request.cookies.get('session-token')?.value;
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'No session token found' },
                { status: 401 }
            );
        }

        const refreshUrl = `${API_BASE_URL.replace('/api', '')}refreshKioskToken`;

        // Call the external API to refresh the kiosk tokens using the new kiosk-specific endpoint
        const response = await axios.get(refreshUrl, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Cookie': `token=${sessionToken}${refreshToken ? `; refreshToken=${refreshToken}` : ''}`,
                'Content-Type': 'application/json',
            },
        });

        const refreshedSessionData = response.data;

        // Create a response with the refreshed session data
        const nextResponse = NextResponse.json({
            success: true,
            session: refreshedSessionData,
        });

        // Update the session token cookie if a new token is provided - PERMANENT STORAGE
        if (refreshedSessionData.token) {
            nextResponse.cookies.set('session-token', refreshedSessionData.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365 * 10, // 10 years - effectively permanent
            });
        }

        // Update the refresh token cookie if a new refresh token is provided - PERMANENT STORAGE
        if (refreshedSessionData.refreshToken) {
            nextResponse.cookies.set('refreshToken', refreshedSessionData.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365 * 10, // 10 years - effectively permanent
            });
        }

        return nextResponse;
    } catch (error: unknown) {
        console.error('Token refresh error:', error);

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data?: unknown } };

            if (axiosError.response?.status === 401) {
                return NextResponse.json(
                    { error: 'Session expired - please login again' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: axiosError.response?.data || 'Failed to refresh tokens' },
                { status: axiosError.response?.status || 500 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}