/**
 * Listener Reconnection Widget
 * Persistent connection status indicator with auto-reconnect functionality
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, CheckCircle, Wifi, WifiOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ReconnectionWidgetProps {
  isConnected: boolean;
  streamId?: string;
  onReconnect?: () => Promise<void>;
  autoReconnect?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface ConnectionState {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'failed';
  retryCount: number;
  nextRetryIn: number;
  lastError?: string;
  connectionHistory: Array<{
    timestamp: number;
    status: 'connected' | 'disconnected';
  }>;
}

export function ListenerReconnectionWidget({
  isConnected,
  streamId = 'default-stream',
  onReconnect,
  autoReconnect = true,
  position = 'bottom-right',
}: ReconnectionWidgetProps) {
  const [state, setState] = useState<ConnectionState>({
    status: isConnected ? 'connected' : 'disconnected',
    retryCount: 0,
    nextRetryIn: 0,
    connectionHistory: [],
  });

  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Handle auto-reconnect countdown
  useEffect(() => {
    if (state.status !== 'reconnecting' || state.nextRetryIn <= 0) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        nextRetryIn: Math.max(0, prev.nextRetryIn - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.nextRetryIn]);

  // Handle auto-reconnect trigger
  useEffect(() => {
    if (state.status !== 'reconnecting' || state.nextRetryIn > 0 || !autoReconnect) return;

    const attemptReconnect = async () => {
      await handleReconnect();
    };

    attemptReconnect();
  }, [state.status, state.nextRetryIn, autoReconnect]);

  // Update connection status based on prop
  useEffect(() => {
    setState(prev => {
      if (isConnected && prev.status !== 'connected') {
        return {
          ...prev,
          status: 'connected',
          retryCount: 0,
          nextRetryIn: 0,
          connectionHistory: [
            ...prev.connectionHistory,
            { timestamp: Date.now(), status: 'connected' },
          ],
        };
      } else if (!isConnected && prev.status === 'connected') {
        return {
          ...prev,
          status: 'disconnected',
          connectionHistory: [
            ...prev.connectionHistory,
            { timestamp: Date.now(), status: 'disconnected' },
          ],
        };
      }
      return prev;
    });
  }, [isConnected]);

  const handleReconnect = async () => {
    setIsRetrying(true);

    try {
      setState(prev => ({
        ...prev,
        status: 'reconnecting',
        retryCount: prev.retryCount + 1,
      }));

      if (onReconnect) {
        await onReconnect();
      }

      // Simulate reconnection attempt
      await new Promise(resolve => setTimeout(resolve, 2000));

      setState(prev => ({
        ...prev,
        status: 'connected',
        nextRetryIn: 0,
        connectionHistory: [
          ...prev.connectionHistory,
          { timestamp: Date.now(), status: 'connected' },
        ],
      }));
    } catch (error) {
      const backoffTime = Math.min(1000 * Math.pow(2, state.retryCount), 16000);

      setState(prev => ({
        ...prev,
        status: state.retryCount >= 5 ? 'failed' : 'reconnecting',
        nextRetryIn: Math.ceil(backoffTime / 1000),
        lastError: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setIsRetrying(false);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const statusConfig = {
    connected: {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      label: 'Connected',
      color: 'bg-green-900/20 border-green-500/30',
      textColor: 'text-green-400',
    },
    disconnected: {
      icon: <WifiOff className="w-5 h-5 text-red-500" />,
      label: 'Disconnected',
      color: 'bg-red-900/20 border-red-500/30',
      textColor: 'text-red-400',
    },
    reconnecting: {
      icon: <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />,
      label: 'Reconnecting',
      color: 'bg-yellow-900/20 border-yellow-500/30',
      textColor: 'text-yellow-400',
    },
    failed: {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      label: 'Connection Failed',
      color: 'bg-red-900/20 border-red-500/30',
      textColor: 'text-red-400',
    },
  };

  const config = statusConfig[state.status];

  // Collapsed view
  if (!showDetails) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <button
          onClick={() => setShowDetails(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105 ${config.color}`}
          title={`Stream: ${streamId} - ${config.label}`}
        >
          {config.icon}
          <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
        </button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-80`}>
      <Card className={`border ${config.color} bg-slate-900/95 backdrop-blur`}>
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {config.icon}
              <span className={`font-semibold ${config.textColor}`}>{config.label}</span>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>

          {/* Stream ID */}
          <div className="text-xs text-gray-400">
            <span className="text-gray-500">Stream:</span> {streamId}
          </div>

          {/* Status Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Retry Attempts:</span>
              <span className="text-white font-medium">{state.retryCount}</span>
            </div>

            {state.status === 'reconnecting' && state.nextRetryIn > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next Retry:</span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span>{state.nextRetryIn}s</span>
                </div>
              </div>
            )}

            {state.lastError && (
              <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/20">
                {state.lastError}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {state.status !== 'connected' && (
              <Button
                onClick={handleReconnect}
                disabled={isRetrying || state.status === 'reconnecting'}
                className="flex-1 h-8 text-xs"
                variant={state.status === 'failed' ? 'destructive' : 'default'}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Reconnect Now
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => setShowDetails(false)}
              variant="outline"
              className="flex-1 h-8 text-xs"
            >
              Minimize
            </Button>
          </div>

          {/* Connection History */}
          {state.connectionHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-700">
              <div className="text-xs text-gray-400 mb-2">Recent Activity:</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {state.connectionHistory.slice(-5).reverse().map((entry, idx) => (
                  <div key={idx} className="text-xs text-gray-500 flex justify-between">
                    <span>
                      {entry.status === 'connected' ? '✓ Connected' : '✗ Disconnected'}
                    </span>
                    <span>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-reconnect Status */}
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>Auto-reconnect:</span>
            <span className={autoReconnect ? 'text-green-400' : 'text-gray-500'}>
              {autoReconnect ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListenerReconnectionWidget;
