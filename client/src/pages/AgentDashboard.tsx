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
import { useEnhancedWebSocket } from "@/hooks/useEnhancedWebSocket";
import { WebSocketStatus } from "@/components/WebSocketStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Search, BarChart3, AlertCircle, Settings, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AgentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [agentStatus, setAgentStatus] = useState<"idle" | "reasoning" | "executing" | "completed" | "error">("idle");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [offlineMode, setOfflineMode] = useState(false);
  const [showOfflineDashboard, setShowOfflineDashboard] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [connectionEvents, setConnectionEvents] = useState<any[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    autoReconnect: true,
    maxRetries: 5,
    notifyOnDisconnect: true,
    notifyOnReconnect: true,
    handleFailedMessages: "auto-retry" as "auto-retry" | "manual-retry" | "discard",
  });

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

  // Enhanced WebSocket with message queue and heartbeat
  const { isConnected, reconnectAttempts, queueSize, lastHeartbeat } = useEnhancedWebSocket({
    sessionId: activeSession || 0,
    heartbeatInterval: 30000,
    enableMessageQueue: true,
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

  // Track offline mode
  useEffect(() => {
    if (!isConnected && !offlineMode) {
      setOfflineMode(true);
      if (notificationPrefs.notifyOnDisconnect) {
        toast.warning("Connection lost - messages will be queued");
      }
      setConnectionEvents((prev) => [
        ...prev,
        {
          type: "disconnect",
          timestamp: new Date(),
          message: "Connection lost",
        },
      ]);
    } else if (isConnected && offlineMode) {
      setOfflineMode(false);
      if (notificationPrefs.notifyOnReconnect) {
        toast.success("Connection restored");
      }
      setConnectionEvents((prev) => [
        ...prev,
        {
          type: "reconnect",
          timestamp: new Date(),
          message: "Connection restored",
        },
      ]);
    }
  }, [isConnected, offlineMode, notificationPrefs]);

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

  return (
    <AgentLayout>
      {/* WebSocket Status Bar with Offline Mode Indicator */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <WebSocketStatus
            isConnected={isConnected}
            reconnectAttempts={reconnectAttempts}
            maxReconnectAttempts={5}
            lastUpdate={lastUpdate}
            showLabel={true}
            showDetails={true}
          />
          {queueSize > 0 && (
            <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {queueSize} message{queueSize !== 1 ? "s" : ""} queued
            </div>
          )}
          {offlineMode && (
            <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Offline Mode
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastHeartbeat && (
            <div className="text-xs text-gray-600">Last heartbeat: {lastHeartbeat.toLocaleTimeString()}</div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOfflineDashboard(!showOfflineDashboard)}
            className="gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            Offline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="gap-1"
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferences(!showPreferences)}
            className="gap-1"
          >
            <Settings className="w-4 h-4" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Offline Mode Dashboard */}
      {showOfflineDashboard && (
        <Card className="m-4 p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Offline Mode Dashboard
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                {offlineMode
                  ? "You are currently offline. Messages will be queued and sent when connection is restored."
                  : "You are online. All queued messages will be sent automatically."}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowOfflineDashboard(false)}>
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-900">{queueSize}</div>
              <div className="text-xs text-yellow-700">Messages Queued</div>
            </div>
            <div className="bg-white p-3 rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-900">{connectionEvents.length}</div>
              <div className="text-xs text-yellow-700">Connection Events</div>
            </div>
            <div className="bg-white p-3 rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-900">{isConnected ? "Connected" : "Disconnected"}</div>
              <div className="text-xs text-yellow-700">Current Status</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-yellow-200 max-h-48 overflow-y-auto">
            <h4 className="font-semibold text-sm text-yellow-900 mb-2">Connection History</h4>
            {connectionEvents.length === 0 ? (
              <p className="text-xs text-yellow-700">No connection events yet</p>
            ) : (
              <div className="space-y-1">
                {connectionEvents.slice(-10).map((event, idx) => (
                  <div key={idx} className="text-xs text-yellow-700">
                    <span className="font-mono">{event.timestamp.toLocaleTimeString()}</span> - {event.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Connection Analytics */}
      {showAnalytics && (
        <Card className="m-4 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Connection Analytics
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAnalytics(false)}>
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="text-sm font-semibold text-blue-900">Uptime</div>
              <div className="text-2xl font-bold text-blue-600">
                {connectionEvents.filter((e) => e.type === "reconnect").length > 0
                  ? `${(
                      (connectionEvents.filter((e) => e.type === "reconnect").length /
                        (connectionEvents.length || 1)) *
                      100
                    ).toFixed(1)}%`
                  : "100%"}
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="text-sm font-semibold text-blue-900">Reconnect Attempts</div>
              <div className="text-2xl font-bold text-blue-600">{reconnectAttempts}</div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="text-sm font-semibold text-blue-900">Avg Response Time</div>
              <div className="text-2xl font-bold text-blue-600">~45ms</div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="text-sm font-semibold text-blue-900">Messages Queued</div>
              <div className="text-2xl font-bold text-blue-600">{queueSize}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Notification Preferences */}
      {showPreferences && (
        <Card className="m-4 p-4 bg-purple-50 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Preferences
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowPreferences(false)}>
              ✕
            </Button>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.autoReconnect}
                onChange={(e) =>
                  setNotificationPrefs({ ...notificationPrefs, autoReconnect: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-purple-900">Auto-reconnect on disconnect</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.notifyOnDisconnect}
                onChange={(e) =>
                  setNotificationPrefs({ ...notificationPrefs, notifyOnDisconnect: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-purple-900">Notify when disconnected</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.notifyOnReconnect}
                onChange={(e) =>
                  setNotificationPrefs({ ...notificationPrefs, notifyOnReconnect: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-purple-900">Notify when reconnected</span>
            </label>

            <div>
              <label className="text-sm font-semibold text-purple-900 block mb-2">Max Retry Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={notificationPrefs.maxRetries}
                onChange={(e) =>
                  setNotificationPrefs({ ...notificationPrefs, maxRetries: parseInt(e.target.value) })
                }
                className="w-full px-2 py-1 border border-purple-200 rounded text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-purple-900 block mb-2">Failed Message Handling</label>
              <select
                value={notificationPrefs.handleFailedMessages}
                onChange={(e) =>
                  setNotificationPrefs({
                    ...notificationPrefs,
                    handleFailedMessages: e.target.value as any,
                  })
                }
                className="w-full px-2 py-1 border border-purple-200 rounded text-sm"
              >
                <option value="auto-retry">Auto-retry</option>
                <option value="manual-retry">Manual retry</option>
                <option value="discard">Discard</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Main Dashboard Content */}
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
              <ChatInterface messages={messages.map(m => ({ id: String(m.id), timestamp: m.createdAt, role: m.role, content: m.content }))} onSendMessage={handleSendMessage} isLoading={false} />
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
