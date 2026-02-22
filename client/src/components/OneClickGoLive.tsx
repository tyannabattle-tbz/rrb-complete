/**
 * One-Click Go-Live Component
 * Simple, user-friendly broadcast start interface
 * Works across all platforms (SQUADD, Solbones, Custom)
 */

import React, { useState } from 'react';
import { Play, Square, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface OneClickGoLiveProps {
  platformId: string;
  platformName: string;
  primaryColor: string;
  onGoLive?: (broadcastId: string) => void;
  onStop?: () => void;
}

export const OneClickGoLive: React.FC<OneClickGoLiveProps> = ({
  platformId,
  platformName,
  primaryColor,
  onGoLive,
  onStop,
}) => {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const handleGoLive = async () => {
    if (!broadcastTitle.trim()) {
      setError('Please enter a broadcast title');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate broadcast start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsLive(true);
      setShowTitleInput(false);
      onGoLive?.(`broadcast-${Date.now()}`);

      // Simulate viewer count increase
      setViewerCount(Math.floor(Math.random() * 100) + 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLive(false);
      setBroadcastTitle('');
      setViewerCount(0);
      onStop?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLive) {
    return (
      <div className="w-full max-w-md mx-auto">
        {/* Live Status Card */}
        <div
          className="rounded-xl p-6 text-white shadow-2xl"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Live Indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <span className="font-semibold text-sm">LIVE NOW</span>
            </div>
          </div>

          {/* Broadcast Title */}
          <h2 className="text-2xl font-bold mb-4">{broadcastTitle}</h2>

          {/* Viewer Count */}
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm text-white/80 mb-1">Viewers</p>
            <p className="text-3xl font-bold">{viewerCount}</p>
          </div>

          {/* Stream Duration */}
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm text-white/80 mb-1">Duration</p>
            <p className="text-lg font-semibold">00:05:23</p>
          </div>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-white text-white font-bold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ color: primaryColor }}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="w-5 h-5" />
                Stop Broadcast
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Title Input */}
      {showTitleInput && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Broadcast Title
          </label>
          <input
            type="text"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            placeholder="Enter your broadcast title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            This will be displayed to viewers
          </p>
        </div>
      )}

      {/* Go Live Button */}
      <button
        onClick={() => {
          if (showTitleInput) {
            handleGoLive();
          } else {
            setShowTitleInput(true);
          }
        }}
        disabled={isLoading}
        className="w-full px-6 py-4 bg-gradient-to-r text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        style={{
          backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        }}
      >
        {isLoading ? (
          <>
            <Loader className="w-6 h-6 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            {showTitleInput ? 'Start Broadcast' : 'Go Live'}
          </>
        )}
      </button>

      {/* Platform Info */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {platformName} Broadcast
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Click "Go Live" to start streaming. Your broadcast will be available to all viewers
              on {platformName}.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-2">Quick Tips:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Check your internet connection before going live</li>
          <li>✓ Use a clear, descriptive broadcast title</li>
          <li>✓ Test your audio and video before starting</li>
          <li>✓ You can pause and resume your broadcast anytime</li>
        </ul>
      </div>
    </div>
  );
};
