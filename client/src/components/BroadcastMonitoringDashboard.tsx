import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Radio, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface StreamMetrics {
  platform: string;
  status: 'live' | 'offline' | 'warning';
  viewers: number;
  bitrate: number; // kbps
  latency: number; // ms
  resolution: string;
  fps: number;
  droppedFrames: number;
  health: number; // 0-100
}

interface BroadcastSession {
  id: string;
  title: string;
  startTime: number;
  duration: number;
  totalViewers: number;
  peakViewers: number;
  platforms: StreamMetrics[];
}

export const BroadcastMonitoringDashboard: React.FC = () => {
  const [session, setSession] = useState<BroadcastSession>({
    id: 'session_001',
    title: 'Soul & R&B Night - Live Performance',
    startTime: Date.now() - 3600000,
    duration: 3600,
    totalViewers: 5247,
    peakViewers: 6842,
    platforms: [
      {
        platform: 'YouTube',
        status: 'live',
        viewers: 2847,
        bitrate: 5000,
        latency: 8,
        resolution: '1920x1080',
        fps: 60,
        droppedFrames: 2,
        health: 98,
      },
      {
        platform: 'Twitch',
        status: 'live',
        viewers: 1950,
        bitrate: 4500,
        latency: 6,
        resolution: '1920x1080',
        fps: 60,
        droppedFrames: 0,
        health: 99,
      },
      {
        platform: 'Facebook',
        status: 'live',
        viewers: 450,
        bitrate: 3000,
        latency: 12,
        resolution: '1280x720',
        fps: 30,
        droppedFrames: 5,
        health: 92,
      },
    ],
  });

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      // Simulate real-time metric updates
      setSession(prev => ({
        ...prev,
        totalViewers: Math.max(4000, prev.totalViewers + Math.floor(Math.random() * 200 - 100)),
        peakViewers: Math.max(prev.totalViewers, prev.peakViewers),
        platforms: prev.platforms.map(p => ({
          ...p,
          viewers: Math.max(100, p.viewers + Math.floor(Math.random() * 100 - 50)),
          droppedFrames: Math.max(0, p.droppedFrames + Math.floor(Math.random() * 2 - 1)),
          health: Math.min(100, Math.max(80, p.health + Math.floor(Math.random() * 4 - 2))),
        })),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-green-400 bg-green-500/20';
      case 'offline':
        return 'text-red-400 bg-red-500/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-400';
    if (health >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  const totalViewers = session.platforms.reduce((sum, p) => sum + p.viewers, 0);
  const avgBitrate = Math.round(session.platforms.reduce((sum, p) => sum + p.bitrate, 0) / session.platforms.length);
  const avgLatency = Math.round(session.platforms.reduce((sum, p) => sum + p.latency, 0) / session.platforms.length);
  const avgHealth = Math.round(session.platforms.reduce((sum, p) => sum + p.health, 0) / session.platforms.length);

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Radio className="w-8 h-8 text-red-500 animate-pulse" />
            Live Broadcast Monitor
          </h2>
          <p className="text-purple-300 text-sm mt-1">{session.title}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white">{formatTime(elapsedTime)}</div>
          <div className="text-sm text-purple-300">Elapsed Time</div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
          <div className="text-purple-300 text-sm font-semibold mb-1">Total Viewers</div>
          <div className="text-3xl font-bold text-white">{totalViewers.toLocaleString()}</div>
          <div className="text-xs text-purple-400 mt-1">Peak: {session.peakViewers.toLocaleString()}</div>
        </div>

        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
          <div className="text-cyan-300 text-sm font-semibold mb-1">Avg Bitrate</div>
          <div className="text-3xl font-bold text-white">{avgBitrate} kbps</div>
          <div className="text-xs text-cyan-400 mt-1">Across all platforms</div>
        </div>

        <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-4">
          <div className="text-pink-300 text-sm font-semibold mb-1">Avg Latency</div>
          <div className="text-3xl font-bold text-white">{avgLatency} ms</div>
          <div className="text-xs text-pink-400 mt-1">Network delay</div>
        </div>

        <div className={`bg-slate-800/50 border rounded-lg p-4 ${avgHealth >= 95 ? 'border-green-500/30' : avgHealth >= 85 ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
          <div className={`text-sm font-semibold mb-1 ${getHealthColor(avgHealth)}`}>Stream Health</div>
          <div className={`text-3xl font-bold ${getHealthColor(avgHealth)}`}>{avgHealth}%</div>
          <div className="text-xs text-slate-400 mt-1">Overall quality</div>
        </div>
      </div>

      {/* Platform Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Platform Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {session.platforms.map((platform, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-purple-500/50 transition">
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${platform.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-white font-semibold">{platform.platform}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(platform.status)}`}>
                  {platform.status.toUpperCase()}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Viewers:</span>
                  <span className="text-white font-semibold">{platform.viewers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bitrate:</span>
                  <span className="text-white font-semibold">{platform.bitrate} kbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latency:</span>
                  <span className="text-white font-semibold">{platform.latency} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution:</span>
                  <span className="text-white font-semibold text-xs">{platform.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FPS:</span>
                  <span className="text-white font-semibold">{platform.fps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dropped Frames:</span>
                  <span className={platform.droppedFrames === 0 ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                    {platform.droppedFrames}
                  </span>
                </div>

                {/* Health Bar */}
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs">Health:</span>
                    <span className={`text-xs font-semibold ${getHealthColor(platform.health)}`}>{platform.health}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        platform.health >= 95 ? 'bg-green-500' :
                        platform.health >= 85 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${platform.health}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {session.platforms.some(p => p.health < 90) && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-yellow-300 font-semibold">Stream Quality Alert</div>
            <div className="text-yellow-200 text-sm mt-1">
              One or more platforms are experiencing quality issues. Consider reducing bitrate or checking network connection.
            </div>
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-cyan-300 font-semibold">Broadcast Optimization</div>
            <ul className="text-cyan-200 text-sm mt-2 space-y-1">
              <li>✓ All platforms streaming at optimal quality</li>
              <li>✓ Average latency within acceptable range (&lt;15ms)</li>
              <li>✓ No significant frame drops detected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
