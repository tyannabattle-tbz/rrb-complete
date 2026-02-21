import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  HardDrive,
  Users,
  MessageSquare,
  RefreshCw,
  Download,
} from 'lucide-react';

interface MetricCard {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export const HealthMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      label: 'CPU Usage',
      value: 45,
      unit: '%',
      icon: <Activity className="w-6 h-6" />,
      status: 'healthy',
      trend: 'stable',
    },
    {
      label: 'Memory Usage',
      value: 62,
      unit: '%',
      icon: <Zap className="w-6 h-6" />,
      status: 'healthy',
      trend: 'up',
    },
    {
      label: 'Disk Free',
      value: 78,
      unit: '%',
      icon: <HardDrive className="w-6 h-6" />,
      status: 'healthy',
      trend: 'down',
    },
    {
      label: 'Stream Bitrate',
      value: 5000,
      unit: 'kbps',
      icon: <Zap className="w-6 h-6" />,
      status: 'healthy',
      trend: 'stable',
    },
    {
      label: 'Latency',
      value: 35,
      unit: 'ms',
      icon: <Activity className="w-6 h-6" />,
      status: 'healthy',
      trend: 'stable',
    },
    {
      label: 'Packet Loss',
      value: 0.3,
      unit: '%',
      icon: <AlertCircle className="w-6 h-6" />,
      status: 'healthy',
      trend: 'stable',
    },
    {
      label: 'Viewers',
      value: 3250,
      unit: 'live',
      icon: <Users className="w-6 h-6" />,
      status: 'healthy',
      trend: 'up',
    },
    {
      label: 'Chat Activity',
      value: 42,
      unit: 'msg/min',
      icon: <MessageSquare className="w-6 h-6" />,
      status: 'healthy',
      trend: 'up',
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'info',
      message: 'Broadcast started successfully',
      timestamp: Date.now() - 300000,
    },
    {
      id: '2',
      severity: 'info',
      message: 'All panelists connected',
      timestamp: Date.now() - 240000,
    },
  ]);

  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Simulate metric updates
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(metric => {
          const change = (Math.random() - 0.5) * 5;
          const newValue = Math.max(0, metric.value + change);

          // Determine status based on value
          let status: 'healthy' | 'warning' | 'critical' = 'healthy';
          if (metric.label === 'CPU Usage' && newValue > 80) {
            status = 'critical';
          } else if (metric.label === 'CPU Usage' && newValue > 60) {
            status = 'warning';
          }

          return {
            ...metric,
            value: Math.round(newValue * 100) / 100,
            status,
          };
        })
      );
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const overallStatus = criticalAlerts.length > 0 ? 'critical' : warningAlerts.length > 0 ? 'warning' : 'healthy';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Health Monitoring Dashboard</h1>
            <p className="text-slate-600 mt-1">Real-time broadcast system metrics and alerts</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              variant={isAutoRefresh ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isAutoRefresh ? 'Auto' : 'Manual'}
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className={`p-6 border-2 ${getStatusBgColor(overallStatus)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {overallStatus === 'healthy' && (
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              )}
              {overallStatus === 'warning' && (
                <AlertTriangle className="w-12 h-12 text-yellow-600" />
              )}
              {overallStatus === 'critical' && (
                <AlertCircle className="w-12 h-12 text-red-600" />
              )}

              <div>
                <h2 className="text-2xl font-bold text-slate-900 capitalize">{overallStatus}</h2>
                <p className="text-slate-600">
                  {overallStatus === 'healthy' && 'All systems operational'}
                  {overallStatus === 'warning' && `${warningAlerts.length} warning(s) active`}
                  {overallStatus === 'critical' && `${criticalAlerts.length} critical issue(s)`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-600">Last updated</div>
              <div className="text-lg font-semibold text-slate-900">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <Card key={idx} className={`p-4 border-l-4 ${getStatusBgColor(metric.status)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  {metric.icon}
                </div>
                {metric.trend && getTrendIcon(metric.trend)}
              </div>

              <h3 className="text-sm font-semibold text-slate-600 mb-1">{metric.label}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                <span className="text-sm text-slate-600">{metric.unit}</span>
              </div>

              {/* Progress bar for percentage metrics */}
              {metric.unit === '%' && (
                <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      metric.status === 'healthy'
                        ? 'bg-green-500'
                        : metric.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">System Alerts</h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No alerts</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 border-red-400'
                          : alert.severity === 'warning'
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {alert.severity === 'critical' && (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {alert.severity === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        )}
                        {alert.severity === 'info' && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{alert.message}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>

              <div className="space-y-2">
                <Button className="w-full justify-start gap-2 bg-orange-500 hover:bg-orange-600">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Metrics
                </Button>

                <Button variant="outline" className="w-full justify-start gap-2">
                  <Zap className="w-4 h-4" />
                  Failover to Backup
                </Button>

                <Button variant="outline" className="w-full justify-start gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  View Alerts History
                </Button>

                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
            </Card>

            {/* Refresh Settings */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Settings</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Refresh Interval</label>
                  <select
                    value={refreshInterval}
                    onChange={e => setRefreshInterval(parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value={1000}>1 second</option>
                    <option value={5000}>5 seconds</option>
                    <option value={10000}>10 seconds</option>
                    <option value={30000}>30 seconds</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isAutoRefresh}
                      onChange={e => setIsAutoRefresh(e.target.checked)}
                      className="rounded"
                    />
                    Auto-refresh
                  </label>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Performance Trends */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Performance Trends</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'CPU Trend', trend: 'stable', color: 'text-slate-600' },
              { label: 'Memory Trend', trend: 'up', color: 'text-red-500' },
              { label: 'Bitrate Trend', trend: 'stable', color: 'text-slate-600' },
              { label: 'Viewer Trend', trend: 'up', color: 'text-green-500' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-sm text-slate-600 mb-2">{item.label}</p>
                <div className="flex items-center justify-center gap-2">
                  {item.trend === 'up' && <TrendingUp className={`w-6 h-6 ${item.color}`} />}
                  {item.trend === 'down' && <TrendingDown className={`w-6 h-6 ${item.color}`} />}
                  {item.trend === 'stable' && <Activity className={`w-6 h-6 ${item.color}`} />}
                  <span className="font-semibold text-slate-900 capitalize">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HealthMonitoringDashboard;
