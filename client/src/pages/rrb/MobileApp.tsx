import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Wifi, WifiOff, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadedEpisode {
  id: string;
  title: string;
  channel: string;
  size: number;
  downloadedAt: Date;
  isPlaying: boolean;
}

export default function MobileApp() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<DownloadedEpisode[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Offline - using cached content');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) {
      toast.info('App is already installed or not available');
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      toast.success('App installed successfully!');
    }
    setInstallPrompt(null);
  };

  const handleDownloadEpisode = async (episodeId: string, title: string, channel: string) => {
    try {
      // Simulate download
      const newEpisode: DownloadedEpisode = {
        id: episodeId,
        title,
        channel,
        size: Math.random() * 50 + 20, // 20-70 MB
        downloadedAt: new Date(),
        isPlaying: false
      };

      setDownloadedEpisodes(prev => [...prev, newEpisode]);
      toast.success(`Downloaded: ${title}`);

      // In production, use Cache API to store audio
      if ('caches' in window) {
        const cache = await caches.open('podcast-cache-v1');
        // Cache would contain actual audio blob
      }
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handlePlayOffline = (episodeId: string) => {
    setDownloadedEpisodes(prev =>
      prev.map(ep =>
        ep.id === episodeId ? { ...ep, isPlaying: !ep.isPlaying } : ep
      )
    );
  };

  const handleDeleteEpisode = (episodeId: string) => {
    setDownloadedEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
    toast.info('Episode removed');
  };

  const totalStorageUsed = downloadedEpisodes.reduce((sum, ep) => sum + ep.size, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Smartphone className="w-10 h-10 text-purple-400" />
            Mobile App
          </h1>
          <p className="text-slate-400">Download episodes for offline listening</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Connection Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <>
                    <Wifi className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-sm text-slate-400">Connection</p>
                      <p className="font-semibold text-white">Online</p>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="text-sm text-slate-400">Connection</p>
                      <p className="font-semibold text-white">Offline</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Installation Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">App Status</p>
                  <p className="font-semibold text-white">{isInstalled ? 'Installed' : 'Not Installed'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-slate-400 mb-2">Storage Used</p>
                <p className="font-semibold text-white mb-2">{totalStorageUsed.toFixed(1)} MB</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((totalStorageUsed / 500) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">500 MB available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Install Button */}
        {!isInstalled && installPrompt && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Install App</h3>
                  <p className="text-slate-300">Add RRB to your home screen for quick access</p>
                </div>
                <Button
                  onClick={handleInstallApp}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Downloaded Episodes */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Downloaded Episodes ({downloadedEpisodes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {downloadedEpisodes.length === 0 ? (
              <div className="text-center py-8">
                <Download className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No episodes downloaded yet</p>
                <p className="text-slate-500 text-sm mt-2">Download episodes to listen offline</p>
              </div>
            ) : (
              <div className="space-y-3">
                {downloadedEpisodes.map(episode => (
                  <div
                    key={episode.id}
                    className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{episode.title}</h4>
                      <p className="text-sm text-slate-400">{episode.channel}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {episode.size.toFixed(1)} MB • Downloaded {episode.downloadedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlayOffline(episode.id)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 hover:bg-slate-600"
                      >
                        {episode.isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDeleteEpisode(episode.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600/50 hover:bg-red-600/20 text-red-400"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Episodes for Download */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Available Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: '1', title: 'Musical Foundations', channel: "Sean's Music" },
                { id: '2', title: 'Legacy Restored', channel: 'RRB Main' },
                { id: '3', title: 'Young Voices', channel: 'Little C Recording' },
              ].map(episode => (
                <div
                  key={episode.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-white">{episode.title}</h4>
                    <p className="text-sm text-slate-400">{episode.channel}</p>
                  </div>
                  <Button
                    onClick={() => handleDownloadEpisode(episode.id, episode.title, episode.channel)}
                    disabled={!isOnline}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
