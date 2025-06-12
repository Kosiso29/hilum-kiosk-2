'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", weekday: "long" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute z-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay to darken the video slightly if needed, adjust opacity */}
      <div className="absolute z-10 w-full h-full bg-black opacity-20"></div>

      {/* All existing content will be above the video, adjust z-index */}
      <div className="z-20 w-full h-full flex flex-col items-center justify-center">
        {/* Top Left - Time and Date */}
        <div className="absolute top-8 left-8 text-white text-3xl font-bold flex items-center">
          <span className="mr-2">{formatTime(currentDateTime)}</span>
          <span className="h-8 w-px bg-white mx-2"></span>
          <span className="text-xl font-normal">{formatDate(currentDateTime)}</span>
        </div>

        {/* Top Right - Logo */}
        <div className="absolute top-8 right-8">
          <Image
            src="/icons/icon-192x192.png" // Assuming this is the logo you want to use
            alt="Wosler Diagnostics Logo"
            width={40}
            height={40}
            priority
          />
          <span className="ml-2 text-white text-base font-bold">Wosler</span>
          <div className="ml-2 text-white text-xs">DIAGNOSTICS</div>
        </div>

        {/* Center Content */}
        <main className="flex flex-col items-center text-center mt-20">
          <h1 className="text-white text-6xl font-bold mb-4">
            Welcome to
            <br />
            Wosler Diagnostics
          </h1>
          <p className="text-white text-lg font-normal opacity-80 mb-12">
            Checking in for your appointment or
            <br />
            registering as walk-in?
          </p>

          {/* Tap anywhere to begin button */}
          <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xl font-medium px-12 py-4 rounded-full shadow-lg transform transition-transform duration-200 active:scale-95">
            Tap anywhere to begin
          </button>
        </main>
      </div>
    </div>
  );
}
