import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Auto-play RRB audio on entry (low volume)
  useEffect(() => {
    if (user) {
      const audio = new Audio('/rrb-theme.mp3');
      audio.volume = 0.2; // Low volume
      audio.loop = true;
      audio.play().catch(() => {
        console.log('Autoplay blocked, user interaction required');
      });
      setAudioPlaying(true);

      return () => {
        audio.pause();
      };
    }
  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show login options if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Zap className="w-12 h-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl text-white">QUMUS</CardTitle>
            <CardDescription className="text-slate-400">
              Autonomous Orchestration Engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300 text-center">
              90%+ Autonomy • Full Ecosystem Control
            </p>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => {
                  const loginUrl = new URL('/api/oauth/login', window.location.origin);
                  window.location.href = loginUrl.toString();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Sign In to QUMUS
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  window.location.href = '/api/test-login';
                }}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                size="lg"
              >
                Test Login (Dev Mode)
              </Button>
            </div>

            <div className="mt-6 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <p className="font-semibold">Development Mode</p>
                <p className="mt-1">Use "Test Login" to access QUMUS Control Center without OAuth authentication.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated user - show ecosystem dashboard
  const systems = [
    {
      id: 'qumus',
      title: '🧠 Qumus Orchestration',
      description: 'Autonomous AI orchestration engine. 90% autonomous control with human oversight.',
      features: ['Task Execution', 'Policy Decisions', 'LLM Integration', 'Real-time Monitoring'],
      color: 'from-purple-600 to-blue-600',
      path: '/qumus',
      status: 'Active',
    },
    {
      id: 'rrb',
      title: '📻 Rockin Rockin Boogie',
      description: 'Complete radio station ecosystem with healing frequencies, games, and community.',
      features: ['24/7 Radio', 'Healing Frequencies', 'Solbones Game', 'Listener Analytics'],
      color: 'from-pink-600 to-orange-600',
      path: '/rrb',
      status: 'Active',
    },
    {
      id: 'hybridcast',
      title: '🚨 HybridCast Emergency',
      description: 'Offline-first emergency broadcast system. Mesh networking for disaster communication.',
      features: ['Emergency Alerts', 'Offline PWA', 'Mesh Network', 'Multi-Channel Broadcast'],
      color: 'from-red-600 to-yellow-600',
      path: '/emergency',
      status: 'Active',
    },
    {
      id: 'donations',
      title: '💝 Sweet Miracles',
      description: 'Nonprofit donation platform. Supporting legacy recovery and community impact.',
      features: ['Donations', 'Impact Tracking', 'Nonprofit Metrics', 'Community Support'],
      color: 'from-green-600 to-emerald-600',
      path: '/donations',
      status: 'Active',
    },
    {
      id: 'shop',
      title: '🛍️ Merchandise',
      description: 'RRB merchandise shop. Support the mission through community products.',
      features: ['Products', 'Inventory', 'Orders', 'Community Support'],
      color: 'from-indigo-600 to-purple-600',
      path: '/shop',
      status: 'Active',
    },
    {
      id: 'analytics',
      title: '📊 Analytics Dashboard',
      description: 'Unified analytics across all systems. Real-time metrics and insights.',
      features: ['System Metrics', 'User Analytics', 'Performance Data', 'Reports'],
      color: 'from-cyan-600 to-blue-600',
      path: '/analytics',
      status: 'Active',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎵</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  RRB Ecosystem
                </h1>
                <p className="text-sm text-purple-300">Offline. Autonomous. Yours.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                All Systems Online
              </Badge>
              {audioPlaying && (
                <Badge variant="outline" className="border-pink-500 text-pink-400">
                  🎶 Playing
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Complete Ecosystem for Community
          </h2>
          <p className="text-xl text-purple-300 mb-8 max-w-2xl mx-auto">
            Autonomous orchestration, 24/7 broadcasting, emergency communication, and community support.
            Everything you need, completely offline.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setLocation('/qumus')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              Enter Qumus →
            </Button>
            <Button
              onClick={() => setLocation('/rrb')}
              className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
              size="lg"
            >
              Go to RRB Radio →
            </Button>
            <Button
              onClick={() => setLocation('/emergency')}
              className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
              size="lg"
            >
              Emergency Broadcast →
            </Button>
          </div>
        </div>

        {/* System Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <Card
              key={system.id}
              className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/20"
              onClick={() => setLocation(system.path)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-2xl">{system.title}</CardTitle>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    {system.status}
                  </Badge>
                </div>
                <CardDescription className="text-purple-300">
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
                        className="bg-purple-500/20 text-purple-300 border-purple-500/50"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => setLocation(system.path)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Access →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t border-purple-500/20">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">Ecosystem Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="text-lg font-semibold text-white mb-2">100% Offline</h4>
            <p className="text-purple-300">Complete operation without internet connection</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="text-lg font-semibold text-white mb-2">90% Autonomous</h4>
            <p className="text-purple-300">Qumus AI makes decisions with human oversight</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h4 className="text-lg font-semibold text-white mb-2">Community First</h4>
            <p className="text-purple-300">Built for collective impact and legacy</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-lg font-semibold text-white mb-2">Always Ready</h4>
            <p className="text-purple-300">24/7 operation on your Mac mini</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-purple-300">
          <p>Built with ❤️ for RRB by Qumus</p>
          <p className="text-sm mt-2">Offline. Autonomous. Yours.</p>
        </div>
      </footer>
    </div>
  );
}
