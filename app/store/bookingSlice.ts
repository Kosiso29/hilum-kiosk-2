import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '@/types/Booking';

interface BookingState {
    bookings: Booking[];
}

const initialState: BookingState = {
    bookings: [],
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setBookings(state, action: PayloadAction<Booking[]>) {
            state.bookings = action.payload;
        },
        clearBookings(state) {
            state.bookings = [];
        },
    },
});

export const { setBookings, clearBookings } = bookingSlice.actions;
export default bookingSlice.reducer; 