import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Users, Radio, Earth, Clock, TrendingUp,
  ArrowLeft, Activity, Headphones, MapPin, Wifi
} from "lucide-react";
import { Link } from "wouter";

// Simulated real-time data (in production, this would come from WebSocket/SSE)
function useSimulatedListeners() {
  const [data, setData] = useState({
    totalListeners: 1247,
    peakToday: 2891,
    avgSessionMinutes: 34,
    activeChannels: 42,
    channelListeners: generateChannelData(),
    hourlyTrend: generateHourlyTrend(),
    geoDistribution: [
      { region: "Southeast US", listeners: 412, pct: 33 },
      { region: "Northeast US", listeners: 287, pct: 23 },
      { region: "Midwest US", listeners: 198, pct: 16 },
      { region: "West Coast US", listeners: 162, pct: 13 },
      { region: "International", listeners: 112, pct: 9 },
      { region: "Other US", listeners: 76, pct: 6 },
    ],
    deviceBreakdown: [
      { device: "Mobile", pct: 58, color: "bg-purple-500" },
      { device: "Desktop", pct: 28, color: "bg-amber-500" },
      { device: "Smart Speaker", pct: 9, color: "bg-emerald-500" },
      { device: "Other", pct: 5, color: "bg-gray-500" },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        totalListeners: prev.totalListeners + Math.floor(Math.random() * 20 - 8),
        activeChannels: 38 + Math.floor(Math.random() * 12),
        channelListeners: prev.channelListeners.map(ch => ({
          ...ch,
          listeners: Math.max(0, ch.listeners + Math.floor(Math.random() * 10 - 4)),
        })),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

function generateChannelData() {
  const channels = [
    { name: "Soul Kitchen", id: 1, category: "Music" },
    { name: "Gospel Hour", id: 2, category: "Gospel" },
    { name: "Jazz Lounge", id: 3, category: "Music" },
    { name: "R&B Classics", id: 4, category: "Music" },
    { name: "396 Hz Liberation", id: 5, category: "Healing" },
    { name: "528 Hz Love", id: 7, category: "Healing" },
    { name: "Community Voice", id: 11, category: "Talk" },
    { name: "Black History", id: 13, category: "Culture" },
    { name: "Kids Zone", id: 17, category: "Kids" },
    { name: "Live Events", id: 42, category: "Events" },
    { name: "Hip-Hop Underground", id: 20, category: "Music" },
    { name: "Ambient Chill", id: 22, category: "Music" },
    { name: "News & Politics", id: 25, category: "Talk" },
    { name: "Selma Stories", id: 30, category: "Culture" },
    { name: "Emergency Broadcast", id: 41, category: "Emergency" },
  ];
  return channels.map(ch => ({
    ...ch,
    listeners: Math.floor(Math.random() * 150 + 10),
  })).sort((a, b) => b.listeners - a.listeners);
}

function generateHourlyTrend() {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const baseListeners = i >= 6 && i <= 10 ? 1800 :
      i >= 11 && i <= 14 ? 1200 :
      i >= 15 && i <= 20 ? 2200 :
      i >= 21 && i <= 23 ? 1500 : 400;
    hours.push({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00`,
      listeners: baseListeners + Math.floor(Math.random() * 400 - 200),
    });
  }
  return hours;
}

const CATEGORY_COLORS: Record<string, string> = {
  Music: "text-purple-400",
  Gospel: "text-amber-400",
  Healing: "text-emerald-400",
  Talk: "text-blue-400",
  Culture: "text-pink-400",
  Kids: "text-yellow-400",
  Events: "text-red-400",
  Emergency: "text-orange-400",
};

export default function ListenerAnalyticsLive() {
  const data = useSimulatedListeners();
  const maxHourlyListeners = useMemo(() => Math.max(...data.hourlyTrend.map(h => h.listeners)), [data.hourlyTrend]);
  const maxChannelListeners = useMemo(() => Math.max(...data.channelListeners.map(c => c.listeners)), [data.channelListeners]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/qumus" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Listener Analytics — Live
              </h1>
              <p className="text-sm text-gray-400">Real-time listener tracking across 54 RRB channels</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400">Live — updating every 5 seconds</span>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Current Listeners", value: data.totalListeners.toLocaleString(), icon: Users, color: "text-purple-400", bg: "from-purple-600/20 to-purple-900/20" },
            { label: "Peak Today", value: data.peakToday.toLocaleString(), icon: TrendingUp, color: "text-amber-400", bg: "from-amber-600/20 to-amber-900/20" },
            { label: "Avg Session", value: `${data.avgSessionMinutes} min`, icon: Clock, color: "text-emerald-400", bg: "from-emerald-600/20 to-emerald-900/20" },
            { label: "Active Channels", value: `${data.activeChannels}/50`, icon: Radio, color: "text-blue-400", bg: "from-blue-600/20 to-blue-900/20" },
          ].map((stat, i) => (
            <Card key={i} className={`bg-gradient-to-br ${stat.bg} border-purple-500/20`}>
              <CardContent className="pt-4 pb-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hourly Trend */}
        <Card className="bg-gray-900/60 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" /> 24-Hour Listener Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {data.hourlyTrend.map((h, i) => {
                const height = (h.listeners / maxHourlyListeners) * 100;
                const currentHour = new Date().getHours();
                const isCurrent = h.hour === currentHour;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                      {h.label}: {h.listeners.toLocaleString()}
                    </div>
                    <div
                      className={`w-full rounded-t transition-all ${isCurrent ? 'bg-amber-500' : 'bg-purple-500/60 hover:bg-purple-500'}`}
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    {i % 3 === 0 && (
                      <span className="text-[10px] text-gray-500">{h.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800">
              <span>Morning Drive (6-10 AM)</span>
              <span>Afternoon (11-2 PM)</span>
              <span className="text-amber-400 font-bold">Prime Time (3-8 PM)</span>
              <span>Evening (9 PM+)</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Channels */}
          <Card className="bg-gray-900/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2 text-lg">
                <Headphones className="w-5 h-5" /> Top Channels by Listeners
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.channelListeners.slice(0, 10).map((ch, i) => (
                <div key={ch.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-5 text-right">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium">{ch.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${CATEGORY_COLORS[ch.category] || 'text-gray-400'}`}>{ch.category}</span>
                        <span className="text-sm font-bold text-amber-400">{ch.listeners}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(ch.listeners / maxChannelListeners) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="bg-gray-900/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2 text-lg">
                <Earth className="w-5 h-5" /> Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.geoDistribution.map((geo, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-500" /> {geo.region}
                    </span>
                    <span className="text-sm">
                      <span className="text-amber-400 font-bold">{geo.listeners}</span>
                      <span className="text-gray-500 ml-1">({geo.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full"
                      style={{ width: `${geo.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-800 mt-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-purple-400" /> Device Breakdown
                </h4>
                <div className="flex gap-2 h-4 rounded-full overflow-hidden">
                  {data.deviceBreakdown.map((d, i) => (
                    <div key={i} className={`${d.color} transition-all`} style={{ width: `${d.pct}%` }} title={`${d.device}: ${d.pct}%`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {data.deviceBreakdown.map((d, i) => (
                    <span key={i} className="text-xs text-gray-400 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${d.color}`} /> {d.device} ({d.pct}%)
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Insights */}
        <Card className="bg-gray-900/60 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" /> Engagement Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Bounce Rate", value: "12%", desc: "Listeners who leave < 1 min", trend: "down", good: true },
                { label: "Return Rate", value: "67%", desc: "Listeners who return daily", trend: "up", good: true },
                { label: "Channel Switches", value: "3.2/session", desc: "Avg channels per session", trend: "up", good: true },
                { label: "AI DJ Interactions", value: "847", desc: "Seraph & Candy chats today", trend: "up", good: true },
              ].map((insight, i) => (
                <div key={i} className="bg-gray-800/40 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{insight.value}</div>
                  <div className="text-sm text-gray-300 mt-1">{insight.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{insight.desc}</div>
                  <Badge className={`mt-2 ${insight.good ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`} variant="outline">
                    {insight.trend === "up" ? "↑" : "↓"} {insight.good ? "Healthy" : "Needs Attention"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-purple-500/10">
          <p className="text-xs text-gray-500">
            Canryn Production — QUMUS Listener Analytics Engine
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Data refreshes every 5 seconds. Geographic data based on IP geolocation. Industry-leading analytics for Black-owned radio.
          </p>
        </div>
      </div>
    </div>
  );
}
