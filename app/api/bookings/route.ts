import { NextResponse } from 'next/server';
import { mockBookings } from '@/app/lib/mockBookings';
import { Booking } from '@/types/Booking';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const birthDate = searchParams.get('birthDate');
    const phoneNumber = searchParams.get('phoneNumber');
    const healthCard = searchParams.get('healthCard');
    const bookingReference = searchParams.get('bookingReference');

    // If bookingReference is provided, call the external API
    if (bookingReference) {
        try {
            const response = await fetch(
                `https://staging.telelink.wosler.ca/api/slots/booking?bookingReference=${bookingReference}&nexusNumber=6473603374`
            );

            if (!response.ok) {
                return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
            }

            const bookingData: Booking[] = await response.json();
            return NextResponse.json(bookingData);
        } catch (error) {
            console.error('Error fetching booking from external API:', error);
            return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
        }
    }

    // Fallback to mock data for other queries
    let filteredBookings = mockBookings;

    if (firstName && lastName) {
        filteredBookings = filteredBookings.filter(booking =>
            booking.patient.firstName.toLowerCase() === firstName.toLowerCase() &&
            booking.patient.lastName.toLowerCase() === lastName.toLowerCase()
        );
    }

    if (birthDate) {
        filteredBookings = filteredBookings.filter(booking =>
            new Date(booking.patient.birthDate).toISOString().split('T')[0] === birthDate
        );
    }

    if (phoneNumber) {
        filteredBookings = filteredBookings.filter(booking =>
            booking.patient.phoneNumber === phoneNumber
        );
    }

    if (healthCard) {
        filteredBookings = filteredBookings.filter(booking =>
            booking.patient.Healthcard === healthCard
        );
    }

    return NextResponse.json(filteredBookings);
} 