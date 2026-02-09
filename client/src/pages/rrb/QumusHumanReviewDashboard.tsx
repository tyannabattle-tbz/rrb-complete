import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EscalatedDecision {
  id: string;
  policyId: string;
  policyName: string;
  decisionType: string;
  confidence: number;
  reason: string;
  input: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
}

export default function QumusHumanReviewDashboard() {
  const [decisions, setDecisions] = useState<EscalatedDecision[]>([
    {
      id: 'esc_001',
      policyId: 'policy_payment_processing',
      policyName: 'Payment Processing',
      decisionType: 'process_payment',
      confidence: 72,
      reason: 'Confidence below escalation threshold (75%)',
      input: {
        userId: 'user_123',
        amount: 299.99,
        currency: 'USD',
        paymentMethod: 'stripe',
      },
      status: 'pending',
      requestedAt: '5 minutes ago',
      priority: 'high',
      userId: 'user_123',
    },
    {
      id: 'esc_002',
      policyId: 'policy_content_moderation',
      policyName: 'Content Moderation',
      decisionType: 'moderate_content',
      confidence: 68,
      reason: 'Content flagged for manual review - borderline policy violation',
      input: {
        userId: 'user_456',
        contentType: 'text',
        text: 'Sample user submission text',
      },
      status: 'pending',
      requestedAt: '12 minutes ago',
      priority: 'medium',
      userId: 'user_456',
    },
    {
      id: 'esc_003',
      policyId: 'policy_subscription_management',
      policyName: 'Subscription Management',
      decisionType: 'manage_subscription',
      confidence: 74,
      reason: 'Unusual subscription pattern detected',
      input: {
        userId: 'user_789',
        action: 'upgrade',
        tier: 'premium',
        billingCycle: 'monthly',
      },
      status: 'pending',
      requestedAt: '18 minutes ago',
      priority: 'medium',
      userId: 'user_789',
    },
    {
      id: 'esc_004',
      policyId: 'policy_compliance_reporting',
      policyName: 'Compliance Reporting',
      decisionType: 'generate_compliance_report',
      confidence: 71,
      reason: 'Report contains sensitive data - requires approval',
      input: {
        reportType: 'quarterly_audit',
      },
      status: 'pending',
      requestedAt: '25 minutes ago',
      priority: 'high',
    },
    {
      id: 'esc_005',
      policyId: 'policy_user_registration',
      policyName: 'User Registration',
      decisionType: 'approve_registration',
      confidence: 65,
      reason: 'Multiple accounts from same IP detected',
      input: {
        email: 'newuser@example.com',
        name: 'New User',
        source: 'direct_signup',
      },
      status: 'approved',
      requestedAt: '1 hour ago',
      priority: 'critical',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<EscalatedDecision | null>(null);

  const filteredDecisions = decisions.filter(decision => {
    const matchesFilter = filter === 'all' || decision.status === filter;
    const matchesSearch = 
      decision.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.decisionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = decisions.filter(d => d.status === 'pending').length;
  const approvedCount = decisions.filter(d => d.status === 'approved').length;
  const rejectedCount = decisions.filter(d => d.status === 'rejected').length;

  const handleApprove = (id: string) => {
    setDecisions(decisions.map(d => 
      d.id === id ? { ...d, status: 'approved' } : d
    ));
    setSelectedDecision(null);
  };

  const handleReject = (id: string) => {
    setDecisions(decisions.map(d => 
      d.id === id ? { ...d, status: 'rejected' } : d
    ));
    setSelectedDecision(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-900/20 border-red-500 text-red-400';
      case 'high':
        return 'bg-orange-900/20 border-orange-500 text-orange-400';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-500 text-yellow-400';
      default:
        return 'bg-blue-900/20 border-blue-500 text-blue-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Human Review Dashboard</h1>
          <p className="text-slate-400">Review and approve escalated QUMUS autonomous decisions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{pendingCount}</p>
              </div>
              <Clock className="w-12 h-12 opacity-30 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{approvedCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-30 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{rejectedCount}</p>
              </div>
              <XCircle className="w-12 h-12 opacity-30 text-red-400" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by policy, decision type, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decisions List */}
        <div className="space-y-4">
          {filteredDecisions.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No decisions found matching your criteria</p>
            </div>
          ) : (
            filteredDecisions.map(decision => (
              <div
                key={decision.id}
                className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => setSelectedDecision(decision)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(decision.status)}
                        <h3 className="text-lg font-semibold text-white">{decision.policyName}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(decision.priority)}`}>
                          {decision.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{decision.reason}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>ID: {decision.id}</span>
                        <span>Confidence: {decision.confidence}%</span>
                        <span>{decision.requestedAt}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedDecision && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800">
                <h2 className="text-2xl font-bold text-white">{selectedDecision.policyName}</h2>
                <button
                  onClick={() => setSelectedDecision(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Decision Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Decision Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Decision ID:</span>
                      <span className="text-white font-mono">{selectedDecision.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Decision Type:</span>
                      <span className="text-white">{selectedDecision.decisionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-white">{selectedDecision.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Priority:</span>
                      <span className={`font-medium ${
                        selectedDecision.priority === 'critical' ? 'text-red-400' :
                        selectedDecision.priority === 'high' ? 'text-orange-400' :
                        selectedDecision.priority === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {selectedDecision.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Requested:</span>
                      <span className="text-white">{selectedDecision.requestedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Escalation Reason</h3>
                  <p className="text-slate-300 bg-slate-700/50 p-3 rounded border border-slate-600">
                    {selectedDecision.reason}
                  </p>
                </div>

                {/* Input Data */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Decision Input</h3>
                  <pre className="bg-slate-700/50 p-3 rounded border border-slate-600 text-slate-300 text-xs overflow-x-auto">
                    {JSON.stringify(selectedDecision.input, null, 2)}
                  </pre>
                </div>

                {/* Actions */}
                {selectedDecision.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-700">
                    <Button
                      onClick={() => handleApprove(selectedDecision.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedDecision.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {selectedDecision.status !== 'pending' && (
                  <div className="p-3 rounded bg-slate-700/50 border border-slate-600">
                    <p className="text-slate-300 text-sm">
                      Status: <span className="font-semibold capitalize">{selectedDecision.status}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
