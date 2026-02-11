import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const notificationsRouter = router({
  /**
   * Get all notifications for the current user
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      // Mock notifications for demonstration
      const mockNotifications = [
        {
          id: "notif-1",
          type: "comment",
          title: "New comment on your video",
          message: "Sarah commented on 'Cinematic Sunset': Great work!",
          videoId: "video-123",
          videoTitle: "Cinematic Sunset",
          userId: "user-sarah",
          userName: "Sarah",
          userAvatar: "https://via.placeholder.com/40?text=S",
          createdAt: new Date(Date.now() - 3600000),
          read: false,
          actionUrl: "/gallery",
        },
        {
          id: "notif-2",
          type: "reaction",
          title: "New reaction on your video",
          message: "10 people reacted to 'Motion Graphics Showcase'",
          videoId: "video-456",
          videoTitle: "Motion Graphics Showcase",
          reactionCount: 10,
          reactionType: "love",
          createdAt: new Date(Date.now() - 7200000),
          read: false,
          actionUrl: "/gallery",
        },
        {
          id: "notif-3",
          type: "follow",
          title: "New follower",
          message: "Alex started following you",
          userId: "user-alex",
          userName: "Alex",
          userAvatar: "https://via.placeholder.com/40?text=A",
          createdAt: new Date(Date.now() - 86400000),
          read: true,
          actionUrl: "/profile/user-alex",
        },
        {
          id: "notif-4",
          type: "milestone",
          title: "Milestone reached!",
          message: "Your video 'Cinematic Sunset' reached 1,000 views!",
          videoId: "video-123",
          videoTitle: "Cinematic Sunset",
          milestone: "1000_views",
          createdAt: new Date(Date.now() - 172800000),
          read: true,
          actionUrl: "/gallery",
        },
      ];

      const filtered = input.unreadOnly
        ? mockNotifications.filter((n) => !n.read)
        : mockNotifications;

      return {
        notifications: filtered.slice(input.offset, input.offset + input.limit),
        total: filtered.length,
        unreadCount: mockNotifications.filter((n) => !n.read).length,
      };
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, update database
      return {
        success: true,
        notificationId: input.notificationId,
      };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    // In production, update database
    return {
      success: true,
      markedCount: 4,
    };
  }),

  /**
   * Delete notification
   */
  deleteNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, delete from database
      return {
        success: true,
        notificationId: input.notificationId,
      };
    }),

  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // Mock preferences
    return {
      emailNotifications: true,
      pushNotifications: true,
      commentNotifications: true,
      reactionNotifications: true,
      followNotifications: true,
      milestoneNotifications: true,
      newVideoNotifications: false,
      digestFrequency: "daily", // daily, weekly, never
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        commentNotifications: z.boolean().optional(),
        reactionNotifications: z.boolean().optional(),
        followNotifications: z.boolean().optional(),
        milestoneNotifications: z.boolean().optional(),
        newVideoNotifications: z.boolean().optional(),
        digestFrequency: z.enum(["daily", "weekly", "never"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, update database
      return {
        success: true,
        preferences: input,
      };
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    // In production, query database
    return {
      unreadCount: 2,
    };
  }),
});
