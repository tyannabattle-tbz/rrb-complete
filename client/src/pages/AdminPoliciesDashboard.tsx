import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp, RefreshCw, Shield, Zap, Radio, AlertTriangle, Users, Code, Calendar, BarChart3, CreditCard, Mail, Database, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { usePolicyDecisions } from '@/hooks/useWebSocket';

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

// 12 QUMUS Autonomous Decision Policies
const QUMUS_POLICIES = [
  { id: 'payment_processing', name: 'Payment Processing', icon: CreditCard, category: 'core', autonomy: 95, status: 'active' as const, description: 'Auto-validates, reconciles, and processes payments with fraud detection' },
  { id: 'email_notification', name: 'Email Notification', icon: Mail, category: 'core', autonomy: 100, status: 'active' as const, description: 'Auto-sends transactional emails with retry logic' },
  { id: 'metrics_persistence', name: 'Metrics Persistence', icon: Database, category: 'core', autonomy: 100, status: 'active' as const, description: 'Auto-syncs metrics from browser to database' },
  { id: 'access_control', name: 'Access Control', icon: Lock, category: 'core', autonomy: 100, status: 'active' as const, description: 'Auto-enforces subscription tier restrictions' },
  { id: 'subscription_lifecycle', name: 'Subscription Lifecycle', icon: TrendingUp, category: 'core', autonomy: 95, status: 'active' as const, description: 'Auto-manages renewals, cancellations, and upgrades' },
  { id: 'fraud_detection', name: 'Fraud Detection', icon: Shield, category: 'core', autonomy: 90, status: 'active' as const, description: 'Auto-detects and blocks fraudulent transactions' },
  { id: 'analytics_aggregation', name: 'Analytics Aggregation', icon: BarChart3, category: 'core', autonomy: 98, status: 'active' as const, description: 'Auto-aggregates analytics and audit trails' },
  { id: 'content_scheduling', name: 'Content Scheduling', icon: Calendar, category: 'ecosystem', autonomy: 90, status: 'active' as const, description: 'Auto-schedules broadcasts, rotates content across 50 RRB channels 24/7' },
  { id: 'broadcast_management', name: 'Broadcast Management', icon: Radio, category: 'ecosystem', autonomy: 88, status: 'active' as const, description: 'Auto-manages channels, monitors stream health, handles failover' },
  { id: 'emergency_response', name: 'Emergency Response', icon: AlertTriangle, category: 'ecosystem', autonomy: 75, status: 'active' as const, description: 'Auto-escalates alerts, triggers HybridCast PWA, coordinates disaster response' },
  { id: 'community_engagement', name: 'Community Engagement', icon: Users, category: 'ecosystem', autonomy: 85, status: 'active' as const, description: 'Auto-moderates content, tracks engagement, manages Sweet Miracles outreach' },
  { id: 'code_maintenance', name: 'Code Maintenance', icon: Code, category: 'ecosystem', autonomy: 88, status: 'active' as const, description: 'Auto-scans code health, fixes broken links, monitors dependencies' },
];

export default function AdminPoliciesDashboard() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<PolicyDecision[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  usePolicyDecisions((decision) => {
    setDecisions((prev) => [decision, ...prev.slice(0, 99)]);
  });

  const avgAutonomy = Math.round(QUMUS_POLICIES.reduce((s, p) => s + p.autonomy, 0) / QUMUS_POLICIES.length);
  const corePolicies = QUMUS_POLICIES.filter(p => p.category === 'core');
  const ecosystemPolicies = QUMUS_POLICIES.filter(p => p.category === 'ecosystem');

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
          <h1 className="text-3xl font-bold text-white mb-1">
            <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">QUMUS</span> Policy Dashboard
          </h1>
          <p className="text-gray-400">12 Autonomous Decision Policies — 90% QUMUS Control / 10% Human Override</p>
        </div>
        <Button
          onClick={() => setIsLoading(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/60 border-purple-500/20 p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Policies</p>
          <p className="text-3xl font-bold text-white">{QUMUS_POLICIES.length}</p>
          <p className="text-xs text-purple-400 mt-1">{corePolicies.length} core + {ecosystemPolicies.length} ecosystem</p>
        </Card>
        <Card className="bg-gray-900/60 border-emerald-500/20 p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active</p>
          <p className="text-3xl font-bold text-emerald-400">{QUMUS_POLICIES.filter(p => p.status === 'active').length}</p>
          <p className="text-xs text-emerald-400/70 mt-1">All systems operational</p>
        </Card>
        <Card className="bg-gray-900/60 border-amber-500/20 p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Avg Autonomy</p>
          <p className="text-3xl font-bold text-amber-400">{avgAutonomy}%</p>
          <p className="text-xs text-amber-400/70 mt-1">QUMUS autonomous control</p>
        </Card>
        <Card className="bg-gray-900/60 border-purple-500/20 p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Decisions</p>
          <p className="text-3xl font-bold text-purple-400">{decisions.length}</p>
          <p className="text-xs text-purple-400/70 mt-1">Real-time via WebSocket</p>
        </Card>
      </div>

      {/* Core Policies */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Core Policies ({corePolicies.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {corePolicies.map(policy => {
            const Icon = policy.icon;
            return (
              <Card key={policy.id} className="bg-gray-900/60 border-purple-500/20 p-4 hover:border-purple-500/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    policy.status === 'active' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {policy.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{policy.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{policy.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Autonomy</span>
                  <span className="text-xs font-bold text-purple-400">{policy.autonomy}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${policy.autonomy}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Ecosystem Policies */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Ecosystem Policies ({ecosystemPolicies.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {ecosystemPolicies.map(policy => {
            const Icon = policy.icon;
            return (
              <Card key={policy.id} className="bg-gray-900/60 border-amber-500/20 p-4 hover:border-amber-500/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    policy.status === 'active' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {policy.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{policy.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{policy.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Autonomy</span>
                  <span className="text-xs font-bold text-amber-400">{policy.autonomy}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${policy.autonomy}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Decisions */}
      <Card className="bg-gray-900/60 border-purple-500/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Recent Autonomous Decisions
        </h2>
        {decisions.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-purple-400/40 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Waiting for real-time policy decisions...</p>
            <p className="text-gray-600 text-xs mt-1">Decisions appear here as QUMUS processes them</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {decisions.slice(0, 20).map((d, i) => (
              <div key={d.id || i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
                <div className="flex items-center gap-3">
                  {d.decision === 'approve' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : d.decision === 'deny' ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <span className="text-sm text-white">{d.action}</span>
                    <span className="text-xs text-gray-500 ml-2">{d.policyId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-purple-400 font-medium">{d.confidence}%</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.decision === 'approve' ? 'bg-emerald-600/20 text-emerald-400' :
                    d.decision === 'deny' ? 'bg-red-600/20 text-red-400' :
                    'bg-amber-600/20 text-amber-400'
                  }`}>
                    {d.decision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-600">
          QUMUS Autonomous Orchestration Engine — A Canryn Production
        </p>
      </div>
    </div>
  );
}
