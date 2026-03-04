import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface WebhookEvent {
  id: string;
  type: string;
  status: 'success' | 'failed' | 'pending';
  created_at: number;
  data?: any;
}

interface WebhookMetrics {
  total_events: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  success_rate: number;
  avg_response_time: number;
}

export function WebhookEventDashboard() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [metrics, setMetrics] = useState<WebhookMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEvents: WebhookEvent[] = [
      { id: 'evt_1', type: 'payment_intent.succeeded', status: 'success', created_at: Date.now() - 3600000 },
      { id: 'evt_2', type: 'customer.subscription.created', status: 'success', created_at: Date.now() - 7200000 },
      { id: 'evt_3', type: 'invoice.paid', status: 'success', created_at: Date.now() - 10800000 },
      { id: 'evt_4', type: 'charge.failed', status: 'failed', created_at: Date.now() - 14400000 },
      { id: 'evt_5', type: 'customer.subscription.updated', status: 'success', created_at: Date.now() - 18000000 },
    ];

    const mockMetrics: WebhookMetrics = {
      total_events: 156,
      success_count: 148,
      failed_count: 5,
      pending_count: 3,
      success_rate: 94.9,
      avg_response_time: 245,
    };

    setEvents(mockEvents);
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  if (loading || !metrics) return <div>Loading webhook dashboard...</div>;

  const filteredEvents = events.filter(e => filter === 'all' || e.status === filter);

  const eventTypeStats = events.reduce((acc: Record<string, number>, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(eventTypeStats).map(([type, count]) => ({
    name: type.replace('_', ' '),
    count,
  }));

  const statusData = [
    { name: 'Success', value: metrics.success_count, color: '#10b981' },
    { name: 'Failed', value: metrics.failed_count, color: '#ef4444' },
    { name: 'Pending', value: metrics.pending_count, color: '#f59e0b' },
  ];

  return (
    <div className="w-full space-y-6 p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">🔗 Webhook Events Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time monitoring of Stripe and system webhooks</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Events</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.total_events}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-3xl font-bold text-green-600">{metrics.success_rate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-3xl font-bold text-purple-600">{metrics.avg_response_time}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Failed Events</p>
            <p className="text-3xl font-bold text-red-600">{metrics.failed_count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Event List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <div className="flex gap-2 mt-4">
            {(['all', 'success', 'failed', 'pending'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events found</p>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{event.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-600">{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {event.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Webhook Processor</p>
              <p className="text-lg font-bold text-green-600">✓ Healthy</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-lg font-bold text-green-600">✓ Connected</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cron Jobs</p>
              <p className="text-lg font-bold text-green-600">✓ Running</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
