import { useEffect, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipeGesture(handlers: SwipeHandlers, element?: HTMLElement | null) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const handleSwipe = useCallback(() => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    const minSwipeDistance = 50;

    console.log('Swipe detected:', { deltaX, deltaY, minSwipeDistance });

    // Horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && handlers.onSwipeRight) {
          console.log('Swipe right detected');
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          console.log('Swipe left detected');
          handlers.onSwipeLeft();
        }
      }
    } else {
      // Vertical swipes
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && handlers.onSwipeDown) {
          console.log('Swipe down detected');
          handlers.onSwipeDown();
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          console.log('Swipe up detected');
          handlers.onSwipeUp();
        }
      }
    }
  }, [handlers]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
    console.log('Touch start:', { x: touchStartX.current, y: touchStartY.current });
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
    console.log('Touch end:', { x: touchEndX.current, y: touchEndY.current });
    handleSwipe();
  }, [handleSwipe]);

  useEffect(() => {
    const target = element || document.documentElement;
    
    target.addEventListener('touchstart', handleTouchStart as EventListener, false);
    target.addEventListener('touchend', handleTouchEnd as EventListener, false);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart as EventListener);
      target.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [element, handleTouchStart, handleTouchEnd]);
}
