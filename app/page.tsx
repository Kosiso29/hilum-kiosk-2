'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import Button from './components/Button';
import { useClinicData } from './hooks/useClinicData';
import { useClinicPhone } from './hooks/useClinicPhone';

export default function Home() {
  const router = useRouter();
  const { isDataAvailable, loading } = useClinicData();
  const { clinicPhone, hasClinicData } = useClinicPhone();
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    const checkStorage = async () => {
      if (!loading) {
        setHasCheckedStorage(true);
      }
    };
    checkStorage();
  }, [loading]);

  const handleTapToBegin = async () => {
    if (!hasCheckedStorage) {
      return; // Wait for storage check to complete
    }

    const hasClinicData = await isDataAvailable();

    // Check if a clinic is selected, if not redirect to logout
    if (!hasClinicData) {
      window.location.href = '/logout';
    } else {
      router.push('/checkin');
    }
  };

  return (
    <div>
      {/* Header Component */}
      <div className="fixed z-50 w-full p-8">
        <Header />
      </div>
      <div className="relative bg-[#f2f3f5] min-h-screen flex flex-col items-center justify-center overflow-hidden" onClick={handleTapToBegin}>
        <div className="bg-white absolute z-0 top-0 right-0 translate-y-[-10%] translate-x-[30%] rotate-z-12 h-[60vmax] w-max">
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
              Check in your appointment
            </p>
          </main>
          {/* Button centered at the bottom */}
          <div className="absolute bottom-10 flex flex-col items-center w-full mt-auto mb-12">
            <div className="homepage-gradient-border-wrapper mb-10">
              <Button
                className="homepage-gradient-btn text-xl font-medium px-12 py-4 rounded-full transform transition-transform duration-200 active:scale-95"
                onClick={handleTapToBegin}
              >
                Tap anywhere to Check In
              </Button>
            </div>
            <p className="text-sm text-gray-500 text-center max-w-md">
              For walk-in or any other questions, please call the receptionist{hasClinicData && (
                <> or contact us at <span className="font-medium">{clinicPhone}</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
