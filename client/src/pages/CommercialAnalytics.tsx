import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3, TrendingUp, Eye, MousePointerClick, Volume2,
  CheckCircle, Radio, Mic, Calendar, Earth, ArrowRight,
  Loader2, RefreshCw
} from 'lucide-react';

export default function CommercialAnalytics() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = trpc.ecosystemIntegration.getCommercialAnalytics.useQuery(
    { timeRange },
    { refetchInterval: 60000 }
  );

  // Fetch all commercials for the library
  const { data: commercials } = trpc.ecosystemIntegration.getAllCommercials.useQuery(undefined, {
    staleTime: 300000,
  });

  // Fetch rotation stats
  const { data: rotationStats } = trpc.ecosystemIntegration.getCommercialRotationStats.useQuery(undefined, {
    staleTime: 60000,
  });

  // Fetch TTS generation stats
  const { data: ttsStats } = trpc.ecosystemIntegration.getTtsStats.useQuery(undefined, {
    staleTime: 60000,
  });

  const daysUntilLaunch = useMemo(() => {
    const launch = new Date('2026-03-17T00:00:00');
    return Math.max(0, Math.ceil((launch.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, []);

  const djColors: Record<string, string> = {
    valanna: 'text-purple-400',
    seraph: 'text-blue-400',
    candy: 'text-amber-400',
  };

  const categoryColors: Record<string, string> = {
    promo: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    psa: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bumper: 'bg-green-500/20 text-green-400 border-green-500/30',
    countdown: 'bg-red-500/20 text-red-400 border-red-500/30',
    testimonial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Header */}
      <div className="border-b border-[#D4A843]/20 bg-gradient-to-r from-[#8B1A1A]/20 via-[#0A0A0A] to-[#1A3A5C]/20">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#D4A843]">Commercial Analytics</h1>
              <p className="text-sm text-[#E8E0D0]/50 mt-1">Sweet Miracles & Rockin' Rockin' Boogie — Building the Bridge Across the World</p>
              <p className="text-xs text-[#E8E0D0]/30 mt-0.5">UN NGO CSW70 Campaign Performance • March 17, 2026</p>
              <p className="text-xs text-purple-400/50 mt-0.5">Produced by Ty Battle (Ty Bat Zan) • Canryn Production • TBZ-OS</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-3xl font-black text-[#D4A843]">{daysUntilLaunch}</span>
                <span className="text-xs text-[#E8E0D0]/50 ml-1">days to launch</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="border-[#D4A843]/30 text-[#D4A843]">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mt-4">
            {(['24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-[#D4A843] text-[#0A0A0A]'
                    : 'bg-[#1A1A1A] text-[#E8E0D0]/50 hover:text-[#E8E0D0]/80'
                }`}
              >
                {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-[#E8E0D0]/50">Total Impressions</span>
            </div>
            <p className="text-2xl font-bold text-[#E8E0D0]">{analytics?.totalImpressions?.toLocaleString() || 0}</p>
            <p className="text-xs text-green-400 mt-1">+{analytics?.impressionGrowth || 0}% vs prior</p>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-[#E8E0D0]/50">Listens</span>
            </div>
            <p className="text-2xl font-bold text-[#E8E0D0]">{analytics?.totalListens?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#E8E0D0]/40 mt-1">{analytics?.listenRate || 0}% listen rate</p>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[#E8E0D0]/50">Click-Throughs</span>
            </div>
            <p className="text-2xl font-bold text-[#E8E0D0]">{analytics?.totalClicks?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#E8E0D0]/40 mt-1">{analytics?.clickRate || 0}% CTR</p>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#E8E0D0]/50">Completions</span>
            </div>
            <p className="text-2xl font-bold text-[#E8E0D0]">{analytics?.totalCompletions?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#E8E0D0]/40 mt-1">{analytics?.completionRate || 0}% completion rate</p>
          </Card>
        </div>

        {/* Campaign Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rotation Stats */}
          <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-5">
            <h3 className="text-sm font-bold text-[#D4A843] mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4" /> Rotation Engine
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#E8E0D0]/50">Active Commercials</span>
                <span className="text-sm font-bold text-[#E8E0D0]">{rotationStats?.activeCommercials || 12}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#E8E0D0]/50">Total Rotations</span>
                <span className="text-sm font-bold text-[#E8E0D0]">{rotationStats?.totalRotations?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#E8E0D0]/50">Insertion Rate</span>
                <span className="text-sm font-bold text-green-400">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#E8E0D0]/50">Channels Covered</span>
                <span className="text-sm font-bold text-[#E8E0D0]">50</span>
              </div>
            </div>
          </Card>

          {/* DJ Performance */}
          <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-5">
            <h3 className="text-sm font-bold text-[#D4A843] mb-4 flex items-center gap-2">
              <Mic className="w-4 h-4" /> DJ Voice Performance
            </h3>
            <div className="space-y-3">
              {analytics?.byDj?.map((dj: any) => (
                <div key={dj.voice} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      dj.voice === 'valanna' ? 'bg-purple-400' :
                      dj.voice === 'seraph' ? 'bg-blue-400' : 'bg-amber-400'
                    }`} />
                    <span className={`text-sm font-medium capitalize ${djColors[dj.voice] || 'text-[#E8E0D0]'}`}>
                      {dj.voice}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#E8E0D0]">{dj.impressions}</span>
                    <span className="text-xs text-[#E8E0D0]/30 ml-1">imp</span>
                  </div>
                </div>
              )) || (
                <p className="text-xs text-[#E8E0D0]/30">Loading DJ data...</p>
              )}
            </div>
          </Card>

          {/* TTS Stats */}
          <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-5">
            <h3 className="text-sm font-bold text-[#D4A843] mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Audio Generation
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#E8E0D0]/50">Server TTS Generated</span>
                <span className="text-sm font-bold text-[#E8E0D0]">{ttsStats?.generated || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#E8E0D0]/50">Browser Fallback</span>
                <span className="text-sm font-bold text-[#E8E0D0]">{ttsStats?.pending || 12}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#E8E0D0]/50">Total Commercials</span>
                <span className="text-sm font-bold text-[#E8E0D0]">{ttsStats?.total || 12}</span>
              </div>
              <div className="mt-2 p-2 bg-[#0A0A0A] rounded border border-green-500/20">
                <p className="text-xs text-green-400">Web Speech API active as primary audio engine</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Per-Channel Performance */}
        <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-5">
          <h3 className="text-sm font-bold text-[#D4A843] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Performance by Channel
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D4A843]/10">
                  <th className="text-left py-2 text-xs text-[#E8E0D0]/50 font-medium">Channel</th>
                  <th className="text-right py-2 text-xs text-[#E8E0D0]/50 font-medium">Views</th>
                  <th className="text-right py-2 text-xs text-[#E8E0D0]/50 font-medium">Listens</th>
                  <th className="text-right py-2 text-xs text-[#E8E0D0]/50 font-medium">Clicks</th>
                  <th className="text-right py-2 text-xs text-[#E8E0D0]/50 font-medium">Completes</th>
                  <th className="text-right py-2 text-xs text-[#E8E0D0]/50 font-medium">CTR</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.byChannel?.map((ch: any) => (
                  <tr key={ch.channel} className="border-b border-[#1A1A1A] hover:bg-[#D4A843]/5">
                    <td className="py-2 text-[#E8E0D0]">{ch.channel}</td>
                    <td className="py-2 text-right text-[#E8E0D0]/70">{ch.views}</td>
                    <td className="py-2 text-right text-purple-400">{ch.listens}</td>
                    <td className="py-2 text-right text-amber-400">{ch.clicks}</td>
                    <td className="py-2 text-right text-green-400">{ch.completes}</td>
                    <td className="py-2 text-right text-[#D4A843]">{ch.ctr}%</td>
                  </tr>
                )) || (
                  <tr><td colSpan={6} className="py-4 text-center text-[#E8E0D0]/30">Loading channel data...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Commercial Library */}
        <Card className="bg-[#1A1A1A] border-[#D4A843]/20 p-5">
          <h3 className="text-sm font-bold text-[#D4A843] mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Campaign Commercial Library
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {commercials?.map((c: any) => (
              <div key={c.id} className="p-3 bg-[#0A0A0A] rounded-lg border border-[#D4A843]/10 hover:border-[#D4A843]/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-[#E8E0D0] leading-tight">{c.title}</h4>
                  <Badge className={`text-xs ml-2 flex-shrink-0 ${categoryColors[c.category] || categoryColors.promo}`}>
                    {c.category}
                  </Badge>
                </div>
                <p className="text-xs text-[#E8E0D0]/40 line-clamp-2 mb-2">{c.script}</p>
                <div className="flex items-center justify-between text-xs text-[#E8E0D0]/30">
                  <span className={`capitalize ${djColors[c.djVoice] || 'text-[#E8E0D0]/50'}`}>{c.djVoice}</span>
                  <span>{c.duration}s</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Campaign Info Footer */}
        <div className="p-4 bg-gradient-to-r from-[#8B1A1A]/10 via-[#D4A843]/10 to-[#1A3A5C]/10 rounded-lg border border-[#D4A843]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[#E8E0D0]/40">
              <span className="flex items-center gap-1"><Earth className="w-3 h-3" /> UN NGO CSW70</span>
              <span>In Partnership with Ghana</span>
              <span>Powered by QUMUS AI</span>
              <span>Advertising: Canryn Production</span>
            </div>
            <Button
              size="sm"
              className="bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860] text-xs"
              onClick={() => window.open('/squadd', '_blank')}
            >
              <ArrowRight className="w-3.5 h-3.5 mr-1" /> SQUADD Goals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
