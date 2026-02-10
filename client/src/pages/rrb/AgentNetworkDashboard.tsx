import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Network, Activity, Brain, Radio, AlertTriangle, Heart,
  Users, Zap, ArrowLeft, Shield, Globe, MessageSquare,
} from 'lucide-react';
import { Link } from 'wouter';

const AGENT_POSITIONS: Record<string, { x: number; y: number; icon: any; color: string }> = {
  qumus:           { x: 300, y: 60,  icon: Brain,          color: '#f59e0b' },
  rrb:             { x: 100, y: 180, icon: Radio,          color: '#3b82f6' },
  hybridcast:      { x: 500, y: 180, icon: AlertTriangle,  color: '#ef4444' },
  qmunity:         { x: 300, y: 200, icon: Users,          color: '#a855f7' },
  canryn:          { x: 150, y: 320, icon: Globe,          color: '#10b981' },
  'sweet-miracles':{ x: 450, y: 320, icon: Heart,          color: '#ec4899' },
};

export default function AgentNetworkDashboard() {
  const { data: topology, isLoading } = trpc.qumusComplete.getNetworkTopology.useQuery(undefined, { refetchInterval: 5000 });
  const { data: messages } = trpc.qumusComplete.getAgentMessages.useQuery({ limit: 50 }, { refetchInterval: 5000 });
  const { data: events } = trpc.qumusComplete.getCrossPlatformEvents.useQuery({ limit: 50 }, { refetchInterval: 5000 });
  const { data: connHealth } = trpc.qumusComplete.getConnectionHealth.useQuery(undefined, { refetchInterval: 10000 });
  const { data: netStatus } = trpc.qumusComplete.getNetworkStatus.useQuery(undefined, { refetchInterval: 5000 });

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const uptime = useMemo(() => {
    if (!netStatus?.uptime) return '0s';
    const s = Math.floor(netStatus.uptime / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }, [netStatus]);

  const selectedAgentData = useMemo(() => {
    if (!selectedAgent || !topology) return null;
    return topology.agents.find((a: any) => a.agentId === selectedAgent);
  }, [selectedAgent, topology]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse flex items-center gap-2">
          <Network className="w-6 h-6 animate-spin" /> Loading Agent Network...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/rrb/qumus/admin" className="text-zinc-400 hover:text-amber-400 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> QUMUS Admin
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Network className="w-7 h-7 text-amber-400" />
            Agent Network Topology
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Cross-platform collaboration — QUMUS controls all subsidiaries</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 px-3 py-1">
            <Shield className="w-3 h-3 mr-1" /> Network Health {topology?.networkHealth || 100}%
          </Badge>
          <Badge variant="outline" className="border-amber-500/40 text-amber-400 px-3 py-1">
            <Activity className="w-3 h-3 mr-1" /> Autonomy {topology?.autonomyRate || 90}%
          </Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'AGENTS ONLINE', value: `${topology?.agents?.length || 0}`, sub: `of ${topology?.agents?.length || 0}`, color: 'text-emerald-400' },
          { label: 'CONNECTIONS', value: `${topology?.connections?.length || 0}`, sub: `${connHealth?.degraded || 0} degraded`, color: 'text-blue-400' },
          { label: 'MESSAGES', value: `${topology?.totalMessages || 0}`, sub: 'total exchanged', color: 'text-amber-400' },
          { label: 'EVENTS', value: `${events?.length || 0}`, sub: 'cross-platform', color: 'text-purple-400' },
          { label: 'UPTIME', value: uptime, sub: 'network', color: 'text-zinc-200' },
        ].map((s) => (
          <Card key={s.label} className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-[10px] tracking-widest text-zinc-500 uppercase">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-zinc-500">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topology + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-zinc-900/60 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Network className="w-4 h-4" /> Network Topology
              </CardTitle>
              <span className="text-xs text-zinc-500">Click an agent to inspect</span>
            </div>
          </CardHeader>
          <CardContent>
            <svg viewBox="0 0 600 380" className="w-full h-auto">
              {topology?.connections?.map((conn: any, i: number) => {
                const from = AGENT_POSITIONS[conn.from];
                const to = AGENT_POSITIONS[conn.to];
                if (!from || !to) return null;
                return (
                  <line key={i} x1={from.x} y1={from.y + 20} x2={to.x} y2={to.y + 20}
                    stroke={conn.status === 'active' ? '#f59e0b' : '#ef4444'}
                    strokeWidth={1.5} strokeOpacity={0.4}
                    strokeDasharray={conn.status === 'active' ? 'none' : '4 4'} />
                );
              })}
              {topology?.agents?.map((agent: any) => {
                const pos = AGENT_POSITIONS[agent.agentId];
                if (!pos) return null;
                const isSelected = selectedAgent === agent.agentId;
                const shortName = agent.name
                  .replace("Rockin' Rockin' Boogie", 'RRB')
                  .replace('QUMUS Central Brain', 'QUMUS')
                  .replace('HybridCast Emergency Broadcast', 'HybridCast')
                  .replace('Canryn Production', 'Canryn');
                return (
                  <g key={agent.agentId} onClick={() => setSelectedAgent(agent.agentId)} className="cursor-pointer">
                    <circle cx={pos.x} cy={pos.y + 20} r={isSelected ? 38 : 32}
                      fill="none" stroke={pos.color} strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? 'none' : '4 4'} opacity={isSelected ? 0.8 : 0.4} />
                    <circle cx={pos.x} cy={pos.y + 20} r={26}
                      fill={`${pos.color}22`} stroke={pos.color} strokeWidth={1.5} />
                    <circle cx={pos.x + 20} cy={pos.y + 2} r={5}
                      fill={agent.status === 'online' ? '#10b981' : '#ef4444'} />
                    <text x={pos.x} y={pos.y + 60} textAnchor="middle" fill="#e4e4e7" fontSize={11} fontWeight="bold">{shortName}</text>
                    <text x={pos.x} y={pos.y + 74} textAnchor="middle" fill={pos.color} fontSize={10}>{agent.autonomyLevel}%</text>
                  </g>
                );
              })}
              <g transform="translate(20, 360)">
                <circle cx={0} cy={0} r={4} fill="#10b981" />
                <text x={10} y={4} fill="#71717a" fontSize={9}>Online</text>
                <line x1={60} y1={0} x2={90} y2={0} stroke="#f59e0b" strokeWidth={1.5} />
                <text x={95} y={4} fill="#71717a" fontSize={9}>Active Link</text>
                <line x1={170} y1={0} x2={200} y2={0} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" />
                <text x={205} y={4} fill="#71717a" fontSize={9}>Data Flow</text>
              </g>
            </svg>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4">
              {selectedAgentData ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={selectedAgentData.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                      {selectedAgentData.status}
                    </Badge>
                    <span className="font-bold text-sm">{selectedAgentData.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Autonomy', value: `${selectedAgentData.autonomyLevel}%`, color: 'text-amber-400' },
                      { label: 'Connections', value: selectedAgentData.activeConnections, color: 'text-blue-400' },
                      { label: 'Messages', value: selectedAgentData.messagesProcessed, color: 'text-zinc-200' },
                      { label: 'Capabilities', value: selectedAgentData.capabilities?.length || 0, color: 'text-zinc-200' },
                    ].map((item) => (
                      <div key={item.label} className="bg-zinc-800/50 rounded p-2">
                        <div className="text-zinc-500">{item.label}</div>
                        <div className={`${item.color} font-bold`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {selectedAgentData.capabilities && (
                    <div className="flex flex-wrap gap-1">
                      {selectedAgentData.capabilities.map((cap: string) => (
                        <Badge key={cap} variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">{cap}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an agent on the topology map to view details</p>
                  <p className="text-xs mt-1">{topology?.agents?.length || 0} agents, {topology?.connections?.length || 0} connections, {topology?.autonomyRate || 90}% autonomy</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Connection Health
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Healthy', value: connHealth?.healthy || 15, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                  { label: 'Degraded', value: connHealth?.degraded || 0, color: 'bg-amber-500', textColor: 'text-amber-400' },
                  { label: 'Failed', value: connHealth?.failed || 0, color: 'bg-red-500', textColor: 'text-red-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={`${item.textColor} w-16`}>{item.label}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${(item.value / Math.max(1, (connHealth?.healthy || 15) + (connHealth?.degraded || 0) + (connHealth?.failed || 0))) * 100}%` }} />
                    </div>
                    <span className="text-zinc-300 w-6 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Messages & Events */}
      <Tabs defaultValue="messages">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="messages"><MessageSquare className="w-3 h-3 mr-1" /> Agent Messages ({messages?.length || 0})</TabsTrigger>
          <TabsTrigger value="events"><Globe className="w-3 h-3 mr-1" /> Cross-Platform Events ({events?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="messages">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4 max-h-[400px] overflow-y-auto space-y-2">
              {(messages || []).map((msg: any) => (
                <div key={msg.id} className="flex items-start gap-3 p-2 rounded bg-zinc-800/40 text-xs">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">{String(msg.from).toUpperCase()}</Badge>
                      <span className="text-zinc-500">→</span>
                      <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">{String(msg.to).toUpperCase()}</Badge>
                      <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">{msg.type}</Badge>
                    </div>
                    <div className="text-zinc-400 mt-1 font-mono text-[10px] truncate max-w-md">{JSON.stringify(msg.payload)}</div>
                  </div>
                  <span className="text-zinc-600 whitespace-nowrap">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
              {(!messages || messages.length === 0) && <div className="text-center py-8 text-zinc-500 text-sm">No messages yet</div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4 max-h-[400px] overflow-y-auto space-y-2">
              {(events || []).map((evt: any) => (
                <div key={evt.id} className="flex items-start gap-3 p-2 rounded bg-zinc-800/40 text-xs">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={evt.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>{evt.status}</Badge>
                      <span className="text-zinc-200">{evt.type}</span>
                    </div>
                    <div className="text-zinc-400 mt-1">{evt.description}</div>
                    <div className="flex gap-1 mt-1">
                      {evt.affectedAgents?.map((a: string) => (
                        <Badge key={a} variant="outline" className="text-[10px] border-zinc-700">{a}</Badge>
                      ))}
                    </div>
                  </div>
                  <span className="text-zinc-600 whitespace-nowrap">{new Date(evt.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
              {(!events || events.length === 0) && <div className="text-center py-8 text-zinc-500 text-sm">No cross-platform events yet</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
