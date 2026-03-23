/**
 * Admin Decision Review Dashboard
 * Displays pending QUMUS policy decisions requiring human review
 * Allows approve/reject with impact analysis and audit trails
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface PendingDecision {
  id: string;
  policyName: string;
  type: 'content_moderation' | 'donation_routing' | 'grant_matching' | 'broadcast_scheduling' | 'emergency_broadcast';
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  affectedUsers: number;
  affectedChannels: string[];
  recommendedAction: string;
  confidence: number;
  submittedAt: number;
  decisionDeadline: number;
  historicalAccuracy: number;
}

interface DecisionAuditLog {
  id: string;
  decisionId: string;
  action: 'approved' | 'rejected' | 'escalated';
  reviewer: string;
  timestamp: number;
  reason?: string;
  impact?: string;
}

const AdminDecisionReview: React.FC = () => {
  const [decisions, setDecisions] = useState<PendingDecision[]>([]);
  const [auditLog, setAuditLog] = useState<DecisionAuditLog[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<PendingDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    // Load pending decisions from QUMUS
    loadPendingDecisions();
  }, []);

  const loadPendingDecisions = async () => {
    try {
      setLoading(true);
      // Simulate loading decisions from QUMUS
      const mockDecisions: PendingDecision[] = [
        {
          id: 'dec_001',
          policyName: 'Content Moderation Policy',
          type: 'content_moderation',
          description: 'Flag user-generated content for potential policy violation. Content contains potentially harmful material flagged by AI review.',
          impact: 'high',
          affectedUsers: 1,
          affectedChannels: ['neo-soul', 'healing-frequencies'],
          recommendedAction: 'Approve removal and notify creator',
          confidence: 0.92,
          submittedAt: Date.now() - 3600000,
          decisionDeadline: Date.now() + 7200000,
          historicalAccuracy: 0.94,
        },
        {
          id: 'dec_002',
          policyName: 'Donation Routing Policy',
          type: 'donation_routing',
          description: 'Route $5,000 donation to emergency relief fund. Donor indicated preference for disaster response.',
          impact: 'medium',
          affectedUsers: 1,
          affectedChannels: ['sweet-miracles'],
          recommendedAction: 'Approve routing to emergency relief',
          confidence: 0.88,
          submittedAt: Date.now() - 1800000,
          decisionDeadline: Date.now() + 10800000,
          historicalAccuracy: 0.91,
        },
        {
          id: 'dec_003',
          policyName: 'Grant Matching Policy',
          type: 'grant_matching',
          description: 'Automatically submit grant application for $75,000 community development grant. Organization meets all eligibility criteria.',
          impact: 'high',
          affectedUsers: 0,
          affectedChannels: ['funding-finders'],
          recommendedAction: 'Approve automatic submission',
          confidence: 0.95,
          submittedAt: Date.now() - 900000,
          decisionDeadline: Date.now() + 86400000,
          historicalAccuracy: 0.96,
        },
        {
          id: 'dec_004',
          policyName: 'Emergency Broadcast Policy',
          type: 'emergency_broadcast',
          description: 'Activate emergency broadcast system for severe weather alert. Alert meets severity threshold for immediate broadcast.',
          impact: 'critical',
          affectedUsers: 50000,
          affectedChannels: ['all-channels'],
          recommendedAction: 'Approve immediate broadcast',
          confidence: 0.99,
          submittedAt: Date.now() - 300000,
          decisionDeadline: Date.now() + 600000,
          historicalAccuracy: 0.98,
        },
      ];

      setDecisions(mockDecisions);
    } catch (error) {
      console.error('Failed to load pending decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDecision = async (decision: PendingDecision) => {
    try {
      const auditEntry: DecisionAuditLog = {
        id: `audit_${Date.now()}`,
        decisionId: decision.id,
        action: 'approved',
        reviewer: 'admin_user',
        timestamp: Date.now(),
        reason: 'Approved based on QUMUS recommendation and historical accuracy',
        impact: `Decision approved. ${decision.affectedUsers} users affected. ${decision.affectedChannels.length} channels impacted.`,
      };

      setAuditLog([...auditLog, auditEntry]);
      setDecisions(decisions.filter(d => d.id !== decision.id));
      setSelectedDecision(null);

      console.log('[Admin Decision] Decision approved:', decision.id);
    } catch (error) {
      console.error('Failed to approve decision:', error);
    }
  };

  const handleRejectDecision = async (decision: PendingDecision, reason: string) => {
    try {
      const auditEntry: DecisionAuditLog = {
        id: `audit_${Date.now()}`,
        decisionId: decision.id,
        action: 'rejected',
        reviewer: 'admin_user',
        timestamp: Date.now(),
        reason,
        impact: 'Decision rejected. No action taken.',
      };

      setAuditLog([...auditLog, auditEntry]);
      setDecisions(decisions.filter(d => d.id !== decision.id));
      setSelectedDecision(null);

      console.log('[Admin Decision] Decision rejected:', decision.id);
    } catch (error) {
      console.error('Failed to reject decision:', error);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency_broadcast':
        return <AlertCircle className="w-5 h-5" />;
      case 'content_moderation':
        return <AlertCircle className="w-5 h-5" />;
      case 'donation_routing':
        return <TrendingUp className="w-5 h-5" />;
      case 'grant_matching':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const filteredDecisions = filter === 'all' ? decisions : decisions.filter(d => d.impact === filter);
  const timeRemaining = (deadline: number) => {
    const minutes = Math.floor((deadline - Date.now()) / 60000);
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Decision Review</h1>
          <p className="text-slate-400">Pending QUMUS policy decisions requiring human oversight and approval</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Pending Decisions</p>
                <p className="text-3xl font-bold text-white">{decisions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Critical Impact</p>
                <p className="text-3xl font-bold text-red-400">{decisions.filter(d => d.impact === 'critical').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Avg Confidence</p>
                <p className="text-3xl font-bold text-green-400">
                  {decisions.length > 0
                    ? ((decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Audit Logs</p>
                <p className="text-3xl font-bold text-blue-400">{auditLog.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'critical', 'high', 'medium', 'low'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f as any)}
              className={f === 'critical' ? 'border-red-500 text-red-500' : f === 'high' ? 'border-orange-500 text-orange-500' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Decisions List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">Loading decisions...</p>
                </CardContent>
              </Card>
            ) : filteredDecisions.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">No pending decisions</p>
                </CardContent>
              </Card>
            ) : (
              filteredDecisions.map(decision => (
                <Card
                  key={decision.id}
                  className={`bg-slate-800 border-slate-700 cursor-pointer transition-all ${
                    selectedDecision?.id === decision.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDecision(decision)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-slate-400 mt-1">{getTypeIcon(decision.type)}</div>
                        <div>
                          <h3 className="font-semibold text-white">{decision.policyName}</h3>
                          <p className="text-sm text-slate-400 mt-1">{decision.description}</p>
                        </div>
                      </div>
                      <Badge className={getImpactColor(decision.impact)}>{decision.impact.toUpperCase()}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-slate-500">Confidence</p>
                        <p className="text-white font-semibold">{(decision.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Time Remaining</p>
                        <p className="text-white font-semibold">{timeRemaining(decision.decisionDeadline)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Affected Users</p>
                        <p className="text-white font-semibold">{decision.affectedUsers}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Historical Accuracy</p>
                        <p className="text-white font-semibold">{(decision.historicalAccuracy * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    <div className="bg-slate-700 rounded p-3 mb-4">
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold">Recommendation:</span> {decision.recommendedAction}
                      </p>
                    </div>

                    {selectedDecision?.id === decision.id && (
                      <div className="flex gap-2 pt-4 border-t border-slate-700">
                        <Button
                          onClick={() => handleApproveDecision(decision)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectDecision(decision, 'Requires further review')}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Audit Log */}
          <div>
            <Card className="bg-slate-800 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Decision Audit Trail</CardTitle>
                <CardDescription>Recent approvals and rejections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {auditLog.length === 0 ? (
                    <p className="text-slate-400 text-sm">No audit entries yet</p>
                  ) : (
                    auditLog.map(entry => (
                      <div key={entry.id} className="border-l-2 border-slate-600 pl-3 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.action === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm font-semibold text-white capitalize">{entry.action}</span>
                        </div>
                        <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                        {entry.reason && <p className="text-xs text-slate-300 mt-1">{entry.reason}</p>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDecisionReview;
