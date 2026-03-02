import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Radio, Clock } from 'lucide-react';

interface ListenerMetrics {
  timestamp: number;
  activeListeners: number;
  totalSessions: number;
  averageSessionDuration: number;
  peakListeners: number;
  streamQuality: number;
}

interface EngagementData {
  hour: string;
  listeners: number;
  engagement: number;
}

interface DeviceBreakdown {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ListenerAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ListenerMetrics[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown[]>([]);
  const [currentListeners, setCurrentListeners] = useState(0);
  const [peakListeners, setPeakListeners] = useState(0);
  const [avgQuality, setAvgQuality] = useState(0);

  useEffect(() => {
    // Generate mock data
    generateMockData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      updateMetrics();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const generateMockData = () => {
    // Historical metrics
    const mockMetrics: ListenerMetrics[] = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = Date.now() - i * 3600000;
      mockMetrics.push({
        timestamp,
        activeListeners: Math.floor(Math.random() * 5000) + 1000,
        totalSessions: Math.floor(Math.random() * 500) + 100,
        averageSessionDuration: Math.floor(Math.random() * 3600) + 600,
        peakListeners: Math.floor(Math.random() * 8000) + 2000,
        streamQuality: Math.floor(Math.random() * 30) + 70,
      });
    }
    setMetrics(mockMetrics);

    // Engagement by hour
    const mockEngagement: EngagementData[] = [];
    for (let i = 0; i < 24; i++) {
      mockEngagement.push({
        hour: `${i}:00`,
        listeners: Math.floor(Math.random() * 5000) + 1000,
        engagement: Math.floor(Math.random() * 100),
      });
    }
    setEngagementData(mockEngagement);

    // Device breakdown
    setDeviceBreakdown([
      { name: 'Desktop', value: 45, color: COLORS[0] },
      { name: 'Mobile', value: 35, color: COLORS[1] },
      { name: 'Tablet', value: 12, color: COLORS[2] },
      { name: 'Smart Speaker', value: 5, color: COLORS[3] },
      { name: 'Car Audio', value: 3, color: COLORS[4] },
    ]);

    // Set current stats
    const latest = mockMetrics[mockMetrics.length - 1];
    setCurrentListeners(latest.activeListeners);
    setPeakListeners(Math.max(...mockMetrics.map(m => m.peakListeners)));
    setAvgQuality(Math.round(mockMetrics.reduce((sum, m) => sum + m.streamQuality, 0) / mockMetrics.length));
  };

  const updateMetrics = () => {
    setMetrics(prev => {
      const updated = [...prev];
      updated.shift();
      updated.push({
        timestamp: Date.now(),
        activeListeners: Math.floor(Math.random() * 5000) + 1000,
        totalSessions: Math.floor(Math.random() * 500) + 100,
        averageSessionDuration: Math.floor(Math.random() * 3600) + 600,
        peakListeners: Math.floor(Math.random() * 8000) + 2000,
        streamQuality: Math.floor(Math.random() * 30) + 70,
      });
      return updated;
    });

    setCurrentListeners(Math.floor(Math.random() * 5000) + 1000);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Listeners Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Listeners</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentListeners.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Live listeners right now</p>
            <Badge className="mt-2 bg-green-100 text-green-800">LIVE</Badge>
          </CardContent>
        </Card>

        {/* Peak Listeners Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Listeners</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakListeners.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Today's peak</p>
          </CardContent>
        </Card>

        {/* Stream Quality Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stream Quality</CardTitle>
            <Radio className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgQuality}%</div>
            <p className="text-xs text-gray-500">Average quality score</p>
          </CardContent>
        </Card>

        {/* Avg Session Duration Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics[metrics.length - 1]?.averageSessionDuration || 0)}</div>
            <p className="text-xs text-gray-500">Per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        {/* Timeline Chart */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Listener Timeline</CardTitle>
              <CardDescription>Active listeners over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(ts) => new Date(ts).toLocaleString()}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="activeListeners" 
                    stroke="#3b82f6" 
                    name="Active Listeners"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="peakListeners" 
                    stroke="#f59e0b" 
                    name="Peak"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Chart */}
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Engagement</CardTitle>
              <CardDescription>Listeners and engagement by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="listeners" fill="#3b82f6" name="Listeners" />
                  <Bar dataKey="engagement" fill="#10b981" name="Engagement %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Breakdown */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Listener distribution by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Statistics</CardTitle>
          <CardDescription>Current broadcast metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Stream Status</p>
              <Badge className="bg-green-100 text-green-800">✓ Online</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Bitrate</p>
              <p className="text-lg font-bold">128 kbps</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg font-bold">99.8%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
