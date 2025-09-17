/**
 * Global Idle Timer Manager
 * Manages the kiosk idle timeout with the ability to pause during API calls
 * 
 * Features:
 * - Automatically pauses timeout during API calls (via axios interceptors)
 * - Resumes timeout after API calls complete
 * - Handles multiple concurrent API calls
 * - Provides manual pause/resume controls
 * - Configurable timeout duration and callbacks
 * 
 * Usage:
 * - Axios API calls are automatically handled via interceptors
 * - For fetch() calls, manually call startApiCall() before and endApiCall() after
 * - Use reset() to restart the timer on user activity
 * - Use pause()/resume() for manual control
 */

class IdleTimerManager {
    private timer: NodeJS.Timeout | null = null;
    private isPaused = false;
    private activeApiCalls = 0;
    private timeoutDuration = 45000; // 45 seconds
    private onTimeout: () => void;
    private onReset: () => void;

    constructor() {
        this.onTimeout = () => {
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                window.location.href = '/';
            }
        };
        this.onReset = () => {
            // Default reset handler - can be overridden
        };
    }

    /**
     * Set the timeout callback function
     */
    setOnTimeout(callback: () => void) {
        this.onTimeout = callback;
    }

    /**
     * Set the reset callback function
     */
    setOnReset(callback: () => void) {
        this.onReset = callback;
    }

    /**
     * Start the idle timer
     */
    start() {
        if (this.isPaused) {
            return; // Don't start if paused
        }

        this.clearTimer();
        this.timer = setTimeout(() => {
            this.onTimeout();
        }, this.timeoutDuration);
    }

    /**
     * Reset the idle timer (restart from beginning)
     */
    reset() {
        this.onReset();
        this.start();
    }

    /**
     * Clear the current timer
     */
    private clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    /**
     * Pause the timer (used during API calls)
     */
    pause() {
        this.isPaused = true;
        this.clearTimer();
    }

    /**
     * Resume the timer (used after API calls complete)
     */
    resume() {
        this.isPaused = false;
        this.start();
    }

    /**
     * Increment active API calls counter and pause timer if needed
     */
    startApiCall() {
        this.activeApiCalls++;
        if (this.activeApiCalls === 1) {
            this.pause();
        }
    }

    /**
     * Decrement active API calls counter and resume timer if all calls are done
     */
    endApiCall() {
        this.activeApiCalls = Math.max(0, this.activeApiCalls - 1);
        if (this.activeApiCalls === 0) {
            this.resume();
        }
    }

    /**
     * Check if timer is currently paused
     */
    isTimerPaused(): boolean {
        return this.isPaused;
    }

    /**
     * Get the number of active API calls
     */
    getActiveApiCalls(): number {
        return this.activeApiCalls;
    }

    /**
     * Set the timeout duration
     */
    setTimeoutDuration(duration: number) {
        this.timeoutDuration = duration;
    }

    /**
     * Clean up the timer
     */
    destroy() {
        this.clearTimer();
        this.isPaused = false;
        this.activeApiCalls = 0;
    }
}

// Create a singleton instance
export const idleTimerManager = new IdleTimerManager();

// Export the class for testing purposes
export { IdleTimerManager };