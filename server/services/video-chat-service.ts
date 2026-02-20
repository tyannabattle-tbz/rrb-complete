/**
 * Video Chat Service
 * Real-time comment streaming for videos
 * A Canryn Production
 */

interface ChatMessage {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  likes: number;
  replies: ChatMessage[];
  isModerated: boolean;
}

interface ChatSession {
  videoId: string;
  activeUsers: number;
  messages: ChatMessage[];
  createdAt: number;
}

const chatSessions = new Map<string, ChatSession>();
const messageStore = new Map<string, ChatMessage[]>();

export const videoChatService = {
  // Create or get chat session for video
  getOrCreateSession(videoId: string): ChatSession {
    if (!chatSessions.has(videoId)) {
      chatSessions.set(videoId, {
        videoId,
        activeUsers: 0,
        messages: messageStore.get(videoId) || [],
        createdAt: Date.now(),
      });
    }
    return chatSessions.get(videoId)!;
  },

  // Add message to chat
  addMessage(videoId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'likes' | 'replies' | 'isModerated'>): ChatMessage {
    const session = this.getOrCreateSession(videoId);
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      likes: 0,
      replies: [],
      isModerated: false,
    };

    session.messages.push(newMessage);
    if (!messageStore.has(videoId)) {
      messageStore.set(videoId, []);
    }
    messageStore.get(videoId)!.push(newMessage);

    return newMessage;
  },

  // Get messages for video
  getMessages(videoId: string, limit: number = 50): ChatMessage[] {
    const messages = messageStore.get(videoId) || [];
    return messages.slice(-limit);
  },

  // Like a message
  likeMessage(videoId: string, messageId: string): ChatMessage | null {
    const messages = messageStore.get(videoId) || [];
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.likes += 1;
    }
    return message || null;
  },

  // Reply to message
  replyToMessage(videoId: string, messageId: string, reply: Omit<ChatMessage, 'id' | 'timestamp' | 'likes' | 'replies' | 'isModerated'>): ChatMessage | null {
    const messages = messageStore.get(videoId) || [];
    const parentMessage = messages.find(m => m.id === messageId);
    
    if (parentMessage) {
      const newReply: ChatMessage = {
        ...reply,
        id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        likes: 0,
        replies: [],
        isModerated: false,
      };
      parentMessage.replies.push(newReply);
      return newReply;
    }
    return null;
  },

  // Moderate message
  moderateMessage(videoId: string, messageId: string, isModerated: boolean): ChatMessage | null {
    const messages = messageStore.get(videoId) || [];
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.isModerated = isModerated;
    }
    return message || null;
  },

  // Get active users count
  getActiveUsers(videoId: string): number {
    const session = chatSessions.get(videoId);
    return session?.activeUsers || 0;
  },

  // Update active users
  updateActiveUsers(videoId: string, count: number): void {
    const session = this.getOrCreateSession(videoId);
    session.activeUsers = Math.max(0, count);
  },

  // Delete message
  deleteMessage(videoId: string, messageId: string): boolean {
    const messages = messageStore.get(videoId) || [];
    const index = messages.findIndex(m => m.id === messageId);
    if (index > -1) {
      messages.splice(index, 1);
      return true;
    }
    return false;
  },

  // Search messages
  searchMessages(videoId: string, query: string): ChatMessage[] {
    const messages = messageStore.get(videoId) || [];
    const lowerQuery = query.toLowerCase();
    return messages.filter(m => 
      m.content.toLowerCase().includes(lowerQuery) ||
      m.userName.toLowerCase().includes(lowerQuery)
    );
  },

  // Get message statistics
  getStatistics(videoId: string) {
    const messages = messageStore.get(videoId) || [];
    const totalMessages = messages.length;
    const totalLikes = messages.reduce((sum, m) => sum + m.likes, 0);
    const totalReplies = messages.reduce((sum, m) => sum + m.replies.length, 0);
    const uniqueUsers = new Set(messages.map(m => m.userId)).size;

    return {
      totalMessages,
      totalLikes,
      totalReplies,
      uniqueUsers,
      averageLikesPerMessage: totalMessages > 0 ? totalLikes / totalMessages : 0,
    };
  },
};
