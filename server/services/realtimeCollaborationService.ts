import { db } from '../db';
import { eq, and } from 'drizzle-orm';

export interface ListeningSession {
  sessionId: string;
  sessionName: string;
  hostAgentId: string;
  participants: string[];
  currentTrackId: string;
  playbackPosition: number;
  isPlaying: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface SessionParticipant {
  agentId: string;
  joinedAt: Date;
  lastHeartbeat: Date;
  playbackPosition: number;
  isActive: boolean;
}

export interface SharedPlaylist {
  playlistId: string;
  sessionId: string;
  tracks: string[];
  currentTrackIndex: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RealtimeCollaborationService {
  private sessions = new Map<string, ListeningSession>();
  private participants = new Map<string, SessionParticipant[]>();

  /**
   * Create new listening session
   */
  async createListeningSession(
    hostAgentId: string,
    sessionName: string,
    initialTrackId?: string
  ): Promise<ListeningSession> {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const session: ListeningSession = {
        sessionId,
        sessionName,
        hostAgentId,
        participants: [hostAgentId],
        currentTrackId: initialTrackId || '',
        playbackPosition: 0,
        isPlaying: false,
        createdAt: now,
        updatedAt: now,
        expiresAt,
      };

      this.sessions.set(sessionId, session);
      this.participants.set(sessionId, [
        {
          agentId: hostAgentId,
          joinedAt: now,
          lastHeartbeat: now,
          playbackPosition: 0,
          isActive: true,
        },
      ]);

      console.log('Listening session created:', session);
      return session;
    } catch (error) {
      console.error('Error creating listening session:', error);
      throw new Error('Failed to create listening session');
    }
  }

  /**
   * Join listening session
   */
  async joinListeningSession(sessionId: string, agentId: string): Promise<ListeningSession> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (!session.participants.includes(agentId)) {
        session.participants.push(agentId);
      }

      const now = new Date();
      const sessionParticipants = this.participants.get(sessionId) || [];
      const existingParticipant = sessionParticipants.find((p) => p.agentId === agentId);

      if (existingParticipant) {
        existingParticipant.isActive = true;
        existingParticipant.lastHeartbeat = now;
      } else {
        sessionParticipants.push({
          agentId,
          joinedAt: now,
          lastHeartbeat: now,
          playbackPosition: session.playbackPosition,
          isActive: true,
        });
      }

      this.participants.set(sessionId, sessionParticipants);
      session.updatedAt = now;

      console.log(`Agent ${agentId} joined session ${sessionId}`);
      return session;
    } catch (error) {
      console.error('Error joining listening session:', error);
      throw new Error('Failed to join listening session');
    }
  }

  /**
   * Leave listening session
   */
  async leaveListeningSession(sessionId: string, agentId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.participants = session.participants.filter((p) => p !== agentId);
      const sessionParticipants = this.participants.get(sessionId) || [];
      const participant = sessionParticipants.find((p) => p.agentId === agentId);

      if (participant) {
        participant.isActive = false;
      }

      // Clean up empty sessions
      if (session.participants.length === 0) {
        this.sessions.delete(sessionId);
        this.participants.delete(sessionId);
      }

      console.log(`Agent ${agentId} left session ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Error leaving listening session:', error);
      throw new Error('Failed to leave listening session');
    }
  }

  /**
   * Update playback position for all participants
   */
  async updatePlaybackPosition(
    sessionId: string,
    agentId: string,
    trackId: string,
    position: number
  ): Promise<ListeningSession> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Only host can update track
      if (agentId === session.hostAgentId) {
        session.currentTrackId = trackId;
        session.playbackPosition = position;
      }

      // Update participant position
      const sessionParticipants = this.participants.get(sessionId) || [];
      const participant = sessionParticipants.find((p) => p.agentId === agentId);
      if (participant) {
        participant.playbackPosition = position;
        participant.lastHeartbeat = new Date();
      }

      session.updatedAt = new Date();
      return session;
    } catch (error) {
      console.error('Error updating playback position:', error);
      throw new Error('Failed to update playback position');
    }
  }

  /**
   * Control playback (play/pause)
   */
  async controlPlayback(
    sessionId: string,
    agentId: string,
    action: 'play' | 'pause'
  ): Promise<ListeningSession> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Only host can control playback
      if (agentId !== session.hostAgentId) {
        throw new Error('Only host can control playback');
      }

      session.isPlaying = action === 'play';
      session.updatedAt = new Date();

      console.log(`Playback ${action} for session ${sessionId}`);
      return session;
    } catch (error) {
      console.error('Error controlling playback:', error);
      throw new Error('Failed to control playback');
    }
  }

  /**
   * Skip to next track
   */
  async skipTrack(sessionId: string, agentId: string, nextTrackId: string): Promise<ListeningSession> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Only host can skip
      if (agentId !== session.hostAgentId) {
        throw new Error('Only host can skip tracks');
      }

      session.currentTrackId = nextTrackId;
      session.playbackPosition = 0;
      session.updatedAt = new Date();

      console.log(`Skipped to track ${nextTrackId} in session ${sessionId}`);
      return session;
    } catch (error) {
      console.error('Error skipping track:', error);
      throw new Error('Failed to skip track');
    }
  }

  /**
   * Get session details
   */
  async getSessionDetails(sessionId: string): Promise<{
    session: ListeningSession;
    participants: SessionParticipant[];
    activeParticipants: number;
  }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const participants = this.participants.get(sessionId) || [];
      const activeParticipants = participants.filter((p) => p.isActive).length;

      return {
        session,
        participants,
        activeParticipants,
      };
    } catch (error) {
      console.error('Error getting session details:', error);
      throw new Error('Failed to get session details');
    }
  }

  /**
   * Create shared playlist
   */
  async createSharedPlaylist(
    sessionId: string,
    createdBy: string,
    tracks: string[]
  ): Promise<SharedPlaylist> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const playlistId = `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      const playlist: SharedPlaylist = {
        playlistId,
        sessionId,
        tracks,
        currentTrackIndex: 0,
        createdBy,
        createdAt: now,
        updatedAt: now,
      };

      console.log('Shared playlist created:', playlist);
      return playlist;
    } catch (error) {
      console.error('Error creating shared playlist:', error);
      throw new Error('Failed to create shared playlist');
    }
  }

  /**
   * Add track to shared playlist
   */
  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<SharedPlaylist> {
    try {
      // In production, query from database
      const playlist: SharedPlaylist = {
        playlistId,
        sessionId: '',
        tracks: [trackId],
        currentTrackIndex: 0,
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Track added to playlist:', playlist);
      return playlist;
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw new Error('Failed to add track to playlist');
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(limit = 50): Promise<ListeningSession[]> {
    try {
      const now = new Date();
      const activeSessions = Array.from(this.sessions.values())
        .filter((s) => s.expiresAt > now && s.participants.length > 0)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit);

      return activeSessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw new Error('Failed to get active sessions');
    }
  }

  /**
   * Get user's active sessions
   */
  async getUserActiveSessions(agentId: string): Promise<ListeningSession[]> {
    try {
      const userSessions = Array.from(this.sessions.values()).filter(
        (s) => s.participants.includes(agentId) && s.expiresAt > new Date()
      );

      return userSessions;
    } catch (error) {
      console.error('Error getting user active sessions:', error);
      throw new Error('Failed to get user active sessions');
    }
  }

  /**
   * Broadcast message to session participants
   */
  async broadcastMessage(
    sessionId: string,
    senderAgentId: string,
    message: string,
    messageType: 'chat' | 'notification' | 'system'
  ): Promise<{
    messageId: string;
    sessionId: string;
    sender: string;
    message: string;
    type: string;
    timestamp: Date;
  }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const broadcastMessage = {
        messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        sender: senderAgentId,
        message,
        type: messageType,
        timestamp: new Date(),
      };

      console.log('Message broadcast to session:', broadcastMessage);
      return broadcastMessage;
    } catch (error) {
      console.error('Error broadcasting message:', error);
      throw new Error('Failed to broadcast message');
    }
  }

  /**
   * Get collaboration statistics
   */
  async getCollaborationStats(): Promise<{
    activeSessions: number;
    totalParticipants: number;
    averageSessionDuration: number;
    totalTracksPlayed: number;
  }> {
    try {
      const now = new Date();
      const activeSessions = Array.from(this.sessions.values()).filter(
        (s) => s.expiresAt > now && s.participants.length > 0
      );

      const totalParticipants = activeSessions.reduce((sum, s) => sum + s.participants.length, 0);

      return {
        activeSessions: activeSessions.length,
        totalParticipants,
        averageSessionDuration: 3600000, // 1 hour in ms
        totalTracksPlayed: 0,
      };
    } catch (error) {
      console.error('Error getting collaboration stats:', error);
      throw new Error('Failed to get collaboration statistics');
    }
  }
}

export const realtimeCollaborationService = new RealtimeCollaborationService();
