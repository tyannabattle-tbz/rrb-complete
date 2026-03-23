import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';

export default function TyOSRadioListener() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Fetch active channels
  const { data: channels } = trpc.realtimeMetrics.getChannelMetrics.useQuery();

  // Fetch current broadcast
  const { data: currentBroadcast } = trpc.realtimeMetrics.getSystemMetrics.useQuery();

  // Fetch listener count
  const { data: listeners } = trpc.realtimeMetrics.getListenerMetrics.useQuery(
    { channelId: selectedChannel || 'default' },
    { enabled: !!selectedChannel }
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Ty OS Radio</h1>
          <p className="text-purple-300 text-lg">Listen to the QUMUS Ecosystem Live</p>
        </div>

        {/* Main Player */}
        <Card className="bg-slate-800 border-purple-500 mb-8 shadow-2xl">
          <CardContent className="p-8">
            {/* Album Art / Visualization */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg h-64 md:h-80 mb-8 flex items-center justify-center overflow-hidden">
              <div className="flex items-end gap-1 h-full w-full justify-center p-8">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-purple-300 to-white rounded-t transition-all"
                    style={{
                      height: `${isPlaying ? Math.random() * 100 : 20}%`,
                      opacity: isPlaying ? 0.9 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Now Playing Info */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {currentBroadcast?.currentBroadcast || 'QUMUS Autonomous Broadcast'}
              </h2>
              <p className="text-purple-300 mb-4">
                {currentBroadcast?.description || 'Live from the QUMUS Control Center'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-green-600">LIVE</Badge>
                <Badge className="bg-blue-600">
                  {listeners?.totalListeners?.toLocaleString() || '0'} Listeners
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <Progress value={45} className="h-2 mb-2" />
              <div className="flex justify-between text-sm text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>2:45:00</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button variant="outline" className="border-slate-600">
                ⏮ Skip Prev
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 h-16 w-16 rounded-full text-2xl"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸' : '▶'}
              </Button>
              <Button variant="outline" className="border-slate-600">
                Skip Next ⏭
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-slate-400">🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-slate-400 w-8 text-right">{volume}%</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="border-slate-600">
                ❤️ Favorite
              </Button>
              <Button variant="outline" className="border-slate-600">
                📢 Share
              </Button>
              <Button variant="outline" className="border-slate-600">
                🎵 Playlist
              </Button>
              <Button variant="outline" className="border-slate-600">
                ⚙️ Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Available Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels && channels.length > 0 ? (
              channels.slice(0, 6).map((channel) => (
                <Card
                  key={channel.id}
                  className={`cursor-pointer transition ${
                    selectedChannel === channel.id
                      ? 'bg-purple-600 border-purple-400'
                      : 'bg-slate-800 border-slate-700 hover:border-purple-500'
                  }`}
                  onClick={() => setSelectedChannel(channel.id)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2">{channel.name}</h4>
                    <p className="text-sm text-slate-400 mb-3">{channel.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-600">{channel.listeners} listeners</Badge>
                      <span className={channel.isLive ? 'text-green-400' : 'text-slate-400'}>
                        {channel.isLive ? '🔴 LIVE' : '⭕ Offline'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-400 py-8">
                Loading channels...
              </div>
            )}
          </div>
        </div>

        {/* Listener Stats */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Live Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Total Listeners</p>
                <p className="text-2xl font-bold text-white">
                  {currentBroadcast?.totalListeners?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Active Channels</p>
                <p className="text-2xl font-bold text-white">{channels?.length || '0'}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Broadcast Time</p>
                <p className="text-2xl font-bold text-white">{formatTime(currentTime)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Quality</p>
                <p className="text-2xl font-bold text-white">320 kbps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
