import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Radio, Users, TrendingUp, AlertCircle, CheckCircle2, Clock, Volume2, Eye, Zap } from 'lucide-react';

interface SystemMetric {
  name: string;
  status: 'online' | 'offline' | 'warning';
  uptime: number;
  latency: number;
  users: number;
}

interface BroadcastMetric {
  id: string;
  title: string;
  status: 'live' | 'scheduled' | 'completed' | 'error';
  viewers: number;
  duration: number;
  startTime: number;
}

interface ContentMetric {
  type: 'commercial' | 'song' | 'video' | 'podcast' | 'audiobook';
  count: number;
  queued: number;
  processed: number;
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'HybridCast', status: 'online', uptime: 99.9, latency: 45, users: 1250 },
    { name: 'Rockin Rockin Boogie', status: 'online', uptime: 99.8, latency: 52, users: 890 },
    { name: 'Video Generation', status: 'online', uptime: 99.5, latency: 120, users: 340 },
    { name: 'Broadcast Hub', status: 'online', uptime: 100, latency: 38, users: 450 },
    { name: 'Analytics Engine', status: 'online', uptime: 99.7, latency: 65, users: 200 },
  ]);

  const [broadcasts, setBroadcasts] = useState<BroadcastMetric[]>([
    { id: '1', title: 'Top of the Sol News Live', status: 'live', viewers: 2340, duration: 45, startTime: Date.now() - 1800000 },
    { id: '2', title: 'Music Hour', status: 'live', viewers: 1890, duration: 60, startTime: Date.now() - 900000 },
    { id: '3', title: 'Evening Talk Show', status: 'scheduled', viewers: 0, duration: 90, startTime: Date.now() + 3600000 },
  ]);

  const [contentMetrics, setContentMetrics] = useState<ContentMetric[]>([
    { type: 'commercial', count: 245, queued: 12, processed: 233 },
    { type: 'song', count: 1240, queued: 45, processed: 1195 },
    { type: 'video', count: 340, queued: 8, processed: 332 },
    { type: 'podcast', count: 89, queued: 3, processed: 86 },
    { type: 'audiobook', count: 56, queued: 2, processed: 54 },
  ]);

  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate metric updates
      setMetrics(m => m.map(metric => ({
        ...metric,
        latency: metric.latency + Math.random() * 20 - 10,
        users: metric.users + Math.floor(Math.random() * 50 - 25),
      })));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const totalViewers = broadcasts.reduce((sum, b) => sum + b.viewers, 0);
  const totalContent = contentMetrics.reduce((sum, c) => sum + c.count, 0);
  const totalProcessed = contentMetrics.reduce((sum, c) => sum + c.processed, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'live':
        return 'bg-green-600/20 text-green-300';
      case 'offline':
      case 'error':
        return 'bg-red-600/20 text-red-300';
      case 'warning':
      case 'scheduled':
        return 'bg-yellow-600/20 text-yellow-300';
      default:
        return 'bg-slate-600/20 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-green-400" />
            System Monitoring
          </h1>
          <p className="text-slate-400">Real-time metrics for all QUMUS systems</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setRefreshInterval(5000)}
            variant={refreshInterval === 5000 ? 'default' : 'outline'}
            size="sm"
            className="border-slate-600"
          >
            5s
          </Button>
          <Button
            onClick={() => setRefreshInterval(10000)}
            variant={refreshInterval === 10000 ? 'default' : 'outline'}
            size="sm"
            className="border-slate-600"
          >
            10s
          </Button>
          <Button
            onClick={() => setRefreshInterval(30000)}
            variant={refreshInterval === 30000 ? 'default' : 'outline'}
            size="sm"
            className="border-slate-600"
          >
            30s
          </Button>
        </div>
      </div>

      <Tabs defaultValue="systems" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="systems" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Systems</span>
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="gap-2">
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Broadcasts</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Systems Tab */}
        <TabsContent value="systems" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {metrics.map(metric => (
              <Card key={metric.name} className="bg-slate-800 border-slate-700 p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-white text-sm">{metric.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${metric.status === 'online' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="text-green-300 font-semibold">{metric.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Latency:</span>
                      <span className={`${metric.latency > 100 ? 'text-yellow-300' : 'text-green-300'} font-semibold`}>
                        {Math.round(metric.latency)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Users:</span>
                      <span className="text-blue-300 font-semibold">{Math.round(metric.users)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* System Health */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
            <div className="space-y-3">
              {metrics.map(metric => (
                <div key={metric.name} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <div className="flex items-center gap-3">
                    {metric.status === 'online' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white font-semibold">{metric.name}</span>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Live Broadcasts</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{broadcasts.filter(b => b.status === 'live').length}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Total Viewers</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{totalViewers.toLocaleString()}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Scheduled</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{broadcasts.filter(b => b.status === 'scheduled').length}</p>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Active Broadcasts</h3>
            <div className="space-y-3">
              {broadcasts.map(broadcast => (
                <div key={broadcast.id} className="bg-slate-700 rounded p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-white">{broadcast.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(broadcast.status)}`}>
                        {broadcast.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {broadcast.viewers.toLocaleString()} viewers
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {broadcast.duration}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {contentMetrics.map(content => (
              <Card key={content.type} className="bg-slate-800 border-slate-700 p-4">
                <div className="space-y-3">
                  <h3 className="font-bold text-white text-sm capitalize">{content.type}s</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total:</span>
                      <span className="text-blue-300 font-semibold">{content.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Queued:</span>
                      <span className="text-yellow-300 font-semibold">{content.queued}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processed:</span>
                      <span className="text-green-300 font-semibold">{content.processed}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Content Pipeline</h3>
            <div className="space-y-3">
              {contentMetrics.map(content => (
                <div key={content.type} className="bg-slate-700 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white capitalize">{content.type}s</span>
                    <span className="text-sm text-slate-400">{content.processed}/{content.count}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(content.processed / content.count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Total Content</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{totalContent}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Processed</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{totalProcessed}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Queued</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{totalContent - totalProcessed}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{Math.round((totalProcessed / totalContent) * 100)}%</p>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white">System Uptime</span>
                  <span className="text-green-300 font-semibold">99.8%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.8%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white">Content Processing</span>
                  <span className="text-blue-300 font-semibold">{Math.round((totalProcessed / totalContent) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(totalProcessed / totalContent) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white">Average Latency</span>
                  <span className="text-yellow-300 font-semibold">{Math.round(metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length)}ms</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
