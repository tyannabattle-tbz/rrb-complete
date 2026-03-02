import { getDb } from '../db';
import type { InferSelectModel } from 'drizzle-orm';

/**
 * Real-Time Collaboration Service
 * Manages shared listening sessions with synchronized playback across devices
 */

export interface ListeningSession {
  id: string;
  name: string;
  hostId: string;
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    duration: number;
  };
  playbackState: 'playing' | 'paused' | 'stopped';
  currentTime: number;
  participants: SessionParticipant[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface SessionParticipant {
  userId: string;
  username: string;
  joinedAt: number;
  isHost: boolean;
  isMuted: boolean;
  lastHeartbeat: number;
}

export interface PlaybackSync {
  sessionId: string;
  trackId: string;
  currentTime: number;
  playbackState: 'playing' | 'paused';
  timestamp: number;
}

export class RealTimeCollaborationService {
  private sessions: Map<string, ListeningSession> = new Map();
  private playbackTimers: Map<string, NodeJS.Timeout> = new Map();
  private participantHeartbeats: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new listening session
   */
  async createSession(
    hostId: string,
    sessionName: string,
    initialTrack: { id: string; title: string; artist: string; duration: number }
  ): Promise<ListeningSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: ListeningSession = {
      id: sessionId,
      name: sessionName,
      hostId,
      currentTrack: initialTrack,
      playbackState: 'paused',
      currentTime: 0,
      participants: [
        {
          userId: hostId,
          username: `User-${hostId.substring(0, 8)}`,
          joinedAt: Date.now(),
          isHost: true,
          isMuted: false,
          lastHeartbeat: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    this.startPlaybackSync(sessionId);

    return session;
  }

  /**
   * Join an existing listening session
   */
  async joinSession(sessionId: string, userId: string): Promise<ListeningSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return null;
    }

    // Check if user already in session
    const existingParticipant = session.participants.find((p) => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.lastHeartbeat = Date.now();
      return session;
    }

    // Add new participant
    session.participants.push({
      userId,
      username: `User-${userId.substring(0, 8)}`,
      joinedAt: Date.now(),
      isHost: false,
      isMuted: false,
      lastHeartbeat: Date.now(),
    });

    session.updatedAt = Date.now();
    return session;
  }

  /**
   * Leave a listening session
   */
  async leaveSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participantIndex = session.participants.findIndex((p) => p.userId === userId);
    if (participantIndex === -1) {
      return false;
    }

    session.participants.splice(participantIndex, 1);
    session.updatedAt = Date.now();

    // If host left, assign new host or close session
    if (session.participants[participantIndex]?.isHost) {
      if (session.participants.length > 0) {
        session.participants[0].isHost = true;
      } else {
        session.isActive = false;
        this.stopPlaybackSync(sessionId);
      }
    }

    return true;
  }

  /**
   * Play track in session
   */
  async playTrack(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find((p) => p.userId === userId);
    if (!participant?.isHost) {
      return false; // Only host can control playback
    }

    session.playbackState = 'playing';
    session.updatedAt = Date.now();

    // Broadcast playback state to all participants
    this.broadcastPlaybackState(sessionId);

    return true;
  }

  /**
   * Pause track in session
   */
  async pauseTrack(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find((p) => p.userId === userId);
    if (!participant?.isHost) {
      return false;
    }

    session.playbackState = 'paused';
    session.updatedAt = Date.now();

    this.broadcastPlaybackState(sessionId);

    return true;
  }

  /**
   * Skip to next track
   */
  async skipTrack(sessionId: string, userId: string, nextTrack: any): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find((p) => p.userId === userId);
    if (!participant?.isHost) {
      return false;
    }

    session.currentTrack = nextTrack;
    session.currentTime = 0;
    session.playbackState = 'playing';
    session.updatedAt = Date.now();

    this.broadcastPlaybackState(sessionId);

    return true;
  }

  /**
   * Seek to specific time
   */
  async seekTo(sessionId: string, userId: string, time: number): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find((p) => p.userId === userId);
    if (!participant?.isHost) {
      return false;
    }

    session.currentTime = Math.min(time, session.currentTrack.duration);
    session.updatedAt = Date.now();

    this.broadcastPlaybackState(sessionId);

    return true;
  }

  /**
   * Toggle mute for participant
   */
  async toggleMute(sessionId: string, userId: string, targetUserId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find((p) => p.userId === userId);
    if (!participant?.isHost) {
      return false;
    }

    const targetParticipant = session.participants.find((p) => p.userId === targetUserId);
    if (!targetParticipant) {
      return false;
    }

    targetParticipant.isMuted = !targetParticipant.isMuted;
    session.updatedAt = Date.now();

    return true;
  }

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<ListeningSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<ListeningSession[]> {
    return Array.from(this.sessions.values()).filter((s) => s.isActive);
  }

  /**
   * Get sessions for user
   */
  async getUserSessions(userId: string): Promise<ListeningSession[]> {
    return Array.from(this.sessions.values()).filter(
      (s) => s.isActive && s.participants.some((p) => p.userId === userId)
    );
  }

  /**
   * Get participant count for session
   */
  async getParticipantCount(sessionId: string): Promise<number> {
    const session = this.sessions.get(sessionId);
    return session?.participants.length || 0;
  }

  /**
   * Broadcast playback state to all participants
   */
  private broadcastPlaybackState(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // In production, this would use WebSocket to broadcast to all connected clients
    // For now, we're simulating with in-memory updates
    session.updatedAt = Date.now();
  }

  /**
   * Start playback synchronization for session
   */
  private startPlaybackSync(sessionId: string): void {
    const timer = setInterval(() => {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isActive) {
        this.stopPlaybackSync(sessionId);
        return;
      }

      if (session.playbackState === 'playing') {
        session.currentTime += 0.1; // Increment by 100ms

        // Check if track finished
        if (session.currentTime >= session.currentTrack.duration) {
          session.currentTime = 0;
          session.playbackState = 'paused';
        }
      }
    }, 100);

    this.playbackTimers.set(sessionId, timer);
  }

  /**
   * Stop playback synchronization for session
   */
  private stopPlaybackSync(sessionId: string): void {
    const timer = this.playbackTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.playbackTimers.delete(sessionId);
    }
  }

  /**
   * Monitor participant heartbeats and remove inactive participants
   */
  async monitorParticipantHealth(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    const now = Date.now();
    const timeout = 30000; // 30 seconds

    // Remove inactive participants
    session.participants = session.participants.filter((p) => now - p.lastHeartbeat < timeout);

    // Close session if no participants
    if (session.participants.length === 0) {
      session.isActive = false;
      this.stopPlaybackSync(sessionId);
    }
  }

  /**
   * Update participant heartbeat
   */
  async updateHeartbeat(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find((p) => p.userId === userId);
    if (!participant) {
      return false;
    }

    participant.lastHeartbeat = Date.now();
    return true;
  }

  /**
   * Get playback sync state for client
   */
  async getPlaybackSync(sessionId: string): Promise<PlaybackSync | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId,
      trackId: session.currentTrack.id,
      currentTime: session.currentTime,
      playbackState: session.playbackState,
      timestamp: Date.now(),
    };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId,
      participantCount: session.participants.length,
      duration: Date.now() - session.createdAt,
      currentTrack: session.currentTrack.title,
      playbackState: session.playbackState,
      isActive: session.isActive,
    };
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.isActive = false;
    this.stopPlaybackSync(sessionId);

    // Clear after 5 minutes
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 300000);

    return true;
  }
}

// Export singleton instance
export const realTimeCollaborationService = new RealTimeCollaborationService();
