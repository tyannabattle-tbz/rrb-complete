import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Clock, Target } from 'lucide-react';

interface PerformanceMetrics {
  totalListeners: number;
  peakListeners: number;
  averageEngagement: number;
  totalRevenue: number;
  topChannel: string;
  performanceTime: number;
  conversionRate: number;
}

interface ListenerData {
  time: string;
  listeners: number;
  engagement: number;
}

interface ChannelData {
  name: string;
  listeners: number;
  revenue: number;
}

export const PerformanceAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalListeners: 2847,
    peakListeners: 3542,
    averageEngagement: 87,
    totalRevenue: 1240.50,
    topChannel: 'Soul & R&B',
    performanceTime: 3600,
    conversionRate: 12.5,
  });

  const [listenerData, setListenerData] = useState<ListenerData[]>([
    { time: '8:00 PM', listeners: 1200, engagement: 75 },
    { time: '8:15 PM', listeners: 1850, engagement: 82 },
    { time: '8:30 PM', listeners: 2400, engagement: 88 },
    { time: '8:45 PM', listeners: 2847, engagement: 91 },
    { time: '9:00 PM', listeners: 3200, engagement: 89 },
    { time: '9:15 PM', listeners: 3542, engagement: 85 },
    { time: '9:30 PM', listeners: 3100, engagement: 83 },
  ]);

  const [channelData, setChannelData] = useState<ChannelData[]>([
    { name: 'Soul & R&B', listeners: 1200, revenue: 450 },
    { name: 'Jazz Fusion', listeners: 650, revenue: 280 },
    { name: '432 Hz Healing', listeners: 580, revenue: 320 },
    { name: 'Gospel', listeners: 420, revenue: 190 },
  ]);

  const [revenueBreakdown, setRevenueBreakdown] = useState([
    { name: 'Tier Subscriptions', value: 65, color: '#8B5CF6' },
    { name: 'Donations', value: 20, color: '#EC4899' },
    { name: 'Sponsorships', value: 10, color: '#06B6D4' },
    { name: 'Merchandise', value: 5, color: '#F59E0B' },
  ]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalListeners: Math.max(1000, prev.totalListeners + Math.floor(Math.random() * 200 - 100)),
        peakListeners: Math.max(prev.totalListeners, prev.peakListeners),
        averageEngagement: Math.min(100, Math.max(60, prev.averageEngagement + Math.floor(Math.random() * 10 - 5))),
        totalRevenue: prev.totalRevenue + Math.random() * 50,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Activity className="w-8 h-8 text-purple-400" />
          Performance Analytics
        </h2>
        <div className="text-sm text-purple-300">Live • Real-time Updates</div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listeners */}
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/60 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 text-sm font-semibold">Total Listeners</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.totalListeners.toLocaleString()}</div>
          <div className="text-xs text-purple-300 mt-1">Peak: {metrics.peakListeners.toLocaleString()}</div>
        </div>

        {/* Average Engagement */}
        <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-4 hover:border-pink-500/60 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-pink-300 text-sm font-semibold">Avg Engagement</span>
            <TrendingUp className="w-5 h-5 text-pink-400" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.averageEngagement}%</div>
          <div className="text-xs text-pink-300 mt-1">High engagement rate</div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/60 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-300 text-sm font-semibold">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="text-xs text-cyan-300 mt-1">This session</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-4 hover:border-amber-500/60 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-300 text-sm font-semibold">Conversion Rate</span>
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.conversionRate}%</div>
          <div className="text-xs text-amber-300 mt-1">Tier upgrades</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listener Trend */}
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Listener Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={listenerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #8B5CF6' }}
                labelStyle={{ color: '#E9D5FF' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="listeners" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#EC4899" 
                strokeWidth={2}
                dot={{ fill: '#EC4899', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Performance */}
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Channel Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #06B6D4' }}
                labelStyle={{ color: '#CFFAFE' }}
              />
              <Legend />
              <Bar dataKey="listeners" fill="#06B6D4" />
              <Bar dataKey="revenue" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Breakdown & Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={revenueBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8B5CF6"
                dataKey="value"
              >
                {revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #EC4899' }}
                labelStyle={{ color: '#F472B6' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Summary */}
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <span className="text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Performance Duration
              </span>
              <span className="text-white font-semibold">{formatTime(metrics.performanceTime)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <span className="text-purple-300">Top Channel</span>
              <span className="text-white font-semibold">{metrics.topChannel}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <span className="text-pink-300">Avg Listeners/Min</span>
              <span className="text-white font-semibold">{Math.round(metrics.totalListeners * 0.85)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <span className="text-cyan-300">Revenue/Hour</span>
              <span className="text-white font-semibold">{formatCurrency((metrics.totalRevenue / metrics.performanceTime) * 3600)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-600">
            <div className="text-xs text-slate-400">
              ✨ Excellent performance! Your engagement rate is 23% above average.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
