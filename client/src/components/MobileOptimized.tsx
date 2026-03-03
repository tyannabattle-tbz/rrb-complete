import React, { useState, useEffect } from 'react';

/**
 * Mobile-optimized touch target button
 * Ensures minimum 44x44px touch target for accessibility
 */
export const TouchButton = ({ 
  children, 
  onClick, 
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    onClick={onClick}
    className={`min-h-[44px] min-w-[44px] px-4 py-3 rounded-lg transition-all active:scale-95 ${className}`}
    {...props}
  >
    {children}
  </button>
);

/**
 * Mobile navigation with hamburger menu
 */
export const MobileNav = ({ 
  items 
}: { 
  items: Array<{ label: string; href: string }> 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="md:hidden fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-bold">QUMUS</h1>
        <TouchButton
          onClick={() => setIsOpen(!isOpen)}
          className="bg-transparent hover:bg-accent/10"
          aria-label="Toggle menu"
        >
          ☰
        </TouchButton>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute top-16 right-4 bg-background border border-border rounded-lg shadow-lg p-2 w-48">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-3 hover:bg-accent/10 rounded text-foreground min-h-[44px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

/**
 * Install PWA prompt
 */
export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-accent text-accent-foreground rounded-lg p-4 shadow-lg z-40 md:max-w-sm md:left-auto md:right-4">
      <p className="text-sm font-medium mb-3">Install QUMUS on your device</p>
      <div className="flex gap-2">
        <TouchButton
          onClick={handleInstall}
          className="flex-1 bg-accent-foreground text-accent text-sm"
        >
          Install
        </TouchButton>
        <TouchButton
          onClick={() => setShowPrompt(false)}
          className="flex-1 bg-accent/20 text-accent-foreground text-sm"
        >
          Later
        </TouchButton>
      </div>
    </div>
  );
};

/**
 * Haptic feedback utility
 */
export const useHaptic = () => {
  return {
    light: () => navigator.vibrate?.(10),
    medium: () => navigator.vibrate?.(20),
    heavy: () => navigator.vibrate?.(50),
    pattern: (pattern: number[]) => navigator.vibrate?.(pattern),
  };
};

/**
 * Touch-optimized input with larger tap targets
 */
export const MobileInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`min-h-[44px] px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
    {...props}
  />
));

MobileInput.displayName = 'MobileInput';

/**
 * Responsive grid that adapts to screen size
 */
export const ResponsiveGrid = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 } 
}: { 
  children: React.ReactNode;
  columns?: { mobile: number; tablet: number; desktop: number };
}) => (
  <div
    className={`grid gap-4 
      grid-cols-${columns.mobile} 
      md:grid-cols-${columns.tablet} 
      lg:grid-cols-${columns.desktop}`}
  >
    {children}
  </div>
);

/**
 * Push notification handler
 */
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  return { permission, requestPermission, sendNotification };
};

/**
 * Biometric authentication
 */
export const useBiometricAuth = () => {
  const isSupported = () => {
    return typeof window !== 'undefined' && 'PublicKeyCredential' in window;
  };

  const authenticate = async () => {
    if (!isSupported()) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'preferred',
        },
      } as any);

      return !!assertion;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  };

  return { isSupported, authenticate };
};
