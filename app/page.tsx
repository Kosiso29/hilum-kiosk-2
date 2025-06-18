'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function Home() {
  const router = useRouter();

  const handleTapToBegin = () => {
    router.push('/entry');
  };

  return (
    <div>
      {/* Header Component */}
      <div className="fixed z-50 w-full p-8">
        <Header />
      </div>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden" onClick={handleTapToBegin}>
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
            <button
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xl font-medium px-12 py-4 rounded-full shadow-lg transform transition-transform duration-200 active:scale-95"
              onClick={handleTapToBegin}
            >
              Tap anywhere to begin
            </button>
          </main>
        </div>
      </div>
    </div>
  );
}
