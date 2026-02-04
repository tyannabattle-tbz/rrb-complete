import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Play, Pause, Music, Radio, Headphones, Calendar, Users, TrendingUp } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'radio' | 'podcast' | 'audiobook';
  description: string;
  status: 'active' | 'scheduled' | 'archived';
  listeners: number;
  duration?: string;
  schedule?: string;
  thumbnail?: string;
  rating: number;
}

interface ChannelMetrics {
  totalListeners: number;
  activeStreams: number;
  avgListeningTime: number;
  topContent: string;
  engagement: number;
}

export default function RockinBoogieContentManager() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Morning Drive Show',
      type: 'radio',
      description: 'Your daily dose of music, news, and entertainment',
      status: 'active',
      listeners: 45230,
      schedule: 'Daily 6AM-10AM',
      rating: 4.8,
    },
    {
      id: '2',
      title: 'Tech Talk Daily',
      type: 'podcast',
      description: 'Latest technology trends and interviews',
      status: 'active',
      listeners: 28450,
      duration: '45 min',
      rating: 4.6,
    },
    {
      id: '3',
      title: 'The Great Gatsby',
      type: 'audiobook',
      description: 'Classic literature read by professional narrators',
      status: 'active',
      listeners: 12340,
      duration: '8h 32m',
      rating: 4.9,
    },
  ]);

  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [metrics, setMetrics] = useState<ChannelMetrics>({
    totalListeners: 85920,
    activeStreams: 1243,
    avgListeningTime: 42,
    topContent: 'Morning Drive Show',
    engagement: 87,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'radio':
        return <Radio className="w-5 h-5" />;
      case 'podcast':
        return <Headphones className="w-5 h-5" />;
      case 'audiobook':
        return <Music className="w-5 h-5" />;
      default:
        return <Music className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'archived':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
      default:
        return 'bg-slate-100 dark:bg-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Music className="w-8 h-8 text-purple-600" />
                Rockin' Rockin' Boogie Content Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage radio stations, podcasts, and audiobooks powered by HybridCast
              </p>
            </div>
            <Button
              onClick={() => setShowNewForm(!showNewForm)}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4" />
              New Content
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Metrics Cards */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Listeners</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalListeners.toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 12% this week</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Streams</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.activeStreams.toLocaleString()}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Live now</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Listening Time</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.avgListeningTime} min</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Per session</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Engagement Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.engagement}%</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">↑ 5% vs last month</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Content Library</h2>

            {showNewForm && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Add New Content</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-500"
                  />
                  <select className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white">
                    <option>Radio</option>
                    <option>Podcast</option>
                    <option>Audiobook</option>
                  </select>
                  <textarea
                    placeholder="Description"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-500"
                    rows={3}
                  ></textarea>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      Create
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {contentItems.map((item) => (
              <Card
                key={item.id}
                className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedContent === item.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedContent(item.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1 text-purple-600 dark:text-purple-400">{getTypeIcon(item.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <div className="flex gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Content Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Listeners</p>
                    <p className="font-bold text-slate-900 dark:text-white">{(item.listeners / 1000).toFixed(1)}K</p>
                  </div>
                  {item.schedule && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Schedule</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{item.schedule}</p>
                    </div>
                  )}
                  {item.duration && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{item.duration}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Type</p>
                    <p className="font-bold text-slate-900 dark:text-white capitalize text-sm">{item.type}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Play className="w-3 h-3" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-red-600 dark:text-red-400">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Analytics</h2>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Performer
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{metrics.topContent}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">45,230 active listeners</p>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduling
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Scheduled Today</span>
                  <span className="font-bold text-slate-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">This Week</span>
                  <span className="font-bold text-slate-900 dark:text-white">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">This Month</span>
                  <span className="font-bold text-slate-900 dark:text-white">72</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Audience Insights
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Peak Hours</p>
                  <p className="font-bold text-slate-900 dark:text-white">6AM - 10AM, 5PM - 8PM</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Top Region</p>
                  <p className="font-bold text-slate-900 dark:text-white">North America (68%)</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Avg Age</p>
                  <p className="font-bold text-slate-900 dark:text-white">28-45 years</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
