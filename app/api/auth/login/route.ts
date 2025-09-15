import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Call the external API for authentication
        const response = await axios.post(`${API_BASE_URL.replace('/api', '')}auth/api/login`, {
            email,
            password,
        });

        const sessionData = response.data;

        // Create a response with the session data
        const nextResponse = NextResponse.json({
            success: true,
            session: sessionData,
        });

        // Set session token as httpOnly cookie for security
        if (sessionData.token) {
            nextResponse.cookies.set('session-token', sessionData.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
        }

        return nextResponse;
    } catch (error: unknown) {
        console.error('Login error:', error);

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}