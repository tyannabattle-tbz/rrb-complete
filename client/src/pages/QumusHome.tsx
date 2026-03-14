/**
 * QUMUS Home Screen - Production Recovery
 * 
 * Main dashboard showing all autonomous capabilities:
 * - Task submission and management
 * - Ecosystem command controls
 * - Real-time status monitoring
 * - Memory and learning insights
 * - RRB ecosystem integration
 */

import { useState, useEffect } from "react";
import { useRestreamUrl } from '@/hooks/useRestreamUrl';
import { ARGlassInterface } from "@/components/ARGlassInterface";
import { voiceCommandService } from "@/services/voiceCommandService";
import { predictiveAnalyticsService } from "@/services/predictiveAnalyticsService";
import { PredictionsCard } from "@/components/PredictionsCard";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { VoiceCommandTrainer } from "@/components/VoiceCommandTrainer";
import { RealtimeARMetrics } from "@/components/RealtimeARMetrics";
import { VoiceAnalyticsDashboard } from "@/components/VoiceAnalyticsDashboard";
import { HistoricalMetricsViewer } from "@/components/HistoricalMetricsViewer";
import { AdminQuickLinks } from "@/components/AdminQuickLinks";
import { RRBDonationForm } from "@/components/RRBDonationForm";
import { NeuralBackground } from "@/components/NeuralBackground";
import {
  FuturisticCard,
  FuturisticButton,
  FuturisticMetric,
  FuturisticHeader,
  FuturisticGrid,
  FuturisticSection,
  FuturisticDivider,
  FuturisticBadge,
  FuturisticLoading,
} from "@/components/FuturisticDesignSystem";
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
  Earth,
  Mic,
  Heart,
  Gauge,
  Cpu,
  Wifi,
} from "lucide-react";
import { TaskHistory } from "@/components/TaskHistory";
import { EcosystemStatusDashboard } from "@/components/EcosystemStatusDashboard";
import { StreamHealthWidget } from "@/components/StreamHealthWidget";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useMetricsWebSocket } from "@/hooks/useMetricsWebSocket";
import { Brain as BrainIcon, Glasses, Video, Tv } from "lucide-react";
import { useLocation } from "wouter";

export default function QumusHome() {
  const { openRestream } = useRestreamUrl();
  const [, navigate] = useLocation();
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
  const [showAdminLinks, setShowAdminLinks] = useState(false);
  const [showRRBDonations, setShowRRBDonations] = useState(false);

  // tRPC queries
  const statusQuery = trpc.autonomousTask.getStatus.useQuery(undefined, {
    refetchInterval: 30000, // Auto-refresh every 30s
  });
  const activePlansQuery = trpc.autonomousTask.getActivePlans.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const commandHistoryQuery = trpc.autonomousTask.getCommandHistory.useQuery({
    limit: 10,
  }, {
    refetchInterval: 30000,
  });
  const successRateQuery = trpc.autonomousTask.getSuccessRate.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every 60s
  });
  const learningsQuery = trpc.autonomousTask.getLearnings.useQuery(undefined, {
    refetchInterval: 60000,
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 pt-24 md:pt-28 pb-24 md:pb-8">
      <NeuralBackground />
      <div className="max-w-7xl mx-auto space-y-6 px-2 md:px-0">
        {/* Header */}
        <FuturisticHeader 
          title="QUMUS Control Center"
          subtitle="Autonomous Orchestration Engine • 90%+ Autonomy • Full Ecosystem Control"
          icon={<Brain className="w-8 h-8" />}
        />

        {/* Status Overview - Futuristic Cards */}
        {status && (
          <>
            <FuturisticGrid columns={4}>
              <FuturisticCard glow="cyan">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">System Status</p>
                  <div className="flex items-center gap-2">
                    {status.isActive ? (
                      <>
                        <CheckCircle className="text-green-400" size={24} />
                        <span className="text-2xl font-bold text-green-400">ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-red-400" size={24} />
                        <span className="text-2xl font-bold text-red-400">OFFLINE</span>
                      </>
                    )}
                  </div>
                </div>
              </FuturisticCard>

              <FuturisticCard glow="magenta">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Active Tasks</p>
                  <div className="text-3xl font-bold text-cyan-400">
                    {agentStatus?.queueLength || 0}
                  </div>
                </div>
              </FuturisticCard>

              <FuturisticCard glow="cyan">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Success Rate</p>
                  <div className="text-3xl font-bold text-emerald-400">
                    {successRate}
                  </div>
                </div>
              </FuturisticCard>

              <FuturisticCard glow="magenta">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Ecosystem Commands</p>
                  <div className="text-3xl font-bold text-purple-400">
                    {ecosystem?.totalCommands || 0}
                  </div>
                </div>
              </FuturisticCard>
            </FuturisticGrid>

            <FuturisticDivider animated />
          </>
        )}

        {/* Main Control Tabs */}
        <Tabs defaultValue="tasks" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-1 bg-slate-800/50 border border-slate-700 rounded-lg p-2">
            <TabsTrigger value="tasks" className="text-xs md:text-sm">
              <Zap size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="commands" className="text-xs md:text-sm">
              <Radio size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Commands</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-xs md:text-sm">
              <TrendingUp size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs md:text-sm">
              <Brain size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs md:text-sm">
              <Clock size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="ecosystem" className="text-xs md:text-sm">
              <Earth size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Ecosystem</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">
              <BarChart3 size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <FuturisticSection 
              title="Submit Autonomous Task"
              description="Submit goals for QUMUS to execute autonomously"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-300">Task Goal</label>
                    <FuturisticButton 
                      onClick={handleVoiceCommand} 
                      size="sm" 
                      variant={isVoiceActive ? "primary" : "secondary"}
                      glow={isVoiceActive}
                    >
                      <Mic size={14} className="mr-1" />
                      {isVoiceActive ? "Listening..." : "Voice"}
                    </FuturisticButton>
                  </div>
                  <Textarea 
                    value={taskGoal} 
                    onChange={(e) => setTaskGoal(e.target.value)} 
                    placeholder="e.g., Generate 10 marketing videos with branding..." 
                    className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">Priority (1-10)</label>
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
                  <FuturisticButton 
                    onClick={handleShowPredictions} 
                    disabled={!taskGoal.trim()} 
                    variant="secondary"
                    className="flex-1"
                  >
                    <BrainIcon size={16} className="mr-2" />
                    Predict
                  </FuturisticButton>
                  <FuturisticButton 
                    onClick={handleSubmitTask} 
                    disabled={!taskGoal.trim() || submitTaskMutation.isPending} 
                    variant="primary"
                    glow
                    className="flex-1"
                  >
                    <Send size={16} className="mr-2" />
                    {submitTaskMutation.isPending ? "Submitting..." : "Submit Task"}
                  </FuturisticButton>
                </div>
              </div>
            </FuturisticSection>

            {/* Predictions */}
            {showPredictions && taskPrediction && <PredictionsCard prediction={taskPrediction} />}

            {/* Active Plans */}
            {activePlans.length > 0 && (
              <FuturisticSection title="Active Plans">
                <div className="space-y-3">
                  {activePlans.map((plan) => (
                    <FuturisticCard key={plan.id} glow="cyan">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{plan.goal}</p>
                          <p className="text-sm text-slate-400 mt-1">Priority: {plan.priority}/10</p>
                        </div>
                        <FuturisticBadge variant="success">Active</FuturisticBadge>
                      </div>
                    </FuturisticCard>
                  ))}
                </div>
              </FuturisticSection>
            )}
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-4">
            <FuturisticSection 
              title="Ecosystem Commands"
              description="Send commands to RRB, HybridCast, Canryn, or Sweet Miracles"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Target System</label>
                    <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="rrb">Rockin Rockin Boogie</SelectItem>
                        <SelectItem value="hybridcast">HybridCast</SelectItem>
                        <SelectItem value="canryn">Canryn Production</SelectItem>
                        <SelectItem value="sweet_miracles">Sweet Miracles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Action</label>
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="schedule_broadcast">Schedule Broadcast</SelectItem>
                        <SelectItem value="start_stream">Start Stream</SelectItem>
                        <SelectItem value="stop_stream">Stop Stream</SelectItem>
                        <SelectItem value="update_content">Update Content</SelectItem>
                        <SelectItem value="send_notification">Send Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">Parameters (JSON)</label>
                  <Textarea 
                    value={commandParams} 
                    onChange={(e) => setCommandParams(e.target.value)} 
                    placeholder="{}" 
                    className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500 font-mono text-sm" 
                  />
                </div>

                <FuturisticButton 
                  onClick={handleSubmitCommand} 
                  disabled={!selectedAction || submitCommandMutation.isPending} 
                  variant="primary"
                  glow
                  className="w-full"
                >
                  <Radio size={16} className="mr-2" />
                  {submitCommandMutation.isPending ? "Sending..." : "Send Command"}
                </FuturisticButton>
              </div>
            </FuturisticSection>

            {/* Command History */}
            {commands.length > 0 && (
              <FuturisticSection title="Recent Commands">
                <div className="space-y-2">
                  {commands.slice(0, 5).map((cmd, idx) => (
                    <FuturisticCard key={idx} glow="magenta">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{cmd.action}</p>
                          <p className="text-sm text-slate-400">{cmd.target}</p>
                        </div>
                        <FuturisticBadge variant={cmd.status === 'success' ? 'success' : 'warning'}>
                          {cmd.status}
                        </FuturisticBadge>
                      </div>
                    </FuturisticCard>
                  ))}
                </div>
              </FuturisticSection>
            )}
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            {metrics && (
              <FuturisticGrid columns={3}>
                <FuturisticCard glow="cyan">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">CPU Usage</p>
                    <div className="text-2xl font-bold text-cyan-400">{metrics.cpu}%</div>
                  </div>
                </FuturisticCard>
                <FuturisticCard glow="magenta">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Memory Usage</p>
                    <div className="text-2xl font-bold text-magenta-400">{metrics.memory}%</div>
                  </div>
                </FuturisticCard>
                <FuturisticCard glow="cyan">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Network Status</p>
                    <div className="flex items-center gap-2">
                      <Wifi className="text-green-400" size={20} />
                      <span className="text-lg font-bold text-green-400">Connected</span>
                    </div>
                  </div>
                </FuturisticCard>
              </FuturisticGrid>
            )}
            {showRealtimeMetrics && <RealtimeARMetrics />}

            {/* Stream Health Widget */}
            <StreamHealthWidget />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {learnings.length > 0 && (
              <FuturisticSection title="System Learnings">
                <div className="space-y-3">
                  {learnings.slice(0, 5).map((learning, idx) => (
                    <FuturisticCard key={idx} glow="cyan">
                      <p className="text-white">{learning.insight}</p>
                      <p className="text-sm text-slate-400 mt-2">Confidence: {learning.confidence}%</p>
                    </FuturisticCard>
                  ))}
                </div>
              </FuturisticSection>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <TaskHistory />
          </TabsContent>

          {/* Ecosystem Tab */}
          <TabsContent value="ecosystem" className="space-y-4">
            <EcosystemStatusDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <FuturisticDivider animated />
        <FuturisticSection title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FuturisticButton 
              onClick={() => setShowVoiceAnalytics(!showVoiceAnalytics)}
              variant="secondary"
              className="w-full"
            >
              <Mic size={16} className="mr-2" />
              Voice Analytics
            </FuturisticButton>
            <FuturisticButton 
              onClick={() => setShowARInterface(!showARInterface)}
              variant="secondary"
              className="w-full"
            >
              <Glasses size={16} className="mr-2" />
              AR Interface
            </FuturisticButton>
            <FuturisticButton 
              onClick={() => setShowRRBDonations(!showRRBDonations)}
              variant="secondary"
              className="w-full"
            >
              <Heart size={16} className="mr-2" />
              Donations
            </FuturisticButton>
            <FuturisticButton 
              onClick={() => statusQuery.refetch()}
              variant="secondary"
              className="w-full"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </FuturisticButton>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
            <FuturisticButton 
              onClick={() => navigate('/conference')}
              variant="secondary"
              className="w-full"
            >
              <Video size={16} className="mr-2" />
              Conference Hub
            </FuturisticButton>
            <FuturisticButton 
              onClick={openRestream}
              variant="secondary"
              className="w-full"
            >
              <Tv size={16} className="mr-2" />
              Restream
            </FuturisticButton>
            <FuturisticButton 
              onClick={() => navigate('/live')}
              variant="secondary"
              className="w-full"
            >
              <Radio size={16} className="mr-2" />
              RRB Radio
            </FuturisticButton>
            <FuturisticButton 
              onClick={() => navigate('/hybridcast')}
              variant="secondary"
              className="w-full"
            >
              <Wifi size={16} className="mr-2" />
              HybridCast
            </FuturisticButton>
            <FuturisticButton 
              onClick={() => navigate('/ty-bat-zan')}
              variant="secondary"
              className="w-full"
            >
              <Earth size={16} className="mr-2" />
              TBZ-OS
            </FuturisticButton>
          </div>
        </FuturisticSection>

        {/* Modals */}
        {showVoiceAnalytics && <VoiceAnalyticsDashboard />}
        {showARInterface && <ARGlassInterface />}
        {showRRBDonations && <RRBDonationForm />}
      </div>
    </div>
  );
}
