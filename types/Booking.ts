export interface Booking {
    id: number;
    roomId: number;
    room: {
        clinic: {
            name: string;
            nexusNumber: string;
        };
    };
    patient: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        birthDate: string;
        Healthcard?: string;
    };
    externalBooking?: {
        externalBookingReference: string;
    };
    startTimeStamp: string;
    endTimeStamp: string;
    service: {
        service: string;
        type?: {
            type: string;
        };
    };
    operator: { name: string };
    bookingReference: string;
} 