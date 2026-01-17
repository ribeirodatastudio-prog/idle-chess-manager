import { useRef, useCallback, useEffect } from 'react';

export const useRepeatingPress = (action, { initialDelay = 400, minDelay = 50, acceleration = 0.85 } = {}) => {
    const timerRef = useRef(null);
    const delayRef = useRef(initialDelay);
    const isHoldingRef = useRef(false);
    const actionRef = useRef(action);
    const lastTouchEndTimeRef = useRef(0);

    // Keep action fresh
    useEffect(() => {
        actionRef.current = action;
    }, [action]);

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        isHoldingRef.current = false;
        delayRef.current = initialDelay;

        // Cleanup window listeners
        window.removeEventListener('mouseup', stop);
        window.removeEventListener('touchend', stopWrapper);
        window.removeEventListener('touchcancel', stopWrapper);
    }, [initialDelay]);

    // Wrapper to capture touch end time
    const stopWrapper = useCallback((e) => {
        if (e && (e.type === 'touchend' || e.type === 'touchcancel')) {
            lastTouchEndTimeRef.current = Date.now();
        }
        stop();
    }, [stop]);

    const start = useCallback(() => {
        // Execute immediately
        if (actionRef.current) actionRef.current();
        isHoldingRef.current = true;

        // Bind global stop listeners to catch release outside element or if disabled
        window.addEventListener('mouseup', stop);
        window.addEventListener('touchend', stopWrapper);
        window.addEventListener('touchcancel', stopWrapper);

        const recursiveTimer = () => {
            timerRef.current = setTimeout(() => {
                if (!isHoldingRef.current) return;

                if (actionRef.current) actionRef.current();

                // Accelerate
                delayRef.current = Math.max(minDelay, delayRef.current * acceleration);
                recursiveTimer();
            }, delayRef.current);
        };

        // Ensure clear before start
        if (timerRef.current) clearTimeout(timerRef.current);
        recursiveTimer();
    }, [minDelay, acceleration, stop, stopWrapper]);

    const onTouchStart = useCallback((e) => {
        // We don't prevent default to allow scrolling, but we must handle the ghost click/mousedown
        start();
    }, [start]);

    const onMouseDown = useCallback((e) => {
        // Prevent double fire if touch recently ended (500ms buffer)
        if (Date.now() - lastTouchEndTimeRef.current < 500) return;
        if (e.button !== 0) return; // Only left click
        start();
    }, [start]);

    const onTouchMove = useCallback(() => {
        // If user drags/scrolls, cancel the hold
        stop();
    }, [stop]);

    // Cleanup on unmount
    useEffect(() => stop, [stop]);

    return {
        onMouseDown,
        onTouchStart,
        onTouchMove
    };
};
