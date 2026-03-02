export interface OverrideRequest {
  id: string;
  decisionId: string;
  policy: string;
  originalDecision: string;
  proposedOverride: string;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface OverridePolicy {
  policy: string;
  requiresApproval: boolean;
  approvalThreshold: number; // Number of approvers needed
  allowedRoles: string[];
}

class HumanOverrideManager {
  private overrideRequests: OverrideRequest[] = [];
  private overridePolicies: OverridePolicy[] = [
    {
      policy: 'Payment Policy',
      requiresApproval: true,
      approvalThreshold: 2,
      allowedRoles: ['admin', 'finance_manager'],
    },
    {
      policy: 'Security Policy',
      requiresApproval: true,
      approvalThreshold: 3,
      allowedRoles: ['admin', 'security_officer'],
    },
    {
      policy: 'Compliance Policy',
      requiresApproval: true,
      approvalThreshold: 2,
      allowedRoles: ['admin', 'compliance_officer'],
    },
    {
      policy: 'Content Policy',
      requiresApproval: true,
      approvalThreshold: 1,
      allowedRoles: ['admin', 'content_moderator'],
    },
  ];

  /**
   * Request an override for an autonomous decision
   */
  async requestOverride(
    decisionId: string,
    policy: string,
    originalDecision: string,
    proposedOverride: string,
    requestedBy: string,
    reason: string
  ): Promise<OverrideRequest> {
    const id = `override-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: OverrideRequest = {
      id,
      decisionId,
      policy,
      originalDecision,
      proposedOverride,
      requestedBy,
      requestedAt: new Date(),
      reason,
      status: 'pending',
    };

    this.overrideRequests.push(request);
    return request;
  }

  /**
   * Approve an override request
   */
  async approveOverride(requestId: string, approvedBy: string): Promise<OverrideRequest | null> {
    const request = this.overrideRequests.find(r => r.id === requestId);

    if (!request) {
      return null;
    }

    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();

    return request;
  }

  /**
   * Reject an override request
   */
  async rejectOverride(requestId: string, rejectedBy: string, reason: string): Promise<OverrideRequest | null> {
    const request = this.overrideRequests.find(r => r.id === requestId);

    if (!request) {
      return null;
    }

    request.status = 'rejected';
    request.rejectionReason = reason;

    return request;
  }

  /**
   * Get pending override requests
   */
  getPendingRequests(): OverrideRequest[] {
    return this.overrideRequests.filter(r => r.status === 'pending');
  }

  /**
   * Get override requests by policy
   */
  getRequestsByPolicy(policy: string): OverrideRequest[] {
    return this.overrideRequests.filter(r => r.policy === policy);
  }

  /**
   * Get all override requests
   */
  getAllRequests(): OverrideRequest[] {
    return [...this.overrideRequests];
  }

  /**
   * Check if a user can override a specific policy
   */
  canUserOverride(userRole: string, policy: string): boolean {
    const policyConfig = this.overridePolicies.find(p => p.policy === policy);

    if (!policyConfig) {
      return false;
    }

    return policyConfig.allowedRoles.includes(userRole);
  }

  /**
   * Get override statistics
   */
  getStatistics(): {
    totalRequests: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    byPolicy: Record<string, number>;
  } {
    const stats = {
      totalRequests: this.overrideRequests.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      approvalRate: 0,
      byPolicy: {} as Record<string, number>,
    };

    for (const request of this.overrideRequests) {
      if (request.status === 'pending') {
        stats.pending++;
      } else if (request.status === 'approved') {
        stats.approved++;
      } else if (request.status === 'rejected') {
        stats.rejected++;
      }

      stats.byPolicy[request.policy] = (stats.byPolicy[request.policy] || 0) + 1;
    }

    if (this.overrideRequests.length > 0) {
      stats.approvalRate = (stats.approved / this.overrideRequests.length) * 100;
    }

    return stats;
  }

  /**
   * Clear all requests (for testing)
   */
  clear(): void {
    this.overrideRequests = [];
  }
}

export const humanOverrideManager = new HumanOverrideManager();
