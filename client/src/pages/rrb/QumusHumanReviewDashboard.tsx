import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Filter, Search, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export default function QumusHumanReviewDashboard() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: reviewStats } = trpc.qumusComplete.getReviewStatistics.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: pendingReviews, isLoading, refetch } = trpc.qumusComplete.getHumanReviews.useQuery(
    { status: filterStatus === 'all' ? undefined : filterStatus, limit: 50 },
    { refetchInterval: 10000 }
  );
  const { data: escalationReasons } = trpc.qumusComplete.getEscalationReasons.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const approveMutation = trpc.qumusComplete.resolveHumanReview.useMutation({
    onSuccess: () => refetch(),
  });

  const handleApprove = (reviewId: string) => {
    approveMutation.mutate({ reviewId, resolution: 'approved', reviewerNotes: 'Approved by admin' });
  };

  const handleReject = (reviewId: string) => {
    approveMutation.mutate({ reviewId, resolution: 'rejected', reviewerNotes: 'Rejected by admin' });
  };

  const reviews = pendingReviews || [];
  const filteredReviews = reviews.filter((r: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (r.policyId || '').toLowerCase().includes(q) || 
             (r.escalationReason || '').toLowerCase().includes(q) ||
             (r.decisionId || '').toLowerCase().includes(q);
    }
    return true;
  });

  const stats = reviewStats || { pending: 0, approved: 0, rejected: 0, total: 0 };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Human Review Dashboard
          </h1>
          <p className="text-slate-400 mt-1">10% human override — review escalated QUMUS decisions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-slate-600 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Clock className="w-4 h-4 text-yellow-400" /> Pending
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" /> Approved
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <XCircle className="w-4 h-4 text-red-400" /> Rejected
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Shield className="w-4 h-4 text-purple-400" /> Total Reviews
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Reasons */}
      {escalationReasons && escalationReasons.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Top Escalation Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {escalationReasons.map((reason: any, i: number) => (
                <Badge key={i} className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {reason.reason}: {reason.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by policy, decision type, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? 'bg-amber-600 hover:bg-amber-700' : 'border-slate-600 text-slate-300'}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Review Items */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p>Loading escalated decisions...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">All Clear</h3>
            <p className="text-slate-400">No escalated decisions require review. QUMUS is operating at full autonomy.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review: any) => (
            <Card key={review.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        review.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        review.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        review.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }>
                        {review.priority || 'medium'}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {review.policyId || 'Unknown Policy'}
                      </Badge>
                      <span className="text-xs text-slate-500">{review.decisionId || review.id}</span>
                    </div>
                    <p className="text-white font-medium mb-1">{review.escalationReason || 'Confidence below threshold'}</p>
                    <p className="text-slate-400 text-sm">
                      Confidence: <span className="text-amber-400 font-semibold">{review.confidence || 'N/A'}%</span>
                      {review.createdAt && <span className="ml-3">Requested: {new Date(review.createdAt).toLocaleString()}</span>}
                    </p>
                  </div>
                  {review.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(review.id?.toString())}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                        onClick={() => handleReject(review.id?.toString())}
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                  {review.status !== 'pending' && (
                    <Badge className={review.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {review.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
