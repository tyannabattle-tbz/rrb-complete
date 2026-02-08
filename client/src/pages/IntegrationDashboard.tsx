import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BroadcastSchedule {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  status: 'scheduled' | 'live' | 'completed';
  contentType: string;
}

interface ViewerMetrics {
  timestamp: number;
  viewers: number;
  platform: string;
  engagement: number;
}

interface DecisionLog {
  id: string;
  timestamp: number;
  action: string;
  autonomyLevel: number;
  status: 'approved' | 'pending' | 'rejected';
  subsystem: string;
}

export function IntegrationDashboard() {
  const [broadcasts, setBroadcasts] = useState<BroadcastSchedule[]>([]);
  const [viewerMetrics, setViewerMetrics] = useState<ViewerMetrics[]>([]);
  const [decisions, setDecisions] = useState<DecisionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Update viewer metrics
      setViewerMetrics((prev) => [
        ...prev.slice(-19),
        {
          timestamp: Date.now(),
          viewers: Math.floor(Math.random() * 5000) + 1000,
          platform: ['Twitch', 'YouTube', 'Facebook'][Math.floor(Math.random() * 3)],
          engagement: Math.floor(Math.random() * 100),
        },
      ]);

      // Update decision logs
      if (Math.random() > 0.7) {
        setDecisions((prev) => [
          {
            id: `decision-${Date.now()}`,
            timestamp: Date.now(),
            action: ['Schedule Broadcast', 'Generate Content', 'Distribute Stream'][Math.floor(Math.random() * 3)],
            autonomyLevel: Math.floor(Math.random() * 100),
            status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)] as any,
            subsystem: ['RRB', 'HybridCast', 'Mobile Studio'][Math.floor(Math.random() * 3)],
          },
          ...prev.slice(0, 9),
        ]);
      }
    }, 2000);

    // Load initial data
    loadDashboardData();
    setLoading(false);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    // Simulate loading data
    setBroadcasts([
      {
        id: '1',
        title: 'Morning News Broadcast',
        startTime: Date.now() + 3600000,
        endTime: Date.now() + 7200000,
        status: 'scheduled',
        contentType: 'news',
      },
      {
        id: '2',
        title: 'Music Hour Live',
        startTime: Date.now() - 1800000,
        endTime: Date.now() + 1800000,
        status: 'live',
        contentType: 'music',
      },
      {
        id: '3',
        title: 'Evening Talk Show',
        startTime: Date.now() - 7200000,
        endTime: Date.now() - 3600000,
        status: 'completed',
        contentType: 'talk',
      },
    ]);

    setViewerMetrics(
      Array.from({ length: 20 }, (_, i) => ({
        timestamp: Date.now() - (20 - i) * 60000,
        viewers: Math.floor(Math.random() * 5000) + 1000,
        platform: ['Twitch', 'YouTube', 'Facebook'][i % 3],
        engagement: Math.floor(Math.random() * 100),
      }))
    );

    setDecisions(
      Array.from({ length: 5 }, (_, i) => ({
        id: `decision-${i}`,
        timestamp: Date.now() - i * 300000,
        action: ['Schedule Broadcast', 'Generate Content', 'Distribute Stream'][i % 3],
        autonomyLevel: 60 + Math.floor(Math.random() * 40),
        status: ['approved', 'pending'][i % 2] as any,
        subsystem: ['RRB', 'HybridCast', 'Mobile Studio'][i % 3],
      }))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-red-500';
      case 'scheduled':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getDecisionColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading integration dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Integration Dashboard</h1>
        <p className="text-gray-600">Real-time monitoring of RRB, HybridCast, and autonomous decisions</p>
      </div>

      <Tabs defaultValue="broadcasts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="metrics">Viewer Metrics</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
        </TabsList>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {broadcasts.map((broadcast) => (
              <Card key={broadcast.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{broadcast.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`font-semibold ${getStatusColor(broadcast.status)}`}>{broadcast.status.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="font-semibold">{broadcast.contentType}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Start: {new Date(broadcast.startTime).toLocaleTimeString()}</div>
                    <div>End: {new Date(broadcast.endTime).toLocaleTimeString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Viewer Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viewer Count Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewerMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="viewers" stroke="#3b82f6" name="Viewers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={viewerMetrics.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="engagement" fill="#10b981" name="Engagement %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autonomous Decision Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decisions.map((decision) => (
                  <div key={decision.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{decision.action}</h4>
                        <p className="text-sm text-gray-600">{decision.subsystem}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDecisionColor(decision.status)}`}>
                        {decision.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Autonomy Level: {decision.autonomyLevel}%</span>
                      <span className="text-gray-500">{new Date(decision.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
