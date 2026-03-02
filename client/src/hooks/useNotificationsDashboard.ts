import { useState, useCallback, useEffect } from "react";

export type NotificationType = "alert" | "mention" | "activity" | "system" | "error";
export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  snoozedUntil?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface UseNotificationsDashboardOptions {
  enabled?: boolean;
  pollInterval?: number;
}

/**
 * Hook for managing real-time notifications dashboard
 */
export function useNotificationsDashboard(options: UseNotificationsDashboardOptions) {
  const { enabled = true, pollInterval = 5000 } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState<{
    types?: NotificationType[];
    priorities?: NotificationPriority[];
    unreadOnly?: boolean;
    searchQuery?: string;
  }>({});
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    critical: 0,
    snoozed: 0,
  });

  // Load notifications from localStorage
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        const parsed = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          snoozedUntil: n.snoozedUntil ? new Date(n.snoozedUntil) : undefined,
        }));
        setNotifications(parsed);
      }
    } catch (error) {
      console.error("[NotificationsDashboard] Failed to load notifications:", error);
    }
  }, [enabled]);

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by type
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((n) => filters.types!.includes(n.type));
    }

    // Filter by priority
    if (filters.priorities && filters.priorities.length > 0) {
      filtered = filtered.filter((n) => filters.priorities!.includes(n.priority));
    }

    // Filter unread only
    if (filters.unreadOnly) {
      filtered = filtered.filter((n) => !n.read);
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    // Filter out snoozed notifications
    filtered = filtered.filter(
      (n) => !n.snoozedUntil || new Date() > n.snoozedUntil
    );

    setFilteredNotifications(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

    // Update stats
    const unread = notifications.filter((n) => !n.read).length;
    const critical = notifications.filter((n) => n.priority === "critical").length;
    const snoozed = notifications.filter((n) => n.snoozedUntil && new Date() < n.snoozedUntil).length;

    setStats({
      total: notifications.length,
      unread,
      critical,
      snoozed,
    });
  }, [notifications, filters]);

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, 500); // Keep last 500
        try {
          localStorage.setItem("notifications", JSON.stringify(updated));
        } catch (error) {
          console.error("[NotificationsDashboard] Failed to save notifications:", error);
        }
        return updated;
      });
    },
    []
  );

  // Mark as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Snooze notification
  const snoozeNotification = useCallback(
    (notificationId: string, minutes: number) => {
      const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, snoozedUntil } : n
        )
      );
    },
    []
  );

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Bulk actions
  const bulkMarkAsRead = useCallback((notificationIds: string[]) => {
    setNotifications((prev) =>
      prev.map((n) =>
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      )
    );
  }, []);

  const bulkDelete = useCallback((notificationIds: string[]) => {
    setNotifications((prev) =>
      prev.filter((n) => !notificationIds.includes(n.id))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem("notifications");
    } catch (error) {
      console.error("[NotificationsDashboard] Failed to clear notifications:", error);
    }
  }, []);

  return {
    notifications: filteredNotifications,
    stats,
    filters,
    setFilters,
    addNotification,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    deleteNotification,
    bulkMarkAsRead,
    bulkDelete,
    clearAll,
  };
}
