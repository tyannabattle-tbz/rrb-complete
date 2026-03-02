import { useState, useCallback, useEffect } from "react";

export type ActivityType = "message" | "tool_execution" | "session_created" | "session_closed" | "tag_added" | "export";

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: Date;
  userId: string;
  userName: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface UseActivityTimelineOptions {
  sessionId: number | null;
  enabled?: boolean;
}

/**
 * Hook for managing user activity timeline
 */
export function useActivityTimeline(options: UseActivityTimelineOptions) {
  const { sessionId, enabled = true } = options;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState<{
    types?: ActivityType[];
    dateFrom?: Date;
    dateTo?: Date;
    userId?: string;
  }>({});

  // Load activities from localStorage
  useEffect(() => {
    if (!sessionId || !enabled) return;

    try {
      const stored = localStorage.getItem(`activity-timeline-${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored).map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }));
        setActivities(parsed);
      }
    } catch (error) {
      console.error("[ActivityTimeline] Failed to load activities:", error);
    }
  }, [sessionId, enabled]);

  // Apply filters
  useEffect(() => {
    let filtered = [...activities];

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((a) => filters.types!.includes(a.type));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((a) => a.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((a) => a.timestamp <= filters.dateTo!);
    }

    if (filters.userId) {
      filtered = filtered.filter((a) => a.userId === filters.userId);
    }

    setFilteredActivities(filtered);
  }, [activities, filters]);

  // Add activity
  const addActivity = useCallback(
    (activity: Omit<Activity, "id">) => {
      if (!sessionId) return;

      const newActivity: Activity = {
        ...activity,
        id: `activity-${Date.now()}`,
      };

      setActivities((prev) => [newActivity, ...prev]);

      // Save to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem(`activity-timeline-${sessionId}`) || "[]");
        localStorage.setItem(
          `activity-timeline-${sessionId}`,
          JSON.stringify([newActivity, ...stored].slice(0, 1000)) // Keep last 1000 activities
        );
      } catch (error) {
        console.error("[ActivityTimeline] Failed to save activity:", error);
      }
    },
    [sessionId]
  );

  // Export activities
  const exportActivities = useCallback(
    (format: "json" | "csv" = "json") => {
      const data = filteredActivities;

      if (format === "json") {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity-timeline-${sessionId}-${Date.now()}.json`;
        a.click();
      } else if (format === "csv") {
        const headers = ["ID", "Type", "Timestamp", "User", "Description"];
        const rows = data.map((a) => [
          a.id,
          a.type,
          a.timestamp.toISOString(),
          a.userName,
          a.description,
        ]);

        const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity-timeline-${sessionId}-${Date.now()}.csv`;
        a.click();
      }
    },
    [sessionId, filteredActivities]
  );

  return {
    activities: filteredActivities,
    totalActivities: activities.length,
    addActivity,
    exportActivities,
    setFilters,
    filters,
  };
}
