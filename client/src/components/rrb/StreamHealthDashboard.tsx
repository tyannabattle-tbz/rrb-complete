import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Download } from 'lucide-react';
import {
  getStreamHealth,
  getHealthStatistics,
  getUnhealthyStreams,
  exportHealthReportAsCSV,
  monitorStreams
} from '@/lib/streamHealthMonitoringService';
import { LIVE_STREAMS } from '@/lib/streamLibrary';

interface StreamHealthDashboardProps {
  compact?: boolean;
  autoMonitor?: boolean;
}

export function StreamHealthDashboard({ compact = false, autoMonitor = true }: StreamHealthDashboardProps) {
  const [stats, setStats] = useState<ReturnType<typeof getHealthStatistics> | null>(null);
  const [unhealthyStreams, setUnhealthyStreams] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(autoMonitor);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Monitor streams
  useEffect(() => {
    if (!isMonitoring) return;

    const updateHealth = async () => {
      const streams = Object.values(LIVE_STREAMS).map(s => ({
        id: s.id,
        url: s.url
      }));

      try {
        await monitorStreams(streams, {
          timeout: 3000,
          retries: 1,
          checkInterval: 30000
        });

        setStats(getHealthStatistics());
        setUnhealthyStreams(getUnhealthyStreams());
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    };

    updateHealth();
    const interval = setInterval(updateHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleExport = () => {
    if (!stats) return;

    const streams = Object.values(LIVE_STREAMS).map(s => ({
      id: s.id,
      url: s.url
    }));

    monitorStreams(streams).then(report => {
      const csv = exportHealthReportAsCSV(report);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stream-health-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  if (!stats) {
    return (
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-2" />
        <p className="text-sm text-slate-600">Monitoring stream health...</p>
      </div>
    );
  }

  if (compact) {
    const healthPercentage = stats.total > 0 ? (stats.healthy / stats.total) * 100 : 0;

    return (
      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-sm text-slate-900">Stream Health</span>
          </div>
          <span className="text-xs font-bold text-emerald-700">{Math.round(healthPercentage)}%</span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-slate-600">Healthy</p>
            <p className="font-bold text-emerald-700">{stats.healthy}/{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-600">Degraded</p>
            <p className="font-bold text-yellow-700">{stats.degraded}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-600">Failed</p>
            <p className="font-bold text-red-700">{stats.failed}</p>
          </div>
        </div>
      </div>
    );
  }

  const healthPercentage = stats.total > 0 ? (stats.healthy / stats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            Stream Health Monitoring
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Real-time monitoring of all broadcast streams
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isMonitoring
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isMonitoring ? '● Monitoring' : 'Paused'}
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Overall Health */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900">Overall Health</h4>
          <span className="text-3xl font-bold text-emerald-600">{Math.round(healthPercentage)}%</span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-4 rounded-full transition-all"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Total Streams</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-slate-600">Healthy</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.healthy}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-slate-600">Degraded</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.degraded}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-slate-600">Failed</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h5 className="font-semibold text-slate-900">Average Uptime</h5>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.averageUptime.toFixed(1)}%</p>
          <p className="text-xs text-slate-600 mt-1">Across all monitored streams</p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <h5 className="font-semibold text-slate-900">Avg Response Time</h5>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.averageResponseTime}ms</p>
          <p className="text-xs text-slate-600 mt-1">Average check latency</p>
        </div>
      </div>

      {/* Unhealthy Streams Alert */}
      {unhealthyStreams.length > 0 && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h5 className="font-semibold text-red-900">Streams Requiring Attention</h5>
          </div>

          <div className="space-y-2">
            {unhealthyStreams.map(stream => (
              <div key={stream.streamId} className="p-2 rounded bg-white border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{stream.streamId}</p>
                    <p className="text-xs text-slate-600">{stream.url}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    stream.status === 'degraded'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {stream.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  <p>Uptime: {stream.uptime.toFixed(1)}% | Response: {stream.responseTime}ms</p>
                  <p>Success: {stream.successCount} | Errors: {stream.errorCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-xs text-slate-600 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
