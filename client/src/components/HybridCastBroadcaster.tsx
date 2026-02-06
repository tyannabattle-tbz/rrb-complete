import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Wifi, Users, Volume2, Settings, Share2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastStats {
  viewers: number;
  duration: number;
  bitrate: string;
  quality: string;
}

export default function HybridCastBroadcaster() {
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState<BroadcastStats>({
    viewers: 0,
    duration: 0,
    bitrate: '5 Mbps',
    quality: '1080p',
  });
  const [title, setTitle] = useState('Qumus Live Stream');
  const [description, setDescription] = useState('Broadcasting with HybridCast');
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedBitrate, setSelectedBitrate] = useState('5 Mbps');
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  const startBroadcast = () => {
    setIsLive(true);
    toast.success('🔴 Broadcast started!');

    // Simulate viewer count increasing
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        viewers: Math.min(prev.viewers + Math.floor(Math.random() * 10), 500),
        duration: prev.duration + 1,
      }));
    }, 1000);

    durationRef.current = interval;
  };

  const stopBroadcast = () => {
    setIsLive(false);
    if (durationRef.current) clearInterval(durationRef.current);
    toast.success('Broadcast ended');
    setStats({ viewers: 0, duration: 0, bitrate: '5 Mbps', quality: '1080p' });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isLive ? 'bg-red-500/20 border border-red-500' : 'bg-slate-700 border border-slate-600'}`}>
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
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
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Stream Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLive}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 disabled:opacity-50"
              placeholder="Enter stream title"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLive}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 disabled:opacity-50 resize-none h-20"
              placeholder="Enter stream description"
            />
          </div>
        </div>

        {/* Stream Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Duration</div>
            <div className="text-lg font-mono font-bold text-cyan-400">{formatDuration(stats.duration)}</div>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Bitrate</div>
            <div className="text-lg font-mono font-bold text-cyan-400">{stats.bitrate}</div>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Quality</div>
            <div className="text-lg font-mono font-bold text-cyan-400">{stats.quality}</div>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Signal
            </div>
            <div className="text-lg font-mono font-bold text-green-400">Excellent</div>
          </div>
        </div>

        {/* Quality Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Video Quality</label>
            <select
              value={selectedQuality}
              onChange={(e) => {
                setSelectedQuality(e.target.value);
                setStats((prev) => ({ ...prev, quality: e.target.value }));
              }}
              disabled={isLive}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50"
            >
              <option value="480p">480p (Low)</option>
              <option value="720p">720p (Medium)</option>
              <option value="1080p">1080p (High)</option>
              <option value="4K">4K (Ultra)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Bitrate</label>
            <select
              value={selectedBitrate}
              onChange={(e) => {
                setSelectedBitrate(e.target.value);
                setStats((prev) => ({ ...prev, bitrate: e.target.value }));
              }}
              disabled={isLive}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50"
            >
              <option value="2.5 Mbps">2.5 Mbps</option>
              <option value="5 Mbps">5 Mbps</option>
              <option value="10 Mbps">10 Mbps</option>
              <option value="25 Mbps">25 Mbps</option>
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 flex-wrap">
          {!isLive ? (
            <Button
              onClick={startBroadcast}
              className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              <Radio className="w-4 h-4" />
              Start Broadcast
            </Button>
          ) : (
            <Button
              onClick={stopBroadcast}
              className="flex-1 gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold"
            >
              <Radio className="w-4 h-4" />
              Stop Broadcast
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast.success('Share link copied to clipboard');
            }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast.info('Opening stream settings');
            }}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Live Indicator */}
        {isLive && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-red-400">Live Stream Active</span>
            </div>
            <p className="text-xs text-slate-400">
              Stream URL: <span className="text-cyan-400 font-mono">https://hybridcast.qumus.io/live/{Math.random().toString(36).substr(2, 9)}</span>
            </p>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            HybridCast Features
          </div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✓ Multi-platform streaming (Web, Mobile, Desktop)</li>
            <li>✓ Real-time chat integration</li>
            <li>✓ Adaptive bitrate streaming</li>
            <li>✓ Automatic failover & redundancy</li>
            <li>✓ Analytics & viewer insights</li>
            <li>✓ VOD (Video on Demand) recording</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
