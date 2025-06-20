"use client";
import { useEffect, useRef, useCallback } from "react";

export default function KioskIdleOverlay() {
    const timer = useRef<NodeJS.Timeout | null>(null);

    const resetIdleTimer = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            window.location.href = "/";
        }, 45000);
    }, []);

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