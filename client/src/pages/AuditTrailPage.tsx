import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  resource: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ipAddress: string;
  changes: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2026-03-04 13:45:23',
      action: 'Policy Updated',
      actor: 'QUMUS Core',
      resource: 'Content Scheduling Policy',
      status: 'success',
      details: 'Updated autonomy level from 85% to 90%',
      ipAddress: '127.0.0.1',
      changes: 'autonomyLevel: 85 → 90',
    },
    {
      id: '2',
      timestamp: '2026-03-04 13:30:15',
      action: 'Task Executed',
      actor: 'QUMUS Core',
      resource: 'Schedule Daily Broadcasts',
      status: 'success',
      details: 'Successfully scheduled 24 broadcasts',
      ipAddress: '127.0.0.1',
      changes: 'status: pending → completed',
    },
    {
      id: '3',
      timestamp: '2026-03-04 13:15:42',
      action: 'Emergency Alert',
      actor: 'HybridCast System',
      resource: 'Emergency Broadcast',
      status: 'warning',
      details: 'Emergency alert triggered for region 5',
      ipAddress: '127.0.0.2',
      changes: 'alertLevel: normal → critical',
    },
    {
      id: '4',
      timestamp: '2026-03-04 13:00:00',
      action: 'System Sync',
      actor: 'QUMUS Core',
      resource: 'All Systems',
      status: 'success',
      details: 'Synchronized all system states',
      ipAddress: '127.0.0.1',
      changes: 'syncStatus: pending → complete',
    },
    {
      id: '5',
      timestamp: '2026-03-04 12:45:33',
      action: 'Database Query',
      actor: 'Analytics Engine',
      resource: 'Listener Metrics',
      status: 'error',
      details: 'Failed to retrieve listener metrics - timeout',
      ipAddress: '127.0.0.3',
      changes: 'queryStatus: pending → failed',
    },
    {
      id: '6',
      timestamp: '2026-03-04 12:30:12',
      action: 'Content Scheduled',
      actor: 'QUMUS Core',
      resource: 'RRB Radio',
      status: 'success',
      details: 'Scheduled 5 new episodes for broadcast',
      ipAddress: '127.0.0.1',
      changes: 'contentQueue: +5 episodes',
    },
    {
      id: '7',
      timestamp: '2026-03-04 12:15:45',
      action: 'Policy Deactivated',
      actor: 'Admin User',
      resource: 'Resource Optimization Policy',
      status: 'info',
      details: 'Policy deactivated for maintenance',
      ipAddress: '192.168.1.100',
      changes: 'status: active → inactive',
    },
    {
      id: '8',
      timestamp: '2026-03-04 12:00:00',
      action: 'Listener Feedback',
      actor: 'QUMUS Core',
      resource: 'Feedback Processing',
      status: 'success',
      details: 'Processed 342 listener feedback entries',
      ipAddress: '127.0.0.1',
      changes: 'feedbackCount: +342',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'warning' | 'error' | 'info'>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'error':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold text-white">Audit Trail</h1>
        </div>
        <p className="text-purple-300">Complete system activity log and compliance records</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div className="flex gap-2">
          <Filter className="w-5 h-5 text-purple-400 mt-3" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
          >
            <option value="all">All Events</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>
        </div>

        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Logs Table */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card
            key={log.id}
            className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
            onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(log.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{log.action}</h3>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{log.details}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500">
                      <div>
                        <span className="text-slate-400">Actor:</span> {log.actor}
                      </div>
                      <div>
                        <span className="text-slate-400">Resource:</span> {log.resource}
                      </div>
                      <div>
                        <span className="text-slate-400">Time:</span> {log.timestamp}
                      </div>
                      <div>
                        <span className="text-slate-400">IP:</span> {log.ipAddress}
                      </div>
                    </div>
                  </div>
                </div>
                <Eye className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
              </div>

              {selectedLog?.id === log.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Details</h4>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div>
                        <span className="text-slate-500">Changes:</span>
                        <code className="block bg-slate-800 rounded px-2 py-1 mt-1 text-slate-300">
                          {log.changes}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500">Full Details:</span>
                        <p className="mt-1">{log.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-slate-400">No audit logs found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
