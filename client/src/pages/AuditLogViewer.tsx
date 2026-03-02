import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Filter, Download, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  timestamp: number;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  details: Record<string, any>;
  ipAddress?: string;
}

export default function AuditLogViewer() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    {
      id: 'audit-1',
      timestamp: Date.now() - 5 * 60 * 1000,
      userEmail: 'admin@example.com',
      action: 'create_broadcast',
      resource: 'broadcast',
      resourceId: 'bc-123',
      status: 'success',
      details: { title: 'System Alert', severity: 'high' },
      ipAddress: '192.168.1.100',
    },
    {
      id: 'audit-2',
      timestamp: Date.now() - 15 * 60 * 1000,
      userEmail: 'coordinator@example.com',
      action: 'schedule_broadcast',
      resource: 'broadcast',
      resourceId: 'bc-124',
      status: 'success',
      details: { scheduledTime: Date.now() + 24 * 60 * 60 * 1000 },
      ipAddress: '192.168.1.101',
    },
    {
      id: 'audit-3',
      timestamp: Date.now() - 30 * 60 * 1000,
      userEmail: 'viewer@example.com',
      action: 'view_analytics',
      resource: 'analytics',
      status: 'success',
      details: { broadcastId: 'bc-120' },
      ipAddress: '192.168.1.102',
    },
    {
      id: 'audit-4',
      timestamp: Date.now() - 45 * 60 * 1000,
      userEmail: 'admin@example.com',
      action: 'delete_broadcast',
      resource: 'broadcast',
      resourceId: 'bc-119',
      status: 'success',
      details: { reason: 'Duplicate broadcast' },
      ipAddress: '192.168.1.100',
    },
    {
      id: 'audit-5',
      timestamp: Date.now() - 60 * 60 * 1000,
      userEmail: 'coordinator@example.com',
      action: 'send_alert',
      resource: 'alert',
      status: 'failure',
      details: { error: 'Network timeout', channels: ['SMS', 'Push'] },
      ipAddress: '192.168.1.101',
    },
  ]);

  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const actions = ['create_broadcast', 'edit_broadcast', 'delete_broadcast', 'schedule_broadcast', 'send_alert', 'view_analytics'];
  const users = Array.from(new Set(auditLog.map((e) => e.userEmail)));

  const filteredLog = auditLog.filter((entry) => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (filterStatus !== 'all' && entry.status !== filterStatus) return false;
    if (filterUser && entry.userEmail !== filterUser) return false;
    if (searchQuery && !JSON.stringify(entry).toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleString();
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create_broadcast: 'text-green-400',
      edit_broadcast: 'text-blue-400',
      delete_broadcast: 'text-red-400',
      schedule_broadcast: 'text-purple-400',
      send_alert: 'text-orange-400',
      view_analytics: 'text-cyan-400',
    };
    return colors[action] || 'text-slate-400';
  };

  const getStatusBadge = (status: string) => {
    return status === 'success'
      ? 'bg-green-500/20 text-green-400 border-green-500/50'
      : 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(filteredLog, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Audit log exported as JSON');
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address'];
    const rows = filteredLog.map((entry) => [
      new Date(entry.timestamp).toISOString(),
      entry.userEmail,
      entry.action,
      entry.resource,
      entry.status,
      entry.ipAddress || 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Audit log exported as CSV');
  };

  const stats = {
    total: auditLog.length,
    success: auditLog.filter((e) => e.status === 'success').length,
    failure: auditLog.filter((e) => e.status === 'failure').length,
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Audit Log Viewer</h1>
            <p className="text-slate-400">Track all user actions and system events</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportJSON} className="bg-slate-700 hover:bg-slate-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button onClick={handleExportCSV} className="bg-slate-700 hover:bg-slate-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Total Actions</div>
          <div className="text-3xl font-bold text-cyan-400">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Successful</div>
          <div className="text-3xl font-bold text-green-400">{stats.success}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Failed</div>
          <div className="text-3xl font-bold text-red-400">{stats.failure}</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit log..."
                className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>

            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="p-4 bg-slate-900 border border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Timestamp</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Resource</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">IP Address</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLog.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 text-slate-300">{formatTime(entry.timestamp)}</td>
                <td className="py-3 px-4 text-slate-300">{entry.userEmail}</td>
                <td className={`py-3 px-4 font-medium ${getActionColor(entry.action)}`}>
                  {entry.action.replace(/_/g, ' ')}
                </td>
                <td className="py-3 px-4 text-slate-300">{entry.resource}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusBadge(entry.status)}`}>
                    {entry.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">{entry.ipAddress || 'N/A'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLog.length === 0 && (
          <div className="text-center py-8 text-slate-400">No audit log entries found</div>
        )}
      </Card>

      {/* Detail View */}
      {selectedEntry && (
        <Card className="p-6 bg-slate-900 border border-cyan-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Entry Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Timestamp</div>
              <div className="font-medium text-white">{new Date(selectedEntry.timestamp).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">User</div>
              <div className="font-medium text-white">{selectedEntry.userEmail}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Action</div>
              <div className={`font-medium ${getActionColor(selectedEntry.action)}`}>
                {selectedEntry.action.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Status</div>
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusBadge(selectedEntry.status)}`}>
                {selectedEntry.status.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Resource</div>
              <div className="font-medium text-white">{selectedEntry.resource}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">IP Address</div>
              <div className="font-medium text-white font-mono">{selectedEntry.ipAddress || 'N/A'}</div>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg mb-4">
            <div className="text-sm text-slate-400 mb-2">Details</div>
            <pre className="text-xs text-slate-300 overflow-auto max-h-48">
              {JSON.stringify(selectedEntry.details, null, 2)}
            </pre>
          </div>

          <Button
            onClick={() => setSelectedEntry(null)}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            Close
          </Button>
        </Card>
      )}
    </div>
  );
}
