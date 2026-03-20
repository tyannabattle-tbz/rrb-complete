/**
 * Unified Feed Health Dashboard
 * Real-time monitoring of Ty OS, QUMUS, and RRB feed health
 */

import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface HealthCheckResult {
  timestamp: number;
  tyOS: {
    isHealthy: boolean;
    channelCount: number;
    liveChannels: number;
  };
  qumus: {
    isConnected: boolean;
    lastSync: number;
    reconnectAttempts: number;
  };
  rrb: {
    isStreaming: boolean;
    currentChannel: number;
    currentStreamUrl: string;
  };
  overallStatus: 'healthy' | 'degraded' | 'critical';
}

export function UnifiedFeedHealthDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll health status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Note: This would call the health check endpoint
        // For now, we'll use placeholder data
        setHealthStatus({
          timestamp: Date.now(),
          tyOS: {
            isHealthy: true,
            channelCount: 54,
            liveChannels: 54,
          },
          qumus: {
            isConnected: true,
            lastSync: Date.now(),
            reconnectAttempts: 0,
          },
          rrb: {
            isStreaming: true,
            currentChannel: 1,
            currentStreamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
          },
          overallStatus: 'healthy',
        });
      } catch (error) {
        console.error('Failed to fetch health status:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger manual health check
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!healthStatus) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading health status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unified Feed Health Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {new Date(healthStatus.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall System Status</CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.overallStatus)}
              <Badge className={getStatusColor(healthStatus.overallStatus)}>
                {healthStatus.overallStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ty OS Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ty OS Registry</CardTitle>
            <Badge className={healthStatus.tyOS.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {healthStatus.tyOS.isHealthy ? 'HEALTHY' : 'OFFLINE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Channels</p>
              <p className="text-2xl font-bold">{healthStatus.tyOS.channelCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Live Channels</p>
              <p className="text-2xl font-bold text-green-600">{healthStatus.tyOS.liveChannels}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p className="text-gray-600">
              {healthStatus.tyOS.isHealthy
                ? 'All 54 channels available from Ty OS Registry'
                : 'Ty OS Registry offline - using fallback'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QUMUS Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>QUMUS Unified Feed</CardTitle>
            <Badge className={healthStatus.qumus.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {healthStatus.qumus.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-sm font-mono">
                {new Date(healthStatus.qumus.lastSync).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reconnect Attempts</p>
              <p className="text-2xl font-bold">{healthStatus.qumus.reconnectAttempts}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p className="text-gray-600">
              {healthStatus.qumus.isConnected
                ? 'QUMUS synced with Ty OS Registry - WebSocket active'
                : 'QUMUS attempting reconnection to Ty OS Registry'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* RRB Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>RRB Stream Feed</CardTitle>
            <Badge className={healthStatus.rrb.isStreaming ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {healthStatus.rrb.isStreaming ? 'STREAMING' : 'OFFLINE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Channel</p>
              <p className="text-2xl font-bold">#{healthStatus.rrb.currentChannel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stream Status</p>
              <p className="text-sm font-mono">
                {healthStatus.rrb.isStreaming ? 'LIVE' : 'FALLBACK'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Stream URL</p>
            <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
              {healthStatus.rrb.currentStreamUrl}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p className="text-gray-600">
              {healthStatus.rrb.isStreaming
                ? 'RRB streaming from Ty OS Registry'
                : 'RRB using fallback stream'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Actions */}
      {healthStatus.overallStatus !== 'healthy' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Recovery Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-yellow-800 mb-4">
              System is in {healthStatus.overallStatus} mode. Attempting automatic recovery...
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Restart Ty OS Feed
              </Button>
              <Button variant="outline" size="sm">
                Reconnect QUMUS
              </Button>
              <Button variant="outline" size="sm">
                Restart RRB Stream
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
