/**
 * RRB Listener Analytics Dashboard
 * 
 * Real-time listener tracking and engagement analytics:
 * - Active listener metrics
 * - Engagement tracking
 * - Geographic distribution
 * - Listening patterns
 * - Audience growth trends
 */

import { useState } from "react";
import {
  FuturisticHeader,
  FuturisticGrid,
  FuturisticCard,
  FuturisticButton,
  FuturisticSection,
  FuturisticDivider,
  FuturisticBadge,
  FuturisticMetric,
} from "@/components/FuturisticDesignSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  TrendingUp,
  Globe,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  MapPin,
} from "lucide-react";

export default function RRBListenerAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - will be replaced with tRPC queries
  const stats = {
    activeListeners: 2847,
    totalListeners: 125420,
    avgEngagement: 87.5,
    growthRate: 12.3,
    retentionRate: 94.2,
    peakHour: "18:00 EST",
  };

  const topBroadcasts = [
    {
      id: 1,
      title: "Morning Motivation Mix",
      listeners: 1205,
      engagement: 92,
      duration: "2h 15m",
    },
    {
      id: 2,
      title: "Healing Frequencies",
      listeners: 847,
      engagement: 88,
      duration: "1h",
    },
    {
      id: 3,
      title: "Evening Vibes",
      listeners: 795,
      engagement: 85,
      duration: "3h",
    },
  ];

  const geographicData = [
    { region: "North America", listeners: 89420, percentage: 71 },
    { region: "Europe", listeners: 18950, percentage: 15 },
    { region: "South America", listeners: 10230, percentage: 8 },
    { region: "Other", listeners: 6820, percentage: 6 },
  ];

  const listeningPatterns = [
    { time: "06:00", listeners: 245, trend: "up" },
    { time: "09:00", listeners: 1205, trend: "up" },
    { time: "12:00", listeners: 847, trend: "down" },
    { time: "15:00", listeners: 623, trend: "down" },
    { time: "18:00", listeners: 2847, trend: "up" },
    { time: "21:00", listeners: 1945, trend: "down" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FuturisticHeader
          title="Listener Analytics"
          subtitle="Real-time engagement tracking and audience insights"
          icon={<Users className="w-8 h-8" />}
        />

        {/* Key Metrics */}
        <FuturisticGrid columns={3}>
          <FuturisticCard glow="cyan">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Active Listeners</p>
              <div className="text-3xl font-bold text-cyan-400">
                {stats.activeListeners.toLocaleString()}
              </div>
              <FuturisticBadge variant="success">+{stats.growthRate}% this week</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="magenta">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Total Listeners</p>
              <div className="text-3xl font-bold text-magenta-400">
                {stats.totalListeners.toLocaleString()}
              </div>
              <FuturisticBadge variant="success">All-time high</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="cyan">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Avg Engagement</p>
              <div className="text-3xl font-bold text-emerald-400">
                {stats.avgEngagement}%
              </div>
              <FuturisticBadge variant="success">Excellent</FuturisticBadge>
            </div>
          </FuturisticCard>
        </FuturisticGrid>

        <FuturisticDivider animated />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              <BarChart3 size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="broadcasts" className="text-xs md:text-sm">
              <Activity size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Broadcasts</span>
            </TabsTrigger>
            <TabsTrigger value="geographic" className="text-xs md:text-sm">
              <MapPin size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Geographic</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs md:text-sm">
              <Clock size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs md:text-sm">
              <TrendingUp size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Trends</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <FuturisticSection title="Engagement Metrics">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FuturisticCard glow="cyan">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Retention Rate</p>
                    <p className="text-2xl font-bold text-cyan-400">{stats.retentionRate}%</p>
                  </div>
                </FuturisticCard>
                <FuturisticCard glow="magenta">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Peak Hour</p>
                    <p className="text-2xl font-bold text-magenta-400">{stats.peakHour}</p>
                  </div>
                </FuturisticCard>
                <FuturisticCard glow="cyan">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Growth Rate</p>
                    <p className="text-2xl font-bold text-emerald-400">+{stats.growthRate}%</p>
                  </div>
                </FuturisticCard>
              </div>
            </FuturisticSection>

            <FuturisticSection title="Quick Stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FuturisticCard glow="magenta">
                  <div className="space-y-2">
                    <p className="font-semibold text-white">Total Listening Hours</p>
                    <p className="text-3xl font-bold text-magenta-400">847,230</p>
                    <p className="text-sm text-slate-400">+15% this month</p>
                  </div>
                </FuturisticCard>
                <FuturisticCard glow="cyan">
                  <div className="space-y-2">
                    <p className="font-semibold text-white">New Listeners</p>
                    <p className="text-3xl font-bold text-cyan-400">3,420</p>
                    <p className="text-sm text-slate-400">This month</p>
                  </div>
                </FuturisticCard>
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Broadcasts Tab */}
          <TabsContent value="broadcasts" className="space-y-4">
            <FuturisticSection title="Top Performing Broadcasts">
              <div className="space-y-3">
                {topBroadcasts.map((broadcast) => (
                  <FuturisticCard key={broadcast.id} glow="cyan">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{broadcast.title}</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {broadcast.listeners.toLocaleString()} listeners • {broadcast.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-cyan-400">{broadcast.engagement}%</p>
                        <p className="text-xs text-slate-500">Engagement</p>
                      </div>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Geographic Tab */}
          <TabsContent value="geographic" className="space-y-4">
            <FuturisticSection title="Geographic Distribution">
              <div className="space-y-3">
                {geographicData.map((region, idx) => (
                  <FuturisticCard key={idx} glow={idx % 2 === 0 ? "cyan" : "magenta"}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-white">{region.region}</p>
                        <p className="text-lg font-bold text-cyan-400">
                          {region.listeners.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-magenta-500 h-2 rounded-full"
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">{region.percentage}% of total</p>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <FuturisticSection title="Listening Patterns by Time">
              <div className="space-y-2">
                {listeningPatterns.map((pattern, idx) => (
                  <FuturisticCard key={idx} glow="magenta">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-white w-12">{pattern.time}</p>
                        <div className="flex-1 bg-slate-700 rounded h-8 flex items-center px-2">
                          <div
                            className="bg-gradient-to-r from-magenta-500 to-cyan-500 h-6 rounded"
                            style={{
                              width: `${(pattern.listeners / 2847) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-magenta-400">{pattern.listeners}</p>
                        {pattern.trend === "up" ? (
                          <TrendingUp size={16} className="text-green-400 ml-auto" />
                        ) : (
                          <TrendingUp size={16} className="text-red-400 ml-auto rotate-180" />
                        )}
                      </div>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <FuturisticSection title="Growth Trends">
              <p className="text-slate-400">Advanced trend analysis and forecasting coming soon...</p>
            </FuturisticSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
