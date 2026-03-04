import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, TrendingUp, Users, DollarSign, Plus, Target, 
  Gift, Share2, Download, BarChart3 
} from 'lucide-react';

interface DonorCampaign {
  id: string;
  name: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  target_donors: number;
  current_donors: number;
  status: 'active' | 'paused' | 'completed';
  created_at: number;
}

export default function DonorGrowthCampaigns() {
  const [campaigns, setCampaigns] = useState<DonorCampaign[]>([
    {
      id: 'donor-campaign-1',
      name: 'Spring Fundraising Drive',
      description: 'Support community initiatives and healing programs',
      goal_amount: 50000,
      current_amount: 28500,
      target_donors: 500,
      current_donors: 342,
      status: 'active',
      created_at: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'donor-campaign-2',
      name: 'Emergency Relief Fund',
      description: 'Help those in need during emergencies',
      goal_amount: 25000,
      current_amount: 18200,
      target_donors: 300,
      current_donors: 187,
      status: 'active',
      created_at: Date.now() - 15 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'donor-campaign-3',
      name: 'Wellness Program Expansion',
      description: 'Expand healing frequency and wellness programs',
      goal_amount: 35000,
      current_amount: 35000,
      target_donors: 400,
      current_donors: 412,
      status: 'completed',
      created_at: Date.now() - 60 * 24 * 60 * 60 * 1000,
    },
  ]);

  const totalRaised = campaigns.reduce((sum, c) => sum + c.current_amount, 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + c.current_donors, 0);
  const avgDonation = totalDonors > 0 ? (totalRaised / totalDonors).toFixed(2) : 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold text-white">Donor Growth Campaigns</h1>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
        <p className="text-gray-300">Manage fundraising campaigns and donor engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Raised</p>
                <p className="text-3xl font-bold text-white mt-1">${(totalRaised / 1000).toFixed(1)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Donors</p>
                <p className="text-3xl font-bold text-white mt-1">{totalDonors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Donation</p>
                <p className="text-3xl font-bold text-white mt-1">${avgDonation}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold text-white mt-1">{activeCampaigns.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Active Campaigns</h2>
        <div className="space-y-4">
          {activeCampaigns.map(campaign => (
            <Card key={campaign.id} className="bg-slate-800/50 border-green-500/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{campaign.description}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  {/* Goal Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fundraising Goal</span>
                      <span className="text-green-400 font-semibold">
                        ${campaign.current_amount.toLocaleString()} / ${campaign.goal_amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(campaign.current_amount, campaign.goal_amount)}
                      className="h-2"
                    />
                  </div>

                  {/* Donor Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Donor Target</span>
                      <span className="text-blue-400 font-semibold">
                        {campaign.current_donors} / {campaign.target_donors} donors
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(campaign.current_donors, campaign.target_donors)}
                      className="h-2"
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="bg-slate-700/50 rounded p-3">
                      <p className="text-gray-400 text-xs">Avg Donation</p>
                      <p className="text-white font-bold text-lg">
                        ${(campaign.current_amount / campaign.current_donors).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3">
                      <p className="text-gray-400 text-xs">Completion</p>
                      <p className="text-white font-bold text-lg">
                        {getProgressPercentage(campaign.current_amount, campaign.goal_amount).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3">
                      <p className="text-gray-400 text-xs">Days Active</p>
                      <p className="text-white font-bold text-lg">
                        {Math.floor((Date.now() - campaign.created_at) / (24 * 60 * 60 * 1000))}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Target className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Campaigns */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Completed Campaigns</h2>
        <div className="space-y-4">
          {campaigns.filter(c => c.status === 'completed').map(campaign => (
            <Card key={campaign.id} className="bg-slate-800/50 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                    <p className="text-gray-400 text-sm">
                      Raised ${campaign.current_amount.toLocaleString()} from {campaign.current_donors} donors
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
