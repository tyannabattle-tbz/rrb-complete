'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Download, RefreshCw, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';

export interface AuditEntry {
  decisionId: string;
  userId: number;
  policy: string;
  timestamp: string;
  action: string;
  reason?: string;
  state?: any;
  success: boolean;
}

export const AuditDashboard: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [policyFilter, setPolicyFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch audit logs
  const { data: logs, isLoading: logsLoading, refetch } = trpc.auditLogging.getAuditLogs.useQuery(
    { limit: 1000 },
    { enabled: true }
  );

  // Export audit trail
  const exportMutation = trpc.auditLogging.exportAuditTrail.useMutation({
    onSuccess: (data) => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
      element.setAttribute('download', `audit-trail-${Date.now()}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
  });

  // Update logs when data changes
  useEffect(() => {
    if (logs) {
      setAuditLogs(logs);
      filterLogs(logs, searchQuery, policyFilter);
    }
  }, [logs, searchQuery, policyFilter]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const filterLogs = (logs: AuditEntry[], query: string, policy: string) => {
    let filtered = logs;

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.decisionId.toLowerCase().includes(lowerQuery) ||
          log.action.toLowerCase().includes(lowerQuery) ||
          log.userId.toString().includes(lowerQuery)
      );
    }

    if (policy) {
      filtered = filtered.filter((log) => log.policy === policy);
    }

    setFilteredLogs(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterLogs(auditLogs, query, policyFilter);
  };

  const handlePolicyFilter = (policy: string) => {
    setPolicyFilter(policy);
    filterLogs(auditLogs, searchQuery, policy);
  };

  const handleExport = () => {
    exportMutation.mutate({});
  };

  const handleRefresh = () => {
    setIsLoading(true);
    refetch().finally(() => setIsLoading(false));
  };

  const getPolicyColor = (policy: string): string => {
    const colors: Record<string, string> = {
      'ai-chat-policy': 'bg-blue-100 text-blue-800',
      'map-interaction-policy': 'bg-green-100 text-green-800',
      'dashboard-state-policy': 'bg-purple-100 text-purple-800',
      'chat-flow-policy': 'bg-pink-100 text-pink-800',
      'tool-execution-policy': 'bg-orange-100 text-orange-800',
      'analytics-tracking-policy': 'bg-cyan-100 text-cyan-800',
      'podcast-playback-policy': 'bg-indigo-100 text-indigo-800',
    };
    return colors[policy] || 'bg-gray-100 text-gray-800';
  };

  const uniquePolicies = Array.from(new Set(auditLogs.map((log) => log.policy)));

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QUMUS Audit Dashboard</CardTitle>
          <CardDescription>
            Real-time decision tracking and compliance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by Decision ID, Action, or User ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
              </Button>
            </div>
          </div>

          {/* Policy Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Policy:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={policyFilter === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handlePolicyFilter('')}
              >
                All Policies
              </Badge>
              {uniquePolicies.map((policy) => (
                <Badge
                  key={policy}
                  variant={policyFilter === policy ? 'default' : 'outline'}
                  className={`cursor-pointer ${policyFilter === policy ? '' : getPolicyColor(policy)}`}
                  onClick={() => handlePolicyFilter(policy)}
                >
                  {policy}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{auditLogs.length}</div>
                  <div className="text-xs text-muted-foreground">Total Decisions</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{uniquePolicies.length}</div>
                  <div className="text-xs text-muted-foreground">Active Policies</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {auditLogs.filter((log) => log.success).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {auditLogs.filter((log) => !log.success).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Log Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Decision History</h3>
            <ScrollArea className="h-96 rounded-md border">
              <div className="space-y-1 p-4">
                {filteredLogs.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No audit logs found
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.decisionId}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-muted-foreground">
                            {log.decisionId}
                          </code>
                          <Badge
                            className={getPolicyColor(log.policy)}
                            variant="outline"
                          >
                            {log.policy}
                          </Badge>
                          <Badge
                            variant={log.success ? 'outline' : 'destructive'}
                          >
                            {log.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">User {log.userId}</span>
                          {' • '}
                          <span className="text-muted-foreground">{log.action}</span>
                          {log.reason && (
                            <>
                              {' • '}
                              <span className="text-xs text-muted-foreground">
                                Reason: {log.reason}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Compliance Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Compliance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Decisions Tracked:</span>
                <span className="font-mono font-bold">{auditLogs.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-mono font-bold">
                  {auditLogs.length > 0
                    ? (
                        (auditLogs.filter((log) => log.success).length / auditLogs.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Decision:</span>
                <span className="font-mono font-bold">
                  {auditLogs[0]
                    ? formatDistanceToNow(new Date(auditLogs[0].timestamp), {
                        addSuffix: true,
                      })
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditDashboard;
