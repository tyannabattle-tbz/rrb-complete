/**
 * Fallback Status Indicator
 * Shows when system is in fallback mode (degraded status)
 * Displays which channels are affected and estimated recovery time
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FallbackStatus {
  isActive: boolean;
  affectedSystems: string[];
  estimatedRecoveryTime: number; // milliseconds
  message: string;
}

export function FallbackStatusIndicator() {
  const [fallbackStatus, setFallbackStatus] = useState<FallbackStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [recoveryCountdown, setRecoveryCountdown] = useState(0);

  useEffect(() => {
    // Poll fallback status
    const interval = setInterval(async () => {
      try {
        // Check system health
        const systemHealthy = true; // Placeholder - would call actual health check
        
        if (!systemHealthy) {
          setFallbackStatus({
            isActive: true,
            affectedSystems: ['Ty OS', 'QUMUS'],
            estimatedRecoveryTime: 30000, // 30 seconds
            message: 'System is in fallback mode. Some channels may be unavailable.',
          });
        } else {
          setFallbackStatus(null);
        }
      } catch (error) {
        console.error('Failed to check fallback status:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer for recovery
  useEffect(() => {
    if (!fallbackStatus?.isActive) return;

    const timer = setInterval(() => {
      setRecoveryCountdown(prev => {
        if (prev <= 1000) {
          setFallbackStatus(null);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fallbackStatus?.isActive]);

  if (!fallbackStatus?.isActive || isDismissed) {
    return null;
  }

  const recoverySeconds = Math.ceil(recoveryCountdown / 1000);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b-2 border-yellow-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900">
              {fallbackStatus.message}
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              Affected: {fallbackStatus.affectedSystems.join(', ')} • 
              Recovery in {recoverySeconds}s
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
