/**
 * Moderation Service
 * Manages content review queue, flagged comments, user reports
 * A Canryn Production
 */

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'appealed';
export type ContentType = 'comment' | 'message' | 'video' | 'playlist';
export type ReportReason = 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'adult_content' | 'other';

export interface FlaggedContent {
  id: string;
  contentType: ContentType;
  contentId: string;
  userId: string;
  userName: string;
  content: string;
  reason: ReportReason;
  reportedBy: string;
  reportCount: number;
  status: ModerationStatus;
  flaggedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedBy: string;
  reason: ReportReason;
  description: string;
  evidence?: string[];
  status: ModerationStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  action?: string;
}

export interface ModerationStats {
  totalFlagged: number;
  pending: number;
  approved: number;
  rejected: number;
  byReason: Record<ReportReason, number>;
  byContentType: Record<ContentType, number>;
  avgReviewTime: number; // in minutes
}

// In-memory storage
const flaggedContent = new Map<string, FlaggedContent>();
const userReports = new Map<string, UserReport>();
const appealQueue: string[] = [];

export const moderationService = {
  /**
   * Flag content for review
   */
  flagContent(
    contentType: ContentType,
    contentId: string,
    userId: string,
    userName: string,
    content: string,
    reason: ReportReason,
    reportedBy: string
  ): FlaggedContent {
    const id = `flag-${Date.now()}-${Math.random()}`;
    
    // Check if already flagged
    const existing = Array.from(flaggedContent.values()).find(
      f => f.contentId === contentId && f.contentType === contentType && f.status === 'pending'
    );

    if (existing) {
      existing.reportCount++;
      existing.flaggedAt = new Date();
      return existing;
    }

    const flagged: FlaggedContent = {
      id,
      contentType,
      contentId,
      userId,
      userName,
      content,
      reason,
      reportedBy,
      reportCount: 1,
      status: 'pending',
      flaggedAt: new Date(),
    };

    flaggedContent.set(id, flagged);
    return flagged;
  },

  /**
   * Get moderation queue (pending items)
   */
  getModerationQueue(): FlaggedContent[] {
    return Array.from(flaggedContent.values())
      .filter(f => f.status === 'pending')
      .sort((a, b) => b.reportCount - a.reportCount || b.flaggedAt.getTime() - a.flaggedAt.getTime());
  },

  /**
   * Review flagged content
   */
  reviewContent(
    flagId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    notes?: string
  ): FlaggedContent | null {
    const flagged = flaggedContent.get(flagId);
    if (!flagged) return null;

    flagged.status = status;
    flagged.reviewedAt = new Date();
    flagged.reviewedBy = reviewedBy;
    flagged.notes = notes;

    return flagged;
  },

  /**
   * Bulk review flagged content
   */
  bulkReview(
    flagIds: string[],
    status: 'approved' | 'rejected',
    reviewedBy: string,
    notes?: string
  ): FlaggedContent[] {
    return flagIds
      .map(id => this.reviewContent(id, status, reviewedBy, notes))
      .filter((f): f is FlaggedContent => f !== null);
  },

  /**
   * Report a user
   */
  reportUser(
    reportedUserId: string,
    reportedUserName: string,
    reportedBy: string,
    reason: ReportReason,
    description: string,
    evidence?: string[]
  ): UserReport {
    const id = `report-${Date.now()}-${Math.random()}`;

    const report: UserReport = {
      id,
      reportedUserId,
      reportedUserName,
      reportedBy,
      reason,
      description,
      evidence,
      status: 'pending',
      createdAt: new Date(),
    };

    userReports.set(id, report);
    return report;
  },

  /**
   * Get all user reports
   */
  getUserReports(status?: ModerationStatus): UserReport[] {
    return Array.from(userReports.values())
      .filter(r => !status || r.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /**
   * Resolve user report
   */
  resolveReport(
    reportId: string,
    action: string,
    resolvedBy: string
  ): UserReport | null {
    const report = userReports.get(reportId);
    if (!report) return null;

    report.status = 'approved';
    report.resolvedAt = new Date();
    report.resolvedBy = resolvedBy;
    report.action = action;

    return report;
  },

  /**
   * Appeal a moderation decision
   */
  appealDecision(flagId: string): boolean {
    const flagged = flaggedContent.get(flagId);
    if (!flagged || flagged.status !== 'rejected') return false;

    flagged.status = 'appealed';
    appealQueue.push(flagId);
    return true;
  },

  /**
   * Get appeal queue
   */
  getAppealQueue(): FlaggedContent[] {
    return appealQueue
      .map(id => flaggedContent.get(id))
      .filter((f): f is FlaggedContent => f !== null);
  },

  /**
   * Get moderation statistics
   */
  getStats(): ModerationStats {
    const allFlagged = Array.from(flaggedContent.values());
    const allReports = Array.from(userReports.values());
    
    const byReason: Record<ReportReason, number> = {
      spam: 0,
      harassment: 0,
      hate_speech: 0,
      misinformation: 0,
      adult_content: 0,
      other: 0,
    };

    const byContentType: Record<ContentType, number> = {
      comment: 0,
      message: 0,
      video: 0,
      playlist: 0,
    };

    allFlagged.forEach(f => {
      byReason[f.reason]++;
      byContentType[f.contentType]++;
    });

    // Calculate average review time
    const reviewedItems = allFlagged.filter(f => f.reviewedAt);
    const avgReviewTime = reviewedItems.length > 0
      ? reviewedItems.reduce((sum, f) => {
          const diff = (f.reviewedAt!.getTime() - f.flaggedAt.getTime()) / (1000 * 60);
          return sum + diff;
        }, 0) / reviewedItems.length
      : 0;

    return {
      totalFlagged: allFlagged.length,
      pending: allFlagged.filter(f => f.status === 'pending').length,
      approved: allFlagged.filter(f => f.status === 'approved').length,
      rejected: allFlagged.filter(f => f.status === 'rejected').length,
      byReason,
      byContentType,
      avgReviewTime: Math.round(avgReviewTime),
    };
  },

  /**
   * Get flagged content by user
   */
  getFlaggedByUser(userId: string): FlaggedContent[] {
    return Array.from(flaggedContent.values())
      .filter(f => f.userId === userId)
      .sort((a, b) => b.flaggedAt.getTime() - a.flaggedAt.getTime());
  },

  /**
   * Clear all moderation data (for testing)
   */
  clearAll(): void {
    flaggedContent.clear();
    userReports.clear();
    appealQueue.length = 0;
  },
};
