/**
 * Push Notifications Hook
 * Manages service worker registration and push notification permissions
 */
import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
  });

  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;
    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch {
      return false;
    }
  }, [state.isSupported]);

  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (state.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    sendLocalNotification,
  };
}
