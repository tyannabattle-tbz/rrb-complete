import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default function QumusLanding() {
  const [, setLocation] = useLocation();
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    successRate: '0%',
    ecosystemCommands: 0,
    autonomyLevel: '90%',
  });

  useEffect(() => {
    // Fetch metrics from Qumus
    const fetchMetrics = async () => {
      try {
        // This would call the actual Qumus API
        setMetrics({
          activeTasks: 12,
          successRate: '94.5%',
          ecosystemCommands: 287,
          autonomyLevel: '90%',
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-purple-300 hover:text-purple-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
              <div className="text-3xl">🧠</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Qumus Orchestration</h1>
                <p className="text-xs text-purple-300">Autonomous AI Engine</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
              🟢 Online
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Autonomous Orchestration Engine
          </h2>
          <p className="text-xl text-purple-300 mb-8 max-w-2xl mx-auto">
            90% autonomous control with human oversight. Qumus manages all RRB ecosystem systems,
            makes intelligent decisions, and executes tasks autonomously.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.activeTasks}</div>
              <p className="text-xs text-purple-400 mt-1">Currently executing</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{metrics.successRate}</div>
              <p className="text-xs text-purple-400 mt-1">Task completion</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Ecosystem Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{metrics.ecosystemCommands}</div>
              <p className="text-xs text-purple-400 mt-1">Total executed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Autonomy Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{metrics.autonomyLevel}</div>
              <p className="text-xs text-purple-400 mt-1">AI control</p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🤖</span> Task Execution
              </CardTitle>
              <CardDescription>Autonomous task processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-300">
                Qumus automatically executes tasks with LLM-powered decision making. Each task is evaluated
                against multiple policies before execution.
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                View Task Queue →
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚙️</span> Policy Management
              </CardTitle>
              <CardDescription>Autonomous decision policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-300">
                12+ autonomous policies control Qumus behavior. Policies evaluate safety, impact, and alignment
                before any action is taken.
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Manage Policies →
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span> Decision Audit Trail
              </CardTitle>
              <CardDescription>Complete decision logging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-300">
                Every decision made by Qumus is logged with reasoning, policies applied, and outcomes.
                Full transparency and accountability.
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                View Audit Trail →
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🌐</span> Ecosystem Control
              </CardTitle>
              <CardDescription>Orchestrate all systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-300">
                Qumus controls RRB radio, HybridCast emergency, donations, merchandise, and all other
                ecosystem components.
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                System Control →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Capabilities */}
        <Card className="bg-slate-800/50 border-purple-500/20 mb-12">
          <CardHeader>
            <CardTitle>Qumus Capabilities</CardTitle>
            <CardDescription>What Qumus can do autonomously</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Schedule radio broadcasts 24/7',
                'Manage listener preferences',
                'Execute emergency alerts',
                'Process donations autonomously',
                'Manage merchandise inventory',
                'Make policy decisions',
                'Execute healing frequency sessions',
                'Coordinate game events',
                'Monitor system health',
                'Generate reports',
                'Optimize resource allocation',
                'Handle user requests',
              ].map((capability, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-purple-300">{capability}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle>Control Panel</CardTitle>
            <CardDescription>Human oversight and manual control</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                📊 Dashboard
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                ⚙️ Settings
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                📋 Task History
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                🔍 Monitoring
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                📢 Announcements
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                🆘 Emergency Override
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
