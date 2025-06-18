import { NextResponse } from 'next/server';
import { mockBookings } from '@/app/lib/mockBookings';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const birthDate = searchParams.get('birthDate');
    const phoneNumber = searchParams.get('phoneNumber');
    const healthCard = searchParams.get('healthCard');

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