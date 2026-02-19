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
  Star, Video, Users, TrendingUp, Heart, MessageCircle, Share2,
  Plus, Settings, Download, Play, Edit2, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Content {
  id: string;
  title: string;
  type: 'video' | 'podcast' | 'article';
  views: number;
  likes: number;
  date: string;
  status: 'published' | 'draft';
  creator: string;
}

interface EngagementData {
  week: string;
  views: number;
  likes: number;
  shares: number;
}

export default function LittleCProductionsDivision() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [content, setContent] = useState<Content[]>([
    {
      id: '1',
      title: "Young Voices - Carlos's First Podcast",
      type: 'podcast',
      views: 3240,
      likes: 450,
      date: '2026-02-18',
      status: 'published',
      creator: 'Carlos Kembrel',
    },
    {
      id: '2',
      title: 'Behind the Scenes - Production Journey',
      type: 'video',
      views: 5120,
      likes: 680,
      date: '2026-02-15',
      status: 'published',
      creator: 'Carlos Kembrel',
    },
    {
      id: '3',
      title: 'Youth Empowerment Series - Episode 1',
      type: 'video',
      views: 2890,
      likes: 320,
      date: '2026-02-10',
      status: 'published',
      creator: 'Carlos Kembrel',
    },
  ]);

  const engagementData: EngagementData[] = [
    { week: 'Week 1', views: 4200, likes: 520, shares: 180 },
    { week: 'Week 2', views: 5800, likes: 720, shares: 240 },
    { week: 'Week 3', views: 7100, likes: 890, shares: 310 },
  ];

  const contentTypeBreakdown = [
    { name: 'Videos', value: 45, fill: '#10b981' },
    { name: 'Podcasts', value: 35, fill: '#f59e0b' },
    { name: 'Articles', value: 20, fill: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Little C Productions</h1>
            <p className="text-gray-600">Youth Content Creation & Empowerment Division</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">17.1K</p>
              </div>
              <Video className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">2.4K</p>
              </div>
              <Heart className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Followers</p>
                <p className="text-2xl font-bold text-gray-900">5.8K</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">14%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Engagement Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>3-week performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#10b981" />
                    <Bar dataKey="likes" fill="#f59e0b" />
                    <Bar dataKey="shares" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Content Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>Breakdown by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentTypeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Most viewed and liked pieces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.slice(0, 2).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded flex items-center justify-center">
                        {item.type === 'video' ? <Video className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.views.toLocaleString()} views • {item.likes.toLocaleString()} likes</p>
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

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Upload Content
            </Button>
          </div>

          <div className="space-y-4">
            {content.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.creator}</p>
                      <Badge className="mt-2" variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold capitalize">{item.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Views</p>
                      <p className="font-semibold">{item.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Likes</p>
                      <p className="font-semibold">{item.likes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Published</p>
                      <p className="font-semibold">{item.date}</p>
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

        {/* Creators Tab */}
        <TabsContent value="creators" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Creator Management</CardTitle>
              <CardDescription>Young creators and contributors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Carlos Kembrel</h4>
                      <p className="text-sm text-gray-600">Lead Creator • 3 published pieces</p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Production Settings</CardTitle>
              <CardDescription>Configure Little C Productions preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Studio Name</label>
                <Input defaultValue="Little C Productions" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Default Video Quality</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>1080p</option>
                  <option>720p</option>
                  <option>4K</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable youth mentorship program</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Auto-publish approved content</span>
                </label>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
