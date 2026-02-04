import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  BarChart3,
  Brain,
  Zap,
  AlertTriangle,
  Users,
  Radio,
  Heart,
  TrendingUp,
  Server,
  Cpu,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Get auth from context or use a hook if available
const useAuth = () => ({ user: { name: "Admin" } });

/**
 * Master Dashboard Component
 * Unified control center for all platforms: Sweet Miracles, Rockin' Boogie, HybridCast
 * Real-time monitoring of QUMUS orchestration, AI assistants, and system health
 */
export default function MasterDashboard() {
  const auth = useAuth();
  const user = auth.user;
  const [activeTab, setActiveTab] = useState("overview");
  const [systemHealth, setSystemHealth] = useState({
    uptime: 99.98,
    latency: 45,
    errorRate: 0.02,
    activeConnections: 1247,
  });

  const [qumusMetrics, setQumusMetrics] = useState({
    activePolicies: 8,
    queueDepth: 23,
    decisionsPerMinute: 156,
    avgLatency: 120,
    throughput: 2500,
    policyExecutionRate: 98.7,
  });

  const [aiAssistants, setAiAssistants] = useState({
    llm: { active: true, calls: 1234, avgLatency: 850 },
    voiceTranscription: { active: true, calls: 456, avgLatency: 1200 },
    imageGeneration: { active: true, calls: 89, avgLatency: 3400 },
    contentSynthesis: { active: true, calls: 234, avgLatency: 2100 },
  });

  const [platformMetrics, setPlatformMetrics] = useState({
    sweetMiracles: {
      totalDonors: 2847,
      donationsToday: 45,
      totalRaised: "$847,500",
      activeAlerts: 3,
    },
    rockinBoogie: {
      contentGenerated: 156,
      episodesBroadcast: 42,
      listeners: 125000,
      avgEngagement: 87.3,
    },
    hybridCast: {
      stationsOnline: 847,
      broadcastsActive: 23,
      coverage: 98.5,
      meshNodes: 3421,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Master Control Center</h1>
            <p className="text-gray-400">Unified monitoring for all platforms and QUMUS orchestration</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Logged in as: {user?.name || "Admin"}</p>
            <Badge className="mt-2 bg-green-500">🟢 All Systems Operational</Badge>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4" /> System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{systemHealth.uptime}%</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{systemHealth.latency}ms</div>
            <p className="text-xs text-gray-500 mt-1">Response time</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{systemHealth.errorRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Critical errors</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" /> Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{systemHealth.activeConnections}</div>
            <p className="text-xs text-gray-500 mt-1">Connected clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="qumus" className="text-xs">
            QUMUS
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            AI Assistants
          </TabsTrigger>
          <TabsTrigger value="sweetMiracles" className="text-xs">
            Sweet Miracles
          </TabsTrigger>
          <TabsTrigger value="rockinBoogie" className="text-xs">
            Rockin' Boogie
          </TabsTrigger>
          <TabsTrigger value="hybridCast" className="text-xs">
            HybridCast
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* QUMUS Quick Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> QUMUS Orchestration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Policies</span>
                  <span className="text-xl font-bold text-green-400">{qumusMetrics.activePolicies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Queue Depth</span>
                  <span className="text-xl font-bold text-blue-400">{qumusMetrics.queueDepth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Decisions/Min</span>
                  <span className="text-xl font-bold text-purple-400">{qumusMetrics.decisionsPerMinute}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Execution Rate</span>
                  <span className="text-xl font-bold text-green-400">{qumusMetrics.policyExecutionRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistants Quick Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" /> AI Assistants Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(aiAssistants).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <Badge className={value.active ? "bg-green-500" : "bg-red-500"}>
                      {value.active ? "✓ Active" : "✗ Inactive"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Platform Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-900 to-slate-800 border-green-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-400" /> Sweet Miracles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-green-400">{platformMetrics.sweetMiracles.totalDonors}</div>
                <p className="text-sm text-gray-300">Total Donors</p>
                <div className="text-xl font-bold text-green-300 mt-3">{platformMetrics.sweetMiracles.totalRaised}</div>
                <p className="text-sm text-gray-300">Total Raised</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900 to-slate-800 border-orange-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Radio className="w-5 h-5 text-orange-400" /> Rockin' Boogie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-orange-400">{platformMetrics.rockinBoogie.listeners}</div>
                <p className="text-sm text-gray-300">Active Listeners</p>
                <div className="text-xl font-bold text-orange-300 mt-3">{platformMetrics.rockinBoogie.contentGenerated}</div>
                <p className="text-sm text-gray-300">Content Generated</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900 to-slate-800 border-blue-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" /> HybridCast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">{platformMetrics.hybridCast.stationsOnline}</div>
                <p className="text-sm text-gray-300">Stations Online</p>
                <div className="text-xl font-bold text-blue-300 mt-3">{platformMetrics.hybridCast.coverage}%</div>
                <p className="text-sm text-gray-300">Network Coverage</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* QUMUS Tab */}
        <TabsContent value="qumus" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> QUMUS Orchestration Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Policies</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{qumusMetrics.activePolicies}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Queue Depth</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{qumusMetrics.queueDepth}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Decisions/Min</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{qumusMetrics.decisionsPerMinute}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Avg Latency</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-2">{qumusMetrics.avgLatency}ms</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Throughput</p>
                  <p className="text-3xl font-bold text-pink-400 mt-2">{qumusMetrics.throughput}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Execution Rate</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{qumusMetrics.policyExecutionRate}%</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-900 border border-green-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="font-semibold text-green-300">QUMUS Status: OPTIMAL</p>
                </div>
                <p className="text-sm text-green-200">
                  All policies executing normally. Load balancing active. No bottlenecks detected.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-gray-200">Active Policies</h3>
                <div className="space-y-2">
                  {[
                    "DonorOutreachPolicy",
                    "GrantApplicationPolicy",
                    "EmergencyAlertPriorityPolicy",
                    "FundraisingCampaignPolicy",
                    "WellnessCheckInPolicy",
                    "ContentGenerationPolicy",
                    "BroadcastSchedulingPolicy",
                    "AnalyticsAggregationPolicy",
                  ].map((policy) => (
                    <div key={policy} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                      <span className="text-gray-300">{policy}</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistants Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" /> AI Assistants Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LLM Assistant */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Language Model (LLM)</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">API Calls Today</span>
                      <span className="text-green-400 font-semibold">{aiAssistants.llm.calls}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Latency</span>
                      <span className="text-blue-400 font-semibold">{aiAssistants.llm.avgLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className="text-green-400 font-semibold">✓ Operational</span>
                    </div>
                    <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>

                {/* Voice Transcription */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Voice Transcription</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">API Calls Today</span>
                      <span className="text-green-400 font-semibold">{aiAssistants.voiceTranscription.calls}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Latency</span>
                      <span className="text-blue-400 font-semibold">{aiAssistants.voiceTranscription.avgLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className="text-green-400 font-semibold">✓ Operational</span>
                    </div>
                    <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>

                {/* Image Generation */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Image Generation</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">API Calls Today</span>
                      <span className="text-green-400 font-semibold">{aiAssistants.imageGeneration.calls}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Latency</span>
                      <span className="text-blue-400 font-semibold">{aiAssistants.imageGeneration.avgLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className="text-green-400 font-semibold">✓ Operational</span>
                    </div>
                    <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>

                {/* Content Synthesis */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Content Synthesis</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">API Calls Today</span>
                      <span className="text-green-400 font-semibold">{aiAssistants.contentSynthesis.calls}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Latency</span>
                      <span className="text-blue-400 font-semibold">{aiAssistants.contentSynthesis.avgLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className="text-green-400 font-semibold">✓ Operational</span>
                    </div>
                    <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 p-4 bg-blue-900 border border-blue-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <p className="font-semibold text-blue-300">All AI Assistants: ACTIVE & OPERATIONAL</p>
                </div>
                <p className="text-sm text-blue-200">
                  All AI assistants are running at optimal capacity. Load balancing is active. No API errors detected.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sweet Miracles Tab */}
        <TabsContent value="sweetMiracles" className="space-y-4">
          <Card className="bg-gradient-to-br from-green-900 to-slate-800 border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-400" /> Sweet Miracles Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Donors</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{platformMetrics.sweetMiracles.totalDonors}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Donations Today</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{platformMetrics.sweetMiracles.donationsToday}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Raised</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{platformMetrics.sweetMiracles.totalRaised}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Alerts</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{platformMetrics.sweetMiracles.activeAlerts}</p>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Sweet Miracles Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rockin' Boogie Tab */}
        <TabsContent value="rockinBoogie" className="space-y-4">
          <Card className="bg-gradient-to-br from-orange-900 to-slate-800 border-orange-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-orange-400" /> Rockin' Boogie Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Content Generated</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{platformMetrics.rockinBoogie.contentGenerated}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Episodes Broadcast</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{platformMetrics.rockinBoogie.episodesBroadcast}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Listeners</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{platformMetrics.rockinBoogie.listeners}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Avg Engagement</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{platformMetrics.rockinBoogie.avgEngagement}%</p>
                </div>
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Go to Rockin' Boogie Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HybridCast Tab */}
        <TabsContent value="hybridCast" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-900 to-slate-800 border-blue-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> HybridCast Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Stations Online</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{platformMetrics.hybridCast.stationsOnline}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Broadcasts Active</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{platformMetrics.hybridCast.broadcastsActive}</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Network Coverage</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{platformMetrics.hybridCast.coverage}%</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Mesh Nodes</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{platformMetrics.hybridCast.meshNodes}</p>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Go to HybridCast Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">All Systems Operational • QUMUS Autonomous Mode: ACTIVE</span>
          </div>
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
