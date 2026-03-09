import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart, PieChart, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ReportData {
  period: string;
  qumusDecisions: number;
  hybridCastBroadcasts: number;
  rockinBoogieListeners: number;
  avgEngagement: number;
  systemUptime: number;
}

interface PolicyDecision {
  policy: string;
  count: number;
  avgTime: number;
  successRate: number;
}

export default function AnalyticsReportingDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const { data: platformStats } = trpc.ecosystemIntegration.getPlatformStats.useQuery(undefined, { refetchInterval: 30000 });
  const currentListeners = platformStats?.activeListeners ?? 0;

  const [reportData] = useState<ReportData[]>([
    {
      period: 'Mon',
      qumusDecisions: 0,
      hybridCastBroadcasts: 0,
      rockinBoogieListeners: 0,
      avgEngagement: 0,
      systemUptime: 99.98,
    },
    {
      period: 'Tue',
      qumusDecisions: 0,
      hybridCastBroadcasts: 0,
      rockinBoogieListeners: 0,
      avgEngagement: 0,
      systemUptime: 99.97,
    },
    {
      period: 'Wed',
      qumusDecisions: 0,
      hybridCastBroadcasts: 0,
      rockinBoogieListeners: 0,
      avgEngagement: 91,
      systemUptime: 99.99,
    },
    {
      period: 'Thu',
      qumusDecisions: 1523,
      hybridCastBroadcasts: 35,
      rockinBoogieListeners: 0,
      avgEngagement: 88,
      systemUptime: 99.96,
    },
    {
      period: 'Fri',
      qumusDecisions: 1678,
      hybridCastBroadcasts: 52,
      rockinBoogieListeners: 0,
      avgEngagement: 93,
      systemUptime: 99.98,
    },
  ]);

  const [policyDecisions] = useState<PolicyDecision[]>([
    { policy: 'Content Policy', count: 4521, avgTime: 23, successRate: 99.8 },
    { policy: 'User Policy', count: 3892, avgTime: 18, successRate: 99.9 },
    { policy: 'Payment Policy', count: 2156, avgTime: 42, successRate: 99.7 },
    { policy: 'Security Policy', count: 1834, avgTime: 15, successRate: 99.95 },
    { policy: 'Compliance Policy', count: 1245, avgTime: 31, successRate: 99.85 },
  ]);

  const maxDecisions = Math.max(...reportData.map((d) => d.qumusDecisions));
  const maxListeners = Math.max(...reportData.map((d) => d.rockinBoogieListeners));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Analytics & Reporting
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                QUMUS decisions, HybridCast broadcasts, and Rockin' Rockin' Boogie engagement
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">QUMUS Decisions</p>
            <p className="text-2xl font-bold text-blue-600">7,286</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 12% vs last week</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">HybridCast Broadcasts</p>
            <p className="text-2xl font-bold text-purple-600">190</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 8% vs last week</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Listeners</p>
            <p className="text-2xl font-bold text-orange-600">257.3K</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 15% vs last week</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Engagement</p>
            <p className="text-2xl font-bold text-green-600">89.6%</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 3% vs last week</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* QUMUS Decisions Chart */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              QUMUS Autonomous Decisions
            </h2>
            <div className="space-y-4">
              {reportData.map((data) => (
                <div key={data.period}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{data.period}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{data.qumusDecisions}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(data.qumusDecisions / maxDecisions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Uptime */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">System Uptime</h2>
            <div className="space-y-3">
              {reportData.map((data) => (
                <div key={data.period}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{data.period}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{data.systemUptime}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${data.systemUptime}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rockin' Rockin' Boogie Listeners */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Rockin' Rockin' Boogie Listeners
            </h2>
            <div className="space-y-4">
              {reportData.map((data) => (
                <div key={data.period}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{data.period}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {(data.rockinBoogieListeners / 1000).toFixed(1)}K
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(data.rockinBoogieListeners / maxListeners) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Engagement Rate */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Engagement Rate</h2>
            <div className="space-y-3">
              {reportData.map((data) => (
                <div key={data.period}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{data.period}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{data.avgEngagement}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${data.avgEngagement}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Policy Decision Breakdown */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6 mt-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            QUMUS Policy Decision Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-400 font-semibold">Policy</th>
                  <th className="text-right py-2 px-2 text-slate-600 dark:text-slate-400 font-semibold">Decisions</th>
                  <th className="text-right py-2 px-2 text-slate-600 dark:text-slate-400 font-semibold">Avg Time</th>
                  <th className="text-right py-2 px-2 text-slate-600 dark:text-slate-400 font-semibold">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {policyDecisions.map((policy) => (
                  <tr key={policy.policy} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="py-3 px-2 text-slate-900 dark:text-white font-medium">{policy.policy}</td>
                    <td className="text-right py-3 px-2 text-slate-900 dark:text-white font-bold">
                      {policy.count.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-2 text-slate-600 dark:text-slate-400">{policy.avgTime}ms</td>
                    <td className="text-right py-3 px-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-semibold">
                        {policy.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
