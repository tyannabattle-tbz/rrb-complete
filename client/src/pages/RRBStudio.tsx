import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Radio,
  Mic,
  Volume2,
  Settings,
  Users,
  Music,
  Clock,
  TrendingUp,
  Share2,
  DollarSign,
  Play,
  Square,
  Pause,
  SkipForward,
  Sliders,
  Headphones,
  Radio as RadioIcon,
} from 'lucide-react';

export default function RRBStudio() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentShow, setCurrentShow] = useState('Morning Motivation Mix');
  const [listeners, setListeners] = useState(2847);
  const [activeTab, setActiveTab] = useState('studio');

  // Mixing board state
  const [faders, setFaders] = useState({
    master: 75,
    mic1: 80,
    mic2: 60,
    music: 70,
    effects: 50,
  });

  const handleFaderChange = (channel: string, value: number) => {
    setFaders(prev => ({ ...prev, [channel]: value }));
  };

  const toggleLive = () => {
    setIsLive(!isLive);
    if (!isLive) {
      setListeners(Math.floor(Math.random() * 5000) + 1000);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-pink-500/20 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`absolute inset-0 rounded-lg blur ${isLive ? 'bg-red-500/50' : 'bg-slate-700/50'}`}></div>
                <div className={`relative rounded-lg p-3 ${isLive ? 'bg-red-600' : 'bg-slate-700'}`}>
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Rockin' Rockin' Boogie</h1>
                <p className="text-sm text-pink-300">Professional Broadcasting Studio</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isLive && (
                <Badge className="bg-red-500/20 text-red-400 text-base px-3 py-1 animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
              {isRecording && (
                <Badge className="bg-orange-500/20 text-orange-400 text-base px-3 py-1 animate-pulse">
                  ⏺️ RECORDING
                </Badge>
              )}
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Live Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400 mb-2">Current Show</p>
                <p className="text-lg font-semibold text-white truncate">{currentShow}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400 mb-2">Live Listeners</p>
                <p className="text-lg font-semibold text-pink-400">{isLive ? listeners.toLocaleString() : '—'}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400 mb-2">Status</p>
                <Badge className={isLive ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/20 text-slate-400'}>
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </Badge>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-400 mb-2">Recording</p>
                <Badge className={isRecording ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-600/20 text-slate-400'}>
                  {isRecording ? 'ACTIVE' : 'IDLE'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="studio" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Studio</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="collab" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Collab</span>
              </TabsTrigger>
              <TabsTrigger value="royalties" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Royalties</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Studio Tab - Mixing Board */}
            <TabsContent value="studio" className="space-y-6 mt-6">
              {/* Control Buttons */}
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={toggleLive}
                  className={`flex-1 h-16 text-lg font-semibold ${
                    isLive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLive ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      Stop Broadcast
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Go Live
                    </>
                  )}
                </Button>
                <Button
                  onClick={toggleRecording}
                  className={`flex-1 h-16 text-lg font-semibold ${
                    isRecording
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <RadioIcon className="w-5 h-5 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>

              {/* Mixing Board */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Mixing Board
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {Object.entries(faders).map(([channel, value]) => (
                      <div key={channel} className="space-y-3">
                        <label className="text-sm font-semibold text-white capitalize">{channel}</label>
                        <div className="flex flex-col items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => handleFaderChange(channel, parseInt(e.target.value))}
                            className="w-full h-32 appearance-none bg-slate-700 rounded-lg cursor-pointer"
                            style={{
                              WebkitAppearance: 'slider-vertical',
                              writingMode: 'bt-lr',
                            }}
                          />
                          <div className="text-center">
                            <p className="text-lg font-bold text-pink-400">{value}</p>
                            <p className="text-xs text-slate-400">dB</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Audio Channels */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="w-5 h-5" />
                    Audio Channels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Microphone 1', status: 'active', level: 85 },
                    { name: 'Microphone 2', status: 'standby', level: 0 },
                    { name: 'Music Track', status: 'active', level: 70 },
                    { name: 'Effects', status: 'active', level: 50 },
                  ].map((channel) => (
                    <div key={channel.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{channel.name}</p>
                        <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${channel.level}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge className={channel.status === 'active' ? 'bg-green-500/20 text-green-400 ml-4' : 'bg-slate-600/20 text-slate-400 ml-4'}>
                        {channel.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6 mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Broadcast Schedule</CardTitle>
                  <CardDescription>Manage your shows and broadcasts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { time: '06:00 AM', show: 'Morning Motivation Mix', duration: '2h', status: 'live' },
                    { time: '08:00 AM', show: 'Healing Frequencies', duration: '1h', status: 'upcoming' },
                    { time: '09:00 AM', show: 'Community Spotlight', duration: '1.5h', status: 'upcoming' },
                    { time: '02:00 PM', show: 'Afternoon Vibes', duration: '3h', status: 'upcoming' },
                  ].map((item) => (
                    <div key={item.show} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div>
                        <p className="font-semibold text-white">{item.show}</p>
                        <p className="text-sm text-slate-400">{item.time} • {item.duration}</p>
                      </div>
                      <Badge className={item.status === 'live' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
                        {item.status === 'live' ? '🔴 LIVE' : '⏱️ UPCOMING'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Collaboration Tab */}
            <TabsContent value="collab" className="space-y-6 mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Studio Collaboration</CardTitle>
                  <CardDescription>Manage guests and collaborators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Sarah Johnson', role: 'Co-Host', status: 'connected' },
                      { name: 'Michael Chen', role: 'Guest', status: 'waiting' },
                      { name: 'Emma Williams', role: 'Producer', status: 'connected' },
                      { name: 'David Lee', role: 'Guest', status: 'offline' },
                    ].map((person) => (
                      <div key={person.name} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                        <p className="font-semibold text-white">{person.name}</p>
                        <p className="text-sm text-slate-400 mb-3">{person.role}</p>
                        <Badge className={
                          person.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                          person.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-600/20 text-slate-400'
                        }>
                          {person.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Royalties Tab */}
            <TabsContent value="royalties" className="space-y-6 mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Royalties & Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">Total Earnings</p>
                      <p className="text-3xl font-bold text-green-400">$12,450</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">Pending Payout</p>
                      <p className="text-3xl font-bold text-yellow-400">$3,200</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">This Month</p>
                      <p className="text-3xl font-bold text-pink-400">$2,850</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">Artist Splits</h3>
                    <div className="space-y-3">
                      {[
                        { artist: 'You', percentage: 60, amount: '$1,710' },
                        { artist: 'Co-Host', percentage: 25, amount: '$712.50' },
                        { artist: 'Producer', percentage: 15, amount: '$427.50' },
                      ].map((split) => (
                        <div key={split.artist} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{split.artist}</p>
                            <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full"
                                style={{ width: `${split.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-white">{split.percentage}%</p>
                            <p className="text-sm text-slate-400">{split.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Listener Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">Total Listeners</p>
                      <p className="text-2xl font-bold text-cyan-400">125,430</p>
                      <p className="text-xs text-slate-400 mt-2">+12% this week</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">Avg. Duration</p>
                      <p className="text-2xl font-bold text-pink-400">42m 15s</p>
                      <p className="text-xs text-slate-400 mt-2">+5% this week</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">Engagement Rate</p>
                      <p className="text-2xl font-bold text-orange-400">87.5%</p>
                      <p className="text-xs text-slate-400 mt-2">Excellent</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">New Subscribers</p>
                      <p className="text-2xl font-bold text-green-400">342</p>
                      <p className="text-xs text-slate-400 mt-2">This month</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">Top Shows</h3>
                    <div className="space-y-3">
                      {[
                        { show: 'Morning Motivation Mix', listeners: 8542 },
                        { show: 'Healing Frequencies', listeners: 6234 },
                        { show: 'Community Spotlight', listeners: 5123 },
                      ].map((item) => (
                        <div key={item.show} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                          <p className="font-semibold text-white">{item.show}</p>
                          <p className="text-pink-400 font-semibold">{item.listeners.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
