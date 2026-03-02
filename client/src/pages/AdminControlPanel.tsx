import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Users, Radio, Heart, AlertTriangle, 
  CheckCircle, Power, RotateCcw, Download, Upload 
} from 'lucide-react';

export default function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemState, setSystemState] = useState({
    qumusRunning: true,
    rrbBroadcasting: true,
    hybridcastActive: true,
    sweetMiraclesProcessing: true,
  });

  const handleSystemToggle = (system: string) => {
    setSystemState(prev => ({
      ...prev,
      [system]: !prev[system],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Control Panel</h1>
                <p className="text-sm text-gray-400">Ecosystem management & configuration</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400">Admin Access</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: 'QUMUS Core', status: systemState.qumusRunning, icon: '⚡' },
                { name: 'RRB Radio', status: systemState.rrbBroadcasting, icon: '📻' },
                { name: 'HybridCast', status: systemState.hybridcastActive, icon: '🚨' },
                { name: 'Sweet Miracles', status: systemState.sweetMiraclesProcessing, icon: '❤️' },
              ].map((system, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{system.icon}</span>
                      <Badge className={system.status ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {system.status ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="font-semibold text-white mb-3">{system.name}</p>
                    <Button
                      onClick={() => handleSystemToggle(system.name.toLowerCase().replace(' ', ''))}
                      size="sm"
                      className={system.status ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {system.status ? 'Stop' : 'Start'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Key Metrics */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-blue-400">2,847</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Donations</p>
                    <p className="text-3xl font-bold text-green-400">$15.4K</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Broadcasts (24h)</p>
                    <p className="text-3xl font-bold text-pink-400">144</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">System Uptime</p>
                    <p className="text-3xl font-bold text-purple-400">99.8%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems" className="space-y-6">
            {/* QUMUS Configuration */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Power className="w-5 h-5 text-blue-400" />
                  QUMUS Orchestration Engine
                </CardTitle>
                <CardDescription>Central autonomous control system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Autonomy Level</p>
                    <p className="text-2xl font-bold text-blue-400">92%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Policy Decisions</p>
                    <p className="text-2xl font-bold text-blue-400">847</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Policies
                  </Button>
                  <Button className="flex-1 bg-slate-700 hover:bg-slate-600">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RRB Configuration */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-pink-400" />
                  RRB Radio Station
                </CardTitle>
                <CardDescription>24/7 broadcasting system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Active Listeners</p>
                    <p className="text-2xl font-bold text-pink-400">2,847</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Active Channels</p>
                    <p className="text-2xl font-bold text-pink-400">12</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-pink-600 hover:bg-pink-700">
                    <Radio className="w-4 h-4 mr-2" />
                    Broadcast Control
                  </Button>
                  <Button className="flex-1 bg-slate-700 hover:bg-slate-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sweet Miracles Configuration */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-400" />
                  Sweet Miracles Donations
                </CardTitle>
                <CardDescription>501(c)(3) payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Total Donations</p>
                    <p className="text-2xl font-bold text-green-400">$15.4K</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Total Donors</p>
                    <p className="text-2xl font-bold text-green-400">342</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button className="flex-1 bg-slate-700 hover:bg-slate-600">
                    <Settings className="w-4 h-4 mr-2" />
                    Stripe Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Admin User', role: 'System Admin', status: 'Active' },
                    { name: 'RRB Broadcaster', role: 'Broadcaster', status: 'Active' },
                    { name: 'HybridCast Operator', role: 'Operator', status: 'Active' },
                    { name: 'Sweet Miracles Manager', role: 'Manager', status: 'Active' },
                  ].map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.role}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">{user.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-white">Default Frequency</span>
                    <span className="text-blue-400 font-bold">432Hz</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-white">Max Listeners</span>
                    <span className="text-blue-400 font-bold">10,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-white">Backup Frequency</span>
                    <span className="text-blue-400 font-bold">Daily</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-white">Autonomy Mode</span>
                    <Badge className="bg-blue-500/20 text-blue-400">Enabled</Badge>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">Admin Control Panel • Canryn Production</p>
          <p className="text-sm">Authorized personnel only • All actions logged</p>
        </div>
      </footer>
    </div>
  );
}
