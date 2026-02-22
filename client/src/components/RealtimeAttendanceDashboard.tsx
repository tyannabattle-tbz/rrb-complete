/**
 * Real-Time Attendance Dashboard Component
 * Live updates of panelist responses and engagement metrics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, TrendingUp, Activity, Zap } from 'lucide-react';

interface AttendanceUpdate {
  panelistId: string;
  panelistName: string;
  status: 'confirmed' | 'declined' | 'pending';
  timestamp: number;
  role: string;
}

interface RealtimeMetrics {
  totalInvited: number;
  confirmed: number;
  declined: number;
  pending: number;
  confirmationRate: number;
  responseRate: number;
  lastUpdate: number;
}

interface RealtimeAttendanceDashboardProps {
  eventName: string;
  totalInvited: number;
  autoRefreshInterval?: number;
}

export const RealtimeAttendanceDashboard: React.FC<RealtimeAttendanceDashboardProps> = ({
  eventName,
  totalInvited,
  autoRefreshInterval = 5000,
}) => {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalInvited,
    confirmed: 0,
    declined: 0,
    pending: totalInvited,
    confirmationRate: 0,
    responseRate: 0,
    lastUpdate: Date.now(),
  });

  const [recentUpdates, setRecentUpdates] = useState<AttendanceUpdate[]>([]);
  const [trendData, setTrendData] = useState<Array<{ time: string; confirmed: number; declined: number }>>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics((prev) => {
        // Simulate random updates
        if (Math.random() > 0.7 && prev.pending > 0) {
          const newConfirmed = prev.confirmed + (Math.random() > 0.3 ? 1 : 0);
          const newDeclined = prev.declined + (Math.random() > 0.8 ? 1 : 0);
          const newPending = totalInvited - newConfirmed - newDeclined;

          const updated = {
            ...prev,
            confirmed: newConfirmed,
            declined: newDeclined,
            pending: newPending,
            confirmationRate: (newConfirmed / totalInvited) * 100,
            responseRate: ((newConfirmed + newDeclined) / totalInvited) * 100,
            lastUpdate: Date.now(),
          };

          // Add to recent updates
          const newUpdate: AttendanceUpdate = {
            panelistId: `panelist-${Date.now()}`,
            panelistName: `Panelist ${newConfirmed + newDeclined}`,
            status: Math.random() > 0.3 ? 'confirmed' : 'declined',
            timestamp: Date.now(),
            role: ['Moderator', 'Speaker', 'Panelist'][Math.floor(Math.random() * 3)],
          };

          setRecentUpdates((prev) => [newUpdate, ...prev.slice(0, 9)]);

          // Update trend
          setTrendData((prev) => [
            ...prev.slice(-11),
            {
              time: new Date().toLocaleTimeString(),
              confirmed: newConfirmed,
              declined: newDeclined,
            },
          ]);

          return updated;
        }
        return prev;
      });
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isLive, totalInvited, autoRefreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'declined':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-500 animate-pulse" />
            Live Attendance Tracking
          </h2>
          <p className="text-gray-400 text-sm mt-1">{eventName}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">LIVE</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Confirmed</p>
              <p className="text-3xl font-bold text-green-400">{metrics.confirmed}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.confirmationRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Declined</p>
              <p className="text-3xl font-bold text-red-400">{metrics.declined}</p>
              <p className="text-xs text-gray-500 mt-1">{((metrics.declined / totalInvited) * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Pending</p>
              <p className="text-3xl font-bold text-yellow-400">{metrics.pending}</p>
              <p className="text-xs text-gray-500 mt-1">{((metrics.pending / totalInvited) * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Response Rate</p>
              <p className="text-3xl font-bold text-blue-400">{metrics.responseRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.confirmed + metrics.declined} responses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Response Trend
            </CardTitle>
            <CardDescription>Real-time response accumulation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeclined" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="confirmed"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorConfirmed)"
                  name="Confirmed"
                />
                <Area
                  type="monotone"
                  dataKey="declined"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorDeclined)"
                  name="Declined"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 10 responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentUpdates.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Waiting for responses...</p>
            ) : (
              recentUpdates.map((update, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(update.status)}
                    <div>
                      <p className="text-white font-medium">{update.panelistName}</p>
                      <p className="text-xs text-gray-400">{update.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium capitalize ${getStatusColor(update.status)}`}>
                      {update.status}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(update.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Status */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            isLive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
          }`}
        >
          {isLive ? '⏸ Pause Live Updates' : '▶ Resume Live Updates'}
        </button>
      </div>
    </div>
  );
};
