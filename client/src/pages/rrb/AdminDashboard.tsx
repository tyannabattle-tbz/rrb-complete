import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Radio, TrendingUp, DollarSign, Activity, Settings, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

const DIVISIONS = [
  { id: 'rrb-main', name: 'RRB Main', listeners: 1240, status: 'live', revenue: 2450 },
  { id: 'sean-music', name: 'Sean\'s Music', listeners: 342, status: 'live', revenue: 680 },
  { id: 'anna-promotion', name: 'Anna Promotion Co.', listeners: 156, status: 'live', revenue: 320 },
  { id: 'jaelon-enterprises', name: 'Jaelon Enterprises', listeners: 89, status: 'offline', revenue: 180 },
  { id: 'little-c', name: 'Little C Recording Co.', listeners: 203, status: 'live', revenue: 410 },
  { id: 'canryn-publishing', name: 'Canryn Publishing Co.', listeners: 178, status: 'offline', revenue: 360 },
];

const LISTENER_TREND = [
  { date: 'Feb 1', listeners: 2400 },
  { date: 'Feb 5', listeners: 3210 },
  { date: 'Feb 10', listeners: 2290 },
  { date: 'Feb 15', listeners: 2000 },
  { date: 'Feb 19', listeners: 2181 },
];

const DONATION_DATA = [
  { name: 'Legacy Recovery', value: 65000 },
  { name: 'Operations', value: 40000 },
  { name: 'Education', value: 15000 },
  { name: 'General', value: 5430 },
];

const COLORS = ['#ff8c42', '#3b82f6', '#a855f7', '#ec4899'];

export default function AdminDashboard() {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('week');

  const totalListeners = DIVISIONS.reduce((sum, d) => sum + d.listeners, 0);
  const totalDonations = DONATION_DATA.reduce((sum, d) => sum + d.value, 0);
  const activeDivisions = DIVISIONS.filter(d => d.status === 'live').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Unified control panel for all Canryn Production divisions
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Total Listeners</p>
                <p className="text-3xl font-bold mt-2">{totalListeners.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Active Divisions</p>
                <p className="text-3xl font-bold mt-2">{activeDivisions}/6</p>
              </div>
              <Radio className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Total Donations</p>
                <p className="text-3xl font-bold mt-2">${(totalDonations / 1000).toFixed(1)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Avg. Donation</p>
                <p className="text-3xl font-bold mt-2">${(totalDonations / 342).toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="divisions">Divisions</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Listener Trend */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">Listener Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={LISTENER_TREND}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="listeners" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Donation Distribution */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">Donation Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={DONATION_DATA}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}K`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {DONATION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Divisions Tab */}
          <TabsContent value="divisions">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Division Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Division</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Listeners</th>
                      <th className="text-left py-3 px-4 font-semibold">Donations</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIVISIONS.map(division => (
                      <tr key={division.id} className="border-b border-border hover:bg-accent/50">
                        <td className="py-3 px-4 font-medium">{division.name}</td>
                        <td className="py-3 px-4">
                          <Badge className={division.status === 'live' ? 'bg-green-600' : 'bg-gray-600'}>
                            {division.status === 'live' ? 'LIVE' : 'OFFLINE'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{division.listeners.toLocaleString()}</td>
                        <td className="py-3 px-4">${division.revenue.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => setSelectedDivision(division.id)}
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Donation Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <span className="font-semibold">Total Raised</span>
                    <span className="text-2xl font-bold text-green-600">${(totalDonations / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <span className="font-semibold">Total Donors</span>
                    <span className="text-2xl font-bold">342</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <span className="font-semibold">Average Donation</span>
                    <span className="text-2xl font-bold">${(totalDonations / 342).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <span className="font-semibold">Monthly Recurring</span>
                    <span className="text-2xl font-bold text-blue-600">$8,500</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4">Recent Donations</h3>
                <div className="space-y-3">
                  {[
                    { amount: 500, purpose: 'Legacy Recovery', time: '2 hours ago' },
                    { amount: 250, purpose: 'Operations', time: '5 hours ago' },
                    { amount: 100, purpose: 'Education', time: '1 day ago' },
                    { amount: 1000, purpose: 'General Support', time: '2 days ago' },
                  ].map((donation, i) => (
                    <div key={`row-${i}`} className="flex justify-between items-center p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-semibold">${donation.amount}</p>
                        <p className="text-xs text-foreground/60">{donation.purpose}</p>
                      </div>
                      <p className="text-xs text-foreground/60">{donation.time}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Admin Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2">Organization Information</h4>
                  <p className="text-sm text-foreground/60 mb-3">Rockin\' Rockin\' Boogie - 501(c)(3) Nonprofit</p>
                  <Button variant="outline">Edit Organization Info</Button>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2">Stripe Configuration</h4>
                  <p className="text-sm text-foreground/60 mb-3">Donations-only mode enabled</p>
                  <Button variant="outline">Manage Stripe Settings</Button>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2">User Management</h4>
                  <p className="text-sm text-foreground/60 mb-3">Manage admin users and permissions</p>
                  <Button variant="outline">Manage Users</Button>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2">Backup & Export</h4>
                  <p className="text-sm text-foreground/60 mb-3">Download all data and analytics</p>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
