import React, { useState, useEffect } from 'react';
import { useRouter } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Target, Users, BarChart3, Plus, Play, Pause, 
  CheckCircle, Clock, AlertCircle, Share2, Download 
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'listener_acquisition' | 'retention' | 'engagement';
  status: 'active' | 'paused' | 'completed';
  target_listeners: number;
  current_listeners: number;
  progress: number;
  start_date: number;
  end_date: number;
}

export default function GrowthCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'campaign-1',
      name: 'Spring Listener Growth',
      description: 'Target 5000 new listeners in Q1',
      type: 'listener_acquisition',
      status: 'active',
      target_listeners: 5000,
      current_listeners: 2847,
      progress: 57,
      start_date: Date.now() - 30 * 24 * 60 * 60 * 1000,
      end_date: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'campaign-2',
      name: 'Listener Retention Initiative',
      description: 'Keep existing listeners engaged',
      type: 'retention',
      status: 'active',
      target_listeners: 2500,
      current_listeners: 2340,
      progress: 94,
      start_date: Date.now() - 60 * 24 * 60 * 60 * 1000,
      end_date: Date.now() + 15 * 24 * 60 * 60 * 1000,
    },
  ]);

  const [activeTab, setActiveTab] = useState('active');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'listener_acquisition':
        return 'bg-blue-100 text-blue-800';
      case 'retention':
        return 'bg-green-100 text-green-800';
      case 'engagement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Growth Campaigns</h1>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
        <p className="text-gray-300">Manage listener acquisition, retention, and engagement campaigns</p>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card className="mb-6 bg-slate-800 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white">Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Campaign name" className="bg-slate-700 text-white border-slate-600" />
              <Input placeholder="Target listeners" type="number" className="bg-slate-700 text-white border-slate-600" />
            </div>
            <Input placeholder="Description" className="bg-slate-700 text-white border-slate-600" />
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">Create Campaign</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold text-white mt-1">{activeCampaigns.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Reach</p>
                <p className="text-3xl font-bold text-white mt-1">12.5K</p>
              </div>
              <Users className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Engagement</p>
                <p className="text-3xl font-bold text-white mt-1">68.5%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">{completedCampaigns.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="active" className="text-white">Active Campaigns</TabsTrigger>
          <TabsTrigger value="completed" className="text-white">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCampaigns.map(campaign => (
            <Card key={campaign.id} className="bg-slate-800/50 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                        <Badge className={getTypeColor(campaign.type)}>
                          {campaign.type.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1 ml-auto">
                          {getStatusIcon(campaign.status)}
                          <span className="text-sm text-gray-400">{campaign.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{campaign.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-blue-400 font-semibold">{campaign.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{campaign.current_listeners.toLocaleString()} listeners</span>
                      <span>{campaign.target_listeners.toLocaleString()} target</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCampaigns.length > 0 ? (
            completedCampaigns.map(campaign => (
              <Card key={campaign.id} className="bg-slate-800/50 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                      <p className="text-gray-400 text-sm">Completed: {new Date(campaign.end_date).toLocaleDateString()}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800/50 border-blue-500/20">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-400">No completed campaigns yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
