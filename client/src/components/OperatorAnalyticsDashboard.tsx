import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Phone, Clock, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallMetrics {
  totalCalls: number;
  completedCalls: number;
  abandonedCalls: number;
  averageDuration: number;
  completionRate: number;
}

interface HourlyData {
  hour: string;
  calls: number;
  completed: number;
  abandoned: number;
}

interface SentimentData {
  sentiment: string;
  count: number;
  percentage: number;
}

interface FrequencyData {
  frequency: number;
  listeners: number;
  duration: number;
}

export function OperatorAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedMetric, setSelectedMetric] = useState<'calls' | 'sentiment' | 'frequency'>('calls');

  // Mock data - in production, this would come from tRPC
  const callMetrics: CallMetrics = {
    totalCalls: 156,
    completedCalls: 142,
    abandonedCalls: 14,
    averageDuration: 12.4,
    completionRate: 91,
  };

  const hourlyData: HourlyData[] = [
    { hour: '6 AM', calls: 8, completed: 7, abandoned: 1 },
    { hour: '7 AM', calls: 12, completed: 11, abandoned: 1 },
    { hour: '8 AM', calls: 18, completed: 17, abandoned: 1 },
    { hour: '9 AM', calls: 24, completed: 22, abandoned: 2 },
    { hour: '10 AM', calls: 20, completed: 19, abandoned: 1 },
    { hour: '11 AM', calls: 16, completed: 15, abandoned: 1 },
    { hour: '12 PM', calls: 14, completed: 13, abandoned: 1 },
    { hour: '1 PM', calls: 10, completed: 9, abandoned: 1 },
    { hour: '2 PM', calls: 14, completed: 14, abandoned: 0 },
  ];

  const sentimentData: SentimentData[] = [
    { sentiment: 'Positive', count: 98, percentage: 69 },
    { sentiment: 'Neutral', count: 35, percentage: 25 },
    { sentiment: 'Negative', count: 9, percentage: 6 },
  ];

  const frequencyData: FrequencyData[] = [
    { frequency: 432, listeners: 1245, duration: 45 },
    { frequency: 528, listeners: 987, duration: 38 },
    { frequency: 639, listeners: 456, duration: 28 },
    { frequency: 741, listeners: 234, duration: 15 },
    { frequency: 852, listeners: 178, duration: 12 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const handleExport = () => {
    const csv = `Call Analytics Report - ${new Date().toLocaleDateString()}\n\n`;
    console.log('Exporting analytics...');
    // In production, generate and download CSV
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Operator Analytics</h1>
          </div>
          <Button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-500/30 text-white hover:bg-blue-500/50'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-6 bg-slate-800/50 border-b border-slate-700">
        <div className="text-center p-3 bg-slate-700 rounded">
          <p className="text-xs text-gray-400">Total Calls</p>
          <p className="text-2xl font-bold text-blue-400">{callMetrics.totalCalls}</p>
        </div>
        <div className="text-center p-3 bg-slate-700 rounded">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-400">{callMetrics.completedCalls}</p>
        </div>
        <div className="text-center p-3 bg-slate-700 rounded">
          <p className="text-xs text-gray-400">Abandoned</p>
          <p className="text-2xl font-bold text-red-400">{callMetrics.abandonedCalls}</p>
        </div>
        <div className="text-center p-3 bg-slate-700 rounded">
          <p className="text-xs text-gray-400">Avg Duration</p>
          <p className="text-2xl font-bold text-purple-400">{callMetrics.averageDuration}m</p>
        </div>
        <div className="text-center p-3 bg-slate-700 rounded">
          <p className="text-xs text-gray-400">Completion Rate</p>
          <p className="text-2xl font-bold text-yellow-400">{callMetrics.completionRate}%</p>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 p-6 border-b border-slate-700 bg-slate-800/30">
        {(['calls', 'sentiment', 'frequency'] as const).map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              selectedMetric === metric
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {metric === 'calls' ? '📞 Call Trends' : metric === 'sentiment' ? '😊 Sentiment' : '🎵 Frequencies'}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="p-6">
        {selectedMetric === 'calls' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Calls by Hour</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" />
                  <Bar dataKey="abandoned" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Call Duration Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedMetric === 'sentiment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sentiment, percentage }) => `${sentiment} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {sentimentData.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-700 rounded text-center">
                  <p className="text-sm text-gray-400">{item.sentiment}</p>
                  <p className="text-2xl font-bold" style={{ color: COLORS[idx] }}>
                    {item.count}
                  </p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMetric === 'frequency' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Listener Distribution by Frequency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="frequency" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="listeners" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {frequencyData.map((freq, idx) => (
                <div key={idx} className="p-4 bg-slate-700 rounded">
                  <p className="text-sm text-gray-400">{freq.frequency} Hz</p>
                  <p className="text-xl font-bold text-purple-400">{freq.listeners}</p>
                  <p className="text-xs text-gray-500">{freq.duration}m avg</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 p-4 border-t border-slate-700 text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()} | Data refreshes every 30 seconds
      </div>
    </div>
  );
}
