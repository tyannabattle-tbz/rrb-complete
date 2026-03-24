import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Users, Zap, TrendingUp, Eye, Wifi } from 'lucide-react';
import { toast } from 'sonner';

interface StreamMetrics {
  bitrate: number;
  fps: number;
  viewers: number;
  uptime: number;
  bandwidth: number;
}

interface StreamSession {
  id: string;
  title: string;
  startTime: Date;
  viewers: number;
  bitrate: string;
  status: 'live' | 'ended' | 'scheduled';
}

export function LiveStreamer() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState('Live Broadcast');
  const [bitrate, setBitrate] = useState<'auto' | '720p' | '1080p' | '4K'>('auto');
  const [viewers, setViewers] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [metrics, setMetrics] = useState<StreamMetrics>({
    bitrate: 5000,
    fps: 60,
    viewers: 0,
    uptime: 0,
    bandwidth: 0,
  });
  const [sessions, setSessions] = useState<StreamSession[]>([]);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const bitrateMap = {
    auto: 5000,
    '720p': 2500,
    '1080p': 5000,
    '4K': 15000,
  };

  const startStream = () => {
    setIsStreaming(true);
    setViewers(Math.floor(Math.random() * 500));
    setUptime(0);

    const session: StreamSession = {
      id: Date.now().toString(),
      title: streamTitle,
      startTime: new Date(),
      viewers: 0,
      bitrate: bitrate,
      status: 'live',
    };
    setSessions([session, ...sessions]);

    streamIntervalRef.current = setInterval(() => {
      setUptime((t) => t + 1);
      setViewers((v) => Math.max(0, v + Math.floor(Math.random() * 20 - 5)));
      setMetrics((m) => ({
        ...m,
        bitrate: bitrateMap[bitrate],
        fps: 60,
        viewers: Math.floor(Math.random() * 1000),
        uptime: uptime + 1,
        bandwidth: Math.random() * 100,
      }));
    }, 1000);

    toast.success(`🔴 LIVE: ${streamTitle}`);
  };

  const stopStream = () => {
    setIsStreaming(false);
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    setSessions(
      sessions.map((s) =>
        s.status === 'live' ? { ...s, status: 'ended', viewers } : s
      )
    );

    toast.success('Stream ended');
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Stream Control Panel */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            Live Streaming Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stream Title */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Stream Title</label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              disabled={isStreaming}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 disabled:opacity-50"
              placeholder="Enter stream title"
            />
          </div>

          {/* Bitrate Selection */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Quality / Bitrate</label>
            <div className="grid grid-cols-4 gap-2">
              {(['auto', '720p', '1080p', '4K'] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={bitrate === option ? 'default' : 'outline'}
                  onClick={() => setBitrate(option)}
                  disabled={isStreaming}
                  className="text-xs"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Stream Status */}
          {isStreaming && (
            <div className="bg-red-900/20 border border-red-500 rounded p-3">
              <div className="text-sm text-red-300 font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE NOW
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-red-200">
                <div>Uptime: {formatUptime(uptime)}</div>
                <div>Viewers: {viewers.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              className={isStreaming ? 'bg-red-600 hover:bg-red-700 flex-1' : 'bg-green-600 hover:bg-green-700 flex-1'}
              onClick={isStreaming ? stopStream : startStream}
            >
              {isStreaming ? (
                <>
                  <Radio className="w-4 h-4 mr-2" />
                  Stop Stream
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stream Metrics */}
      {isStreaming && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Stream Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Bitrate</div>
                <div className="text-lg font-bold text-blue-400">{metrics.bitrate.toLocaleString()} kbps</div>
              </div>
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">FPS</div>
                <div className="text-lg font-bold text-green-400">{metrics.fps}</div>
              </div>
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Viewers</div>
                <div className="text-lg font-bold text-yellow-400">{metrics.viewers.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Uptime</div>
                <div className="text-lg font-bold text-purple-400">{formatUptime(metrics.uptime)}</div>
              </div>
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Bandwidth</div>
                <div className="text-lg font-bold text-pink-400">{metrics.bandwidth.toFixed(1)} Mbps</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Viewer Analytics */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Viewer Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Current Viewers</span>
              <span className="text-lg font-bold text-cyan-400">{viewers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Peak Viewers</span>
              <span className="text-lg font-bold text-green-400">
                {Math.max(viewers, ...sessions.map((s) => s.viewers)).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Sessions</span>
              <span className="text-lg font-bold text-purple-400">{sessions.length}</span>
            </div>
            <div className="h-20 bg-slate-900 rounded border border-slate-700 flex items-end justify-around p-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t mx-0.5"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stream History */}
      {sessions.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Stream History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700">
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{session.title}</div>
                    <div className="text-xs text-slate-400">
                      {session.startTime.toLocaleTimeString()} • {session.bitrate} • {session.viewers.toLocaleString()} viewers
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    session.status === 'live' ? 'bg-red-900/30 text-red-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {session.status === 'live' ? '🔴 LIVE' : '⏹ ENDED'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
