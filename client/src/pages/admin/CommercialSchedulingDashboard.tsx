import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Radio, BarChart3, Settings, Play, Pause, Trash2, Plus } from 'lucide-react';

interface CommercialSlot {
  id: string;
  commercialId: string;
  channelId: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'playing' | 'completed' | 'skipped';
  rotationRule: 'every15min' | 'every30min' | 'hourly' | 'custom';
}

interface CommercialMetrics {
  commercialId: string;
  title: string;
  impressions: number;
  clicks: number;
  engagement: number;
  revenue: number;
}

export default function CommercialSchedulingDashboard() {
  const [schedule, setSchedule] = useState<CommercialSlot[]>([
    {
      id: '1',
      commercialId: 'rrb-station-id',
      channelId: 'music_radio',
      scheduledTime: '2026-02-20T09:00:00',
      duration: 30,
      status: 'scheduled',
      rotationRule: 'every30min',
    },
    {
      id: '2',
      commercialId: 'sweet-miracles-psa',
      channelId: 'sweet_miracles',
      scheduledTime: '2026-02-20T09:15:00',
      duration: 60,
      status: 'scheduled',
      rotationRule: 'hourly',
    },
  ]);

  const [metrics, setMetrics] = useState<CommercialMetrics[]>([
    {
      commercialId: 'rrb-station-id',
      title: 'RRB Station ID',
      impressions: 12450,
      clicks: 234,
      engagement: 1.88,
      revenue: 3675,
    },
    {
      commercialId: 'sweet-miracles-psa',
      title: 'Sweet Miracles PSA',
      impressions: 8920,
      clicks: 445,
      engagement: 4.99,
      revenue: 0,
    },
  ]);

  const channels = [
    { id: 'legacy_restored', name: 'Legacy Restored' },
    { id: 'healing_frequencies', name: 'Healing Frequencies' },
    { id: 'proof_vault', name: 'Proof Vault' },
    { id: 'qmunity', name: 'QMunity' },
    { id: 'sweet_miracles', name: 'Sweet Miracles' },
    { id: 'music_radio', name: 'Music & Radio' },
    { id: 'studio_sessions', name: 'Studio Sessions' },
  ];

  const handleAddSlot = () => {
    const newSlot: CommercialSlot = {
      id: `slot-${Date.now()}`,
      commercialId: '',
      channelId: '',
      scheduledTime: new Date().toISOString(),
      duration: 30,
      status: 'scheduled',
      rotationRule: 'every30min',
    };
    setSchedule([...schedule, newSlot]);
  };

  const handleDeleteSlot = (id: string) => {
    setSchedule(schedule.filter(slot => slot.id !== id));
  };

  const handlePlaySlot = (id: string) => {
    setSchedule(schedule.map(slot =>
      slot.id === id ? { ...slot, status: 'playing' as const } : slot
    ));
  };

  const handlePauseSlot = (id: string) => {
    setSchedule(schedule.map(slot =>
      slot.id === id ? { ...slot, status: 'scheduled' as const } : slot
    ));
  };

  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
  const avgEngagement = (metrics.reduce((sum, m) => sum + m.engagement, 0) / metrics.length).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📺 Commercial Scheduling Dashboard</h1>
          <p className="text-slate-300">Manage commercial rotation, scheduling, and performance metrics</p>
        </div>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-600">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Total Scheduled</p>
                    <p className="text-3xl font-bold text-purple-400">{schedule.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Currently Playing</p>
                    <p className="text-3xl font-bold text-green-400">{schedule.filter(s => s.status === 'playing').length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Completed Today</p>
                    <p className="text-3xl font-bold text-blue-400">{schedule.filter(s => s.status === 'completed').length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Channels Active</p>
                    <p className="text-3xl font-bold text-orange-400">{new Set(schedule.map(s => s.channelId)).size}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule Table */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Commercial Schedule</CardTitle>
                  <CardDescription>24-hour rotation schedule across all channels</CardDescription>
                </div>
                <Button
                  onClick={handleAddSlot}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slot
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300">Time</th>
                        <th className="text-left py-3 px-4 text-slate-300">Channel</th>
                        <th className="text-left py-3 px-4 text-slate-300">Duration</th>
                        <th className="text-left py-3 px-4 text-slate-300">Rotation</th>
                        <th className="text-left py-3 px-4 text-slate-300">Status</th>
                        <th className="text-left py-3 px-4 text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((slot) => (
                        <tr key={slot.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                          <td className="py-3 px-4 text-white">
                            <Clock className="w-4 h-4 inline mr-2" />
                            {new Date(slot.scheduledTime).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <Radio className="w-4 h-4 inline mr-2" />
                            {channels.find(c => c.id === slot.channelId)?.name || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{slot.duration}s</td>
                          <td className="py-3 px-4 text-slate-300">{slot.rotationRule}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              slot.status === 'playing' ? 'bg-green-900/50 text-green-300' :
                              slot.status === 'completed' ? 'bg-blue-900/50 text-blue-300' :
                              slot.status === 'skipped' ? 'bg-red-900/50 text-red-300' :
                              'bg-purple-900/50 text-purple-300'
                            }`}>
                              {slot.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            {slot.status !== 'playing' && (
                              <button
                                onClick={() => handlePlaySlot(slot.id)}
                                className="p-1 hover:bg-green-900/30 rounded text-green-400"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {slot.status === 'playing' && (
                              <button
                                onClick={() => handlePauseSlot(slot.id)}
                                className="p-1 hover:bg-yellow-900/30 rounded text-yellow-400"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-1 hover:bg-red-900/30 rounded text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Total Impressions</p>
                    <p className="text-3xl font-bold text-blue-400">{totalImpressions.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Total Clicks</p>
                    <p className="text-3xl font-bold text-green-400">{totalClicks.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Avg Engagement</p>
                    <p className="text-3xl font-bold text-purple-400">{avgEngagement}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-orange-400">${totalRevenue.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Commercial Performance</CardTitle>
                <CardDescription>Individual commercial metrics and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300">Commercial</th>
                        <th className="text-left py-3 px-4 text-slate-300">Impressions</th>
                        <th className="text-left py-3 px-4 text-slate-300">Clicks</th>
                        <th className="text-left py-3 px-4 text-slate-300">Engagement %</th>
                        <th className="text-left py-3 px-4 text-slate-300">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric) => (
                        <tr key={metric.commercialId} className="border-b border-slate-700 hover:bg-slate-700/30">
                          <td className="py-3 px-4 text-white font-semibold">{metric.title}</td>
                          <td className="py-3 px-4 text-slate-300">{metric.impressions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-300">{metric.clicks.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className="text-green-400 font-semibold">{metric.engagement.toFixed(2)}%</span>
                          </td>
                          <td className="py-3 px-4 text-orange-400 font-semibold">${metric.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Rotation Settings</CardTitle>
                <CardDescription>Configure commercial rotation rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <label className="block text-sm font-semibold text-white mb-2">Default Rotation Interval</label>
                  <select className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white">
                    <option>Every 15 minutes</option>
                    <option selected>Every 30 minutes</option>
                    <option>Every hour</option>
                    <option>Custom</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <label className="block text-sm font-semibold text-white mb-2">Commercial Duration</label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">Duration in seconds</p>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <label className="block text-sm font-semibold text-white mb-2">Max Commercials per Hour</label>
                  <input
                    type="number"
                    defaultValue="4"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                  />
                </div>

                <div className="flex gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    💾 Save Settings
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    ↩️ Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
