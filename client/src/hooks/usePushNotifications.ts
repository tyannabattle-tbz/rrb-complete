/**
 * Push Notifications Hook
 * Manages service worker registration and real VAPID push notification subscriptions
 */
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  vapidConfigured: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    vapidConfigured: false,
  });

  const vapidQuery = trpc.pushNotifications.getVapidPublicKey.useQuery(undefined, {
    retry: false,
  });
  const configQuery = trpc.pushNotifications.isConfigured.useQuery(undefined, {
    retry: false,
  });
  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation();

  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
      vapidConfigured: configQuery.data?.configured || false,
    }));

    // Check existing subscription
    if (isSupported && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setState(prev => ({ ...prev, isSubscribed: !!sub }));
        });
      });
    }
  }, [configQuery.data]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;
    const vapidKey = vapidQuery.data?.publicKey;
    if (!vapidKey) return false;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subJson = subscription.toJSON();

      // Send subscription to server
      await subscribeMutation.mutateAsync({
        endpoint: subJson.endpoint!,
        keys: {
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
        },
        userAgent: navigator.userAgent,
      });

      setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      return true;
    } catch (err) {
      console.error('[PushNotifications] Subscribe failed:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, vapidQuery.data, subscribeMutation]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeMutation.mutateAsync({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      return true;
    } catch (err) {
      console.error('[PushNotifications] Unsubscribe failed:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [unsubscribeMutation]);

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
    subscribe,
    unsubscribe,
    sendLocalNotification,
  };
}
