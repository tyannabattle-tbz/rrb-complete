import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Radio, Music, Heart, Zap, AlertCircle } from 'lucide-react';

const chartData = [
  { time: '00:00', HybridCast: 240, RockinRockin: 220, SweetMiracles: 150, Canryn: 280 },
  { time: '04:00', HybridCast: 320, RockinRockin: 280, SweetMiracles: 200, Canryn: 320 },
  { time: '08:00', HybridCast: 450, RockinRockin: 420, SweetMiracles: 380, Canryn: 480 },
  { time: '12:00', HybridCast: 620, RockinRockin: 580, SweetMiracles: 520, Canryn: 650 },
  { time: '16:00', HybridCast: 780, RockinRockin: 720, SweetMiracles: 680, Canryn: 800 },
  { time: '20:00', HybridCast: 890, RockinRockin: 850, SweetMiracles: 790, Canryn: 920 },
];

export default function RockinBoogieAdminDashboard() {
  const [activeDecisions, setActiveDecisions] = useState([
    { id: '1', subsystem: 'HybridCast', action: 'broadcast', status: 'executing', autonomy: 95 },
    { id: '2', subsystem: 'Rockin Rockin', action: 'publish-track', status: 'pending-approval', autonomy: 65 },
    { id: '3', subsystem: 'Sweet Miracles', action: 'process-donation', status: 'executing', autonomy: 80 },
    { id: '4', subsystem: 'Canryn', action: 'start-session', status: 'completed', autonomy: 90 },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Rockin Rockin Boogie Admin Dashboard</h1>
          <p className="text-slate-400">Real-time monitoring of all subsystems and autonomous decisions</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Decisions</p>
                  <p className="text-3xl font-bold text-white">24</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Autonomy</p>
                  <p className="text-3xl font-bold text-green-400">82%</p>
                </div>
                <Zap className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Listeners</p>
                  <p className="text-3xl font-bold text-purple-400">12.4K</p>
                </div>
                <Radio className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">System Health</p>
                  <p className="text-3xl font-bold text-green-400">99.8%</p>
                </div>
                <AlertCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="decisions">Active Decisions</TabsTrigger>
            <TabsTrigger value="subsystems">Subsystems</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Legend />
                    <Line type="monotone" dataKey="HybridCast" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="RockinRockin" stroke="#8b5cf6" />
                    <Line type="monotone" dataKey="SweetMiracles" stroke="#ec4899" />
                    <Line type="monotone" dataKey="Canryn" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Subsystem Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'HybridCast', status: 'online', icon: '📡' },
                    { name: 'Rockin Rockin Boogie', status: 'online', icon: '🎵' },
                    { name: 'Sweet Miracles', status: 'online', icon: '💝' },
                    { name: 'Canryn', status: 'online', icon: '🧘' },
                  ].map((sub, idx) => (
                    <div key={`item-${idx}`} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sub.icon}</span>
                        <span className="text-white">{sub.name}</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">{sub.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Decision Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: 'Auto-Execute', value: 18 },
                      { name: 'Pending Approval', value: 4 },
                      { name: 'Completed', value: 156 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            {activeDecisions.map(decision => (
              <Card key={decision.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{decision.subsystem}</h3>
                        <Badge className={
                          decision.status === 'executing' ? 'bg-blue-500/20 text-blue-400' :
                          decision.status === 'pending-approval' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {decision.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">Action: {decision.action}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded h-2">
                          <div
                            className="bg-blue-500 h-2 rounded"
                            style={{ width: `${decision.autonomy}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-400">{decision.autonomy}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Subsystems Tab */}
          <TabsContent value="subsystems" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'HybridCast', icon: '📡', listeners: 3240, broadcasts: 156, uptime: '99.9%' },
                { name: 'Rockin Rockin Boogie', icon: '🎵', listeners: 2890, tracks: 342, uptime: '99.8%' },
                { name: 'Sweet Miracles', icon: '💝', listeners: 1240, donations: 89, uptime: '99.7%' },
                { name: 'Canryn', icon: '🧘', listeners: 4340, sessions: 234, uptime: '99.9%' },
              ].map((sub, idx) => (
                <Card key={`item-${idx}`} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <span className="text-2xl">{sub.icon}</span>
                      {sub.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-700/50 rounded p-2">
                        <p className="text-xs text-slate-400">Listeners</p>
                        <p className="text-lg font-bold text-white">{sub.listeners.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-2">
                        <p className="text-xs text-slate-400">Uptime</p>
                        <p className="text-lg font-bold text-green-400">{sub.uptime}</p>
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-xs text-slate-400">
                        {idx === 0 ? 'Broadcasts' : idx === 1 ? 'Tracks' : idx === 2 ? 'Donations' : 'Sessions'}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {idx === 0 ? sub.broadcasts : idx === 1 ? sub.tracks : idx === 2 ? sub.donations : sub.sessions}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
