import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { TrendingUp, Users, DollarSign, Radio, Download, Share2, BarChart3, PieChart } from 'lucide-react';

export default function PodcastDistributionAnalytics() {
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('month');
  const [viewMode, setViewMode] = useState<'overview' | 'platforms' | 'revenue' | 'audience'>('overview');

  // Fetch podcast distribution analytics
  const { data: analytics } = trpc.podcastStudio.getDistributionAnalytics?.useQuery?.();

  // Fetch platform metrics
  const { data: platformMetrics } = trpc.podcastStudio.getPlatformMetrics?.useQuery?.();

  // Fetch revenue data
  const { data: revenueData } = trpc.podcastStudio.getRevenueMetrics?.useQuery?.();

  // Fetch audience analytics
  const { data: audienceData } = trpc.podcastStudio.getAudienceAnalytics?.useQuery?.();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Podcast Distribution Analytics</h1>
          <p className="text-slate-400">Multi-platform metrics, listener analytics, and revenue tracking</p>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            className={viewMode === 'overview' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
            onClick={() => setViewMode('overview')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={viewMode === 'platforms' ? 'default' : 'outline'}
            className={viewMode === 'platforms' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
            onClick={() => setViewMode('platforms')}
          >
            <Radio className="w-4 h-4 mr-2" />
            Platforms
          </Button>
          <Button
            variant={viewMode === 'revenue' ? 'default' : 'outline'}
            className={viewMode === 'revenue' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
            onClick={() => setViewMode('revenue')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </Button>
          <Button
            variant={viewMode === 'audience' ? 'default' : 'outline'}
            className={viewMode === 'audience' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
            onClick={() => setViewMode('audience')}
          >
            <Users className="w-4 h-4 mr-2" />
            Audience
          </Button>
        </div>

        {/* Date Range Selector */}
        <div className="mb-8 flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              className={dateRange === range ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
              onClick={() => setDateRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>

        {viewMode === 'overview' && (
          // Overview Dashboard
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Total Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{analytics?.totalDownloads?.toLocaleString() || 0}</div>
                  <p className="text-xs text-green-400 mt-1">+{analytics?.downloadGrowth || 0}% this {dateRange}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Active Listeners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{analytics?.activeListeners?.toLocaleString() || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">unique listeners</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">${(analytics?.totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-green-400 mt-1">+${analytics?.revenueGrowth || 0} this {dateRange}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Avg. Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{analytics?.completionRate || 0}%</div>
                  <p className="text-xs text-slate-500 mt-1">episode completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Downloads by Platform
                </CardTitle>
                <CardDescription>Distribution across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.platformDistribution?.map((platform) => (
                    <div key={platform.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">{platform.name}</span>
                        <span className="text-sm text-slate-400">{platform.percentage}%</span>
                      </div>
                      <Progress value={platform.percentage} className="h-2" />
                      <p className="text-xs text-slate-500">{platform.downloads?.toLocaleString()} downloads</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Episodes */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Performing Episodes
                </CardTitle>
                <CardDescription>Most downloaded and shared episodes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topEpisodes?.map((episode, index) => (
                    <div key={episode.id} className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-600 text-white">#{index + 1}</Badge>
                            <h4 className="text-white font-semibold">{episode.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{episode.releaseDate}</p>
                        </div>
                        <Badge className="bg-green-600 text-white">{episode.downloads?.toLocaleString()} DL</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{episode.listeners?.toLocaleString()} listeners</span>
                        <span>{episode.completionRate}% completion</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'platforms' && (
          // Platform-Specific Analytics
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platformMetrics?.platforms?.map((platform) => (
                <Card key={platform.name} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{platform.name}</CardTitle>
                    <CardDescription>{platform.status}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Downloads</p>
                        <p className="text-2xl font-bold text-white">{platform.downloads?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Listeners</p>
                        <p className="text-2xl font-bold text-white">{platform.listeners?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Avg. Rating</p>
                        <p className="text-2xl font-bold text-white">{platform.rating}/5</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Growth</p>
                        <p className="text-2xl font-bold text-green-400">+{platform.growth}%</p>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'revenue' && (
          // Revenue Analytics
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">${(revenueData?.totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-green-400 mt-1">+${revenueData?.revenueGrowth || 0} vs last {dateRange}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Avg. Revenue per Episode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">${(revenueData?.avgRevenuePerEpisode || 0).toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">across all platforms</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {revenueData?.sources?.map((source) => (
                      <div key={source.name} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{source.name}</span>
                        <span className="text-white font-semibold">${source.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue by Source</CardTitle>
                <CardDescription>Breakdown of all revenue streams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData?.sources?.map((source) => (
                    <div key={source.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">{source.name}</span>
                        <span className="text-sm text-slate-400">{source.percentage}%</span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'audience' && (
          // Audience Analytics
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Listeners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{audienceData?.totalListeners?.toLocaleString()}</div>
                  <p className="text-xs text-green-400 mt-1">+{audienceData?.listenerGrowth}% this {dateRange}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Avg. Listener Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{audienceData?.avgAge || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">years old</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Retention Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{audienceData?.retentionRate || 0}%</div>
                  <p className="text-xs text-slate-500 mt-1">episode-to-episode</p>
                </CardContent>
              </Card>
            </div>

            {/* Audience Demographics */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Audience Demographics</CardTitle>
                <CardDescription>Geographic and demographic breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-4">Top Countries</h4>
                    <div className="space-y-2">
                      {audienceData?.topCountries?.map((country) => (
                        <div key={country.name} className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{country.name}</span>
                          <span className="text-sm text-white font-semibold">{country.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-4">Gender Distribution</h4>
                    <div className="space-y-2">
                      {audienceData?.genderDistribution?.map((gender) => (
                        <div key={gender.type} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">{gender.type}</span>
                            <span className="text-sm text-white font-semibold">{gender.percentage}%</span>
                          </div>
                          <Progress value={gender.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listener Engagement */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Listener Engagement</CardTitle>
                <CardDescription>How listeners interact with content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {audienceData?.engagement?.map((metric) => (
                    <div key={metric.name} className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">{metric.name}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{metric.trend}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
