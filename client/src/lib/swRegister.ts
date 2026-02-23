/**
 * Service Worker Registration with Cache Update Handling
 * Automatically reloads the page when a new build is detected
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Register] Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW Register] Service Worker registered:', registration);

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'CACHE_UPDATED') {
        console.log('[SW Register] Cache updated, new build:', event.data.buildVersion);
        
        // Show notification to user
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('App Updated', {
            body: 'A new version of the app is available. Reloading...',
            icon: '/icon-192.png',
          });
        }

        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    return registration;
  } catch (error) {
    console.error('[SW Register] Service Worker registration failed:', error);
  }
}

/**
 * Request notification permission for cache update notifications
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[SW Register] Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    return;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[SW Register] Notification permission granted');
      }
    } catch (error) {
      console.error('[SW Register] Failed to request notification permission:', error);
    }
  }
}

/**
 * Unregister all service workers (useful for debugging)
 */
export async function unregisterServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
    console.log('[SW Register] Service Worker unregistered');
  }
}
