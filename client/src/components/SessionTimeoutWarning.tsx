import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SessionTimeoutWarningProps {
  warningTimeMs?: number; // Time before session expires to show warning (default: 2 minutes)
  sessionDurationMs?: number; // Total session duration (default: 15 minutes)
}

export function SessionTimeoutWarning({
  warningTimeMs = 2 * 60 * 1000, // 2 minutes
  sessionDurationMs = 15 * 60 * 1000, // 15 minutes
}: SessionTimeoutWarningProps) {
  const { user, refresh } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivityTime(Date.now());
      setShowWarning(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Monitor session timeout
  useEffect(() => {
    if (!user) return;

    const checkSessionTimeout = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      const timeUntilExpiry = sessionDurationMs - timeSinceLastActivity;

      // Show warning when time remaining is less than warningTimeMs
      if (timeUntilExpiry <= warningTimeMs && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeRemaining(Math.ceil(timeUntilExpiry / 1000)); // Convert to seconds
      }

      // Auto-logout when session expires
      if (timeUntilExpiry <= 0) {
        setShowWarning(false);
        // Session expired - user will be automatically logged out by useAuth hook
      }
    }, 1000); // Check every second

    return () => clearInterval(checkSessionTimeout);
  }, [user, lastActivityTime, sessionDurationMs, warningTimeMs]);

  const handleExtendSession = async () => {
    setLastActivityTime(Date.now());
    setShowWarning(false);
    // Refresh auth to extend session
    await refresh();
  };

  if (!user) return null;

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <DialogTitle>Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription>
            Your session will expire in {timeRemaining} seconds due to inactivity.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-4 px-4 bg-amber-50 rounded-lg">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">
            Time remaining: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </span>
        </div>

        <p className="text-sm text-gray-600">
          Click "Extend Session" to continue working, or your session will automatically end.
        </p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowWarning(false)}
          >
            Logout
          </Button>
          <Button
            onClick={handleExtendSession}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Extend Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
