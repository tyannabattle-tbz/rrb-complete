import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AgentLayout from "@/components/AgentLayout";
import ChatInterface from "@/components/ChatInterface";
import ToolDashboard from "@/components/ToolDashboard";
import ConfigPanel from "@/components/ConfigPanel";
import MemoryBrowser from "@/components/MemoryBrowser";
import ActionLogViewer from "@/components/ActionLogViewer";
import TaskHistoryTracker from "@/components/TaskHistoryTracker";
import AgentStatusIndicator from "@/components/AgentStatusIndicator";
import FileBrowser from "@/components/FileBrowser";
import DeploymentConfig from "@/components/DeploymentConfig";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import SessionReplay from "@/components/SessionReplay";
import AnalyticsFilter from "@/components/AnalyticsFilter";
import SessionSharing from "@/components/SessionSharing";
import SessionComments from "@/components/SessionComments";
import WorkspaceDashboard from "@/components/WorkspaceDashboard";
import WorkspaceManager from "@/components/WorkspaceManager";
import AdvancedSearch from "@/components/AdvancedSearch";
import TeamAnalyticsDashboard from "@/components/TeamAnalyticsDashboard";
import NotificationCenter from "@/components/NotificationCenter";
import SessionBookmarks from "@/components/SessionBookmarks";
import DashboardWidgets from "@/components/DashboardWidgets";
import BatchOperations from "@/components/BatchOperations";
import SessionTemplates from "@/components/SessionTemplates";
import RealtimeCollaboration from "@/components/RealtimeCollaboration";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import { useEnhancedWebSocket } from "@/hooks/useEnhancedWebSocket";
import { WebSocketStatus } from "@/components/WebSocketStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Search, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function AgentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [agentStatus, setAgentStatus] = useState<"idle" | "reasoning" | "executing" | "completed" | "error">("idle");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Get sessions
  const { data: sessions = [], isLoading: sessionsLoading } = trpc.agent.getSessions.useQuery();

  // Get messages for active session
  const { data: messages = [] } = trpc.messages.getMessages.useQuery(
    { sessionId: activeSession || 0 },
    { enabled: !!activeSession }
  );

  // Get tool executions for active session
  const { data: toolExecutions = [] } = trpc.tools.getExecutions.useQuery(
    { sessionId: activeSession || 0 },
    { enabled: !!activeSession }
  );

  // Get tasks for active session
  const { data: tasks = [] } = trpc.tasks.getTasks.useQuery(
    { sessionId: activeSession || 0 },
    { enabled: !!activeSession }
  );

  // Get memory for active session
  const { data: memoryEntries = [] } = trpc.memory.getAll.useQuery(
    { sessionId: activeSession || 0 },
    { enabled: !!activeSession }
  );

  // WebSocket real-time updates
  const { isConnected } = useAgentWebSocket({
    sessionId: activeSession || 0,
    onStatusChange: (status) => {
      setAgentStatus(status as any);
      setLastUpdate(new Date());
    },
    onMessage: (role, content) => {
      setLastUpdate(new Date());
      if (role === "assistant") {
        toast.success("Agent responded");
      }
    },
    onToolExecution: (toolName, status) => {
      setLastUpdate(new Date());
      if (status === "completed") {
        toast.success(`Tool ${toolName} completed`);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error}`);
    },
  });

  // Create new session
  const createSessionMutation = trpc.agent.createSession.useMutation({
    onSuccess: (result) => {
      if (result.success && result.id) {
        toast.success("Session created");
        setActiveSession(result.id);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create session: ${error.message}`);
    },
  });

  const handleCreateSession = () => {
    createSessionMutation.mutate({
      sessionName: `Session ${new Date().toLocaleTimeString()}`,
      systemPrompt: "You are a helpful AI assistant.",
      temperature: 70,
      model: "gpt-4-turbo",
      maxSteps: 50,
    });
  };

  const addMessageMutation = trpc.messages.addMessage.useMutation();

  const handleSendMessage = async (content: string) => {
    if (!activeSession) return;
    try {
      await addMessageMutation.mutateAsync({
        sessionId: activeSession,
        role: "user",
        content,
      });
      toast.success("Message sent");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  // Set first session as active if available
  useEffect(() => {
    if (sessions.length > 0 && !activeSession) {
      setActiveSession(sessions[0].id);
    }
  }, [sessions, activeSession]);

  if (!isAuthenticated) {
    return null;
  }

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <AgentLayout
      sessions={sessions}
      currentSessionId={activeSession || undefined}
      onSelectSession={setActiveSession}
      onNewSession={handleCreateSession}
    >
      {activeSession ? (
        <div className="space-y-4">
          {/* Real-time Status */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <AgentStatusIndicator
                status={agentStatus}
                lastUpdate={lastUpdate}
                messageCount={messages.length}
                toolExecutions={toolExecutions.length}
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isConnected ? "bg-success animate-pulse" : "bg-error"}`} />
                <p className="text-xs text-muted-foreground">
                  {isConnected ? "Connected" : "Disconnected"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-16 gap-1">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="replay">Replay</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="workspace" className="gap-1"><Building2 size={14} />Workspace</TabsTrigger>
              <TabsTrigger value="workspaces" className="gap-1"><Building2 size={14} />Workspaces</TabsTrigger>
              <TabsTrigger value="search" className="gap-1"><Search size={14} />Search</TabsTrigger>
              <TabsTrigger value="teamanalytics" className="gap-1"><BarChart3 size={14} />Team</TabsTrigger>
              <TabsTrigger value="batch">Batch</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="collab">Collab</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <ChatInterface
                sessionId={activeSession}
                messages={messages.map((m) => ({
                  id: `msg-${m.id}`,
                  role: m.role,
                  content: m.content,
                  timestamp: new Date(m.createdAt),
                }))}
                onSendMessage={handleSendMessage}
              />
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-4">
              <ToolDashboard executions={toolExecutions} />
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <ActionLogViewer logs={toolExecutions} />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <TaskHistoryTracker tasks={tasks} />
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-4">
              <FileBrowser sessionId={activeSession} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsDashboard sessionId={activeSession} />
            </TabsContent>

            {/* Replay Tab */}
            <TabsContent value="replay" className="space-y-4">
              <SessionReplay sessionId={activeSession} />
            </TabsContent>

            {/* Share Tab */}
            <TabsContent value="share" className="space-y-4">
              <SessionSharing
                sessionId={activeSession || 0}
                sessionName="Current Session"
              />
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4">
              <SessionComments
                sessionId={activeSession || 0}
                currentUserId={user?.id || 1}
              />
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-4">
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Export Session</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Button className="w-full" onClick={() => toast.success("Exporting as JSON...")}>
                      Export JSON
                    </Button>
                    <Button className="w-full" onClick={() => toast.success("Exporting as CSV...")}>
                      Export CSV
                    </Button>
                    <Button className="w-full" onClick={() => toast.success("Exporting as HTML...")}>
                      Export HTML
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Deployment Tab */}
            <TabsContent value="deploy" className="space-y-4">
              <DeploymentConfig />
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ConfigPanel sessionId={activeSession} />
                <MemoryBrowser sessionId={activeSession} entries={memoryEntries} />
              </div>
            </TabsContent>

            {/* Workspace Tab */}
            <TabsContent value="workspace" className="space-y-4">
              <WorkspaceDashboard
                currentWorkspace={{
                  id: 1,
                  name: "Default Workspace",
                  description: "Your default agent workspace",
                  owner: user?.name || "Owner",
                  memberCount: 1,
                  sessionCount: sessions.length,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }}
                teamMembers={[
                  {
                    id: 1,
                    name: user?.name || "You",
                    email: user?.email || "user@example.com",
                    role: "admin",
                    joinedAt: new Date(),
                    lastActive: new Date(),
                  },
                ]}
              />
            </TabsContent>

            {/* Workspaces Tab */}
            <TabsContent value="workspaces" className="space-y-4">
              <WorkspaceManager
                workspaces={[
                  {
                    id: 1,
                    name: "Default Workspace",
                    description: "Your default agent workspace",
                    memberCount: 1,
                    sessionCount: sessions.length,
                    createdAt: new Date(),
                    owner: user?.name || "Owner",
                  },
                ]}
              />
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <AdvancedSearch />
            </TabsContent>

            {/* Team Analytics Tab */}
            <TabsContent value="teamanalytics" className="space-y-4">
              <TeamAnalyticsDashboard />
            </TabsContent>

            {/* Batch Operations Tab */}
            <TabsContent value="batch" className="space-y-4">
              <BatchOperations
                sessions={sessions.map((s) => ({
                  id: s.id,
                  name: s.sessionName,
                  status: (s.status || "completed") as "completed" | "failed" | "running",
                  timestamp: s.createdAt,
                }))}
                onBatchDelete={(ids) => {
                  toast.success(`Deleted ${ids.length} sessions`);
                }}
                onBatchExport={(ids) => {
                  toast.success(`Exported ${ids.length} sessions`);
                }}
                onBatchTag={(ids, tag) => {
                  toast.success(`Tagged ${ids.length} sessions with "${tag}"`);
                }}
              />
            </TabsContent>

            {/* Session Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <SessionTemplates
                onCreateFromTemplate={(template) => {
                  toast.success(`Created session from template: ${template.name}`);
                }}
              />
            </TabsContent>

            {/* Real-time Collaboration Tab */}
            <TabsContent value="collab" className="space-y-4">
              <RealtimeCollaboration
                sessionId={activeSession || 0}
                currentUserId={String(user?.id || "user-1")}
                onSendAnnotation={(content) => {
                  toast.success("Annotation sent");
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No sessions available</p>
            <button
              onClick={handleCreateSession}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
            >
              Create First Session
            </button>
          </div>
        </div>
      )}
    </AgentLayout>
  );
}
