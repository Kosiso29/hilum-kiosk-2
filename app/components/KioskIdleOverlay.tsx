"use client";
import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function KioskIdleOverlay() {
    const timer = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    const resetIdleTimer = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (pathname !== "/") {
                window.location.href = "/";
            }
        }, 45000);
    }, [pathname]);

    useEffect(() => {
        const events = ["mousedown", "mousemove", "keydown", "touchstart"];
        events.forEach(evt => document.addEventListener(evt, resetIdleTimer, true));
        resetIdleTimer();
        return () => {
            events.forEach(evt => document.removeEventListener(evt, resetIdleTimer, true));
            if (timer.current) clearTimeout(timer.current);
        };
    }, [resetIdleTimer]);

    return null;
} 