import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Users,
  Heart,
  Share2,
  FileText,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface EarningsRecord {
  id: string;
  date: string;
  source: 'subscriptions' | 'donations' | 'sponsorships' | 'merchandise' | 'ads';
  amount: number;
  description: string;
}

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'stripe';
  transactionId?: string;
}

const EARNINGS_DATA: EarningsRecord[] = [
  {
    id: 'earn_1',
    date: '2026-02-19',
    source: 'subscriptions',
    amount: 1250,
    description: 'Premium subscriptions (125 subscribers)',
  },
  {
    id: 'earn_2',
    date: '2026-02-19',
    source: 'donations',
    amount: 340,
    description: 'Viewer donations',
  },
  {
    id: 'earn_3',
    date: '2026-02-18',
    source: 'sponsorships',
    amount: 2500,
    description: 'Brand partnership - Tech Company',
  },
  {
    id: 'earn_4',
    date: '2026-02-18',
    source: 'merchandise',
    amount: 580,
    description: 'Merchandise sales',
  },
  {
    id: 'earn_5',
    date: '2026-02-17',
    source: 'ads',
    amount: 420,
    description: 'Ad revenue share',
  },
];

const PAYOUT_HISTORY: PayoutRecord[] = [
  {
    id: 'payout_1',
    date: '2026-02-15',
    amount: 5000,
    status: 'completed',
    method: 'bank_transfer',
    transactionId: 'TXN-2026021501',
  },
  {
    id: 'payout_2',
    date: '2026-02-08',
    amount: 3200,
    status: 'completed',
    method: 'paypal',
    transactionId: 'PP-2026020801',
  },
  {
    id: 'payout_3',
    date: '2026-02-01',
    amount: 4800,
    status: 'completed',
    method: 'bank_transfer',
    transactionId: 'TXN-2026020101',
  },
];

const REVENUE_SOURCES = [
  { source: 'Subscriptions', amount: 12500, percentage: 45, color: '#ff6b6b' },
  { source: 'Donations', amount: 8200, percentage: 30, color: '#4ecdc4' },
  { source: 'Sponsorships', amount: 5300, percentage: 19, color: '#95e1d3' },
  { source: 'Merchandise', amount: 1500, percentage: 6, color: '#f38181' },
];

export function CreatorMonetizationDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'payouts' | 'tax'>('overview');
  const [dateRange, setDateRange] = useState('month');

  const totalEarnings = EARNINGS_DATA.reduce((sum, e) => sum + e.amount, 0);
  const totalPayouts = PAYOUT_HISTORY.reduce((sum, p) => sum + p.amount, 0);
  const pendingBalance = totalEarnings - totalPayouts;
  const nextPayoutDate = '2026-03-01';

  const subscriptionEarnings = EARNINGS_DATA.filter((e) => e.source === 'subscriptions').reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const donationEarnings = EARNINGS_DATA.filter((e) => e.source === 'donations').reduce(
    (sum, e) => sum + e.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-green-500" /> Creator Monetization
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="w-4 h-4" /> Tax Report
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'earnings', label: 'Earnings' },
              { id: 'payouts', label: 'Payouts' },
              { id: 'tax', label: 'Tax & Documents' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">${totalEarnings.toLocaleString()}</p>
                    <p className="text-green-300 text-xs mt-2">This month</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Balance</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">${pendingBalance.toLocaleString()}</p>
                    <p className="text-blue-300 text-xs mt-2">Ready to payout</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Paid Out</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">${totalPayouts.toLocaleString()}</p>
                    <p className="text-purple-300 text-xs mt-2">All time</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Next Payout</p>
                    <p className="text-2xl font-bold text-orange-400 mt-2">{nextPayoutDate}</p>
                    <p className="text-orange-300 text-xs mt-2">Automatic transfer</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Revenue by Source</h3>
                <div className="space-y-4">
                  {REVENUE_SOURCES.map((source) => (
                    <div key={source.source}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{source.source}</span>
                        <span className="text-white font-semibold">${source.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${source.percentage}%`,
                            backgroundColor: source.color,
                          }}
                        ></div>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{source.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Earnings Trend</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-700">
                    <p className="text-green-300 text-sm">📈 This Month</p>
                    <p className="text-white font-bold text-2xl mt-1">${totalEarnings.toLocaleString()}</p>
                    <p className="text-green-200 text-xs mt-2">+23% vs last month</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-700">
                    <p className="text-blue-300 text-sm">📊 Daily Average</p>
                    <p className="text-white font-bold text-2xl mt-1">${(totalEarnings / 19).toFixed(0)}</p>
                    <p className="text-blue-200 text-xs mt-2">Based on 19 days</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg border border-purple-700">
                    <p className="text-purple-300 text-sm">🎯 Projected Monthly</p>
                    <p className="text-white font-bold text-2xl mt-1">${((totalEarnings / 19) * 30).toFixed(0)}</p>
                    <p className="text-purple-200 text-xs mt-2">If trend continues</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Earnings</h3>
              <div className="space-y-2">
                {EARNINGS_DATA.slice(0, 5).map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{earning.description}</p>
                      <p className="text-gray-400 text-sm">{earning.date}</p>
                    </div>
                    <p className="text-green-400 font-bold">${earning.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Detailed Earnings</h2>
              <div className="space-y-3">
                {EARNINGS_DATA.map((earning) => (
                  <div key={earning.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{earning.description}</p>
                        <p className="text-gray-400 text-sm mt-1">{earning.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-lg">${earning.amount.toLocaleString()}</p>
                        <span className="text-gray-400 text-xs capitalize">{earning.source.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Payout History</h2>
              <div className="space-y-3">
                {PAYOUT_HISTORY.map((payout) => (
                  <div key={payout.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white font-semibold">{payout.method.replace(/_/g, ' ').toUpperCase()}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded font-semibold ${
                              payout.status === 'completed'
                                ? 'bg-green-900 text-green-200'
                                : payout.status === 'processing'
                                ? 'bg-yellow-900 text-yellow-200'
                                : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {payout.status === 'completed' && '✓ Completed'}
                            {payout.status === 'processing' && '⏳ Processing'}
                            {payout.status === 'failed' && '✗ Failed'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{payout.date}</p>
                        {payout.transactionId && (
                          <p className="text-gray-500 text-xs mt-1">ID: {payout.transactionId}</p>
                        )}
                      </div>
                      <p className="text-white font-bold text-lg">${payout.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Bank Transfer</p>
                      <p className="text-gray-400 text-sm">****1234 - Chase Bank</p>
                    </div>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">PayPal</p>
                      <p className="text-gray-400 text-sm">creator@example.com</p>
                    </div>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tax & Documents Tab */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Tax Information</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-700">
                  <p className="text-blue-300 text-sm">Tax ID Status</p>
                  <p className="text-white font-bold mt-2">✓ Verified</p>
                  <p className="text-blue-200 text-xs mt-2">W-9 form on file</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-700">
                  <p className="text-green-300 text-sm">YTD Earnings</p>
                  <p className="text-white font-bold text-2xl mt-2">$27,500</p>
                  <p className="text-green-200 text-xs mt-2">Jan 1 - Feb 19, 2026</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg border border-purple-700">
                  <p className="text-purple-300 text-sm">Estimated Tax</p>
                  <p className="text-white font-bold text-2xl mt-2">$5,500</p>
                  <p className="text-purple-200 text-xs mt-2">Based on 20% effective rate</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Documents</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">2026 1099-NEC (Jan-Feb)</p>
                    <p className="text-gray-400 text-sm">Generated Feb 19, 2026</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">W-9 Form</p>
                    <p className="text-gray-400 text-sm">On file - Verified</p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
