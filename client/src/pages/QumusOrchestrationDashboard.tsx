import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Zap,
  Brain,
  Shield,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

export default function QumusOrchestrationDashboard() {
  const [selectedPolicy, setSelectedPolicy] = useState<number | null>(null);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  // Mock orchestration data
  const [orchestrationStats] = useState({
    totalPolicies: 5,
    activePolicies: 5,
    averageAutonomy: 92,
    totalDecisions: 1247,
    systemHealth: 98,
  });

  const [policies] = useState([
    {
      id: 26,
      name: 'Autonomous Wealth Generation',
      description: 'Manages autonomous income streams and deposits',
      autonomyLevel: 92,
      enabled: true,
      status: 'active',
      decisionsToday: 24,
    },
    {
      id: 27,
      name: 'Autonomous Grant Discovery',
      description: 'Discovers and auto-applies for grant opportunities',
      autonomyLevel: 90,
      enabled: true,
      status: 'active',
      decisionsToday: 18,
    },
    {
      id: 28,
      name: 'Autonomous Campaign Management',
      description: 'Creates and manages funding campaigns with treasury routing',
      autonomyLevel: 91,
      enabled: true,
      status: 'active',
      decisionsToday: 12,
    },
    {
      id: 29,
      name: 'Bot Coordination & Conflict Resolution',
      description: 'Coordinates between bots to prevent conflicts and optimize outcomes',
      autonomyLevel: 88,
      enabled: true,
      status: 'active',
      decisionsToday: 8,
    },
    {
      id: 30,
      name: 'Autonomous Risk Management',
      description: 'Monitors bot decisions and prevents high-risk actions',
      autonomyLevel: 95,
      enabled: true,
      status: 'active',
      decisionsToday: 31,
    },
  ]);

  const [autonomyTimeline] = useState([
    { time: '00:00', autonomy: 88, decisions: 12, riskScore: 15 },
    { time: '04:00', autonomy: 90, decisions: 18, riskScore: 12 },
    { time: '08:00', autonomy: 91, decisions: 24, riskScore: 18 },
    { time: '12:00', autonomy: 92, decisions: 32, riskScore: 14 },
    { time: '16:00', autonomy: 93, decisions: 28, riskScore: 11 },
    { time: '20:00', autonomy: 92, decisions: 35, riskScore: 16 },
    { time: '24:00', autonomy: 92, decisions: 42, riskScore: 13 },
  ]);

  const [recentDecisions] = useState([
    {
      id: 'dec_001',
      policyId: 26,
      timestamp: new Date(Date.now() - 5 * 60000),
      decision: 'Autonomous Wealth Generation',
      action: 'Processed $2,500 from passive income stream',
      confidence: 94,
      autonomyApplied: true,
    },
    {
      id: 'dec_002',
      policyId: 27,
      timestamp: new Date(Date.now() - 15 * 60000),
      decision: 'Grant Discovery',
      action: 'Auto-applied for 3 high-match grants ($450K potential)',
      confidence: 88,
      autonomyApplied: true,
    },
    {
      id: 'dec_003',
      policyId: 28,
      timestamp: new Date(Date.now() - 30 * 60000),
      decision: 'Campaign Management',
      action: 'Routed $12,000 to community treasury (20% allocation)',
      confidence: 91,
      autonomyApplied: true,
    },
    {
      id: 'dec_004',
      policyId: 30,
      timestamp: new Date(Date.now() - 45 * 60000),
      decision: 'Risk Management',
      action: 'Flagged unusual pattern in grant applications (risk score: 72/100)',
      confidence: 96,
      autonomyApplied: true,
    },
    {
      id: 'dec_005',
      policyId: 29,
      timestamp: new Date(Date.now() - 60 * 60000),
      decision: 'Bot Coordination',
      action: 'Optimized resource allocation across 3 active bots',
      confidence: 85,
      autonomyApplied: true,
    },
  ]);

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success('QUMUS policies recalibrated successfully!');
    } catch (error) {
      toast.error('Failed to recalibrate policies');
    } finally {
      setIsRecalibrating(false);
    }
  };

  const getPolicyStatusColor = (autonomyLevel: number) => {
    if (autonomyLevel >= 90) return 'bg-green-500/20 text-green-300';
    if (autonomyLevel >= 80) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QUMUS Orchestration Dashboard</h1>
          <p className="text-gray-400 mt-1">Autonomous bot coordination with 90%+ autonomy</p>
        </div>
        <Button
          onClick={handleRecalibrate}
          disabled={isRecalibrating}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          {isRecalibrating ? 'Recalibrating...' : 'Recalibrate'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Policies</p>
                <p className="text-2xl font-bold text-blue-400">
                  {orchestrationStats.activePolicies}/{orchestrationStats.totalPolicies}
                </p>
              </div>
              <Brain className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Autonomy</p>
                <p className="text-2xl font-bold text-purple-400">
                  {orchestrationStats.averageAutonomy}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Decisions</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {orchestrationStats.totalDecisions}
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
                <p className="text-gray-400 text-sm">System Health</p>
                <p className="text-2xl font-bold text-green-400">
                  {orchestrationStats.systemHealth}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-2xl font-bold text-emerald-400">OPERATIONAL</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Autonomy Timeline */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Autonomy & Decision Timeline</CardTitle>
          <CardDescription>Last 24 hours activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={autonomyTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="autonomy" fill="#8b5cf6" name="Autonomy %" />
              <Bar dataKey="decisions" fill="#3b82f6" name="Decisions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">QUMUS Policies (Policies #26-30)</CardTitle>
          <CardDescription>Autonomous decision-making policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={() => setSelectedPolicy(policy.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white">Policy #{policy.id}: {policy.name}</h3>
                      <Badge className={getPolicyStatusColor(policy.autonomyLevel)}>
                        {policy.autonomyLevel}% Autonomy
                      </Badge>
                      {policy.enabled && (
                        <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{policy.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        Decisions today: <span className="text-purple-400 font-bold">{policy.decisionsToday}</span>
                      </span>
                      <span className="text-gray-400">
                        Status: <span className="text-green-400 font-bold">{policy.status.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Decisions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Autonomous Decisions</CardTitle>
          <CardDescription>Last 5 orchestration decisions (90%+ autonomy applied)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDecisions.map((decision) => (
              <div
                key={decision.id}
                className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">{decision.decision}</h4>
                      <Badge className="bg-purple-500/20 text-purple-300">
                        {decision.confidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{decision.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {decision.timestamp.toLocaleTimeString()}
                    </p>
                    <Badge className="bg-green-500/20 text-green-300 mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Autonomous
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Architecture */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">QUMUS Orchestration Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🤖 Bot Layer</p>
              <p className="text-gray-400 text-sm">
                • Wealth Generator (Policy #26)<br />
                • Grant Bot (Policy #27)<br />
                • Funding Bot (Policy #28)
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🧠 Orchestration Layer</p>
              <p className="text-gray-400 text-sm">
                • Bot Coordination (Policy #29)<br />
                • Risk Management (Policy #30)<br />
                • 90%+ Autonomy Applied
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
