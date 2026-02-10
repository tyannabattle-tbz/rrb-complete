/**
 * QUMUS Broadcast Admin Dashboard
 * Live broadcast management, content scheduling, compliance, and audit logging
 * All data pulled from running QUMUS engine and Content Scheduler
 */

import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Radio,
  Music,
  Settings,
  Menu,
  X,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';

export default function QumusBroadcastAdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'channels' | 'schedule' | 'compliance' | 'content' | 'settings'
  >('overview');

  // Live data from QUMUS engine
  const { data: schedulerStatus, refetch: refetchScheduler } = trpc.contentScheduler.getStatus.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const { data: channels } = trpc.contentScheduler.getChannels.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const { data: scheduleSlots } = trpc.contentScheduler.getSlots.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: currentSlots } = trpc.contentScheduler.getCurrentSlots.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const { data: systemHealth } = trpc.qumusComplete.getSystemHealth.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: auditTrail } = trpc.qumusComplete.getAuditTrail.useQuery({ limit: 20 }, {
    refetchInterval: 15000,
  });

  const totalListeners = channels?.reduce((sum: number, ch: any) => sum + (ch.listeners || 0), 0) || 0;
  const activeChannels = channels?.filter((ch: any) => ch.status === 'active').length || 0;
  const totalSlots = scheduleSlots?.length || 0;

  // Build chart data from live channels
  const channelListenerData = channels?.map((ch: any) => ({
    name: ch.name?.replace('RRB ', '').substring(0, 12) || 'Unknown',
    listeners: ch.listeners || 0,
  })) || [];

  const channelTypeDistribution = [
    { name: 'Radio', value: channels?.filter((ch: any) => ch.type === 'radio').length || 0, color: '#8b5cf6' },
    { name: 'Podcast', value: channels?.filter((ch: any) => ch.type === 'podcast').length || 0, color: '#06b6d4' },
    { name: 'Streaming', value: channels?.filter((ch: any) => ch.type === 'streaming').length || 0, color: '#f59e0b' },
    { name: 'Emergency', value: channels?.filter((ch: any) => ch.type === 'emergency').length || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-foreground/70">You must be logged in to access this dashboard.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 relative`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">QUMUS Broadcast</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        <nav className="mt-8 space-y-2 px-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'channels', label: 'Channels', icon: Radio },
            { id: 'schedule', label: 'Schedule', icon: Clock },
            { id: 'compliance', label: 'Audit Trail', icon: CheckCircle },
            { id: 'content', label: 'Content', icon: Music },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Broadcast Administration</h2>
              <p className="text-foreground/70">
                Welcome back, {user?.name}. Live data from QUMUS Content Scheduler.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={schedulerStatus?.isRunning ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-red-500/20 text-red-600 border-red-500/30'}>
                {schedulerStatus?.isRunning ? '● Scheduler Running' : '● Scheduler Stopped'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => refetchScheduler()}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Active Channels</p>
                      <p className="text-3xl font-bold text-green-500">{activeChannels}</p>
                    </div>
                    <Radio className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Total Listeners</p>
                      <p className="text-3xl font-bold">{totalListeners.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Schedule Slots</p>
                      <p className="text-3xl font-bold">{totalSlots}</p>
                    </div>
                    <Clock className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Autonomy Level</p>
                      <p className="text-3xl font-bold text-purple-500">{schedulerStatus?.autonomyLevel || 90}%</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-500 opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Engine Status</p>
                      <p className="text-3xl font-bold text-green-500">{systemHealth?.status?.toUpperCase() || 'HEALTHY'}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Currently Playing</p>
                      <p className="text-3xl font-bold">{currentSlots?.length || 0}</p>
                    </div>
                    <Music className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Channel Listeners */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Listeners by Channel</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={channelListenerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="listeners" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Channel Type Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Channel Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {channelTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          )}

          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Live Channel Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {channels && channels.length > 0 ? (
                    <div className="space-y-3">
                      {channels.map((ch: any) => (
                        <div key={ch.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Radio className={`w-5 h-5 ${ch.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                            <div>
                              <h4 className="font-semibold">{ch.name}</h4>
                              <p className="text-sm text-foreground/60">{ch.currentContent || 'No content playing'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{(ch.listeners || 0).toLocaleString()} listeners</p>
                              <p className="text-xs text-foreground/50">{ch.type}</p>
                            </div>
                            <Badge className={ch.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-400'}>
                              {ch.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-foreground/50">Loading channel data...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Schedule ({totalSlots} slots)</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSlots && currentSlots.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-green-600 mb-3">Currently Playing</h4>
                      <div className="space-y-2">
                        {currentSlots.map((slot: any) => (
                          <div key={slot.id} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div>
                              <span className="font-medium">{slot.title}</span>
                              <span className="text-sm text-foreground/60 ml-3">{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-600">LIVE</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scheduleSlots && scheduleSlots.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3">Title</th>
                            <th className="text-left py-2 px-3">Channel</th>
                            <th className="text-left py-2 px-3">Time</th>
                            <th className="text-left py-2 px-3">Type</th>
                            <th className="text-left py-2 px-3">Priority</th>
                            <th className="text-left py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleSlots.slice(0, 20).map((slot: any) => (
                            <tr key={slot.id} className="border-b border-border hover:bg-accent/5">
                              <td className="py-2 px-3 font-medium">{slot.title}</td>
                              <td className="py-2 px-3 text-foreground/60">{slot.channelId}</td>
                              <td className="py-2 px-3">{slot.startTime} - {slot.endTime}</td>
                              <td className="py-2 px-3">
                                <Badge variant="outline">{slot.contentType}</Badge>
                              </td>
                              <td className="py-2 px-3">{slot.priority}</td>
                              <td className="py-2 px-3">
                                <Badge className={slot.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-400'}>
                                  {slot.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {scheduleSlots.length > 20 && (
                        <p className="text-center text-sm text-foreground/50 mt-3">
                          Showing 20 of {scheduleSlots.length} schedule slots
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-foreground/50">Loading schedule data...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>QUMUS Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  {auditTrail && auditTrail.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-4">Decision ID</th>
                            <th className="text-left py-2 px-4">Policy</th>
                            <th className="text-left py-2 px-4">Result</th>
                            <th className="text-left py-2 px-4">Autonomous</th>
                            <th className="text-left py-2 px-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditTrail.map((log: any, i: number) => (
                            <tr key={log.id || i} className="border-b border-border hover:bg-accent/5">
                              <td className="py-2 px-4 font-mono text-xs">{(log.decisionId || '').substring(0, 16)}...</td>
                              <td className="py-2 px-4">{log.policyId || 'Unknown'}</td>
                              <td className="py-2 px-4">
                                <Badge className={
                                  log.result === 'success' ? 'bg-green-500/10 text-green-600' :
                                  log.result === 'failure' ? 'bg-red-500/10 text-red-600' :
                                  'bg-yellow-500/10 text-yellow-600'
                                }>
                                  {log.result || log.status || 'pending'}
                                </Badge>
                              </td>
                              <td className="py-2 px-4">
                                {log.autonomousFlag ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                                )}
                              </td>
                              <td className="py-2 px-4 text-foreground/60">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground/50">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No audit trail entries yet. Decisions will appear here as the engine processes requests.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content & Settings Tabs */}
          {(activeTab === 'content' || activeTab === 'settings') && (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-bold mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h3>
              <p className="text-foreground/70">
                This section is under development. Check back soon!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
