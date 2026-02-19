'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Radio, Zap, Users, TrendingUp, Clock, Play, Pause, Volume2,
  Settings, Download, Share2, AlertCircle, CheckCircle, Wifi
} from 'lucide-react';
import { toast } from 'sonner';

interface Broadcast {
  id: string;
  title: string;
  status: 'live' | 'scheduled' | 'completed';
  startTime: string;
  duration: number;
  listeners: number;
  quality: '720p' | '1080p' | '4K';
}

interface BroadcastMetric {
  timestamp: string;
  listeners: number;
  quality: number;
  engagement: number;
}

export default function RRBMainDivision() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: '1',
      title: 'RRB Main - Live Broadcast',
      status: 'live',
      startTime: '2026-02-19 14:00',
      duration: 120,
      listeners: 1240,
      quality: '1080p',
    },
    {
      id: '2',
      title: 'Legacy Archive Special',
      status: 'scheduled',
      startTime: '2026-02-20 18:00',
      duration: 180,
      listeners: 0,
      quality: '4K',
    },
  ]);

  const broadcastMetrics: BroadcastMetric[] = [
    { timestamp: '14:00', listeners: 450, quality: 95, engagement: 78 },
    { timestamp: '14:30', listeners: 720, quality: 98, engagement: 85 },
    { timestamp: '15:00', listeners: 1050, quality: 96, engagement: 88 },
    { timestamp: '15:30', listeners: 1240, quality: 99, engagement: 92 },
  ];

  const contentArchive = [
    { id: '1', title: 'Seabrun Candy Hunter - Episode 1', duration: '45:30', date: '2026-02-15', views: 2340 },
    { id: '2', title: 'The Music - Recordings & Performances', duration: '62:15', date: '2026-02-10', views: 1890 },
    { id: '3', title: 'Archive Documentation - Proof & Verification', duration: '50:00', date: '2026-02-05', views: 1450 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">RRB Main</h1>
            <p className="text-gray-600">Primary Broadcast & Content Management Division</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Listeners</p>
                <p className="text-2xl font-bold text-gray-900">1,240</p>
              </div>
              <Users className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stream Quality</p>
                <p className="text-2xl font-bold text-gray-900">1080p</p>
              </div>
              <Wifi className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Archive Items</p>
                <p className="text-2xl font-bold text-gray-900">847</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Listener Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Listener Trend</CardTitle>
                <CardDescription>Real-time listener activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={broadcastMetrics}>
                    <defs>
                      <linearGradient id="colorListeners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="listeners" stroke="#f97316" fillOpacity={1} fill="url(#colorListeners)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quality & Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Quality & Engagement</CardTitle>
                <CardDescription>Stream health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={broadcastMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2} name="Quality %" />
                    <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} name="Engagement %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Live Broadcast Status */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <CardTitle>Live Now</CardTitle>
                </div>
                <Badge className="bg-green-600">LIVE</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">RRB Main - Live Broadcast</h3>
                  <p className="text-sm text-gray-600">Started 2 hours ago • 1,240 listeners</p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Broadcast
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Broadcast Management</h2>
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
              <Radio className="w-4 h-4 mr-2" />
              Schedule Broadcast
            </Button>
          </div>

          <div className="space-y-4">
            {broadcasts.map(broadcast => (
              <Card key={broadcast.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{broadcast.title}</h3>
                      <p className="text-sm text-gray-600">{broadcast.startTime}</p>
                      <Badge className="mt-2" variant={broadcast.status === 'live' ? 'default' : 'secondary'}>
                        {broadcast.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="font-semibold">{broadcast.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Listeners:</span>
                        <span className="font-semibold">{broadcast.listeners.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quality</p>
                      <p className="font-semibold text-lg">{broadcast.quality}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4" />
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

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Content Archive</h2>

          <div className="space-y-4">
            {contentArchive.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{item.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Views</p>
                      <p className="font-semibold">{item.views.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
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
              <CardTitle>RRB Main Settings</CardTitle>
              <CardDescription>Configure broadcast preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Default Stream Quality</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>1080p</option>
                  <option>4K</option>
                  <option>720p</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Auto Archive After (hours)</label>
                <Input type="number" defaultValue="24" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable auto-transcoding</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable chat moderation</span>
                </label>
              </div>
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
