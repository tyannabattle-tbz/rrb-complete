import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Shield, BookOpen, Award } from 'lucide-react';

export default function LedgerDashboard() {
  const [ledgerStats] = useState({
    totalAccounts: 156,
    totalJournalEntries: 2847,
    totalTrustEvents: 5234,
    treasuryBalance: 85000,
    averageTrustScore: 72,
  });

  const [trustScoreDistribution] = useState([
    { range: '0-25', count: 12, color: '#ef4444' },
    { range: '26-50', count: 34, color: '#f97316' },
    { range: '51-75', count: 78, color: '#eab308' },
    { range: '76-90', count: 92, color: '#84cc16' },
    { range: '91-100', count: 45, color: '#10b981' },
  ]);

  const [trustLevelBreakdown] = useState([
    { level: 'Platinum', count: 45, percentage: 29, color: '#a78bfa' },
    { level: 'Gold', count: 92, percentage: 59, color: '#fbbf24' },
    { level: 'Silver', count: 78, percentage: 50, color: '#c0c0c0' },
    { level: 'Bronze', count: 34, percentage: 22, color: '#cd7f32' },
  ]);

  const [journalEntryTimeline] = useState([
    { date: 'Mon', entries: 45, debits: 125000, credits: 125000 },
    { date: 'Tue', entries: 52, debits: 145000, credits: 145000 },
    { date: 'Wed', entries: 38, debits: 98000, credits: 98000 },
    { date: 'Thu', entries: 61, debits: 165000, credits: 165000 },
    { date: 'Fri', entries: 73, debits: 189000, credits: 189000 },
    { date: 'Sat', entries: 42, debits: 112000, credits: 112000 },
    { date: 'Sun', entries: 35, debits: 95000, credits: 95000 },
  ]);

  const [recentJournalEntries] = useState([
    {
      id: 'je_001',
      timestamp: new Date(Date.now() - 5 * 60000),
      description: 'P2P Transfer: Alice → Bob',
      debit: 500,
      credit: 500,
      status: 'posted',
    },
    {
      id: 'je_002',
      timestamp: new Date(Date.now() - 15 * 60000),
      description: 'Grant Deposit: NIH Grant',
      debit: 25000,
      credit: 25000,
      status: 'posted',
    },
    {
      id: 'je_003',
      timestamp: new Date(Date.now() - 30 * 60000),
      description: 'Treasury Allocation: Campaign Contribution',
      debit: 2000,
      credit: 2000,
      status: 'posted',
    },
    {
      id: 'je_004',
      timestamp: new Date(Date.now() - 45 * 60000),
      description: 'Wealth Stream Deposit: Passive Income',
      debit: 1500,
      credit: 1500,
      status: 'posted',
    },
    {
      id: 'je_005',
      timestamp: new Date(Date.now() - 60 * 60000),
      description: 'Funding Campaign: Community Support',
      debit: 8500,
      credit: 8500,
      status: 'posted',
    },
  ]);

  const [topTrustScores] = useState([
    { userId: 1, userName: 'Alice Chen', score: 98, level: 'platinum', events: 245 },
    { userId: 2, userName: 'Bob Martinez', score: 95, level: 'platinum', events: 198 },
    { userId: 3, userName: 'Carol Singh', score: 92, level: 'gold', events: 167 },
    { userId: 4, userName: 'David Kim', score: 88, level: 'gold', events: 142 },
    { userId: 5, userName: 'Emma Johnson', score: 85, level: 'gold', events: 128 },
  ]);

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-purple-500/20 text-purple-300';
      case 'gold':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'silver':
        return 'bg-gray-500/20 text-gray-300';
      case 'bronze':
        return 'bg-orange-500/20 text-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Ledger-First v2 Dashboard</h1>
        <p className="text-gray-400 mt-1">Double-entry accounting with behavior-based trust scoring</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Accounts</p>
                <p className="text-2xl font-bold text-blue-400">{ledgerStats.totalAccounts}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Journal Entries</p>
                <p className="text-2xl font-bold text-purple-400">{ledgerStats.totalJournalEntries}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Trust Events</p>
                <p className="text-2xl font-bold text-cyan-400">{ledgerStats.totalTrustEvents}</p>
              </div>
              <Award className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Treasury Balance</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(ledgerStats.treasuryBalance / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Trust Score</p>
                <p className="text-2xl font-bold text-emerald-400">{ledgerStats.averageTrustScore}/100</p>
              </div>
              <Shield className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Entry Timeline */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Journal Entry Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={journalEntryTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="entries" fill="#8b5cf6" name="Entries" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trust Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Trust Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trustScoreDistribution.map((item) => (
                <div key={item.range} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">{item.range}</span>
                      <span className="text-sm font-bold text-white">{item.count} users</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${(item.count / 100) * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Trust Level Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trustLevelBreakdown.map((item) => (
                <div key={item.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-300">{item.level}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{item.count}</span>
                    <span className="text-xs text-gray-400 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Journal Entries */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Journal Entries</CardTitle>
          <CardDescription>Double-entry accounting records (source of truth)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentJournalEntries.map((entry) => (
              <div key={entry.id} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{entry.description}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300">{entry.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Debit: <span className="text-cyan-400 font-bold">${entry.debit.toLocaleString()}</span>
                  </span>
                  <span className="text-gray-400">
                    Credit: <span className="text-purple-400 font-bold">${entry.credit.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Trust Scores */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Trust Scores</CardTitle>
          <CardDescription>Behavior-based trust ranking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topTrustScores.map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-purple-400">#{index + 1}</div>
                  <div>
                    <p className="font-bold text-white">{user.userName}</p>
                    <p className="text-xs text-gray-400">{user.events} trust events</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{user.score}/100</p>
                  <Badge className={getTrustLevelColor(user.level)}>
                    {user.level.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ledger Architecture Info */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Ledger-First v2 Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">📖 Double-Entry Accounting</p>
              <p className="text-gray-400 text-sm">
                All money movement recorded through journal entries. Wallet balances derived from ledger, never mutated directly.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🎖️ Behavior-Based Trust</p>
              <p className="text-gray-400 text-sm">
                Trust scores calculated from on-time payments, communication, disputes, and refunds. Bronze → Silver → Gold → Platinum.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">✅ Ledger Integrity</p>
              <p className="text-gray-400 text-sm">
                All journal entries balance (debits = credits). Audit trail for every transaction. Source of truth for all accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
