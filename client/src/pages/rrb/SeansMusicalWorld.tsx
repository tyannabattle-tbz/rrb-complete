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
  Music, Play, Pause, Plus, Download, Share2, Zap, TrendingUp,
  Users, Clock, Volume2, Settings, Upload, Edit2
} from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  streams: number;
  date: string;
  status: 'published' | 'draft' | 'pending';
}

interface GenreData {
  name: string;
  value: number;
  fill: string;
}

export default function SeansMusicDivision() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: '1',
      title: 'Sacred Frequencies - 528Hz Healing',
      artist: "Sean's Music",
      duration: '4:32',
      streams: 12450,
      date: '2026-02-15',
      status: 'published',
    },
    {
      id: '2',
      title: 'Solfeggio Journey - Complete Series',
      artist: "Sean's Music",
      duration: '45:20',
      streams: 8920,
      date: '2026-02-10',
      status: 'published',
    },
    {
      id: '3',
      title: 'Untitled Production #7',
      artist: "Sean's Music",
      duration: '3:45',
      streams: 0,
      date: '2026-02-18',
      status: 'draft',
    },
  ]);

  const streamingData = [
    { month: 'Jan', spotify: 8400, apple: 6200, youtube: 7800 },
    { month: 'Feb', spotify: 10200, apple: 8900, youtube: 9400 },
    { month: 'Mar', spotify: 12100, apple: 10300, youtube: 11200 },
  ];

  const genreBreakdown: GenreData[] = [
    { name: 'Healing Frequencies', value: 45, fill: '#3b82f6' },
    { name: 'Sacred Music', value: 28, fill: '#8b5cf6' },
    { name: 'Ambient', value: 18, fill: '#10b981' },
    { name: 'Other', value: 9, fill: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Sean's Music</h1>
            <p className="text-gray-600">Music Production & Publishing Division</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Streams</p>
                <p className="text-2xl font-bold text-gray-900">31.6K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published Tracks</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <Music className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Followers</p>
                <p className="text-2xl font-bold text-gray-900">3.2K</p>
              </div>
              <Users className="w-8 h-8 text-pink-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Monthly Growth</p>
                <p className="text-2xl font-bold text-gray-900">+18%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Streaming Platforms */}
            <Card>
              <CardHeader>
                <CardTitle>Streaming Performance</CardTitle>
                <CardDescription>Streams across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={streamingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="spotify" fill="#1DB954" />
                    <Bar dataKey="apple" fill="#555555" />
                    <Bar dataKey="youtube" fill="#FF0000" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Genre Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Genre Distribution</CardTitle>
                <CardDescription>Music catalog breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genreBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genreBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Releases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Releases</CardTitle>
              <CardDescription>Latest published tracks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracks.filter(t => t.status === 'published').slice(0, 3).map(track => (
                  <div key={track.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{track.title}</h4>
                        <p className="text-sm text-gray-600">{track.duration} • {track.streams.toLocaleString()} streams</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Track Management</h2>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Upload Track
            </Button>
          </div>

          <div className="space-y-4">
            {tracks.map(track => (
              <Card key={track.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{track.title}</h3>
                      <p className="text-sm text-gray-600">{track.artist}</p>
                      <Badge className="mt-2" variant={track.status === 'published' ? 'default' : 'secondary'}>
                        {track.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{track.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Streams</p>
                      <p className="font-semibold">{track.streams.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Released</p>
                      <p className="font-semibold">{track.date}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Streaming Trends</CardTitle>
              <CardDescription>3-month performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={streamingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="spotify" stroke="#1DB954" strokeWidth={2} />
                  <Line type="monotone" dataKey="apple" stroke="#555555" strokeWidth={2} />
                  <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Music Settings</CardTitle>
              <CardDescription>Configure your music division preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Artist Name</label>
                <Input defaultValue="Sean's Music" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} defaultValue="Music producer and healing frequency specialist" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Auto-distribute to all platforms</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable comments</span>
                </label>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
