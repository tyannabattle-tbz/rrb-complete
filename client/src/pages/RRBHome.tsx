import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Music, Users, Gamepad2, Shield, Globe, Play, ChevronRight, Zap } from 'lucide-react';

export default function RRBHome() {
  const [, setLocation] = useLocation();
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);

  const systems = [
    {
      id: 'music',
      icon: Radio,
      title: '📻 41-Channel Radio',
      description: 'Solfeggio frequency streaming with real-time listener tracking',
      features: ['24/7 Streaming', '41 Channels', 'Healing Frequencies', 'Live Stats'],
      path: '/music',
      color: 'from-pink-600 to-orange-600',
    },
    {
      id: 'proof',
      icon: Shield,
      title: '🔐 Proof Vault',
      description: 'Verified documentation and evidence archive',
      features: ['8 Categories', 'Verified Docs', 'Wayback Machine', 'Blockchain Auth'],
      path: '/proof',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      id: 'legacy',
      icon: Globe,
      title: '📖 Legacy Biography',
      description: 'Complete timeline and family history (1971–2025)',
      features: ['7 Eras', 'Family Tree', 'Achievements', 'Verified Records'],
      path: '/legacy',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      id: 'solbones',
      icon: Gamepad2,
      title: '🎮 Solbones Game',
      description: 'Official 4+3+2 dice game with tournaments',
      features: ['Multiplayer', 'Tournaments', 'Leaderboards', 'Frequency Audio'],
      path: '/solbones',
      color: 'from-yellow-600 to-orange-600',
    },
    {
      id: 'squadd',
      icon: Users,
      title: '🚨 SQUADD System',
      description: 'Emergency response coordination and volunteer network',
      features: ['5 Teams', 'Missions', 'Volunteers', 'Alerts'],
      path: '/squadd',
      color: 'from-red-600 to-pink-600',
    },
    {
      id: 'community',
      icon: Users,
      title: '💬 Community Hub',
      description: 'Forums, messaging, and announcements',
      features: ['Forums', 'Messaging', 'Announcements', 'Notifications'],
      path: '/community',
      color: 'from-green-600 to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-pink-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎵</div>
              <div>
                <h1 className="text-3xl font-bold text-white">Rockin' Rockin' Boogie</h1>
                <p className="text-sm text-pink-300">Complete Ecosystem for Community</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              All Systems Online
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            A Legacy Restored
          </h2>
          <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
            The complete story, music, and verified documentation of Seabrun Candy Hunter's musical legacy. 41 Solfeggio frequency channels, emergency response, community support, and so much more.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setLocation('/music')}
              className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Listen to the Music
            </Button>
            <Button
              onClick={() => setLocation('/proof')}
              variant="outline"
              className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
              size="lg"
            >
              Explore the Proof Vault →
            </Button>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="bg-slate-800/50 border-pink-500/20 mb-16">
          <CardContent className="pt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-slate-300 leading-relaxed">
              Rockin' Rockin' Boogie is a preservation project dedicated to restoring, documenting, and celebrating Seabrun Candy Hunter's musical legacy. We provide 24/7 Solfeggio frequency broadcasting, community support through SQUADD emergency response, healing frequencies, and complete verified documentation of over 50 years of musical innovation and community service.
            </p>
          </CardContent>
        </Card>

        {/* Systems Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Complete Ecosystem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map((system) => {
              const Icon = system.icon;
              return (
                <Card
                  key={system.id}
                  className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-pink-500/20"
                  onClick={() => setLocation(system.path)}
                  onMouseEnter={() => setHoveredSystem(system.id)}
                  onMouseLeave={() => setHoveredSystem(null)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-8 h-8 text-pink-500" />
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        Active
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white">{system.title}</CardTitle>
                    <CardDescription className="text-slate-300">
                      {system.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {system.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="secondary"
                            className="bg-pink-500/20 text-pink-300 border-pink-500/50 text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(system.path);
                        }}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        size="sm"
                      >
                        Enter {system.title.split(' ')[1]} <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* UN SDG Banner */}
        <Card className="bg-gradient-to-r from-blue-900/30 to-green-900/30 border-blue-500/20 mb-16">
          <CardContent className="pt-8">
            <h3 className="text-2xl font-bold text-white mb-4">🌍 UN Sustainable Development Goals</h3>
            <p className="text-slate-300 mb-6">
              Rockin' Rockin' Boogie is committed to supporting the United Nations Sustainable Development Goals through community support, emergency response coordination, and healing frequency broadcasting.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Badge className="bg-blue-500/30 border-blue-500 text-blue-200 p-2 text-center justify-center">
                Goal 3: Good Health
              </Badge>
              <Badge className="bg-blue-500/30 border-blue-500 text-blue-200 p-2 text-center justify-center">
                Goal 4: Quality Education
              </Badge>
              <Badge className="bg-blue-500/30 border-blue-500 text-blue-200 p-2 text-center justify-center">
                Goal 5: Gender Equality
              </Badge>
              <Badge className="bg-blue-500/30 border-blue-500 text-blue-200 p-2 text-center justify-center">
                Goal 10: Reduced Inequalities
              </Badge>
              <Badge className="bg-blue-500/30 border-blue-500 text-blue-200 p-2 text-center justify-center">
                Goal 13: Climate Action
              </Badge>
              <Badge className="bg-blue-500/30 border-blue-500 text-blue-200 p-2 text-center justify-center">
                Goal 17: Partnerships
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-pink-400">41</div>
              <p className="text-sm text-slate-400 mt-2">Radio Channels</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-400">54+</div>
              <p className="text-sm text-slate-400 mt-2">Years of Legacy</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-400">100%</div>
              <p className="text-sm text-slate-400 mt-2">Verified Docs</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-400">24/7</div>
              <p className="text-sm text-slate-400 mt-2">Broadcasting</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-500/20 bg-slate-900/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 mb-2">A Canryn Production and its subsidiaries</p>
          <p className="text-xs text-slate-500">"A Voice for the Voiceless" — Sweet Miracles 501(c)(3) & 508</p>
          <p className="text-xs text-slate-500 mt-4">Powered by QUMUS Autonomous Orchestration Engine</p>
        </div>
      </footer>
    </div>
  );
}
