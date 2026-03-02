import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Volume2, Users, Music } from 'lucide-react';

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

  useEffect(() => {
    // Fetch RRB status from port 3001
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/rrb/status');
        const data = await response.json();
        setRadioStatus(data);
      } catch (error) {
        console.error('Failed to fetch RRB status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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
                <Button className="flex-1 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Play Stream
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
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
              <Card key={channel.id} className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
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
                    <Button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                      Listen Now
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
              <Button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
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
              <Button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RRB Features */}
        <Card className="bg-slate-800/50 border-pink-500/20 mb-12">
          <CardHeader>
            <CardTitle>RRB Ecosystem</CardTitle>
            <CardDescription>Integrated features and experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🎵', name: '24/7 Broadcasting', desc: 'Continuous radio service' },
                { icon: '🧘', name: 'Healing Frequencies', desc: '9 Solfeggio frequencies' },
                { icon: '🎲', name: 'Solbones Game', desc: 'Sacred math dice game' },
                { icon: '💝', name: 'Donations', desc: 'Support the mission' },
                { icon: '🛍️', name: 'Merchandise', desc: 'RRB products' },
                { icon: '📊', name: 'Analytics', desc: 'Listener insights' },
              ].map((feature, idx) => (
                <div key={idx} className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <p className="font-semibold text-white">{feature.name}</p>
                  <p className="text-sm text-pink-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="bg-slate-800/50 border-pink-500/20">
          <CardHeader>
            <CardTitle>Station Controls</CardTitle>
            <CardDescription>Manage RRB operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                📻 Stream Control
              </Button>
              <Button className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                📅 Schedule
              </Button>
              <Button className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                🎧 Audio Settings
              </Button>
              <Button className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                📊 Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-pink-300">
          <p>Rockin Rockin Boogie • 24/7 Radio Broadcasting</p>
          <p className="text-sm mt-2">Orchestrated by Qumus • Offline Capable</p>
        </div>
      </footer>
    </div>
  );
}
