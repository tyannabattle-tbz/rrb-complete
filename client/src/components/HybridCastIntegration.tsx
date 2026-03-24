'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wifi,
  WifiOff,
  Satellite,
  Radio,
  AlertTriangle,
  Shield,
  Zap,
  Globe,
  Signal,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface MeshNode {
  id: string;
  name: string;
  signal: number;
  battery: number;
  lastSeen: Date;
  status: 'online' | 'offline' | 'weak';
}

interface SatelliteLink {
  id: string;
  provider: 'iridium' | 'garmin';
  status: 'connected' | 'disconnected' | 'connecting';
  signal: number;
  lastMessage: string;
  timestamp: Date;
}

interface BroadcastSession {
  id: string;
  name: string;
  startTime: Date;
  duration: number;
  channels: number;
  listeners: number;
  status: 'live' | 'scheduled' | 'ended';
}

export function HybridCastIntegration() {
  const [isOffline, setIsOffline] = useState(false);
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([
    {
      id: 'node-1',
      name: 'Chris Battle Sr - Main',
      signal: 95,
      battery: 87,
      lastSeen: new Date(),
      status: 'online',
    },
    {
      id: 'node-2',
      name: 'C.J. Battle - Remote',
      signal: 72,
      battery: 64,
      lastSeen: new Date(Date.now() - 30000),
      status: 'online',
    },
    {
      id: 'node-3',
      name: 'Kairen Battle - Field',
      signal: 45,
      battery: 42,
      lastSeen: new Date(Date.now() - 120000),
      status: 'weak',
    },
  ]);

  const [satelliteLinks, setSatelliteLinks] = useState<SatelliteLink[]>([
    {
      id: 'sat-1',
      provider: 'iridium',
      status: 'connected',
      signal: 88,
      lastMessage: 'Backup broadcast ready',
      timestamp: new Date(),
    },
    {
      id: 'sat-2',
      provider: 'garmin',
      status: 'connected',
      signal: 92,
      lastMessage: 'GPS tracking active',
      timestamp: new Date(),
    },
  ]);

  const [broadcastSessions, setBroadcastSessions] = useState<BroadcastSession[]>([
    {
      id: 'broadcast-1',
      name: 'Sunday Healing Session',
      startTime: new Date(),
      duration: 120,
      channels: 4,
      listeners: 2847,
      status: 'live',
    },
    {
      id: 'broadcast-2',
      name: 'Evening Performance',
      startTime: new Date(Date.now() + 3600000),
      duration: 90,
      channels: 6,
      listeners: 0,
      status: 'scheduled',
    },
  ]);

  const [autonomyLevel, setAutonomyLevel] = useState(90);
  const [qumusStatus, setQumusStatus] = useState('healthy');

  // Detect offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back online - HybridCast connected');
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('Offline mode activated - Using mesh network');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate mesh node updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMeshNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          signal: Math.max(20, node.signal + (Math.random() - 0.5) * 10),
          battery: Math.max(0, node.battery - Math.random() * 0.5),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'weak':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'offline':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'disconnected':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'connecting':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getSignalBars = (signal: number) => {
    if (signal >= 80) return '████';
    if (signal >= 60) return '███░';
    if (signal >= 40) return '██░░';
    return '█░░░';
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={`${isOffline ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOffline ? (
                <>
                  <WifiOff className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-400">OFFLINE MODE ACTIVE</h3>
                    <p className="text-sm text-red-300">Using mesh network and satellite backup</p>
                  </div>
                </>
              ) : (
                <>
                  <Wifi className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-400">HYBRID BROADCAST ONLINE</h3>
                    <p className="text-sm text-green-300">All systems operational</p>
                  </div>
                </>
              )}
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(isOffline ? 'offline' : 'online')}>
                {isOffline ? 'MESH NETWORK' : 'INTERNET'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="mesh" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/40 border border-slate-700/30">
          <TabsTrigger value="mesh" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Mesh Network
          </TabsTrigger>
          <TabsTrigger value="satellite" className="flex items-center gap-2">
            <Satellite className="w-4 h-4" />
            Satellite
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="qumus" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            QUMUS
          </TabsTrigger>
        </TabsList>

        {/* Mesh Network Tab */}
        <TabsContent value="mesh" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400" />
                Mesh Network Nodes
              </CardTitle>
              <CardDescription>Band member connectivity and signal strength</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {meshNodes.map((node) => (
                <div
                  key={node.id}
                  className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="font-semibold text-white">{node.name}</span>
                    </div>
                    <Badge className={getStatusColor(node.status)}>
                      {node.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Signal className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">{getSignalBars(node.signal)}</span>
                      <span className="text-slate-300">{Math.round(node.signal)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{Math.round(node.battery)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Last seen: {node.lastSeen.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satellite Tab */}
        <TabsContent value="satellite" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-purple-400" />
                Satellite Links
              </CardTitle>
              <CardDescription>Backup broadcast and tracking systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {satelliteLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Satellite className="w-5 h-5 text-purple-400" />
                      <div>
                        <span className="font-semibold text-white capitalize">
                          {link.provider} SBD
                        </span>
                        <p className="text-sm text-slate-400">{link.lastMessage}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(link.status)}>
                      {link.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Signal className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{Math.round(link.signal)}%</span>
                    </div>
                    <span className="text-slate-500">{link.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-400" />
                Broadcast Sessions
              </CardTitle>
              <CardDescription>Active and scheduled broadcasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {broadcastSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{session.name}</h4>
                      <p className="text-sm text-slate-400">
                        {session.channels} channels • {session.listeners.toLocaleString()} listeners
                      </p>
                    </div>
                    <Badge
                      className={
                        session.status === 'live'
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      }
                    >
                      {session.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{session.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        {session.startTime.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QUMUS Tab */}
        <TabsContent value="qumus" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                QUMUS Autonomous Orchestration
              </CardTitle>
              <CardDescription>Autonomous decision-making and control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Autonomy Level</span>
                  <span className="text-lg font-bold text-yellow-400">{autonomyLevel}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${autonomyLevel}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">System Status</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    {qumusStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Active Policies</div>
                  <div className="text-2xl font-bold text-white">12</div>
                </div>
                <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Subsystems</div>
                  <div className="text-2xl font-bold text-white">18</div>
                </div>
                <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Decisions/Hour</div>
                  <div className="text-2xl font-bold text-white">847</div>
                </div>
                <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Human Overrides</div>
                  <div className="text-2xl font-bold text-white">3</div>
                </div>
              </div>

              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold">
                <Shield className="w-4 h-4 mr-2" />
                View QUMUS Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emergency Controls */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Emergency Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Activate Emergency Broadcast
          </Button>
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold">
            <Satellite className="w-4 h-4 mr-2" />
            Switch to Satellite Backup
          </Button>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Radio className="w-4 h-4 mr-2" />
            Activate Mesh Network
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
