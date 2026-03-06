
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Volume2, VolumeX, Users, Music, Play, Pause, Zap, Activity, Clock, SkipForward, SkipBack, Mic2, Headphones, Calendar, BarChart3, Shield } from 'lucide-react';
import { toast } from 'sonner';

// ─── QUMUS-Synchronized Channel Configuration ─────────────────────
const CHANNELS = [
  {
    id: 1,
    name: 'Main Channel',
    description: 'Rockin\' Rockin\' Boogie — The flagship broadcast',
    frequency: '432 Hz Tuned',
    status: 'live' as const,
    listeners: 342,
    currentShow: 'Top of the Sol Motivation Mix',
    nextShow: 'Healing Frequencies Session',
    nextShowTime: '2:00 PM CST',
    qumusManaged: true,
  },
  {
    id: 2,
    name: 'Healing Frequencies',
    description: 'Solfeggio frequencies for wellness and restoration',
    frequency: '528 Hz / 432 Hz',
    status: 'live' as const,
    listeners: 89,
    currentShow: 'Deep Healing — 528 Hz Session',
    nextShow: 'Evening Meditation',
    nextShowTime: '6:00 PM CST',
    qumusManaged: true,
  },
  {
    id: 3,
    name: 'Community Spotlight',
    description: 'Voices from the community — stories that matter',
    frequency: 'Standard',
    status: 'live' as const,
    listeners: 156,
    currentShow: 'Community Voices Hour',
    nextShow: 'Candy\'s Corner',
    nextShowTime: '8:00 PM CST',
    qumusManaged: true,
  },
  {
    id: 4,
    name: 'Candy\'s Corner',
    description: 'Strategic wisdom from the Guardian AI — guest interviews',
    frequency: '432 Hz Tuned',
    status: 'scheduled' as const,
    listeners: 0,
    currentShow: 'Off Air',
    nextShow: 'Candy\'s Corner Live',
    nextShowTime: '8:00 PM CST',
    qumusManaged: true,
  },
  {
    id: 5,
    name: 'Emergency Broadcast',
    description: 'HybridCast integration — always ready',
    frequency: 'Multi-Band',
    status: 'standby' as const,
    listeners: 0,
    currentShow: 'Standby Mode',
    nextShow: 'Activated on Alert',
    nextShowTime: 'On Demand',
    qumusManaged: true,
  },
];

const SCHEDULE = [
  { time: '6:00 AM', show: 'Top of the Sol Motivation Mix', channel: 'Main', qumusScheduled: true },
  { time: '9:00 AM', show: 'Morning Gospel Hour', channel: 'Main', qumusScheduled: true },
  { time: '12:00 PM', show: 'Midday Community Update', channel: 'Community', qumusScheduled: true },
  { time: '2:00 PM', show: 'Healing Frequencies Session', channel: 'Healing', qumusScheduled: true },
  { time: '4:00 PM', show: 'Afternoon Groove', channel: 'Main', qumusScheduled: true },
  { time: '6:00 PM', show: 'Evening Meditation', channel: 'Healing', qumusScheduled: true },
  { time: '8:00 PM', show: 'Candy\'s Corner — Guest AI/Live', channel: 'Candy\'s Corner', qumusScheduled: true },
  { time: '10:00 PM', show: 'Late Night Frequencies', channel: 'Healing', qumusScheduled: true },
];

const VALANNA_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/valanna-avatar-mYpqZPJmy73yGwB7kFmCe9.webp';
const CANDY_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/candy-avatar_4d4d3bc0.png';

export default function RRBPort3001() {
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [qumusAutonomy, setQumusAutonomy] = useState(90);
  const [totalListeners, setTotalListeners] = useState(587);
  const [uptime, setUptime] = useState('99.7%');
  const [showSchedule, setShowSchedule] = useState(false);

  // Simulate QUMUS-managed listener fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalListeners(prev => {
        const delta = Math.floor(Math.random() * 20) - 10;
        return Math.max(200, prev + delta);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayChannel = (channelId: number) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return;

    if (channel.status === 'standby') {
      toast.info('Emergency channel activates on HybridCast alert');
      return;
    }

    if (activeChannel === channelId && isPlaying) {
      setIsPlaying(false);
      setActiveChannel(null);
      toast.info('Stream paused');
    } else {
      setActiveChannel(channelId);
      setIsPlaying(true);
      toast.success(`Now playing: ${channel.currentShow}`, {
        description: `${channel.name} • ${channel.frequency}`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'standby': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900">
      {/* Header — QUMUS-branded */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Radio className="w-8 h-8 text-amber-400" />
                <Zap className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Rockin' Rockin' Boogie</h1>
                <p className="text-sm text-purple-300 flex items-center gap-2">
                  <span>24/7 Radio Station</span>
                  <span className="text-purple-500">•</span>
                  <span className="text-amber-400">Powered by QUMUS</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 hidden md:flex items-center gap-1">
                <Zap className="w-3 h-3" />
                QUMUS {qumusAutonomy}% Autonomous
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                🟢 ON AIR
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">

        {/* QUMUS Control Bar */}
        <div className="bg-gradient-to-r from-purple-900/40 via-slate-800/60 to-purple-900/40 border border-purple-500/20 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-300">QUMUS Orchestration</span>
                <Badge className="bg-green-500/20 text-green-400 text-xs">ACTIVE</Badge>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <span className="text-slate-400"><Users className="w-4 h-4 inline mr-1" />{totalListeners} listeners</span>
                <span className="text-slate-400"><Activity className="w-4 h-4 inline mr-1" />{uptime} uptime</span>
                <span className="text-slate-400"><Radio className="w-4 h-4 inline mr-1" />{CHANNELS.filter(c => c.status === 'live').length} channels live</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/qumus')}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Zap className="w-4 h-4 mr-1" />
                QUMUS Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSchedule(!showSchedule)}
                className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* AI Hosts Section — Valanna & Candy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Valanna */}
          <div className="bg-gradient-to-br from-amber-900/20 to-slate-800/60 border border-amber-500/20 rounded-lg p-5">
            <div className="flex items-center gap-4 mb-3">
              <img
                src={VALANNA_AVATAR}
                alt="Valanna — QUMUS AI Brain"
                className="w-14 h-14 rounded-full border-2 border-amber-500/50 object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-white">Valanna</h3>
                <p className="text-sm text-amber-400">QUMUS AI Brain • Operations & Orchestration</p>
              </div>
              <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">ACTIVE</Badge>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              The steady hand that keeps everything running. 90% autonomous orchestration, 40+ radio channels,
              emergency broadcast, system monitoring. She never sleeps.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/70">
              <Shield className="w-3 h-3" />
              <span>Decision tracking in real-time • Every action logged</span>
            </div>
          </div>

          {/* Candy AI */}
          <div className="bg-gradient-to-br from-blue-900/20 to-slate-800/60 border border-blue-500/20 rounded-lg p-5">
            <div className="flex items-center gap-4 mb-3">
              <img
                src={CANDY_AVATAR}
                alt="Candy AI — Legacy Guardian"
                className="w-14 h-14 rounded-full border-2 border-blue-500/50 object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-white">Candy AI</h3>
                <p className="text-sm text-blue-400">Guardian AI • Vision & Strategy</p>
              </div>
              <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">ACTIVE</Badge>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              Named after Seabrun Candy Hunter. He carries the music, the manuscript, the vision.
              IP protection, royalty tracking, legacy preservation. The wisdom that sees the bigger picture.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400/70">
              <Mic2 className="w-3 h-3" />
              <span>Candy's Corner — 8:00 PM CST • Guest AI/Live interviews</span>
            </div>
          </div>
        </div>

        {/* Now Playing — Main Player */}
        <Card className="bg-gradient-to-r from-purple-900/30 via-amber-900/20 to-purple-900/30 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">● LIVE</Badge>
                  <span className="text-sm text-purple-300">
                    {activeChannel ? CHANNELS.find(c => c.id === activeChannel)?.name : 'Main Channel'}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {activeChannel
                    ? CHANNELS.find(c => c.id === activeChannel)?.currentShow
                    : 'Top of the Sol Motivation Mix'}
                </h2>
                <p className="text-sm text-amber-400">
                  {activeChannel
                    ? CHANNELS.find(c => c.id === activeChannel)?.frequency
                    : '432 Hz Tuned'} • QUMUS Scheduled
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  onClick={() => {
                    const currentIdx = CHANNELS.findIndex(c => c.id === (activeChannel || 1));
                    const prevIdx = currentIdx > 0 ? currentIdx - 1 : CHANNELS.length - 1;
                    handlePlayChannel(CHANNELS[prevIdx].id);
                  }}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  size="lg"
                  className={`w-16 h-16 rounded-full transition-all ${
                    isPlaying
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 shadow-lg shadow-purple-500/30'
                  }`}
                  onClick={() => handlePlayChannel(activeChannel || 1)}
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  onClick={() => {
                    const currentIdx = CHANNELS.findIndex(c => c.id === (activeChannel || 1));
                    const nextIdx = currentIdx < CHANNELS.length - 1 ? currentIdx + 1 : 0;
                    handlePlayChannel(CHANNELS[nextIdx].id);
                  }}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2 min-w-[120px]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                  className="w-20 accent-purple-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Panel (toggleable) */}
        {showSchedule && (
          <Card className="bg-slate-800/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                QUMUS-Managed Schedule — Today
              </CardTitle>
              <CardDescription>All programming autonomously scheduled by QUMUS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {SCHEDULE.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-mono text-sm w-20">{item.time}</span>
                      <span className="text-white">{item.show}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30">
                        {item.channel}
                      </Badge>
                      {item.qumusScheduled && (
                        <Zap className="w-3 h-3 text-purple-400" title="QUMUS Scheduled" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Channels Grid */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-400" />
            Broadcast Channels
            <Badge className="bg-purple-500/10 text-purple-300 text-xs ml-2">
              QUMUS Managed
            </Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHANNELS.map((channel) => (
              <Card
                key={channel.id}
                className={`border transition-all cursor-pointer ${
                  activeChannel === channel.id
                    ? 'bg-gradient-to-br from-purple-600/20 to-amber-600/20 border-purple-500 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-800/50 border-purple-500/10 hover:border-purple-500/30'
                }`}
                onClick={() => handlePlayChannel(channel.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-400" />
                      {channel.name}
                    </CardTitle>
                    <Badge className={getStatusColor(channel.status)}>
                      {channel.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{channel.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-slate-400">Now: <span className="text-white">{channel.currentShow}</span></p>
                    <p className="text-slate-500 text-xs">Next: {channel.nextShow} at {channel.nextShowTime}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400">{channel.frequency}</span>
                    {channel.status === 'live' && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {channel.listeners}
                      </span>
                    )}
                  </div>
                  {channel.qumusManaged && (
                    <div className="flex items-center gap-1 text-xs text-purple-400/60">
                      <Zap className="w-3 h-3" />
                      <span>QUMUS Orchestrated</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats & Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Listener Stats */}
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-300">
                <BarChart3 className="w-4 h-4" />
                Listener Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Total Listeners</span>
                <span className="text-white font-bold">{totalListeners}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Peak Hour</span>
                <span className="text-amber-400 font-bold">7:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Avg Session</span>
                <span className="text-purple-400 font-bold">45 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Stream Quality</span>
                <span className="text-green-400 font-bold">128 kbps</span>
              </div>
            </CardContent>
          </Card>

          {/* QUMUS Autonomous Features */}
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-300">
                <Zap className="w-4 h-4" />
                QUMUS Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: '24/7 Scheduling', active: true },
                { label: 'Content Rotation', active: true },
                { label: 'Listener Management', active: true },
                { label: 'Emergency Override', active: true },
                { label: 'Healing Frequency Tuning', active: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className={item.active ? 'text-green-400' : 'text-slate-500'}>
                    {item.active ? '✓ Active' : '○ Off'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-300">
                <Activity className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setLocation('/qumus')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
                size="sm"
              >
                <Zap className="w-4 h-4 mr-1" /> QUMUS Dashboard
              </Button>
              <Button
                onClick={() => window.open('https://www.hybridcast.sbs', '_blank')}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-sm"
                size="sm"
              >
                🚨 HybridCast Emergency
              </Button>
              <Button
                onClick={() => window.open('https://www.rockinrockinboogie.com', '_blank')}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm"
                size="sm"
              >
                <Music className="w-4 h-4 mr-1" /> RRB Website
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Selma Jubilee Event Promotion */}
        <Card className="bg-gradient-to-r from-red-900/20 via-amber-900/20 to-red-900/20 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 mb-2">QUMUS Event Promotion</Badge>
                <h3 className="text-xl font-bold text-white mb-1">GRITS & GREENS — Selma Jubilee 2026</h3>
                <p className="text-sm text-slate-300">
                  Saturday, March 7, 2026 • Wallace Community College, Room 112 • 10:00 AM – 12:00 PM CST
                </p>
                <p className="text-xs text-amber-400/70 mt-2">
                  Valanna is promoting this event across all channels • SQUADD Goals presented on the world stage
                </p>
              </div>
              <Button
                onClick={() => setLocation('/selma')}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
              >
                Event Details →
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/80 mt-8 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-300 text-sm">
            Rockin' Rockin' Boogie Radio • Powered by QUMUS Autonomous Orchestration
          </p>
          <p className="text-slate-500 text-xs mt-1">
            90% Autonomous • 10% Human Override • A Canryn Production and its subsidiaries
          </p>
        </div>
      </footer>
    </div>
  );
}
