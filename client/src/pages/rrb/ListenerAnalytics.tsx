import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Music, Radio } from 'lucide-react';

interface AnalyticsData {
  channel: string;
  listens: number;
  uniqueListeners: number;
  avgDuration: number;
  engagementRate: number;
}

interface FrequencyData {
  frequency: number;
  hz: string;
  usage: number;
  popularity: number;
}

interface EpisodeData {
  episodeId: string;
  title: string;
  plays: number;
  avgListenTime: number;
  completionRate: number;
}

const CHANNEL_ANALYTICS: AnalyticsData[] = [
  { channel: 'RRB Main', listens: 1250, uniqueListeners: 890, avgDuration: 18.5, engagementRate: 78 },
  { channel: "Sean's Music", listens: 680, uniqueListeners: 520, avgDuration: 22.3, engagementRate: 85 },
  { channel: 'Anna Promotion', listens: 420, uniqueListeners: 310, avgDuration: 15.2, engagementRate: 72 },
  { channel: 'Jaelon Enterprises', listens: 380, uniqueListeners: 280, avgDuration: 19.8, engagementRate: 81 },
  { channel: 'Little C Recording', listens: 290, uniqueListeners: 210, avgDuration: 12.5, engagementRate: 68 },
];

const FREQUENCY_DATA: FrequencyData[] = [
  { frequency: 174, hz: '174 Hz', usage: 145, popularity: 68 },
  { frequency: 285, hz: '285 Hz', usage: 189, popularity: 82 },
  { frequency: 369, hz: '369 Hz', usage: 156, popularity: 75 },
  { frequency: 396, hz: '396 Hz', usage: 203, popularity: 88 },
  { frequency: 432, hz: '432 Hz', usage: 178, popularity: 79 },
  { frequency: 528, hz: '528 Hz', usage: 267, popularity: 95 },
  { frequency: 639, hz: '639 Hz', usage: 134, popularity: 65 },
  { frequency: 741, hz: '741 Hz', usage: 112, popularity: 58 },
  { frequency: 852, hz: '852 Hz', usage: 98, popularity: 52 },
  { frequency: 963, hz: '963 Hz', usage: 87, popularity: 48 },
];

const EPISODE_DATA: EpisodeData[] = [
  { episodeId: '1', title: "Episode 1: The Beginning", plays: 450, avgListenTime: 22, completionRate: 85 },
  { episodeId: '2', title: "Episode 2: The Music", plays: 380, avgListenTime: 19, completionRate: 78 },
  { episodeId: '3', title: "Episode 3: The Archive", plays: 290, avgListenTime: 25, completionRate: 92 },
  { episodeId: '4', title: "Episode 4: The Legacy", plays: 210, avgListenTime: 18, completionRate: 71 },
  { episodeId: '5', title: "Episode 5: Collaborations", plays: 180, avgListenTime: 21, completionRate: 82 },
  { episodeId: '6', title: "Episode 6: Live Recordings", plays: 140, avgListenTime: 24, completionRate: 88 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ListenerAnalytics() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const totalListens = CHANNEL_ANALYTICS.reduce((sum, c) => sum + c.listens, 0);
  const totalUniqueListeners = CHANNEL_ANALYTICS.reduce((sum, c) => sum + c.uniqueListeners, 0);
  const avgEngagement = Math.round(CHANNEL_ANALYTICS.reduce((sum, c) => sum + c.engagementRate, 0) / CHANNEL_ANALYTICS.length);

  // Prepare daily trend data
  const dailyTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    listens: Math.floor(Math.random() * 200) + 50,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Listener Analytics</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track engagement, frequency popularity, and episode performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Total Listens</p>
                <p className="text-3xl font-bold">{totalListens.toLocaleString()}</p>
              </div>
              <Radio className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Unique Listeners</p>
                <p className="text-3xl font-bold">{totalUniqueListeners.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Avg. Engagement</p>
                <p className="text-3xl font-bold">{avgEngagement}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Channel Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Channel Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={CHANNEL_ANALYTICS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="listens" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Frequency Popularity */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Solfeggio Frequency Popularity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={FREQUENCY_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ hz, popularity }) => `${hz} (${popularity}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="popularity"
                >
                  {FREQUENCY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Daily Trend */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">30-Day Listen Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="listens" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Channel Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Channel Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Channel Breakdown</h3>
            <div className="space-y-3">
              {CHANNEL_ANALYTICS.map(channel => (
                <div
                  key={channel.channel}
                  onClick={() => setSelectedChannel(channel.channel)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel === channel.channel
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'hover:bg-accent border border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{channel.channel}</p>
                    <Badge>{channel.listens} listens</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-foreground/60">
                    <div>Unique: {channel.uniqueListeners}</div>
                    <div>Avg: {channel.avgDuration}m</div>
                    <div>Engagement: {channel.engagementRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Episodes */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Top Episodes</h3>
            <div className="space-y-3">
              {EPISODE_DATA.sort((a, b) => b.plays - a.plays)
                .slice(0, 5)
                .map(episode => (
                  <div key={episode.episodeId} className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm line-clamp-1">{episode.title}</p>
                      <Badge variant="secondary">{episode.plays} plays</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-foreground/60">
                      <div>Avg Listen: {episode.avgListenTime}m</div>
                      <div>Completion: {episode.completionRate}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Frequency Usage Table */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Solfeggio Frequency Usage
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Frequency</th>
                  <th className="text-left py-3 px-4 font-semibold">Times Used</th>
                  <th className="text-left py-3 px-4 font-semibold">Popularity</th>
                  <th className="text-left py-3 px-4 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {FREQUENCY_DATA.sort((a, b) => b.popularity - a.popularity).map(freq => (
                  <tr key={freq.frequency} className="border-b border-border/50 hover:bg-accent transition-colors">
                    <td className="py-3 px-4 font-semibold">{freq.hz}</td>
                    <td className="py-3 px-4">{freq.usage}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${freq.popularity}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{freq.popularity}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={freq.popularity > 75 ? 'default' : 'secondary'}>
                        {freq.popularity > 75 ? '↑ High' : '→ Medium'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
