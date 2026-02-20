import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  Zap,
} from 'lucide-react';

interface RevenueSource {
  name: string;
  amount: number;
  percentage: number;
  trend: number; // percentage change
  color: string;
}

interface Payout {
  id: string;
  date: Date;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
}

interface TaxDocument {
  id: string;
  type: string;
  year: number;
  status: 'pending' | 'submitted' | 'approved';
  url: string;
}

const REVENUE_SOURCES: RevenueSource[] = [
  { name: 'Subscriptions', amount: 4250, percentage: 42.5, trend: 12, color: 'bg-blue-600' },
  { name: 'Super Chat', amount: 2840, percentage: 28.4, trend: 8, color: 'bg-purple-600' },
  { name: 'Sponsorships', amount: 1920, percentage: 19.2, trend: 15, color: 'bg-green-600' },
  { name: 'Merchandise', amount: 890, percentage: 8.9, trend: -5, color: 'bg-orange-600' },
];

const PAYOUTS: Payout[] = [
  {
    id: 'payout_1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    amount: 5000,
    method: 'Bank Transfer',
    status: 'completed',
    reference: 'TRF-2026-0001',
  },
  {
    id: 'payout_2',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    amount: 3500,
    method: 'PayPal',
    status: 'processing',
    reference: 'PP-2026-0042',
  },
  {
    id: 'payout_3',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    amount: 2800,
    method: 'Bank Transfer',
    status: 'pending',
    reference: 'TRF-2026-0003',
  },
];

const TAX_DOCUMENTS: TaxDocument[] = [
  { id: 'tax_1', type: '1099-NEC', year: 2025, status: 'submitted', url: '/docs/1099-2025.pdf' },
  { id: 'tax_2', type: 'W-9', year: 2025, status: 'approved', url: '/docs/w9-2025.pdf' },
  { id: 'tax_3', type: '1099-NEC', year: 2024, status: 'approved', url: '/docs/1099-2024.pdf' },
];

export function MonetizationDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const totalRevenue = REVENUE_SOURCES.reduce((sum, source) => sum + source.amount, 0);
  const totalPayouts = PAYOUTS.reduce((sum, payout) => sum + payout.amount, 0);
  const pendingAmount = PAYOUTS.filter((p) => p.status === 'pending').reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-300';
      case 'processing':
        return 'bg-blue-900 text-blue-300';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300';
      case 'failed':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-500" /> Monetization Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Track your earnings and manage payouts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                <p className="text-green-400 text-sm mt-1">↑ 12% this month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Payouts</p>
                <p className="text-3xl font-bold text-white">${totalPayouts.toLocaleString()}</p>
                <p className="text-gray-400 text-sm mt-1">Last 30 days</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Payout</p>
                <p className="text-3xl font-bold text-white">${pendingAmount.toLocaleString()}</p>
                <p className="text-yellow-400 text-sm mt-1">Available soon</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-3xl font-bold text-white">${(totalRevenue - totalPayouts).toLocaleString()}</p>
                <p className="text-gray-400 text-sm mt-1">Available to withdraw</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Breakdown */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5" /> Revenue Breakdown
              </h2>

              <div className="space-y-4">
                {REVENUE_SOURCES.map((source) => (
                  <div key={source.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${source.color}`} />
                        <span className="text-white font-semibold">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${source.amount.toLocaleString()}</p>
                        <p className={`text-sm ${source.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {source.trend >= 0 ? '↑' : '↓'} {Math.abs(source.trend)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`${source.color} h-2 rounded-full`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{source.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
                  <CreditCard className="w-4 h-4" /> Request Payout
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                  <FileText className="w-4 h-4" /> Tax Documents
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                  <Download className="w-4 h-4" /> Export Report
                </Button>
                <Button
                  className="w-full bg-gray-700 hover:bg-gray-600 gap-2"
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                >
                  <CreditCard className="w-4 h-4" /> Payment Methods
                </Button>
              </div>

              {showPaymentMethods && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <div className="p-3 bg-gray-700 rounded">
                    <p className="text-white text-sm font-semibold">Bank Account</p>
                    <p className="text-gray-400 text-xs">****1234</p>
                  </div>
                  <div className="p-3 bg-gray-700 rounded">
                    <p className="text-white text-sm font-semibold">PayPal</p>
                    <p className="text-gray-400 text-xs">user@example.com</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Payout History */}
        <Card className="bg-gray-800 border-gray-700 p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Payout History
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Date</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Amount</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Method</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Reference</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-700 hover:bg-gray-700 bg-opacity-50">
                    <td className="py-3 px-4 text-white">{payout.date.toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-white font-bold">${payout.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-400">{payout.method}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{payout.reference}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payout.status)}`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Tax Documents */}
        <Card className="bg-gray-800 border-gray-700 p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Tax Documents
          </h2>

          <div className="space-y-3">
            {TAX_DOCUMENTS.map((doc) => (
              <div key={doc.id} className="p-4 bg-gray-700 rounded flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{doc.type} - {doc.year}</p>
                  <p className="text-gray-400 text-sm">Tax documentation</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(doc.status)}`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
