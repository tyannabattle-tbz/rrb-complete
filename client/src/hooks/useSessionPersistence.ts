import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export interface SessionSnapshot {
  id: string;
  sessionId: number;
  timestamp: string;
  messageCount: number;
  toolExecutionCount: number;
  taskCount: number;
  agentStatus: string;
  metadata: Record<string, any>;
}

export interface UseSessionPersistenceOptions {
  sessionId: number | null;
  enabled?: boolean;
  snapshotInterval?: number; // in milliseconds, default 30000 (30 seconds)
  maxSnapshots?: number; // maximum snapshots to keep, default 20
}

/**
 * Hook for session persistence with automatic snapshots
 * Saves session state periodically and allows resuming after page reload
 */
export function useSessionPersistence(options: UseSessionPersistenceOptions) {
  const {
    sessionId,
    enabled = true,
    snapshotInterval = 30000,
    maxSnapshots = 20,
  } = options;

  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [snapshots, setSnapshots] = useState<SessionSnapshot[]>([]);
  const [lastSnapshotTime, setLastSnapshotTime] = useState<Date | null>(null);
  const [snapshotCount, setSnapshotCount] = useState(0);

  // Get session data for snapshot
  const sessionsQuery = trpc.agent.getSessions.useQuery(undefined, {
    enabled: !!sessionId,
  });
  const currentSession = sessionsQuery.data?.find((s) => s.id === sessionId);

  const messagesQuery = trpc.messages.getMessages.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId }
  );

  const toolExecutionsQuery = trpc.tools.getExecutions.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId }
  );

  const tasksQuery = trpc.tasks.getTasks.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId }
  );

  // Load snapshots from localStorage on mount
  useEffect(() => {
    if (!sessionId) return;

    try {
      const stored = localStorage.getItem(`session-snapshots-${sessionId}`);
      if (stored) {
        setSnapshots(JSON.parse(stored));
      }
    } catch (error) {
      console.error("[SessionPersistence] Failed to load snapshots:", error);
    }
  }, [sessionId]);

  // Create a snapshot
  const createSnapshot = async () => {
    if (!sessionId) return;

    try {
      const snapshot: SessionSnapshot = {
        id: `snapshot-${Date.now()}`,
        sessionId,
        timestamp: new Date().toISOString(),
        messageCount: messagesQuery.data?.length || 0,
        toolExecutionCount: toolExecutionsQuery.data?.length || 0,
        taskCount: tasksQuery.data?.length || 0,
        agentStatus: currentSession?.status || "unknown",
        metadata: {
          sessionName: currentSession?.sessionName,
          model: currentSession?.model,
          temperature: currentSession?.temperature,
        },
      };

      // Save snapshot to localStorage
      const existingSnapshots = JSON.parse(
        localStorage.getItem(`session-snapshots-${sessionId}`) || "[]"
      );
      const updatedSnapshots = [snapshot, ...existingSnapshots].slice(
        0,
        maxSnapshots
      );
      localStorage.setItem(
        `session-snapshots-${sessionId}`,
        JSON.stringify(updatedSnapshots)
      );

      // Update local state
      setSnapshots(updatedSnapshots);
      setLastSnapshotTime(new Date());
      setSnapshotCount((prev) => prev + 1);
    } catch (error) {
      console.error("[SessionPersistence] Failed to create snapshot:", error);
    }
  };

  // Setup auto-snapshot
  useEffect(() => {
    if (!enabled || !sessionId) {
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
        snapshotTimeoutRef.current = null;
      }
      return;
    }

    const startAutoSnapshot = () => {
      const snapshot = async () => {
        await createSnapshot();
        snapshotTimeoutRef.current = setTimeout(snapshot, snapshotInterval);
      };

      snapshot();
    };

    startAutoSnapshot();

    return () => {
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
        snapshotTimeoutRef.current = null;
      }
    };
  }, [enabled, sessionId, snapshotInterval]);

  // Restore session from snapshot
  const restoreFromSnapshot = async (snapshot: SessionSnapshot) => {
    console.log("[SessionPersistence] Restoring from snapshot:", snapshot);
    // Implementation would restore the session state
  };

  // Get last snapshot
  const getLastSnapshot = (): SessionSnapshot | null => {
    return snapshots.length > 0 ? snapshots[0] : null;
  };

  // Clear all snapshots
  const clearSnapshots = () => {
    if (sessionId) {
      localStorage.removeItem(`session-snapshots-${sessionId}`);
      setSnapshots([]);
    }
  };

  return {
    snapshots,
    lastSnapshotTime,
    snapshotCount,
    createSnapshot,
    restoreFromSnapshot,
    getLastSnapshot,
    clearSnapshots,
    isLoading: sessionsQuery.isLoading || messagesQuery.isLoading,
  };
}
