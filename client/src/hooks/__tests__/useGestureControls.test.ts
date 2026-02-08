import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGestureControls } from '../useGestureControls';

describe('useGestureControls', () => {
  let mockHandlers: any;

  beforeEach(() => {
    mockHandlers = {
      onSwipeLeft: vi.fn(),
      onSwipeRight: vi.fn(),
      onSwipeUp: vi.fn(),
      onSwipeDown: vi.fn(),
      onDoubleTap: vi.fn(),
      onLongPress: vi.fn(),
    };
  });

  it('should detect swipe left gesture', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as any],
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 30, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);
    });

    expect(mockHandlers.onSwipeLeft).toHaveBeenCalled();
  });

  it('should detect swipe right gesture', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 30, clientY: 100 } as any],
        changedTouches: [{ clientX: 30, clientY: 100 } as any],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);
    });

    expect(mockHandlers.onSwipeRight).toHaveBeenCalled();
  });

  it('should detect swipe up gesture', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as any],
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 30 } as any],
      });
      
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);
    });

    expect(mockHandlers.onSwipeUp).toHaveBeenCalled();
  });

  it('should detect swipe down gesture', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 30 } as any],
        changedTouches: [{ clientX: 100, clientY: 30 } as any],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);
    });

    expect(mockHandlers.onSwipeDown).toHaveBeenCalled();
  });

  it('should detect double tap gesture', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    act(() => {
      const touchStart1 = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as any],
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      const touchEnd1 = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart1);
      element.dispatchEvent(touchEnd1);
      
      // Simulate second tap within 300ms
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      
      const touchStart2 = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as any],
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      const touchEnd2 = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart2);
      element.dispatchEvent(touchEnd2);
      
      vi.useRealTimers();
    });

    expect(mockHandlers.onDoubleTap).toHaveBeenCalled();
  });

  it('should detect long press gesture', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    vi.useFakeTimers();
    
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as any],
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart);
      vi.advanceTimersByTime(500);
    });

    expect(mockHandlers.onLongPress).toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('should cancel long press on touch move', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    vi.useFakeTimers();
    
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as any],
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart);
      vi.advanceTimersByTime(200);
      
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 150 } as any],
        changedTouches: [{ clientX: 150, clientY: 150 } as any],
      });
      
      element.dispatchEvent(touchMove);
      vi.advanceTimersByTime(300);
    });

    expect(mockHandlers.onLongPress).not.toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('should ignore small movements as swipes', () => {
    const { result } = renderHook(() => useGestureControls(mockHandlers));
    const element = document.createElement('div');
    
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as any],
        changedTouches: [{ clientX: 100, clientY: 100 } as any],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 110, clientY: 100 } as any],
      });
      
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);
    });

    expect(mockHandlers.onSwipeLeft).not.toHaveBeenCalled();
    expect(mockHandlers.onSwipeRight).not.toHaveBeenCalled();
  });
});
