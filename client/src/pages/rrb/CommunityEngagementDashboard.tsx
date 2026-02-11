import React, { useState } from 'react';
import { Link } from 'wouter';
import { Users, TrendingUp, Heart, Radio, Headphones, MessageSquare, Gamepad2, Sparkles, Share2, ShoppingBag, AlertTriangle, ArrowLeft, RefreshCw, Play, Square, BarChart3, Clock, Star, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  radio: <Radio className="w-4 h-4" />,
  podcast: <Headphones className="w-4 h-4" />,
  forum: <MessageSquare className="w-4 h-4" />,
  donation: <Heart className="w-4 h-4" />,
  solbones: <Gamepad2 className="w-4 h-4" />,
  meditation: <Sparkles className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
  hybridcast: <AlertTriangle className="w-4 h-4" />,
  merchandise: <ShoppingBag className="w-4 h-4" />,
};

const TIER_ICONS: Record<string, React.ReactNode> = {
  ambassador: <Crown className="w-4 h-4 text-amber-400" />,
  champion: <Award className="w-4 h-4 text-yellow-400" />,
  engaged: <Star className="w-4 h-4 text-blue-400" />,
  active: <TrendingUp className="w-4 h-4 text-green-400" />,
  new: <Users className="w-4 h-4 text-slate-400" />,
};

const TREND_COLORS: Record<string, string> = {
  rising: 'text-green-400',
  stable: 'text-blue-400',
  declining: 'text-yellow-400',
  critical: 'text-red-400',
};

export default function CommunityEngagementDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'channels' | 'reports' | 'scheduler'>('overview');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const { data: summary, refetch: refetchSummary } = trpc.communityEngagement.getSummary.useQuery(undefined, { refetchInterval: 15000 });
  const { data: members } = trpc.communityEngagement.getMembers.useQuery(
    tierFilter !== 'all' ? { tier: tierFilter as any } : undefined,
    { refetchInterval: 30000 }
  );
  const { data: channelMetrics } = trpc.communityEngagement.getChannelMetrics.useQuery(undefined, { refetchInterval: 30000 });
  const { data: schedulerStatus, refetch: refetchScheduler } = trpc.communityEngagement.getSchedulerStatus.useQuery(undefined, { refetchInterval: 10000 });

  const generateReportMutation = trpc.communityEngagement.generateReport.useMutation({
    onSuccess: () => { toast.success('Community engagement report generated'); refetchSummary(); },
    onError: () => toast.error('Failed to generate report'),
  });
  const startSchedulerMutation = trpc.communityEngagement.startScheduler.useMutation({
    onSuccess: () => { toast.success('Engagement scheduler started'); refetchScheduler(); },
  });
  const stopSchedulerMutation = trpc.communityEngagement.stopScheduler.useMutation({
    onSuccess: () => { toast.success('Engagement scheduler stopped'); refetchScheduler(); },
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'channels', label: 'Channels', icon: <Radio className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'scheduler', label: 'Scheduler', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/rrb/qumus/admin">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> QUMUS Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Community Engagement
            </h1>
            <p className="text-slate-400 text-sm">QUMUS Policy #13 — 91% Autonomy — Listener & Community Analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchSummary()} className="border-slate-600 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => generateReportMutation.mutate()} disabled={generateReportMutation.isPending}>
            <BarChart3 className="w-4 h-4 mr-1" /> Generate Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className={activeTab === tab.id ? 'bg-purple-600 hover:bg-purple-700' : 'text-slate-400 hover:text-white'}
          >
            {tab.icon}
            <span className="ml-1">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Users className="w-4 h-4 text-purple-400" /> Total Members
                </div>
                <p className="text-2xl font-bold text-purple-400">{summary.totalMembers}</p>
                <p className="text-xs text-slate-500">{summary.activeMembers} active this week</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" /> Avg Engagement
                </div>
                <p className="text-2xl font-bold text-green-400">{summary.averageEngagementScore}/100</p>
                <p className={`text-xs ${TREND_COLORS[summary.overallTrend]}`}>Trend: {summary.overallTrend.toUpperCase()}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Heart className="w-4 h-4 text-pink-400" /> Total Donations
                </div>
                <p className="text-2xl font-bold text-pink-400">${summary.totalDonations.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Sweet Miracles Fund</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Star className="w-4 h-4 text-amber-400" /> Health Score
                </div>
                <p className="text-2xl font-bold text-amber-400">{summary.healthScore}/100</p>
                <p className="text-xs text-slate-500">Grade: {summary.healthGrade}</p>
              </CardContent>
            </Card>
          </div>

          {/* Channel Breakdown */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Channel Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(summary.channelBreakdown).map(([channel, count]) => (
                  <div key={channel} className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-3">
                    {CHANNEL_ICONS[channel] || <Radio className="w-4 h-4" />}
                    <div>
                      <p className="text-xs text-slate-400 capitalize">{channel}</p>
                      <p className="text-sm font-semibold text-white">{count as number}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Channels */}
          {summary.topChannels && summary.topChannels.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Top Performing Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.topChannels.map((ch: any, i: number) => (
                    <div key={ch.channel} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-500">#{i + 1}</span>
                        {CHANNEL_ICONS[ch.channel]}
                        <span className="capitalize text-white">{ch.channel}</span>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Score: {ch.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'ambassador', 'champion', 'engaged', 'active', 'new'].map(tier => (
              <Button
                key={tier}
                variant={tierFilter === tier ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTierFilter(tier)}
                className={tierFilter === tier ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
              >
                {tier !== 'all' && TIER_ICONS[tier]}
                <span className="ml-1 capitalize">{tier}</span>
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {(members || []).map((member: any) => (
              <Card key={member.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {TIER_ICONS[member.tier]}
                      <div>
                        <p className="font-semibold text-white">{member.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="capitalize">{member.tier}</span>
                          <span>·</span>
                          <span>Score: {member.engagementScore}/100</span>
                          <span>·</span>
                          <span>Streak: {member.streak}d</span>
                          <span>·</span>
                          <span>{member.totalInteractions} interactions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.donationTotal > 0 && (
                        <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                          ${member.donationTotal}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        {(member.badges || []).slice(0, 3).map((badge: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!members || members.length === 0) && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center text-slate-400">
                  No members found for this filter.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-3">
          {(channelMetrics || []).map((metric: any) => (
            <Card key={metric.channel} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {CHANNEL_ICONS[metric.channel]}
                    <h3 className="font-semibold text-white capitalize">{metric.channel}</h3>
                  </div>
                  <Badge className={`${TREND_COLORS[metric.trend]} bg-slate-700/50 border-slate-600`}>
                    {metric.trend.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Events</p>
                    <p className="font-semibold text-white">{metric.totalEvents}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Members</p>
                    <p className="font-semibold text-white">{metric.uniqueMembers}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Avg Score</p>
                    <p className="font-semibold text-white">{metric.averageScore}/100</p>
                  </div>
                </div>
                {metric.topActions && metric.topActions.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {metric.topActions.map((a: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {a.action}: {a.count}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Engagement Reports</h2>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => generateReportMutation.mutate()} disabled={generateReportMutation.isPending}>
              <BarChart3 className="w-4 h-4 mr-1" /> Generate New Report
            </Button>
          </div>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Reports Generated: {summary?.recentReports || 0}</h3>
              <p className="text-slate-400 text-sm">Click "Generate New Report" to create a weekly engagement analysis with recommendations.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scheduler Tab */}
      {activeTab === 'scheduler' && schedulerStatus && (
        <div className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Engagement Report Scheduler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${schedulerStatus.enabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-lg font-semibold text-white">
                  {schedulerStatus.enabled ? 'ACTIVE' : 'STOPPED'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Interval</p>
                  <p className="text-sm font-semibold text-white">{schedulerStatus.intervalHuman}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Total Reports</p>
                  <p className="text-sm font-semibold text-white">{schedulerStatus.totalChecks}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Last Report</p>
                  <p className="text-sm font-semibold text-white">
                    {schedulerStatus.lastCheck ? new Date(schedulerStatus.lastCheck).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Next Estimate</p>
                  <p className="text-sm font-semibold text-white">
                    {schedulerStatus.enabled && schedulerStatus.nextCheckEstimate ? new Date(schedulerStatus.nextCheckEstimate).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {!schedulerStatus.enabled ? (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => startSchedulerMutation.mutate({})} disabled={startSchedulerMutation.isPending}>
                    <Play className="w-4 h-4 mr-1" /> Start Scheduler
                  </Button>
                ) : (
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20" onClick={() => stopSchedulerMutation.mutate()} disabled={stopSchedulerMutation.isPending}>
                    <Square className="w-4 h-4 mr-1" /> Stop Scheduler
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
