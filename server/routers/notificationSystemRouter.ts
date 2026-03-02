import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";

// In-memory notification store (replace with database in production)
const notifications: Array<{
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  read: boolean;
  userId: number;
}> = [];

export const notificationSystemRouter = router({
  // Get all notifications for current user
  getNotifications: protectedProcedure
    .input(z.object({ limit: z.number().optional(), unreadOnly: z.boolean().optional() }).optional())
    .query(({ input, ctx }) => {
      let filtered = notifications.filter((n) => n.userId === (ctx.user.id as any));

      if (input?.unreadOnly) {
        filtered = filtered.filter((n) => !n.read);
      }

      return filtered.slice(0, input?.limit || 50).reverse();
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(({ input, ctx }) => {
      const notification = notifications.find((n) => n.id === input.notificationId);
      if (!notification || notification.userId !== (ctx.user.id as any)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      notification.read = true;
      return notification;
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(({ ctx }) => {
    const userNotifications = notifications.filter((n) => n.userId === (ctx.user.id as any));
    userNotifications.forEach((n) => {
      n.read = true;
    });
    return { count: userNotifications.length };
  }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(({ input, ctx }) => {
      const index = notifications.findIndex((n) => n.id === input.notificationId);
      if (index === -1 || notifications[index].userId !== (ctx.user.id as any)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      notifications.splice(index, 1);
      return { success: true };
    }),

  // Send job failure alert
  sendJobFailureAlert: adminProcedure
    .input(
      z.object({
        jobId: z.string(),
        jobName: z.string(),
        errorMessage: z.string(),
        queueId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const notificationId = `alert-${Date.now()}`;
      const notification = {
        id: notificationId,
        type: "error" as const,
        title: "Batch Job Failed",
        message: `Job "${input.jobName}" (ID: ${input.jobId}) failed: ${input.errorMessage}`,
        source: "batch-processor",
        timestamp: new Date(),
        read: false,
        userId: ctx.user.id,
      };

      notifications.push(notification);

      // Send owner notification
      await notifyOwner({
        title: "⚠️ Batch Job Failed",
        content: `Job "${input.jobName}" failed in queue ${input.queueId}: ${input.errorMessage}`,
      });

      return notification;
    }),

  // Send system performance alert
  sendPerformanceAlert: adminProcedure
    .input(
      z.object({
        metric: z.enum(["cpu", "memory", "disk", "api_latency"]),
        currentValue: z.number(),
        threshold: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const notificationId = `perf-${Date.now()}`;
      const notification = {
        id: notificationId,
        type: "warning" as const,
        title: "System Performance Alert",
        message: `${input.metric.toUpperCase()} usage at ${input.currentValue}% (threshold: ${input.threshold}%)`,
        source: "system-monitor",
        timestamp: new Date(),
        read: false,
        userId: ctx.user.id,
      };

      notifications.push(notification);

      // Send owner notification
      await notifyOwner({
        title: "⚠️ System Performance Alert",
        content: `${input.metric.toUpperCase()} usage at ${input.currentValue}% exceeds threshold of ${input.threshold}%`,
      });

      return notification;
    }),

  // Send storyboard generation alert
  sendStoryboardAlert: adminProcedure
    .input(
      z.object({
        storyboardId: z.string(),
        status: z.enum(["completed", "failed", "started"]),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const notificationId = `storyboard-${Date.now()}`;
      const typeMap = {
        completed: "success" as const,
        failed: "error" as const,
        started: "info" as const,
      };

      const notification = {
        id: notificationId,
        type: typeMap[input.status],
        title: `Storyboard ${input.status.charAt(0).toUpperCase() + input.status.slice(1)}`,
        message: `Storyboard ${input.storyboardId}: ${input.message}`,
        source: "storyboarding",
        timestamp: new Date(),
        read: false,
        userId: ctx.user.id,
      };

      notifications.push(notification);

      // Send owner notification for completed or failed
      if (input.status !== "started") {
        await notifyOwner({
          title: `📊 Storyboard ${input.status}`,
          content: `Storyboard ${input.storyboardId}: ${input.message}`,
        });
      }

      return notification;
    }),

  // Send voice command alert
  sendVoiceCommandAlert: adminProcedure
    .input(
      z.object({
        commandId: z.string(),
        command: z.string(),
        status: z.enum(["executed", "failed"]),
        result: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const notificationId = `voice-${Date.now()}`;
      const notification = {
        id: notificationId,
        type: input.status === "executed" ? ("success" as const) : ("error" as const),
        title: `Voice Command ${input.status === "executed" ? "Executed" : "Failed"}`,
        message: `Command: "${input.command}" - ${input.result}`,
        source: "voice-commands",
        timestamp: new Date(),
        read: false,
        userId: ctx.user.id,
      };

      notifications.push(notification);

      // Send owner notification for failures
      if (input.status === "failed") {
        await notifyOwner({
          title: "🎤 Voice Command Failed",
          content: `Command "${input.command}" failed: ${input.result}`,
        });
      }

      return notification;
    }),

  // Get notification statistics
  getStats: protectedProcedure.query(({ ctx }) => {
    const userNotifications = notifications.filter((n) => n.userId === (ctx.user.id as any));
    const unreadCount = userNotifications.filter((n) => !n.read).length;

    const typeStats = {
      error: userNotifications.filter((n) => n.type === "error").length,
      warning: userNotifications.filter((n) => n.type === "warning").length,
      info: userNotifications.filter((n) => n.type === "info").length,
      success: userNotifications.filter((n) => n.type === "success").length,
    };

    return {
      total: userNotifications.length,
      unread: unreadCount,
      byType: typeStats,
    };
  }),

  // Clear old notifications (keep last 100)
  clearOldNotifications: adminProcedure.mutation(({ ctx }) => {
    const userNotifications = notifications.filter((n) => n.userId === ctx.user.id);

    if (userNotifications.length > 100) {
      const toRemove = userNotifications.length - 100;
      const oldestNotifications = userNotifications
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(0, toRemove);

      oldestNotifications.forEach((n) => {
        const index = notifications.indexOf(n);
        if (index > -1) {
          notifications.splice(index, 1);
        }
      });

      return { removed: toRemove };
    }

    return { removed: 0 };
  }),
});
