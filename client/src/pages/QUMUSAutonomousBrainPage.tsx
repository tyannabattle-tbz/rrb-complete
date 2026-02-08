import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Zap, Shield, Activity } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DecisionPolicy {
  id: string;
  system: string;
  name: string;
  description: string;
  autonomyThreshold: number;
  humanApprovalGates: string[];
}

interface SystemStatus {
  name: string;
  status: 'operational' | 'warning' | 'error';
  autonomyLevel: number;
  policies: number;
  description: string;
}

export default function QUMUSAutonomousBrainPage() {
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Fetch autonomous brain status
  const { data: brainStatus } = trpc.autonomousBrain.getStatus.useQuery();

  // Fetch ecosystem overview
  const { data: ecosystemData } = trpc.autonomousBrain.getEcosystemOverview.useQuery();

  // Fetch decision statistics
  const { data: statistics } = trpc.autonomousBrain.getDecisionStatistics.useQuery();

  // Fetch policies
  const { data: policiesData } = trpc.autonomousBrain.getPolicies.useQuery();

  // Mock data for charts
  const decisionTrendData = [
    { time: '00:00', autonomous: 45, approved: 8, rejected: 2 },
    { time: '04:00', autonomous: 52, approved: 6, rejected: 1 },
    { time: '08:00', autonomous: 48, approved: 10, rejected: 2 },
    { time: '12:00', autonomous: 61, approved: 12, rejected: 3 },
    { time: '16:00', autonomous: 55, approved: 9, rejected: 2 },
    { time: '20:00', autonomous: 58, approved: 11, rejected: 2 },
    { time: '23:59', autonomous: 63, approved: 14, rejected: 3 },
  ];

  const systemPerformanceData = [
    { system: 'RRB', decisions: 120, autonomy: 92, avgConfidence: 87 },
    { system: 'Canryn', decisions: 85, autonomy: 88, avgConfidence: 84 },
    { system: 'Sweet Miracles', decisions: 62, autonomy: 95, avgConfidence: 91 },
    { system: 'HybridCast', decisions: 98, autonomy: 90, avgConfidence: 88 },
  ];

  const autonomyDistribution = [
    { name: 'Autonomous (90%+)', value: 365, color: '#10b981' },
    { name: 'Human Approved (10%)', value: 40, color: '#f59e0b' },
    { name: 'Rejected (<1%)', value: 5, color: '#ef4444' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Zap className="w-10 h-10 text-yellow-400" />
                QUMUS Autonomous Brain
              </h1>
              <p className="text-gray-400">Central orchestration engine managing your entire ecosystem</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">{brainStatus?.autonomyLevel || 90}%</div>
              <div className="text-sm text-gray-400">Autonomy Level</div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-2xl font-bold text-white">Operational</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Policies</p>
                    <p className="text-2xl font-bold text-white">{brainStatus?.totalPolicies || 12}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Systems</p>
                    <p className="text-2xl font-bold text-white">4</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Confidence</p>
                    <p className="text-2xl font-bold text-white">87%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ecosystem Systems */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Ecosystem Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ecosystemData?.systems.map((system: SystemStatus) => (
              <Card
                key={system.name}
                className="bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => setSelectedSystem(system.name)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{system.name}</CardTitle>
                      <CardDescription className="text-gray-400">{system.type}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(system.status)}>
                      {getStatusIcon(system.status)}
                      <span className="ml-1">{system.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Autonomy</span>
                        <span className="text-sm font-bold text-white">{system.autonomyLevel}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                          style={{ width: `${system.autonomyLevel}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <span className="font-bold text-white">{system.policies}</span> policies
                    </div>
                    <p className="text-xs text-gray-500">{system.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Decision Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Decision Trends (Last 24h)</CardTitle>
              <CardDescription className="text-gray-400">Autonomous vs Human-Approved Decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={decisionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="autonomous" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="approved" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Autonomy Distribution</CardTitle>
              <CardDescription className="text-gray-400">Decision breakdown by approval type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={autonomyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {autonomyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* System Performance */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">System Performance Metrics</CardTitle>
            <CardDescription className="text-gray-400">Decisions, autonomy rate, and confidence scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="system" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="decisions" fill="#3b82f6" />
                <Bar dataKey="autonomy" fill="#10b981" />
                <Bar dataKey="avgConfidence" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Decision Policies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Decision Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policiesData?.policies.rrb?.map((policy: DecisionPolicy) => (
              <Card key={policy.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{policy.name}</CardTitle>
                  <CardDescription className="text-gray-400">{policy.system.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">{policy.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Autonomy Threshold</span>
                      <Badge className="bg-blue-900 text-blue-200">{policy.autonomyThreshold}%</Badge>
                    </div>
                    {policy.humanApprovalGates.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-400 block mb-2">Human Approval Gates</span>
                        <div className="flex flex-wrap gap-2">
                          {policy.humanApprovalGates.map((gate) => (
                            <Badge key={gate} className="bg-purple-900 text-purple-200">
                              {gate}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Controls */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Autonomous Brain Controls</CardTitle>
            <CardDescription className="text-gray-400">Manage and monitor autonomous decision-making</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Clock className="w-4 h-4 mr-2" />
                View Decision History
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Shield className="w-4 h-4 mr-2" />
                Review Pending Decisions
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Activity className="w-4 h-4 mr-2" />
                System Health Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
