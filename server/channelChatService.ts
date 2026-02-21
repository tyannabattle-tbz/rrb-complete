import { db } from './db';
import { channelMessages } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export interface ChannelMessage {
  id: string;
  channelId: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  likes: number;
}

/**
 * Send a message to a channel chat
 */
export async function sendChannelMessage(
  channelId: string,
  userId: number,
  username: string,
  message: string
): Promise<ChannelMessage> {
  try {
    // Validate message length
    if (message.length === 0 || message.length > 500) {
      throw new Error('Message must be between 1 and 500 characters');
    }

    const result = await db
      .insert(channelMessages)
      .values({
        channelId,
        userId,
        username,
        message: message.trim(),
        timestamp: new Date(),
        likes: 0,
      })
      .returning();

    return result[0] as ChannelMessage;
  } catch (error) {
    console.error('[Chat] Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Get recent messages for a channel
 */
export async function getChannelMessages(channelId: string, limit: number = 50): Promise<ChannelMessage[]> {
  try {
    const messages = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId))
      .orderBy(desc(channelMessages.timestamp))
      .limit(limit);

    return messages.reverse() as ChannelMessage[];
  } catch (error) {
    console.error('[Chat] Error fetching messages:', error);
    return [];
  }
}

/**
 * Delete a message
 */
export async function deleteChannelMessage(messageId: string, userId: number): Promise<boolean> {
  try {
    const message = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.id, messageId))
      .limit(1);

    if (message.length === 0) {
      throw new Error('Message not found');
    }

    // Only allow user who sent it or admins to delete
    if (message[0].userId !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    const result = await db
      .delete(channelMessages)
      .where(eq(channelMessages.id, messageId));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error('[Chat] Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
}

/**
 * Like a message
 */
export async function likeChannelMessage(messageId: string): Promise<number> {
  try {
    const message = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.id, messageId))
      .limit(1);

    if (message.length === 0) {
      throw new Error('Message not found');
    }

    const newLikes = (message[0].likes || 0) + 1;

    await db
      .update(channelMessages)
      .set({ likes: newLikes })
      .where(eq(channelMessages.id, messageId));

    return newLikes;
  } catch (error) {
    console.error('[Chat] Error liking message:', error);
    throw new Error('Failed to like message');
  }
}

/**
 * Get message count for a channel
 */
export async function getChannelMessageCount(channelId: string): Promise<number> {
  try {
    const messages = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId));

    return messages.length;
  } catch (error) {
    console.error('[Chat] Error getting message count:', error);
    return 0;
  }
}

/**
 * Get active users in channel (users who sent messages in last 5 minutes)
 */
export async function getActiveUsersInChannel(channelId: string): Promise<{ username: string; userId: number }[]> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const messages = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId));

    const activeUsers = new Map<number, string>();

    messages
      .filter(msg => new Date(msg.timestamp) > fiveMinutesAgo)
      .forEach(msg => {
        if (!activeUsers.has(msg.userId)) {
          activeUsers.set(msg.userId, msg.username);
        }
      });

    return Array.from(activeUsers.entries()).map(([userId, username]) => ({ userId, username }));
  } catch (error) {
    console.error('[Chat] Error getting active users:', error);
    return [];
  }
}

/**
 * Clear all messages for a channel (admin only)
 */
export async function clearChannelMessages(channelId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(channelMessages)
      .where(eq(channelMessages.channelId, channelId));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error('[Chat] Error clearing messages:', error);
    throw new Error('Failed to clear messages');
  }
}

/**
 * Search messages in a channel
 */
export async function searchChannelMessages(channelId: string, searchTerm: string): Promise<ChannelMessage[]> {
  try {
    const messages = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId));

    return messages.filter(msg =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) as ChannelMessage[];
  } catch (error) {
    console.error('[Chat] Error searching messages:', error);
    return [];
  }
}
