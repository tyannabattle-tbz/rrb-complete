import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Gauge,
  Cpu,
  Database,
  Radio,
  Heart,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Eye,
  Send,
  Play,
  AlertTriangle as AlertIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Real-Time Monitoring & Analytics Dashboard
 * Displays QUMUS orchestration metrics, system health, and platform analytics
 */
export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("qumus");
  const [liveMetrics, setLiveMetrics] = useState({
    queueDepth: 23,
    decisionsPerMinute: 156,
    avgLatency: 120,
    throughput: 2500,
    systemLoad: 45,
    errorRate: 0.8,
    uptime: 99.98,
    activePolicies: 8,
  });

  const [platformMetrics, setPlatformMetrics] = useState({
    sweetMiracles: {
      donationsPerHour: 12,
      avgDonationAmount: 250,
      donorRetention: 94.2,
      campaignEngagement: 87.5,
    },
    rockinBoogie: {
      contentPerDay: 8,
      listenersPerHour: 5000,
      avgSessionDuration: 24,
      shareRate: 12.3,
    },
    hybridCast: {
      broadcastsPerDay: 15,
      networkCoverage: 98.5,
      meshNodeHealth: 99.2,
      avgLatency: 45,
    },
  });

  const [policyMetrics, setPolicyMetrics] = useState([
    { name: "DonorOutreachPolicy", executions: 245, avgLatency: 150, errorRate: 0.5, status: "optimal" },
    { name: "GrantApplicationPolicy", executions: 89, avgLatency: 280, errorRate: 0.2, status: "optimal" },
    { name: "EmergencyAlertPriorityPolicy", executions: 456, avgLatency: 95, errorRate: 0.1, status: "optimal" },
    { name: "FundraisingCampaignPolicy", executions: 178, avgLatency: 200, errorRate: 0.3, status: "optimal" },
    { name: "WellnessCheckInPolicy", executions: 234, avgLatency: 320, errorRate: 0.4, status: "optimal" },
    { name: "ContentGenerationPolicy", executions: 156, avgLatency: 1200, errorRate: 0.6, status: "optimal" },
    { name: "BroadcastSchedulingPolicy", executions: 89, avgLatency: 180, errorRate: 0.2, status: "optimal" },
    { name: "AnalyticsAggregationPolicy", executions: 567, avgLatency: 110, errorRate: 0.1, status: "optimal" },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        queueDepth: Math.max(0, prev.queueDepth + Math.floor(Math.random() * 10 - 5)),
        decisionsPerMinute: prev.decisionsPerMinute + Math.floor(Math.random() * 20 - 10),
        avgLatency: Math.max(50, prev.avgLatency + Math.floor(Math.random() * 30 - 15)),
        throughput: prev.throughput + Math.floor(Math.random() * 200 - 100),
        systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.floor(Math.random() * 8 - 4))),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() * 0.2 - 0.1))),
        uptime: Math.min(100, prev.uptime + Math.random() * 0.001),
        activePolicies: prev.activePolicies,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-green-400";
    if (value <= thresholds.warning) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Real-Time Monitoring & Analytics</h1>
        <p className="text-gray-400">Live metrics for QUMUS orchestration and all platforms</p>
      </div>

      {/* Live Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" /> Queue Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(liveMetrics.queueDepth, { good: 50, warning: 150 })}`}>
              {liveMetrics.queueDepth}
            </div>
            <p className="text-xs text-gray-500 mt-1">Requests pending</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Decisions/Min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{liveMetrics.decisionsPerMinute}</div>
            <p className="text-xs text-gray-500 mt-1">Policy executions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(liveMetrics.avgLatency, { good: 150, warning: 300 })}`}>
              {liveMetrics.avgLatency}ms
            </div>
            <p className="text-xs text-gray-500 mt-1">Response time</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-purple-400" /> System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(liveMetrics.systemLoad, { good: 50, warning: 75 })}`}>
              {liveMetrics.systemLoad}%
            </div>
            <p className="text-xs text-gray-500 mt-1">CPU & memory</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800 border border-slate-700">
          <TabsTrigger value="qumus">QUMUS</TabsTrigger>
          <TabsTrigger value="sweetMiracles" className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>Sweet Miracles</span>
          </TabsTrigger>
          <TabsTrigger value="rockinBoogie" className="flex items-center gap-1">
            <Radio className="w-4 h-4" />
            <span>Rockin' Boogie</span>
          </TabsTrigger>
          <TabsTrigger value="hybridCast" className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>HybridCast</span>
          </TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* QUMUS Metrics Tab */}
        <TabsContent value="qumus" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key Metrics */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" /> Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Throughput</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-cyan-400">{liveMetrics.throughput}</span>
                      <span className="text-xs text-gray-500">req/s</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (liveMetrics.throughput / 5000) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Error Rate</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getStatusColor(liveMetrics.errorRate, { good: 1, warning: 2 })}`}>
                        {liveMetrics.errorRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        liveMetrics.errorRate < 1 ? "bg-green-500" : liveMetrics.errorRate < 2 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, liveMetrics.errorRate * 20)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">System Uptime</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-400">{liveMetrics.uptime.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${liveMetrics.uptime}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" /> System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Overall Status</span>
                    <Badge className="bg-green-500">✓ Healthy</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Policies</span>
                    <span className="text-green-400 font-semibold">{liveMetrics.activePolicies}/8</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Circuit Breakers</span>
                    <span className="text-green-400 font-semibold">All Closed</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Incident</span>
                    <span className="text-gray-300 font-semibold">2 days ago</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded">
                  <p className="text-sm text-green-200">All systems operational. QUMUS running at optimal capacity.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Policy Execution Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policyMetrics.map((policy) => (
                  <div key={policy.name} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-200">{policy.name}</h3>
                        <p className="text-xs text-gray-500">Status: {policy.status}</p>
                      </div>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Executions</p>
                        <p className="text-lg font-bold text-cyan-400">{policy.executions}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Avg Latency</p>
                        <p className="text-lg font-bold text-blue-400">{policy.avgLatency}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Error Rate</p>
                        <p className={`text-lg font-bold ${getStatusColor(policy.errorRate, { good: 0.5, warning: 1 })}`}>
                          {policy.errorRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Upload Monitoring Tab */}
        <TabsContent value="uploads" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> File Upload & Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Uploads</p>
                  <p className="text-2xl font-bold text-blue-400 mt-2">1,247</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400 mt-2">98.5%</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Avg Upload Time</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-2">2.3s</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Processing Jobs</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-2">156</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-900 border border-blue-700 rounded">
                <p className="text-sm text-blue-200">📁 File uploads: Documents (50MB), Images (10MB), Audio (100MB) - All types supported</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sweet Miracles */}
            <Card className="bg-gradient-to-br from-green-900 to-slate-800 border-green-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-400" /> Sweet Miracles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Donations/Hour</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-green-400">{platformMetrics.sweetMiracles.donationsPerHour}</span>
                    <ArrowUp className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Donation</p>
                  <p className="text-2xl font-bold text-green-300">${platformMetrics.sweetMiracles.avgDonationAmount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Donor Retention</p>
                  <p className="text-2xl font-bold text-green-300">{platformMetrics.sweetMiracles.donorRetention}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Campaign Engagement</p>
                  <p className="text-2xl font-bold text-green-300">{platformMetrics.sweetMiracles.campaignEngagement}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Rockin' Boogie */}
            <Card className="bg-gradient-to-br from-orange-900 to-slate-800 border-orange-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Radio className="w-5 h-5 text-orange-400" /> Rockin' Boogie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Content/Day</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-orange-400">{platformMetrics.rockinBoogie.contentPerDay}</span>
                    <ArrowUp className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Listeners/Hour</p>
                  <p className="text-2xl font-bold text-orange-300">{platformMetrics.rockinBoogie.listenersPerHour}K</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Session</p>
                  <p className="text-2xl font-bold text-orange-300">{platformMetrics.rockinBoogie.avgSessionDuration}m</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Share Rate</p>
                  <p className="text-2xl font-bold text-orange-300">{platformMetrics.rockinBoogie.shareRate}%</p>
                </div>
              </CardContent>
            </Card>

            {/* HybridCast */}
            <Card className="bg-gradient-to-br from-blue-900 to-slate-800 border-blue-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" /> HybridCast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Broadcasts/Day</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-blue-400">{platformMetrics.hybridCast.broadcastsPerDay}</span>
                    <ArrowUp className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Network Coverage</p>
                  <p className="text-2xl font-bold text-blue-300">{platformMetrics.hybridCast.networkCoverage}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mesh Health</p>
                  <p className="text-2xl font-bold text-blue-300">{platformMetrics.hybridCast.meshNodeHealth}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Latency</p>
                  <p className="text-2xl font-bold text-blue-300">{platformMetrics.hybridCast.avgLatency}ms</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" /> System Alerts & Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-green-900 border border-green-700 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-300">All Systems Operational</p>
                  <p className="text-sm text-green-200">QUMUS running at optimal capacity with zero critical alerts</p>
                  <p className="text-xs text-green-400 mt-1">2 minutes ago</p>
                </div>
              </div>

              <div className="bg-blue-900 border border-blue-700 p-4 rounded-lg flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-300">High Throughput Detected</p>
                  <p className="text-sm text-blue-200">System processing 2,500+ requests per second - within normal range</p>
                  <p className="text-xs text-blue-400 mt-1">15 minutes ago</p>
                </div>
              </div>

              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-300">Routine Maintenance Completed</p>
                  <p className="text-sm text-gray-400">Daily metrics reset and cache optimization completed successfully</p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
              </div>

              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg flex items-start gap-3">
                <Zap className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-300">Policy Execution Summary</p>
                  <p className="text-sm text-gray-400">All 8 policies executed 2,847 times with 99.2% success rate</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg text-center">
        <p className="text-gray-400 text-sm">
          Last updated: {new Date().toLocaleTimeString()} • Refresh interval: 2 seconds • QUMUS Status: AUTONOMOUS MODE ACTIVE
        </p>
      </div>
    </div>
  );
}
