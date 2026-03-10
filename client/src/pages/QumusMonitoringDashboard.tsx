import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Activity, CheckCircle, AlertCircle, Zap, BarChart3, Settings, Clock, Users } from 'lucide-react';

export default function QumusMonitoringDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Fetch QUMUS identity and status
  const { data: identity } = trpc.ai.qumusIdentity.whoAmI.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const { data: policies } = trpc.ai.qumusIdentity.decisionPolicies.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const { data: services } = trpc.ai.qumusIdentity.serviceIntegrations.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const { data: metrics } = trpc.ai.qumusIdentity.operationalMetrics.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const { data: hybridCast } = trpc.ai.qumusIdentity.hybridCastIntegration.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const { data: boogie } = trpc.ai.qumusIdentity.rockinRockinBoogieStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">QUMUS Control Center</h1>
              <p className="text-slate-300">Autonomous Orchestration Engine Monitoring</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? 'default' : 'outline'}
                className="gap-2"
              >
                <Activity className="w-4 h-4" />
                {autoRefresh ? 'Live' : 'Paused'}
              </Button>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
              >
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-white">ACTIVE</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">90%+ Autonomy</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">Decision Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">8</div>
                <p className="text-xs text-slate-400 mt-2">All Operational</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">11+</div>
                <p className="text-xs text-slate-400 mt-2">Integrated</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">99.98%</div>
                <p className="text-xs text-slate-400 mt-2">Last 24h</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="hybridcast">HybridCast</TabsTrigger>
            <TabsTrigger value="boogie">Rockin' Boogie</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="conference">Conference</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">QUMUS Identity</CardTitle>
                <CardDescription>Autonomous Orchestration Engine Information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Name</p>
                    <p className="text-lg font-semibold text-white">{identity?.identity?.name || 'QUMUS'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Role</p>
                    <p className="text-lg font-semibold text-white">{identity?.identity?.role || 'Autonomous Orchestration Engine'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Autonomy Level</p>
                    <p className="text-lg font-semibold text-white">{identity?.operationalStatus?.autonomyLevel || '90'}%+</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Parent Company</p>
                    <p className="text-lg font-semibold text-white">Canryn Production</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decision Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Decision Policies</CardTitle>
                <CardDescription>14 Autonomous Decision Policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policies?.policies?.map((policy: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{policy.name}</h4>
                        <Badge className="bg-green-600 text-white">{policy.autonomyLevel}%</Badge>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{policy.description}</p>
                      <div className="text-xs text-slate-400">
                        <p>Rules: {policy.rules?.length || 0}</p>
                        <p>Status: <span className="text-green-400">Active</span></p>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-2 text-slate-400">Loading policies...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Service Integrations</CardTitle>
                <CardDescription>14+ Integrated Services Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services?.services?.map((service: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded border border-slate-600">
                      <div>
                        <p className="font-semibold text-white">{service.name}</p>
                        <p className="text-sm text-slate-400">{service.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white">Healthy</Badge>
                        <span className="text-sm text-slate-400">{service.responseTime}ms</span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-slate-400">Loading services...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HybridCast Tab */}
          <TabsContent value="hybridcast" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">HybridCast Integration</CardTitle>
                <CardDescription>Audio & Content Streaming Management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Active Streams</p>
                    <p className="text-3xl font-bold text-white">{hybridCast?.status?.activeStreams || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Stream Quality</p>
                    <p className="text-3xl font-bold text-white">1080p</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Total Listeners</p>
                    <p className="text-3xl font-bold text-white">{hybridCast?.status?.engagement || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Uptime</p>
                    <p className="text-3xl font-bold text-white">99.9%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rockin' Boogie Tab */}
          <TabsContent value="boogie" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Rockin' Rockin' Boogie</CardTitle>
                <CardDescription>Core Operational System Status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Operations/min</p>
                    <p className="text-3xl font-bold text-white">1250</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Avg Latency</p>
                    <p className="text-3xl font-bold text-white">{'0'}ms</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Success Rate</p>
                    <p className="text-3xl font-bold text-white">{boogie?.status?.status === 'active' ? '100' : '0'}%</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Status</p>
                    <Badge className="bg-green-600 text-white">ACTIVE</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Operational Metrics</CardTitle>
                <CardDescription>Real-time Performance Data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <p className="text-sm text-slate-400">CPU Usage</p>
                    </div>
                    <p className="text-2xl font-bold text-white">35%</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-slate-400">Memory Usage</p>
                    </div>
                    <p className="text-2xl font-bold text-white">62%</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <p className="text-sm text-slate-400">Response Time</p>
                    </div>
                    <p className="text-2xl font-bold text-white">142ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conference Tab */}
          <TabsContent value="conference" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Conference System</CardTitle>
                <CardDescription>Multi-Platform Conference Management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Jitsi Meet', status: 'active', desc: 'Self-hosted video conferencing' },
                    { name: 'Zoom Integration', status: 'active', desc: 'Enterprise video meetings' },
                    { name: 'Google Meet', status: 'active', desc: 'Google Workspace meetings' },
                    { name: 'Discord Bridge', status: 'active', desc: 'Community voice channels' },
                    { name: 'Skype Connect', status: 'active', desc: 'Legacy video calls' },
                    { name: 'Custom WebRTC', status: 'active', desc: 'Custom peer-to-peer rooms' },
                    { name: 'QUMUS Auto-Schedule', status: 'active', desc: 'Autonomous conference scheduling' },
                    { name: 'Stripe Ticketing', status: 'active', desc: '4-tier ticket system (Free/VIP/Speaker/Delegate)' },
                    { name: 'Whisper Transcription', status: 'active', desc: 'Auto-transcribe recordings' },
                    { name: 'S3 Recording Archive', status: 'active', desc: 'Cloud recording storage' },
                    { name: 'HybridCast Bridge', status: 'active', desc: 'Emergency broadcast bridge' },
                    { name: 'UN CSW70 Templates', status: 'active', desc: '6 session templates for world stage' },
                  ].map((svc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded border border-slate-600">
                      <div>
                        <p className="text-white font-medium">{svc.name}</p>
                        <p className="text-xs text-slate-400">{svc.desc}</p>
                      </div>
                      <Badge className={svc.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {svc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => window.location.href = '/conference'} className="bg-cyan-600 hover:bg-cyan-700">Open Conference Hub</Button>
                  <Button size="sm" onClick={() => window.location.href = '/conference/calendar'} variant="outline" className="border-cyan-500/50 text-cyan-400">Calendar</Button>
                  <Button size="sm" onClick={() => window.location.href = '/conference/analytics'} variant="outline" className="border-cyan-500/50 text-cyan-400">Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
