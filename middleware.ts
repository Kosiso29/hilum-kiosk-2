import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/manifest.json', '/sw.js', '/workbox-4754cb34.js'];

// Define routes that require authentication but not clinic selection
const authenticatedRoutes = ['/clinic-selection'];

// Define API routes that don't require authentication
const publicApiRoutes = ['/api/auth/login', '/api/auth/logout'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow all static assets and public folder files
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/public/') ||
        pathname.includes('.') && (
            pathname.endsWith('.png') ||
            pathname.endsWith('.jpg') ||
            pathname.endsWith('.jpeg') ||
            pathname.endsWith('.gif') ||
            pathname.endsWith('.svg') ||
            pathname.endsWith('.ico') ||
            pathname.endsWith('.css') ||
            pathname.endsWith('.js') ||
            pathname.endsWith('.woff') ||
            pathname.endsWith('.woff2') ||
            pathname.endsWith('.ttf') ||
            pathname.endsWith('.eot') ||
            pathname.endsWith('.mp4') ||
            pathname.endsWith('.webp')
        )
    ) {
        return NextResponse.next();
    }

    // Check if it's a public route
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Check if it's an authenticated route (requires login but not clinic selection)
    if (authenticatedRoutes.includes(pathname)) {
        const sessionToken = request.cookies.get('session-token')?.value;
        if (!sessionToken) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // Check if it's a public API route
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for session token
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
        // Redirect to login page if no session token
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If session token exists, allow the request to proceed
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
