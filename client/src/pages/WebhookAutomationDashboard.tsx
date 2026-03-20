import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Zap, Radio, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function WebhookAutomationDashboard() {
  const [webhookStats] = useState({
    totalEvents: 2847,
    processedEvents: 2734,
    failedEvents: 18,
    activeSubscriptions: 3,
    averageLatency: 245, // ms
  });

  const [eventDistribution] = useState([
    { name: 'Grant Discovered', value: 856, color: '#10b981' },
    { name: 'Campaign Created', value: 1024, color: '#3b82f6' },
    { name: 'Donation Received', value: 567, color: '#ec4899' },
    { name: 'Monetization Option', value: 400, color: '#f59e0b' },
  ]);

  const [subscriptions] = useState([
    {
      id: 'sub_hybridcast_001',
      target: 'hybridcast',
      eventTypes: ['grant_discovered', 'campaign_created', 'donation_received'],
      active: true,
      webhookUrl: 'https://hybridcast.app/webhooks/flowpay',
      eventsProcessed: 1247,
      lastEvent: new Date(Date.now() - 5 * 60000),
    },
    {
      id: 'sub_squadd_001',
      target: 'squadd',
      eventTypes: ['campaign_created', 'listener_tip_received', 'monetization_option'],
      active: true,
      webhookUrl: 'https://squadd.app/webhooks/flowpay',
      eventsProcessed: 892,
      lastEvent: new Date(Date.now() - 12 * 60000),
    },
    {
      id: 'sub_content_calendar_001',
      target: 'content_calendar',
      eventTypes: ['campaign_created', 'monetization_option', 'grant_discovered'],
      active: true,
      webhookUrl: 'https://content-calendar.app/webhooks/flowpay',
      eventsProcessed: 708,
      lastEvent: new Date(Date.now() - 8 * 60000),
    },
  ]);

  const [recentEvents] = useState([
    {
      id: 'evt_001',
      eventType: 'grant_discovered',
      source: 'flowpay',
      targets: ['hybridcast', 'content_calendar'],
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'processed',
      latency: 234,
    },
    {
      id: 'evt_002',
      eventType: 'campaign_created',
      source: 'flowpay',
      targets: ['hybridcast', 'squadd', 'content_calendar'],
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'processed',
      latency: 189,
    },
    {
      id: 'evt_003',
      eventType: 'donation_received',
      source: 'flowpay',
      targets: ['hybridcast'],
      timestamp: new Date(Date.now() - 28 * 60000),
      status: 'processed',
      latency: 267,
    },
    {
      id: 'evt_004',
      eventType: 'monetization_option',
      source: 'flowpay',
      targets: ['squadd', 'content_calendar'],
      timestamp: new Date(Date.now() - 42 * 60000),
      status: 'processed',
      latency: 198,
    },
  ]);

  const [eventTimeline] = useState([
    { time: '00:00', events: 45, processed: 44, failed: 1 },
    { time: '04:00', events: 52, processed: 51, failed: 1 },
    { time: '08:00', events: 67, processed: 65, failed: 2 },
    { time: '12:00', events: 89, processed: 87, failed: 2 },
    { time: '16:00', events: 124, processed: 121, failed: 3 },
    { time: '20:00', events: 156, processed: 152, failed: 4 },
    { time: '24:00', events: 178, processed: 173, failed: 5 },
  ]);

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'hybridcast':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'squadd':
        return <Radio className="w-4 h-4 text-blue-400" />;
      case 'content_calendar':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'hybridcast':
        return 'HybridCast';
      case 'squadd':
        return 'SQUADD Radio';
      case 'content_calendar':
        return 'Content Calendar';
      default:
        return target;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Webhook Automation Dashboard</h1>
        <p className="text-gray-400 mt-1">
          HybridCast, SQUADD, and Content Calendar integration
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-blue-400">{webhookStats.totalEvents}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Processed</p>
                <p className="text-2xl font-bold text-green-400">{webhookStats.processedEvents}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-400">{webhookStats.failedEvents}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Subscriptions</p>
                <p className="text-2xl font-bold text-purple-400">
                  {webhookStats.activeSubscriptions}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Latency</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {webhookStats.averageLatency}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Distribution & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Event Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={eventDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Event Processing Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eventTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Bar dataKey="processed" fill="#10b981" name="Processed" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Active Subscriptions</CardTitle>
          <CardDescription>Webhook endpoints for ecosystem integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white">{getTargetLabel(sub.target)}</h4>
                    <p className="text-xs text-gray-400 mt-1">{sub.webhookUrl}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-400 mb-2">Event Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {sub.eventTypes.map((eventType) => (
                      <Badge key={eventType} className="bg-slate-600 text-gray-300">
                        {eventType}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Events processed: <span className="text-purple-400 font-bold">{sub.eventsProcessed}</span>
                  </span>
                  <span className="text-gray-400">
                    Last event: <span className="text-cyan-400 font-bold">{sub.lastEvent.toLocaleTimeString()}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Webhook Events</CardTitle>
          <CardDescription>Last 4 events routed to ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-white">{event.eventType}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {event.timestamp.toLocaleTimeString()} • {event.latency}ms latency
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300">{event.status}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Routed to:</span>
                  <div className="flex gap-2">
                    {event.targets.map((target) => (
                      <div key={target} className="flex items-center gap-1 bg-slate-600 px-2 py-1 rounded">
                        {getTargetIcon(target)}
                        <span className="text-gray-300 text-xs">{getTargetLabel(target)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Info */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Webhook Automation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">📡 HybridCast Integration</p>
              <p className="text-gray-400 text-sm">
                Grant links and donation opportunities in emergency broadcasts. Real-time event routing.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🎙️ SQUADD Integration</p>
              <p className="text-gray-400 text-sm">
                Funding campaigns and listener tip opportunities. Monetization options for radio streams.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">📅 Content Calendar</p>
              <p className="text-gray-400 text-sm">
                Link campaigns to content. Monetization options and grant opportunities for creators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
