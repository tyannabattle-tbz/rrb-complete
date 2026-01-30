import { useEffect, useRef } from "react";
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

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  const lastPollTimeRef = useRef<Date | null>(null);

  // Get messages
  const messagesQuery = trpc.messages.getMessages.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId && enabled, refetchOnWindowFocus: false }
  );

  // Get tool executions
  const toolExecutionsQuery = trpc.tools.getExecutions.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId && enabled, refetchOnWindowFocus: false }
  );

  // Get tasks
  const tasksQuery = trpc.tasks.getTasks.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId && enabled, refetchOnWindowFocus: false }
  );

  // Notify about updates
  useEffect(() => {
    if (messagesQuery.data && onMessagesUpdate) {
      onMessagesUpdate(messagesQuery.data.length);
    }
  }, [messagesQuery.data?.length]);

  useEffect(() => {
    if (toolExecutionsQuery.data && onToolExecutionsUpdate) {
      onToolExecutionsUpdate(toolExecutionsQuery.data.length);
    }
  }, [toolExecutionsQuery.data?.length]);

  useEffect(() => {
    if (tasksQuery.data && onTasksUpdate) {
      onTasksUpdate(tasksQuery.data.length);
    }
  }, [tasksQuery.data?.length]);

  // Setup polling
  useEffect(() => {
    if (!enabled || !sessionId) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const poll = () => {
      // Refetch all queries
      messagesQuery.refetch();
      toolExecutionsQuery.refetch();
      tasksQuery.refetch();

      lastPollTimeRef.current = new Date();
      pollCountRef.current += 1;
    };

    // Start polling immediately
    poll();

    // Set up interval for subsequent polls
    pollIntervalRef.current = setInterval(poll, pollInterval);

    // Cleanup: only clear interval, no state updates
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [enabled, sessionId, pollInterval]);

  return {
    messages: messagesQuery.data || [],
    toolExecutions: toolExecutionsQuery.data || [],
    tasks: tasksQuery.data || [],
    isPolling: enabled && !!sessionId,
    lastPollTime: lastPollTimeRef.current,
    pollCount: pollCountRef.current,
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
