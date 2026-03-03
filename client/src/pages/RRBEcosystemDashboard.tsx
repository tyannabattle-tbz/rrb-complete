import React, { useState, useEffect } from 'react';
import { Radio, Music, Heart, Gamepad2, Zap, Shield, Headphones, Mic, BarChart3, Settings, Play, Pause, Volume2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RRBHeaderEnhanced } from '@/components/RRBHeaderEnhanced';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RRBEcosystemDashboard() {
  const [activeChannel, setActiveChannel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(70);
  const [listenerCount, setListenerCount] = useState(45230);

  // Simulate real-time listener updates
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 100 - 50));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const channels = [
    { id: 1, name: 'Main Stream', frequency: '432 Hz', listeners: 12450, status: 'live' },
    { id: 2, name: 'Meditation', frequency: '528 Hz', listeners: 8320, status: 'live' },
    { id: 3, name: 'Healing', frequency: '396 Hz', listeners: 6890, status: 'live' },
    { id: 4, name: 'Legacy Stories', frequency: '741 Hz', listeners: 5670, status: 'live' },
    { id: 5, name: 'Community', frequency: '639 Hz', listeners: 4230, status: 'live' },
    { id: 6, name: 'Podcasts', frequency: '852 Hz', listeners: 3450, status: 'live' },
    { id: 7, name: 'Music Archive', frequency: '174 Hz', listeners: 2890, status: 'live' },
    { id: 8, name: 'Emergency Broadcast', frequency: '285 Hz', listeners: 1230, status: 'standby' },
  ];

  const ecosystemSystems = [
    {
      icon: Radio,
      title: '41-Channel Radio',
      description: '24/7 broadcasting with Solfeggio frequencies',
      status: 'active',
      metrics: '45K+ listeners',
      color: 'from-pink-600 to-orange-600',
    },
    {
      icon: Zap,
      title: 'QUMUS Orchestration',
      description: '90% autonomous decision-making',
      status: 'active',
      metrics: '12 policies',
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: Gamepad2,
      title: 'Solbones Game',
      description: 'Sacred math dice game with frequencies',
      status: 'active',
      metrics: '1,200 players',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      icon: Heart,
      title: 'Sweet Miracles',
      description: 'Nonprofit donations & community support',
      status: 'active',
      metrics: '$125K raised',
      color: 'from-red-600 to-pink-600',
    },
    {
      icon: Shield,
      title: 'HybridCast',
      description: 'Emergency broadcast & mesh networking',
      status: 'standby',
      metrics: '93 tabs',
      color: 'from-yellow-600 to-orange-600',
    },
    {
      icon: Headphones,
      title: 'Meditation Hub',
      description: 'Healing frequencies & guided sessions',
      status: 'active',
      metrics: '8K+ sessions',
      color: 'from-green-600 to-teal-600',
    },
    {
      icon: Mic,
      title: 'Podcast Network',
      description: 'YouTube integration & archive',
      status: 'active',
      metrics: '240 episodes',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      icon: Music,
      title: 'Studio Suite',
      description: 'Production & content creation',
      status: 'active',
      metrics: '15 studios',
      color: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* RRB Header */}
      <RRBHeaderEnhanced />
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">RRB Ecosystem</h1>
              <p className="text-xl text-pink-300">Complete Broadcasting & Community Platform</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2 text-lg">
              🟢 All Systems Active
            </Badge>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Listeners</p>
                  <p className="text-3xl font-bold text-white">{listenerCount.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-pink-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Channels</p>
                  <p className="text-3xl font-bold text-white">41</p>
                </div>
                <Radio className="w-8 h-8 text-orange-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Uptime</p>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Donations</p>
                  <p className="text-3xl font-bold text-white">$125K</p>
                </div>
                <Heart className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-slate-800/50 border-pink-500/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="radio">Radio Control</TabsTrigger>
            <TabsTrigger value="systems">All Systems</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-pink-400" />
                  Live Broadcasting Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-white">Main Stream (432 Hz)</p>
                        <p className="text-sm text-gray-400">Currently broadcasting</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">LIVE</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                    <div className="flex-1 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-pink-300" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-700 rounded-lg"
                      />
                      <span className="text-sm text-pink-300 w-8">{volume}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ecosystem Systems Grid */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Ecosystem Systems</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ecosystemSystems.map((system, idx) => {
                  const Icon = system.icon;
                  return (
                    <Card key={idx} className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <Icon className="w-8 h-8 text-pink-400" />
                          <Badge className={`bg-gradient-to-r ${system.color} text-white text-xs`}>
                            {system.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{system.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{system.description}</p>
                        <p className="text-xs text-pink-300 font-semibold">{system.metrics}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Radio Control Tab */}
          <TabsContent value="radio" className="space-y-6">
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-white">41-Channel Radio Control</CardTitle>
                <CardDescription>Switch between channels and manage broadcast settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {channels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        activeChannel === ch.id
                          ? 'bg-pink-600/20 border-pink-500 text-white'
                          : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-pink-500/50'
                      }`}
                    >
                      <div className="font-semibold text-sm">{ch.name}</div>
                      <div className="text-xs opacity-75 mt-1">{ch.frequency}</div>
                      <div className="text-xs opacity-75">{ch.listeners.toLocaleString()} listeners</div>
                    </button>
                  ))}
                </div>

                {/* Selected Channel Details */}
                {channels.map((ch) => (
                  activeChannel === ch.id && (
                    <div key={ch.id} className="p-6 bg-gradient-to-r from-pink-600/10 to-orange-600/10 rounded-lg border border-pink-500/20">
                      <h3 className="text-xl font-bold text-white mb-4">{ch.name}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Frequency</p>
                          <p className="text-2xl font-bold text-pink-400">{ch.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Listeners</p>
                          <p className="text-2xl font-bold text-white">{ch.listeners.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <Badge className="bg-green-500/20 text-green-400 mt-2">{ch.status.toUpperCase()}</Badge>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Systems Tab */}
          <TabsContent value="systems">
            <div className="space-y-4">
              {ecosystemSystems.map((system, idx) => {
                const Icon = system.icon;
                return (
                  <Card key={idx} className="bg-slate-800/50 border-pink-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Icon className="w-8 h-8 text-pink-400 mt-1" />
                          <div>
                            <h3 className="font-semibold text-white text-lg">{system.title}</h3>
                            <p className="text-gray-400">{system.description}</p>
                            <p className="text-sm text-pink-300 mt-2">{system.metrics}</p>
                          </div>
                        </div>
                        <Badge className={`bg-gradient-to-r ${system.color} text-white`}>
                          {system.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-white">Ecosystem Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Listener Distribution</p>
                    <div className="space-y-2">
                      {channels.slice(0, 5).map((ch) => (
                        <div key={ch.id} className="flex items-center gap-3">
                          <div className="w-24 text-sm text-gray-300">{ch.name}</div>
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-pink-600 to-orange-600 h-2 rounded-full"
                              style={{ width: `${(ch.listeners / 12450) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-pink-300 w-20 text-right">{ch.listeners.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-400">Peak Hours</p>
                        <p className="text-2xl font-bold text-white mt-2">6 PM - 10 PM</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-400">Avg Session</p>
                        <p className="text-2xl font-bold text-white mt-2">2h 34m</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
