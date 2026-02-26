import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Heart, Zap, Settings, ExternalLink } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  badge?: string;
}

export function AdminQuickLinks() {
  const quickLinks: QuickLink[] = [
    {
      id: 'hybridcast',
      title: 'HybridCast',
      description: 'Emergency broadcast and mesh networking platform',
      icon: <Radio size={24} className="text-cyan-400" />,
      url: '/hybridcast',
      color: 'from-cyan-900/50 to-blue-900/50',
      badge: 'Emergency Ready',
    },
    {
      id: 'rrb',
      title: 'Rockin\' Rockin\' Boogie',
      description: '501(c)(3) nonprofit radio station and broadcast hub',
      icon: <Heart size={24} className="text-red-400" />,
      url: '/rrb',
      color: 'from-red-900/50 to-pink-900/50',
      badge: 'Nonprofit',
    },
    {
      id: 'canryn',
      title: 'Canryn Production',
      description: 'Production and content management subsidiary',
      icon: <Zap size={24} className="text-yellow-400" />,
      url: '/canryn',
      color: 'from-yellow-900/50 to-orange-900/50',
      badge: 'Production',
    },
    {
      id: 'admin',
      title: 'Admin Settings',
      description: 'System configuration and user management',
      icon: <Settings size={24} className="text-purple-400" />,
      url: '/admin',
      color: 'from-purple-900/50 to-indigo-900/50',
      badge: 'Config',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap size={24} className="text-cyan-400" />
          Quick Navigation
        </h2>
        <p className="text-slate-400 text-sm mt-1">Access key systems and platforms from QUMUS Control Center</p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Card
            key={link.id}
            className={`bg-gradient-to-br ${link.color} border-slate-700 hover:border-slate-500 transition-all cursor-pointer group`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-slate-600/50 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white">{link.title}</CardTitle>
                    {link.badge && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded bg-slate-700/50 text-slate-300">
                        {link.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => window.location.href = link.url}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
              >
                Open
                <ExternalLink size={16} className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">System Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-700/50 rounded">
              <p className="text-xs text-slate-400 mb-1">QUMUS Status</p>
              <p className="text-lg font-bold text-green-400">ACTIVE</p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded">
              <p className="text-xs text-slate-400 mb-1">HybridCast</p>
              <p className="text-lg font-bold text-cyan-400">READY</p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded">
              <p className="text-xs text-slate-400 mb-1">RRB Status</p>
              <p className="text-lg font-bold text-red-400">ONLINE</p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded">
              <p className="text-xs text-slate-400 mb-1">Canryn</p>
              <p className="text-lg font-bold text-yellow-400">RUNNING</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 justify-start">
            <Radio size={16} className="mr-2" />
            Schedule Broadcast
          </Button>
          <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 justify-start">
            <Heart size={16} className="mr-2" />
            View Donations
          </Button>
          <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 justify-start">
            <Zap size={16} className="mr-2" />
            Run System Check
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
