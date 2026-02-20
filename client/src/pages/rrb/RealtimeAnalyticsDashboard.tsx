import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Music, Globe, BarChart3, Activity } from "lucide-react";

export default function RealtimeAnalyticsDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15000); // 15 seconds

  // Fetch real-time metrics
  const { data: liveMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = trpc.realtimeAnalytics.getLiveMetrics.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch geographic distribution
  const { data: geoData, isLoading: geoLoading } = trpc.realtimeAnalytics.getGeographicDistribution.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch demographics
  const { data: demographics, isLoading: demoLoading } = trpc.realtimeAnalytics.getDemographics.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch top tracks
  const { data: topTracks, isLoading: tracksLoading } = trpc.realtimeAnalytics.getTopTracks.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch commercial metrics
  const { data: commercialMetrics, isLoading: commercialLoading } = trpc.realtimeAnalytics.getCommercialMetrics.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch engagement trends
  const { data: engagement, isLoading: engagementLoading } = trpc.realtimeAnalytics.getEngagementTrends.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch platform comparison
  const { data: platformComparison, isLoading: comparisonLoading } = trpc.realtimeAnalytics.getPlatformComparison.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  if (metricsLoading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Real-Time Analytics</h1>
            <p className="text-slate-400">Live listener metrics from all platforms</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                autoRefresh ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300"
              }`}
            >
              {autoRefresh ? "● Live" : "Paused"}
            </button>
            <button
              onClick={() => refetchMetrics()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Listeners */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Listeners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {liveMetrics?.totalListeners.toLocaleString()}
              </div>
              <p className="text-xs text-green-400 mt-2">↑ +{liveMetrics?.trends.dailyGrowth}% today</p>
            </CardContent>
          </Card>

          {/* Active Now */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {liveMetrics?.activeListeners.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-2">Currently streaming</p>
            </CardContent>
          </Card>

          {/* Top Platform */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Top Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {liveMetrics?.platformBreakdown[1]?.platform === "YouTube" ? "YouTube" : "Spotify"}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {liveMetrics?.platformBreakdown[1]?.listeners.toLocaleString()} listeners
              </p>
            </CardContent>
          </Card>

          {/* Countries */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{geoData?.totalCountries}</div>
              <p className="text-xs text-slate-400 mt-2">Worldwide reach</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="platforms" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border border-slate-700">
            <TabsTrigger value="platforms" className="text-slate-300 data-[state=active]:text-white">
              Platforms
            </TabsTrigger>
            <TabsTrigger value="geography" className="text-slate-300 data-[state=active]:text-white">
              Geography
            </TabsTrigger>
            <TabsTrigger value="demographics" className="text-slate-300 data-[state=active]:text-white">
              Demographics
            </TabsTrigger>
            <TabsTrigger value="tracks" className="text-slate-300 data-[state=active]:text-white">
              Top Tracks
            </TabsTrigger>
            <TabsTrigger value="commercial" className="text-slate-300 data-[state=active]:text-white">
              Commercial
            </TabsTrigger>
          </TabsList>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {liveMetrics?.platformBreakdown.map((platform: any) => (
                <Card key={platform.platform} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{platform.platform}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {platform.listeners.toLocaleString()} listeners
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Active Now:</span>
                      <span className="text-white font-semibold">{platform.activeNow.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(platform.activeNow / platform.listeners) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-400">Growth:</span>
                      <Badge className="bg-green-600 text-white">↑ {platform.growthRate}%</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Top Countries</CardTitle>
                <CardDescription className="text-slate-400">
                  Listeners by country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geoData?.topCountries.map((country: any, idx: number) => (
                    <div key={`item-${idx}`} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{country.country}</p>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-white font-semibold">{country.listeners.toLocaleString()}</p>
                        <p className="text-slate-400 text-sm">{country.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Age Groups */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Age Groups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {demographics?.ageGroups && Object.entries(demographics.ageGroups).map(([age, data]: any) => (
                    <div key={age} className="flex justify-between items-center">
                      <span className="text-slate-400">{age}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-12 text-right">{data.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Interests */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Interests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {demographics?.interests.slice(0, 6).map((interest: any) => (
                    <div key={interest.interest} className="flex justify-between items-center">
                      <span className="text-slate-400">{interest.interest}</span>
                      <Badge className="bg-slate-700 text-slate-200">{interest.percentage}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Tracks Tab */}
          <TabsContent value="tracks" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Top 5 Tracks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topTracks?.topTracks.map((track: any) => (
                  <div key={track.rank} className="border-b border-slate-700 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-white font-semibold">#{track.rank} {track.title}</p>
                        <p className="text-slate-400 text-sm">{track.artist}</p>
                      </div>
                      <Badge className="bg-green-600 text-white">{track.trend}</Badge>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-slate-400">Plays</p>
                        <p className="text-white font-semibold">{track.plays.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Saves</p>
                        <p className="text-white font-semibold">{track.saves.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Shares</p>
                        <p className="text-white font-semibold">{track.shares.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commercial Tab */}
          <TabsContent value="commercial" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Total Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {(commercialMetrics?.totalImpressions / 1000000).toFixed(2)}M
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Click-Through Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-400">
                    {commercialMetrics?.clickThroughRate}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {(commercialMetrics?.totalClicks / 1000).toFixed(0)}K
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Top Commercials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commercialMetrics?.topCommercials.map((commercial: any) => (
                  <div key={commercial.id} className="border-b border-slate-700 pb-4 last:border-0">
                    <p className="text-white font-semibold mb-2">{commercial.name}</p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Impressions</p>
                        <p className="text-white font-semibold">{(commercial.impressions / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Clicks</p>
                        <p className="text-white font-semibold">{commercial.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">CTR</p>
                        <p className="text-white font-semibold">{commercial.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Revenue</p>
                        <p className="text-green-400 font-semibold">${commercial.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Engagement Trends */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Daily Follows</p>
                <p className="text-2xl font-bold text-white">{engagement?.follows.daily}</p>
                <p className="text-xs text-green-400">{engagement?.follows.trend}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Daily Subscribes</p>
                <p className="text-2xl font-bold text-white">{engagement?.subscribes.daily}</p>
                <p className="text-xs text-green-400">{engagement?.subscribes.trend}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Daily Saves</p>
                <p className="text-2xl font-bold text-white">{engagement?.saves.daily}</p>
                <p className="text-xs text-green-400">{engagement?.saves.trend}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">30-Day Retention</p>
                <p className="text-2xl font-bold text-white">{engagement?.retention.dayThirty}%</p>
                <p className="text-xs text-green-400">{engagement?.retention.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
