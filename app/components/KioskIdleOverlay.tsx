"use client";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { idleTimerManager } from "@/app/lib/idleTimerManager";

export default function KioskIdleOverlay() {
    const pathname = usePathname();

    const resetIdleTimer = useCallback(() => {
        // Don't set idle timer on login page
        if (pathname === "/login") {
            idleTimerManager.pause();
            return;
        }

        // Reset the idle timer (this will start it if not paused)
        idleTimerManager.reset();
    }, [pathname]);

    useEffect(() => {
        // Configure the idle timer manager
        idleTimerManager.setOnTimeout(() => {
            if (pathname !== "/") {
                window.location.href = "/";
            }
        });

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
    }, [resetIdleTimer, pathname]);

    return null;
} 