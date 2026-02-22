/**
 * Panelist Performance Analytics Dashboard
 * Engagement metrics, response tracking, and attendance predictions
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Mail, CheckCircle, AlertCircle, Download, Filter } from 'lucide-react';

interface PanelistMetrics {
  panelistId: string;
  name: string;
  role: string;
  emailSent: boolean;
  emailOpenedAt?: Date;
  emailOpenRate: number;
  checklistStarted: boolean;
  checklistCompletedAt?: Date;
  checklistCompletion: number;
  responseTime: number; // minutes
  status: 'confirmed' | 'declined' | 'pending';
  attendancePrediction: number; // 0-100
  engagementScore: number; // 0-100
}

interface EventAnalytics {
  eventId: string;
  eventName: string;
  totalPanelists: number;
  emailOpenRate: number;
  checklistCompletionRate: number;
  responseRate: number;
  averageResponseTime: number;
  predictedAttendance: number;
  overallEngagement: number;
}

export const PanelistAnalyticsDashboard: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState('un-wcs-2026');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'engagement' | 'response' | 'name'>('engagement');

  // Mock data - replace with real data from API
  const mockPanelists: PanelistMetrics[] = [
    {
      panelistId: 'p1',
      name: 'Dr. Jane Smith',
      role: 'Moderator',
      emailSent: true,
      emailOpenRate: 100,
      checklistStarted: true,
      checklistCompletion: 100,
      responseTime: 2,
      status: 'confirmed',
      attendancePrediction: 95,
      engagementScore: 98,
    },
    {
      panelistId: 'p2',
      name: 'Prof. John Doe',
      role: 'Speaker',
      emailSent: true,
      emailOpenRate: 100,
      checklistStarted: true,
      checklistCompletion: 75,
      responseTime: 5,
      status: 'confirmed',
      attendancePrediction: 88,
      engagementScore: 85,
    },
    {
      panelistId: 'p3',
      name: 'Sarah Johnson',
      role: 'Panelist',
      emailSent: true,
      emailOpenRate: 50,
      checklistStarted: false,
      checklistCompletion: 0,
      responseTime: 120,
      status: 'pending',
      attendancePrediction: 45,
      engagementScore: 35,
    },
    {
      panelistId: 'p4',
      name: 'Michael Chen',
      role: 'Panelist',
      emailSent: true,
      emailOpenRate: 100,
      checklistStarted: true,
      checklistCompletion: 90,
      responseTime: 3,
      status: 'confirmed',
      attendancePrediction: 92,
      engagementScore: 94,
    },
    {
      panelistId: 'p5',
      name: 'Emily Rodriguez',
      role: 'Panelist',
      emailSent: true,
      emailOpenRate: 0,
      checklistStarted: false,
      checklistCompletion: 0,
      responseTime: 999,
      status: 'declined',
      attendancePrediction: 5,
      engagementScore: 10,
    },
  ];

  const mockEventAnalytics: EventAnalytics = {
    eventId: 'un-wcs-2026',
    eventName: 'UN WCS Parallel Event 2026',
    totalPanelists: mockPanelists.length,
    emailOpenRate: 70,
    checklistCompletionRate: 65,
    responseRate: 80,
    averageResponseTime: 26,
    predictedAttendance: 75,
    overallEngagement: 64,
  };

  // Filter and sort panelists
  const filteredPanelists = useMemo(() => {
    let filtered = mockPanelists;

    if (filterRole) {
      filtered = filtered.filter((p) => p.role === filterRole);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagementScore - a.engagementScore;
        case 'response':
          return a.responseTime - b.responseTime;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filterRole, sortBy]);

  // Prepare chart data
  const engagementData = filteredPanelists.map((p) => ({
    name: p.name.split(' ')[0],
    engagement: p.engagementScore,
    attendance: p.attendancePrediction,
  }));

  const responseTimeData = filteredPanelists.map((p) => ({
    name: p.name.split(' ')[0],
    responseTime: Math.min(p.responseTime, 120), // Cap at 120 for visualization
    engagement: p.engagementScore,
  }));

  const statusDistribution = [
    { name: 'Confirmed', value: mockPanelists.filter((p) => p.status === 'confirmed').length, fill: '#10b981' },
    { name: 'Pending', value: mockPanelists.filter((p) => p.status === 'pending').length, fill: '#f59e0b' },
    { name: 'Declined', value: mockPanelists.filter((p) => p.status === 'declined').length, fill: '#ef4444' },
  ];

  const roleDistribution = [
    { name: 'Moderator', value: mockPanelists.filter((p) => p.role === 'Moderator').length, fill: '#667eea' },
    { name: 'Speaker', value: mockPanelists.filter((p) => p.role === 'Speaker').length, fill: '#764ba2' },
    { name: 'Panelist', value: mockPanelists.filter((p) => p.role === 'Panelist').length, fill: '#f093fb' },
  ];

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'declined':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Panelist Performance Analytics
          </h2>
          <p className="text-gray-400 text-sm mt-1">{mockEventAnalytics.eventName}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Email Open Rate</p>
              <p className="text-3xl font-bold text-blue-400">{mockEventAnalytics.emailOpenRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Checklist Completion</p>
              <p className="text-3xl font-bold text-purple-400">{mockEventAnalytics.checklistCompletionRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Response Rate</p>
              <p className="text-3xl font-bold text-green-400">{mockEventAnalytics.responseRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Predicted Attendance</p>
              <p className="text-3xl font-bold text-orange-400">{mockEventAnalytics.predictedAttendance}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement vs Attendance */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Engagement & Attendance Prediction</CardTitle>
            <CardDescription>Score correlation for each panelist</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Bar dataKey="engagement" fill="#667eea" name="Engagement Score" />
                <Bar dataKey="attendance" fill="#10b981" name="Attendance Prediction" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Response Status Distribution</CardTitle>
            <CardDescription>Breakdown of panelist responses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Response Time vs Engagement</CardTitle>
            <CardDescription>Time to respond correlation with engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="responseTime" name="Response Time (min)" stroke="#94a3b8" />
                <YAxis dataKey="engagement" name="Engagement Score" stroke="#94a3b8" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b' }} />
                <Scatter name="Panelists" data={responseTimeData} fill="#667eea" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Panelist Role Distribution</CardTitle>
            <CardDescription>Breakdown by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Panelist Details Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Panelist Details</CardTitle>
              <CardDescription>Individual performance metrics</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-700 text-white rounded px-3 py-1 text-sm"
              >
                <option value="engagement">Sort by Engagement</option>
                <option value="response">Sort by Response Time</option>
                <option value="name">Sort by Name</option>
              </select>
              <select
                value={filterRole || ''}
                onChange={(e) => setFilterRole(e.target.value || null)}
                className="bg-slate-700 text-white rounded px-3 py-1 text-sm"
              >
                <option value="">All Roles</option>
                <option value="Moderator">Moderator</option>
                <option value="Speaker">Speaker</option>
                <option value="Panelist">Panelist</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400">Role</th>
                  <th className="text-center py-3 px-4 text-gray-400">Email Open</th>
                  <th className="text-center py-3 px-4 text-gray-400">Checklist</th>
                  <th className="text-center py-3 px-4 text-gray-400">Response Time</th>
                  <th className="text-center py-3 px-4 text-gray-400">Status</th>
                  <th className="text-center py-3 px-4 text-gray-400">Engagement</th>
                  <th className="text-center py-3 px-4 text-gray-400">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredPanelists.map((panelist) => (
                  <tr key={panelist.panelistId} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white">{panelist.name}</td>
                    <td className="py-3 px-4 text-gray-400">{panelist.role}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={panelist.emailOpenRate > 50 ? 'text-green-400' : 'text-red-400'}>
                        {panelist.emailOpenRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={panelist.checklistCompletion > 50 ? 'text-green-400' : 'text-red-400'}>
                        {panelist.checklistCompletion}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {panelist.responseTime < 120 ? `${panelist.responseTime}m` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center flex items-center justify-center gap-2">
                      {getStatusIcon(panelist.status)}
                      <span className="capitalize text-gray-300">{panelist.status}</span>
                    </td>
                    <td className={`py-3 px-4 text-center font-bold ${getEngagementColor(panelist.engagementScore)}`}>
                      {panelist.engagementScore}
                    </td>
                    <td className="py-3 px-4 text-center text-orange-400 font-bold">
                      {panelist.attendancePrediction}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Event Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Total Panelists</p>
            <p className="text-2xl font-bold text-white">{mockEventAnalytics.totalPanelists}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Response Time</p>
            <p className="text-2xl font-bold text-white">{mockEventAnalytics.averageResponseTime}m</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Overall Engagement</p>
            <p className="text-2xl font-bold text-blue-400">{mockEventAnalytics.overallEngagement}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
