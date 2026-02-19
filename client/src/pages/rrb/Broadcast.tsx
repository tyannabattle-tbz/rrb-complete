import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Eye, Radio, Volume2, Settings, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Broadcast() {
  const [isLive, setIsLive] = useState(true);
  const [viewers, setViewers] = useState(1247);
  const [duration, setDuration] = useState(0);
  const [bitrate, setBitrate] = useState('5.0 Mbps');
  const [quality, setQuality] = useState('1080p');
  const [volume, setVolume] = useState(80);

  // Simulate viewer count increasing
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Simulate broadcast duration
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndBroadcast = () => {
    setIsLive(false);
    toast.success('🔴 Broadcast ended. Thank you for tuning in!');
    setTimeout(() => {
      window.location.href = '/rrb/podcast-and-video';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-red-500/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-2xl font-bold text-white">LIVE BROADCAST</h1>
            <Badge className="bg-red-500 text-white animate-pulse">ON AIR</Badge>
          </div>
          <Button
            onClick={handleEndBroadcast}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <X className="w-4 h-4" />
            End Broadcast
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Video Area */}
            <div className="lg:col-span-2">
              <Card className="bg-black border-red-500/30 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-red-500/20 to-purple-500/20 flex items-center justify-center relative">
                  <div className="text-center">
                    <Radio className="w-24 h-24 text-red-500 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-3xl font-bold text-white mb-2">Rockin' Rockin' Boogie</h2>
                    <p className="text-gray-400 text-lg">Live Broadcast - Canryn Production</p>
                  </div>
                  
                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white font-semibold text-sm">LIVE</span>
                  </div>
                </div>

                {/* Broadcast Controls */}
                <div className="p-6 bg-gray-900/50 border-t border-red-500/20 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Quality</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-red-500 outline-none"
                      >
                        <option>480p</option>
                        <option>720p</option>
                        <option>1080p</option>
                        <option>4K</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Bitrate</label>
                      <input
                        type="text"
                        value={bitrate}
                        disabled
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Volume
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400 mt-1">{volume}%</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar - Stats & Info */}
            <div className="space-y-4">
              {/* Viewers */}
              <Card className="bg-gray-900/50 border-red-500/30 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-white">Live Viewers</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{viewers.toLocaleString()}</div>
                <p className="text-sm text-gray-400">Watching now</p>
              </Card>

              {/* Duration */}
              <Card className="bg-gray-900/50 border-red-500/30 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-white">Duration</h3>
                </div>
                <div className="text-4xl font-bold text-white font-mono">{formatDuration(duration)}</div>
                <p className="text-sm text-gray-400">Time on air</p>
              </Card>

              {/* Stream Info */}
              <Card className="bg-gray-900/50 border-red-500/30 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Radio className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-white">Stream Info</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality:</span>
                    <span className="text-white font-semibold">{quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bitrate:</span>
                    <span className="text-white font-semibold">{bitrate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 font-semibold">Connected</span>
                  </div>
                </div>
              </Card>

              {/* Chat Placeholder */}
              <Card className="bg-gray-900/50 border-red-500/30 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-white">Live Chat</h3>
                </div>
                <div className="bg-gray-800 rounded p-3 h-32 flex items-center justify-center text-gray-500 text-sm">
                  Chat coming soon...
                </div>
              </Card>

              {/* Settings */}
              <Button 
                onClick={() => toast.info('📺 Broadcast settings panel opening...')}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white gap-2"
              >
                <Settings className="w-4 h-4" />
                Broadcast Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
