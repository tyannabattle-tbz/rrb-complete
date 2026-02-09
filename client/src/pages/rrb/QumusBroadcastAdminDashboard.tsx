/**
 * QUMUS Broadcast Admin Dashboard
 * Comprehensive broadcast management, compliance, and audit logging
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface BroadcastStats {
  totalBroadcasts: number;
  activeBroadcasts: number;
  completedBroadcasts: number;
  totalViewers: number;
  avgEngagement: number;
  complianceRate: number;
}

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  details: Record<string, any>;
  complianceStatus: 'compliant' | 'warning' | 'violation';
}

export default function QumusBroadcastAdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'broadcasts' | 'analytics' | 'compliance' | 'content' | 'settings'
  >('overview');
  const [stats, setStats] = useState<BroadcastStats>({
    totalBroadcasts: 0,
    activeBroadcasts: 0,
    completedBroadcasts: 0,
    totalViewers: 0,
    avgEngagement: 0,
    complianceRate: 100,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [broadcastData, setBroadcastData] = useState<any[]>([]);

  // Mock data for charts
  const viewerTrendData = [
    { time: '00:00', viewers: 1200 },
    { time: '02:00', viewers: 1900 },
    { time: '04:00', viewers: 2400 },
    { time: '06:00', viewers: 2210 },
    { time: '08:00', viewers: 2290 },
    { time: '10:00', viewers: 3200 },
    { time: '12:00', viewers: 3800 },
  ];

  const platformDistribution = [
    { name: 'YouTube', value: 45, color: '#FF0000' },
    { name: 'Twitch', value: 30, color: '#9146FF' },
    { name: 'Facebook', value: 15, color: '#1877F2' },
    { name: 'Instagram', value: 10, color: '#E4405F' },
  ];

  const engagementData = [
    { type: 'Likes', count: 2400 },
    { type: 'Comments', count: 1398 },
    { type: 'Shares', count: 980 },
    { type: 'Follows', count: 2210 },
  ];

  const complianceData = [
    { status: 'Compliant', count: 95, color: '#10B981' },
    { status: 'Warning', count: 4, color: '#F59E0B' },
    { status: 'Violation', count: 1, color: '#EF4444' },
  ];

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
        } bg-card border-r border-border transition-all duration-300`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">QUMUS</h1>}
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
            { id: 'broadcasts', label: 'Broadcasts', icon: Radio },
            { id: 'analytics', label: 'Analytics', icon: BarChart },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle },
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

        <div className="absolute bottom-4 left-2 right-2">
          <Button variant="outline" className="w-full" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Broadcast Administration</h2>
            <p className="text-foreground/70">
              Welcome back, {user?.name}. Manage your broadcasts and monitor compliance.
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Total Broadcasts</p>
                      <p className="text-3xl font-bold">{stats.totalBroadcasts}</p>
                    </div>
                    <Radio className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Active Now</p>
                      <p className="text-3xl font-bold text-green-500">{stats.activeBroadcasts}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Total Viewers</p>
                      <p className="text-3xl font-bold">{stats.totalViewers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Avg Engagement</p>
                      <p className="text-3xl font-bold">{stats.avgEngagement.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Compliance Rate</p>
                      <p className="text-3xl font-bold text-green-500">
                        {stats.complianceRate}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70 mb-1">Completed</p>
                      <p className="text-3xl font-bold">{stats.completedBroadcasts}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Viewer Trend */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Viewer Trend (24h)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={viewerTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="viewers"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Platform Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Platform Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Engagement Metrics */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Engagement Metrics</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Compliance Status */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Compliance Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status} ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {complianceData.map((entry, index) => (
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

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Audit Log</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-4">Action</th>
                        <th className="text-left py-2 px-4">Performed By</th>
                        <th className="text-left py-2 px-4">Timestamp</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, 10).map((log) => (
                        <tr key={log.id} className="border-b border-border hover:bg-accent/5">
                          <td className="py-2 px-4">{log.action}</td>
                          <td className="py-2 px-4">{log.performedBy}</td>
                          <td className="py-2 px-4">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                log.complianceStatus === 'compliant'
                                  ? 'bg-green-100 text-green-800'
                                  : log.complianceStatus === 'warning'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {log.complianceStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Other Tabs Placeholder */}
          {(activeTab === 'broadcasts' ||
            activeTab === 'analytics' ||
            activeTab === 'content' ||
            activeTab === 'settings') && (
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
