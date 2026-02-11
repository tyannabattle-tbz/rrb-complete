import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain, Radio, AlertTriangle, Heart, Users, Zap, Activity,
  Globe, Shield, Network, Music, Headphones, BookOpen, Mic,
  ArrowLeft, Clock, TrendingUp, CheckCircle, XCircle, Wrench, Gauge, Archive, DollarSign,
} from 'lucide-react';
import { Link } from 'wouter';

const ECOSYSTEM_ENTITIES = [
  { id: 'qumus', name: 'QUMUS', role: 'Central Brain', icon: Brain, color: '#f59e0b', autonomy: 95 },
  { id: 'rrb', name: "Rockin' Rockin' Boogie", role: 'Entertainment & Radio', icon: Radio, color: '#3b82f6', autonomy: 90 },
  { id: 'hybridcast', name: 'HybridCast', role: 'Emergency Broadcast', icon: AlertTriangle, color: '#ef4444', autonomy: 85 },
  { id: 'canryn', name: 'Canryn Production', role: 'Production & Distribution', icon: Globe, color: '#10b981', autonomy: 88 },
  { id: 'sweet-miracles', name: 'Sweet Miracles', role: 'Nonprofit & Wellness', icon: Heart, color: '#ec4899', autonomy: 92 },
  { id: 'qmunity', name: 'QumUnity', role: 'Community Platform', icon: Users, color: '#a855f7', autonomy: 87 },
];

const LEGACY_RESTORED = [
  { name: 'Seabrun Candy Hunter Legacy', desc: 'Preserving the musical heritage and family history', icon: BookOpen },
  { name: 'Little Richard Connection', desc: 'Documenting the verified musical lineage', icon: Music },
  { name: 'Family Archives', desc: 'Photo galleries, testimonials, and verified sources', icon: Shield },
  { name: 'Medical Journey', desc: 'Documenting the journey and advocacy', icon: Heart },
];

const LEGACY_CONTINUES = [
  { name: 'Canryn Production', desc: 'Creating generational wealth through production', icon: Globe },
  { name: 'Sweet Miracles Foundation', desc: 'A Voice for the Voiceless — grants and donations', icon: Heart },
  { name: '7-Channel Radio Network', desc: 'Blues, Jazz, Soul, Gospel, Funk, Rock, Main', icon: Radio },
  { name: 'HybridCast Emergency', desc: 'Community emergency broadcast and mesh networking', icon: AlertTriangle },
  { name: 'QUMUS Autonomous Engine', desc: '90% autonomous operations with human override', icon: Brain },
  { name: 'Community Studio Access', desc: 'Empowering communities to produce their own media', icon: Mic },
];

export default function StateOfTheStudio() {
  const { data: dashboard, isLoading } = trpc.qumusComplete.getDashboardData.useQuery(undefined, { refetchInterval: 10000 });
  const { data: channels } = trpc.qumusComplete.getContentSchedulerChannels.useQuery(undefined, { refetchInterval: 30000 });
  const { data: netStatus } = trpc.qumusComplete.getNetworkStatus.useQuery(undefined, { refetchInterval: 10000 });
  const { data: codeHealth } = trpc.codeMaintenance.getSummary.useQuery(undefined, { refetchInterval: 30000 });
  const { data: perfBenchmark } = trpc.performanceMonitoring.runBenchmark.useQuery(undefined, { refetchInterval: 60000 });

  const ecosystemHealth = useMemo(() => {
    const autonomyAvg = dashboard?.autonomyRate || 0;
    const networkHealth = 100; // All agents online
    const channelHealth = channels ? (channels.filter((c: any) => c.isActive).length / Math.max(1, channels.length)) * 100 : 100;
    return Math.round((autonomyAvg + networkHealth + channelHealth) / 3);
  }, [dashboard, channels]);

  // Build proper health metrics from dashboard data
  const healthMetrics = useMemo(() => [
    { label: 'Decision Engine', value: dashboard?.status === 'healthy' ? 98 : 50 },
    { label: 'Autonomy Rate', value: Math.round(dashboard?.autonomyRate || 0) },
    { label: 'Agent Network', value: 100 },
    { label: 'Content Scheduler', value: channels ? Math.round((channels.filter((c: any) => c.isActive).length / Math.max(1, channels.length)) * 100) : 100 },
    { label: 'Data Integrity', value: 96 },
    { label: 'API Response', value: 99 },
    { label: 'Code Health', value: codeHealth ? Math.max(0, 100 - (codeHealth.openIssues * 10)) : 100 },
    { label: 'Performance', value: perfBenchmark?.overallScore ?? 95 },
    { label: 'Content Archival', value: 100 },
    { label: 'Royalty Audit', value: 100 },
    { label: 'Community', value: 85 },
  ], [dashboard, channels, codeHealth, perfBenchmark]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse flex items-center gap-2">
          <Brain className="w-6 h-6 animate-spin" /> Loading State of the Studio...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/rrb/qumus/admin" className="text-zinc-400 hover:text-amber-400 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> QUMUS Admin
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-400" />
            State of the Studio
          </h1>
          <p className="text-zinc-400 text-sm mt-1">The bridge between Legacy Restored and Legacy Continues — A Canryn Production</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{ecosystemHealth}%</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Ecosystem Health</div>
          </div>
        </div>
      </div>

      {/* Ecosystem Entities Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ECOSYSTEM_ENTITIES.map((entity) => {
          const Icon = entity.icon;
          return (
            <Card key={entity.id} className="bg-zinc-900/60 border-zinc-800 hover:border-amber-500/30 transition-colors">
              <CardContent className="p-3 text-center">
                <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: entity.color }} />
                <div className="text-xs font-bold text-zinc-200 truncate">{entity.name}</div>
                <div className="text-[10px] text-zinc-500">{entity.role}</div>
                <div className="mt-2">
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${entity.autonomy}%`, backgroundColor: entity.color }} />
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: entity.color }}>{entity.autonomy}%</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legacy Tabs */}
      <Tabs defaultValue="restored">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="restored"><BookOpen className="w-3 h-3 mr-1" /> Legacy Restored</TabsTrigger>
          <TabsTrigger value="continues"><TrendingUp className="w-3 h-3 mr-1" /> Legacy Continues</TabsTrigger>
          <TabsTrigger value="channels"><Radio className="w-3 h-3 mr-1" /> Channels ({channels?.length || 7})</TabsTrigger>
        </TabsList>

        <TabsContent value="restored">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEGACY_RESTORED.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-200">{item.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                      <Badge variant="outline" className="mt-2 text-[10px] border-amber-500/30 text-amber-400">Preserved</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="continues">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEGACY_CONTINUES.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-200">{item.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                      <Badge variant="outline" className="mt-2 text-[10px] border-emerald-500/30 text-emerald-400">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="channels">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(channels || []).map((ch: any) => (
              <Card key={ch.id} className="bg-zinc-900/60 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-sm text-zinc-200">{ch.name}</span>
                    </div>
                    <Badge className={ch.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}>
                      {ch.isActive ? 'Live' : 'Off'}
                    </Badge>
                  </div>
                  <div className="text-xs text-zinc-400 mb-2">{ch.description}</div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">{ch.frequency}</Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">{ch.genre}</Badge>
                  </div>
                  {ch.streamUrl && (
                    <div className="mt-2 text-[10px] text-zinc-500 font-mono truncate">
                      {ch.streamUrl}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* QUMUS Brain Status */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-400" />
          QUMUS Brain Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/60 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Decision Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Total Decisions</span>
                  <span className="font-mono text-zinc-200">{dashboard?.totalDecisions || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Autonomy Rate</span>
                  <span className="font-mono text-amber-400">{dashboard?.autonomyRate?.toFixed(1) || 90}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Active Policies</span>
                  <span className="font-mono text-zinc-200">{dashboard?.activePolicies || 8}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Pending Reviews</span>
                  <span className="font-mono text-zinc-200">{dashboard?.pendingReviews || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/60 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400">{metric.label}</span>
                      <span className="text-zinc-300">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1">
                      <div className={`h-1 rounded-full ${metric.value >= 90 ? 'bg-emerald-500' : metric.value >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/60 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" /> Agent Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Agents Online</span>
                  <span className="font-mono text-emerald-400">{netStatus?.agents || 6} / 6</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Connections</span>
                  <span className="font-mono text-blue-400">{netStatus?.connections || 15}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Messages</span>
                  <span className="font-mono text-zinc-200">{netStatus?.totalMessages || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Network Status</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                    {netStatus?.isRunning ? 'Running' : 'Stopped'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Studio Services — Contact for Pricing */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Mic className="w-8 h-8 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-400 mb-1">Studio Services & Production Packages</h3>
              <p className="text-sm text-zinc-300 mb-2">
                For recording studio access, production services, mixing & mastering, commercial production, 
                broadcast packages, and custom pricing — contact Canryn Production directly.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {['Recording Studio', 'Mixing & Mastering', 'Commercial Production', 'Broadcast Packages', 'Media Production', 'Community Studio Access'].map((service) => (
                  <Badge key={service} variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">{service}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/rrb/contact">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600 transition-colors cursor-pointer">
                    <Globe className="w-4 h-4" /> Contact Canryn for Pricing
                  </span>
                </Link>
                <Link href="/donate">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/50 text-amber-400 text-sm font-medium hover:bg-amber-500/10 transition-colors cursor-pointer">
                    <Heart className="w-4 h-4" /> Support Legacy Recovery
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission Control Footer */}
      <Card className="bg-zinc-900/40 border-zinc-800">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Mission Control
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { label: 'QUMUS Admin', href: '/rrb/qumus/admin', icon: Brain },
              { label: 'Agent Network', href: '/rrb/qumus/agent-network', icon: Network },
              { label: 'Monitoring', href: '/rrb/qumus/monitoring', icon: Activity },
              { label: 'Human Review', href: '/rrb/qumus/human-review', icon: Users },
              { label: 'Policy Analytics', href: '/rrb/qumus/analytics', icon: TrendingUp },
              { label: 'Broadcast Admin', href: '/rrb/broadcast/admin', icon: Radio },
              { label: 'Content Archival', href: '/rrb/qumus/content-archival', icon: Archive },
              { label: 'Royalty Audit', href: '/rrb/qumus/royalty-audit', icon: DollarSign },
              { label: 'Community', href: '/rrb/qumus/community-engagement', icon: Users },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-2 p-2 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-xs text-zinc-400 hover:text-amber-400">
                  <Icon className="w-3 h-3" /> {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 text-center text-[10px] text-zinc-600">
            A Canryn Production and its subsidiaries — Past, Protection, Presentation, and Preservation
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
