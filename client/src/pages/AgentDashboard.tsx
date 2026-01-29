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
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="replay">Replay</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
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
