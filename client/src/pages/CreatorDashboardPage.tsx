import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  TrendingUp,
  Users,
  Play,
  DollarSign,
  Share2,
  Heart,
  MessageCircle,
  Download,
} from 'lucide-react';

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30');

  const { data: stats } = trpc.creator.getStats.useQuery({
    userId: user?.id || '',
    days: parseInt(timeRange),
  });

  const { data: demographics } = trpc.creator.getAudienceDemographics.useQuery({
    userId: user?.id || '',
  });

  const { data: contentPerformance } = trpc.creator.getContentPerformance.useQuery({
    userId: user?.id || '',
  });

  const { data: revenue } = trpc.creator.getRevenueTracking.useQuery({
    userId: user?.id || '',
    days: parseInt(timeRange),
  });

  const { data: growth } = trpc.creator.getGrowthMetrics.useQuery({
    userId: user?.id || '',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">Please log in to view your creator dashboard</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Creator Dashboard</h1>
            <p className="text-slate-400 mt-1">Track your content performance and earnings</p>
          </div>
          <div className="flex gap-2">
            {['7', '30', '90'].map((days) => (
              <Button
                key={days}
                onClick={() => setTimeRange(days)}
                className={
                  timeRange === days
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }
              >
                {days === '7' ? 'Last Week' : days === '30' ? 'Last Month' : 'Last 3 Months'}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Plays</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.totalPlays || 0}
                </p>
                {growth && (
                  <p className="text-sm text-green-400 mt-2">
                    +{growth.playsGrowth}% from last period
                  </p>
                )}
              </div>
              <Play className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Unique Listeners</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.uniqueListeners || 0}
                </p>
                {growth && (
                  <p className="text-sm text-green-400 mt-2">
                    +{growth.listenersGrowth}% from last period
                  </p>
                )}
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Engagement Rate</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.avgEngagementRate.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {(stats?.totalLikes || 0) + (stats?.totalShares || 0)} interactions
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Estimated Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  ${revenue?.totalRevenue || 0}
                </p>
                <p className="text-sm text-amber-400 mt-2">
                  ${revenue?.estimatedMonthlyRevenue || 0}/month
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-amber-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Engagement Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Engagement Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Likes', value: stats?.totalLikes || 0, icon: Heart, color: 'text-red-500' },
                { label: 'Shares', value: stats?.totalShares || 0, icon: Share2, color: 'text-blue-500' },
                { label: 'Comments', value: stats?.totalComments || 0, icon: MessageCircle, color: 'text-green-500' },
                { label: 'Downloads', value: stats?.totalDownloads || 0, icon: Download, color: 'text-purple-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-slate-300">{label}</span>
                  </div>
                  <span className="font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Audience by Country</h3>
            {demographics?.topCountries && (
              <div className="space-y-2">
                {demographics.topCountries.map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{country.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                          style={{
                            width: `${
                              (country.listeners /
                                (demographics.topCountries[0]?.listeners || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-amber-400 text-sm font-semibold w-16 text-right">
                        {country.listeners}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Revenue Chart */}
        {revenue?.dailyRevenue && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Top Content */}
        {contentPerformance && contentPerformance.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Performing Content</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Content</th>
                    <th className="text-right py-3 px-4 text-slate-400 text-sm">Plays</th>
                    <th className="text-right py-3 px-4 text-slate-400 text-sm">Skip Rate</th>
                    <th className="text-right py-3 px-4 text-slate-400 text-sm">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {contentPerformance.slice(0, 10).map((content) => (
                    <tr key={content.contentId} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-white">{content.contentId}</td>
                      <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                        {content.plays}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {content.skipRate.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-green-400">
                        {content.engagementRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
