/**
 * Caller Authentication Service
 * Handles SMS OTP verification and reputation scoring
 */

export interface CallerReputation {
  callerId: string;
  phoneNumber: string;
  totalCalls: number;
  completedCalls: number;
  blockedCalls: number;
  reportedCount: number;
  reputationScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  isBlocked: boolean;
  blockedReason?: string;
  lastVerified?: Date;
}

export interface OTPSession {
  sessionId: string;
  phoneNumber: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

class CallerAuthService {
  private callerReputations: Map<string, CallerReputation> = new Map();
  private otpSessions: Map<string, OTPSession> = new Map();
  private blocklist: Set<string> = new Set();

  /**
   * Request OTP for phone number
   */
  async requestOTP(phoneNumber: string): Promise<{ sessionId: string; expiresIn: number }> {
    // Check if number is blocked
    if (this.blocklist.has(phoneNumber)) {
      throw new Error('This phone number is blocked from calling');
    }

    // Generate OTP
    const otp = Math.random().toString().slice(2, 8);
    const sessionId = `otp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: OTPSession = {
      sessionId,
      phoneNumber,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
      verified: false,
    };

    this.otpSessions.set(sessionId, session);

    // In production, send OTP via SMS
    console.log(`[Auth] OTP for ${phoneNumber}: ${otp}`);

    return {
      sessionId,
      expiresIn: 10 * 60, // 10 minutes in seconds
    };
  }

  /**
   * Verify OTP
   */
  verifyOTP(sessionId: string, otp: string): boolean {
    const session = this.otpSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session ID');
    }

    if (new Date() > session.expiresAt) {
      this.otpSessions.delete(sessionId);
      throw new Error('OTP has expired');
    }

    session.attempts++;

    if (session.attempts > 3) {
      this.otpSessions.delete(sessionId);
      throw new Error('Too many failed attempts');
    }

    if (session.otp !== otp) {
      return false;
    }

    session.verified = true;
    return true;
  }

  /**
   * Get or create caller reputation
   */
  getCallerReputation(callerId: string, phoneNumber: string): CallerReputation {
    if (this.callerReputations.has(callerId)) {
      return this.callerReputations.get(callerId)!;
    }

    const reputation: CallerReputation = {
      callerId,
      phoneNumber,
      totalCalls: 0,
      completedCalls: 0,
      blockedCalls: 0,
      reportedCount: 0,
      reputationScore: 100, // Start with perfect score
      riskLevel: 'low',
      isBlocked: false,
    };

    this.callerReputations.set(callerId, reputation);
    return reputation;
  }

  /**
   * Update reputation after call
   */
  updateReputation(
    callerId: string,
    callCompleted: boolean,
    wasReported: boolean = false,
    reportReason?: string
  ): CallerReputation {
    const reputation = this.callerReputations.get(callerId);
    if (!reputation) {
      throw new Error('Caller not found');
    }

    reputation.totalCalls++;

    if (callCompleted) {
      reputation.completedCalls++;
    } else {
      reputation.blockedCalls++;
    }

    if (wasReported) {
      reputation.reportedCount++;
    }

    // Calculate reputation score
    reputation.reputationScore = this.calculateReputationScore(reputation);

    // Determine risk level
    reputation.riskLevel = this.determineRiskLevel(reputation);

    // Auto-block if necessary
    if (reputation.reportedCount >= 3 || reputation.reputationScore < 30) {
      reputation.isBlocked = true;
      reputation.blockedReason = reportReason || 'Low reputation score';
      this.blocklist.add(reputation.phoneNumber);
    }

    return reputation;
  }

  /**
   * Calculate reputation score
   */
  private calculateReputationScore(reputation: CallerReputation): number {
    let score = 100;

    // Deduct for blocked calls
    score -= reputation.blockedCalls * 5;

    // Deduct for reports
    score -= reputation.reportedCount * 10;

    // Bonus for completed calls
    if (reputation.totalCalls > 0) {
      const completionRate = reputation.completedCalls / reputation.totalCalls;
      score += completionRate * 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(reputation: CallerReputation): 'low' | 'medium' | 'high' {
    if (reputation.reputationScore >= 80) return 'low';
    if (reputation.reputationScore >= 50) return 'medium';
    return 'high';
  }

  /**
   * Block caller
   */
  blockCaller(phoneNumber: string, reason: string): void {
    this.blocklist.add(phoneNumber);

    // Update reputation
    for (const reputation of this.callerReputations.values()) {
      if (reputation.phoneNumber === phoneNumber) {
        reputation.isBlocked = true;
        reputation.blockedReason = reason;
      }
    }

    console.log(`[Auth] Blocked caller: ${phoneNumber} - ${reason}`);
  }

  /**
   * Unblock caller
   */
  unblockCaller(phoneNumber: string): void {
    this.blocklist.delete(phoneNumber);

    // Update reputation
    for (const reputation of this.callerReputations.values()) {
      if (reputation.phoneNumber === phoneNumber) {
        reputation.isBlocked = false;
        reputation.blockedReason = undefined;
      }
    }

    console.log(`[Auth] Unblocked caller: ${phoneNumber}`);
  }

  /**
   * Check if caller is blocked
   */
  isCallerBlocked(phoneNumber: string): boolean {
    return this.blocklist.has(phoneNumber);
  }

  /**
   * Get blocklist
   */
  getBlocklist(): string[] {
    return Array.from(this.blocklist);
  }

  /**
   * Report caller
   */
  reportCaller(callerId: string, reason: string): void {
    const reputation = this.callerReputations.get(callerId);
    if (!reputation) return;

    reputation.reportedCount++;
    reputation.reputationScore = this.calculateReputationScore(reputation);
    reputation.riskLevel = this.determineRiskLevel(reputation);

    console.log(`[Auth] Caller reported: ${callerId} - ${reason}`);

    // Auto-block if too many reports
    if (reputation.reportedCount >= 3) {
      this.blockCaller(reputation.phoneNumber, `Too many reports: ${reason}`);
    }
  }

  /**
   * Get reputation statistics
   */
  getReputationStats(): {
    totalCallers: number;
    blockedCallers: number;
    averageReputationScore: number;
    highRiskCallers: number;
  } {
    const reputations = Array.from(this.callerReputations.values());

    return {
      totalCallers: reputations.length,
      blockedCallers: reputations.filter(r => r.isBlocked).length,
      averageReputationScore: reputations.length > 0
        ? Math.round(reputations.reduce((sum, r) => sum + r.reputationScore, 0) / reputations.length)
        : 0,
      highRiskCallers: reputations.filter(r => r.riskLevel === 'high').length,
    };
  }
}

export const callerAuthService = new CallerAuthService();
