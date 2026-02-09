import React, { useEffect, useState } from 'react';

/**
 * HybridCast Widget Container Component
 * Provides a dedicated container for the HybridCast widget with proper styling and error handling
 */
export function HybridCastWidgetContainer() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if HybridCast script is loaded
    const checkWidget = () => {
      if (typeof window !== 'undefined' && (window as any).HybridCastWidget) {
        setIsLoaded(true);
        console.log('✓ HybridCast Widget is available');
      } else {
        console.warn('⚠ HybridCast Widget not yet available');
        // Retry after a delay
        setTimeout(checkWidget, 500);
      }
    };

    checkWidget();
  }, []);

  return (
    <div className="hybridcast-widget-container w-full bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 p-6 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            🎙️ HybridCast Radio
          </h2>
          <p className="text-amber-700 text-sm">
            Listen to Rockin' Rockin' Boogie and community broadcasts
          </p>
        </div>

        {/* Widget Container */}
        <div 
          id="hybridcast-widget-root" 
          className="hybridcast-widget-root bg-white rounded-lg p-4 min-h-[300px] flex items-center justify-center"
        >
          {!isLoaded && (
            <div className="text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              </div>
              <p className="text-amber-700 font-medium">Loading HybridCast Widget...</p>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Info Text */}
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-sm text-amber-900">
          <p className="font-semibold mb-1">💡 About HybridCast</p>
          <p>
            HybridCast brings live radio broadcasting directly to our community. 
            Tune in to hear Seabrun Candy Hunter's legacy, emergency broadcasts, and community check-ins.
          </p>
        </div>
      </div>

      <style>{`
        .hybridcast-widget-container {
          font-family: inherit;
        }

        .hybridcast-widget-root {
          position: relative;
          width: 100%;
        }

        /* Ensure HybridCast widget content is visible */
        .hybridcast-widget-root iframe,
        .hybridcast-widget-root [class*="hybridcast"],
        .hybridcast-widget-root [id*="hybridcast"] {
          width: 100% !important;
          height: auto !important;
          min-height: 300px !important;
          border: none !important;
          border-radius: 0.5rem !important;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .hybridcast-widget-container {
            padding: 1rem;
          }

          .hybridcast-widget-root {
            min-height: 250px;
          }

          .hybridcast-widget-root iframe,
          .hybridcast-widget-root [class*="hybridcast"],
          .hybridcast-widget-root [id*="hybridcast"] {
            min-height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
}
