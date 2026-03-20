import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GrantBotDashboard() {
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'applied' | 'awarded'>(
    'all'
  );

  // Mock grant data
  const [grantStats] = useState({
    totalDiscovered: 24,
    totalApplied: 18,
    totalAwarded: 3,
    totalRejected: 2,
    totalPotentialFunding: 850000,
    averageMatchScore: 78.5,
  });

  const [grantTimeline] = useState([
    { month: 'Jan', discovered: 4, applied: 2, awarded: 0 },
    { month: 'Feb', discovered: 6, applied: 5, awarded: 1 },
    { month: 'Mar', discovered: 8, applied: 7, awarded: 2 },
    { month: 'Apr', discovered: 6, applied: 4, awarded: 0 },
  ]);

  const [grants] = useState([
    {
      id: 'grant_001',
      title: 'Fintech Innovation Grant',
      amount: 150000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      matchScore: 92,
      status: 'new',
      source: 'National Science Foundation',
    },
    {
      id: 'grant_002',
      title: 'Community Payment Systems',
      amount: 75000,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      matchScore: 88,
      status: 'applied',
      source: 'Department of Commerce',
    },
    {
      id: 'grant_003',
      title: 'Peer-to-Peer Finance Initiative',
      amount: 200000,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      matchScore: 85,
      status: 'new',
      source: 'Federal Reserve',
    },
    {
      id: 'grant_004',
      title: 'Community Treasury Development',
      amount: 100000,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      matchScore: 82,
      status: 'applied',
      source: 'Social Innovation Fund',
    },
    {
      id: 'grant_005',
      title: 'Financial Inclusion Program',
      amount: 125000,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      matchScore: 79,
      status: 'awarded',
      source: 'World Bank',
    },
  ]);

  const handleAutoApply = async () => {
    setIsAutoApplying(true);
    try {
      // Simulate auto-apply process
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success('Auto-applied for 3 high-match grants!');
    } catch (error) {
      toast.error('Failed to auto-apply for grants');
    } finally {
      setIsAutoApplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-300';
      case 'applied':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'awarded':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4" />;
      case 'applied':
        return <Clock className="w-4 h-4" />;
      case 'awarded':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredGrants = grants.filter((g) => selectedFilter === 'all' || g.status === selectedFilter);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grant Bot Dashboard</h1>
          <p className="text-gray-400 mt-1">Autonomous grant discovery & application (QUMUS Policy #27)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAutoApply}
            disabled={isAutoApplying}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isAutoApplying ? 'Applying...' : 'Auto-Apply'}
          </Button>
          <Button variant="outline" className="text-white border-slate-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Discovered</p>
                <p className="text-2xl font-bold text-blue-400">{grantStats.totalDiscovered}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Applied</p>
                <p className="text-2xl font-bold text-yellow-400">{grantStats.totalApplied}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Awarded</p>
                <p className="text-2xl font-bold text-green-400">{grantStats.totalAwarded}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Potential Funding</p>
                <p className="text-2xl font-bold text-cyan-400">
                  ${(grantStats.totalPotentialFunding / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Match Score</p>
                <p className="text-2xl font-bold text-purple-400">{grantStats.averageMatchScore}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-orange-400">
                  {grantStats.totalAwarded > 0
                    ? ((grantStats.totalAwarded / grantStats.totalApplied) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grant Discovery Timeline */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Grant Discovery & Application Timeline</CardTitle>
          <CardDescription>Last 4 months activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={grantTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="discovered" fill="#3b82f6" name="Discovered" />
              <Bar dataKey="applied" fill="#f59e0b" name="Applied" />
              <Bar dataKey="awarded" fill="#10b981" name="Awarded" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Grants */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Available Grants</CardTitle>
              <CardDescription>Sorted by match score (highest first)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {['all', 'new', 'applied', 'awarded'].map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setSelectedFilter(filter as any)}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  className={
                    selectedFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 border-slate-600'
                  }
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredGrants.map((grant) => (
              <div
                key={grant.id}
                className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white">{grant.title}</h3>
                      <Badge className={getStatusColor(grant.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(grant.status)}
                          {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{grant.source}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400 font-bold">${grant.amount.toLocaleString()}</span>
                      <span className="text-gray-400">
                        Match: <span className="text-purple-400 font-bold">{grant.matchScore}%</span>
                      </span>
                      <span className="text-gray-400">
                        Deadline:{' '}
                        <span className="text-cyan-400">
                          {grant.deadline.toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-white border-slate-600">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QUMUS Policy Info */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">QUMUS Policy #27 - Autonomous Grant Discovery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🔍 Discovery</p>
              <p className="text-gray-400 text-sm">
                Scans 1000+ grant databases every 6 hours. Uses LLM to identify relevant opportunities.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🎯 Matching</p>
              <p className="text-gray-400 text-sm">
                Calculates match scores (0-100) based on eligibility, funding amount, and timeline.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">📝 Auto-Apply</p>
              <p className="text-gray-400 text-sm">
                Automatically applies for grants with 75%+ match score. 90%+ autonomy, no human gates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
