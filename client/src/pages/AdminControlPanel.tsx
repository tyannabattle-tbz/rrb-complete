import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';
import {
  Settings, Users, Radio, Heart, AlertTriangle,
  CheckCircle, Power, RotateCcw, Download, Upload,
  Wifi, WifiOff, Activity, ExternalLink, Key, Save,
  RefreshCw, Tv, Shield, Database, Globe, Zap,
  Play, Pause, Eye, Pencil, Trash2, Plus, Copy,
} from 'lucide-react';

export default function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // ── Real data from tRPC ──
  const qumusStatus = trpc.qumus?.getStatus?.useQuery?.(undefined, { refetchInterval: 30000 });
  const restreamUrl = trpc.restreamConfig.getRestreamUrl.useQuery();
  const allConfigs = trpc.restreamConfig.getAllConfigs.useQuery();
  const streamHealth = trpc.streamHealth.getLatest.useQuery(undefined, { refetchInterval: 60000 });
  const streamMonitorStatus = trpc.streamHealth.getStatus.useQuery(undefined, { refetchInterval: 30000 });
  const streamHistory = trpc.streamHealth.getHistory.useQuery();

  // ── Mutations ──
  const setRestreamUrlMut = trpc.restreamConfig.setRestreamUrl.useMutation({
    onSuccess: () => {
      toast({ title: 'Restream URL Updated', description: 'All platform buttons now use the new URL.' });
      restreamUrl.refetch();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
  const setConfigMut = trpc.restreamConfig.setConfig.useMutation({
    onSuccess: () => {
      toast({ title: 'Config Saved' });
      allConfigs.refetch();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
  const createRoomMut = trpc.restreamConfig.createRoom.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Room Created', description: `Status: ${data.status} — ${data.url}` });
      restreamUrl.refetch();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
  const runHealthCheckMut = trpc.streamHealth.runCheck.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Health Check Complete', description: `${data.healthy}/${data.totalChannels} healthy (${data.uptimePercent}%)` });
      streamHealth.refetch();
      streamHistory.refetch();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
  const startMonitorMut = trpc.streamHealth.startMonitor.useMutation({
    onSuccess: () => {
      toast({ title: 'Monitor Started', description: 'Stream health checks running every 15 minutes.' });
      streamMonitorStatus.refetch();
    },
  });
  const stopMonitorMut = trpc.streamHealth.stopMonitor.useMutation({
    onSuccess: () => {
      toast({ title: 'Monitor Stopped' });
      streamMonitorStatus.refetch();
    },
  });

  // ── Local state for editable fields ──
  const [editRestreamUrl, setEditRestreamUrl] = useState('');
  const [editApiKey, setEditApiKey] = useState('');
  const [newConfigKey, setNewConfigKey] = useState('');
  const [newConfigValue, setNewConfigValue] = useState('');
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editConfigValue, setEditConfigValue] = useState('');

  useEffect(() => {
    if (restreamUrl.data?.url) setEditRestreamUrl(restreamUrl.data.url);
  }, [restreamUrl.data]);

  useEffect(() => {
    const apiKeyConfig = allConfigs.data?.find(c => c.key === 'restream_api_key');
    if (apiKeyConfig?.value) setEditApiKey(apiKeyConfig.value.substring(0, 8) + '...');
  }, [allConfigs.data]);

  const healthReport = streamHealth.data;
  const monitorRunning = streamMonitorStatus.data?.isRunning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-7 h-7 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Control Panel</h1>
                <p className="text-xs text-gray-400">Ecosystem management, Restream, Stream Health & System Config</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={monitorRunning ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                {monitorRunning ? 'Monitor Active' : 'Monitor Idle'}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400">Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-slate-800/50 border border-slate-700 gap-1 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restream">Restream</TabsTrigger>
            <TabsTrigger value="stream-health">Stream Health</TabsTrigger>
            <TabsTrigger value="config">System Config</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════ OVERVIEW ═══════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Tv className="w-5 h-5 text-purple-400" />
                    <Badge className={restreamUrl.data?.isConfigured ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {restreamUrl.data?.isConfigured ? 'Connected' : 'Not Set'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">Restream Studio</p>
                  <p className="text-lg font-bold text-white truncate">{restreamUrl.data?.url ? 'Configured' : 'Needs Setup'}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <Badge className={
                      healthReport?.uptimePercent === 100 ? 'bg-green-500/20 text-green-400' :
                      (healthReport?.uptimePercent || 0) >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }>
                      {healthReport?.uptimePercent ?? '—'}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">Stream Uptime</p>
                  <p className="text-lg font-bold text-white">
                    {healthReport ? `${healthReport.healthy}/${healthReport.totalChannels} Healthy` : 'No data'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Radio className="w-5 h-5 text-pink-400" />
                    <Badge className="bg-green-500/20 text-green-400">Live</Badge>
                  </div>
                  <p className="text-sm text-gray-400">RRB Radio</p>
                  <p className="text-lg font-bold text-white">54 Channels</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <Badge className={monitorRunning ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {monitorRunning ? 'Running' : 'Stopped'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">Health Monitor</p>
                  <p className="text-lg font-bold text-white">15-min Checks</p>
                </CardContent>
              </Card>
            </div>

            {/* Stream Health Summary */}
            {healthReport && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Stream Health Summary
                  </CardTitle>
                  <CardDescription>
                    Last check: {healthReport.timestamp ? new Date(healthReport.timestamp).toLocaleString() : 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{healthReport.totalChannels}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                    <div className="bg-green-900/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-400">{healthReport.healthy}</p>
                      <p className="text-xs text-gray-400">Healthy</p>
                    </div>
                    <div className="bg-yellow-900/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{healthReport.degraded}</p>
                      <p className="text-xs text-gray-400">Degraded</p>
                    </div>
                    <div className="bg-red-900/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-red-400">{healthReport.down}</p>
                      <p className="text-xs text-gray-400">Down</p>
                    </div>
                  </div>
                  {/* Uptime bar */}
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        healthReport.uptimePercent === 100 ? 'bg-green-500' :
                        healthReport.uptimePercent >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthReport.uptimePercent}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-2">
                    {healthReport.uptimePercent}% Uptime
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Down channels alert */}
            {healthReport && healthReport.down > 0 && healthReport.channels && (
              <Card className="bg-red-900/20 border-red-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    {healthReport.down} Channel(s) Down
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {healthReport.channels
                      .filter((ch: any) => ch.status === 'down')
                      .map((ch: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-red-900/30 rounded">
                          <span className="text-white">{ch.name}</span>
                          <span className="text-red-400 text-sm">{ch.error || 'No response'}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════ RESTREAM ═══════════════════════════════════════════ */}
          <TabsContent value="restream" className="space-y-6 mt-4">
            {/* Restream Studio URL */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-purple-400" />
                  Restream Studio URL
                </CardTitle>
                <CardDescription>
                  This URL is used by every "Go Live" and "Open Studio" button across the platform.
                  Change it here and all buttons update instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={editRestreamUrl}
                    onChange={(e) => setEditRestreamUrl(e.target.value)}
                    placeholder="https://studio.restream.io/your-room"
                    className="bg-slate-700/50 border-slate-600 text-white flex-1"
                  />
                  <Button
                    onClick={() => setRestreamUrlMut.mutate({ url: editRestreamUrl })}
                    disabled={setRestreamUrlMut.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (restreamUrl.data?.url) window.open(restreamUrl.data.url, '_blank');
                    }}
                    className="border-slate-600 text-slate-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Studio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(restreamUrl.data?.url || '');
                      toast({ title: 'Copied to clipboard' });
                    }}
                    className="border-slate-600 text-slate-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Restream API Key */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-yellow-400" />
                  Restream API Key
                </CardTitle>
                <CardDescription>
                  With an API key, the platform can auto-create Restream rooms. Without it, rooms are created manually.
                  Get your API key from <a href="https://restream.io/settings/api" target="_blank" rel="noopener" className="text-blue-400 underline">restream.io/settings/api</a>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={editApiKey}
                    onChange={(e) => setEditApiKey(e.target.value)}
                    placeholder="Enter your Restream API key"
                    className="bg-slate-700/50 border-slate-600 text-white flex-1"
                  />
                  <Button
                    onClick={() => {
                      setConfigMut.mutate({ key: 'restream_api_key', value: editApiKey });
                    }}
                    disabled={setConfigMut.isPending}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Key
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {allConfigs.data?.find(c => c.key === 'restream_api_key')?.value ? (
                    <Badge className="bg-green-500/20 text-green-400">API Key Configured — Auto-creation enabled</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">No API Key — Manual mode only</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Create Room */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Create Restream Room
                </CardTitle>
                <CardDescription>
                  Create a new broadcast room. If API key is set, it auto-creates via Restream API.
                  Otherwise, you'll get instructions for manual setup.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => createRoomMut.mutate({ title: 'RRB Live Broadcast', description: "Rockin' Rockin' Boogie Live" })}
                  disabled={createRoomMut.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createRoomMut.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create New Room
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════ STREAM HEALTH ═══════════════════════════════════════════ */}
          <TabsContent value="stream-health" className="space-y-6 mt-4">
            {/* Monitor Controls */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Stream Health Monitor
                </CardTitle>
                <CardDescription>
                  Automated checks every 15 minutes on all 54 channels. Owner gets notified when streams go down.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className={monitorRunning ? 'bg-green-500/20 text-green-400 text-sm px-3 py-1' : 'bg-red-500/20 text-red-400 text-sm px-3 py-1'}>
                    {monitorRunning ? '● Running' : '○ Stopped'}
                  </Badge>
                  <div className="flex gap-2">
                    {monitorRunning ? (
                      <Button
                        onClick={() => stopMonitorMut.mutate()}
                        disabled={stopMonitorMut.isPending}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        onClick={() => startMonitorMut.mutate()}
                        disabled={startMonitorMut.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button
                      onClick={() => runHealthCheckMut.mutate()}
                      disabled={runHealthCheckMut.isPending}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {runHealthCheckMut.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Run Check Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Health Report */}
            {healthReport && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Current Health Report</CardTitle>
                  <CardDescription>
                    Last check: {healthReport.timestamp ? new Date(healthReport.timestamp).toLocaleString() : 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary bar */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{healthReport.totalChannels}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                    <div className="bg-green-900/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-400">{healthReport.healthy}</p>
                      <p className="text-xs text-gray-400">Healthy</p>
                    </div>
                    <div className="bg-yellow-900/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{healthReport.degraded}</p>
                      <p className="text-xs text-gray-400">Degraded</p>
                    </div>
                    <div className="bg-red-900/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-red-400">{healthReport.down}</p>
                      <p className="text-xs text-gray-400">Down</p>
                    </div>
                  </div>

                  {/* Full uptime bar */}
                  <div className="w-full bg-slate-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all flex items-center justify-center text-xs font-bold ${
                        healthReport.uptimePercent === 100 ? 'bg-green-500 text-green-900' :
                        healthReport.uptimePercent >= 90 ? 'bg-yellow-500 text-yellow-900' : 'bg-red-500 text-red-900'
                      }`}
                      style={{ width: `${Math.max(healthReport.uptimePercent, 10)}%` }}
                    >
                      {healthReport.uptimePercent}%
                    </div>
                  </div>

                  {/* Channel grid */}
                  {healthReport.channels && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
                      {healthReport.channels.map((ch: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-2 rounded text-xs ${
                            ch.status === 'healthy' ? 'bg-green-900/20 border border-green-800/30' :
                            ch.status === 'degraded' ? 'bg-yellow-900/20 border border-yellow-800/30' :
                            'bg-red-900/20 border border-red-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {ch.status === 'healthy' ? (
                              <Wifi className="w-3 h-3 text-green-400 shrink-0" />
                            ) : ch.status === 'degraded' ? (
                              <AlertTriangle className="w-3 h-3 text-yellow-400 shrink-0" />
                            ) : (
                              <WifiOff className="w-3 h-3 text-red-400 shrink-0" />
                            )}
                            <span className="text-white truncate">{ch.name}</span>
                          </div>
                          {ch.responseTime && (
                            <span className="text-gray-500 text-[10px]">{ch.responseTime}ms</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Health History */}
            {streamHistory.data && streamHistory.data.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Health History (Last 24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {streamHistory.data.map((entry: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/30 rounded text-sm">
                        <span className="text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">{entry.healthy} ✓</span>
                          {entry.degraded > 0 && <span className="text-yellow-400">{entry.degraded} ⚠</span>}
                          {entry.down > 0 && <span className="text-red-400">{entry.down} ✗</span>}
                          <Badge className={
                            entry.uptimePercent === 100 ? 'bg-green-500/20 text-green-400' :
                            entry.uptimePercent >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {entry.uptimePercent}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════ SYSTEM CONFIG ═══════════════════════════════════════════ */}
          <TabsContent value="config" className="space-y-6 mt-4">
            {/* Add New Config */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Manage all key-value pairs stored in system_config. Changes take effect immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newConfigKey}
                    onChange={(e) => setNewConfigKey(e.target.value)}
                    placeholder="Config key (e.g., restream_api_key)"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                  <Input
                    value={newConfigValue}
                    onChange={(e) => setNewConfigValue(e.target.value)}
                    placeholder="Value"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                  <Button
                    onClick={() => {
                      if (!newConfigKey.trim()) return;
                      setConfigMut.mutate({ key: newConfigKey, value: newConfigValue });
                      setNewConfigKey('');
                      setNewConfigValue('');
                    }}
                    disabled={setConfigMut.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Configs */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>All Configurations ({allConfigs.data?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allConfigs.data?.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-mono text-blue-400">{config.key}</p>
                        {editingConfig === config.key ? (
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={editConfigValue}
                              onChange={(e) => setEditConfigValue(e.target.value)}
                              className="bg-slate-600/50 border-slate-500 text-white text-sm h-8"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                setConfigMut.mutate({ key: config.key, value: editConfigValue });
                                setEditingConfig(null);
                              }}
                              className="bg-green-600 hover:bg-green-700 h-8"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingConfig(null)}
                              className="border-slate-500 h-8"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 truncate">
                            {config.key.includes('key') || config.key.includes('secret')
                              ? (config.value ? '••••••••' : '(empty)')
                              : (config.value || '(empty)')}
                          </p>
                        )}
                        {config.description && (
                          <p className="text-[10px] text-gray-500 mt-1">{config.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingConfig(config.key);
                            setEditConfigValue(config.value);
                          }}
                          className="text-slate-400 hover:text-white h-8 w-8 p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!allConfigs.data || allConfigs.data.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No configurations found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════ SYSTEMS ═══════════════════════════════════════════ */}
          <TabsContent value="systems" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'QUMUS Core', icon: <Zap className="w-5 h-5 text-cyan-400" />, status: true, desc: 'Autonomous orchestration engine — 19 policies active' },
                { name: 'RRB Radio', icon: <Radio className="w-5 h-5 text-pink-400" />, status: true, desc: '54 channels broadcasting 24/7' },
                { name: 'HybridCast', icon: <Globe className="w-5 h-5 text-orange-400" />, status: true, desc: 'Emergency broadcast PWA — offline-first' },
                { name: 'Sweet Miracles', icon: <Heart className="w-5 h-5 text-green-400" />, status: true, desc: '501(c)(3) donation processing via Stripe' },
                { name: 'Stream Health Monitor', icon: <Shield className="w-5 h-5 text-blue-400" />, status: !!monitorRunning, desc: '15-min automated health checks on all 54 channels' },
                { name: 'Restream Integration', icon: <Tv className="w-5 h-5 text-purple-400" />, status: !!restreamUrl.data?.isConfigured, desc: 'Dynamic studio URL — all buttons wired' },
              ].map((system, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {system.icon}
                        <span className="font-semibold text-white">{system.name}</span>
                      </div>
                      <Badge className={system.status ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {system.status ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{system.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-slate-700 bg-slate-900/50 mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">Admin Control Panel • Canryn Production • All actions logged</p>
        </div>
      </footer>
    </div>
  );
}
