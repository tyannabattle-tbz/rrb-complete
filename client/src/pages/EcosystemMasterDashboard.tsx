import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio, Heart, Zap, Users, TrendingUp, Activity, 
  Settings, Download, RefreshCw, AlertCircle 
} from 'lucide-react';

export default function EcosystemMasterDashboard() {
  const [, navigate] = useLocation();
  const [metrics, setMetrics] = useState({
    qumusStatus: 'online',
    rrbListeners: 2847,
    hybridcastAlerts: 3,
    sweetMiraclesDonations: 15420,
    totalDonors: 342,
    autonomyLevel: 92,
    systemHealth: 98,
    broadcasts24h: 144,
    emergencyBroadcasts: 2,
    activeChannels: 12,
    frequencyDefault: 432,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(prev => ({
      ...prev,
      rrbListeners: Math.floor(Math.random() * 5000) + 1000,
      totalDonors: prev.totalDonors + Math.floor(Math.random() * 5),
    }));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-purple-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">Ecosystem Master Dashboard</h1>
                <p className="text-sm text-purple-300">Real-time monitoring • 90% QUMUS autonomous control</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* QUMUS Status */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-purple-300">QUMUS Core</p>
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>
              <p className="text-3xl font-bold text-purple-400">{metrics.autonomyLevel}%</p>
              <p className="text-xs text-gray-400 mt-2">Autonomous Control</p>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-purple-300">System Health</p>
                <Badge className="bg-green-500/20 text-green-400">Healthy</Badge>
              </div>
              <p className="text-3xl font-bold text-green-400">{metrics.systemHealth}%</p>
              <p className="text-xs text-gray-400 mt-2">All Systems Operational</p>
            </CardContent>
          </Card>

          {/* Active Channels */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-purple-300">Active Channels</p>
                <Badge className="bg-blue-500/20 text-blue-400">{metrics.activeChannels}</Badge>
              </div>
              <p className="text-3xl font-bold text-blue-400">{metrics.activeChannels}</p>
              <p className="text-xs text-gray-400 mt-2">24/7 Broadcasting</p>
            </CardContent>
          </Card>

          {/* Default Frequency */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-purple-300">Default Frequency</p>
                <Badge className="bg-pink-500/20 text-pink-400">{metrics.frequencyDefault}Hz</Badge>
              </div>
              <p className="text-3xl font-bold text-pink-400">{metrics.frequencyDefault}Hz</p>
              <p className="text-xs text-gray-400 mt-2">Healing Frequency</p>
            </CardContent>
          </Card>
        </div>

        {/* Three Systems Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* QUMUS Orchestration */}
          <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                QUMUS Orchestration
              </CardTitle>
              <CardDescription className="text-purple-300">Central autonomous brain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Policy Decisions</span>
                  <span className="text-purple-400 font-bold">847</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Tasks Executed</span>
                  <span className="text-purple-400 font-bold">12,394</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Human Overrides</span>
                  <span className="text-purple-400 font-bold">23</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin', { replace: false })}
                className="w-full bg-purple-600 hover:bg-purple-700" 
                size="sm"
              >
                Control Panel
              </Button>
            </CardContent>
          </Card>

          {/* RRB Radio */}
          <Card className="bg-gradient-to-br from-pink-600/20 to-orange-600/20 border-pink-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-pink-400" />
                RRB Radio Station
              </CardTitle>
              <CardDescription className="text-pink-300">24/7 Broadcasting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Active Listeners</span>
                  <span className="text-pink-400 font-bold">{metrics.rrbListeners.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Broadcasts (24h)</span>
                  <span className="text-pink-400 font-bold">{metrics.broadcasts24h}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Solbones Games</span>
                  <span className="text-pink-400 font-bold">342</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/music', { replace: false })}
                className="w-full bg-pink-600 hover:bg-pink-700" 
                size="sm"
              >
                Access RRB
              </Button>
            </CardContent>
          </Card>

          {/* HybridCast Emergency */}
          <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                HybridCast Emergency
              </CardTitle>
              <CardDescription className="text-orange-300">Emergency broadcast system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Active Alerts</span>
                  <span className="text-orange-400 font-bold">{metrics.hybridcastAlerts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Emergency Broadcasts</span>
                  <span className="text-orange-400 font-bold">{metrics.emergencyBroadcasts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Mesh Network</span>
                  <span className="text-orange-400 font-bold">Active</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/hybridcast', { replace: false })}
                className="w-full bg-orange-600 hover:bg-orange-700" 
                size="sm"
              >
                Emergency Control
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sweet Miracles Donations */}
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-400" />
              Sweet Miracles Impact
            </CardTitle>
            <CardDescription className="text-green-300">501(c)(3) & 508 Organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-300 mb-2">Total Donations</p>
                <p className="text-3xl font-bold text-green-400">${(metrics.sweetMiraclesDonations / 100).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-2">Total Donors</p>
                <p className="text-3xl font-bold text-green-400">{metrics.totalDonors}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-2">Avg Donation</p>
                <p className="text-3xl font-bold text-green-400">${(metrics.sweetMiraclesDonations / metrics.totalDonors).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-2">Mission</p>
                <p className="text-lg font-bold text-green-400">"A Voice for the Voiceless"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Logs & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', event: 'RRB broadcast started', status: 'success' },
                  { time: '5 min ago', event: 'Listener milestone: 2,847 active', status: 'success' },
                  { time: '12 min ago', event: 'Solbones game completed', status: 'success' },
                  { time: '18 min ago', event: 'Donation received: $50', status: 'success' },
                  { time: '25 min ago', event: 'System health check passed', status: 'success' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-700/50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{item.event}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate('/admin', { replace: false })}
                className="w-full bg-purple-600 hover:bg-purple-700 justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                QUMUS Configuration
              </Button>
              <Button 
                onClick={() => navigate('/rrb/broadcast-manager', { replace: false })}
                className="w-full bg-pink-600 hover:bg-pink-700 justify-start"
              >
                <Radio className="w-4 h-4 mr-2" />
                RRB Broadcast Control
              </Button>
              <Button 
                onClick={() => navigate('/hybridcast', { replace: false })}
                className="w-full bg-orange-600 hover:bg-orange-700 justify-start"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Emergency Broadcast
              </Button>
              <Button 
                onClick={() => navigate('/sweet-miracles', { replace: false })}
                className="w-full bg-green-600 hover:bg-green-700 justify-start"
              >
                <Heart className="w-4 h-4 mr-2" />
                Sweet Miracles Dashboard
              </Button>
              <Button 
                onClick={() => window.print()}
                className="w-full bg-slate-700 hover:bg-slate-600 justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">
            RRB Ecosystem Master Dashboard • Canryn Production & Subsidiaries
          </p>
          <p className="text-sm">
            Powered by QUMUS Autonomous Orchestration • Supporting Sweet Miracles 501(c)(3)
          </p>
        </div>
      </footer>
    </div>
  );
}
