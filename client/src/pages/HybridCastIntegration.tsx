import { useState } from 'react';
import { useLocation } from 'wouter';
import { Maximize2, Minimize2, RefreshCw, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HybridCastIframeWrapper } from '@/components/HybridCastIframeWrapper';
import { toast } from 'sonner';

export default function HybridCastIntegration() {
  const [, navigate] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = () => {
    setIsLoading(true);
    // Reload the page to refresh the iframe
    window.location.reload();
  };

  const handleOpenExternal = () => {
    window.open('https://www.hybridcast.sbs', '_blank');
    toast.info('Opening HybridCast in new tab');
  };

  const handleLoad = () => {
    setIsLoading(false);
    toast.success('HybridCast loaded successfully');
  };

  const handleError = (error: Error) => {
    toast.error(`Failed to load HybridCast: ${error.message}`);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Fullscreen Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">HybridCast Emergency Broadcast System</h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Iframe */}
        <HybridCastIframeWrapper
          fullscreen={true}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">HybridCast Integration</h1>
              <p className="text-slate-400 text-sm mt-1">Emergency Broadcast System</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setIsFullscreen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
            <Button
              onClick={handleOpenExternal}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open External
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Status</div>
            <div className="text-lg font-semibold text-cyan-400">
              {isLoading ? 'Loading...' : 'Connected'}
            </div>
          </div>
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Platform</div>
            <div className="text-lg font-semibold text-blue-400">HybridCast PWA</div>
          </div>
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Features</div>
            <div className="text-lg font-semibold text-green-400">68+ Tabs</div>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Core Features</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Offline-first PWA architecture
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Mesh network topology visualization
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Real-time broadcast feed
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                AES-256 encryption
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                &lt;50ms latency, 99.9% uptime
              </li>
            </ul>
          </div>

          <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Tab Categories</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <div>
                <div className="font-semibold text-cyan-400 mb-2">Network</div>
                <ul className="space-y-1">
                  <li>NET, TOPO, GPS, GEO, WX, MESH</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-blue-400 mb-2">Communication</div>
                <ul className="space-y-1">
                  <li>PTT, LIVE, AUDIO, CHAT, THRD, FILES, SHARE</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-green-400 mb-2">Operations</div>
                <ul className="space-y-1">
                  <li>ALERT, SYNC, STATS, DRILL, GITHUB, ABOUT</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-purple-400 mb-2">Accessibility</div>
                <ul className="space-y-1">
                  <li>A11Y, TTS, ASL, WCAG</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded HybridCast */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden" style={{ height: '800px' }}>
          <HybridCastIframeWrapper
            fullscreen={false}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400">
          <p>
            HybridCast is an emergency broadcast PWA designed for resilience and accessibility. This integration provides seamless access to all 68+ features within the QUMUS platform. For full-screen experience, click the "Fullscreen" button above.
          </p>
        </div>
      </div>
    </div>
  );
}
