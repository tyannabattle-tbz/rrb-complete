import React, { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AgentLayout from "@/components/AgentLayout";
import ChatInterface from "@/components/ChatInterface";
import ToolDashboard from "@/components/ToolDashboard";
import ConfigPanel from "@/components/ConfigPanel";
import MemoryBrowser from "@/components/MemoryBrowser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export default function AgentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<number | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCounter, setMessageCounter] = useState(0);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch sessions
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = trpc.agent.getSessions.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch messages for current session
  const { data: fetchedMessages, isLoading: messagesLoading, refetch: refetchMessages } = trpc.messages.getMessages.useQuery(
    { sessionId: currentSessionId || 0, limit: 50 },
    { enabled: !!currentSessionId }
  );

  // Fetch tool executions
  const { data: toolExecutions, refetch: refetchTools } = trpc.tools.getExecutions.useQuery(
    { sessionId: currentSessionId || 0 },
    { enabled: !!currentSessionId }
  );

  // Fetch current session config
  const { data: currentSession } = trpc.agent.getSession.useQuery(
    { sessionId: currentSessionId || 0 },
    { enabled: !!currentSessionId }
  );

  // Fetch memory
  const { data: memoryEntries, refetch: refetchMemory } = trpc.memory.getAll.useQuery(
    { sessionId: currentSessionId || 0 },
    { enabled: !!currentSessionId }
  );

  // Update messages when fetched
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(
        fetchedMessages.map((msg, idx) => ({
          id: `msg-${idx}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }))
      );
    }
  }, [fetchedMessages]);

  // Set initial session
  useEffect(() => {
    if (sessions && sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

  const createSessionMutation = trpc.agent.createSession.useMutation();
  const addMessageMutation = trpc.messages.addMessage.useMutation();

  const handleCreateSession = async () => {
    try {
      const result = await createSessionMutation.mutateAsync({
        sessionName: `Session ${new Date().toLocaleTimeString()}`,
      });
      await refetchSessions();
      if (result.success) {
        toast.success("Session created successfully");
      }
    } catch (error) {
      toast.error("Failed to create session");
      console.error(error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;

    try {
      // Add user message
      const userMessage: Message = {
        id: `msg-${messageCounter}`,
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setMessageCounter((c) => c + 1);

      // Add message to database
      await addMessageMutation.mutateAsync({
        sessionId: currentSessionId,
        role: "user",
        content,
      });

      // Simulate agent response (in real implementation, call agent backend)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: `msg-${messageCounter + 1}`,
        role: "assistant",
        content: "I received your message and I'm processing it. In a real implementation, this would be connected to the autonomous agent backend.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setMessageCounter((c) => c + 2);

      // Add assistant message to database
      await addMessageMutation.mutateAsync({
        sessionId: currentSessionId,
        role: "assistant",
        content: assistantMessage.content,
      });

      await refetchMessages();
      await refetchTools();
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  const updateSessionMutation = trpc.agent.updateSession.useMutation();

  const handleSaveConfig = async (config: any) => {
    if (!currentSessionId) return;

    try {
      await updateSessionMutation.mutateAsync({
        sessionId: currentSessionId,
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        model: config.model,
        maxSteps: config.maxSteps,
      });
      toast.success("Configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save configuration");
      console.error(error);
    }
  };

  const storeMemoryMutation = trpc.memory.store.useMutation();

  const handleAddMemory = async (key: string, value: string) => {
    if (!currentSessionId) return;

    try {
      await storeMemoryMutation.mutateAsync({
        sessionId: currentSessionId,
        key,
        value,
      });
      await refetchMemory();
      toast.success("Memory entry added");
    } catch (error) {
      toast.error("Failed to add memory entry");
      console.error(error);
    }
  };

  const handleUpdateMemory = async (key: string, value: string) => {
    if (!currentSessionId) return;

    try {
      await storeMemoryMutation.mutateAsync({
        sessionId: currentSessionId,
        key,
        value,
      });
      await refetchMemory();
      toast.success("Memory entry updated");
    } catch (error) {
      toast.error("Failed to update memory entry");
      console.error(error);
    }
  };

  const deleteMemoryMutation = trpc.memory.delete.useMutation();

  const handleDeleteMemory = async (key: string) => {
    if (!currentSessionId) return;

    try {
      await deleteMemoryMutation.mutateAsync({
        sessionId: currentSessionId,
        key,
      });
      await refetchMemory();
      toast.success("Memory entry deleted");
    } catch (error) {
      toast.error("Failed to delete memory entry");
      console.error(error);
    }
  };

  if (authLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <AgentLayout
      currentSessionId={currentSessionId}
      sessions={sessions || []}
      onNewSession={handleCreateSession}
      onSelectSession={setCurrentSessionId}
    >
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-card px-6 py-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full">
            <ChatInterface
              messages={messages}
              isLoading={messagesLoading}
              onSendMessage={handleSendMessage}
              sessionId={currentSessionId}
            />
          </TabsContent>

          <TabsContent value="tools" className="h-full">
            <ToolDashboard
              executions={toolExecutions || []}
              isLoading={false}
            />
          </TabsContent>

          <TabsContent value="config" className="h-full">
            <ConfigPanel
              sessionId={currentSessionId}
              config={currentSession ? {
                systemPrompt: currentSession.systemPrompt || undefined,
                temperature: currentSession.temperature || undefined,
                model: currentSession.model || undefined,
                maxSteps: currentSession.maxSteps || undefined,
              } : undefined}
              onSaveConfig={handleSaveConfig}
            />
          </TabsContent>

          <TabsContent value="memory" className="h-full">
            <MemoryBrowser
              entries={memoryEntries || []}
              isLoading={false}
              onAddEntry={handleAddMemory}
              onUpdateEntry={handleUpdateMemory}
              onDeleteEntry={handleDeleteMemory}
              sessionId={currentSessionId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </AgentLayout>
  );
}
