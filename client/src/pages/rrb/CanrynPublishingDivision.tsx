'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  BookOpen, TrendingUp, Users, DollarSign, Calendar, CheckCircle,
  AlertCircle, Settings, Download, Plus, Edit2, Zap, FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface Publication {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'in-review' | 'draft';
  progress: number;
  releaseDate: string;
  genre: string;
  sales: number;
}

interface PublicationMetric {
  month: string;
  sales: number;
  readers: number;
  reviews: number;
}

export default function CanrynPublishingDivision() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [publications, setPublications] = useState<Publication[]>([
    {
      id: '1',
      title: 'The Legacy of Seabrun Candy Hunter',
      author: 'Canryn Publishing',
      status: 'published',
      progress: 100,
      releaseDate: '2026-02-15',
      genre: 'Biography',
      sales: 2450,
    },
    {
      id: '2',
      title: 'A Voice for the Voiceless - Sweet Miracles Guide',
      author: 'Canryn Publishing',
      status: 'in-review',
      progress: 85,
      releaseDate: '2026-03-30',
      genre: 'Non-Fiction',
      sales: 0,
    },
    {
      id: '3',
      title: 'Healing Through Frequencies - The Solfeggio Journey',
      author: 'Canryn Publishing',
      status: 'draft',
      progress: 60,
      releaseDate: '2026-05-15',
      genre: 'Self-Help',
      sales: 0,
    },
  ]);

  const publicationMetrics: PublicationMetric[] = [
    { month: 'Jan', sales: 1200, readers: 3400, reviews: 45 },
    { month: 'Feb', sales: 1850, readers: 5200, reviews: 68 },
    { month: 'Mar', sales: 2450, readers: 7100, reviews: 92 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Canryn Publishing Co.</h1>
            <p className="text-gray-600">Literary & Arts Publishing Division</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">4.5K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Readers</p>
                <p className="text-2xl font-bold text-gray-900">15.7K</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publications</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
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
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>3-month publication sales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={publicationMetrics}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Reader Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Reader Engagement</CardTitle>
                <CardDescription>Readers and reviews growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={publicationMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="readers" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="reviews" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Publications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Publications</CardTitle>
              <CardDescription>Latest published works</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publications.filter(p => p.status === 'published').map(pub => (
                  <div key={pub.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-400 rounded flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{pub.title}</h4>
                        <p className="text-sm text-gray-600">{pub.genre} • {pub.sales.toLocaleString()} sales</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publications Tab */}
        <TabsContent value="publications" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Publication Management</h2>
            <Button className="bg-gradient-to-r from-amber-600 to-yellow-600">
              <Plus className="w-4 h-4 mr-2" />
              New Publication
            </Button>
          </div>

          <div className="space-y-4">
            {publications.map(pub => (
              <Card key={pub.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pub.title}</h3>
                        <Badge className="mt-2" variant={pub.status === 'published' ? 'default' : 'secondary'}>
                          {pub.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Genre</p>
                        <p className="font-semibold">{pub.genre}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Release Date</p>
                        <p className="font-semibold">{pub.releaseDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sales</p>
                        <p className="font-semibold">{pub.sales.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full"
                        style={{ width: `${pub.progress}%` }}
                      ></div>
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
              <CardTitle>Publication Performance</CardTitle>
              <CardDescription>Sales, readers, and reviews over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={publicationMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#f59e0b" />
                  <Bar dataKey="readers" fill="#3b82f6" />
                  <Bar dataKey="reviews" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
              <CardDescription>Configure Canryn Publishing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Publisher Name</label>
                <Input defaultValue="Canryn Publishing Co." />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Primary Genre</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option>Biography</option>
                  <option>Non-Fiction</option>
                  <option>Self-Help</option>
                  <option>Arts & Culture</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable reader reviews</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Auto-publish approved manuscripts</span>
                </label>
              </div>
              <Button className="bg-gradient-to-r from-amber-600 to-yellow-600">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
