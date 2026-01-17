import { useRef, useCallback } from 'react';

export const useLongPress = (onLongPress, onClick, { delay = 500 } = {}) => {
    const timeout = useRef();
    const isLongPress = useRef(false);

    const start = useCallback((event) => {
        isLongPress.current = false;
        timeout.current = setTimeout(() => {
            isLongPress.current = true;
            if (onLongPress) {
                onLongPress(event);
            }
        }, delay);
    }, [onLongPress, delay]);

    const clear = useCallback((event, shouldTriggerClick = true) => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }

        // If it wasn't a long press, and we should trigger click (i.e. not leaving element)
        if (shouldTriggerClick && !isLongPress.current && onClick) {
            onClick(event);
        }
    }, [onClick]);

    return {
        onMouseDown: start,
        onTouchStart: start,
        onMouseUp: (e) => clear(e, true),
        onMouseLeave: (e) => clear(e, false),
        onTouchEnd: (e) => {
            // Prevent default to stop phantom clicks if necessary,
            // but usually returning handlers is enough if the button doesn't have onClick
            clear(e, true);
        },
        onTouchMove: (e) => clear(e, false) // Cancel on scroll/move
    };
};
