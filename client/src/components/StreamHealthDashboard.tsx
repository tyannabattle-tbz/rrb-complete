import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FALLBACK_STATIONS } from '@/lib/radioGardenService';

export interface StreamStatus {
  id: string;
  title: string;
  genre: string;
  url: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastChecked: number;
  uptime: number; // percentage
  responseTime: number; // milliseconds
  errorCount: number;
}

export default function StreamHealthDashboard() {
  const [streams, setStreams] = useState<StreamStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallHealth, setOverallHealth] = useState(100);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  // Initialize streams from fallback stations
  useEffect(() => {
    const initialStreams: StreamStatus[] = FALLBACK_STATIONS.map(station => ({
      id: station.id,
      title: station.title,
      genre: station.genre,
      url: station.url,
      status: 'healthy',
      lastChecked: Date.now(),
      uptime: 100,
      responseTime: 0,
      errorCount: 0,
    }));
    setStreams(initialStreams);
    setLoading(false);
  }, []);

  // Scan stream health
  const scanStreamHealth = async () => {
    setLoading(true);
    const updatedStreams: StreamStatus[] = [];
    let healthyCount = 0;

    for (const stream of streams) {
      const startTime = performance.now();
      try {
        const response = await fetch(stream.url, { method: 'HEAD', mode: 'no-cors' });
        const responseTime = performance.now() - startTime;

        const status = response.ok || response.status === 206 ? 'healthy' : 'degraded';
        if (status === 'healthy') healthyCount++;

        updatedStreams.push({
          ...stream,
          status,
          lastChecked: Date.now(),
          responseTime: Math.round(responseTime),
          errorCount: status === 'healthy' ? stream.errorCount : stream.errorCount + 1,
        });
      } catch (error) {
        updatedStreams.push({
          ...stream,
          status: 'offline',
          lastChecked: Date.now(),
          responseTime: 0,
          errorCount: stream.errorCount + 1,
        });
      }
    }

    setStreams(updatedStreams);
    setOverallHealth(Math.round((healthyCount / updatedStreams.length) * 100));
    setLastScanTime(new Date());
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const healthyStreams = streams.filter(s => s.status === 'healthy').length;
  const degradedStreams = streams.filter(s => s.status === 'degraded').length;
  const offlineStreams = streams.filter(s => s.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Overall Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stream Health Overview</span>
            <Button
              size="sm"
              onClick={scanStreamHealth}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Scan Now'}
            </Button>
          </CardTitle>
          <CardDescription>
            {lastScanTime
              ? `Last scanned: ${lastScanTime.toLocaleTimeString()}`
              : 'No scans performed yet'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Health Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-2xl font-bold">{overallHealth}%</span>
            </div>
            <Progress value={overallHealth} className="h-3" />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Healthy</div>
              <div className="text-2xl font-bold text-green-700">{healthyStreams}</div>
              <div className="text-xs text-green-600 mt-1">{streams.length} total</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">Degraded</div>
              <div className="text-2xl font-bold text-yellow-700">{degradedStreams}</div>
              <div className="text-xs text-yellow-600 mt-1">Slow response</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Offline</div>
              <div className="text-2xl font-bold text-red-700">{offlineStreams}</div>
              <div className="text-xs text-red-600 mt-1">Unreachable</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Stream Status */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Details</CardTitle>
          <CardDescription>Real-time status of all {streams.length} streams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {streams.map(stream => (
              <div
                key={stream.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(stream.status)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{stream.title}</div>
                    <div className="text-xs text-gray-500">{stream.genre}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {stream.responseTime > 0 && (
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stream.responseTime}ms
                    </div>
                  )}

                  <Badge className={getStatusColor(stream.status)}>
                    {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                  </Badge>

                  {stream.errorCount > 0 && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {stream.errorCount} errors
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {offlineStreams > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {streams
                .filter(s => s.status === 'offline')
                .map(stream => (
                  <div key={stream.id} className="text-sm text-red-700">
                    • <strong>{stream.title}</strong> is currently offline
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
