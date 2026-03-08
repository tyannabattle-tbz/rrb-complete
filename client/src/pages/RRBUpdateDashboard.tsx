import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Zap, ChevronLeft, Radio, Database, FileText, Users, Calendar, Shield, Clock, ArrowRight, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  skipped: <SkipForward className="w-5 h-5 text-slate-400" />,
};

const STATUS_COLORS: Record<string, string> = {
  success: 'border-green-500/30 bg-green-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  error: 'border-red-500/30 bg-red-500/5',
  skipped: 'border-slate-500/30 bg-slate-500/5',
};

export default function RRBUpdateDashboard() {
  const [, setLocation] = useLocation();
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const statusQuery = trpc.rrbUpdate.getStatus.useQuery();
  const healthQuery = trpc.rrbUpdate.healthCheck.useQuery();
  const updateMutation = trpc.rrbUpdate.runFullUpdate.useMutation({
    onSuccess: (data) => {
      setUpdateResult(data);
      setIsRunning(false);
      statusQuery.refetch();
      healthQuery.refetch();
      if (data.status === 'success') {
        toast.success('RRB Update Complete', { description: data.message });
      } else if (data.status === 'warning') {
        toast.warning('RRB Update Complete with Warnings', { description: data.message });
      } else {
        toast.error('RRB Update had Errors', { description: data.message });
      }
    },
    onError: (err) => {
      setIsRunning(false);
      toast.error('Update Failed', { description: err.message });
    },
  });

  const status = statusQuery.data;
  const health = healthQuery.data;

  const handleRunUpdate = () => {
    setIsRunning(true);
    setUpdateResult(null);
    updateMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation('/qumus')} className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  RRB Seamless Update
                  <Badge className="bg-amber-500/20 text-amber-300 text-xs">ORCHESTRATOR</Badge>
                </h1>
                <p className="text-xs text-slate-400">One-click update for the entire RRB ecosystem</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Pre-Update Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">Family Tree</span>
              </div>
              <p className="text-xl font-bold text-white">{status?.tables?.family_tree || 0}</p>
              <p className="text-[10px] text-slate-500">{(status?.tables?.family_tree || 0) > 0 ? 'Seeded' : 'Needs seed'}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400">News Articles</span>
              </div>
              <p className="text-xl font-bold text-white">{status?.tables?.news_articles || 0}</p>
              <p className="text-[10px] text-slate-500">{(status?.tables?.news_articles || 0) > 0 ? 'Seeded' : 'Needs seed'}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Documentation</span>
              </div>
              <p className="text-xl font-bold text-white">{status?.tables?.documentation_pages || 0}</p>
              <p className="text-[10px] text-slate-500">{(status?.tables?.documentation_pages || 0) > 0 ? 'Seeded' : 'Needs seed'}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Schedule</span>
              </div>
              <p className="text-xl font-bold text-white">{status?.tables?.content_schedule || 0}</p>
              <p className="text-[10px] text-slate-500">{(status?.tables?.content_schedule || 0) > 0 ? 'Populated' : 'Needs seed'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action */}
        <Card className={`border-2 ${status?.isFullySeeded ? 'border-green-500/30 bg-green-900/10' : 'border-amber-500/30 bg-amber-900/10'}`}>
          <CardContent className="p-8 text-center">
            {status?.isFullySeeded ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Ecosystem Fully Seeded</h2>
                <p className="text-sm text-slate-400 mb-4">{status.totalRecords} total records across all tables. Run again to refresh or re-seed.</p>
              </>
            ) : (
              <>
                <Zap className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Run Seamless Update</h2>
                <p className="text-sm text-slate-400 mb-4">This will seed all data, populate the 24/7 schedule, and verify all 13 QUMUS policies in one seamless process.</p>
              </>
            )}
            <Button
              size="lg"
              onClick={handleRunUpdate}
              disabled={isRunning}
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-lg px-8 py-6"
            >
              {isRunning ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running Update...</>
              ) : (
                <><Zap className="w-5 h-5 mr-2" /> {status?.isFullySeeded ? 'Re-Run Full Update' : 'Run Full Update'}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Update Results */}
        {updateResult && (
          <Card className={`border ${updateResult.status === 'success' ? 'border-green-500/30' : updateResult.status === 'warning' ? 'border-amber-500/30' : 'border-red-500/30'} bg-slate-800/50`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                {STATUS_ICONS[updateResult.status]}
                Update Results
                <Badge className={updateResult.status === 'success' ? 'bg-green-500/20 text-green-300' : updateResult.status === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}>
                  {updateResult.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {updateResult.duration}ms
                </span>
              </CardTitle>
              <CardDescription className="text-slate-400">{updateResult.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {updateResult.steps?.map((step: any, idx: number) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${STATUS_COLORS[step.status]}`}>
                    {STATUS_ICONS[step.status]}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{step.step}</p>
                      <p className="text-xs text-slate-400">{step.message}</p>
                    </div>
                    {step.count !== undefined && (
                      <Badge className="bg-slate-700/50 text-slate-300 text-xs">{step.count}</Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              {updateResult.summary && (
                <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="text-sm font-bold text-white mb-2">Ecosystem Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-slate-400">Channels:</span> <span className="text-purple-300 font-bold">{updateResult.summary.channels}</span></div>
                    <div><span className="text-slate-400">Policies:</span> <span className="text-amber-300 font-bold">{updateResult.summary.policies}</span></div>
                    <div><span className="text-slate-400">Steps:</span> <span className="text-white font-bold">{updateResult.summary.totalSteps}</span></div>
                    <div><span className="text-slate-400">Ecosystem:</span> <span className="text-green-300 font-bold">{updateResult.summary.ecosystem}</span></div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {updateResult.summary.subsidiaries?.map((sub: string) => (
                      <Badge key={sub} className="bg-purple-500/10 text-purple-300 text-[10px]">{sub}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Health Check */}
        {health && (
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Shield className="w-4 h-4 text-green-400" />
                System Health
                <Badge className={health.healthy ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                  {health.healthy ? 'HEALTHY' : 'ISSUES DETECTED'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(health.checks).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400 capitalize">{key.replace('_', ' ')}</p>
                    {value.error ? (
                      <p className="text-sm text-red-400">{value.error}</p>
                    ) : value.count !== undefined ? (
                      <p className="text-lg font-bold text-white">{value.count} <span className="text-xs text-green-400">records</span></p>
                    ) : value.policies !== undefined ? (
                      <p className="text-lg font-bold text-white">{value.policies} <span className="text-xs text-purple-400">policies</span></p>
                    ) : (
                      <p className="text-sm text-white">{JSON.stringify(value)}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button onClick={() => setLocation('/rrb')} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12">
            <Radio className="w-4 h-4 mr-2" /> RRB Radio <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
          <Button onClick={() => setLocation('/scheduler')} className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 h-12">
            <Calendar className="w-4 h-4 mr-2" /> Content Scheduler <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
          <Button onClick={() => setLocation('/news')} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-12">
            <FileText className="w-4 h-4 mr-2" /> News <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
          <Button onClick={() => setLocation('/family')} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12">
            <Users className="w-4 h-4 mr-2" /> Family Tree <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-purple-500/10">
          <p className="text-xs text-slate-500">
            RRB Seamless Update Orchestrator • QUMUS 90% Autonomous Control • A Canryn Production
          </p>
        </footer>
      </main>
    </div>
  );
}
