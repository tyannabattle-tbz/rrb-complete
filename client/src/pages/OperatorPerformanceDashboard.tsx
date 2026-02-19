import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Download,
  Share2,
  Calendar,
  Filter,
  MoreVertical,
  Award,
  Target,
  Zap,
} from 'lucide-react';

interface PerformanceMetrics {
  date: string;
  subscribers: number;
  revenue: number;
  viewers: number;
  engagement: number;
}

interface DemographicData {
  name: string;
  value: number;
  percentage: number;
}

const PERFORMANCE_DATA: PerformanceMetrics[] = [
  { date: 'Jan 1', subscribers: 1200, revenue: 2400, viewers: 2400, engagement: 24 },
  { date: 'Jan 8', subscribers: 1900, revenue: 2210, viewers: 2290, engagement: 13 },
  { date: 'Jan 15', subscribers: 2500, revenue: 2290, viewers: 2000, engagement: 22 },
  { date: 'Jan 22', subscribers: 3200, revenue: 2000, viewers: 2181, engagement: 22 },
  { date: 'Jan 29', subscribers: 3800, revenue: 2181, viewers: 2500, engagement: 25 },
  { date: 'Feb 5', subscribers: 4500, revenue: 2100, viewers: 2100, engagement: 20 },
  { date: 'Feb 12', subscribers: 5200, revenue: 2200, viewers: 2200, engagement: 28 },
];

const DEMOGRAPHICS: DemographicData[] = [
  { name: '18-24', value: 2400, percentage: 24 },
  { name: '25-34', value: 3210, percentage: 32 },
  { name: '35-44', value: 2290, percentage: 23 },
  { name: '45-54', value: 1200, percentage: 12 },
  { name: '55+', value: 900, percentage: 9 },
];

const ENGAGEMENT_DATA = [
  { name: 'Likes', value: 4200, color: '#ff6b6b' },
  { name: 'Comments', value: 2800, color: '#4ecdc4' },
  { name: 'Shares', value: 1900, color: '#95e1d3' },
  { name: 'Subscriptions', value: 1500, color: '#f38181' },
];

const REVENUE_SOURCES = [
  { source: 'Subscriptions', amount: 12500, percentage: 45 },
  { source: 'Donations', amount: 8200, percentage: 30 },
  { source: 'Sponsorships', amount: 5300, percentage: 19 },
  { source: 'Merchandise', amount: 1500, percentage: 6 },
];

export function OperatorPerformanceDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showPredictions, setShowPredictions] = useState(true);

  const totalSubscribers = 5200;
  const totalRevenue = 27500;
  const totalViewers = 15271;
  const avgEngagement = 22.1;

  const subscriberGrowth = ((5200 - 1200) / 1200 * 100).toFixed(1);
  const revenueGrowth = ((27500 - 4800) / 4800 * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Performance Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['24h', '7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Subscribers</p>
                <p className="text-3xl font-bold text-white mt-2">{totalSubscribers.toLocaleString()}</p>
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +{subscriberGrowth}% this period
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +{revenueGrowth}% this period
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Viewers</p>
                <p className="text-3xl font-bold text-white mt-2">{totalViewers.toLocaleString()}</p>
                <p className="text-blue-400 text-sm mt-2 flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Peak: 3,421 concurrent
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Engagement</p>
                <p className="text-3xl font-bold text-white mt-2">{avgEngagement}%</p>
                <p className="text-purple-400 text-sm mt-2 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Excellent performance
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscriber Growth */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-white font-semibold mb-4">Subscriber Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }} />
                <Line
                  type="monotone"
                  dataKey="subscribers"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  dot={{ fill: '#ff6b6b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Trend */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-white font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }} />
                <Bar dataKey="revenue" fill="#4ecdc4" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Audience Demographics */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-white font-semibold mb-4">Audience Demographics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={DEMOGRAPHICS}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {DEMOGRAPHICS.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#ff6b6b', '#4ecdc4', '#95e1d3', '#f38181', '#aa96da'][index]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Engagement Breakdown */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-white font-semibold mb-4">Engagement Breakdown</h3>
            <div className="space-y-4">
              {ENGAGEMENT_DATA.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white font-semibold">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.value / 4200) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Revenue Sources & Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Sources */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-white font-semibold mb-4">Revenue Sources</h3>
            <div className="space-y-4">
              {REVENUE_SOURCES.map((source) => (
                <div key={source.source}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">{source.source}</span>
                    <span className="text-white font-semibold">${source.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{source.percentage}% of total</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Predictive Analytics */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Predictive Insights</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPredictions(!showPredictions)}
              >
                {showPredictions ? '✓' : '○'} AI Predictions
              </Button>
            </div>

            {showPredictions && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-700">
                  <p className="text-green-300 text-sm font-semibold">📈 Subscriber Forecast</p>
                  <p className="text-white mt-2">
                    Projected to reach <span className="font-bold text-lg">7,200 subscribers</span> in 30 days
                  </p>
                  <p className="text-green-200 text-xs mt-2">+38% growth based on current trend</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-700">
                  <p className="text-blue-300 text-sm font-semibold">💰 Revenue Forecast</p>
                  <p className="text-white mt-2">
                    Expected revenue: <span className="font-bold text-lg">$42,300</span> next month
                  </p>
                  <p className="text-blue-200 text-xs mt-2">+54% increase from current month</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg border border-purple-700">
                  <p className="text-purple-300 text-sm font-semibold">🎯 Optimal Broadcast Time</p>
                  <p className="text-white mt-2">
                    Best engagement: <span className="font-bold">Tuesday & Thursday, 8 PM</span>
                  </p>
                  <p className="text-purple-200 text-xs mt-2">+24% average engagement vs other times</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Performance Comparison */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-4">Performance vs Industry Average</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-300 text-sm">Subscriber Growth</p>
              <div className="flex items-end gap-2 mt-3">
                <div className="flex-1">
                  <div className="h-12 bg-gradient-to-t from-orange-500 to-orange-600 rounded"></div>
                  <p className="text-white font-semibold text-center mt-2">+334%</p>
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-600 rounded"></div>
                  <p className="text-gray-400 text-center mt-2">+45%</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">You vs Industry Avg</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-300 text-sm">Revenue Growth</p>
              <div className="flex items-end gap-2 mt-3">
                <div className="flex-1">
                  <div className="h-12 bg-gradient-to-t from-green-500 to-green-600 rounded"></div>
                  <p className="text-white font-semibold text-center mt-2">+473%</p>
                </div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-600 rounded"></div>
                  <p className="text-gray-400 text-center mt-2">+32%</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">You vs Industry Avg</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-300 text-sm">Engagement Rate</p>
              <div className="flex items-end gap-2 mt-3">
                <div className="flex-1">
                  <div className="h-12 bg-gradient-to-t from-purple-500 to-purple-600 rounded"></div>
                  <p className="text-white font-semibold text-center mt-2">22.1%</p>
                </div>
                <div className="flex-1">
                  <div className="h-7 bg-gray-600 rounded"></div>
                  <p className="text-gray-400 text-center mt-2">8.5%</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">You vs Industry Avg</p>
            </div>
          </div>
        </Card>

        {/* Achievements & Milestones */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> Achievements & Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg border border-yellow-700">
              <p className="text-yellow-300 font-semibold">🏆 5K Subscribers</p>
              <p className="text-white text-sm mt-2">Reached on Feb 12</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg border border-gray-600 opacity-50">
              <p className="text-gray-400 font-semibold">🎯 10K Subscribers</p>
              <p className="text-gray-500 text-sm mt-2">In progress...</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg border border-gray-600 opacity-50">
              <p className="text-gray-400 font-semibold">💰 $50K Revenue</p>
              <p className="text-gray-500 text-sm mt-2">Projected: Mar 15</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg border border-gray-600 opacity-50">
              <p className="text-gray-400 font-semibold">⭐ Top 100 Creator</p>
              <p className="text-gray-500 text-sm mt-2">Estimated: Apr 1</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
