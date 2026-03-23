/**
 * Real-time Collaboration & Co-hosting System
 * Enables multiple creators to broadcast simultaneously on RRB Radio channels
 * Features: shared control, live mixing, audience interaction, and synchronized playback
 */

export type HostRole = 'primary' | 'secondary' | 'guest' | 'moderator';
export type CollaborationStatus = 'idle' | 'connecting' | 'active' | 'paused' | 'ended';

export interface Host {
  id: string;
  name: string;
  role: HostRole;
  status: 'online' | 'offline' | 'broadcasting';
  joinedAt: number;
  micActive: boolean;
  volume: number;
  metadata: Record<string, any>;
}

export interface CollaborationSession {
  id: string;
  channelId: string;
  title: string;
  description: string;
  hosts: Host[];
  status: CollaborationStatus;
  startTime: number;
  endTime?: number;
  listeners: number;
  recordingUrl?: string;
  metadata: Record<string, any>;
}

export interface AudioMix {
  hostId: string;
  volume: number;
  pan: number; // -1 (left) to 1 (right)
  effects: {
    reverb: number;
    echo: number;
    compression: number;
  };
}

export interface ChatMessage {
  id: string;
  hostId: string;
  hostName: string;
  message: string;
  timestamp: number;
  mentions: string[];
}

export class RealtimeCollaboration {
  private sessions: Map<string, CollaborationSession> = new Map();
  private audioMixes: Map<string, AudioMix[]> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private connectionPool: Map<string, any> = new Map();
  private maxHosts = 8;
  private maxListeners = 100000;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize collaboration system
   */
  private initialize() {
    console.log('[Real-time Collaboration] Initializing co-hosting system...');
    console.log(`[Real-time Collaboration] Max hosts per session: ${this.maxHosts}`);
    console.log('[Real-time Collaboration] Ready for multi-host broadcasts');
  }

  /**
   * Create collaboration session
   */
  createSession(
    channelId: string,
    title: string,
    description: string,
    primaryHostId: string,
    primaryHostName: string,
  ): CollaborationSession {
    const session: CollaborationSession = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      title,
      description,
      hosts: [
        {
          id: primaryHostId,
          name: primaryHostName,
          role: 'primary',
          status: 'online',
          joinedAt: Date.now(),
          micActive: true,
          volume: 1,
          metadata: {},
        },
      ],
      status: 'idle',
      startTime: Date.now(),
      listeners: 0,
      metadata: {},
    };

    this.sessions.set(session.id, session);
    this.audioMixes.set(session.id, []);
    this.chatMessages.set(session.id, []);

    console.log(`[Real-time Collaboration] Session created: ${title} on channel ${channelId}`);

    return session;
  }

  /**
   * Add host to session
   */
  addHost(
    sessionId: string,
    hostId: string,
    hostName: string,
    role: HostRole = 'secondary',
  ): Host | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.hosts.length >= this.maxHosts) {
      console.warn(`[Real-time Collaboration] Max hosts reached for session ${sessionId}`);
      return null;
    }

    const host: Host = {
      id: hostId,
      name: hostName,
      role,
      status: 'online',
      joinedAt: Date.now(),
      micActive: true,
      volume: 0.8,
      metadata: {},
    };

    session.hosts.push(host);

    // Initialize audio mix for this host
    const mixes = this.audioMixes.get(sessionId) || [];
    mixes.push({
      hostId,
      volume: 0.8,
      pan: 0,
      effects: { reverb: 0, echo: 0, compression: 0 },
    });
    this.audioMixes.set(sessionId, mixes);

    console.log(`[Real-time Collaboration] Host ${hostName} (${role}) added to session ${sessionId}`);

    return host;
  }

  /**
   * Remove host from session
   */
  removeHost(sessionId: string, hostId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.hosts.findIndex((h) => h.id === hostId);
    if (index === -1) return false;

    const host = session.hosts[index];
    session.hosts.splice(index, 1);

    // Remove audio mix
    const mixes = this.audioMixes.get(sessionId) || [];
    const mixIndex = mixes.findIndex((m) => m.hostId === hostId);
    if (mixIndex !== -1) {
      mixes.splice(mixIndex, 1);
    }

    console.log(`[Real-time Collaboration] Host ${host.name} removed from session ${sessionId}`);

    return true;
  }

  /**
   * Start broadcast
   */
  startBroadcast(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (session.hosts.length === 0) {
      console.warn(`[Real-time Collaboration] Cannot start broadcast without hosts`);
      return false;
    }

    session.status = 'active';
    session.startTime = Date.now();

    console.log(`[Real-time Collaboration] Broadcast started: ${session.title}`);

    return true;
  }

  /**
   * Pause broadcast
   */
  pauseBroadcast(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'paused';
    console.log(`[Real-time Collaboration] Broadcast paused: ${session.title}`);

    return true;
  }

  /**
   * End broadcast
   */
  endBroadcast(sessionId: string, recordingUrl?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'ended';
    session.endTime = Date.now();
    if (recordingUrl) {
      session.recordingUrl = recordingUrl;
    }

    console.log(`[Real-time Collaboration] Broadcast ended: ${session.title}`);

    return true;
  }

  /**
   * Update audio mix for host
   */
  updateAudioMix(sessionId: string, hostId: string, mix: Partial<AudioMix>): boolean {
    const mixes = this.audioMixes.get(sessionId);
    if (!mixes) return false;

    const hostMix = mixes.find((m) => m.hostId === hostId);
    if (!hostMix) return false;

    Object.assign(hostMix, mix);
    return true;
  }

  /**
   * Toggle host microphone
   */
  toggleMicrophone(sessionId: string, hostId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const host = session.hosts.find((h) => h.id === hostId);
    if (!host) return false;

    host.micActive = !host.micActive;
    console.log(
      `[Real-time Collaboration] Microphone ${host.micActive ? 'enabled' : 'disabled'} for ${host.name}`,
    );

    return true;
  }

  /**
   * Update host volume
   */
  updateHostVolume(sessionId: string, hostId: string, volume: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const host = session.hosts.find((h) => h.id === hostId);
    if (!host) return false;

    host.volume = Math.max(0, Math.min(1, volume));
    return true;
  }

  /**
   * Add chat message
   */
  addChatMessage(
    sessionId: string,
    hostId: string,
    hostName: string,
    message: string,
  ): ChatMessage {
    const chatMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hostId,
      hostName,
      message,
      timestamp: Date.now(),
      mentions: this.extractMentions(message),
    };

    if (!this.chatMessages.has(sessionId)) {
      this.chatMessages.set(sessionId, []);
    }

    this.chatMessages.get(sessionId)!.push(chatMsg);
    return chatMsg;
  }

  /**
   * Extract mentions from message
   */
  private extractMentions(message: string): string[] {
    const regex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = regex.exec(message)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  /**
   * Update listener count
   */
  updateListenerCount(sessionId: string, count: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.listeners = Math.min(count, this.maxListeners);
    }
  }

  /**
   * Get session
   */
  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get chat history
   */
  getChatHistory(sessionId: string, limit: number = 100): ChatMessage[] {
    const messages = this.chatMessages.get(sessionId) || [];
    return messages.slice(-limit);
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const duration = (session.endTime || Date.now()) - session.startTime;
    const onlineHosts = session.hosts.filter((h) => h.status === 'online').length;
    const activeMics = session.hosts.filter((h) => h.micActive).length;

    return {
      sessionId,
      title: session.title,
      status: session.status,
      duration,
      totalHosts: session.hosts.length,
      onlineHosts,
      activeMics,
      listeners: session.listeners,
      messages: (this.chatMessages.get(sessionId) || []).length,
      hosts: session.hosts.map((h) => ({
        name: h.name,
        role: h.role,
        status: h.status,
        micActive: h.micActive,
      })),
    };
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'active');
  }

  /**
   * Get collaboration statistics
   */
  getCollaborationStats() {
    const allSessions = Array.from(this.sessions.values());
    const activeSessions = allSessions.filter((s) => s.status === 'active');
    const totalHosts = allSessions.reduce((sum, s) => sum + s.hosts.length, 0);
    const totalListeners = allSessions.reduce((sum, s) => sum + s.listeners, 0);
    const totalMessages = Array.from(this.chatMessages.values()).reduce((sum, msgs) => sum + msgs.length, 0);

    return {
      totalSessions: allSessions.length,
      activeSessions: activeSessions.length,
      totalHosts,
      totalListeners,
      totalMessages,
      averageHostsPerSession: (totalHosts / allSessions.length).toFixed(1),
      averageListenersPerSession: (totalListeners / allSessions.length).toFixed(0),
    };
  }
}

// Singleton instance
export const realtimeCollaboration = new RealtimeCollaboration();
