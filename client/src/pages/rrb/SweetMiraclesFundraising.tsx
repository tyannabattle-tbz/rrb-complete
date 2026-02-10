"use client";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Heart, DollarSign, Users, TrendingUp, Target, Gift,
  Star, Trophy, Clock, CheckCircle, ArrowRight, Sparkles,
  Search, Plus, BarChart3, Award, Globe, Shield,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  'Core Mission': 'from-purple-600 to-pink-600',
  'Emergency Preparedness': 'from-red-600 to-orange-600',
  'Preservation': 'from-amber-600 to-yellow-600',
  'Wellness': 'from-green-600 to-emerald-600',
  'Education': 'from-blue-600 to-cyan-600',
};

const CATEGORY_ICONS: Record<string, any> = {
  'Core Mission': Heart,
  'Emergency Preparedness': Shield,
  'Preservation': Star,
  'Wellness': Sparkles,
  'Education': Globe,
};

export default function SweetMiraclesFundraising() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const overviewQuery = trpc.sweetMiracles.campaigns.getOverview.useQuery();
  const campaignsQuery = trpc.sweetMiracles.campaigns.list.useQuery({
    status: 'all',
  });
  const leaderboardQuery = trpc.sweetMiracles.campaigns.getLeaderboard.useQuery();
  const grantStatsQuery = trpc.sweetMiracles.grants.getStats.useQuery(undefined, { enabled: !!user });
  const grantsQuery = trpc.sweetMiracles.grants.getHighMatches.useQuery(undefined, { enabled: !!user });

  const simulateDonation = trpc.sweetMiracles.campaigns.simulateDonation.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Donation recorded! Campaign is now at ${data.progress}%`);
        campaignsQuery.refetch();
        overviewQuery.refetch();
        leaderboardQuery.refetch();
      }
    },
  });

  const overview = overviewQuery.data;
  const allCampaigns = campaignsQuery.data || [];
  const leaderboard = leaderboardQuery.data || [];

  const filteredCampaigns = allCampaigns.filter(c => {
    const matchesSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-pink-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Sweet Miracles
            </h1>
          </div>
          <p className="text-gray-400 text-lg">"A Voice for the Voiceless"</p>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            Supporting generational wealth through Canryn Production — preserving the legacy, empowering communities, and building a future where everyone has access to tools, media, and communication.
          </p>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 p-4 text-center">
              <DollarSign className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{formatCurrency(overview.totalRaised)}</p>
              <p className="text-xs text-gray-400">Total Raised</p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 p-4 text-center">
              <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{overview.totalDonors}</p>
              <p className="text-xs text-gray-400">Total Donors</p>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-4 text-center">
              <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{overview.activeCampaigns}</p>
              <p className="text-xs text-gray-400">Active Campaigns</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4 text-center">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{overview.completedCampaigns}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 p-4 text-center">
              <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{overview.overallProgress}%</p>
              <p className="text-xs text-gray-400">Overall Progress</p>
            </Card>
          </div>
        )}

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="w-full bg-gray-900/50 border border-gray-800 flex-wrap h-auto p-1">
            <TabsTrigger value="campaigns" className="flex-1 text-xs md:text-sm">
              <Target className="w-3 h-3 mr-1" /> Campaigns
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1 text-xs md:text-sm">
              <Trophy className="w-3 h-3 mr-1" /> Leaderboard
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 text-xs md:text-sm">
              <BarChart3 className="w-3 h-3 mr-1" /> Activity
            </TabsTrigger>
            <TabsTrigger value="grants" className="flex-1 text-xs md:text-sm">
              <Search className="w-3 h-3 mr-1" /> Grants
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-10 bg-gray-900 border-gray-800 text-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs"
                >
                  All
                </Button>
                {overview?.categories.map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className="text-xs"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Campaign Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampaigns.map(campaign => {
                const CatIcon = CATEGORY_ICONS[campaign.category] || Heart;
                const gradient = CATEGORY_COLORS[campaign.category] || 'from-gray-600 to-gray-700';
                return (
                  <Card key={campaign.id} className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                    {/* Campaign Header */}
                    <div className={`bg-gradient-to-r ${gradient} p-4`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CatIcon className="w-5 h-5 text-white/80" />
                          <span className="text-xs text-white/70 uppercase tracking-wider">{campaign.category}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          campaign.status === 'active' ? 'bg-green-500/30 text-green-200' :
                          campaign.status === 'completed' ? 'bg-blue-500/30 text-blue-200' :
                          'bg-gray-500/30 text-gray-200'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2">{campaign.title}</h3>
                    </div>

                    <div className="p-4 space-y-4">
                      <p className="text-sm text-gray-400 line-clamp-2">{campaign.description}</p>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white font-semibold">{formatCurrency(campaign.raisedAmount)}</span>
                          <span className="text-gray-500">of {formatCurrency(campaign.goalAmount)}</span>
                        </div>
                        <Progress value={campaign.progressPercent} className="h-2" />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{campaign.progressPercent}% funded</span>
                          <span className="text-xs text-gray-500">{campaign.donorCount} donors</span>
                        </div>
                      </div>

                      {/* Milestones */}
                      {campaign.milestones && campaign.milestones.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Milestones</p>
                          <div className="flex gap-1">
                            {campaign.milestones.map((m: any, i: number) => (
                              <div
                                key={i}
                                className={`flex-1 h-1.5 rounded-full ${m.reached ? 'bg-green-500' : 'bg-gray-700'}`}
                                title={`${m.label}: ${formatCurrency(m.amount)} ${m.reached ? '✓' : ''}`}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-600">
                            {campaign.milestones.filter((m: any) => m.reached).length}/{campaign.milestones.length} reached
                          </p>
                        </div>
                      )}

                      {/* Recent Donations */}
                      {campaign.recentDonations && campaign.recentDonations.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Recent</p>
                          {campaign.recentDonations.slice(0, 2).map((d: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{d.name}</span>
                              <span className="text-green-400 font-mono">{formatCurrency(d.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {campaign.status === 'active' && (
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                            onClick={() => {
                              window.open('/donate', '_blank');
                              toast.info('Redirecting to secure checkout...');
                            }}
                          >
                            <Gift className="w-3 h-3 mr-1" /> Donate
                          </Button>
                        )}
                        {campaign.daysRemaining !== null && campaign.daysRemaining > 0 && (
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" /> {campaign.daysRemaining} days left
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-4">
            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Donor Leaderboard</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">Top supporters of the Sweet Miracles mission</p>
              </div>
              <div className="divide-y divide-gray-800">
                {leaderboard.map((donor: any) => (
                  <div key={donor.rank} className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      donor.rank === 1 ? 'bg-amber-500/30 text-amber-300' :
                      donor.rank === 2 ? 'bg-gray-400/30 text-gray-300' :
                      donor.rank === 3 ? 'bg-orange-500/30 text-orange-300' :
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {donor.rank <= 3 ? <Award className="w-4 h-4" /> : donor.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{donor.name}</p>
                      <p className="text-xs text-gray-500">{donor.campaigns} campaign{donor.campaigns > 1 ? 's' : ''} supported</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{formatCurrency(donor.totalDonated)}</p>
                      <p className="text-[10px] text-gray-600">Last: {donor.lastDonation}</p>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No donors yet. Be the first!</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-4 space-y-4">
            <Card className="bg-gray-900 border-gray-800 p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Recent Activity Feed
              </h3>
              <div className="space-y-3">
                {overview?.recentActivity?.map((activity: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-semibold">{activity.name}</span>
                        {' donated '}
                        <span className="text-green-400 font-semibold">{formatCurrency(activity.amount)}</span>
                        {' to '}
                        <span className="text-purple-400">{activity.campaign}</span>
                      </p>
                      {activity.message && (
                        <p className="text-xs text-gray-500 italic mt-0.5">"{activity.message}"</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">{activity.date}</span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </Card>

            {/* Campaign Progress Overview */}
            <Card className="bg-gray-900 border-gray-800 p-4">
              <h3 className="text-lg font-bold text-white mb-4">Campaign Progress</h3>
              <div className="space-y-4">
                {allCampaigns.filter(c => c.status === 'active').map(c => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{c.title}</span>
                      <span className="text-gray-500">{c.progressPercent}%</span>
                    </div>
                    <Progress value={c.progressPercent} className="h-1.5" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Grants Tab */}
          <TabsContent value="grants" className="mt-4 space-y-4">
            {!user ? (
              <Card className="bg-gray-900 border-gray-800 p-8 text-center">
                <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Grant Discovery</h3>
                <p className="text-gray-400 mb-4">Sign in to access AI-powered grant matching and discovery tools.</p>
              </Card>
            ) : (
              <>
                {grantStatsQuery.data && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="bg-gray-900 border-gray-800 p-3 text-center">
                      <p className="text-xl font-bold text-white">{grantStatsQuery.data.totalGrants}</p>
                      <p className="text-xs text-gray-500">Grants Found</p>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800 p-3 text-center">
                      <p className="text-xl font-bold text-green-400">{grantStatsQuery.data.highMatchCount}</p>
                      <p className="text-xs text-gray-500">High Match</p>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800 p-3 text-center">
                      <p className="text-xl font-bold text-amber-400">{grantStatsQuery.data.pendingApplications}</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800 p-3 text-center">
                      <p className="text-xl font-bold text-cyan-400">{formatCurrency(grantStatsQuery.data.totalFundingAvailable || 0)}</p>
                      <p className="text-xs text-gray-500">Available</p>
                    </Card>
                  </div>
                )}
                <Card className="bg-gray-900 border-gray-800 p-4">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    High-Match Grants
                  </h3>
                  <div className="space-y-3">
                    {(grantsQuery.data || []).map((grant: any) => (
                      <div key={grant.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{grant.title}</h4>
                            <p className="text-xs text-gray-500">{grant.organization}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            grant.matchScore >= 90 ? 'bg-green-500/30 text-green-300' :
                            grant.matchScore >= 80 ? 'bg-cyan-500/30 text-cyan-300' :
                            'bg-gray-500/30 text-gray-300'
                          }`}>
                            {grant.matchScore}% match
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatCurrency(grant.amount || 0)}</span>
                          {grant.deadline && <span>Deadline: {grant.deadline}</span>}
                          <span>{grant.category}</span>
                        </div>
                      </div>
                    ))}
                    {(grantsQuery.data || []).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No high-match grants found</p>
                    )}
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
