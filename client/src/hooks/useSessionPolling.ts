import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export interface UseSessionPollingOptions {
  sessionId: number | null;
  enabled?: boolean;
  pollInterval?: number; // in milliseconds, default 3000
  onMessagesUpdate?: (count: number) => void;
  onToolExecutionsUpdate?: (count: number) => void;
  onTasksUpdate?: (count: number) => void;
}

/**
 * Hook for real-time session updates using polling
 * Automatically refetches session data at regular intervals
 */
export function useSessionPolling(options: UseSessionPollingOptions) {
  const {
    sessionId,
    enabled = true,
    pollInterval = 3000,
    onMessagesUpdate,
    onToolExecutionsUpdate,
    onTasksUpdate,
  } = options;

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Get messages
  const messagesQuery = trpc.messages.getMessages.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId && enabled }
  );

  // Get tool executions
  const toolExecutionsQuery = trpc.tools.getExecutions.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId && enabled }
  );

  // Get tasks
  const tasksQuery = trpc.tasks.getTasks.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId && enabled }
  );

  // Setup polling
  useEffect(() => {
    if (!enabled || !sessionId) {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    const startPolling = () => {
      setIsPolling(true);

      const poll = () => {
        // Refetch all queries
        messagesQuery.refetch();
        toolExecutionsQuery.refetch();
        tasksQuery.refetch();

        setLastPollTime(new Date());
        setPollCount((prev) => prev + 1);

        // Schedule next poll
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      };

      // Start polling
      poll();
    };

    startPolling();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      setIsPolling(false);
    };
  }, [enabled, sessionId, pollInterval, messagesQuery, toolExecutionsQuery, tasksQuery]);

  // Notify about updates
  useEffect(() => {
    if (messagesQuery.data && onMessagesUpdate) {
      onMessagesUpdate(messagesQuery.data.length);
    }
  }, [messagesQuery.data, onMessagesUpdate]);

  useEffect(() => {
    if (toolExecutionsQuery.data && onToolExecutionsUpdate) {
      onToolExecutionsUpdate(toolExecutionsQuery.data.length);
    }
  }, [toolExecutionsQuery.data, onToolExecutionsUpdate]);

  useEffect(() => {
    if (tasksQuery.data && onTasksUpdate) {
      onTasksUpdate(tasksQuery.data.length);
    }
  }, [tasksQuery.data, onTasksUpdate]);

  return {
    messages: messagesQuery.data || [],
    toolExecutions: toolExecutionsQuery.data || [],
    tasks: tasksQuery.data || [],
    isPolling,
    lastPollTime,
    pollCount,
    isLoading: messagesQuery.isLoading || toolExecutionsQuery.isLoading || tasksQuery.isLoading,
    refetch: async () => {
      await Promise.all([
        messagesQuery.refetch(),
        toolExecutionsQuery.refetch(),
        tasksQuery.refetch(),
      ]);
    },
  };
}
