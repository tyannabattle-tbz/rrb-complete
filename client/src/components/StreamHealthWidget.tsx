import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FuturisticCard,
  FuturisticSection,
  FuturisticGrid,
  FuturisticBadge,
} from '@/components/FuturisticDesignSystem';
import {
  Wifi, WifiOff, AlertTriangle, RefreshCw, Play, Pause, Shield, Activity,
} from 'lucide-react';

export function StreamHealthWidget() {
  const { toast } = useToast();
  const healthReport = trpc.streamHealth.getLatest.useQuery(undefined, { refetchInterval: 60000 });
  const monitorStatus = trpc.streamHealth.getStatus.useQuery(undefined, { refetchInterval: 30000 });
  const runCheck = trpc.streamHealth.runCheck.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Health Check Complete', description: `${data.healthy}/${data.totalChannels} healthy (${data.uptimePercent}%)` });
      healthReport.refetch();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
  const startMonitor = trpc.streamHealth.startMonitor.useMutation({
    onSuccess: () => { toast({ title: 'Monitor Started' }); monitorStatus.refetch(); },
  });
  const stopMonitor = trpc.streamHealth.stopMonitor.useMutation({
    onSuccess: () => { toast({ title: 'Monitor Stopped' }); monitorStatus.refetch(); },
  });

  const report = healthReport.data;
  const isRunning = monitorStatus.data?.isRunning;

  return (
    <FuturisticSection title="Stream Health Monitor" icon={<Shield className="w-5 h-5" />}>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <FuturisticBadge variant={isRunning ? 'success' : 'warning'}>
          {isRunning ? '● Monitor Active' : '○ Monitor Idle'}
        </FuturisticBadge>
        <div className="flex gap-2">
          {isRunning ? (
            <Button
              onClick={() => stopMonitor.mutate()}
              disabled={stopMonitor.isPending}
              size="sm"
              className="bg-red-600/80 hover:bg-red-700 text-xs h-7"
            >
              <Pause className="w-3 h-3 mr-1" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={() => startMonitor.mutate()}
              disabled={startMonitor.isPending}
              size="sm"
              className="bg-green-600/80 hover:bg-green-700 text-xs h-7"
            >
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
          )}
          <Button
            onClick={() => runCheck.mutate()}
            disabled={runCheck.isPending}
            size="sm"
            className="bg-cyan-600/80 hover:bg-cyan-700 text-xs h-7"
          >
            {runCheck.isPending ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Check Now
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <>
          <FuturisticGrid columns={4}>
            <FuturisticCard glow="cyan">
              <div className="text-center">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{report.totalChannels}</p>
              </div>
            </FuturisticCard>
            <FuturisticCard glow="cyan">
              <div className="text-center">
                <p className="text-xs text-slate-400">Healthy</p>
                <p className="text-2xl font-bold text-green-400">{report.healthy}</p>
              </div>
            </FuturisticCard>
            <FuturisticCard glow={report.degraded > 0 ? 'magenta' : 'cyan'}>
              <div className="text-center">
                <p className="text-xs text-slate-400">Degraded</p>
                <p className="text-2xl font-bold text-yellow-400">{report.degraded}</p>
              </div>
            </FuturisticCard>
            <FuturisticCard glow={report.down > 0 ? 'magenta' : 'cyan'}>
              <div className="text-center">
                <p className="text-xs text-slate-400">Down</p>
                <p className="text-2xl font-bold text-red-400">{report.down}</p>
              </div>
            </FuturisticCard>
          </FuturisticGrid>

          {/* Uptime Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Uptime</span>
              <span className={`text-sm font-bold ${
                report.uptimePercent === 100 ? 'text-green-400' :
                report.uptimePercent >= 90 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {report.uptimePercent}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  report.uptimePercent === 100 ? 'bg-green-500' :
                  report.uptimePercent >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${report.uptimePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Last check: {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Never'}
            </p>
          </div>

          {/* Down Channels Alert */}
          {report.down > 0 && report.channels && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
              <p className="text-sm font-bold text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {report.down} Channel(s) Down
              </p>
              <div className="space-y-1">
                {report.channels
                  .filter((ch: any) => ch.status === 'down')
                  .map((ch: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-white">
                        <WifiOff className="w-3 h-3 text-red-400" />
                        {ch.name}
                      </span>
                      <span className="text-red-400">{ch.error || 'No response'}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Channel Grid (compact) */}
          {report.channels && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
              {report.channels.map((ch: any, idx: number) => (
                <div
                  key={idx}
                  title={`${ch.name}: ${ch.status}${ch.responseTime ? ` (${ch.responseTime}ms)` : ''}`}
                  className={`h-6 rounded flex items-center justify-center text-[8px] font-mono ${
                    ch.status === 'healthy' ? 'bg-green-900/40 text-green-400' :
                    ch.status === 'degraded' ? 'bg-yellow-900/40 text-yellow-400' :
                    'bg-red-900/40 text-red-400'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!report && (
        <div className="text-center py-6 text-slate-500">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No health data yet. Click "Check Now" to run the first scan.</p>
        </div>
      )}
    </FuturisticSection>
  );
}
