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
      setLastUpdate(new Date());
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

  return (
    <AgentLayout>
      <div className="p-4">
        {sessionsLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-4">
              <ChatInterface 
                messages={messages.map(m => ({ id: String(m.id), timestamp: m.createdAt, role: m.role, content: m.content }))} 
                onSendMessage={handleSendMessage} 
                isLoading={false} 
              />
            </TabsContent>

            <TabsContent value="tools" className="mt-4">
              <ToolDashboard executions={toolExecutions} />
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <ActionLogViewer logs={toolExecutions} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <TaskHistoryTracker tasks={tasks} />
            </TabsContent>

            <TabsContent value="files" className="mt-4">
              <FileBrowser sessionId={activeSession || 0} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <AnalyticsDashboard sessionId={activeSession || 0} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AgentLayout>
  );
}
