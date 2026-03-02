import { useState, useCallback, useEffect } from "react";

export interface OfflineAction {
  id: string;
  type: "message" | "tool_execution" | "session_update";
  timestamp: Date;
  data: Record<string, any>;
  status: "pending" | "synced" | "failed";
  retryCount: number;
}

export interface UseOfflineSyncOptions {
  enabled?: boolean;
  maxRetries?: number;
  syncInterval?: number; // milliseconds
}

/**
 * Hook for offline mode with automatic sync
 */
export function useOfflineSync(options: UseOfflineSyncOptions) {
  const { enabled = true, maxRetries = 3, syncInterval = 5000 } = options;

  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [queue, setQueue] = useState<OfflineAction[]>([]);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    if (!enabled) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enabled]);

  // Load queue from localStorage
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem("offline-queue");
      if (stored) {
        const parsed = JSON.parse(stored).map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }));
        setQueue(parsed);
      }
    } catch (error) {
      console.error("[OfflineSync] Failed to load queue:", error);
    }
  }, [enabled]);

  // Add action to queue
  const queueAction = useCallback(
    (action: Omit<OfflineAction, "id" | "status" | "retryCount">) => {
      const newAction: OfflineAction = {
        ...action,
        id: `action-${Date.now()}`,
        status: "pending",
        retryCount: 0,
      };

      setQueue((prev) => {
        const updated = [newAction, ...prev];
        try {
          localStorage.setItem("offline-queue", JSON.stringify(updated));
        } catch (error) {
          console.error("[OfflineSync] Failed to save queue:", error);
        }
        return updated;
      });

      return newAction.id;
    },
    []
  );

  // Sync queue with server
  const syncQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || syncStatus === "syncing") return;

    setSyncStatus("syncing");

    try {
      const pendingActions = queue.filter((a) => a.status === "pending");

      for (const action of pendingActions) {
        if (action.retryCount >= maxRetries) {
          setQueue((prev) =>
            prev.map((a) =>
              a.id === action.id ? { ...a, status: "failed" } : a
            )
          );
          continue;
        }

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setQueue((prev) =>
            prev.map((a) =>
              a.id === action.id ? { ...a, status: "synced" } : a
            )
          );
        } catch (error) {
          setQueue((prev) =>
            prev.map((a) =>
              a.id === action.id
                ? { ...a, retryCount: a.retryCount + 1 }
                : a
            )
          );
        }
      }

      setLastSyncTime(new Date());
      setSyncStatus("idle");

      // Clean up synced actions
      setQueue((prev) => {
        const updated = prev.filter((a) => a.status !== "synced");
        try {
          localStorage.setItem("offline-queue", JSON.stringify(updated));
        } catch (error) {
          console.error("[OfflineSync] Failed to save queue:", error);
        }
        return updated;
      });
    } catch (error) {
      console.error("[OfflineSync] Sync failed:", error);
      setSyncStatus("error");
    }
  }, [isOnline, queue, syncStatus, maxRetries]);

  // Auto-sync when online
  useEffect(() => {
    if (!isOnline || !enabled) return;

    const interval = setInterval(() => {
      syncQueue();
    }, syncInterval);

    // Sync immediately when coming online
    syncQueue();

    return () => clearInterval(interval);
  }, [isOnline, enabled, syncInterval, syncQueue]);

  // Retry failed actions
  const retryFailed = useCallback(() => {
    setQueue((prev) =>
      prev.map((a) =>
        a.status === "failed" ? { ...a, status: "pending", retryCount: 0 } : a
      )
    );
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    try {
      localStorage.removeItem("offline-queue");
    } catch (error) {
      console.error("[OfflineSync] Failed to clear queue:", error);
    }
  }, []);

  return {
    isOnline,
    queue,
    syncStatus,
    lastSyncTime,
    queueAction,
    syncQueue,
    retryFailed,
    clearQueue,
    pendingCount: queue.filter((a) => a.status === "pending").length,
    failedCount: queue.filter((a) => a.status === "failed").length,
  };
}
