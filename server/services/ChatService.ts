import { db } from '../db';
import { conversations, messages } from '../../drizzle/schema';
import { eq, and, desc, or } from 'drizzle-orm';

export interface MessageInput {
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
}

export interface ConversationInput {
  participantIds: string[];
  name?: string;
  isGroup?: boolean;
}

export class ChatService {
  /**
   * Create or get a conversation between users
   */
  async getOrCreateConversation(userId1: string, userId2: string) {
    // Find existing conversation
    const existing = await db.query.conversations.findMany({
      where: (table) => {
        // This would need proper implementation based on your schema
        return undefined;
      },
    });

    // Check if conversation exists between these two users
    let conversation = existing.find((conv) => {
      const participants = conv.participantIds || [];
      return (
        participants.includes(userId1) &&
        participants.includes(userId2) &&
        !conv.isGroup
      );
    });

    if (!conversation) {
      // Create new conversation
      const newConv = await db.insert(conversations).values({
        id: `conv_${Date.now()}`,
        participantIds: [userId1, userId2],
        isGroup: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      conversation = newConv[0];
    }

    return conversation;
  }

  /**
   * Create a group conversation
   */
  async createGroupConversation(
    creatorId: string,
    participantIds: string[],
    name: string
  ) {
    const allParticipants = [creatorId, ...participantIds].filter(
      (id, index, self) => self.indexOf(id) === index
    );

    return await db.insert(conversations).values({
      id: `conv_${Date.now()}`,
      name,
      participantIds: allParticipants,
      isGroup: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
  }

  /**
   * Send a message
   */
  async sendMessage(input: MessageInput) {
    const message = await db.insert(messages).values({
      id: `msg_${Date.now()}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      content: input.content,
      attachmentUrl: input.attachmentUrl,
      isRead: false,
      createdAt: new Date(),
    }).returning();

    // Update conversation lastMessage and updatedAt
    await db
      .update(conversations)
      .set({
        lastMessage: input.content,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, input.conversationId));

    return message[0];
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ) {
    return await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [desc(messages.createdAt)],
      limit,
      offset,
    });
  }

  /**
   * Get user conversations
   */
  async getUserConversations(userId: string, limit = 50) {
    const convs = await db.query.conversations.findMany({
      limit,
      orderBy: [desc(conversations.lastMessageAt)],
    });

    return convs.filter((conv) =>
      (conv.participantIds || []).includes(userId)
    );
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string) {
    return await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          // Not sent by this user
        )
      )
      .returning();
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string) {
    const convs = await this.getUserConversations(userId);
    let totalUnread = 0;

    for (const conv of convs) {
      const unread = await db.query.messages.findMany({
        where: and(
          eq(messages.conversationId, conv.id),
          eq(messages.isRead, false)
        ),
      });
      totalUnread += unread.length;
    }

    return totalUnread;
  }

  /**
   * Search messages
   */
  async searchMessages(conversationId: string, query: string) {
    const allMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
    });

    return allMessages.filter((msg) =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (message?.senderId !== userId) {
      throw new Error('Unauthorized');
    }

    await db.delete(messages).where(eq(messages.id, messageId));
  }

  /**
   * Edit message
   */
  async editMessage(messageId: string, userId: string, newContent: string) {
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (message?.senderId !== userId) {
      throw new Error('Unauthorized');
    }

    return await db
      .update(messages)
      .set({
        content: newContent,
        isEdited: true,
      })
      .where(eq(messages.id, messageId))
      .returning();
  }

  /**
   * Get typing status
   */
  getTypingStatus(conversationId: string): Map<string, boolean> {
    // This would be managed by WebSocket in production
    return new Map();
  }

  /**
   * Set typing status
   */
  setTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): void {
    // This would be managed by WebSocket in production
    console.log(`User ${userId} typing: ${isTyping}`);
  }

  /**
   * Add participant to group conversation
   */
  async addParticipant(conversationId: string, userId: string) {
    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conv?.isGroup) {
      throw new Error('Can only add participants to group conversations');
    }

    const participants = conv.participantIds || [];
    if (participants.includes(userId)) {
      return conv; // Already a participant
    }

    return await db
      .update(conversations)
      .set({
        participantIds: [...participants, userId],
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();
  }

  /**
   * Remove participant from group conversation
   */
  async removeParticipant(conversationId: string, userId: string) {
    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conv?.isGroup) {
      throw new Error('Can only remove participants from group conversations');
    }

    const participants = (conv.participantIds || []).filter((id) => id !== userId);

    return await db
      .update(conversations)
      .set({
        participantIds: participants,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();
  }
}

export const chatService = new ChatService();
