import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, Calendar } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  policy: string;
  actor: string;
  service: string;
  status: 'success' | 'failure' | 'pending';
  details: string;
  affectedResources: string[];
}

export default function ComplianceAuditViewer() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [policyFilter, setPolicyFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  // Mock audit log data
  React.useEffect(() => {
    const mockEntries: AuditEntry[] = [
      {
        id: 'audit-001',
        timestamp: new Date(Date.now() - 1 * 60000),
        action: 'Content Moderation Decision',
        policy: 'Compliance Policy',
        actor: 'QUMUS',
        service: 'Content Moderation',
        status: 'success',
        details: 'Flagged video for manual review due to potential policy violation',
        affectedResources: ['video-12345'],
      },
      {
        id: 'audit-002',
        timestamp: new Date(Date.now() - 5 * 60000),
        action: 'Payment Processing',
        policy: 'Payment Policy',
        actor: 'QUMUS',
        service: 'Stripe',
        status: 'success',
        details: 'Processed subscription renewal for user',
        affectedResources: ['user-67890', 'subscription-11111'],
      },
      {
        id: 'audit-003',
        timestamp: new Date(Date.now() - 10 * 60000),
        action: 'Security Incident Response',
        policy: 'Security Policy',
        actor: 'QUMUS',
        service: 'Authentication',
        status: 'success',
        details: 'Blocked suspicious login attempt from unknown IP',
        affectedResources: ['user-54321'],
      },
      {
        id: 'audit-004',
        timestamp: new Date(Date.now() - 30 * 60000),
        action: 'Performance Optimization',
        policy: 'Performance Policy',
        actor: 'QUMUS',
        service: 'Video Processing',
        status: 'success',
        details: 'Scaled up video processing capacity due to queue buildup',
        affectedResources: ['queue-12345'],
      },
      {
        id: 'audit-005',
        timestamp: new Date(Date.now() - 60 * 60000),
        action: 'User Engagement Action',
        policy: 'Engagement Policy',
        actor: 'QUMUS',
        service: 'Notifications',
        status: 'success',
        details: 'Sent personalized content recommendations to active users',
        affectedResources: ['user-group-001'],
      },
    ];

    setAuditLog(mockEntries);
  }, []);

  const policies = ['Compliance Policy', 'Payment Policy', 'Security Policy', 'Performance Policy', 'Engagement Policy'];
  const services = ['Content Moderation', 'Stripe', 'Authentication', 'Video Processing', 'Notifications', 'Analytics'];
  const statuses = ['success', 'failure', 'pending'];

  const filteredEntries = useMemo(() => {
    return auditLog.filter(entry => {
      if (searchTerm && !entry.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !entry.details.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (policyFilter !== 'all' && entry.policy !== policyFilter) {
        return false;
      }

      if (serviceFilter !== 'all' && entry.service !== serviceFilter) {
        return false;
      }

      if (statusFilter !== 'all' && entry.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [auditLog, searchTerm, policyFilter, serviceFilter, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'failure':
        return 'bg-red-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Timestamp', 'Action', 'Policy', 'Actor', 'Service', 'Status', 'Details'],
      ...filteredEntries.map(entry => [
        entry.id,
        entry.timestamp.toISOString(),
        entry.action,
        entry.policy,
        entry.actor,
        entry.service,
        entry.status,
        entry.details,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Compliance Audit Viewer</h1>
        <p className="text-slate-400 mt-2">Complete audit trail of all QUMUS autonomous decisions and actions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Entries</p>
            <p className="text-3xl font-bold text-white">{auditLog.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Successful</p>
            <p className="text-3xl font-bold text-green-500">{auditLog.filter(e => e.status === 'success').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Failed</p>
            <p className="text-3xl font-bold text-red-500">{auditLog.filter(e => e.status === 'failure').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-500">{auditLog.filter(e => e.status === 'pending').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Search</label>
              <Input
                placeholder="Search audit log..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Policy</label>
              <Select value={policyFilter} onValueChange={setPolicyFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Policies</SelectItem>
                  {policies.map(policy => (
                    <SelectItem key={policy} value={policy}>
                      {policy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Service</label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Audit Log</CardTitle>
          <CardDescription>Showing {filteredEntries.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No audit entries found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map(entry => (
                <div key={entry.id} className="p-4 bg-slate-700 rounded border border-slate-600">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{entry.action}</h3>
                      <p className="text-sm text-slate-400 mt-1">{entry.details}</p>
                    </div>
                    <Badge className={getStatusBadgeColor(entry.status)}>
                      {entry.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Policy</p>
                      <p className="text-white font-medium">{entry.policy}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Service</p>
                      <p className="text-white font-medium">{entry.service}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Actor</p>
                      <p className="text-white font-medium">{entry.actor}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Timestamp</p>
                      <p className="text-white font-medium">{entry.timestamp.toLocaleString()}</p>
                    </div>
                  </div>

                  {entry.affectedResources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-sm text-slate-400 mb-2">Affected Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.affectedResources.map(resource => (
                          <Badge key={resource} variant="outline" className="text-slate-300 border-slate-500">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
