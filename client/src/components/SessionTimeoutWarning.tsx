import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionTimeoutWarningProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onExtend?: () => void;
  onLogout?: () => void;
}

export function SessionTimeoutWarning({
  timeoutMinutes = 15,
  warningMinutes = 2,
  onExtend,
  onLogout,
}: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const warningThreshold = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const timeoutDuration = timeoutMinutes * 60 * 1000;

    const warningTimer = setTimeout(() => {
      setShowWarning(true);
      setIsVisible(true);
      setSecondsRemaining(warningMinutes * 60);
    }, warningThreshold);

    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          if (onLogout) onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const logoutTimer = setTimeout(() => {
      setShowWarning(false);
      setIsVisible(false);
      if (onLogout) onLogout();
    }, timeoutDuration);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);
    };
  }, [timeoutMinutes, warningMinutes, onLogout]);

  const handleExtend = () => {
    setShowWarning(false);
    setIsVisible(false);
    if (onExtend) onExtend();
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Session Expiring Soon</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Your session will expire due to inactivity. You will be logged out automatically.
        </p>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-3xl font-bold text-orange-600 font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
          <p className="text-center text-sm text-orange-700 mt-2">Time remaining</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleExtend}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
          >
            Extend Session
          </Button>
          <Button
            onClick={() => {
              setShowWarning(false);
              setIsVisible(false);
              if (onLogout) onLogout();
            }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg"
          >
            Logout Now
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Click "Extend Session" to continue working
        </p>
      </div>
    </div>
  );
}
