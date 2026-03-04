import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  total_listeners: number;
  growth_rate: number;
  engagement: number;
  status: 'active' | 'paused' | 'completed';
}

interface RevenueMetrics {
  total_raised: number;
  monthly_recurring: number;
  one_time_donations: number;
  avg_donation: number;
  donor_count: number;
  recurring_donors: number;
}

interface BotMetrics {
  total_bots: number;
  active_bots: number;
  posts_today: number;
  total_engagement: number;
  avg_engagement_per_post: number;
  platform_breakdown: Array<{ platform: string; posts: number; engagement: number }>;
}

export function CampaignMetricsWidget() {
  const [campaigns, setCampaigns] = useState<CampaignMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: CampaignMetrics[] = [
      { campaign_id: '1', campaign_name: 'Spring Listener Growth', total_listeners: 5000, growth_rate: 12.5, engagement: 78, status: 'active' },
      { campaign_id: '2', campaign_name: 'Summer Festival', total_listeners: 3200, growth_rate: 8.3, engagement: 65, status: 'active' },
      { campaign_id: '3', campaign_name: 'Winter Warmth', total_listeners: 2100, growth_rate: 5.2, engagement: 52, status: 'paused' },
    ];
    setCampaigns(mockData);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading campaign metrics...</div>;

  const chartData = campaigns.map(c => ({
    name: c.campaign_name,
    listeners: c.total_listeners,
    engagement: c.engagement,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📊 Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="listeners" fill="#8884d8" name="Listeners" />
            <Bar dataKey="engagement" fill="#82ca9d" name="Engagement %" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {campaigns.map(campaign => (
            <div key={campaign.campaign_id} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-sm">{campaign.campaign_name}</p>
              <p className="text-2xl font-bold text-blue-600">{campaign.total_listeners.toLocaleString()}</p>
              <p className="text-xs text-gray-600">+{campaign.growth_rate}% growth</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueMetricsWidget() {
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: RevenueMetrics = {
      total_raised: 154200,
      monthly_recurring: 8700,
      one_time_donations: 12500,
      avg_donation: 450,
      donor_count: 342,
      recurring_donors: 87,
    };
    setRevenue(mockData);
    setLoading(false);
  }, []);

  if (loading || !revenue) return <div>Loading revenue metrics...</div>;

  const pieData = [
    { name: 'Recurring', value: revenue.monthly_recurring * 12 },
    { name: 'One-Time', value: revenue.one_time_donations },
  ];

  const COLORS = ['#8884d8', '#82ca9d'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>💰 Revenue Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Raised</p>
            <p className="text-3xl font-bold text-green-600">${(revenue.total_raised / 1000).toFixed(1)}K</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Recurring</p>
            <p className="text-3xl font-bold text-blue-600">${revenue.monthly_recurring.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg Donation</p>
            <p className="text-3xl font-bold text-purple-600">${revenue.avg_donation}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Donors</p>
            <p className="text-3xl font-bold text-orange-600">{revenue.donor_count}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}K`} outerRadius={80} fill="#8884d8" dataKey="value">
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BotMetricsWidget() {
  const [bots, setBots] = useState<BotMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: BotMetrics = {
      total_bots: 4,
      active_bots: 3,
      posts_today: 12,
      total_engagement: 8900,
      avg_engagement_per_post: 741.67,
      platform_breakdown: [
        { platform: 'twitter', posts: 4, engagement: 2100 },
        { platform: 'facebook', posts: 3, engagement: 1800 },
        { platform: 'instagram', posts: 3, engagement: 2500 },
        { platform: 'tiktok', posts: 2, engagement: 2500 },
      ],
    };
    setBots(mockData);
    setLoading(false);
  }, []);

  if (loading || !bots) return <div>Loading bot metrics...</div>;

  const chartData = bots.platform_breakdown.map(p => ({
    platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    posts: p.posts,
    engagement: p.engagement,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🤖 AI Bot Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs text-gray-600">Active Bots</p>
            <p className="text-2xl font-bold text-indigo-600">{bots.active_bots}/{bots.total_bots}</p>
          </div>
          <div className="p-3 bg-cyan-50 rounded-lg">
            <p className="text-xs text-gray-600">Posts Today</p>
            <p className="text-2xl font-bold text-cyan-600">{bots.posts_today}</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <p className="text-xs text-gray-600">Total Engagement</p>
            <p className="text-2xl font-bold text-pink-600">{bots.total_engagement.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg">
            <p className="text-xs text-gray-600">Avg/Post</p>
            <p className="text-2xl font-bold text-rose-600">{Math.round(bots.avg_engagement_per_post)}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="posts" fill="#fbbf24" name="Posts" />
            <Bar dataKey="engagement" fill="#f87171" name="Engagement" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EcosystemAnalyticsDashboard() {
  return (
    <div className="w-full space-y-6 p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">📈 Ecosystem Analytics</h1>
        <p className="text-gray-600 mt-2">Real-time metrics for campaigns, revenue, and bot performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignMetricsWidget />
        <RevenueMetricsWidget />
      </div>

      <div className="w-full">
        <BotMetricsWidget />
      </div>
    </div>
  );
}
