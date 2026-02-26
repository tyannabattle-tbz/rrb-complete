/**
 * Sweet Miracles Donation Manager
 * 
 * Comprehensive donation tracking system for RRB nonprofit:
 * - Real-time donation monitoring
 * - Donor relationship management
 * - Impact tracking and reporting
 * - Fundraising campaigns
 * - Tax documentation
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  TrendingUp,
  Users,
  Gift,
  Award,
  BarChart3,
  Settings,
  Download,
  Share2,
} from "lucide-react";

export default function SweetMiraclesManager() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - will be replaced with tRPC queries
  const stats = {
    totalRaised: 125420,
    activedonors: 847,
    averageDonation: 148,
    impactScore: 94,
    livesImpacted: 3420,
    projectsCompleted: 12,
  };

  const recentDonations = [
    {
      id: 1,
      donor: "Sarah Johnson",
      amount: 500,
      date: "Today",
      impact: "Provided meals for 50 families",
      recurring: true,
    },
    {
      id: 2,
      donor: "Michael Chen",
      amount: 250,
      date: "Yesterday",
      impact: "Funded 1 hour of broadcasting",
      recurring: false,
    },
    {
      id: 3,
      donor: "Emma Williams",
      amount: 1000,
      date: "2 days ago",
      impact: "Supported monthly operations",
      recurring: true,
    },
    {
      id: 4,
      donor: "James Rodriguez",
      amount: 150,
      date: "3 days ago",
      impact: "Provided emergency assistance",
      recurring: false,
    },
  ];

  const campaigns = [
    {
      id: 1,
      name: "Holiday Hope Campaign",
      goal: 50000,
      raised: 42350,
      progress: 85,
      endDate: "Dec 31, 2026",
    },
    {
      id: 2,
      name: "Emergency Relief Fund",
      goal: 25000,
      raised: 18900,
      progress: 76,
      endDate: "Mar 31, 2026",
    },
    {
      id: 3,
      name: "Community Center Expansion",
      goal: 100000,
      raised: 64200,
      progress: 64,
      endDate: "Jun 30, 2026",
    },
  ];

  const topDonors = [
    { rank: 1, name: "Sarah Johnson", total: 5000, donations: 12, status: "VIP" },
    { rank: 2, name: "Michael Chen", total: 3500, donations: 8, status: "Major" },
    { rank: 3, name: "Emma Williams", total: 3200, donations: 6, status: "Major" },
    { rank: 4, name: "James Rodriguez", total: 2100, donations: 14, status: "Regular" },
    { rank: 5, name: "Lisa Anderson", total: 1800, donations: 9, status: "Regular" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FuturisticHeader
          title="Sweet Miracles"
          subtitle="501(c)(3) Nonprofit • Donation Tracking • Community Impact"
          icon={<Heart className="w-8 h-8" />}
        />

        {/* Key Metrics */}
        <FuturisticGrid columns={3}>
          <FuturisticCard glow="magenta">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Total Raised</p>
              <div className="text-3xl font-bold text-magenta-400">
                ${stats.totalRaised.toLocaleString()}
              </div>
              <FuturisticBadge variant="success">+$12,450 this month</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="cyan">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Active Donors</p>
              <div className="text-3xl font-bold text-cyan-400">
                {stats.activedonors.toLocaleString()}
              </div>
              <FuturisticBadge variant="success">+45 this month</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="magenta">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Lives Impacted</p>
              <div className="text-3xl font-bold text-emerald-400">
                {stats.livesImpacted.toLocaleString()}
              </div>
              <FuturisticBadge variant="success">Growing daily</FuturisticBadge>
            </div>
          </FuturisticCard>
        </FuturisticGrid>

        <FuturisticDivider animated />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 md:grid-cols-6 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              <BarChart3 size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="donations" className="text-xs md:text-sm">
              <Heart size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Donations</span>
            </TabsTrigger>
            <TabsTrigger value="donors" className="text-xs md:text-sm">
              <Users size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Donors</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs md:text-sm">
              <Gift size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs md:text-sm">
              <Award size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Impact</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm">
              <Download size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <FuturisticSection title="Recent Donations">
              <div className="space-y-3">
                {recentDonations.map((donation) => (
                  <FuturisticCard key={donation.id} glow="magenta">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-white">{donation.donor}</p>
                          {donation.recurring && (
                            <FuturisticBadge variant="success">Recurring</FuturisticBadge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{donation.impact}</p>
                        <p className="text-xs text-slate-500">{donation.date}</p>
                      </div>
                      <div className="text-2xl font-bold text-magenta-400">
                        ${donation.amount}
                      </div>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>

            <FuturisticSection title="Active Campaigns">
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <FuturisticCard key={campaign.id} glow="cyan">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{campaign.name}</p>
                          <p className="text-sm text-slate-400">Ends {campaign.endDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-cyan-400">
                            ${campaign.raised.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            of ${campaign.goal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-magenta-500 h-2 rounded-full"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">{campaign.progress}% funded</p>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <FuturisticSection title="Donation Management">
              <p className="text-slate-400">Detailed donation tracking and management coming soon...</p>
            </FuturisticSection>
          </TabsContent>

          {/* Donors Tab */}
          <TabsContent value="donors" className="space-y-4">
            <FuturisticSection title="Top Donors">
              <div className="space-y-2">
                {topDonors.map((donor) => (
                  <FuturisticCard key={donor.rank} glow={donor.rank <= 2 ? "magenta" : "cyan"}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-slate-500">#{donor.rank}</div>
                        <div>
                          <p className="font-semibold text-white">{donor.name}</p>
                          <p className="text-sm text-slate-400">{donor.donations} donations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-magenta-400">${donor.total.toLocaleString()}</p>
                        <FuturisticBadge variant={donor.status === "VIP" ? "error" : "success"}>
                          {donor.status}
                        </FuturisticBadge>
                      </div>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <FuturisticSection title="Campaign Management">
              <p className="text-slate-400">Create and manage fundraising campaigns coming soon...</p>
            </FuturisticSection>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-4">
            <FuturisticSection title="Community Impact">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FuturisticCard glow="cyan">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Families Fed</p>
                    <p className="text-2xl font-bold text-cyan-400">3,420</p>
                  </div>
                </FuturisticCard>
                <FuturisticCard glow="magenta">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Hours Broadcast</p>
                    <p className="text-2xl font-bold text-magenta-400">2,847</p>
                  </div>
                </FuturisticCard>
                <FuturisticCard glow="cyan">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Projects Completed</p>
                    <p className="text-2xl font-bold text-emerald-400">12</p>
                  </div>
                </FuturisticCard>
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <FuturisticSection title="Reports & Documentation">
              <div className="space-y-3">
                <FuturisticButton variant="secondary" className="w-full">
                  <Download size={16} className="mr-2" />
                  Download Annual Report
                </FuturisticButton>
                <FuturisticButton variant="secondary" className="w-full">
                  <Download size={16} className="mr-2" />
                  Export Donor List
                </FuturisticButton>
                <FuturisticButton variant="secondary" className="w-full">
                  <Download size={16} className="mr-2" />
                  Tax Documentation
                </FuturisticButton>
              </div>
            </FuturisticSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
