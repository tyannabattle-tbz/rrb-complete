import { notificationsService } from './notifications-service';

export type CollaborationRole = 'lead' | 'backup' | 'support' | 'guest';

export interface CollaborationPermissions {
  canEdit: boolean;
  canRecord: boolean;
  canBroadcast: boolean;
  canInviteOthers: boolean;
  canAccessChat: boolean;
  canViewAnalytics: boolean;
}

export interface CollaborationInvitation {
  id: string;
  performanceId: string;
  performanceName: string;
  inviterId: string;
  inviterName: string;
  invitedUserId: string;
  invitedEmail: string;
  role: CollaborationRole;
  permissions: CollaborationPermissions;
  invitationCode: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: number;
  expiresAt: number;
  acceptedAt?: number;
}

export interface CollaborationSession {
  id: string;
  performanceId: string;
  performanceName: string;
  participants: CollaborationParticipant[];
  startedAt: number;
  endedAt?: number;
  recordingUrl?: string;
}

export interface CollaborationParticipant {
  userId: string;
  userName: string;
  role: CollaborationRole;
  joinedAt: number;
  audioLevel: number;
  status: 'active' | 'inactive' | 'muted';
}

const ROLE_PERMISSIONS: Record<CollaborationRole, CollaborationPermissions> = {
  lead: {
    canEdit: true,
    canRecord: true,
    canBroadcast: true,
    canInviteOthers: true,
    canAccessChat: true,
    canViewAnalytics: true,
  },
  backup: {
    canEdit: true,
    canRecord: true,
    canBroadcast: false,
    canInviteOthers: false,
    canAccessChat: true,
    canViewAnalytics: false,
  },
  support: {
    canEdit: false,
    canRecord: true,
    canBroadcast: false,
    canInviteOthers: false,
    canAccessChat: true,
    canViewAnalytics: false,
  },
  guest: {
    canEdit: false,
    canRecord: false,
    canBroadcast: false,
    canInviteOthers: false,
    canAccessChat: true,
    canViewAnalytics: false,
  },
};

class CollaborationService {
  private invitations: Map<string, CollaborationInvitation> = new Map();
  private sessions: Map<string, CollaborationSession> = new Map();

  /**
   * Create collaboration invitation
   */
  async createInvitation(
    performanceId: string,
    performanceName: string,
    inviterId: string,
    inviterName: string,
    invitedUserId: string,
    invitedEmail: string,
    role: CollaborationRole
  ): Promise<CollaborationInvitation> {
    const invitationCode = this.generateInvitationCode();
    const invitation: CollaborationInvitation = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performanceId,
      performanceName,
      inviterId,
      inviterName,
      invitedUserId,
      invitedEmail,
      role,
      permissions: ROLE_PERMISSIONS[role],
      invitationCode,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    this.invitations.set(invitation.id, invitation);

    // Send notification
    await notificationsService.notifyCollaborationInvite(
      invitedUserId,
      inviterName,
      performanceName,
      role
    );

    return invitation;
  }

  /**
   * Accept collaboration invitation
   */
  async acceptInvitation(invitationId: string, userId: string): Promise<CollaborationInvitation> {
    const invitation = this.invitations.get(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedUserId !== userId) {
      throw new Error('Unauthorized');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation already ${invitation.status}`);
    }

    if (invitation.expiresAt < Date.now()) {
      invitation.status = 'expired';
      throw new Error('Invitation expired');
    }

    invitation.status = 'accepted';
    invitation.acceptedAt = Date.now();

    // Notify inviter
    await notificationsService.sendNotification({
      type: 'collaboration_invite',
      userId: invitation.inviterId,
      title: '✅ Collaboration Accepted',
      message: `${invitation.invitedEmail} accepted your collaboration invite for ${invitation.performanceName}`,
      data: { invitationId, performanceId: invitation.performanceId },
      timestamp: Date.now(),
    });

    return invitation;
  }

  /**
   * Decline collaboration invitation
   */
  async declineInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = this.invitations.get(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedUserId !== userId) {
      throw new Error('Unauthorized');
    }

    invitation.status = 'declined';

    // Notify inviter
    await notificationsService.sendNotification({
      type: 'collaboration_invite',
      userId: invitation.inviterId,
      title: '❌ Collaboration Declined',
      message: `${invitation.invitedEmail} declined your collaboration invite for ${invitation.performanceName}`,
      data: { invitationId, performanceId: invitation.performanceId },
      timestamp: Date.now(),
    });
  }

  /**
   * Start collaboration session
   */
  startSession(
    performanceId: string,
    performanceName: string,
    participants: CollaborationParticipant[]
  ): CollaborationSession {
    const session: CollaborationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performanceId,
      performanceName,
      participants,
      startedAt: Date.now(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * End collaboration session
   */
  endSession(sessionId: string, recordingUrl?: string): CollaborationSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.endedAt = Date.now();
    if (recordingUrl) {
      session.recordingUrl = recordingUrl;
    }

    return session;
  }

  /**
   * Update participant status
   */
  updateParticipantStatus(
    sessionId: string,
    userId: string,
    status: 'active' | 'inactive' | 'muted',
    audioLevel?: number
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    participant.status = status;
    if (audioLevel !== undefined) {
      participant.audioLevel = audioLevel;
    }
  }

  /**
   * Get user invitations
   */
  getUserInvitations(userId: string): CollaborationInvitation[] {
    return Array.from(this.invitations.values()).filter(
      inv => inv.invitedUserId === userId && inv.status === 'pending'
    );
  }

  /**
   * Get session participants
   */
  getSessionParticipants(sessionId: string): CollaborationParticipant[] {
    const session = this.sessions.get(sessionId);
    return session?.participants || [];
  }

  /**
   * Generate invitation code
   */
  private generateInvitationCode(): string {
    return `RRB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  /**
   * Get user permissions for performance
   */
  getUserPermissions(userId: string, performanceId: string): CollaborationPermissions | null {
    const invitation = Array.from(this.invitations.values()).find(
      inv => inv.invitedUserId === userId && inv.performanceId === performanceId && inv.status === 'accepted'
    );

    return invitation?.permissions || null;
  }
}

export const collaborationService = new CollaborationService();
