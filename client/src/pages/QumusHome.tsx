/**
 * QUMUS Home Screen
 * 
 * Main dashboard showing all autonomous capabilities:
 * - Task submission and management
 * - Ecosystem command controls
 * - Real-time status monitoring
 * - Memory and learning insights
 */

import { useState, useEffect } from "react";
import { ARGlassInterface } from "@/components/ARGlassInterface";
import { voiceCommandService } from "@/services/voiceCommandService";
import { predictiveAnalyticsService } from "@/services/predictiveAnalyticsService";
import { PredictionsCard } from "@/components/PredictionsCard";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { VoiceCommandTrainer } from "@/components/VoiceCommandTrainer";
import { RealtimeARMetrics } from "@/components/RealtimeARMetrics";
import { VoiceAnalyticsDashboard } from "@/components/VoiceAnalyticsDashboard";
import { HistoricalMetricsViewer } from "@/components/HistoricalMetricsViewer";
import { NeuralBackground } from "@/components/NeuralBackground";
import "@/styles/futuristic.css";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Radio,
  Send,
  RefreshCw,
  TrendingUp,
  Activity,
  BarChart3,
  Globe,
  Mic,
  Heart,
} from "lucide-react";
import { TaskHistory } from "@/components/TaskHistory";
import { EcosystemStatusDashboard } from "@/components/EcosystemStatusDashboard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useMetricsWebSocket } from "@/hooks/useMetricsWebSocket";
import { Brain as BrainIcon, Glasses } from "lucide-react";

export default function QumusHome() {
  const [taskGoal, setTaskGoal] = useState("");
  const [taskPriority, setTaskPriority] = useState("5");
  const [selectedTarget, setSelectedTarget] = useState("rrb");
  const [selectedAction, setSelectedAction] = useState("schedule_broadcast");
  const [commandParams, setCommandParams] = useState("");
  const [activeTab, setActiveTab] = useState<'tasks' | 'commands' | 'monitoring' | 'insights' | 'history' | 'ecosystem' | 'analytics'>('tasks');
  const { metrics, isConnected } = useMetricsWebSocket();
  const [showARInterface, setShowARInterface] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('analytical');
  const [taskPrediction, setTaskPrediction] = useState<any>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showPremiumPlans, setShowPremiumPlans] = useState(false);
  const [showVoiceAnalytics, setShowVoiceAnalytics] = useState(false);
  const [showHistoricalMetrics, setShowHistoricalMetrics] = useState(false);
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);
  const [showRealtimeMetrics, setShowRealtimeMetrics] = useState(false);

  // tRPC queries
  const statusQuery = trpc.autonomousTask.getStatus.useQuery();
  const activePlansQuery = trpc.autonomousTask.getActivePlans.useQuery();
  const commandHistoryQuery = trpc.autonomousTask.getCommandHistory.useQuery({
    limit: 10,
  });
  const successRateQuery = trpc.autonomousTask.getSuccessRate.useQuery();
  const learningsQuery = trpc.autonomousTask.getLearnings.useQuery();

  // tRPC mutations
  const submitTaskMutation = trpc.autonomousTask.submitTask.useMutation({
    onSuccess: () => {
      setTaskGoal("");
      setTaskPriority("5");
      statusQuery.refetch();
      activePlansQuery.refetch();
    },
  });

  const submitCommandMutation =
    trpc.autonomousTask.submitEcosystemCommand.useMutation({
      onSuccess: () => {
        setCommandParams("");
        commandHistoryQuery.refetch();
      },
    });

  const handleSubmitTask = async () => {
    if (!taskGoal.trim()) return;
    const prediction = predictiveAnalyticsService.predictTaskOutcome(taskGoal, parseInt(taskPriority));
    setTaskPrediction(prediction);
    await submitTaskMutation.mutateAsync({
      goal: taskGoal,
      priority: parseInt(taskPriority),
    });
  };

  const handleVoiceCommand = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      voiceCommandService.startListening((transcript) => {
        setTaskGoal(transcript);
      });
    } else {
      voiceCommandService.stopListening();
    }
  };

  const handlePersonaChange = (persona: string) => {
    setSelectedPersona(persona);
    voiceCommandService.setPersona(persona);
  };

  const handleShowPredictions = () => {
    if (taskGoal.trim()) {
      const prediction = predictiveAnalyticsService.predictTaskOutcome(taskGoal, parseInt(taskPriority));
      setTaskPrediction(prediction);
      setShowPredictions(true);
    }
  };

  const handleSubmitCommand = async () => {
    if (!selectedAction) return;

    try {
      const params = commandParams ? JSON.parse(commandParams) : {};
      await submitCommandMutation.mutateAsync({
        target: selectedTarget as "rrb" | "hybridcast" | "canryn" | "sweet_miracles",
        action: selectedAction,
        params,
      });
    } catch (error) {
      console.error("Invalid JSON params");
    }
  };

  const status = statusQuery.data?.qumusStatus;
  const agentStatus = statusQuery.data?.agent;
  const ecosystem = statusQuery.data?.ecosystem;
  const activePlans = activePlansQuery.data?.plans || [];
  const commands = commandHistoryQuery.data?.commands || [];
  const successRate = successRateQuery.data?.percentage || "N/A";
  const learnings = learningsQuery.data?.learnings || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 pt-24">
      <NeuralBackground />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Mobile Title - Hidden on large screens */}
        <div className="lg:hidden mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">QUMUS</h1>
          <p className="text-sm text-slate-400">Autonomous Orchestration Engine • 90%+ Autonomy • Full Ecosystem Control</p>
        </div>

        {/* Status Overview */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {status.isActive ? (
                    <>
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-lg font-bold text-green-500">
                        ACTIVE
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-red-500" size={20} />
                      <span className="text-lg font-bold text-red-500">
                        INACTIVE
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {agentStatus?.queueLength || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">
                  {successRate}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Ecosystem Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {ecosystem?.totalCommands || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Control Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="tasks" className="text-slate-300">
              <Zap size={16} className="mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="commands" className="text-slate-300">
              <Radio size={16} className="mr-2" />
              Commands
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-slate-300">
              <TrendingUp size={16} className="mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-slate-300">
              <Brain size={16} className="mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Submit Autonomous Task</CardTitle>
                <CardDescription className="text-slate-400">
                  Submit goals for QUMUS to execute autonomously
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-300">Task Goal</label>
                    <Button onClick={handleVoiceCommand} size="sm" variant={isVoiceActive ? "default" : "outline"} className={isVoiceActive ? "bg-red-600 hover:bg-red-700" : "border-slate-600"}>
                      <Mic size={14} className="mr-1" />
                      {isVoiceActive ? "Listening..." : "Voice"}
                    </Button>
                  </div>
                  <Textarea value={taskGoal} onChange={(e) => setTaskGoal(e.target.value)} placeholder="e.g., Generate 10 marketing videos with branding..." className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500" />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Priority (1-10)
                  </label>
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                        <SelectItem key={p} value={p.toString()}>
                          {p} - {p <= 3 ? "Low" : p <= 7 ? "Medium" : "High"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleShowPredictions} disabled={!taskGoal.trim()} variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                    <BrainIcon size={16} className="mr-2" />
                    Predict
                  </Button>
                  <Button onClick={handleSubmitTask} disabled={!taskGoal.trim() || submitTaskMutation.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <Send size={16} className="mr-2" />
                    {submitTaskMutation.isPending ? "Submitting..." : "Submit Task"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Predictions */}
            {showPredictions && taskPrediction && <PredictionsCard prediction={taskPrediction} />}

            {/* Active Plans */}
            {activePlans.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Active Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-3 bg-slate-700 rounded border border-slate-600"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-white">{plan.id}</p>
                            <p className="text-sm text-slate-400">
                              {plan.stepCount} steps • {plan.estimatedDuration}m
                            </p>
                          </div>
                          <Badge
                            variant={
                              plan.status === "completed"
                                ? "default"
                                : plan.status === "active"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                plan.status === "completed"
                                  ? 100
                                  : plan.status === "active"
                                    ? 50
                                    : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ecosystem Commands</CardTitle>
                <CardDescription className="text-slate-400">
                  Send commands to RRB, HybridCast, Canryn, and Sweet Miracles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Target System
                    </label>
                    <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="rrb">RRB (Rockin Rockin Boogie)</SelectItem>
                        <SelectItem value="hybridcast">HybridCast</SelectItem>
                        <SelectItem value="canryn">Canryn Production</SelectItem>
                        <SelectItem value="sweet_miracles">Sweet Miracles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Action
                    </label>
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {selectedTarget === "rrb" && (
                          <>
                            <SelectItem value="schedule_broadcast">
                              Schedule Broadcast
                            </SelectItem>
                            <SelectItem value="start_stream">Start Stream</SelectItem>
                            <SelectItem value="stop_stream">Stop Stream</SelectItem>
                            <SelectItem value="update_playlist">Update Playlist</SelectItem>
                          </>
                        )}
                        {selectedTarget === "hybridcast" && (
                          <>
                            <SelectItem value="send_broadcast">
                              Send Broadcast
                            </SelectItem>
                            <SelectItem value="emergency_alert">
                              Emergency Alert
                            </SelectItem>
                            <SelectItem value="activate_mesh">Activate Mesh</SelectItem>
                          </>
                        )}
                        {selectedTarget === "canryn" && (
                          <>
                            <SelectItem value="create_project">
                              Create Project
                            </SelectItem>
                            <SelectItem value="update_production">
                              Update Production
                            </SelectItem>
                          </>
                        )}
                        {selectedTarget === "sweet_miracles" && (
                          <>
                            <SelectItem value="process_donation">
                              Process Donation
                            </SelectItem>
                            <SelectItem value="send_gratitude">Send Gratitude</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Parameters (JSON)
                  </label>
                  <Input
                    value={commandParams}
                    onChange={(e) => setCommandParams(e.target.value)}
                    placeholder='{"title": "Live Stream", "duration": 60}'
                    className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500 font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleSubmitCommand}
                  disabled={submitCommandMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Radio size={16} className="mr-2" />
                  {submitCommandMutation.isPending ? "Sending..." : "Send Command"}
                </Button>
              </CardContent>
            </Card>

            {/* Command History */}
            {commands.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {commands.map((cmd) => (
                      <div
                        key={cmd.id}
                        className="p-2 bg-slate-700 rounded text-sm border border-slate-600"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-white">
                              {cmd.target.toUpperCase()}
                            </span>
                            <span className="text-slate-400 mx-2">→</span>
                            <span className="text-slate-300">{cmd.action}</span>
                          </div>
                          <Badge
                            variant={
                              cmd.status === "completed" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {cmd.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" />
                    Agent Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Running:</span>
                    <span className="text-white font-medium">
                      {agentStatus?.isRunning ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tasks Queued:</span>
                    <span className="text-white font-medium">
                      {agentStatus?.queueLength}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tools Available:</span>
                    <span className="text-white font-medium">
                      {agentStatus?.toolCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Policies Active:</span>
                    <span className="text-white font-medium">
                      {agentStatus?.policyCount}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain size={18} className="text-blue-500" />
                    Memory System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Facts Stored:</span>
                    <span className="text-white font-medium">
                      {statusQuery.data?.memory?.factCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experiences:</span>
                    <span className="text-white font-medium">
                      {statusQuery.data?.memory?.experienceCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Context Size:</span>
                    <span className="text-white font-medium">
                      {statusQuery.data?.memory?.contextSize || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Radio size={18} className="text-purple-500" />
                    Ecosystem Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Commands:</span>
                    <span className="text-white font-medium">
                      {ecosystem?.totalCommands || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed:</span>
                    <span className="text-emerald-400 font-medium">
                      {ecosystem?.completedCommands || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Failed:</span>
                    <span className="text-red-400 font-medium">
                      {ecosystem?.failedCommands || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success Rate:</span>
                    <span className="text-emerald-400 font-medium">
                      {successRate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Plans:</span>
                    <span className="text-white font-medium">{activePlans.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Learnings:</span>
                    <span className="text-white font-medium">{learnings.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {learnings.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Autonomous Learnings</CardTitle>
                  <CardDescription className="text-slate-400">
                    Insights extracted from autonomous operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {learnings.map((learning, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-700 rounded border-l-4 border-blue-500"
                      >
                        <p className="text-white text-sm">{learning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Concurrent Tasks:</span>
                  <span className="text-white font-medium">
                    {status?.config?.maxConcurrentTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auto Scheduling:</span>
                  <Badge variant="default" className="text-xs">
                    {status?.config?.enableAutoScheduling ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Self Improvement:</span>
                  <Badge variant="default" className="text-xs">
                    {status?.config?.enableSelfImprovement ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Multi-Agent Coordination:</span>
                  <Badge variant="default" className="text-xs">
                    {status?.config?.enableMultiAgentCoordination
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Predictive Analytics:</span>
                  <Badge variant="default" className="text-xs">
                    {status?.config?.enablePredictiveAnalytics
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Personas & Advanced Controls */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BrainIcon size={18} className="text-purple-400" />
              AI Personas & Advanced Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Select AI Persona</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['analytical', 'creative', 'aggressive', 'conservative'].map((persona) => (
                  <Button key={persona} onClick={() => handlePersonaChange(persona)} variant={selectedPersona === persona ? "default" : "outline"} className={selectedPersona === persona ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600"}>
                    {persona.charAt(0).toUpperCase() + persona.slice(1)}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Current: <span className="text-purple-400 font-medium">{selectedPersona}</span> mode</p>
            </div>
          </CardContent>
        </Card>

        {/* AR Glass Interface */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Glasses size={18} className="text-cyan-400" />
              Google Glass AR Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowARInterface(!showARInterface)} className={showARInterface ? "w-full bg-cyan-600 hover:bg-cyan-700" : "w-full bg-slate-700 hover:bg-slate-600 border border-slate-600"}>
              <Glasses size={16} className="mr-2" />
              {showARInterface ? "Hide AR Interface" : "Show AR Interface"}
            </Button>
            <p className="text-xs text-slate-400 mt-2">Enable augmented reality visualization for real-time task monitoring and holographic displays</p>
          </CardContent>
        </Card>

        {/* AR Glass Interface Component */}
        {showARInterface && <ARGlassInterface />}

        {/* Real-time AR Metrics */}
        {showRealtimeMetrics && <RealtimeARMetrics />}

        {/* Premium Features Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button onClick={() => setShowPremiumPlans(!showPremiumPlans)} className={showPremiumPlans ? "w-full bg-yellow-600 hover:bg-yellow-700" : "w-full bg-slate-700 hover:bg-slate-600 border border-slate-600"}>
                <Zap size={16} className="mr-2" />
                {showPremiumPlans ? "Hide" : "Show"} Plans
              </Button>
              <Button onClick={() => setShowVoiceAnalytics(!showVoiceAnalytics)} className={showVoiceAnalytics ? "w-full bg-purple-600 hover:bg-purple-700" : "w-full bg-slate-700 hover:bg-slate-600 border border-slate-600"}>
                <Mic size={16} className="mr-2" />
                {showVoiceAnalytics ? "Hide" : "Show"} Voice Stats
              </Button>
              <Button onClick={() => setShowHistoricalMetrics(!showHistoricalMetrics)} className={showHistoricalMetrics ? "w-full bg-blue-600 hover:bg-blue-700" : "w-full bg-slate-700 hover:bg-slate-600 border border-slate-600"}>
                <TrendingUp size={16} className="mr-2" />
                {showHistoricalMetrics ? "Hide" : "Show"} History
              </Button>
              <Button onClick={() => setShowVoiceTraining(!showVoiceTraining)} className={showVoiceTraining ? "w-full bg-cyan-600 hover:bg-cyan-700" : "w-full bg-slate-700 hover:bg-slate-600 border border-slate-600"}>
                <Mic size={16} className="mr-2" />
                {showVoiceTraining ? "Hide" : "Show"} Train
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Plans */}
        {showPremiumPlans && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StripeCheckoutButton
              productName="AR Glass Pro"
              priceId="price_ar_glass_pro"
              amount={9900}
              currency="USD"
              description="Advanced AR visualization and real-time metrics"
            />
            <StripeCheckoutButton
              productName="Voice Training Suite"
              priceId="price_voice_training"
              amount={4900}
              currency="USD"
              description="Unlimited custom voice commands"
            />
            <StripeCheckoutButton
              productName="QUMUS Enterprise"
              priceId="price_qumus_enterprise"
              amount={29900}
              currency="USD"
              description="All features + priority support"
            />
          </div>
        )}

        {/* Voice Analytics Dashboard */}
        {showVoiceAnalytics && <VoiceAnalyticsDashboard />}

        {/* Historical Metrics Viewer */}
        {showHistoricalMetrics && <HistoricalMetricsViewer />}

        {/* Voice Command Training */}
        {showVoiceTraining && <VoiceCommandTrainer />}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            onClick={async () => {
              try {
                await Promise.all([
                  statusQuery.refetch(),
                  activePlansQuery.refetch(),
                  commandHistoryQuery.refetch(),
                  successRateQuery.refetch(),
                  learningsQuery.refetch()
                ]);
                voiceCommandService.speak('Status refreshed successfully');
              } catch (error) {
                console.error('Refresh failed:', error);
                voiceCommandService.speak('Refresh failed, please try again');
              }
            }}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}
