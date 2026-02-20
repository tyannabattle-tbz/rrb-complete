import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Clock, Zap, Users } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Decision {
  id: string;
  type: 'broadcast' | 'content' | 'donation' | 'meditation' | 'emergency';
  description: string;
  autonomyLevel: number;
  policy: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'vetoed';
  subsystem: string;
  impact: 'low' | 'medium' | 'high';
}

export default function AdminOverridePanel() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch pending decisions
  const { data: pendingDecisions, refetch } = trpc.qumus.getPendingDecisions.useQuery(undefined, {
    refetchInterval: autoRefresh ? 3000 : false,
  });

  // Approve decision mutation
  const approveMutation = trpc.qumus.approveDecision.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDecision(null);
    },
  });

  // Veto decision mutation
  const vetoMutation = trpc.qumus.vetoDecision.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDecision(null);
    },
  });

  useEffect(() => {
    if (pendingDecisions) {
      setDecisions(pendingDecisions);
    }
  }, [pendingDecisions]);

  const pendingCount = decisions.filter(d => d.status === 'pending').length;
  const approvedCount = decisions.filter(d => d.status === 'approved').length;
  const vetoCount = decisions.filter(d => d.status === 'vetoed').length;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'vetoed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Admin Override Panel</h2>
              <p className="text-xs text-slate-400">Human approval for autonomous decisions</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-blue-500/20 border-blue-500/50' : ''}
          >
            {autoRefresh ? '🔄 Auto' : '⏸ Manual'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-700/50 rounded p-2">
            <p className="text-xs text-slate-400">Pending</p>
            <p className="text-lg font-bold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <p className="text-xs text-slate-400">Approved</p>
            <p className="text-lg font-bold text-green-400">{approvedCount}</p>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <p className="text-xs text-slate-400">Vetoed</p>
            <p className="text-lg font-bold text-red-400">{vetoCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start border-b border-slate-700 bg-slate-800/50 rounded-none">
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
            History
          </TabsTrigger>
          <TabsTrigger value="policies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
            Policies
          </TabsTrigger>
        </TabsList>

        {/* Pending Decisions */}
        <TabsContent value="pending" className="flex-1 overflow-y-auto p-4 space-y-3">
          {decisions.filter(d => d.status === 'pending').length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>All decisions approved or pending review</p>
              </div>
            </div>
          ) : (
            decisions.filter(d => d.status === 'pending').map((decision, idx) => (
              <Card
                key={`decision-${idx}-${decision.id}`}
                className={`bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50 transition-all ${
                  selectedDecision?.id === decision.id ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
                }`}
                onClick={() => setSelectedDecision(decision)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(decision.status)}
                        <span className="font-medium text-white text-sm">{decision.description}</span>
                        <Badge className={`text-xs ${getImpactColor(decision.impact)}`}>
                          {decision.impact.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">
                        {decision.subsystem} • {decision.policy}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded"
                            style={{ width: `${decision.autonomyLevel}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{decision.autonomyLevel}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="flex-1 overflow-y-auto p-4 space-y-3">
          {decisions.filter(d => d.status !== 'pending').length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No decision history yet</p>
            </div>
          ) : (
            decisions.filter(d => d.status !== 'pending').map((decision, idx) => (
              <Card key={`decision-${idx}-${decision.id}`} className="bg-slate-800 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(decision.status)}
                      <div>
                        <p className="text-sm font-medium text-white">{decision.description}</p>
                        <p className="text-xs text-slate-400">{decision.subsystem}</p>
                      </div>
                    </div>
                    <Badge variant={decision.status === 'approved' ? 'default' : 'destructive'}>
                      {decision.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="flex-1 overflow-y-auto p-4 space-y-3">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-xs font-medium text-white">Emergency Broadcast Policy</p>
                <p className="text-xs text-slate-400">Auto-approve critical broadcasts</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-xs font-medium text-white">Content Moderation Policy</p>
                <p className="text-xs text-slate-400">Flag high-impact content changes</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-xs font-medium text-white">Donation Threshold Policy</p>
                <p className="text-xs text-slate-400">Require approval for donations &gt;$1000</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {selectedDecision && selectedDecision.status === 'pending' && (
        <div className="border-t border-slate-700 p-4 bg-slate-800/50 space-y-2">
          <div className="bg-slate-700/30 rounded p-3 mb-3">
            <p className="text-xs text-slate-400 mb-1">Selected Decision</p>
            <p className="text-sm font-medium text-white">{selectedDecision.description}</p>
            <p className="text-xs text-slate-400 mt-1">{selectedDecision.policy}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => approveMutation.mutate({ decisionId: selectedDecision.id })}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => vetoMutation.mutate({ decisionId: selectedDecision.id })}
              disabled={vetoMutation.isPending}
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Veto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
