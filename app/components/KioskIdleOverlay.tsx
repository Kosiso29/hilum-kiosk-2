"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { idleTimerManager } from "@/app/lib/idleTimerManager";

export default function KioskIdleOverlay() {
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);

    // Keep pathname ref updated
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    useEffect(() => {
        // Create stable callback functions that don't depend on pathname
        const resetIdleTimer = () => {
            // Don't set idle timer on login page
            if (pathnameRef.current === "/login") {
                idleTimerManager.pause();
                return;
            }

            // Reset the idle timer (this will start it if not paused)
            idleTimerManager.reset();
        };

        const handleTimeout = () => {
            if (pathnameRef.current !== "/") {
                window.location.href = "/";
            }
        };

        // Configure the idle timer manager
        idleTimerManager.setOnTimeout(handleTimeout);
        idleTimerManager.setOnReset(() => {
            // Optional: Add any reset logic here
        });

        // Set up event listeners for user activity
        const events = ["mousedown", "mousemove", "keydown", "touchstart"];
        events.forEach(evt => document.addEventListener(evt, resetIdleTimer, true));

        // Initialize the timer
        resetIdleTimer();

        // Cleanup
        return () => {
            events.forEach(evt => document.removeEventListener(evt, resetIdleTimer, true));
            idleTimerManager.destroy();
        };
    }, []); // Empty dependency array - only run once

    return null;
} 