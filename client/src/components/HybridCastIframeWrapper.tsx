import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface HybridCastIframeWrapperProps {
  fullscreen?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function HybridCastIframeWrapper({ fullscreen = false, onLoad, onError }: HybridCastIframeWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
      console.log('[HybridCast] Iframe loaded successfully');
    };

    const handleError = () => {
      const err = new Error('Failed to load HybridCast');
      setError(err.message);
      onError?.(err);
      setIsLoading(false);
      console.error('[HybridCast] Iframe failed to load');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [onLoad, onError]);

  // Handle postMessage communication for cross-origin data sharing
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.includes('hybridcast.sbs')) {
        return;
      }

      console.log('[HybridCast] Message received:', event.data);

      // Handle different message types
      switch (event.data.type) {
        case 'BROADCAST_ALERT':
          console.log('[HybridCast] Broadcast alert:', event.data.payload);
          break;
        case 'NETWORK_STATUS':
          console.log('[HybridCast] Network status:', event.data.payload);
          break;
        case 'SYNC_REQUEST':
          console.log('[HybridCast] Sync requested:', event.data.payload);
          break;
        default:
          console.log('[HybridCast] Unknown message type:', event.data.type);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-slate-300">Loading HybridCast...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <Card className="p-6 bg-red-900/50 border border-red-700 max-w-md">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading HybridCast</h3>
              <p className="text-red-200 text-sm">{error}</p>
              <p className="text-red-300 text-xs mt-4">
                Please ensure you have internet connectivity and try refreshing the page.
              </p>
            </Card>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="https://www.hybridcast.sbs"
          title="HybridCast Emergency Broadcast System"
          className="w-full h-full border-none"
          allow="geolocation; microphone; camera; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation"
        />
      </div>
    );
  }

  return (
    <Card className="w-full h-full bg-slate-900 border border-slate-700 overflow-hidden">
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-slate-300">Loading HybridCast...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 z-10">
            <Card className="p-6 bg-red-900/50 border border-red-700 max-w-md">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading HybridCast</h3>
              <p className="text-red-200 text-sm">{error}</p>
              <p className="text-red-300 text-xs mt-4">
                Please ensure you have internet connectivity and try refreshing the page.
              </p>
            </Card>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="https://www.hybridcast.sbs"
          title="HybridCast Emergency Broadcast System"
          className="w-full h-full border-none"
          allow="geolocation; microphone; camera; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation"
        />
      </div>
    </Card>
  );
}
