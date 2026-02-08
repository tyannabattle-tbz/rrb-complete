import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Filter, Download, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';

export default function AuditTrailViewer() {
  const [limit, setLimit] = useState(50);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const { data: auditData, isLoading, refetch } = trpc.auditTrail.getAllAuditTrail.useQuery({
    limit,
    offset: 0,
    action: selectedAction || undefined,
  });

  const { data: statsData } = trpc.auditTrail.getAuditStatistics.useQuery();
  const { data: violationsData } = trpc.auditTrail.getComplianceViolations.useQuery({ limit: 20 });

  const entries = auditData?.entries || [];

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-blue-500/20 text-blue-400';
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'executed':
        return 'bg-purple-500/20 text-purple-400';
      case 'escalated':
        return 'bg-orange-500/20 text-orange-400';
      case 'modified':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const handleExport = async () => {
    const result = await trpc.auditTrail.exportAuditTrail.useQuery({ format: 'csv' });
    if (result.data?.data) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(result.data.data));
      element.setAttribute('download', `audit-trail-${new Date().toISOString()}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-purple-400" />
                <h1 className="text-4xl font-bold text-white">Audit Trail & Compliance</h1>
              </div>
              <p className="text-slate-400">Track all decisions, approvals, and system actions</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="log" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="log">Audit Log</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Report</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Audit Log Tab */}
          <TabsContent value="log" className="space-y-4">
            {/* Filters */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search by user or action..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white flex-1"
                  />
                  <select
                    value={filterSubsystem}
                    onChange={e => setFilterSubsystem(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                  >
                    <option value="all">All Subsystems</option>
                    <option value="HybridCast">HybridCast</option>
                    <option value="Rockin Rockin Boogie">Rockin Rockin Boogie</option>
                    <option value="Sweet Miracles">Sweet Miracles</option>
                    <option value="Canryn">Canryn</option>
                  </select>
                  <Button onClick={exportAuditLog} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audit Entries */}
            <div className="space-y-3">
              {filteredEntries.map(entry => (
                <Card key={entry.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-sm text-slate-300">{entry.id}</span>
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-white mb-1">{entry.action}</p>
                        <p className="text-sm text-slate-300 mb-2">{entry.details}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-slate-600 text-slate-200 text-xs">
                            {entry.subsystem}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                            {entry.autonomyLevel}% autonomy
                          </Badge>
                          <span className="text-xs text-slate-400">
                            User: {entry.userId}
                          </span>
                          {entry.approvedBy && (
                            <span className="text-xs text-green-400">
                              Approved by: {entry.approvedBy}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">
                          {formatDate(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compliance Report Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Approval Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">High-Impact Decisions</span>
                    <span className="font-bold text-white">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Approved by Admin</span>
                    <span className="font-bold text-green-400">11</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Pending Approval</span>
                    <span className="font-bold text-yellow-400">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Compliance Rate</span>
                    <span className="font-bold text-green-400">91.7%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Autonomy Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">High Autonomy (80-100%)</span>
                    <span className="font-bold text-white">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Medium Autonomy (50-79%)</span>
                    <span className="font-bold text-white">28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Low Autonomy (0-49%)</span>
                    <span className="font-bold text-white">15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Average Autonomy</span>
                    <span className="font-bold text-blue-400">72.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <p className="text-slate-400 text-sm mb-1">Total Actions</p>
                  <p className="text-3xl font-bold text-white">{entries.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <p className="text-slate-400 text-sm mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-green-400">
                    {Math.round((entries.filter(e => e.status === 'success').length / entries.length) * 100)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <p className="text-slate-400 text-sm mb-1">Pending Actions</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {entries.filter(e => e.status === 'pending').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <p className="text-slate-400 text-sm mb-1">Avg Autonomy</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {Math.round(entries.reduce((sum, e) => sum + e.autonomyLevel, 0) / entries.length)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
