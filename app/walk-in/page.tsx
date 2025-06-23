"use client";

import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";
import Button from '../components/Button';

export default function WalkInPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
            <Header />
            <main className="flex flex-col items-start flex-grow w-full max-w-5xl mx-auto mt-8">
                <h1 className="text-5xl font-bold mb-8 mt-8">Walk-In</h1>
                <div className="flex flex-row items-center w-full gap-12">
                    {/* Illustration */}
                    <div className="flex-1 flex justify-center">
                        {/* You can replace this SVG with a local asset if you have one */}
                        <svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="160" cy="220" rx="140" ry="20" fill="#F3F4F6" />
                            <rect x="60" y="80" width="200" height="90" rx="8" fill="#E0E7FF" />
                            <rect x="120" y="110" width="80" height="30" rx="6" fill="#fff" />
                            <circle cx="160" cy="125" r="12" fill="#F87171" />
                            <rect x="155" y="120" width="10" height="10" rx="2" fill="#fff" />
                            {/* Worker left */}
                            <circle cx="90" cy="70" r="14" fill="#FBBF24" />
                            <rect x="82" y="84" width="16" height="32" rx="6" fill="#60A5FA" />
                            {/* Worker right */}
                            <circle cx="230" cy="140" r="14" fill="#FBBF24" />
                            <rect x="222" y="154" width="16" height="32" rx="6" fill="#60A5FA" />
                        </svg>
                    </div>
                    {/* Text Content */}
                    <div className="flex-1 flex flex-col justify-center items-start">
                        <h2 className="text-4xl font-extrabold mb-2">Under Construction</h2>
                        <p className="text-lg text-gray-400 mb-8 max-w-md">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                        </p>
                        <Button
                            className="px-10 py-3 bg-indigo-500 text-white rounded-full text-xl font-semibold shadow-md hover:bg-indigo-600 transition"
                            onClick={() => router.back()}
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
