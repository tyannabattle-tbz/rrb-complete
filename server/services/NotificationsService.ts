import { db } from '../db';
import { notifications, userPreferences } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export type NotificationType = 
  | 'playlist_shared' 
  | 'new_comment' 
  | 'comment_reply' 
  | 'content_liked' 
  | 'trending_match' 
  | 'user_followed' 
  | 'new_recommendation';

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedContentId?: string;
  relatedUserId?: string;
  actionUrl?: string;
}

export class NotificationsService {
  async createNotification(input: NotificationInput) {
    const notification = await db.insert(notifications).values({
      id: `notif_${Date.now()}`,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedContentId: input.relatedContentId,
      relatedUserId: input.relatedUserId,
      actionUrl: input.actionUrl,
      isRead: false,
      createdAt: new Date(),
    }).returning();
    return notification[0];
  }

  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    return await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit,
      offset,
    });
  }

  async getUnreadNotifications(userId: string) {
    return await db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ),
      orderBy: [desc(notifications.createdAt)],
    });
  }

  async getUnreadCount(userId: string) {
    const unread = await db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ),
    });
    return unread.length;
  }

  async markAsRead(notificationId: string, userId: string) {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();
  }

  async markAllAsRead(userId: string) {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .returning();
  }

  async deleteNotification(notificationId: string, userId: string) {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
  }

  async deleteOldNotifications(userId: string, daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          // @ts-ignore - drizzle-orm doesn't have lt operator in all versions
          notifications.createdAt < cutoffDate
        )
      );
  }

  async getNotificationPreferences(userId: string) {
    return await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      playlistShareNotifications?: boolean;
      commentNotifications?: boolean;
      trendingMatchNotifications?: boolean;
      followNotifications?: boolean;
      recommendationNotifications?: boolean;
    }
  ) {
    const existing = await this.getNotificationPreferences(userId);

    if (existing) {
      return await db
        .update(userPreferences)
        .set({
          ...preferences,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
    } else {
      return await db.insert(userPreferences).values({
        id: `pref_${Date.now()}`,
        userId,
        emailNotifications: preferences.emailNotifications ?? true,
        pushNotifications: preferences.pushNotifications ?? true,
        playlistShareNotifications: preferences.playlistShareNotifications ?? true,
        commentNotifications: preferences.commentNotifications ?? true,
        trendingMatchNotifications: preferences.trendingMatchNotifications ?? true,
        followNotifications: preferences.followNotifications ?? true,
        recommendationNotifications: preferences.recommendationNotifications ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
    }
  }

  async sendEmailNotification(
    userId: string,
    userEmail: string,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    // Integration with email service (e.g., SendGrid, Mailgun)
    // This is a placeholder - implement with your email provider
    console.log(`[EMAIL] To: ${userEmail}, Subject: ${title}, Message: ${message}`);
    return { success: true, messageId: `email_${Date.now()}` };
  }

  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    // Integration with push notification service (e.g., Firebase Cloud Messaging)
    // This is a placeholder - implement with your push service
    console.log(`[PUSH] User: ${userId}, Title: ${title}, Message: ${message}`);
    return { success: true, messageId: `push_${Date.now()}` };
  }

  async notifyPlaylistShare(
    recipientUserId: string,
    senderName: string,
    playlistName: string,
    playlistId: string
  ) {
    const notification = await this.createNotification({
      userId: recipientUserId,
      type: 'playlist_shared',
      title: `${senderName} shared a playlist`,
      message: `${senderName} shared "${playlistName}" with you`,
      relatedContentId: playlistId,
      actionUrl: `/playlist/${playlistId}`,
    });

    const prefs = await this.getNotificationPreferences(recipientUserId);
    if (prefs?.playlistShareNotifications) {
      // Send push/email based on preferences
    }

    return notification;
  }

  async notifyNewComment(
    contentOwnerId: string,
    commenterName: string,
    contentTitle: string,
    contentId: string,
    commentId: string
  ) {
    const notification = await this.createNotification({
      userId: contentOwnerId,
      type: 'new_comment',
      title: `${commenterName} commented on your content`,
      message: `${commenterName} commented on "${contentTitle}"`,
      relatedContentId: contentId,
      actionUrl: `/content/${contentId}#comment-${commentId}`,
    });

    return notification;
  }

  async notifyTrendingMatch(
    userId: string,
    contentTitle: string,
    contentId: string
  ) {
    const notification = await this.createNotification({
      userId,
      type: 'trending_match',
      title: 'Trending content matching your interests',
      message: `"${contentTitle}" is trending and matches your listening preferences`,
      relatedContentId: contentId,
      actionUrl: `/content/${contentId}`,
    });

    return notification;
  }

  async notifyUserFollowed(
    userId: string,
    followerName: string,
    followerId: string
  ) {
    const notification = await this.createNotification({
      userId,
      type: 'user_followed',
      title: `${followerName} started following you`,
      message: `${followerName} is now following your profile`,
      relatedUserId: followerId,
      actionUrl: `/profile/${followerId}`,
    });

    return notification;
  }

  async notifyNewRecommendation(
    userId: string,
    recommendedContentTitle: string,
    contentId: string,
    reason: string
  ) {
    const notification = await this.createNotification({
      userId,
      type: 'new_recommendation',
      title: 'New recommendation for you',
      message: `We think you'll like "${recommendedContentTitle}" - ${reason}`,
      relatedContentId: contentId,
      actionUrl: `/content/${contentId}`,
    });

    return notification;
  }
}

export const notificationsService = new NotificationsService();
