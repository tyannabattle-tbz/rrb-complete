'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Volume2, Users, Music, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

export default function RRBPort3001() {
  const [radioStatus, setRadioStatus] = useState({
    status: 'online',
    currentShow: 'Top of the Sol Motivation Mix',
    listeners: 342,
    uptime: '24h',
  });

  const [channels, setChannels] = useState([
    { id: 1, name: 'Main Channel', listeners: 342, status: 'live' },
    { id: 2, name: 'Healing Frequencies', listeners: 89, status: 'scheduled' },
    { id: 3, name: 'Community Spotlight', listeners: 156, status: 'live' },
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);

  // Radio status is initialized with default values above
  // No external fetch needed - data is managed locally

  const handlePlayStream = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast.success('Now playing: Top of the Sol Motivation Mix');
      setActiveChannel(1);
    } else {
      toast.info('Stream paused');
      setActiveChannel(null);
    }
  };

  const handlePlaylist = () => {
    toast.info('Playlist opened - Select a show to play');
  };

  const handleListenChannel = (channelId: number) => {
    const channel = channels.find(c => c.id === channelId);
    setActiveChannel(channelId);
    setIsPlaying(true);
    toast.success(`Now listening to: ${channel?.name}`);
  };

  const handleViewSchedule = () => {
    toast.info('Full schedule loaded');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-pink-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Radio className="w-8 h-8 text-pink-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">Rockin Rockin Boogie</h1>
                <p className="text-sm text-pink-300">24/7 Radio Station • Port 3001</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                🟢 {radioStatus.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">24/7 Radio Broadcasting</h2>
          <p className="text-xl text-pink-300 mb-8 max-w-3xl mx-auto">
            Rockin Rockin Boogie brings you continuous broadcasting with healing frequencies, community
            spotlights, and entertainment. Qumus autonomously manages all programming.
          </p>
        </div>

        {/* Now Playing */}
        <Card className="bg-gradient-to-r from-pink-600/20 to-orange-600/20 border-pink-500/50 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Now Playing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-pink-300">Current Show</p>
                <p className="text-3xl font-bold text-white">{radioStatus.currentShow}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-pink-300">Active Listeners</p>
                  <p className="text-2xl font-bold text-pink-400">{radioStatus.listeners}</p>
                </div>
                <div>
                  <p className="text-sm text-pink-300">Uptime</p>
                  <p className="text-2xl font-bold text-pink-400">{radioStatus.uptime}</p>
                </div>
                <div>
                  <p className="text-sm text-pink-300">Stream Quality</p>
                  <p className="text-2xl font-bold text-pink-400">128kbps</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handlePlayStream}
                  className={`flex-1 transition-all ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Stream
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play Stream
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handlePlaylist}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 transition-all"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Playlist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Active Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <Card 
                key={channel.id} 
                className={`border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer ${
                  activeChannel === channel.id 
                    ? 'bg-gradient-to-br from-pink-600/30 to-orange-600/30 border-pink-500' 
                    : 'bg-slate-800/50'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-pink-400" />
                      {channel.name}
                    </CardTitle>
                    <Badge
                      className={`${
                        channel.status === 'live'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-pink-300">Listeners</p>
                      <p className="text-2xl font-bold text-pink-400">{channel.listeners}</p>
                    </div>
                    <Button 
                      onClick={() => handleListenChannel(channel.id)}
                      className={`w-full transition-all ${
                        activeChannel === channel.id
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                          : 'bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700'
                      }`}
                    >
                      {activeChannel === channel.id ? 'Now Playing' : 'Listen Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-pink-400" />
                Programming
              </CardTitle>
              <CardDescription>Qumus-managed 24/7 schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-300">Top of the Sol Motivation Mix</span>
                  <span className="text-pink-400">6:00 AM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pink-300">Healing Frequencies Session</span>
                  <span className="text-pink-400">2:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pink-300">Community Spotlight</span>
                  <span className="text-pink-400">6:00 PM</span>
                </div>
              </div>
              <Button 
                onClick={handleViewSchedule}
                className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 transition-all"
              >
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                Listener Analytics
              </CardTitle>
              <CardDescription>Real-time engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-pink-300">Total Listeners</span>
                  <span className="text-pink-400 font-bold">{radioStatus.listeners}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-300">Peak Hour</span>
                  <span className="text-pink-400 font-bold">7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-300">Avg Session</span>
                  <span className="text-pink-400 font-bold">45 min</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 transition-all">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
