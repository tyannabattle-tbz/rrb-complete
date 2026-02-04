// Database integration will be added later

export interface PolicyDecision {
  id: string;
  timestamp: Date;
  policy: string;
  decision: string;
  trigger: string;
  context: Record<string, any>;
  outcome: 'approved' | 'denied' | 'pending' | 'overridden';
  overriddenBy?: string;
  overrideReason?: string;
  metadata: Record<string, any>;
}

class PolicyDecisionLogger {
  private decisions: PolicyDecision[] = [];
  private maxDecisions = 10000;

  /**
   * Log a policy decision made by QUMUS
   */
  async logDecision(decision: Omit<PolicyDecision, 'id' | 'timestamp'>): Promise<PolicyDecision> {
    const id = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    const loggedDecision: PolicyDecision = {
      id,
      timestamp,
      ...decision,
    };

    this.decisions.push(loggedDecision);

    // Keep only recent decisions in memory
    if (this.decisions.length > this.maxDecisions) {
      this.decisions = this.decisions.slice(-this.maxDecisions);
    }

    // Also persist to database
    try {
      await this.persistDecision(loggedDecision);
    } catch (error) {
      console.error('Failed to persist decision to database:', error);
    }

    return loggedDecision;
  }

  /**
   * Get all logged decisions with optional filtering
   */
  getDecisions(filters?: {
    policy?: string;
    outcome?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): PolicyDecision[] {
    let results = [...this.decisions];

    if (filters?.policy) {
      results = results.filter(d => d.policy === filters.policy);
    }

    if (filters?.outcome) {
      results = results.filter(d => d.outcome === filters.outcome);
    }

    if (filters?.startTime) {
      results = results.filter(d => d.timestamp >= filters.startTime!);
    }

    if (filters?.endTime) {
      results = results.filter(d => d.timestamp <= filters.endTime!);
    }

    // Return most recent first
    results = results.reverse();

    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Get decision statistics
   */
  getStatistics(): {
    totalDecisions: number;
    byPolicy: Record<string, number>;
    byOutcome: Record<string, number>;
    overrideCount: number;
    approvalRate: number;
  } {
    const stats = {
      totalDecisions: this.decisions.length,
      byPolicy: {} as Record<string, number>,
      byOutcome: {} as Record<string, number>,
      overrideCount: 0,
      approvalRate: 0,
    };

    for (const decision of this.decisions) {
      // Count by policy
      stats.byPolicy[decision.policy] = (stats.byPolicy[decision.policy] || 0) + 1;

      // Count by outcome
      stats.byOutcome[decision.outcome] = (stats.byOutcome[decision.outcome] || 0) + 1;

      // Count overrides
      if (decision.outcome === 'overridden') {
        stats.overrideCount++;
      }
    }

    // Calculate approval rate
    const approved = stats.byOutcome['approved'] || 0;
    if (this.decisions.length > 0) {
      stats.approvalRate = (approved / this.decisions.length) * 100;
    }

    return stats;
  }

  /**
   * Override a previous decision
   */
  async overrideDecision(
    decisionId: string,
    overriddenBy: string,
    reason: string
  ): Promise<PolicyDecision | null> {
    const decision = this.decisions.find(d => d.id === decisionId);

    if (!decision) {
      return null;
    }

    decision.outcome = 'overridden';
    decision.overriddenBy = overriddenBy;
    decision.overrideReason = reason;

    // Persist override
    try {
      await this.persistDecision(decision);
    } catch (error) {
      console.error('Failed to persist override to database:', error);
    }

    return decision;
  }

  /**
   * Clear all decisions (for testing)
   */
  clear(): void {
    this.decisions = [];
  }

  /**
   * Persist decision to database
   */
  private async persistDecision(decision: PolicyDecision): Promise<void> {
    // This would integrate with the actual database
    // For now, it's a placeholder for future database integration
    console.log(`[PolicyDecisionLogger] Persisting decision: ${decision.id}`);
  }
}

export const policyDecisionLogger = new PolicyDecisionLogger();
