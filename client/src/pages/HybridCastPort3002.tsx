import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wifi, MapPin, Clock } from 'lucide-react';

export default function HybridCastPort3002() {
  const [emergencyStatus, setEmergencyStatus] = useState({
    status: 'online',
    activeAlerts: 0,
    meshNodes: 12,
    offlineCapable: true,
  });

  const [alerts, setAlerts] = useState([
    { id: 1, severity: 'low', message: 'System check completed', time: '2 hours ago' },
    { id: 2, severity: 'medium', message: 'Network latency detected', time: '30 minutes ago' },
  ]);

  useEffect(() => {
    // Fetch HybridCast status from port 3002
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/hybridcast/status');
        const data = await response.json();
        setEmergencyStatus(data);
      } catch (error) {
        console.error('Failed to fetch HybridCast status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-red-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">HybridCast</h1>
                <p className="text-sm text-red-300">Emergency Broadcast System • Port 3002</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                🟢 {emergencyStatus.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Emergency Broadcast System</h2>
          <p className="text-xl text-red-300 mb-8 max-w-3xl mx-auto">
            HybridCast provides offline-first emergency communication with mesh networking capabilities.
            Broadcast critical alerts and emergency information even when internet is unavailable.
          </p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white capitalize">{emergencyStatus.status}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{emergencyStatus.activeAlerts}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Mesh Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{emergencyStatus.meshNodes}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300">Offline Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {emergencyStatus.offlineCapable ? '✓ Ready' : '✗ Unavailable'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Creation */}
        <Card className="bg-gradient-to-r from-red-600/20 to-yellow-600/20 border-red-500/50 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Create Emergency Alert</CardTitle>
            <CardDescription>Broadcast critical information to all connected systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2">Alert Severity</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                    <Button
                      key={level}
                      className={`flex-1 ${
                        level === 'Critical'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-2 bg-slate-700 border border-red-500/30 rounded-lg text-white placeholder-red-300/50 focus:outline-none focus:border-red-500"
                  placeholder="Enter emergency alert message..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2">Broadcast Channels</label>
                <div className="flex gap-2">
                  {['RRB', 'Social', 'SMS', 'Mesh'].map((channel) => (
                    <Button key={channel} className="flex-1 bg-slate-700 hover:bg-slate-600">
                      ☑ {channel}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-lg py-6">
                🚨 Broadcast Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Alerts</h3>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="bg-slate-800/50 border-red-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Badge
                        className={`${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400'
                            : alert.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                      <div>
                        <p className="text-white font-medium">{alert.message}</p>
                        <p className="text-sm text-red-300 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.time}
                        </p>
                      </div>
                    </div>
                    <Button className="bg-slate-700 hover:bg-slate-600">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-red-400" />
                Mesh Networking
              </CardTitle>
              <CardDescription>Offline-first communication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-300">
                HybridCast uses mesh networking to relay emergency alerts even when internet is unavailable.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">Active Nodes</span>
                  <span className="text-red-400 font-bold">{emergencyStatus.meshNodes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">Network Range</span>
                  <span className="text-red-400 font-bold">~5 miles</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                Mesh Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" />
                Location Tracking
              </CardTitle>
              <CardDescription>Emergency response coordination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-300">
                Track alert distribution and emergency response across geographic regions.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">Coverage Area</span>
                  <span className="text-red-400 font-bold">Multi-region</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">Response Time</span>
                  <span className="text-red-400 font-bold">&lt;30 seconds</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                Map View
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* HybridCast Features */}
        <Card className="bg-slate-800/50 border-red-500/20 mb-12">
          <CardHeader>
            <CardTitle>HybridCast Capabilities</CardTitle>
            <CardDescription>Emergency broadcast features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                '🚨 Emergency Alerts',
                '📡 Mesh Networking',
                '📱 Multi-Channel',
                '🗺️ Location Tracking',
                '⚡ Offline Operation',
                '🔄 Auto-Relay',
                '📊 Alert Analytics',
                '🔐 Secure Broadcast',
                '⏱️ Real-time Updates',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-green-400">✓</span>
                  <span className="text-red-300">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="bg-slate-800/50 border-red-500/20">
          <CardHeader>
            <CardTitle>Emergency Controls</CardTitle>
            <CardDescription>Manage emergency broadcast operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                🚨 Create Alert
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                📡 Mesh Status
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                📊 Analytics
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                ⚙️ Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-red-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-red-300">
          <p>HybridCast Emergency Broadcast System • Offline Capable • Mesh Enabled</p>
          <p className="text-sm mt-2">Orchestrated by Qumus • Always Ready</p>
        </div>
      </footer>
    </div>
  );
}
