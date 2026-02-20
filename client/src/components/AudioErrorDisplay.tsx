import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AudioError, getErrorMessage, getAudioErrorLogs, clearAudioErrorLogs } from '@/lib/audioErrorHandler';

interface AudioErrorDisplayProps {
  error: AudioError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function AudioErrorDisplay({ error, onRetry, onDismiss }: AudioErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);

  useEffect(() => {
    if (error) {
      setErrorLogs(getAudioErrorLogs());
    }
  }, [error]);

  if (!error) return null;

  const errorMessage = getErrorMessage(error);
  const errorTypeColor = {
    NETWORK_ERROR: 'bg-red-900 border-red-700',
    CORS_ERROR: 'bg-orange-900 border-orange-700',
    FORMAT_ERROR: 'bg-yellow-900 border-yellow-700',
    TIMEOUT_ERROR: 'bg-orange-900 border-orange-700',
    PERMISSION_ERROR: 'bg-red-900 border-red-700',
    STREAM_UNAVAILABLE: 'bg-yellow-900 border-yellow-700',
    UNKNOWN_ERROR: 'bg-gray-800 border-gray-700',
  };

  const errorTypeTextColor = {
    NETWORK_ERROR: 'text-red-200',
    CORS_ERROR: 'text-orange-200',
    FORMAT_ERROR: 'text-yellow-200',
    TIMEOUT_ERROR: 'text-orange-200',
    PERMISSION_ERROR: 'text-red-200',
    STREAM_UNAVAILABLE: 'text-yellow-200',
    UNKNOWN_ERROR: 'text-gray-200',
  };

  return (
    <div className="space-y-2">
      {/* Main Error Card */}
      <Card className={`${errorTypeColor[error.type]} border p-4 space-y-3`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${errorTypeTextColor[error.type]}`} />
          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${errorTypeTextColor[error.type]}`}>
              {error.type.replace(/_/g, ' ')}
            </p>
            <p className={`text-sm ${errorTypeTextColor[error.type]} mt-1`}>
              {errorMessage}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          )}
          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-700 hover:bg-gray-600 text-white gap-2 text-sm"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Details'}
          </Button>
        </div>
      </Card>

      {/* Detailed Error Information */}
      {showDetails && (
        <Card className="bg-gray-900 border-gray-700 p-4 space-y-3">
          {/* Error Details */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-300">Error Details</p>
            <div className="bg-black bg-opacity-50 rounded p-3 space-y-1 text-xs font-mono text-gray-400">
              <p>
                <span className="text-gray-500">Type:</span> {error.type}
              </p>
              <p>
                <span className="text-gray-500">Time:</span> {error.timestamp.toLocaleTimeString()}
              </p>
              {error.streamUrl && (
                <p>
                  <span className="text-gray-500">URL:</span>{' '}
                  <span className="text-gray-300 break-all">{error.streamUrl}</span>
                </p>
              )}
              {error.originalError?.message && (
                <p>
                  <span className="text-gray-500">Cause:</span> {error.originalError.message}
                </p>
              )}
            </div>
          </div>

          {/* Error History */}
          {errorLogs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-300">Error History ({errorLogs.length})</p>
                <Button
                  onClick={() => {
                    clearAudioErrorLogs();
                    setErrorLogs([]);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1"
                >
                  Clear
                </Button>
              </div>
              <div className="bg-black bg-opacity-50 rounded p-3 max-h-40 overflow-y-auto space-y-1">
                {errorLogs.slice(-5).map((log, idx) => (
                  <div key={`item-${idx}`} className="text-xs text-gray-400 border-b border-gray-800 pb-1 last:border-0">
                    <p className="text-gray-500">{log.timestamp}</p>
                    <p className="text-yellow-400">{log.type}</p>
                    <p className="text-gray-300">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-300">Troubleshooting Tips</p>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              {error.type === 'NETWORK_ERROR' && (
                <>
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Disable VPN or proxy if using one</li>
                </>
              )}
              {error.type === 'CORS_ERROR' && (
                <>
                  <li>The stream may be geographically restricted</li>
                  <li>Try a different stream or channel</li>
                  <li>Check if VPN is interfering</li>
                </>
              )}
              {error.type === 'PERMISSION_ERROR' && (
                <>
                  <li>Allow audio playback in browser settings</li>
                  <li>Check browser permissions for this site</li>
                  <li>Try a different browser</li>
                </>
              )}
              {error.type === 'TIMEOUT_ERROR' && (
                <>
                  <li>Stream server may be busy</li>
                  <li>Try again in a few moments</li>
                  <li>Switch to a different stream</li>
                </>
              )}
              {error.type === 'STREAM_UNAVAILABLE' && (
                <>
                  <li>The stream may be offline</li>
                  <li>Try a different channel</li>
                  <li>Check the stream status</li>
                </>
              )}
              {error.type === 'UNKNOWN_ERROR' && (
                <>
                  <li>Try refreshing the page</li>
                  <li>Clear browser cache</li>
                  <li>Try a different browser</li>
                </>
              )}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
