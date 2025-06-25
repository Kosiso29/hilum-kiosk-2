'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Button from './components/Button';

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
      <div className="relative bg-[#f2f3f5] min-h-screen flex flex-col items-center justify-center overflow-hidden" onClick={handleTapToBegin}>
        <div className="bg-white absolute z-0 top-0 right-0 translate-y-[-10%] translate-x-[30%] rotate-z-12 h-[60vh] w-max">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-auto"
          >
            <source src="/background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        {/* Overlay to darken the video slightly if needed, adjust opacity */}
        {/* <div className="absolute z-10 w-full h-full bg-black opacity-20"></div> */}

        {/* All existing content will be above the video, adjust z-index */}
        <div className="z-20 w-full h-full flex flex-col justify-between">
          {/* Top-aligned, left-aligned welcome content */}
          <main className="flex flex-col justify-center h-screen items-start text-left p-8">
            <h2 className="text-4xl text-black mb-2">Welcome to</h2>
            <h1 className="text-7xl font-medium text-black leading-tight tracking-tight">
              Wosler<br />Diagnostics
            </h1>
            <p className="text-xl text-gray-500 mt-8">
              Checking in for your appointment or<br />registering as walk-in?
            </p>
          </main>
          {/* Button centered at the bottom */}
          <div className="absolute bottom-20 flex justify-center w-full mt-auto mb-12">
            <div className="homepage-gradient-border-wrapper">
              <Button
                className="homepage-gradient-btn text-xl font-medium px-12 py-4 rounded-full transform transition-transform duration-200 active:scale-95"
                onClick={handleTapToBegin}
              >
                Tap anywhere to begin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
