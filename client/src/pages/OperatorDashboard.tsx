import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  Plus,
  Settings,
  Users,
  Radio,
  TrendingUp,
  Clock,
  Eye,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  Share2,
  Download,
} from 'lucide-react';

interface Operator {
  id: number;
  companyName: string;
  operatorName: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  totalChannels: number;
  totalSubscribers: number;
  monthlyRevenue: number;
  verificationStatus: 'verified' | 'unverified' | 'rejected';
}

interface Channel {
  id: number;
  channelName: string;
  status: 'active' | 'inactive' | 'archived';
  subscribers: number;
  totalViews: number;
  lastBroadcast?: string;
}

interface Broadcast {
  id: number;
  title: string;
  channelName: string;
  status: 'scheduled' | 'live' | 'ended' | 'archived';
  startTime: string;
  viewers?: number;
  duration?: string;
}

const MOCK_OPERATOR: Operator = {
  id: 1,
  companyName: 'Rockin\' Rockin\' Boogie',
  operatorName: 'Seabrun Candy Hunter',
  tier: 'enterprise',
  status: 'active',
  totalChannels: 5,
  totalSubscribers: 12500,
  monthlyRevenue: 15000,
  verificationStatus: 'verified',
};

const MOCK_CHANNELS: Channel[] = [
  {
    id: 1,
    channelName: 'Main Broadcast',
    status: 'active',
    subscribers: 8500,
    totalViews: 125000,
    lastBroadcast: '2 hours ago',
  },
  {
    id: 2,
    channelName: 'Solbones Gaming',
    status: 'active',
    subscribers: 3200,
    totalViews: 45000,
    lastBroadcast: '5 hours ago',
  },
  {
    id: 3,
    channelName: 'Meditation & Healing',
    status: 'active',
    subscribers: 800,
    totalViews: 12000,
    lastBroadcast: '1 day ago',
  },
];

const MOCK_BROADCASTS: Broadcast[] = [
  {
    id: 1,
    title: 'Episode 1: The Beginning - Seabrun\'s Journey',
    channelName: 'Main Broadcast',
    status: 'live',
    startTime: '2026-02-19 18:00',
    viewers: 2847,
  },
  {
    id: 2,
    title: 'Solbones 4+3+2 Tournament',
    channelName: 'Solbones Gaming',
    status: 'scheduled',
    startTime: '2026-02-19 20:00',
  },
  {
    id: 3,
    title: 'Healing Frequencies Session',
    channelName: 'Meditation & Healing',
    status: 'ended',
    startTime: '2026-02-19 10:00',
    duration: '1:30:45',
  },
];

export function OperatorDashboard() {
  const [operator] = useState<Operator>(MOCK_OPERATOR);
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(MOCK_BROADCASTS);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'broadcasts' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateBroadcast, setShowCreateBroadcast] = useState(false);

  const filteredChannels = channels.filter(ch =>
    ch.channelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBroadcasts = broadcasts.filter(bc =>
    bc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{operator.companyName}</h1>
              <p className="text-gray-400 text-sm mt-1">Operator: {operator.operatorName}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                <p className="text-green-400 text-sm font-semibold">✓ Verified</p>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-700 mb-8">
          {(['overview', 'channels', 'broadcasts', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition ${
                activeTab === tab
                  ? 'border-b-2 border-orange-500 text-orange-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Total Channels</p>
                    <p className="text-white text-3xl font-bold mt-2">{operator.totalChannels}</p>
                    <p className="text-blue-300 text-xs mt-2">5 max for {operator.tier}</p>
                  </div>
                  <Radio className="w-8 h-8 text-blue-300" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Subscribers</p>
                    <p className="text-white text-3xl font-bold mt-2">{operator.totalSubscribers.toLocaleString()}</p>
                    <p className="text-purple-300 text-xs mt-2">+12% this month</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-300" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-6 border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">Monthly Revenue</p>
                    <p className="text-white text-3xl font-bold mt-2">${operator.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-emerald-300 text-xs mt-2">+8% from last month</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-300" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Tier Status</p>
                    <p className="text-white text-3xl font-bold mt-2">{operator.tier.toUpperCase()}</p>
                    <p className="text-orange-300 text-xs mt-2">Unlimited features</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-300" />
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => setShowCreateChannel(true)}
                  className="bg-blue-600 hover:bg-blue-700 gap-2 justify-start"
                >
                  <Plus className="w-4 h-4" />
                  Create Channel
                </Button>
                <Button
                  onClick={() => setShowCreateBroadcast(true)}
                  className="bg-purple-600 hover:bg-purple-700 gap-2 justify-start"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Broadcast
                </Button>
                <Button className="bg-gray-700 hover:bg-gray-600 gap-2 justify-start">
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Broadcasts</h3>
              <div className="space-y-3">
                {broadcasts.slice(0, 3).map((broadcast) => (
                  <div key={broadcast.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{broadcast.title}</p>
                      <p className="text-gray-400 text-sm">{broadcast.channelName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        broadcast.status === 'live' ? 'bg-red-900 text-red-200' :
                        broadcast.status === 'scheduled' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-gray-600 text-gray-200'
                      }`}>
                        {broadcast.status.toUpperCase()}
                      </div>
                      {broadcast.viewers && (
                        <div className="flex items-center gap-1 text-orange-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{broadcast.viewers.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search channels..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button
                onClick={() => setShowCreateChannel(true)}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                New Channel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannels.map((channel, idx) => (
                <Card key={`channel-${idx}-${channel.id || 'unnamed'}`} className="bg-gray-800 border-gray-700 p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{channel.channelName}</h3>
                      <p className={`text-xs mt-1 ${
                        channel.status === 'active' ? 'text-green-400' :
                        channel.status === 'inactive' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {channel.status.toUpperCase()}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subscribers</span>
                      <span className="text-white font-semibold">{channel.subscribers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Views</span>
                      <span className="text-white font-semibold">{channel.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Broadcast</span>
                      <span className="text-white font-semibold">{channel.lastBroadcast}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    <Button size="sm" className="flex-1 bg-gray-700 hover:bg-gray-600 gap-1">
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700 gap-1">
                      <Play className="w-3 h-3" />
                      Go Live
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Broadcasts Tab */}
        {activeTab === 'broadcasts' && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search broadcasts..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button
                onClick={() => setShowCreateBroadcast(true)}
                className="bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Schedule Broadcast
              </Button>
            </div>

            <div className="space-y-3">
              {filteredBroadcasts.map((broadcast) => (
                <Card key={broadcast.id} className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{broadcast.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{broadcast.channelName}</p>
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {broadcast.startTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        broadcast.status === 'live' ? 'bg-red-900 text-red-200' :
                        broadcast.status === 'scheduled' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-gray-600 text-gray-200'
                      }`}>
                        {broadcast.status === 'live' && (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            LIVE
                          </div>
                        )}
                        {broadcast.status === 'scheduled' && 'SCHEDULED'}
                        {broadcast.status === 'ended' && 'ENDED'}
                      </div>
                      {broadcast.viewers && (
                        <div className="flex items-center gap-1 text-orange-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{broadcast.viewers.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-gray-700 hover:bg-gray-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-gray-700 hover:bg-gray-600">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Operator Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-semibold">Company Name</label>
                  <Input
                    defaultValue={operator.companyName}
                    className="mt-2 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold">Operator Name</label>
                  <Input
                    defaultValue={operator.operatorName}
                    className="mt-2 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold">Email</label>
                  <Input
                    type="email"
                    placeholder="operator@company.com"
                    className="mt-2 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">Save Settings</Button>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Streaming Credentials</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">YouTube Live</p>
                      <p className="text-gray-400 text-sm">Connected</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Twitch</p>
                      <p className="text-gray-400 text-sm">Not connected</p>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Connect</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
