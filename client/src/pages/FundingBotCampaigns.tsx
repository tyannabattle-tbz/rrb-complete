import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Zap,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FundingBotCampaigns() {
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  // Mock campaign data
  const [campaignStats] = useState({
    totalCampaigns: 12,
    activeCampaigns: 5,
    completedCampaigns: 6,
    failedCampaigns: 1,
    totalRaised: 425000,
    totalTreasuryAmount: 85000,
    successRate: 85.7,
  });

  const [campaignPerformance] = useState([
    { name: 'Completed', value: 6, color: '#10b981' },
    { name: 'Active', value: 5, color: '#3b82f6' },
    { name: 'Failed', value: 1, color: '#ef4444' },
  ]);

  const [treasuryAllocation] = useState([
    { month: 'Week 1', treasury: 12000, user: 48000 },
    { month: 'Week 2', treasury: 15000, user: 60000 },
    { month: 'Week 3', treasury: 18000, user: 72000 },
    { month: 'Week 4', treasury: 20000, user: 80000 },
  ]);

  const [campaigns] = useState([
    {
      id: 'campaign_001',
      title: 'Community Emergency Fund',
      description: 'Support for community members in crisis',
      goal: 50000,
      raised: 48500,
      status: 'active',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      treasuryAllocation: 0.2,
      contributors: 234,
      source: 'website',
    },
    {
      id: 'campaign_002',
      title: 'Infrastructure Development',
      description: 'Platform upgrades and security improvements',
      goal: 75000,
      raised: 75000,
      status: 'completed',
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      treasuryAllocation: 0.25,
      contributors: 412,
      source: 'twitter',
    },
    {
      id: 'campaign_003',
      title: 'Education & Outreach',
      description: 'Financial literacy programs for underserved communities',
      goal: 40000,
      raised: 38500,
      status: 'active',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      treasuryAllocation: 0.15,
      contributors: 189,
      source: 'email',
    },
    {
      id: 'campaign_004',
      title: 'Disaster Relief Fund',
      description: 'Emergency support for affected regions',
      goal: 100000,
      raised: 102000,
      status: 'completed',
      deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      treasuryAllocation: 0.3,
      contributors: 567,
      source: 'social',
    },
    {
      id: 'campaign_005',
      title: 'Community Health Initiative',
      description: 'Healthcare access and wellness programs',
      goal: 60000,
      raised: 45000,
      status: 'active',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      treasuryAllocation: 0.2,
      contributors: 298,
      source: 'api',
    },
  ]);

  const handleCreateCampaign = async () => {
    setIsCreatingCampaign(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Campaign created successfully!');
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-300';
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'failed':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funding Bot Campaigns</h1>
          <p className="text-gray-400 mt-1">Autonomous campaign management & treasury routing (QUMUS Policy #28)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateCampaign}
            disabled={isCreatingCampaign}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreatingCampaign ? 'Creating...' : 'New Campaign'}
          </Button>
          <Button variant="outline" className="text-white border-slate-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Campaigns</p>
                <p className="text-2xl font-bold text-blue-400">{campaignStats.totalCampaigns}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-purple-400">{campaignStats.activeCampaigns}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Raised</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(campaignStats.totalRaised / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Treasury Amount</p>
                <p className="text-2xl font-bold text-cyan-400">
                  ${(campaignStats.totalTreasuryAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-orange-400">
                  {campaignStats.successRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {campaignStats.completedCampaigns}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Campaign Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={campaignPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Treasury Allocation Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={treasuryAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Bar dataKey="treasury" fill="#8b5cf6" name="Treasury (20%)" />
                <Bar dataKey="user" fill="#3b82f6" name="User (80%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Campaigns</CardTitle>
          <CardDescription>Sorted by progress and deadline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const progress = getProgressPercentage(campaign.raised, campaign.goal);
              const treasuryAmount = campaign.raised * campaign.treasuryAllocation;

              return (
                <div
                  key={campaign.id}
                  className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-white">{campaign.title}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(campaign.status)}
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{campaign.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                      </span>
                      <span className="text-gray-400">
                        {campaign.contributors} contributors
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        Treasury: <span className="text-purple-400">${treasuryAmount.toLocaleString()}</span>
                      </span>
                      <span>
                        Deadline:{' '}
                        <span className="text-cyan-400">
                          {campaign.deadline.toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* QUMUS Policy Info */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">QUMUS Policy #28 - Autonomous Campaign Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">📊 Campaign Creation</p>
              <p className="text-gray-400 text-sm">
                Auto-creates campaigns based on funding needs. Configurable treasury allocation (default 20%).
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">💰 Smart Routing</p>
              <p className="text-gray-400 text-sm">
                Routes contributions: 80% to users, 20% to community treasury. Fully automated with no delays.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🎯 Lifecycle Management</p>
              <p className="text-gray-400 text-sm">
                Monitors deadlines, completes campaigns on goal reach, fails campaigns on deadline. 90%+ autonomy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
