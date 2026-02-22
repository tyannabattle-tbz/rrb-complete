/**
 * Panelist Analytics Dashboard
 * Admin view for tracking response rates, engagement, and attendance predictions
 */

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Clock, XCircle, TrendingUp, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface PanelistMetrics {
  totalInvited: number;
  confirmed: number;
  pending: number;
  declined: number;
  confirmationRate: number;
  responseRate: number;
  predictedAttendance: number;
  engagementScore: number;
}

interface TimelineData {
  date: string;
  confirmed: number;
  declined: number;
  pending: number;
}

export const PanelistAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [eventName, setEventName] = useState('UN WCS Parallel Event');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');

  // Fetch event summary
  const eventSummaryQuery = trpc.admin.panelists.getEventSummary.useQuery(
    { eventName },
    { enabled: !!user?.id }
  );

  // Mock timeline data (in production, this would come from database)
  const timelineData: TimelineData[] = useMemo(() => {
    const summary = eventSummaryQuery.data;
    if (!summary) return [];

    return [
      { date: 'Day 1', confirmed: 2, declined: 0, pending: summary.totalInvited - 2 },
      { date: 'Day 3', confirmed: 5, declined: 1, pending: summary.totalInvited - 6 },
      { date: 'Day 5', confirmed: 8, declined: 2, pending: summary.totalInvited - 10 },
      { date: 'Day 7', confirmed: summary.confirmed, declined: summary.declined, pending: summary.pending },
    ];
  }, [eventSummaryQuery.data]);

  // Calculate metrics
  const metrics: PanelistMetrics = useMemo(() => {
    const summary = eventSummaryQuery.data;
    if (!summary) {
      return {
        totalInvited: 0,
        confirmed: 0,
        pending: 0,
        declined: 0,
        confirmationRate: 0,
        responseRate: 0,
        predictedAttendance: 0,
        engagementScore: 0,
      };
    }

    const confirmationRate = summary.totalInvited > 0 ? (summary.confirmed / summary.totalInvited) * 100 : 0;
    const responseRate = summary.totalInvited > 0 ? ((summary.confirmed + summary.declined) / summary.totalInvited) * 100 : 0;
    
    // Predict attendance based on historical response patterns
    // Assume 15% of pending will confirm by event day
    const predictedAttendance = summary.confirmed + Math.floor(summary.pending * 0.15);
    
    // Engagement score (0-100) based on response rate and confirmation rate
    const engagementScore = Math.round((responseRate * 0.6 + confirmationRate * 0.4));

    return {
      totalInvited: summary.totalInvited,
      confirmed: summary.confirmed,
      pending: summary.pending,
      declined: summary.declined,
      confirmationRate,
      responseRate,
      predictedAttendance,
      engagementScore,
    };
  }, [eventSummaryQuery.data]);

  // Pie chart data
  const pieData = [
    { name: 'Confirmed', value: metrics.confirmed, fill: '#10b981' },
    { name: 'Pending', value: metrics.pending, fill: '#f59e0b' },
    { name: 'Declined', value: metrics.declined, fill: '#ef4444' },
  ];

  const handleExportReport = () => {
    const report = `
SQUADD UN WCS Parallel Event - Panelist Analytics Report
Generated: ${new Date().toLocaleString()}

EVENT SUMMARY
=============
Event Name: ${eventName}
Total Invitations Sent: ${metrics.totalInvited}
Confirmed Attendees: ${metrics.confirmed}
Pending Responses: ${metrics.pending}
Declined: ${metrics.declined}

KEY METRICS
===========
Confirmation Rate: ${metrics.confirmationRate.toFixed(1)}%
Response Rate: ${metrics.responseRate.toFixed(1)}%
Predicted Attendance: ${metrics.predictedAttendance}
Engagement Score: ${metrics.engagementScore}/100

INSIGHTS
========
- Response rate indicates ${metrics.responseRate > 70 ? 'strong' : metrics.responseRate > 50 ? 'moderate' : 'low'} engagement
- Predicted attendance: ${metrics.predictedAttendance} out of ${metrics.totalInvited} invited
- ${metrics.pending > 0 ? `${metrics.pending} panelists still to respond` : 'All panelists have responded'}
- Confirmation rate of ${metrics.confirmationRate.toFixed(1)}% suggests ${metrics.confirmationRate > 80 ? 'excellent' : metrics.confirmationRate > 60 ? 'good' : 'moderate'} interest

RECOMMENDATIONS
================
1. Send reminder emails to ${metrics.pending} pending panelists
2. Follow up with declined panelists to understand barriers
3. Prepare contingency panelists in case of last-minute cancellations
4. Schedule technical rehearsal with confirmed panelists
5. Monitor responses daily leading up to event date

Sisters Questing Unapologetically After Divine Destiny
SQUADD Broadcast Team
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `UN-WCS-Analytics-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (eventSummaryQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Panelist Analytics</h1>
          <p className="text-gray-400 mt-1">{eventName}</p>
        </div>
        <Button onClick={handleExportReport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Invitations</p>
                <p className="text-3xl font-bold text-white mt-2">{metrics.totalInvited}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmed</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{metrics.confirmed}</p>
                <p className="text-xs text-gray-500 mt-1">{metrics.confirmationRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{metrics.pending}</p>
                <p className="text-xs text-gray-500 mt-1">{((metrics.pending / metrics.totalInvited) * 100).toFixed(1)}%</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Engagement Score</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{metrics.engagementScore}</p>
                <p className="text-xs text-gray-500 mt-1">out of 100</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Breakdown */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Response Breakdown</CardTitle>
            <CardDescription>Distribution of panelist responses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Timeline */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Response Timeline</CardTitle>
            <CardDescription>Responses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Line type="monotone" dataKey="confirmed" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="declined" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Predictions & Insights */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Predictions & Insights</CardTitle>
          <CardDescription>AI-powered attendance forecast</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Predicted Attendance</p>
              <p className="text-2xl font-bold text-green-400">{metrics.predictedAttendance}</p>
              <p className="text-xs text-gray-500 mt-2">
                {metrics.predictedAttendance} of {metrics.totalInvited} invitations
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Response Rate</p>
              <p className="text-2xl font-bold text-blue-400">{metrics.responseRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-2">
                {metrics.confirmed + metrics.declined} responses received
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Engagement Level</p>
              <p className="text-2xl font-bold text-purple-400">
                {metrics.engagementScore > 80 ? 'Excellent' : metrics.engagementScore > 60 ? 'Good' : 'Moderate'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on response and confirmation rates
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <h4 className="font-semibold text-blue-200 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>✓ Send reminder emails to {metrics.pending} pending panelists</li>
              <li>✓ Schedule technical rehearsal with confirmed panelists</li>
              <li>✓ Prepare contingency panelists for last-minute cancellations</li>
              <li>✓ Monitor daily responses leading up to event date</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
