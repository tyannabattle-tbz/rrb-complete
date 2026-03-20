import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
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
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FlowPayAdminDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'transactions' | 'users'>('revenue');
  const [isExporting, setIsExporting] = useState(false);

  // Mock data for demonstration
  const [dashboardData] = useState({
    totalRevenue: 45230.5,
    totalTransactions: 1243,
    activeUsers: 456,
    avgTransactionValue: 36.4,
    successRate: 98.7,
    failureRate: 1.3,
    refundRate: 0.5,
    pendingTransactions: 12,
    highRiskTransactions: 3,
  });

  const [revenueData] = useState([
    { date: 'Mon', revenue: 2400, transactions: 24 },
    { date: 'Tue', revenue: 1398, transactions: 22 },
    { date: 'Wed', revenue: 9800, transactions: 29 },
    { date: 'Thu', revenue: 3908, transactions: 20 },
    { date: 'Fri', revenue: 4800, transactions: 35 },
    { date: 'Sat', revenue: 3800, transactions: 18 },
    { date: 'Sun', revenue: 4300, transactions: 12 },
  ]);

  const [paymentMethodData] = useState([
    { name: 'Credit Card', value: 65, color: '#3b82f6' },
    { name: 'Debit Card', value: 20, color: '#10b981' },
    { name: 'Bank Transfer', value: 10, color: '#f59e0b' },
    { name: 'Digital Wallet', value: 5, color: '#8b5cf6' },
  ]);

  const [transactionStatusData] = useState([
    { status: 'Completed', count: 1200, color: '#10b981' },
    { status: 'Pending', count: 30, color: '#f59e0b' },
    { status: 'Failed', count: 10, color: '#ef4444' },
    { status: 'Refunded', count: 3, color: '#6366f1' },
  ]);

  const [recentTransactions] = useState([
    {
      id: 'txn_001',
      user: 'John Doe',
      amount: 150.0,
      status: 'completed',
      timestamp: new Date(Date.now() - 5 * 60000),
      method: 'Credit Card',
    },
    {
      id: 'txn_002',
      user: 'Jane Smith',
      amount: 75.5,
      status: 'completed',
      timestamp: new Date(Date.now() - 15 * 60000),
      method: 'Bank Transfer',
    },
    {
      id: 'txn_003',
      user: 'Bob Johnson',
      amount: 200.0,
      status: 'pending',
      timestamp: new Date(Date.now() - 30 * 60000),
      method: 'Digital Wallet',
    },
    {
      id: 'txn_004',
      user: 'Alice Williams',
      amount: 50.0,
      status: 'failed',
      timestamp: new Date(Date.now() - 45 * 60000),
      method: 'Credit Card',
    },
    {
      id: 'txn_005',
      user: 'Charlie Brown',
      amount: 125.0,
      status: 'completed',
      timestamp: new Date(Date.now() - 60 * 60000),
      method: 'Debit Card',
    },
  ]);

  const [qumusMetrics] = useState({
    policy21_fraudDetections: 3,
    policy22_smartRoutings: 1243,
    policy23_donorRecognitions: 45,
    policy24_subscriptionRecommendations: 12,
    policy25_chargebackPrevention: 2,
    autonomyLevel: 92,
  });

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Dashboard data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FlowPay Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time payment analytics and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${dashboardData.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-blue-400">{dashboardData.totalTransactions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-purple-400">{dashboardData.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">{dashboardData.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Transaction</p>
                <p className="text-2xl font-bold text-cyan-400">${dashboardData.avgTransactionValue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue & Transaction Trends</CardTitle>
          <CardDescription>Last 7 days performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactionStatusData.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-300">{item.status}</span>
                  </div>
                  <span className="font-bold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUMUS Metrics */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">QUMUS Autonomous Policies Status</CardTitle>
          <CardDescription>AI-driven payment orchestration metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Policy #21</p>
              <p className="text-xl font-bold text-red-400">{qumusMetrics.policy21_fraudDetections}</p>
              <p className="text-gray-400 text-xs mt-1">Fraud Detections</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Policy #22</p>
              <p className="text-xl font-bold text-blue-400">{qumusMetrics.policy22_smartRoutings}</p>
              <p className="text-gray-400 text-xs mt-1">Smart Routings</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Policy #23</p>
              <p className="text-xl font-bold text-green-400">{qumusMetrics.policy23_donorRecognitions}</p>
              <p className="text-gray-400 text-xs mt-1">Donor Recognition</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Policy #24</p>
              <p className="text-xl font-bold text-yellow-400">{qumusMetrics.policy24_subscriptionRecommendations}</p>
              <p className="text-gray-400 text-xs mt-1">Subscriptions</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Policy #25</p>
              <p className="text-xl font-bold text-orange-400">{qumusMetrics.policy25_chargebackPrevention}</p>
              <p className="text-gray-400 text-xs mt-1">Chargeback Prevention</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Autonomy Level</p>
              <p className="text-xl font-bold text-purple-400">{qumusMetrics.autonomyLevel}%</p>
              <p className="text-gray-400 text-xs mt-1">AI Control</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription>Latest payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-gray-400">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400">Method</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">{txn.id}</td>
                    <td className="py-3 px-4 text-gray-300">{txn.user}</td>
                    <td className="py-3 px-4 text-green-400 font-bold">${txn.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-300">{txn.method}</td>
                    <td className={`py-3 px-4 flex items-center gap-2 ${getStatusColor(txn.status)}`}>
                      {getStatusIcon(txn.status)}
                      <span className="capitalize">{txn.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {txn.timestamp.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
