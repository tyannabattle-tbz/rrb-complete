import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, AlertCircle, Plus } from 'lucide-react';

interface OverrideRequest {
  id: string;
  decisionId: string;
  policy: string;
  originalDecision: string;
  proposedOverride: string;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export default function HumanOverrideSystem() {
  const [overrideRequests, setOverrideRequests] = useState<OverrideRequest[]>([]);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [policyFilter, setPolicyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    policy: '',
    originalDecision: '',
    proposedOverride: '',
    reason: '',
  });

  // Mock data
  React.useEffect(() => {
    const mockRequests: OverrideRequest[] = [
      {
        id: 'override-001',
        decisionId: 'dec-001',
        policy: 'Payment Policy',
        originalDecision: 'Deny payment due to fraud score',
        proposedOverride: 'Allow payment with manual review',
        requestedBy: 'admin@qumus.io',
        requestedAt: new Date(Date.now() - 30 * 60000),
        reason: 'Customer verified legitimate transaction',
        status: 'pending',
      },
      {
        id: 'override-002',
        decisionId: 'dec-002',
        policy: 'Content Policy',
        originalDecision: 'Block video due to policy violation',
        proposedOverride: 'Allow video with content warning',
        requestedBy: 'moderator@qumus.io',
        requestedAt: new Date(Date.now() - 2 * 60 * 60000),
        reason: 'Video has educational value despite policy concerns',
        status: 'approved',
        approvedBy: 'admin@qumus.io',
        approvedAt: new Date(Date.now() - 60 * 60000),
      },
      {
        id: 'override-003',
        decisionId: 'dec-003',
        policy: 'Security Policy',
        originalDecision: 'Block user account due to suspicious activity',
        proposedOverride: 'Require password reset instead',
        requestedBy: 'support@qumus.io',
        requestedAt: new Date(Date.now() - 4 * 60 * 60000),
        reason: 'User confirmed they changed device',
        status: 'rejected',
        rejectionReason: 'Security risk too high for override',
      },
    ];

    setOverrideRequests(mockRequests);
  }, []);

  const policies = ['Payment Policy', 'Content Policy', 'Security Policy', 'Compliance Policy', 'Performance Policy'];
  const statuses = ['pending', 'approved', 'rejected'];

  const filteredRequests = useMemo(() => {
    return overrideRequests.filter(request => {
      if (policyFilter !== 'all' && request.policy !== policyFilter) {
        return false;
      }

      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [overrideRequests, policyFilter, statusFilter]);

  const stats = {
    total: overrideRequests.length,
    pending: overrideRequests.filter(r => r.status === 'pending').length,
    approved: overrideRequests.filter(r => r.status === 'approved').length,
    rejected: overrideRequests.filter(r => r.status === 'rejected').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'approved':
        return 'bg-green-600 text-white';
      case 'rejected':
        return 'bg-red-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.policy || !formData.originalDecision || !formData.proposedOverride || !formData.reason) {
      alert('Please fill in all fields');
      return;
    }

    const newRequest: OverrideRequest = {
      id: `override-${Date.now()}`,
      decisionId: `dec-${Date.now()}`,
      policy: formData.policy,
      originalDecision: formData.originalDecision,
      proposedOverride: formData.proposedOverride,
      requestedBy: 'current-user@qumus.io',
      requestedAt: new Date(),
      reason: formData.reason,
      status: 'pending',
    };

    setOverrideRequests([newRequest, ...overrideRequests]);
    setFormData({ policy: '', originalDecision: '', proposedOverride: '', reason: '' });
    setShowNewRequestForm(false);
  };

  const handleApprove = (requestId: string) => {
    setOverrideRequests(
      overrideRequests.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved' as const,
              approvedBy: 'current-user@qumus.io',
              approvedAt: new Date(),
            }
          : r
      )
    );
  };

  const handleReject = (requestId: string) => {
    setOverrideRequests(
      overrideRequests.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected' as const,
              rejectionReason: 'Rejected by user',
            }
          : r
      )
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Human Override System</h1>
          <p className="text-slate-400 mt-2">Request and manage overrides for QUMUS autonomous decisions</p>
        </div>
        <Button onClick={() => setShowNewRequestForm(!showNewRequestForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Override Request
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Requests</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* New Request Form */}
      {showNewRequestForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Create Override Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Policy</label>
                <Select value={formData.policy} onValueChange={policy => setFormData({ ...formData, policy })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {policies.map(policy => (
                      <SelectItem key={policy} value={policy}>
                        {policy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Original Decision</label>
                <Input
                  placeholder="Describe the original QUMUS decision"
                  value={formData.originalDecision}
                  onChange={e => setFormData({ ...formData, originalDecision: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Proposed Override</label>
                <Input
                  placeholder="Describe the proposed override"
                  value={formData.proposedOverride}
                  onChange={e => setFormData({ ...formData, proposedOverride: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Reason</label>
                <Textarea
                  placeholder="Explain why this override is necessary"
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Submit Request
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowNewRequestForm(false)}
                  variant="outline"
                  className="text-slate-300 border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Policy</label>
            <Select value={policyFilter} onValueChange={setPolicyFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Policies</SelectItem>
                {policies.map(policy => (
                  <SelectItem key={policy} value={policy}>
                    {policy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Override Requests List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Override Requests</CardTitle>
          <CardDescription>Showing {filteredRequests.length} of {overrideRequests.length} requests</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No override requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => (
                <div key={request.id} className="p-4 bg-slate-700 rounded border border-slate-600">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-semibold text-white">{request.policy}</h3>
                        <p className="text-sm text-slate-300 mt-1">
                          <strong>Original:</strong> {request.originalDecision}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          <strong>Proposed:</strong> {request.proposedOverride}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(request.status)}>
                      {request.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-slate-400">Requested By</p>
                      <p className="text-white font-medium">{request.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Requested At</p>
                      <p className="text-white font-medium">{request.requestedAt.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-600 rounded mb-3">
                    <p className="text-sm text-slate-300">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                  </div>

                  {request.status === 'approved' && request.approvedBy && (
                    <div className="p-3 bg-green-900 rounded mb-3 border border-green-700">
                      <p className="text-sm text-green-200">
                        <strong>Approved by:</strong> {request.approvedBy} at {request.approvedAt?.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="p-3 bg-red-900 rounded mb-3 border border-red-700">
                      <p className="text-sm text-red-200">
                        <strong>Rejection Reason:</strong> {request.rejectionReason}
                      </p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
