import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Radio,
  Clock,
  Globe,
  Heart,
  Share2,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data for analytics
const mockListenerData = [
  { time: '12:00 AM', listeners: 145, engagement: 62 },
  { time: '4:00 AM', listeners: 89, engagement: 45 },
  { time: '8:00 AM', listeners: 342, engagement: 78 },
  { time: '12:00 PM', listeners: 521, engagement: 85 },
  { time: '4:00 PM', listeners: 678, engagement: 88 },
  { time: '8:00 PM', listeners: 892, engagement: 92 },
  { time: '12:00 AM', listeners: 756, engagement: 87 },
];

const mockChannelData = [
  { name: 'Healing Frequencies', listeners: 342, percentage: 28 },
  { name: 'Legacy Stories', listeners: 289, percentage: 24 },
  { name: 'Community Voices', listeners: 234, percentage: 19 },
  { name: 'Music & Healing', listeners: 198, percentage: 16 },
  { name: 'Broadcasting Impact', listeners: 156, percentage: 13 },
];

const mockDeviceData = [
  { name: 'Mobile', value: 45, color: '#ec4899' },
  { name: 'Desktop', value: 35, color: '#f97316' },
  { name: 'Tablet', value: 12, color: '#06b6d4' },
  { name: 'Smart Speaker', value: 8, color: '#8b5cf6' },
];

const mockGeographicData = [
  { region: 'North America', listeners: 456, growth: 12 },
  { region: 'Europe', listeners: 234, growth: 8 },
  { region: 'South America', listeners: 189, growth: 15 },
  { region: 'Africa', listeners: 145, growth: 22 },
  { region: 'Asia', listeners: 198, growth: 18 },
];

const COLORS = ['#ec4899', '#f97316', '#06b6d4', '#8b5cf6', '#10b981'];

export default function ListenerAnalyticsDashboard() {
  const [isLive, setIsLive] = useState(true);
  const [totalListeners, setTotalListeners] = useState(2219);
  const [avgEngagement, setAvgEngagement] = useState(82);
  const [peakTime, setPeakTime] = useState('8:00 PM');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTotalListeners((prev) => prev + Math.floor(Math.random() * 20 - 10));
      setAvgEngagement((prev) => Math.max(0, Math.min(100, prev + Math.random() * 4 - 2)));
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleRefresh = () => {
    setLastUpdated(new Date());
    toast.success('Analytics refreshed!');
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      totalListeners,
      avgEngagement,
      peakTime,
      channels: mockChannelData,
      devices: mockDeviceData,
      regions: mockGeographicData,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rrb-analytics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Analytics exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Listener Analytics
              </h1>
              <p className="text-pink-300">Real-time engagement and listener metrics</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsLive(!isLive)}
                variant={isLive ? 'default' : 'outline'}
                className={isLive ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-300 animate-pulse' : ''}`} />
                {isLive ? 'Live' : 'Paused'}
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-pink-600/20 to-orange-600/20 border-pink-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-pink-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Listeners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalListeners.toLocaleString()}</div>
              <p className="text-xs text-pink-300 mt-1">+12% from last hour</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{avgEngagement.toFixed(1)}%</div>
              <p className="text-xs text-blue-300 mt-1">Excellent engagement</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Peak Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{peakTime}</div>
              <p className="text-xs text-purple-300 mt-1">Highest listener count</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Avg Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">42m 15s</div>
              <p className="text-xs text-green-300 mt-1">+8% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Listener Trend */}
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-white">Listener Trend (24h)</CardTitle>
              <CardDescription className="text-pink-300">Real-time listener count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockListenerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #ec4899',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="listeners"
                    stroke="#ec4899"
                    dot={{ fill: '#ec4899' }}
                    name="Listeners"
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#06b6d4"
                    dot={{ fill: '#06b6d4' }}
                    name="Engagement %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Distribution */}
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-white">Device Distribution</CardTitle>
              <CardDescription className="text-pink-300">Listeners by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockDeviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockDeviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #ec4899',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance & Geographic Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Channels */}
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-white">Top Channels</CardTitle>
              <CardDescription className="text-pink-300">Most listened channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockChannelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #ec4899',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="listeners" fill="#ec4899" name="Listeners" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-white">Geographic Distribution</CardTitle>
              <CardDescription className="text-pink-300">Listeners by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockGeographicData.map((region, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-pink-300">{region.region}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {region.listeners.toLocaleString()}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-green-500/50 text-green-300 text-xs"
                        >
                          +{region.growth}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-600 to-orange-600 h-2 rounded-full"
                        style={{
                          width: `${(region.listeners / 500) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
