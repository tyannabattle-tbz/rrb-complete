/**
 * Automated Content Moderation Service
 * AI-powered content filtering and moderation
 */

interface ModerationFlag {
  id: string;
  contentId: string;
  contentType: 'message' | 'comment' | 'username' | 'stream_title' | 'broadcast_description';
  content: string;
  flagReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  flaggedAt: Date;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'appealed';
  moderatorAction?: string;
  userId: string;
}

interface ModerationPolicy {
  id: string;
  name: string;
  description: string;
  rules: ModerationRule[];
  enabled: boolean;
  priority: number;
}

interface ModerationRule {
  id: string;
  type: 'keyword' | 'pattern' | 'ml_model' | 'user_report';
  pattern: string | RegExp;
  action: 'flag' | 'remove' | 'warn' | 'suspend' | 'ban';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface UserReport {
  id: string;
  reportedContentId: string;
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  description: string;
  reportedAt: Date;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
}

interface ModerationStats {
  totalFlags: number;
  flagsToday: number;
  approvedCount: number;
  rejectedCount: number;
  averageReviewTime: number; // minutes
  topViolations: Array<{ reason: string; count: number }>;
  userReports: number;
  activeAppeals: number;
}

class ContentModerationService {
  private flags: Map<string, ModerationFlag> = new Map();
  private policies: Map<string, ModerationPolicy> = new Map();
  private userReports: Map<string, UserReport> = new Map();
  private bannedUsers: Set<string> = new Set();
  private suspendedUsers: Map<string, Date> = new Map();

  constructor() {
    this.initializePolicies();
  }

  /**
   * Initialize default moderation policies
   */
  private initializePolicies(): void {
    this.addPolicy({
      id: 'policy_profanity',
      name: 'Profanity Filter',
      description: 'Filters profane and offensive language',
      enabled: true,
      priority: 1,
      rules: [
        {
          id: 'rule_profanity_1',
          type: 'keyword',
          pattern: 'badword1|badword2|badword3',
          action: 'flag',
          severity: 'medium',
          description: 'Common profanity',
        },
      ],
    });

    this.addPolicy({
      id: 'policy_spam',
      name: 'Spam Detection',
      description: 'Detects and removes spam content',
      enabled: true,
      priority: 2,
      rules: [
        {
          id: 'rule_spam_1',
          type: 'pattern',
          pattern: /(http|https):\/\/[^\s]+/g,
          action: 'flag',
          severity: 'low',
          description: 'Suspicious links',
        },
      ],
    });

    this.addPolicy({
      id: 'policy_harassment',
      name: 'Harassment Prevention',
      description: 'Prevents harassment and hate speech',
      enabled: true,
      priority: 3,
      rules: [
        {
          id: 'rule_harassment_1',
          type: 'ml_model',
          pattern: 'harassment_detector',
          action: 'flag',
          severity: 'high',
          description: 'Harassing language detected',
        },
      ],
    });

    this.addPolicy({
      id: 'policy_adult_content',
      name: 'Adult Content Filter',
      description: 'Filters adult and NSFW content',
      enabled: true,
      priority: 4,
      rules: [
        {
          id: 'rule_adult_1',
          type: 'ml_model',
          pattern: 'nsfw_detector',
          action: 'remove',
          severity: 'high',
          description: 'Adult content detected',
        },
      ],
    });
  }

  /**
   * Moderate content
   */
  async moderateContent(
    contentId: string,
    contentType: ModerationFlag['contentType'],
    content: string,
    userId: string
  ): Promise<ModerationFlag | null> {
    const policies = Array.from(this.policies.values())
      .filter((p) => p.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const policy of policies) {
      for (const rule of policy.rules) {
        const result = this.checkRule(content, rule);
        if (result) {
          const flag: ModerationFlag = {
            id: `flag_${Date.now()}_${Math.random()}`,
            contentId,
            contentType,
            content,
            flagReason: rule.description,
            severity: rule.severity,
            confidence: result.confidence,
            flaggedAt: new Date(),
            status: 'pending',
            userId,
          };

          this.flags.set(flag.id, flag);

          // Execute action
          await this.executeAction(flag, rule.action);

          return flag;
        }
      }
    }

    return null;
  }

  /**
   * Check content against a rule
   */
  private checkRule(
    content: string,
    rule: ModerationRule
  ): { confidence: number } | null {
    switch (rule.type) {
      case 'keyword':
        if (typeof rule.pattern === 'string') {
          const regex = new RegExp(rule.pattern, 'i');
          if (regex.test(content)) {
            return { confidence: 95 };
          }
        }
        break;

      case 'pattern':
        if (rule.pattern instanceof RegExp) {
          if (rule.pattern.test(content)) {
            return { confidence: 85 };
          }
        }
        break;

      case 'ml_model':
        // Simulate ML model detection
        const mlConfidence = this.simulateMLDetection(content, rule.pattern as string);
        if (mlConfidence > 0.7) {
          return { confidence: mlConfidence * 100 };
        }
        break;

      case 'user_report':
        // User reports are handled separately
        break;
    }

    return null;
  }

  /**
   * Simulate ML model detection
   */
  private simulateMLDetection(content: string, modelType: string): number {
    // Placeholder for actual ML model integration
    const contentLength = content.length;
    const capsRatio = (content.match(/[A-Z]/g) || []).length / contentLength;

    switch (modelType) {
      case 'harassment_detector':
        // Check for aggressive language patterns
        if (capsRatio > 0.5 && content.length > 20) {
          return 0.8;
        }
        break;

      case 'nsfw_detector':
        // Check for NSFW content
        if (content.toLowerCase().includes('adult') || content.toLowerCase().includes('explicit')) {
          return 0.85;
        }
        break;
    }

    return Math.random() * 0.3; // Low confidence by default
  }

  /**
   * Execute moderation action
   */
  private async executeAction(flag: ModerationFlag, action: string): Promise<void> {
    switch (action) {
      case 'flag':
        flag.status = 'pending';
        break;

      case 'remove':
        flag.status = 'approved';
        // Content would be removed
        break;

      case 'warn':
        flag.status = 'approved';
        // User would receive warning
        break;

      case 'suspend':
        flag.status = 'approved';
        this.suspendUser(flag.userId, 24); // 24 hour suspension
        break;

      case 'ban':
        flag.status = 'approved';
        this.bannedUsers.add(flag.userId);
        break;
    }
  }

  /**
   * Report content
   */
  reportContent(
    contentId: string,
    reportedUserId: string,
    reporterUserId: string,
    reason: string,
    description: string
  ): UserReport {
    const report: UserReport = {
      id: `report_${Date.now()}_${Math.random()}`,
      reportedContentId: contentId,
      reportedUserId,
      reporterUserId,
      reason,
      description,
      reportedAt: new Date(),
      status: 'pending',
    };

    this.userReports.set(report.id, report);
    return report;
  }

  /**
   * Review flagged content
   */
  reviewFlag(flagId: string, approved: boolean, moderatorAction?: string): void {
    const flag = this.flags.get(flagId);
    if (flag) {
      flag.status = approved ? 'approved' : 'rejected';
      flag.moderatorAction = moderatorAction;
    }
  }

  /**
   * Appeal moderation decision
   */
  appealFlag(flagId: string, reason: string): void {
    const flag = this.flags.get(flagId);
    if (flag) {
      flag.status = 'appealed';
      flag.moderatorAction = reason;
    }
  }

  /**
   * Suspend user
   */
  private suspendUser(userId: string, hours: number): void {
    const suspensionEnd = new Date(Date.now() + hours * 60 * 60 * 1000);
    this.suspendedUsers.set(userId, suspensionEnd);
  }

  /**
   * Ban user
   */
  banUser(userId: string): void {
    this.bannedUsers.add(userId);
  }

  /**
   * Unban user
   */
  unbanUser(userId: string): void {
    this.bannedUsers.delete(userId);
  }

  /**
   * Check if user is banned
   */
  isUserBanned(userId: string): boolean {
    return this.bannedUsers.has(userId);
  }

  /**
   * Check if user is suspended
   */
  isUserSuspended(userId: string): boolean {
    const suspensionEnd = this.suspendedUsers.get(userId);
    if (!suspensionEnd) return false;

    if (new Date() > suspensionEnd) {
      this.suspendedUsers.delete(userId);
      return false;
    }

    return true;
  }

  /**
   * Get moderation stats
   */
  getModerationStats(): ModerationStats {
    const flags = Array.from(this.flags.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const flagsToday = flags.filter((f) => {
      const flagDate = new Date(f.flaggedAt);
      flagDate.setHours(0, 0, 0, 0);
      return flagDate.getTime() === today.getTime();
    });

    const approvedCount = flags.filter((f) => f.status === 'approved').length;
    const rejectedCount = flags.filter((f) => f.status === 'rejected').length;

    const violationCounts: Record<string, number> = {};
    flags.forEach((f) => {
      violationCounts[f.flagReason] = (violationCounts[f.flagReason] || 0) + 1;
    });

    const topViolations = Object.entries(violationCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalFlags: flags.length,
      flagsToday: flagsToday.length,
      approvedCount,
      rejectedCount,
      averageReviewTime: 15, // Placeholder
      topViolations,
      userReports: this.userReports.size,
      activeAppeals: flags.filter((f) => f.status === 'appealed').length,
    };
  }

  /**
   * Get pending flags
   */
  getPendingFlags(): ModerationFlag[] {
    return Array.from(this.flags.values()).filter((f) => f.status === 'pending');
  }

  /**
   * Get user reports
   */
  getUserReports(status?: string): UserReport[] {
    return Array.from(this.userReports.values()).filter(
      (r) => !status || r.status === status
    );
  }

  /**
   * Add policy
   */
  addPolicy(policy: ModerationPolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Update policy
   */
  updatePolicy(policyId: string, updates: Partial<ModerationPolicy>): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      this.policies.set(policyId, { ...policy, ...updates });
    }
  }

  /**
   * Get all policies
   */
  getPolicies(): ModerationPolicy[] {
    return Array.from(this.policies.values());
  }
}

export const contentModerationService = new ContentModerationService();
