export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export class ChatHistoryService {
  private static sessions: Map<string, ChatSession> = new Map();

  static createSession(userId: string, title: string = 'New Chat'): ChatSession {
    const session: ChatSession = {
      id: `session-${Date.now()}-${Math.random()}`,
      userId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  static addMessage(sessionId: string, role: 'user' | 'assistant', content: string): ChatMessage {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
    };
    session.messages.push(message);
    session.updatedAt = Date.now();
    return message;
  }

  static getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  static getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  static updateSessionTitle(sessionId: string, title: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      session.updatedAt = Date.now();
    }
  }

  static deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  static searchSessions(userId: string, query: string): ChatSession[] {
    return this.getUserSessions(userId).filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.messages.some(m => m.content.toLowerCase().includes(query.toLowerCase()))
    );
  }
}
