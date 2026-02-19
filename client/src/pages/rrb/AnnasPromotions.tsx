'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Plus, TrendingUp, Users, Target, Zap, Share2, Download, 
  Calendar, Clock, Eye, MousePointerClick, Percent, DollarSign, Image, 
  Sparkles, AlertCircle, CheckCircle, Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: 'active' | 'scheduled' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  views: number;
  clicks: number;
  conversions: number;
  roi: number;
}

interface PromotionalAsset {
  id: string;
  type: 'banner' | 'social' | 'email' | 'graphic';
  name: string;
  channel: string;
  createdAt: string;
  status: 'draft' | 'approved' | 'published';
  url?: string;
}

export default function AnnasPromotions() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'RRB Main Launch Campaign',
      channel: 'RRB Main',
      status: 'active',
      startDate: '2026-02-15',
      endDate: '2026-03-15',
      budget: 5000,
      spent: 2340,
      views: 45230,
      clicks: 1203,
      conversions: 87,
      roi: 145,
    },
    {
      id: '2',
      name: "Sean's Music Frequency Focus",
      channel: "Sean's Music",
      status: 'active',
      startDate: '2026-02-10',
      endDate: '2026-02-28',
      budget: 3000,
      spent: 1890,
      views: 28450,
      clicks: 756,
      conversions: 54,
      roi: 128,
    },
  ]);

  const [assets, setAssets] = useState<PromotionalAsset[]>([
    {
      id: '1',
      type: 'banner',
      name: 'Frequency Tuning Hero Banner',
      channel: 'RRB Main',
      createdAt: '2026-02-18',
      status: 'published',
    },
    {
      id: '2',
      type: 'social',
      name: '528 Hz Miracle Tone Social Post',
      channel: 'All Channels',
      createdAt: '2026-02-17',
      status: 'approved',
    },
  ]);

  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('RRB Main');

  const channels = ['RRB Main', "Sean's Music", "Anna's Promotions", 'Jaelon Enterprises', 'Little C Productions'];

  // Analytics data
  const performanceData = [
    { name: 'Week 1', views: 12000, clicks: 340, conversions: 28 },
    { name: 'Week 2', views: 15230, clicks: 450, conversions: 38 },
    { name: 'Week 3', views: 18450, clicks: 520, conversions: 42 },
    { name: 'Week 4', views: 22100, clicks: 650, conversions: 48 },
  ];

  const channelPerformance = [
    { name: 'RRB Main', value: 45, fill: '#f97316' },
    { name: "Sean's Music", value: 28, fill: '#3b82f6' },
    { name: "Anna's Promotions", value: 15, fill: '#a855f7' },
    { name: 'Jaelon Enterprises', value: 8, fill: '#ec4899' },
    { name: 'Little C Productions', value: 4, fill: '#10b981' },
  ];

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaignName,
      channel: selectedChannel,
      status: 'scheduled',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 0,
      spent: 0,
      views: 0,
      clicks: 0,
      conversions: 0,
      roi: 0,
    };

    setCampaigns([...campaigns, newCampaign]);
    setNewCampaignName('');
    setShowNewCampaign(false);
    toast.success(`Campaign "${newCampaignName}" created successfully!`);
  };

  const handleGenerateAsset = (type: string) => {
    toast.loading('Generating promotional asset...');
    setTimeout(() => {
      const newAsset: PromotionalAsset = {
        id: Date.now().toString(),
        type: type as any,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`,
        channel: selectedChannel,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'draft',
      };
      setAssets([...assets, newAsset]);
      toast.success(`${type} asset generated!`);
    }, 2000);
  };

  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const avgROI = campaigns.length > 0 ? Math.round(campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Anna's Promotions</h1>
            <p className="text-gray-600">Comprehensive Marketing & Campaign Management Platform</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
              </div>
              <MousePointerClick className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{totalConversions.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Spent</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Remaining</p>
                <p className="text-2xl font-bold text-gray-900">${(totalBudget - totalSpent).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg ROI</p>
                <p className="text-2xl font-bold text-gray-900">{avgROI}%</p>
              </div>
              <Percent className="w-8 h-8 text-pink-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Views, clicks, and conversions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Promotion distribution by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>{campaigns.filter(c => c.status === 'active').length} campaigns running</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.filter(c => c.status === 'active').map(campaign => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">{campaign.channel}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">ROI</p>
                        <p className="text-lg font-bold text-green-600">{campaign.roi}%</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
            <Button 
              onClick={() => setShowNewCampaign(!showNewCampaign)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {showNewCampaign && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <Input
                    placeholder="e.g., Spring Frequency Promotion"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Channel</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {channels.map(ch => (
                      <option key={ch} value={ch} selected={ch === selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCreateCampaign}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Create Campaign
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowNewCampaign(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaigns List */}
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.channel}</p>
                      <Badge className="mt-2" variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Views:</span>
                        <span className="font-semibold">{campaign.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clicks:</span>
                        <span className="font-semibold">{campaign.clicks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversions:</span>
                        <span className="font-semibold">{campaign.conversions.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Budget:</span>
                        <span className="font-semibold">${campaign.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Spent:</span>
                        <span className="font-semibold">${campaign.spent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ROI:</span>
                        <span className="font-semibold text-green-600">{campaign.roi}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Promotional Assets</h2>
          </div>

          {/* Asset Generator */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Generate New Asset
              </CardTitle>
              <CardDescription>AI-powered promotional asset creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => handleGenerateAsset('banner')}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-white border-2 border-blue-200 hover:bg-blue-50 text-gray-700"
                >
                  <Image className="w-6 h-6" />
                  <span className="text-sm">Banner</span>
                </Button>
                <Button 
                  onClick={() => handleGenerateAsset('social')}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-white border-2 border-blue-200 hover:bg-blue-50 text-gray-700"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-sm">Social Post</span>
                </Button>
                <Button 
                  onClick={() => handleGenerateAsset('email')}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-white border-2 border-blue-200 hover:bg-blue-50 text-gray-700"
                >
                  <Zap className="w-6 h-6" />
                  <span className="text-sm">Email</span>
                </Button>
                <Button 
                  onClick={() => handleGenerateAsset('graphic')}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-white border-2 border-blue-200 hover:bg-blue-50 text-gray-700"
                >
                  <Sparkles className="w-6 h-6" />
                  <span className="text-sm">Graphic</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map(asset => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-600">{asset.channel}</p>
                      </div>
                      <Badge variant="outline" className={
                        asset.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                        asset.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }>
                        {asset.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}</span>
                      <span>{asset.createdAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Settings</CardTitle>
              <CardDescription>Configure Anna's Promotions preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Default Campaign Duration (days)</label>
                <Input type="number" defaultValue="30" className="w-full" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Default Budget</label>
                <Input type="number" defaultValue="5000" className="w-full" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Primary Channels</label>
                <div className="space-y-2">
                  {channels.map(ch => (
                    <label key={ch} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
