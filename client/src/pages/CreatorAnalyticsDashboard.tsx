'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, Eye, Heart, Share2, Download } from 'lucide-react';

interface ContentMetric {
  episodeTitle: string;
  views: number;
  engagement: number;
  revenue: number;
  avgWatchTime: number;
  completionRate: number;
}

interface DemographicData {
  ageGroup: string;
  percentage: number;
  growth: number;
}

const mockMetrics: ContentMetric[] = [
  {
    episodeTitle: 'The Future of AI in Music Production',
    views: 15420,
    engagement: 2340,
    revenue: 1240,
    avgWatchTime: 28,
    completionRate: 82,
  },
  {
    episodeTitle: 'Behind the Scenes of Studio Production',
    views: 12890,
    engagement: 1890,
    revenue: 980,
    avgWatchTime: 26,
    completionRate: 78,
  },
  {
    episodeTitle: 'Interview with Grammy Winner',
    views: 18560,
    engagement: 3120,
    revenue: 1560,
    avgWatchTime: 35,
    completionRate: 85,
  },
];

const mockDemographics: DemographicData[] = [
  { ageGroup: '18-24', percentage: 28, growth: 12 },
  { ageGroup: '25-34', percentage: 35, growth: 8 },
  { ageGroup: '35-44', percentage: 22, growth: 5 },
  { ageGroup: '45-54', percentage: 12, growth: 3 },
  { ageGroup: '55+', percentage: 3, growth: 1 },
];

export default function CreatorAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  const totalViews = mockMetrics.reduce((sum, m) => sum + m.views, 0);
  const totalEngagement = mockMetrics.reduce((sum, m) => sum + m.engagement, 0);
  const totalRevenue = mockMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const avgCompletionRate = Math.round(
    mockMetrics.reduce((sum, m) => sum + m.completionRate, 0) / mockMetrics.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Creator Analytics</h1>
            <p className="text-slate-400">Track your content performance and optimize for growth</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 hover:border-slate-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'blue', change: '+12%' },
            { label: 'Engagement', value: totalEngagement.toLocaleString(), icon: Heart, color: 'red', change: '+8%' },
            { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green', change: '+15%' },
            { label: 'Avg Completion', value: `${avgCompletionRate}%`, icon: TrendingUp, color: 'purple', change: '+3%' },
          ].map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{metric.label}</p>
                      <p className="text-white text-2xl font-bold mt-2">{metric.value}</p>
                      <p className={`text-sm mt-2 ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {metric.change} vs last period
                      </p>
                    </div>
                    <Icon className={`w-8 h-8 text-${metric.color}-400`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Content Performance */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Content Performance</CardTitle>
                <CardDescription>Top performing episodes by views and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMetrics.map((metric, idx) => (
                    <div key={idx} className="border-b border-slate-700 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{metric.episodeTitle}</p>
                          <div className="flex gap-4 text-sm text-slate-400 mt-1">
                            <span>👁️ {metric.views.toLocaleString()} views</span>
                            <span>❤️ {metric.engagement.toLocaleString()} engagements</span>
                            <span>💰 ${metric.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-900/30 text-green-300 border-green-500">
                          {metric.completionRate}% complete
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full"
                            style={{ width: `${metric.completionRate}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs">{metric.avgWatchTime} min avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audience Demographics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Audience Demographics</CardTitle>
              <CardDescription>Listener age distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockDemographics.map((demo, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{demo.ageGroup}</span>
                    <span className="text-white text-sm font-semibold">{demo.percentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                        style={{ width: `${demo.percentage}%` }}
                      />
                    </div>
                    <span className={`text-xs ${demo.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {demo.growth > 0 ? '+' : ''}{demo.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Optimization Recommendations */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              AI-Powered Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'Optimize Upload Times',
                  description: 'Upload episodes at 6 PM on Thursdays for 23% higher initial engagement',
                  impact: 'High',
                  confidence: 0.92,
                },
                {
                  title: 'Extend Episode Length',
                  description: 'Episodes 30-40 minutes long have 18% higher completion rates',
                  impact: 'Medium',
                  confidence: 0.87,
                },
                {
                  title: 'Increase Guest Appearances',
                  description: 'Guest episodes get 35% more views and 45% more shares',
                  impact: 'High',
                  confidence: 0.89,
                },
                {
                  title: 'Target 25-34 Age Group',
                  description: 'Your strongest demographic is growing 8% month-over-month',
                  impact: 'Medium',
                  confidence: 0.94,
                },
                {
                  title: 'Add Video Content',
                  description: 'Video episodes get 2.5x more engagement than audio-only',
                  impact: 'High',
                  confidence: 0.91,
                },
                {
                  title: 'Create Series',
                  description: 'Multi-part series increase listener retention by 34%',
                  impact: 'High',
                  confidence: 0.88,
                },
              ].map((rec, idx) => (
                <Card key={idx} className="bg-slate-700 border-slate-600">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">{rec.title}</h3>
                      <Badge
                        className={`${
                          rec.impact === 'High'
                            ? 'bg-red-900/30 text-red-300 border-red-500'
                            : 'bg-yellow-900/30 text-yellow-300 border-yellow-500'
                        }`}
                      >
                        {rec.impact}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-xs mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Confidence</span>
                      <div className="flex-1 bg-slate-600 rounded-full h-1.5 ml-2 mr-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full"
                          style={{ width: `${rec.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-xs font-semibold">{(rec.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Attribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue Attribution</CardTitle>
            <CardDescription>Track revenue by source and content type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-4">Revenue by Source</h3>
                <div className="space-y-3">
                  {[
                    { source: 'Sponsorships', amount: 4200, percentage: 45 },
                    { source: 'Donations', amount: 2100, percentage: 23 },
                    { source: 'Ads', amount: 1890, percentage: 20 },
                    { source: 'Premium Content', amount: 980, percentage: 12 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm">{item.source}</span>
                        <span className="text-white font-semibold">${item.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Revenue by Content Type</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Solo Episodes', amount: 3450, percentage: 37 },
                    { type: 'Guest Episodes', amount: 3120, percentage: 34 },
                    { type: 'Series', amount: 1890, percentage: 20 },
                    { type: 'Special Events', amount: 710, percentage: 9 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm">{item.type}</span>
                        <span className="text-white font-semibold">${item.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
