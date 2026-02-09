/**
 * Entertainment Platform - Real-Time Monitoring Dashboard
 * Displays key metrics for media studio, audio streaming, and monetization
 */

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'lucide-react';

export default function EntertainmentMonitoringDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Fetch user's projects
  const { data: projects, isLoading: projectsLoading } = trpc.entertainment.getProjects.useQuery();

  // Fetch revenue data
  const { data: revenue, isLoading: revenueLoading } = trpc.entertainment.getUserTotalRevenue.useQuery();

  // Fetch revenue by event type
  const { data: revenueByType, isLoading: revenueByTypeLoading } = trpc.entertainment.getRevenueByEventType.useQuery();

  // Fetch revenue by platform
  const { data: revenueByPlatform, isLoading: revenueByPlatformLoading } = trpc.entertainment.getRevenueByPlatform.useQuery();

  // Fetch revenue by content
  const { data: revenueByContent, isLoading: revenueByContentLoading } = trpc.entertainment.getRevenueByContent.useQuery();

  // Fetch revenue report
  const { data: revenueReport, isLoading: revenueReportLoading } = trpc.entertainment.getRevenueReport.useQuery({
    period: selectedPeriod,
  });

  // Fetch payout history
  const { data: payoutHistory, isLoading: payoutHistoryLoading } = trpc.entertainment.getPayoutHistory.useQuery();

  // Fetch recommendation metrics
  const { data: recommendationMetrics, isLoading: recommendationMetricsLoading } =
    trpc.entertainment.getRecommendationMetrics.useQuery();

  // Fetch monetization settings
  const { data: monetizationSettings, isLoading: monetizationSettingsLoading } =
    trpc.entertainment.getMonetizationSettings.useQuery();

  // Calculate total engagement
  const totalEngagement = projects?.reduce((sum, p) => sum + ((p.likes || 0) + (p.shares || 0) + (p.comments || 0)), 0) || 0;
  const totalViews = projects?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
  const avgEngagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Entertainment Platform Dashboard</h1>
          <p className="text-foreground/70">Real-time monitoring of your media studio, audio streaming, and monetization</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${revenue?.totalRevenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-foreground/50 mt-1">
                {revenue?.eventCount || 0} monetization events
              </p>
            </CardContent>
          </Card>

          {/* Total Projects Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{projects?.length || 0}</div>
              <p className="text-xs text-foreground/50 mt-1">
                {projects?.filter((p) => p.status === 'published').length || 0} published
              </p>
            </CardContent>
          </Card>

          {/* Total Views Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-foreground/50 mt-1">Across all projects</p>
            </CardContent>
          </Card>

          {/* Engagement Rate Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{avgEngagementRate}%</div>
              <p className="text-xs text-foreground/50 mt-1">
                {totalEngagement.toLocaleString()} interactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Sections */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {/* Revenue Report */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Report</CardTitle>
                <CardDescription>Revenue metrics for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">Period:</span>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as any)}
                      className="px-3 py-2 bg-background border border-border rounded-md text-foreground"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground/70">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${revenueReport?.totalRevenue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70">Average per Event</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${revenueReport?.averageRevenue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70">Total Events</p>
                      <p className="text-2xl font-bold text-foreground">{revenueReport?.eventCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70">Top Event Type</p>
                      <p className="text-2xl font-bold text-foreground capitalize">
                        {revenueReport?.topEventType?.replace(/_/g, ' ') || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Event Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Event Type</CardTitle>
                <CardDescription>Breakdown of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenueByType?.byType &&
                    Object.entries(revenueByType.byType).map(([type, data]: any) => (
                      <div key={type} className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-foreground capitalize">{type.replace(/_/g, ' ')}</span>
                        <div className="text-right">
                          <p className="font-bold text-foreground">${data.revenue.toFixed(2)}</p>
                          <p className="text-xs text-foreground/50">{data.count} events</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Platform */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Platform</CardTitle>
                <CardDescription>Performance across distribution platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenueByPlatform?.byPlatform &&
                    Object.entries(revenueByPlatform.byPlatform).map(([platform, data]: any) => (
                      <div key={platform} className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-foreground capitalize">{platform}</span>
                        <div className="text-right">
                          <p className="font-bold text-foreground">${data.revenue.toFixed(2)}</p>
                          <p className="text-xs text-foreground/50">{data.count} events</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payouts</CardTitle>
                <CardDescription>Latest monetization events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {payoutHistory?.map((payout: any) => (
                    <div key={payout.eventId} className="flex justify-between items-center py-2 border-b border-border/50">
                      <div>
                        <p className="font-medium text-foreground capitalize">{payout.eventType.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-foreground/50">{new Date(payout.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold text-foreground">
                        ${payout.revenue.toFixed(2)} {payout.currency}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Media projects and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects?.map((project: any) => (
                    <div key={project.projectId} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-foreground">{project.title}</h3>
                          <p className="text-sm text-foreground/70 capitalize">{project.projectType}</p>
                        </div>
                        <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium capitalize">
                          {project.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-foreground/70">Views</p>
                          <p className="font-bold text-foreground">{(project.views || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-foreground/70">Likes</p>
                          <p className="font-bold text-foreground">{(project.likes || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-foreground/70">Engagement</p>
                          <p className="font-bold text-foreground">{(project.engagementRate || 0).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-foreground/70">Revenue</p>
                          <p className="font-bold text-foreground">${(project.revenue || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommendation Performance</CardTitle>
                <CardDescription>AI recommendation engine metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground/70">Total Recommendations</p>
                    <p className="text-3xl font-bold text-foreground">
                      {recommendationMetrics?.totalRecommendations || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Click Rate</p>
                    <p className="text-3xl font-bold text-foreground">
                      {recommendationMetrics?.clickRate || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Engagement Rate</p>
                    <p className="text-3xl font-bold text-foreground">
                      {recommendationMetrics?.engagementRate || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Engaged Users</p>
                    <p className="text-3xl font-bold text-foreground">{recommendationMetrics?.engaged || 0}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-bold text-foreground mb-3">Recommendations by Type</h4>
                  <div className="space-y-2">
                    {recommendationMetrics?.byType &&
                      Object.entries(recommendationMetrics.byType).map(([type, count]: any) => (
                        <div key={type} className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-foreground capitalize">{type.replace(/_/g, ' ')}</span>
                          <p className="font-bold text-foreground">{count}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monetization Settings</CardTitle>
                <CardDescription>Your monetization configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-foreground">Current Tier</span>
                    <span className="font-bold text-foreground capitalize">{monetizationSettings?.currentTier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-foreground">Monetization Status</span>
                    <span className={`font-bold ${monetizationSettings?.monetizationEnabled ? 'text-green-500' : 'text-red-500'}`}>
                      {monetizationSettings?.monetizationEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-foreground">Subscription Status</span>
                    <span className="font-bold text-foreground capitalize">
                      {monetizationSettings?.subscriptionStatus || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
