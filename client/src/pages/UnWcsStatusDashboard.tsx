import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface StreamStatus {
  platform: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  bitrate: number;
  latency: number;
  packetLoss: number;
  viewers: number;
  uptime: number;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const UnWcsStatusDashboard: React.FC = () => {
  const [streams, setStreams] = useState<StreamStatus[]>([
    {
      platform: 'UN WCS Primary RTMP',
      status: 'connected',
      bitrate: 5000,
      latency: 45,
      packetLoss: 0.1,
      viewers: 2500,
      uptime: 3600,
    },
    {
      platform: 'UN WCS Secondary RTMP',
      status: 'connected',
      bitrate: 5000,
      latency: 48,
      packetLoss: 0.2,
      viewers: 0,
      uptime: 3600,
    },
    {
      platform: 'YouTube Live',
      status: 'connected',
      bitrate: 4500,
      latency: 60,
      packetLoss: 0.3,
      viewers: 1800,
      uptime: 3600,
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'info',
      message: 'Broadcast started successfully',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false,
    },
    {
      id: '2',
      severity: 'warning',
      message: 'Secondary RTMP latency slightly elevated (48ms)',
      timestamp: new Date(Date.now() - 1800000),
      resolved: false,
    },
  ]);

  const totalViewers = streams.reduce((sum, s) => sum + s.viewers, 0);
  const activeStreams = streams.filter(s => s.status === 'connected').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">UN WCS Broadcast Status</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring for March 17th event</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Refresh</Button>
          <Button variant="outline" className="text-red-600">Emergency Failover</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalViewers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Across all platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeStreams}/{streams.length}</div>
            <p className="text-xs text-gray-500 mt-1">Connected platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{criticalAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Critical issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">100%</div>
            <p className="text-xs text-gray-500 mt-1">No downtime</p>
          </CardContent>
        </Card>
      </div>

      {/* Stream Status */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Status</CardTitle>
          <CardDescription>Real-time metrics for each streaming platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {streams.map((stream) => (
              <div key={stream.platform} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{stream.platform}</h3>
                    <Badge className={getStatusColor(stream.status)}>
                      {stream.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stream.viewers.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">viewers</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Bitrate</p>
                    <p className="font-semibold">{stream.bitrate} Kbps</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Latency</p>
                    <p className="font-semibold">{stream.latency}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Packet Loss</p>
                    <p className="font-semibold">{stream.packetLoss}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uptime</p>
                    <p className="font-semibold">{(stream.uptime / 3600).toFixed(1)}h</p>
                  </div>
                </div>

                {/* Health indicator */}
                <div className="mt-3 flex items-center gap-2">
                  {stream.packetLoss < 1 && stream.latency < 100 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">Optimal performance</span>
                    </>
                  ) : stream.packetLoss < 5 && stream.latency < 150 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs text-yellow-600">Monitor closely</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-600">Degraded performance</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent events and warnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                {getAlertIcon(alert.severity)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {alert.resolved && (
                  <Badge variant="outline" className="ml-2">
                    Resolved
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="w-full">
              <Zap className="w-4 h-4 mr-2" />
              Test Failover
            </Button>
            <Button variant="outline" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" className="w-full">
              <AlertCircle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnWcsStatusDashboard;
