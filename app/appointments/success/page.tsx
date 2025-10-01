"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";

interface BookingData {
    service: string;
    start: string;
    end: string;
    clinic: string;
    reference: string;
    operator: string;
}

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(15);

    // Get booking count
    const bookingCount = parseInt(searchParams.get("bookingCount") || "1");

    // Get all booking details from query params
    const bookings: BookingData[] = [];
    for (let i = 0; i < bookingCount; i++) {
        bookings.push({
            service: searchParams.get(`booking_${i}_service`) || "",
            start: searchParams.get(`booking_${i}_start`) || "",
            end: searchParams.get(`booking_${i}_end`) || "",
            clinic: searchParams.get(`booking_${i}_clinic`) || "",
            reference: searchParams.get(`booking_${i}_reference`) || "",
            operator: searchParams.get(`booking_${i}_operator`) || "",
        });
    }

    useEffect(() => {
        if (countdown === 0) {
            router.push("/");
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, router]);

    // Format appointment time helper function
    const formatAppointmentTime = (start: string, end: string) => {
        return start && end
            ? `${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : "";
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />
            <main className="flex flex-col items-center text-center flex-grow w-full mt-8">
                {/* Time, date, logo are in Header */}
                <div className="flex flex-col items-center w-full mt-8">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 flex items-center justify-center mb-8">
                        {/* Placeholder for icon/image */}
                        <svg width="80" height="80" fill="none" viewBox="0 0 24 24"><rect width="100%" height="100%" rx="16" fill="#E9D5FF" /><path d="M7 13l3 3 7-7" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <h1 className="text-5xl font-bold mb-4">You&apos;re Checked In!</h1>
                    <p className="text-2xl text-gray-400 mb-12">Please have a seat and wait to be called</p>
                    <div className="text-xl text-purple-400 font-semibold mt-4 mb-4">
                        Returning to home screen in {countdown} seconds...
                    </div>

                    <div className="w-full max-w-4xl space-y-6 mb-12">
                        <div className="text-left text-gray-500 text-2xl font-semibold">
                            {bookings.length === 1 ? 'Appointment details:' : 'Appointment details:'}
                        </div>

                        {bookings.map((booking, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                {bookings.length > 1 && (
                                    <div className="text-lg font-semibold text-purple-600 mb-4">
                                        Appointment {index + 1}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-6 text-left text-gray-700 text-xl">
                                    <div>
                                        <div className="font-semibold mb-2">{booking.service}</div>
                                        <div className="mb-2">{formatAppointmentTime(booking.start, booking.end)}</div>
                                        <div className="mb-2">{booking.clinic}</div>
                                    </div>
                                    <div>
                                        <div className="mb-2">Reference: {booking.reference}</div>
                                        <div className="mb-2">Operator: {booking.operator}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-2xl">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
} 