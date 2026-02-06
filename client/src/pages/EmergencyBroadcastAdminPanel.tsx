import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart3, Users, Clock, Send, Filter, Download, Eye, Trash2, Edit, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastRecord {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'scheduled' | 'completed' | 'archived';
  createdBy: string;
  createdAt: number;
  deliveredAt?: number;
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  coverage: string;
  channels: string[];
  analytics: {
    views: number;
    clicks: number;
    shares: number;
    engagementRate: number;
  };
}

export default function EmergencyBroadcastAdminPanel() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([
    {
      id: '1',
      title: 'System Alert: Network Degradation',
      message: 'Network latency detected in sectors 3-5. Automatic failover in progress.',
      severity: 'high',
      status: 'completed',
      createdBy: 'System Admin',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      deliveredAt: Date.now() - 2 * 60 * 60 * 1000 + 5000,
      totalRecipients: 1247,
      successfulDeliveries: 1243,
      failedDeliveries: 4,
      coverage: 'Global',
      channels: ['SMS', 'Push', 'Email', 'In-App'],
      analytics: {
        views: 1243,
        clicks: 312,
        shares: 45,
        engagementRate: 28.6,
      },
    },
    {
      id: '2',
      title: 'Emergency: Severe Weather Alert',
      message: 'Severe thunderstorm warning for regions 1-2. Seek shelter immediately.',
      severity: 'critical',
      status: 'active',
      createdBy: 'Emergency Coordinator',
      createdAt: Date.now() - 15 * 60 * 1000,
      deliveredAt: Date.now() - 15 * 60 * 1000 + 2000,
      totalRecipients: 5632,
      successfulDeliveries: 5628,
      failedDeliveries: 4,
      coverage: 'Regional (Zones 1-2)',
      channels: ['SMS', 'Push', 'Siren', 'Radio'],
      analytics: {
        views: 5628,
        clicks: 2814,
        shares: 892,
        engagementRate: 65.4,
      },
    },
  ]);

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastRecord | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (filterSeverity !== 'all' && b.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'scheduled':
        return 'text-blue-400';
      case 'completed':
        return 'text-slate-400';
      case 'archived':
        return 'text-slate-500';
      default:
        return 'text-slate-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleDeleteBroadcast = (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    setSelectedBroadcast(null);
    toast.success('Broadcast deleted');
  };

  const handleArchiveBroadcast = (id: string) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'archived' as const } : b))
    );
    toast.success('Broadcast archived');
  };

  const handleResendBroadcast = (id: string) => {
    const broadcast = broadcasts.find((b) => b.id === id);
    if (broadcast) {
      toast.success(`Resending broadcast "${broadcast.title}" to all channels...`);
    }
  };

  const handleDownloadAnalytics = (id: string) => {
    const broadcast = broadcasts.find((b) => b.id === id);
    if (broadcast) {
      const data = JSON.stringify(broadcast, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `broadcast-${id}-analytics.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Analytics downloaded');
    }
  };

  const totalRecipients = broadcasts.reduce((sum, b) => sum + b.totalRecipients, 0);
  const totalDeliveries = broadcasts.reduce((sum, b) => sum + b.successfulDeliveries, 0);
  const totalFailures = broadcasts.reduce((sum, b) => sum + b.failedDeliveries, 0);
  const avgEngagement = (broadcasts.reduce((sum, b) => sum + b.analytics.engagementRate, 0) / broadcasts.length).toFixed(1);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Emergency Broadcast Admin Panel</h1>
            <p className="text-slate-400">Manage and monitor emergency broadcasts</p>
          </div>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Send className="w-4 h-4 mr-2" />
          Create Broadcast
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Recipients</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400">{totalRecipients.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Across all broadcasts</div>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Successful Deliveries</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{totalDeliveries.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{((totalDeliveries / totalRecipients) * 100).toFixed(1)}% success rate</div>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Failed Deliveries</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400">{totalFailures}</div>
          <div className="text-xs text-slate-500 mt-1">{((totalFailures / totalRecipients) * 100).toFixed(2)}% failure rate</div>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Avg Engagement</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">{avgEngagement}%</div>
          <div className="text-xs text-slate-500 mt-1">Across all broadcasts</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-4">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Broadcasts List */}
      <div className="space-y-3">
        {filteredBroadcasts.map((broadcast) => (
          <Card
            key={broadcast.id}
            className={`p-4 bg-slate-900 border cursor-pointer transition-colors ${
              selectedBroadcast?.id === broadcast.id ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 hover:border-slate-600'
            }`}
            onClick={() => setSelectedBroadcast(broadcast)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(broadcast.severity)}`}>
                      {broadcast.severity.toUpperCase()}
                    </span>
                    <span className={`text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                      {broadcast.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white">{broadcast.title}</h3>
                  <p className="text-sm text-slate-300 mt-1">{broadcast.message}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="bg-slate-800 p-2 rounded">
                  <div className="text-slate-400">Recipients</div>
                  <div className="font-medium text-cyan-400">{broadcast.totalRecipients}</div>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <div className="text-slate-400">Delivered</div>
                  <div className="font-medium text-green-400">{broadcast.successfulDeliveries}</div>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <div className="text-slate-400">Failed</div>
                  <div className="font-medium text-red-400">{broadcast.failedDeliveries}</div>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <div className="text-slate-400">Engagement</div>
                  <div className="font-medium text-purple-400">{broadcast.analytics.engagementRate.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <div className="text-slate-400">Sent</div>
                  <div className="font-medium text-slate-300">{formatTime(broadcast.createdAt)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <Button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2 flex-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Analytics
                </Button>
                <Button
                  onClick={() => handleDownloadAnalytics(broadcast.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2 flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button
                  onClick={() => handleResendBroadcast(broadcast.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2 flex-1"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Resend
                </Button>
                <Button
                  onClick={() => handleArchiveBroadcast(broadcast.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2 flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Archive
                </Button>
                <Button
                  onClick={() => handleDeleteBroadcast(broadcast.id)}
                  className="bg-red-900 hover:bg-red-800 text-red-200 text-xs py-1 px-2 flex-1"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Detail View */}
      {selectedBroadcast && showAnalytics && (
        <Card className="p-6 bg-slate-900 border border-cyan-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Analytics: {selectedBroadcast.title}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Total Views</div>
              <div className="text-2xl font-bold text-cyan-400">{selectedBroadcast.analytics.views.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Clicks</div>
              <div className="text-2xl font-bold text-blue-400">{selectedBroadcast.analytics.clicks.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Shares</div>
              <div className="text-2xl font-bold text-purple-400">{selectedBroadcast.analytics.shares.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Engagement Rate</div>
              <div className="text-2xl font-bold text-green-400">{selectedBroadcast.analytics.engagementRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-3">Delivery Channels</h4>
            <div className="flex flex-wrap gap-2">
              {selectedBroadcast.channels.map((channel) => (
                <span key={channel} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                  {channel}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
