"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(15);

    // Appointment details from query params
    const service = searchParams.get("service") || "";
    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";
    const clinic = searchParams.get("clinic") || "";
    const reference = searchParams.get("reference") || "";
    const operator = searchParams.get("operator") || "";

    useEffect(() => {
        if (countdown === 0) {
            router.push("/");
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, router]);

    // Format appointment time
    const apptTime = start && end
        ? `${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : "";

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
                    <div className="w-full max-w-2xl bg-white rounded-2xl p-8 mb-12">
                        <div className="text-left text-gray-500 text-2xl font-semibold mb-6">Appointment details:</div>
                        <div className="grid grid-cols-2 gap-8 text-left text-gray-700 text-xl">
                            <div>
                                <div className="font-semibold mb-1">{service}</div>
                                <div className="mb-1">{apptTime}</div>
                                <div className="mb-1">{clinic}</div>
                            </div>
                            <div>
                                <div className="mb-1">Reference Number : {reference}</div>
                                <div className="mb-1">Operator: {operator}</div>
                            </div>
                        </div>
                    </div>
                    <div className="text-xl text-purple-400 font-semibold mt-8">
                        Returning to home screen in {countdown} seconds...
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