import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Shield, AlertTriangle, Activity, Zap, TrendingUp, 
  CheckCircle, XCircle, Clock, RefreshCw, ChevronRight,
  BarChart3, Target, Link2, BookOpen, Gauge
} from 'lucide-react';

// Grade color mapping
const gradeColors: Record<string, string> = {
  A: 'text-green-500 bg-green-500/10 border-green-500/30',
  B: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  C: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  D: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
  F: 'text-red-500 bg-red-500/10 border-red-500/30',
};

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-600 border-red-500/30',
};

const trendIcons: Record<string, { icon: string; color: string }> = {
  improving: { icon: '↑', color: 'text-green-500' },
  stable: { icon: '→', color: 'text-blue-400' },
  declining: { icon: '↓', color: 'text-red-500' },
};

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'correlations' | 'anomalies' | 'chains' | 'learning'>('overview');

  const dashboard = trpc.qumusIntelligence.getDashboard.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const resolveAlert = trpc.qumusIntelligence.resolveAlert.useMutation({
    onSuccess: () => dashboard.refetch(),
  });

  const data = dashboard.data;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Brain },
    { id: 'correlations' as const, label: 'Correlations', icon: Link2 },
    { id: 'anomalies' as const, label: 'Anomalies', icon: AlertTriangle },
    { id: 'chains' as const, label: 'Policy Chains', icon: Zap },
    { id: 'learning' as const, label: 'Learning', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">QUMUS Intelligence</h1>
                <p className="text-xs text-muted-foreground">
                  Engine v{data?.engineVersion || '11.0'} — Advanced Decision Intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data?.assessment && (
                <div className={`px-3 py-1.5 rounded-lg border font-bold text-lg ${gradeColors[data.assessment.healthGrade]}`}>
                  {data.assessment.healthGrade}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => dashboard.refetch()} disabled={dashboard.isRefetching}>
                <RefreshCw className={`w-4 h-4 mr-1 ${dashboard.isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6">
        {dashboard.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading intelligence data...</p>
            </div>
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No intelligence data available. The engine may still be initializing.</p>
          </div>
        ) : (
          <>
            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Score + Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className={`text-5xl font-black mb-1 ${gradeColors[data.assessment.healthGrade]?.split(' ')[0]}`}>
                        {data.assessment.overallScore}
                      </div>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className="text-3xl font-bold mb-1">{data.stats.totalRecorded}</div>
                      <p className="text-xs text-muted-foreground">Decisions Tracked</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className="text-3xl font-bold mb-1">{data.stats.avgConfidence}%</div>
                      <p className="text-xs text-muted-foreground">Avg Confidence</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className="text-3xl font-bold mb-1">{data.stats.escalationRate}%</div>
                      <p className="text-xs text-muted-foreground">Escalation Rate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Trends */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {(['autonomyTrend', 'confidenceTrend', 'performanceTrend'] as const).map(key => {
                        const trend = data.assessment.trends[key];
                        const info = trendIcons[trend];
                        const label = key.replace('Trend', '').replace(/([A-Z])/g, ' $1').trim();
                        return (
                          <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                            <span className={`text-2xl ${info.color}`}>{info.icon}</span>
                            <p className="text-sm font-medium capitalize mt-1">{label}</p>
                            <p className={`text-xs ${info.color} capitalize`}>{trend}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Strengths ({data.assessment.strengths.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {data.assessment.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        Areas for Improvement ({data.assessment.weaknesses.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.assessment.weaknesses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No weaknesses identified.</p>
                      ) : (
                        <ul className="space-y-2">
                          {data.assessment.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.assessment.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Adaptive Schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      Adaptive Loop Scheduling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-bold">{Math.round(data.schedule.currentInterval / 1000)}s</p>
                        <p className="text-xs text-muted-foreground">Current Interval</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-bold">{data.schedule.loadFactor.toFixed(1)}x</p>
                        <p className="text-xs text-muted-foreground">Load Factor</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-bold">{data.schedule.urgencyFactor.toFixed(1)}x</p>
                        <p className="text-xs text-muted-foreground">Urgency Factor</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-bold">{Math.round(data.schedule.minInterval / 1000)}s–{Math.round(data.schedule.maxInterval / 1000)}s</p>
                        <p className="text-xs text-muted-foreground">Range</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── CORRELATIONS TAB ─── */}
            {activeTab === 'correlations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Cross-Policy Correlation Alerts
                  </h2>
                  <Badge variant="outline">{data.correlationAlerts.length} active</Badge>
                </div>

                {data.correlationAlerts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p className="font-medium">No Active Correlation Alerts</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cross-policy patterns are being monitored. Alerts appear when suspicious multi-policy patterns are detected.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  data.correlationAlerts.map((alert: any) => (
                    <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f97316' : alert.severity === 'medium' ? '#eab308' : '#3b82f6' }}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={severityColors[alert.severity]}>{alert.severity}</Badge>
                              <Badge variant="outline" className="text-xs">{alert.type.replace(/_/g, ' ')}</Badge>
                              <span className="text-xs text-muted-foreground">{alert.confidence}% confidence</span>
                            </div>
                            <p className="text-sm mt-2">{alert.description}</p>
                            <div className="flex gap-1 mt-2">
                              {alert.policies.map((p: string) => (
                                <Badge key={p} variant="secondary" className="text-xs">
                                  {p.replace('policy_', '').replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert.mutate({ alertId: alert.id })}
                            disabled={resolveAlert.isPending}
                          >
                            Resolve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {/* Correlation Rules Info */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active Correlation Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { name: 'Suspicious Registration + Payment', desc: 'Detects escalated registrations coinciding with low-confidence payments' },
                        { name: 'Performance Cascade Risk', desc: 'Identifies analytics load contributing to performance degradation' },
                        { name: 'Content-Compliance Conflict', desc: 'Flags simultaneous content and compliance escalations' },
                        { name: 'Growth Opportunity', desc: 'Identifies high registration + recommendation activity for campaigns' },
                      ].map((rule, i) => (
                        <div key={i} className="p-3 rounded-lg bg-background border">
                          <p className="text-sm font-medium">{rule.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{rule.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── ANOMALIES TAB ─── */}
            {activeTab === 'anomalies' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Anomaly Detection Reports
                  </h2>
                  <Badge variant="outline">{data.anomalies.length} detected</Badge>
                </div>

                {data.anomalies.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p className="font-medium">No Anomalies Detected</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Statistical baselines are being established. Anomalies are flagged when metrics deviate significantly from expected patterns.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {data.anomalies.map((anomaly: any, i: number) => (
                      <Card key={i}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${anomaly.severity === 'high' ? 'bg-red-500' : anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium capitalize">{anomaly.policyId.replace('policy_', '').replace(/_/g, ' ')}</span>
                                <Badge className={severityColors[anomaly.severity]} variant="outline">{anomaly.severity}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {anomaly.metric}: expected {anomaly.expected}, got {anomaly.actual} (deviation: {anomaly.deviation}{anomaly.metric === 'execution_time' ? 'x' : '%'})
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── POLICY CHAINS TAB ─── */}
            {activeTab === 'chains' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Policy Chains
                  </h2>
                  <Badge variant="outline">{data.chains.length} configured</Badge>
                </div>

                {data.chains.map((chain: any) => (
                  <Card key={chain.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{chain.name}</CardTitle>
                        <Badge variant={chain.enabled ? 'default' : 'secondary'}>
                          {chain.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 text-sm">
                        <span className="text-muted-foreground">Trigger: </span>
                        <Badge variant="outline" className="mr-1">
                          {chain.triggerPolicy.replace('policy_', '').replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-muted-foreground">when </span>
                        <Badge variant="secondary">{chain.triggerCondition}</Badge>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {chain.steps.map((step: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 shrink-0">
                            {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            <div className="p-2 rounded-lg bg-muted/50 border text-xs">
                              <p className="font-medium capitalize">{step.policyId.replace('policy_', '').replace(/_/g, ' ')}</p>
                              <p className="text-muted-foreground">{step.action.replace(/_/g, ' ')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* ─── LEARNING TAB ─── */}
            {activeTab === 'learning' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Learning Feedback Loop
                  </h2>
                  <Badge variant="outline">{data.learning.length} entries</Badge>
                </div>

                {data.learning.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium">No Learning Entries Yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Decision outcomes will appear here as the engine learns from feedback. Use the "Record Outcome" feature to train the engine.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {data.learning.map((entry: any, i: number) => (
                      <Card key={i}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center gap-3">
                            {entry.outcome === 'correct' ? (
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            ) : entry.outcome === 'incorrect' ? (
                              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium capitalize">
                                  {entry.policyId.replace('policy_', '').replace(/_/g, ' ')}
                                </span>
                                <Badge variant={entry.outcome === 'correct' ? 'default' : 'destructive'} className="text-xs">
                                  {entry.outcome}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confidence: {entry.originalConfidence}% → {entry.adjustedConfidence}%
                                {entry.feedback && ` — ${entry.feedback}`}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Learning Stats */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">How Learning Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="font-medium text-green-600">Correct Decision</p>
                        <p className="text-muted-foreground mt-1">+0.5% confidence boost (max +10%)</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="font-medium text-red-600">Incorrect Decision</p>
                        <p className="text-muted-foreground mt-1">-2% confidence penalty (max -15%)</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="font-medium text-yellow-600">Partial Match</p>
                        <p className="text-muted-foreground mt-1">-0.5% slight adjustment (max -15%)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
