import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, AlertCircle, Filter, RefreshCw } from 'lucide-react';

interface PolicyDecision {
  id: string;
  timestamp: Date;
  policy: string;
  decision: string;
  trigger: string;
  outcome: 'approved' | 'denied' | 'pending' | 'overridden';
  overriddenBy?: string;
  overrideReason?: string;
}

export default function PolicyDecisionLogging() {
  const [decisions, setDecisions] = useState<PolicyDecision[]>([]);
  const [filteredDecisions, setFilteredDecisions] = useState<PolicyDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [policyFilter, setPolicyFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const policies = [
    'Content Policy',
    'User Policy',
    'Payment Policy',
    'Security Policy',
    'Compliance Policy',
    'Performance Policy',
    'Engagement Policy',
    'System Policy',
  ];

  const outcomes = ['approved', 'denied', 'pending', 'overridden'];

  useEffect(() => {
    // Simulate loading decisions
    setLoading(true);
    setTimeout(() => {
      const mockDecisions: PolicyDecision[] = [
        {
          id: 'dec-001',
          timestamp: new Date(Date.now() - 5 * 60000),
          policy: 'Content Policy',
          decision: 'Approve video upload',
          trigger: 'User submitted video for review',
          outcome: 'approved',
        },
        {
          id: 'dec-002',
          timestamp: new Date(Date.now() - 10 * 60000),
          policy: 'Payment Policy',
          decision: 'Process subscription payment',
          trigger: 'Monthly billing cycle',
          outcome: 'approved',
        },
        {
          id: 'dec-003',
          timestamp: new Date(Date.now() - 15 * 60000),
          policy: 'Security Policy',
          decision: 'Block suspicious login attempt',
          trigger: 'Multiple failed login attempts detected',
          outcome: 'approved',
        },
        {
          id: 'dec-004',
          timestamp: new Date(Date.now() - 20 * 60000),
          policy: 'Compliance Policy',
          decision: 'Flag content for review',
          trigger: 'Content flagged by moderation system',
          outcome: 'pending',
        },
        {
          id: 'dec-005',
          timestamp: new Date(Date.now() - 25 * 60000),
          policy: 'Performance Policy',
          decision: 'Scale up video processing',
          trigger: 'Video queue exceeds threshold',
          outcome: 'approved',
        },
      ];

      setDecisions(mockDecisions);
      setFilteredDecisions(mockDecisions);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = decisions;

    if (policyFilter !== 'all') {
      filtered = filtered.filter(d => d.policy === policyFilter);
    }

    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(d => d.outcome === outcomeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        d =>
          d.decision.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.trigger.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDecisions(filtered);
  }, [decisions, policyFilter, outcomeFilter, searchTerm]);

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overridden':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case 'approved':
        return 'bg-green-600 text-white';
      case 'denied':
        return 'bg-red-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'overridden':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Policy Decision Logging</h1>
        <p className="text-slate-400 mt-2">Real-time tracking of QUMUS autonomous decisions</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Search</label>
              <Input
                placeholder="Search decisions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

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
              <label className="text-sm text-slate-400 mb-2 block">Outcome</label>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Outcomes</SelectItem>
                  {outcomes.map(outcome => (
                    <SelectItem key={outcome} value={outcome}>
                      {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Decisions List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Decisions</CardTitle>
          <CardDescription>
            Showing {filteredDecisions.length} of {decisions.length} decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Loading decisions...</p>
            </div>
          ) : filteredDecisions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No decisions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDecisions.map(decision => (
                <div
                  key={decision.id}
                  className="p-4 bg-slate-700 rounded border border-slate-600 hover:border-slate-500 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getOutcomeIcon(decision.outcome)}
                        <h3 className="font-semibold text-white">{decision.decision}</h3>
                        <Badge className={getOutcomeBadgeColor(decision.outcome)}>
                          {decision.outcome.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Policy</p>
                          <p className="text-white font-medium">{decision.policy}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Trigger</p>
                          <p className="text-white font-medium">{decision.trigger}</p>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-500">
                        {new Date(decision.timestamp).toLocaleString()}
                      </div>

                      {decision.overriddenBy && (
                        <div className="mt-3 p-2 bg-purple-900 rounded border border-purple-700">
                          <p className="text-sm text-purple-200">
                            <strong>Overridden by:</strong> {decision.overriddenBy}
                          </p>
                          <p className="text-sm text-purple-200">
                            <strong>Reason:</strong> {decision.overrideReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" size="sm" className="text-slate-300 border-slate-600">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
