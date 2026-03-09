/**
 * RRB (Rockin' Rockin' Boogie) Main Dashboard
 * 
 * Central hub for all RRB ecosystem operations:
 * - Broadcast management and scheduling
 * - Listener analytics and engagement
 * - Donation tracking and impact
 * - Content management
 * - Real-time streaming status
 */

import { useState } from "react";
import { trpc } from '@/lib/trpc';
import {
  FuturisticHeader,
  FuturisticGrid,
  FuturisticCard,
  FuturisticMetric,
  FuturisticButton,
  FuturisticSection,
  FuturisticDivider,
  FuturisticBadge,
} from "@/components/FuturisticDesignSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio,
  Users,
  Heart,
  TrendingUp,
  Play,
  Clock,
  Globe,
  BarChart3,
  Settings,
  Share2,
} from "lucide-react";

export default function RRBDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Real data from DB via tRPC
  const { data: platformStats } = trpc.ecosystemIntegration.getPlatformStats.useQuery(undefined, { refetchInterval: 30000 });

  const stats = {
    activeListeners: platformStats?.activeListeners ?? 0,
    totalDonations: 0,
    broadcastsScheduled: 0,
    averageEngagement: 0,
    totalReach: platformStats?.totalListenersAllTime ?? 0,
    impactScore: 0,
  };

  const recentBroadcasts = [
    {
      id: 1,
      title: "Morning Motivation Mix",
      status: "live",
      listeners: 342,
      duration: "2h 15m",
    },
    {
      id: 2,
      title: "Healing Frequencies Session",
      status: "scheduled",
      startTime: "14:00 EST",
      duration: "1h",
    },
    {
      id: 3,
      title: "Community Spotlight",
      status: "completed",
      listeners: 1205,
      duration: "1h 30m",
    },
  ];

  const topDonors = [
    { name: "Sarah Johnson", amount: 500, date: "Today" },
    { name: "Michael Chen", amount: 250, date: "Yesterday" },
    { name: "Emma Williams", amount: 1000, date: "2 days ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 pt-24 md:pt-28 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6 px-2 md:px-0">
        {/* Header */}
        <FuturisticHeader
          title="Rockin' Rockin' Boogie"
          subtitle="24/7 Autonomous Broadcasting • Community Powered • Impact Driven"
          icon={<Radio className="w-8 h-8" />}
        />

        {/* Key Metrics */}
        <FuturisticGrid columns={3}>
          <FuturisticCard glow="cyan">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Active Listeners</p>
              <div className="text-3xl font-bold text-cyan-400">
                {stats.activeListeners.toLocaleString()}
              </div>
              <FuturisticBadge variant="success">+12% this week</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="magenta">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Total Donations</p>
              <div className="text-3xl font-bold text-magenta-400">
                ${stats.totalDonations.toLocaleString()}
              </div>
              <FuturisticBadge variant="warning">+$2,450 this month</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="cyan">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Impact Score</p>
              <div className="text-3xl font-bold text-emerald-400">
                {stats.impactScore}%
              </div>
              <FuturisticBadge variant="success">Excellent</FuturisticBadge>
            </div>
          </FuturisticCard>
        </FuturisticGrid>

        <FuturisticDivider animated />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 bg-slate-800/50 border border-slate-700 rounded-lg p-2">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              <BarChart3 size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="broadcasts" className="text-xs md:text-sm">
              <Radio size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Broadcasts</span>
            </TabsTrigger>
            <TabsTrigger value="listeners" className="text-xs md:text-sm">
              <Users size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Listeners</span>
            </TabsTrigger>
            <TabsTrigger value="donations" className="text-xs md:text-sm">
              <Heart size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Donations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">
              <TrendingUp size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm">
              <Settings size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <FuturisticSection title="Live Broadcasts">
              <div className="space-y-3">
                {recentBroadcasts.map((broadcast) => (
                  <FuturisticCard key={broadcast.id} glow="cyan">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-white">{broadcast.title}</p>
                          {broadcast.status === "live" && (
                            <FuturisticBadge variant="error" glow>
                              LIVE
                            </FuturisticBadge>
                          )}
                          {broadcast.status === "scheduled" && (
                            <FuturisticBadge variant="warning">
                              SCHEDULED
                            </FuturisticBadge>
                          )}
                          {broadcast.status === "completed" && (
                            <FuturisticBadge variant="success">
                              COMPLETED
                            </FuturisticBadge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          {broadcast.status === "live"
                            ? `${broadcast.listeners} listeners • ${broadcast.duration}`
                            : broadcast.status === "scheduled"
                            ? `Starts at ${broadcast.startTime}`
                            : `${broadcast.listeners} listeners • ${broadcast.duration}`}
                        </p>
                      </div>
                      <FuturisticButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => alert(broadcast.status === 'live' ? 'Opening broadcast...' : 'Reminder set!')}
                      >
                        {broadcast.status === "live" ? (
                          <>
                            <Play size={14} className="mr-1" />
                            Watch
                          </>
                        ) : (
                          <>
                            <Clock size={14} className="mr-1" />
                            Remind
                          </>
                        )}
                      </FuturisticButton>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>

            <FuturisticSection title="Quick Actions">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FuturisticButton 
                  variant="primary" 
                  glow 
                  className="w-full"
                  onClick={() => alert('Go Live feature coming soon!')}
                >
                  <Radio size={16} className="mr-2" />
                  Go Live
                </FuturisticButton>
                <FuturisticButton 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => alert('Schedule feature coming soon!')}
                >
                  <Clock size={16} className="mr-2" />
                  Schedule
                </FuturisticButton>
                <FuturisticButton 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => alert('Content management coming soon!')}
                >
                  <Globe size={16} className="mr-2" />
                  Content
                </FuturisticButton>
                <FuturisticButton 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => alert('Share feature coming soon!')}
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </FuturisticButton>
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Broadcasts Tab */}
          <TabsContent value="broadcasts" className="space-y-4">
            <FuturisticSection title="Broadcast Management">
              <p className="text-slate-400">Broadcast scheduling and management coming soon...</p>
            </FuturisticSection>
          </TabsContent>

          {/* Listeners Tab */}
          <TabsContent value="listeners" className="space-y-4">
            <FuturisticSection title="Listener Analytics">
              <p className="text-slate-400">Listener tracking and engagement analytics coming soon...</p>
            </FuturisticSection>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <FuturisticSection title="Top Donors">
              <div className="space-y-3">
                {topDonors.map((donor, idx) => (
                  <FuturisticCard key={idx} glow="magenta">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{donor.name}</p>
                        <p className="text-sm text-slate-400">{donor.date}</p>
                      </div>
                      <div className="text-2xl font-bold text-magenta-400">
                        ${donor.amount}
                      </div>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <FuturisticSection title="Performance Metrics">
              <p className="text-slate-400">Advanced analytics dashboard coming soon...</p>
            </FuturisticSection>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <FuturisticSection title="RRB Settings">
              <p className="text-slate-400">Configuration and settings coming soon...</p>
            </FuturisticSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
