import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";

export interface Notification {
  id: number;
  userId: number;
  type: "session_update" | "team_activity" | "search_result" | "alert" | "info";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export class NotificationService {
  /**
   * Send a notification to a user
   */
  static async sendNotification(
    userId: number,
    type: Notification["type"],
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Notification] Database not available");
        return;
      }

      // Store notification in database (mock implementation)
      console.log(`[Notification] Sending to user ${userId}: ${title}`);

      // Notify owner for critical alerts
      if (type === "alert") {
        await notifyOwner({
          title: `Alert: ${title}`,
          content: message,
        });
      }
    } catch (error) {
      console.error("[Notification] Failed to send notification:", error);
    }
  }

  /**
   * Get unread notifications for a user
   */
  static async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Notification] Database not available");
        return [];
      }

      // Mock implementation - return empty for now
      return [];
    } catch (error) {
      console.error("[Notification] Failed to get unread notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Notification] Database not available");
        return;
      }

      // Mock implementation
      console.log(`[Notification] Marked ${notificationId} as read`);
    } catch (error) {
      console.error("[Notification] Failed to mark notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Notification] Database not available");
        return;
      }

      // Mock implementation
      console.log(`[Notification] Marked all as read for user ${userId}`);
    } catch (error) {
      console.error("[Notification] Failed to mark all as read:", error);
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Notification] Database not available");
        return;
      }

      // Mock implementation
      console.log(`[Notification] Deleted notification ${notificationId}`);
    } catch (error) {
      console.error("[Notification] Failed to delete notification:", error);
    }
  }

  /**
   * Broadcast notification to all team members
   */
  static async broadcastToTeam(
    workspaceId: number,
    type: Notification["type"],
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Notification] Database not available");
        return;
      }

      // Mock implementation - broadcast to workspace
      console.log(`[Notification] Broadcasting to workspace ${workspaceId}: ${title}`);
    } catch (error) {
      console.error("[Notification] Failed to broadcast to team:", error);
    }
  }

  /**
   * Send session update notification
   */
  static async notifySessionUpdate(
    userId: number,
    sessionId: number,
    status: string
  ): Promise<void> {
    await this.sendNotification(
      userId,
      "session_update",
      "Session Updated",
      `Your session #${sessionId} status changed to ${status}`,
      `/session/${sessionId}`
    );
  }

  /**
   * Send team activity notification
   */
  static async notifyTeamActivity(
    userId: number,
    activityType: string,
    activityDescription: string
  ): Promise<void> {
    await this.sendNotification(
      userId,
      "team_activity",
      "Team Activity",
      `${activityDescription}`,
      `/activity`
    );
  }

  /**
   * Send search result notification
   */
  static async notifySearchResult(
    userId: number,
    resultCount: number,
    searchQuery: string
  ): Promise<void> {
    await this.sendNotification(
      userId,
      "search_result",
      "Search Complete",
      `Found ${resultCount} results for "${searchQuery}"`,
      `/search?q=${encodeURIComponent(searchQuery)}`
    );
  }

  /**
   * Get notification count for user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Notification] Database not available");
        return 0;
      }

      // Mock implementation
      return 0;
    } catch (error) {
      console.error("[Notification] Failed to get unread count:", error);
      return 0;
    }
  }
}
