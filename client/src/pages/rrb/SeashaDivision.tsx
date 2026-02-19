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
  Truck, Package, CheckCircle, AlertCircle, TrendingUp, Users,
  Settings, Download, Plus, Edit2, MapPin, Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'in-transit' | 'delivered' | 'pending';
  items: number;
  weight: string;
  date: string;
}

interface DistributionMetric {
  week: string;
  shipped: number;
  received: number;
  processed: number;
}

export default function SeashaDivision() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: '1',
      trackingNumber: 'SDS-2026-0001',
      origin: 'Canryn Publishing',
      destination: 'Regional Distribution Center',
      status: 'delivered',
      items: 250,
      weight: '1,250 lbs',
      date: '2026-02-18',
    },
    {
      id: '2',
      trackingNumber: 'SDS-2026-0002',
      origin: "Sean's Music World",
      destination: 'Digital Archive',
      status: 'in-transit',
      items: 45,
      weight: '180 lbs',
      date: '2026-02-19',
    },
    {
      id: '3',
      trackingNumber: 'SDS-2026-0003',
      origin: 'Little C Recording Co.',
      destination: 'Fulfillment Center',
      status: 'pending',
      items: 120,
      weight: '600 lbs',
      date: '2026-02-19',
    },
  ]);

  const distributionMetrics: DistributionMetric[] = [
    { week: 'Week 1', shipped: 1200, received: 980, processed: 1150 },
    { week: 'Week 2', shipped: 1450, received: 1320, processed: 1400 },
    { week: 'Week 3', shipped: 1680, received: 1550, processed: 1620 },
  ];

  const statusBreakdown = [
    { name: 'Delivered', value: 65, fill: '#10b981' },
    { name: 'In Transit', value: 25, fill: '#f59e0b' },
    { name: 'Pending', value: 10, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Seasha Distribution Co.</h1>
            <p className="text-gray-600">Shipping & Receiving Department</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">4.3K</p>
              </div>
              <Truck className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">4.1K</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">180</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">99.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Distribution Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Trends</CardTitle>
                <CardDescription>Shipments processed weekly</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distributionMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="shipped" fill="#3b82f6" />
                    <Bar dataKey="received" fill="#10b981" />
                    <Bar dataKey="processed" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Status</CardTitle>
                <CardDescription>Current status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Shipments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Latest distribution activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipments.slice(0, 2).map(shipment => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{shipment.trackingNumber}</h4>
                        <p className="text-sm text-gray-600">{shipment.origin} → {shipment.destination}</p>
                      </div>
                    </div>
                    <Badge variant={shipment.status === 'delivered' ? 'default' : 'secondary'}>
                      {shipment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Shipment Management</h2>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          </div>

          <div className="space-y-4">
            {shipments.map(shipment => (
              <Card key={shipment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{shipment.trackingNumber}</h3>
                      <Badge className="mt-2" variant={shipment.status === 'delivered' ? 'default' : 'secondary'}>
                        {shipment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Origin</p>
                      <p className="font-semibold">{shipment.origin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-semibold">{shipment.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-semibold">{shipment.items}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-semibold">{shipment.weight}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        <MapPin className="w-4 h-4" />
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
              <CardTitle>Distribution Performance</CardTitle>
              <CardDescription>Weekly shipment and processing trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={distributionMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="shipped" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="processed" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Settings</CardTitle>
              <CardDescription>Configure Seasha Distribution preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <Input defaultValue="Seasha Distribution Co." />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Default Carrier</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>FedEx</option>
                  <option>UPS</option>
                  <option>DHL</option>
                  <option>Local Courier</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Auto-track shipments</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Send delivery notifications</span>
                </label>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
