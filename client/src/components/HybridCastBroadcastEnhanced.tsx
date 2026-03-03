import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Wifi, Users, Volume2, Settings, Share2, Eye, TrendingUp, Clock, BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface BroadcastStats {
  viewers: number;
  duration: number;
  bitrate: string;
  quality: string;
  streamHealth: string;
  latency: string;
  bandwidth: string;
  frameRate: string;
  peakViewers: number;
  averageWatchTime: number;
}

interface ViewerInfo {
  id: string;
  name: string;
  joinTime: Date;
  watchDuration: number;
}

export function HybridCastBroadcastEnhanced() {
  const [isLive, setIsLive] = useState(false);
  const [broadcastId, setBroadcastId] = useState<string>('');
  const [stats, setStats] = useState<BroadcastStats>({
    viewers: 0,
    duration: 0,
    bitrate: '5 Mbps',
    quality: '1080p',
    streamHealth: 'excellent',
    latency: '2.5s',
    bandwidth: '8.5 Mbps',
    frameRate: '60 fps',
    peakViewers: 0,
    averageWatchTime: 0,
  });

  const [title, setTitle] = useState('RRB Live Stream');
  const [description, setDescription] = useState('Broadcasting with HybridCast');
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedBitrate, setSelectedBitrate] = useState('5 Mbps');
  const [viewers, setViewers] = useState<ViewerInfo[]>([]);
  const [showViewerList, setShowViewerList] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const durationRef = useRef<NodeJS.Timeout | null>(null);
  const metricsRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutations and queries
  const startBroadcastMutation = trpc.hybridcast.startBroadcast.useMutation();
  const stopBroadcastMutation = trpc.hybridcast.stopBroadcast.useMutation();
  const getMetricsMutation = trpc.hybridcast.getStreamMetrics.useMutation();
  const getViewersMutation = trpc.hybridcast.getBroadcastViewers.useMutation();

  const startBroadcast = async () => {
    try {
      const result = await startBroadcastMutation.mutateAsync({
        title,
        description,
        quality: selectedQuality as '480p' | '720p' | '1080p' | '4K',
        bitrate: selectedBitrate,
      });

      if (result.success) {
        setBroadcastId(result.broadcastId);
        setIsLive(true);
        toast.success('🔴 Broadcast started!');

        // Simulate viewer count and metrics
        const interval = setInterval(() => {
          setStats((prev) => ({
            ...prev,
            viewers: Math.min(prev.viewers + Math.floor(Math.random() * 10), 500),
            duration: prev.duration + 1,
            peakViewers: Math.max(prev.peakViewers, prev.viewers),
          }));
        }, 1000);

        durationRef.current = interval;

        // Update metrics every 5 seconds
        const metricsInterval = setInterval(async () => {
          try {
            const metricsResult = await getMetricsMutation.mutateAsync({
              broadcastId: result.broadcastId,
            });

            if (metricsResult.success) {
              setStats((prev) => ({
                ...prev,
                streamHealth: metricsResult.data.streamHealth,
                latency: metricsResult.data.latency,
                bandwidth: metricsResult.data.bandwidth,
                frameRate: metricsResult.data.frameRate,
              }));
            }
          } catch (error) {
            console.error('Failed to fetch metrics:', error);
          }
        }, 5000);

        metricsRef.current = metricsInterval;
      }
    } catch (error) {
      toast.error('Failed to start broadcast');
      console.error(error);
    }
  };

  const stopBroadcast = async () => {
    try {
      if (!broadcastId) return;

      const result = await stopBroadcastMutation.mutateAsync({
        broadcastId,
      });

      if (result.success) {
        setIsLive(false);
        if (durationRef.current) clearInterval(durationRef.current);
        if (metricsRef.current) clearInterval(metricsRef.current);
        toast.success(`Broadcast ended - Recording: ${result.recordingUrl}`);
        setStats({
          viewers: 0,
          duration: 0,
          bitrate: '5 Mbps',
          quality: '1080p',
          streamHealth: 'excellent',
          latency: '2.5s',
          bandwidth: '8.5 Mbps',
          frameRate: '60 fps',
          peakViewers: stats.peakViewers,
          averageWatchTime: stats.averageWatchTime,
        });
        setBroadcastId('');
      }
    } catch (error) {
      toast.error('Failed to stop broadcast');
      console.error(error);
    }
  };

  const fetchViewers = async () => {
    if (!broadcastId) return;
    try {
      const result = await getViewersMutation.mutateAsync({
        broadcastId,
      });

      if (result.success) {
        setViewers(
          result.data.map((v: any) => ({
            id: v.id,
            name: v.viewerName,
            joinTime: new Date(v.joinTime),
            watchDuration: v.watchDuration,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch viewers:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shareStream = () => {
    const shareUrl = `${window.location.origin}/watch/${broadcastId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Stream URL copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Main Broadcast Card */}
      <Card className="p-6 bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  isLive ? 'bg-red-500/20 border border-red-500' : 'bg-slate-700 border border-slate-600'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span className={`text-sm font-bold ${isLive ? 'text-red-400' : 'text-slate-400'}`}>
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                HybridCast Broadcaster
              </h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stats.viewers}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                <Users className="w-3 h-3" />
                Viewers
              </div>
            </div>
          </div>

          {/* Stream Info */}
          {!isLive ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Stream Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                  placeholder="Enter stream title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 h-20"
                  placeholder="Enter stream description"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
              <p className="text-sm text-slate-400">{description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <Clock className="w-4 h-4" />
                Duration: {formatDuration(stats.duration)}
              </div>
            </div>
          )}

          {/* Quality & Bitrate Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quality</label>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                disabled={isLive}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bitrate</label>
              <select
                value={selectedBitrate}
                onChange={(e) => setSelectedBitrate(e.target.value)}
                disabled={isLive}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                <option value="2.5 Mbps">2.5 Mbps</option>
                <option value="5 Mbps">5 Mbps</option>
                <option value="8.5 Mbps">8.5 Mbps</option>
                <option value="15 Mbps">15 Mbps</option>
                <option value="25 Mbps">25 Mbps</option>
              </select>
            </div>
          </div>

          {/* Stream Metrics */}
          {isLive && (
            <div className="grid grid-cols-4 gap-3 bg-slate-900/30 rounded-lg p-4">
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">Health</div>
                <div className="text-sm font-semibold text-green-400">{stats.streamHealth}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">Latency</div>
                <div className="text-sm font-semibold text-blue-400">{stats.latency}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">Bandwidth</div>
                <div className="text-sm font-semibold text-purple-400">{stats.bandwidth}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">FPS</div>
                <div className="text-sm font-semibold text-cyan-400">{stats.frameRate}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {!isLive ? (
              <Button
                onClick={startBroadcast}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
              >
                <Radio className="w-4 h-4 mr-2" />
                Start Broadcast
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopBroadcast}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
                >
                  Stop Broadcast
                </Button>
                <Button
                  onClick={shareStream}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    setShowViewerList(!showViewerList);
                    if (!showViewerList) fetchViewers();
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Viewers
                </Button>
                <Button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Viewer List */}
      {showViewerList && isLive && (
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Viewers ({viewers.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {viewers.length > 0 ? (
              viewers.map((viewer) => (
                <div key={viewer.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{viewer.name}</div>
                    <div className="text-xs text-slate-400">
                      Watching for {formatDuration(viewer.watchDuration)}
                    </div>
                  </div>
                  <div className="text-xs text-green-400 font-semibold">LIVE</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">No active viewers</div>
            )}
          </div>
        </Card>
      )}

      {/* Analytics */}
      {showAnalytics && (
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Stream Analytics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Current Viewers</div>
              <div className="text-2xl font-bold text-cyan-400">{stats.viewers}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Peak Viewers</div>
              <div className="text-2xl font-bold text-green-400">{stats.peakViewers}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Duration</div>
              <div className="text-2xl font-bold text-blue-400">{formatDuration(stats.duration)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Quality</div>
              <div className="text-2xl font-bold text-purple-400">{stats.quality}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
