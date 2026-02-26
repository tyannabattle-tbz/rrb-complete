import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PolicyDecision {
  id: string;
  policyId: string;
  decision: 'approve' | 'deny' | 'review';
  confidence: number;
  timestamp: Date;
  action: string;
  requiresHumanReview: boolean;
  reason: string;
}

interface HumanReviewItem {
  id: string;
  userId: string;
  type: string;
  data: any;
  status: 'pending' | 'approved' | 'denied';
  createdAt: Date;
}

export default function AdminPoliciesDashboard() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<PolicyDecision[]>([]);
  const [reviewQueue, setReviewQueue] = useState<HumanReviewItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [confidenceTrends, setConfidenceTrends] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPoliciesData();
    }
  }, [user]);

  const loadPoliciesData = async () => {
    setIsLoading(true);
    try {
      // Fetch policy decisions and review queue
      // const data = await trpc.admin.getPolicyDecisions.useQuery();
      // setDecisions(data.decisions);
      // setReviewQueue(data.reviewQueue);
      // setConfidenceTrends(data.trends);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      // await trpc.admin.approveReview.useMutation({ reviewId });
      loadPoliciesData();
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleDenyReview = async (reviewId: string, reason: string) => {
    try {
      // await trpc.admin.denyReview.useMutation({ reviewId, reason });
      loadPoliciesData();
    } catch (error) {
      console.error('Failed to deny review:', error);
    }
  };

  const handleOverrideDecision = async (decisionId: string, override: 'approve' | 'deny') => {
    try {
      // await trpc.admin.overridePolicyDecision.useMutation({ decisionId, override, reason: '' });
      loadPoliciesData();
    } catch (error) {
      console.error('Failed to override decision:', error);
    }
  };

  const getDecisionStats = () => {
    const stats = {
      total: decisions.length,
      approved: decisions.filter((d) => d.decision === 'approve').length,
      denied: decisions.filter((d) => d.decision === 'deny').length,
      review: decisions.filter((d) => d.decision === 'review').length,
      avgConfidence:
        decisions.length > 0 ? (decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length).toFixed(1) : 0,
    };
    return stats;
  };

  const stats = getDecisionStats();
  const filteredDecisions =
    selectedFilter === 'all'
      ? decisions
      : decisions.filter((d) => d.decision === selectedFilter || (selectedFilter === 'review' && d.requiresHumanReview));

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white text-lg">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Policy Monitoring Dashboard</h1>
          <p className="text-slate-400">Monitor autonomous policy decisions and human review queue</p>
        </div>
        <Button
          onClick={loadPoliciesData}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm mb-1">Total Decisions</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-slate-400 text-sm">Approved</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-slate-400 text-sm">Denied</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.denied}</p>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="text-slate-400 text-sm">Pending Review</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.review}</p>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <p className="text-slate-400 text-sm">Avg Confidence</p>
          </div>
          <p className="text-2xl font-bold text-cyan-400">{stats.avgConfidence}%</p>
        </Card>
      </div>

      {/* Confidence Trends Chart */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Policy Confidence Trends (24h)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={confidenceTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line type="monotone" dataKey="confidence" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Policy Decision Distribution */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Decision Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: 'Approved', value: stats.approved, fill: '#10b981' },
              { name: 'Denied', value: stats.denied, fill: '#ef4444' },
              { name: 'Review', value: stats.review, fill: '#f59e0b' },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="value" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Human Review Queue */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Human Review Queue ({reviewQueue.length})</h2>

        {reviewQueue.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No pending reviews</p>
        ) : (
          <div className="space-y-3">
            {reviewQueue.map((item) => (
              <div key={item.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-medium capitalize">{item.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-slate-400">User ID: {item.userId}</p>
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">
                    Pending
                  </span>
                </div>

                <div className="bg-slate-800 rounded p-3 mb-3 text-sm text-slate-300 max-h-32 overflow-auto">
                  <pre>{JSON.stringify(item.data, null, 2)}</pre>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveReview(item.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDenyReview(item.id, 'Manual review denial')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Policy Decisions */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Policy Decisions</h2>
          <div className="flex gap-2">
            {['all', 'approve', 'deny', 'review'].map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={selectedFilter === filter ? 'default' : 'outline'}
                onClick={() => setSelectedFilter(filter)}
                className={selectedFilter === filter ? 'bg-cyan-600' : 'border-slate-600 text-slate-300'}
              >
                <Filter className="w-3 h-3 mr-1" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {filteredDecisions.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No decisions found</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-auto">
            {filteredDecisions.slice(0, 20).map((decision) => (
              <div key={decision.id} className="bg-slate-700 border border-slate-600 rounded p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {decision.decision === 'approve' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {decision.decision === 'deny' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {decision.decision === 'review' && <Clock className="w-4 h-4 text-yellow-500" />}
                    <p className="text-white font-medium capitalize">{decision.policyId.replace(/_/g, ' ')}</p>
                  </div>
                  <p className="text-xs text-slate-400">{decision.reason}</p>
                  <p className="text-xs text-slate-500">{new Date(decision.timestamp).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-cyan-400">{decision.confidence}%</p>
                    <p className="text-xs text-slate-400 capitalize">{decision.decision}</p>
                  </div>

                  {decision.requiresHumanReview && (
                    <Button
                      size="sm"
                      onClick={() => handleOverrideDecision(decision.id, 'approve')}
                      className="bg-slate-600 hover:bg-slate-500 text-white text-xs"
                    >
                      Override
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
