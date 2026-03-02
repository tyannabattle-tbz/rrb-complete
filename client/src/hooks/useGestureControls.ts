import { useEffect, useRef, useState } from 'react';

export interface GestureEvent {
  type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'double-tap' | 'long-press';
  x: number;
  y: number;
  deltaX?: number;
  deltaY?: number;
}

export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

const SWIPE_THRESHOLD = 50;
const LONG_PRESS_DURATION = 500;
const DOUBLE_TAP_DELAY = 300;

export function useGestureControls(handlers: GestureHandlers) {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTapRef = useRef(0);
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();
  const [isLongPressing, setIsLongPressing] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Set up long press detection
      longPressTimeoutRef.current = setTimeout(() => {
        if (handlers.onLongPress) {
          setIsLongPressing(true);
          handlers.onLongPress();
        }
      }, LONG_PRESS_DURATION);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if user moves
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        setIsLongPressing(false);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timeout
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        setIsLongPressing(false);
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Skip if it was a long press
      if (isLongPressing) return;

      // Detect swipes
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        }
      } else if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp();
        }
      }

      // Detect double tap
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY && handlers.onDoubleTap) {
        handlers.onDoubleTap();
        lastTapRef.current = 0; // Reset to prevent triple tap
      } else {
        lastTapRef.current = now;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [handlers, isLongPressing]);

  return elementRef;
}
