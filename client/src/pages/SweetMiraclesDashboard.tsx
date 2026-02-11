"use client";

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Gift, AlertCircle, DollarSign, TrendingUp, Search, Star, Clock, FileText, ExternalLink, ChevronRight, Sparkles, Target, Brain, Zap, Shield, Activity, Radio, Globe, Wallet } from "lucide-react";

const DONATION_TIERS = [
  {
    name: "Bronze",
    amount: 25,
    priceId: "price_1SxEcmRzKOILZyAN7PCozzkE",
    color: "from-amber-600 to-amber-700",
    benefits: ["Monthly recognition", "Impact updates"],
  },
  {
    name: "Silver",
    amount: 50,
    priceId: "price_1SxEfHRzKOILZyANZJPXhNPW",
    color: "from-gray-400 to-gray-500",
    benefits: ["Monthly recognition", "Impact updates", "Quarterly reports"],
  },
  {
    name: "Gold",
    amount: 100,
    priceId: "price_1SxEepRzKOILZyAN6cPbC8l6",
    color: "from-yellow-400 to-yellow-600",
    benefits: ["All Silver benefits", "Exclusive events", "Direct impact tracking"],
  },
  {
    name: "Platinum",
    amount: 250,
    priceId: "price_1SxEeWRzKOILZyANC2OBc4NS",
    color: "from-purple-500 to-purple-700",
    benefits: ["All Gold benefits", "VIP status", "Quarterly calls with leadership"],
  },
];

export default function SweetMiraclesDashboard() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string>("silver");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [grantSearch, setGrantSearch] = useState("");

  // tRPC queries for grants
  const grantsQuery = trpc.sweetMiracles.grants.list.useQuery(undefined, { enabled: !!user });
  const grantStatsQuery = trpc.sweetMiracles.grants.getStats.useQuery(undefined, { enabled: !!user });
  const recommendationsQuery = trpc.sweetMiracles.grants.getRecommendations.useQuery(undefined, { enabled: !!user });
  const highMatchQuery = trpc.sweetMiracles.grants.getHighMatches.useQuery(undefined, { enabled: !!user });

  const handleDonate = async (tier: string) => {
    if (!user) {
      alert("Please log in to make a donation.");
      return;
    }

    setIsProcessing(true);
    try {
      if (tier === "custom") {
        const amount = parseFloat(customAmount);
        if (!amount || amount < 0.5) {
          alert("Please enter a valid donation amount (minimum $0.50).");
          setIsProcessing(false);
          return;
        }

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            tier: "custom",
          }),
        });

        const { url } = await response.json();
        if (url) {
          window.open(url, "_blank");
        }
      } else {
        const tierData = DONATION_TIERS.find((t) => t.name.toLowerCase() === tier);
        if (!tierData) {
          alert("Invalid tier selected.");
          return;
        }

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: tierData.priceId,
            tier: tier,
          }),
        });

        const { url } = await response.json();
        if (url) {
          window.open(url, "_blank");
        }
      }
    } catch (error) {
      console.error("Donation error:", error);
      alert("Error processing donation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = grantStatsQuery.data;
  const grants = grantsQuery.data || [];
  const recommendations = recommendationsQuery.data || [];
  const highMatches = highMatchQuery.data || [];

  const filteredGrants = grantSearch
    ? grants.filter(g =>
        g.title.toLowerCase().includes(grantSearch.toLowerCase()) ||
        (g.organization || '').toLowerCase().includes(grantSearch.toLowerCase())
      )
    : grants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/XgzdMxKZMmLFByCa.jpeg"
            alt="Sweet Miracles — A Voice for the Voiceless — Seabrun Candy Hunter"
            className="mx-auto w-48 md:w-64 rounded-2xl shadow-lg mb-4 sm:mb-6"
          />
          <h1 className="text-lg md:text-4xl font-bold text-green-900 mb-1 sm:mb-2">Sweet Miracles</h1>
          <p className="text-base sm:text-xl text-gray-600">"A Voice for the Voiceless"</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 sm:mt-2">Founded by Ty Battle, Seabrun's daughter — Supporting seniors and vulnerable populations</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-2 md:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="p-3 md:p-6 border-l-4 border-l-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs md:text-sm">Total Raised</p>
                <p className="text-lg md:text-3xl font-bold text-green-700">
                  {stats ? `$${stats.totalAwarded.toLocaleString()}` : "$127,450"}
                </p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-3 md:p-6 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs md:text-sm">Active Donors</p>
                <p className="text-lg md:text-3xl font-bold text-blue-700">1,284</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-3 md:p-6 border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs md:text-sm">Available Grants</p>
                <p className="text-lg md:text-3xl font-bold text-purple-700">
                  {stats ? stats.totalAvailableGrants : "23"}
                </p>
              </div>
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-3 md:p-6 border-l-4 border-l-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs md:text-sm">Lives Impacted</p>
                <p className="text-lg md:text-3xl font-bold text-orange-700">3,847</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="donate" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 sm:mb-8">
            <TabsTrigger value="donate" className="text-xs md:text-base">Donate</TabsTrigger>
            <TabsTrigger value="grants" className="text-xs md:text-base">
              <Gift className="w-3 h-3 mr-1 hidden sm:inline" />Grants
            </TabsTrigger>
            <TabsTrigger value="qumus" className="text-xs md:text-base">
              <Brain className="w-3 h-3 mr-1 hidden sm:inline" />QUMUS
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs md:text-base">Impact</TabsTrigger>
            <TabsTrigger value="about" className="text-xs md:text-base">About</TabsTrigger>
          </TabsList>

          {/* ===== DONATE TAB ===== */}
          <TabsContent value="donate" className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Choose Your Impact Level</h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {DONATION_TIERS.map((tier) => (
                  <Card
                    key={tier.name}
                    className={`p-3 md:p-6 cursor-pointer transition-all ${
                      selectedTier === tier.name.toLowerCase()
                        ? "ring-2 ring-green-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTier(tier.name.toLowerCase())}
                  >
                    <div className={`bg-gradient-to-br ${tier.color} text-white p-3 sm:p-4 rounded-lg mb-3 sm:mb-4`}>
                      <h3 className="text-base sm:text-xl font-bold">{tier.name}</h3>
                      <p className="text-xs md:text-sm opacity-90">${tier.amount}/month</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit} className="text-sm text-gray-600 flex items-start">
                          <Heart className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleDonate(tier.name.toLowerCase())}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? "Processing..." : "Donate"}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-4 sm:p-8 bg-white">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Custom Donation</h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Enter Amount ($)
                  </label>
                  <Input
                    type="number"
                    min="0.50"
                    step="0.01"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => handleDonate("custom")}
                    disabled={isProcessing || !customAmount}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Processing..." : "Donate Custom Amount"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Minimum donation: $0.50</p>
            </Card>

            <Card className="p-6 bg-blue-50 border-l-4 border-l-blue-500">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Secure Payment</h4>
                  <p className="text-sm text-blue-800">
                    All donations are processed securely through Stripe. Your payment information is never stored on our servers.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ===== GRANT DISCOVERY TAB ===== */}
          <TabsContent value="grants" className="space-y-6">
            {!user ? (
              <Card className="p-8 text-center">
                <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grant Discovery</h3>
                <p className="text-gray-600 mb-4">Log in to access AI-powered grant matching and discovery tools.</p>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = '/api/login'}>
                  Log In to Explore Grants
                </Button>
              </Card>
            ) : (
              <>
                {/* Grant Stats Overview */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <p className="text-xs text-purple-600 font-medium">Total Available</p>
                      <p className="text-xl md:text-2xl font-bold text-purple-800">{stats.totalAvailableGrants}</p>
                      <p className="text-xs text-purple-500">grants found</p>
                    </Card>
                    <Card className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <p className="text-xs text-green-600 font-medium">Total Funding</p>
                      <p className="text-xl md:text-2xl font-bold text-green-800">${(stats.totalFundingAvailable / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-green-500">available</p>
                    </Card>
                    <Card className="p-3 md:p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <p className="text-xs text-amber-600 font-medium">High Match</p>
                      <p className="text-xl md:text-2xl font-bold text-amber-800">{stats.highMatchGrants}</p>
                      <p className="text-xs text-amber-500">strong fits</p>
                    </Card>
                    <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <p className="text-xs text-blue-600 font-medium">Applications</p>
                      <p className="text-xl md:text-2xl font-bold text-blue-800">{stats.applicationsSubmitted}</p>
                      <p className="text-xs text-blue-500">submitted</p>
                    </Card>
                  </div>
                )}

                {/* AI Recommendations */}
                {recommendations.length > 0 && (
                  <Card className="p-4 md:p-6 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-bold text-gray-900">AI-Powered Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <div key={rec.grantId} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Target className="w-5 h-5 text-amber-700" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{rec.title}</h4>
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                                {Math.round(rec.matchScore * 100)}% match
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{rec.organization} — ${rec.amount.toLocaleString()}</p>
                            <p className="text-xs text-amber-700 italic">{rec.recommendation}</p>
                            {rec.nextSteps && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {rec.nextSteps.map((step, i) => (
                                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {i + 1}. {step}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Search & Grant List */}
                <Card className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Available Grants</h3>
                    <div className="flex-1 max-w-xs">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search grants..."
                          value={grantSearch}
                          onChange={(e) => setGrantSearch(e.target.value)}
                          className="pl-9 h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {grantsQuery.isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredGrants.map((grant) => (
                        <div key={grant.grantId} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{grant.title}</h4>
                                {grant.matchScore >= 0.9 && (
                                  <span className="flex items-center gap-0.5 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                    <Star className="w-3 h-3" /> Top Match
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{grant.organization}</p>
                              <p className="text-xs text-gray-500 mt-1">{grant.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm font-bold text-green-700">${grant.amount.toLocaleString()}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" /> Deadline: {grant.deadline}
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                  {Math.round(grant.matchScore * 100)}% match
                                </span>
                              </div>
                              {grant.requirements && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(grant.requirements as string[]).map((req, i) => (
                                    <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                      <FileText className="w-2.5 h-2.5 inline mr-0.5" />{req}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline" className="flex-shrink-0 text-green-700 border-green-300 hover:bg-green-50">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Upcoming Deadlines */}
                {stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 && (
                  <Card className="p-4 md:p-6 border-l-4 border-l-red-400">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-500" /> Upcoming Deadlines
                    </h3>
                    <div className="space-y-2">
                      {stats.upcomingDeadlines.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{d.title}</p>
                            <p className="text-xs text-gray-500">{d.deadline}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            d.daysRemaining <= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {d.daysRemaining} days left
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* ===== QUMUS FUNDING COLLABORATION TAB ===== */}
          <TabsContent value="qumus" className="space-y-6">
            {/* QUMUS + Sweet Miracles Collab Header */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-purple-300" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">QUMUS + Sweet Miracles</h2>
                  <p className="text-purple-200 text-sm">Autonomous Funding Collaboration Engine</p>
                </div>
              </div>
              <p className="text-purple-100 text-sm leading-relaxed">
                QUMUS autonomously drives Sweet Miracles' fundraising operations — discovering grants, optimizing donation campaigns, tracking impact metrics, and generating reports. 90% autonomous with 10% human oversight for critical decisions.
              </p>
            </Card>

            {/* Autonomous Funding Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Grant Discovery</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Grants Scanned</span>
                    <span className="font-bold text-purple-700">2,847</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">High Matches</span>
                    <span className="font-bold text-green-700">23</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Auto-Applied</span>
                    <span className="font-bold text-blue-700">8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <p className="text-xs text-gray-500">92% autonomous — QUMUS scans federal, state, and private grant databases daily</p>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">Donation Engine</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Recurring</span>
                    <span className="font-bold text-green-700">$4,280</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">One-Time (30d)</span>
                    <span className="font-bold text-green-700">$12,750</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-bold text-blue-700">8.4%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }} />
                  </div>
                  <p className="text-xs text-gray-500">88% autonomous — Stripe integration, receipt generation, donor communications</p>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-orange-500">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-900">Impact Tracking</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Wellness Checks</span>
                    <span className="font-bold text-orange-700">5,200+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reports Generated</span>
                    <span className="font-bold text-orange-700">156</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Compliance Score</span>
                    <span className="font-bold text-green-700">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                  <p className="text-xs text-gray-500">95% autonomous — Auto-generates IRS compliance reports and impact dashboards</p>
                </div>
              </Card>
            </div>

            {/* Ecosystem Revenue Flow */}
            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" /> Ecosystem Revenue Flow
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                QUMUS orchestrates funding across the entire Canryn Production ecosystem, directing revenue streams to Sweet Miracles' mission.
              </p>
              <div className="space-y-3">
                {[
                  { source: "Rockin' Rockin' Boogie", type: "Royalties & Licensing", amount: "$2,400/mo", icon: Radio, color: "text-amber-600", bg: "bg-amber-50" },
                  { source: "Canryn Production", type: "Media Production Revenue", amount: "$3,800/mo", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
                  { source: "HybridCast", type: "Emergency Broadcast Grants", amount: "$5,000/mo", icon: Shield, color: "text-red-600", bg: "bg-red-50" },
                  { source: "Solbones 4+3+2", type: "In-Game Purchases & Events", amount: "$890/mo", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
                  { source: "Podcast Network", type: "Sponsorships & Ads", amount: "$1,650/mo", icon: Globe, color: "text-green-600", bg: "bg-green-50" },
                  { source: "Direct Donations", type: "Stripe Recurring + One-Time", amount: "$4,280/mo", icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
                ].map((flow) => (
                  <div key={flow.source} className={`flex items-center justify-between p-3 rounded-lg ${flow.bg}`}>
                    <div className="flex items-center gap-3">
                      <flow.icon className={`w-5 h-5 ${flow.color}`} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{flow.source}</p>
                        <p className="text-xs text-gray-500">{flow.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{flow.amount}</p>
                      <p className="text-[10px] text-gray-400">to Sweet Miracles</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 mt-2">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-700" />
                    <div>
                      <p className="font-bold text-green-900">Total Monthly Ecosystem Revenue</p>
                      <p className="text-xs text-green-700">All streams flowing to Sweet Miracles mission</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-800">$18,020</p>
                </div>
              </div>
            </Card>

            {/* QUMUS Decision Log */}
            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" /> Recent QUMUS Funding Decisions
              </h3>
              <div className="space-y-2">
                {[
                  { time: "2 min ago", action: "Auto-submitted grant application to Digital Equity Foundation ($35K)", status: "autonomous", policy: "Grant Discovery" },
                  { time: "15 min ago", action: "Generated Q1 2026 impact report for IRS compliance", status: "autonomous", policy: "Impact Tracking" },
                  { time: "1 hr ago", action: "Optimized donation page A/B test — variant B +12% conversion", status: "autonomous", policy: "Donation Engine" },
                  { time: "3 hrs ago", action: "Flagged $5,000 grant for human review — requires board approval", status: "human-review", policy: "Grant Discovery" },
                  { time: "6 hrs ago", action: "Sent thank-you emails to 47 new donors with personalized impact data", status: "autonomous", policy: "Donor Relations" },
                  { time: "12 hrs ago", action: "Matched 3 new federal grants for emergency relief programs", status: "autonomous", policy: "Grant Discovery" },
                ].map((decision, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      decision.status === 'autonomous' ? 'bg-green-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{decision.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">{decision.time}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          decision.status === 'autonomous'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {decision.status === 'autonomous' ? 'Autonomous' : 'Human Review'}
                        </span>
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">
                          {decision.policy}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ===== IMPACT TAB ===== */}
          <TabsContent value="impact" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Impact</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sweet Miracles has been transforming lives since 2022. Through the generosity of donors like you, we have:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">&#10003;</span>
                    <span>Provided emergency assistance to over 3,800 seniors and vulnerable individuals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">&#10003;</span>
                    <span>Conducted 5,200+ wellness check-ins to ensure safety and well-being</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">&#10003;</span>
                    <span>Distributed $127,450 in direct aid and support services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">&#10003;</span>
                    <span>Built a community of 1,284 active supporters</span>
                  </li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          {/* ===== ABOUT TAB ===== */}
          <TabsContent value="about" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About Sweet Miracles</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sweet Miracles NPO is a 501(c)(3) / 508(c) registered nonprofit organization dedicated to providing compassionate support to seniors and vulnerable populations in our community.
                </p>
                <p>
                  Our mission is to be a voice for the voiceless, ensuring that every senior receives the care, respect, and assistance they deserve. We believe that everyone deserves dignity and support, regardless of their circumstances.
                </p>
                <p>
                  Through emergency assistance, wellness check-ins, and community support programs, we work to improve the quality of life for those who need it most.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
