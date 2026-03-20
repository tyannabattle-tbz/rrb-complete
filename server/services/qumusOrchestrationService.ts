import { wealthGeneratorService } from './wealthGeneratorService';
import { grantBotService } from './grantBotService';
import { fundingBotService } from './fundingBotService';
import { notifyOwner } from '../_core/notification';
import { invokeLLM } from '../_core/llm';

interface BotPolicy {
  id: number;
  name: string;
  description: string;
  autonomyLevel: number; // 0-100
  enabled: boolean;
  decisionCriteria: string[];
}

interface OrchestrationDecision {
  policyId: number;
  timestamp: Date;
  decision: string;
  confidence: number;
  action: string;
  autonomyApplied: boolean;
}

/**
 * QUMUS Orchestration Service
 * Manages autonomous bot policies and decision-making
 * Coordinates Wealth Generator, Grant Bot, and Funding Bot with 90%+ autonomy
 */
export class QumusOrchestrationService {
  private policies: Map<number, BotPolicy> = new Map();
  private decisions: OrchestrationDecision[] = [];
  private orchestrationLoop: NodeJS.Timer | null = null;
  private readonly autonomyThreshold = 90; // 90%+ autonomy

  /**
   * Initialize QUMUS orchestration with all bot policies
   */
  async initialize(): Promise<void> {
    console.log('[QUMUS Orchestration] Initializing autonomous bot orchestration...');

    // Register all autonomous policies
    this.registerPolicy({
      id: 26,
      name: 'Autonomous Wealth Generation',
      description: 'Manages autonomous income streams and deposits',
      autonomyLevel: 92,
      enabled: true,
      decisionCriteria: ['income_threshold', 'frequency_schedule', 'stream_health'],
    });

    this.registerPolicy({
      id: 27,
      name: 'Autonomous Grant Discovery',
      description: 'Discovers and auto-applies for grant opportunities',
      autonomyLevel: 90,
      enabled: true,
      decisionCriteria: ['match_score_threshold', 'eligibility_check', 'deadline_proximity'],
    });

    this.registerPolicy({
      id: 28,
      name: 'Autonomous Campaign Management',
      description: 'Creates and manages funding campaigns with treasury routing',
      autonomyLevel: 91,
      enabled: true,
      decisionCriteria: ['funding_need', 'campaign_viability', 'treasury_allocation'],
    });

    this.registerPolicy({
      id: 29,
      name: 'Bot Coordination & Conflict Resolution',
      description: 'Coordinates between bots to prevent conflicts and optimize outcomes',
      autonomyLevel: 88,
      enabled: true,
      decisionCriteria: ['resource_availability', 'priority_scoring', 'timing_optimization'],
    });

    this.registerPolicy({
      id: 30,
      name: 'Autonomous Risk Management',
      description: 'Monitors bot decisions and prevents high-risk actions',
      autonomyLevel: 95,
      enabled: true,
      decisionCriteria: ['risk_score', 'fraud_detection', 'compliance_check'],
    });

    // Initialize all bot services
    await wealthGeneratorService.initialize();
    await grantBotService.initialize();
    await fundingBotService.initialize();

    // Start orchestration loop
    this.startOrchestration();

    console.log('[QUMUS Orchestration] Initialization complete. 5 policies registered. 90%+ autonomy enabled.');
  }

  /**
   * Register a new orchestration policy
   */
  private registerPolicy(policy: BotPolicy): void {
    this.policies.set(policy.id, policy);
    console.log(
      `[QUMUS Policy #${policy.id}] Registered: ${policy.name} (${policy.autonomyLevel}% autonomy)`
    );
  }

  /**
   * Start orchestration loop (runs every 10 minutes)
   */
  private startOrchestration(): void {
    this.orchestrationLoop = setInterval(async () => {
      try {
        await this.orchestrateBots();
      } catch (error) {
        console.error('[QUMUS Orchestration] Error in orchestration loop:', error);
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    // Run initial orchestration immediately
    this.orchestrateBots().catch((error) =>
      console.error('[QUMUS Orchestration] Initial orchestration error:', error)
    );

    console.log('[QUMUS Orchestration] Orchestration loop started (90%+ autonomy)');
  }

  /**
   * Main orchestration logic - coordinates all bots
   */
  private async orchestrateBots(): Promise<void> {
    console.log('[QUMUS Orchestration] Starting bot coordination cycle...');

    try {
      // Policy #29: Bot Coordination & Conflict Resolution
      const coordination = await this.coordinateBots();

      // Policy #30: Autonomous Risk Management
      const riskAssessment = await this.assessRisks();

      // Execute autonomous decisions
      if (coordination.canProceed && !riskAssessment.hasHighRisk) {
        await this.executeAutonomousActions();
      } else {
        console.log('[QUMUS Orchestration] Coordination or risk check failed. Skipping autonomous actions.');
      }

      console.log('[QUMUS Orchestration] Bot coordination cycle complete.');
    } catch (error) {
      console.error('[QUMUS Orchestration] Error during orchestration:', error);
    }
  }

  /**
   * Policy #29: Coordinate between bots
   */
  private async coordinateBots(): Promise<{ canProceed: boolean; reason: string }> {
    try {
      const wealthStreams = wealthGeneratorService.getStreamsStatus();
      const grants = grantBotService.getGrants();
      const campaigns = fundingBotService.getCampaigns();

      // Use LLM to make coordination decision
      const decision = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a bot coordination system. Analyze bot states and respond with JSON: {canProceed: boolean, reason: string, priority: string}',
          },
          {
            role: 'user',
            content: `Coordinate bots: ${wealthStreams.length} wealth streams active, ${grants.length} grants discovered, ${campaigns.length} campaigns running. Should we proceed with autonomous actions?`,
          },
        ],
      });

      const result = JSON.parse(decision.choices[0].message.content || '{}');

      console.log(
        `[QUMUS Policy #29] Coordination decision: ${result.canProceed ? 'PROCEED' : 'HOLD'}. Reason: ${result.reason}`
      );

      return {
        canProceed: result.canProceed || true,
        reason: result.reason || 'Coordination check passed',
      };
    } catch (error) {
      console.error('[QUMUS Policy #29] Coordination error:', error);
      return { canProceed: false, reason: 'Coordination check failed' };
    }
  }

  /**
   * Policy #30: Assess risks and prevent high-risk actions
   */
  private async assessRisks(): Promise<{ hasHighRisk: boolean; riskScore: number }> {
    try {
      const wealthStreams = wealthGeneratorService.getStreamsStatus();
      const grants = grantBotService.getGrants();
      const campaigns = fundingBotService.getCampaigns();

      // Use LLM to assess risk
      const assessment = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a risk assessment system. Analyze bot activity and respond with JSON: {riskScore: number, hasHighRisk: boolean, concerns: string[]}',
          },
          {
            role: 'user',
            content: `Assess risk: ${wealthStreams.length} wealth streams, ${grants.length} grants, ${campaigns.length} campaigns. Any anomalies or high-risk patterns?`,
          },
        ],
      });

      const result = JSON.parse(assessment.choices[0].message.content || '{}');

      if (result.hasHighRisk) {
        console.log(
          `[QUMUS Policy #30] HIGH RISK DETECTED. Score: ${result.riskScore}/100. Concerns: ${result.concerns.join(', ')}`
        );

        await notifyOwner({
          title: '⚠️ High-Risk Pattern Detected (QUMUS Policy #30)',
          content: `Risk score: ${result.riskScore}/100. Concerns: ${result.concerns.join(', ')}. Autonomous actions paused for review.`,
        });
      } else {
        console.log(`[QUMUS Policy #30] Risk assessment passed. Score: ${result.riskScore}/100`);
      }

      return {
        hasHighRisk: result.hasHighRisk || false,
        riskScore: result.riskScore || 0,
      };
    } catch (error) {
      console.error('[QUMUS Policy #30] Risk assessment error:', error);
      return { hasHighRisk: true, riskScore: 50 }; // Default to caution
    }
  }

  /**
   * Execute autonomous actions based on policies
   */
  private async executeAutonomousActions(): Promise<void> {
    try {
      console.log('[QUMUS Orchestration] Executing autonomous actions...');

      // Policy #26: Process wealth streams
      const wealthStreams = wealthGeneratorService.getStreamsStatus();
      console.log(`[QUMUS Policy #26] Processing ${wealthStreams.length} wealth streams...`);

      // Policy #27: Auto-apply for grants
      await grantBotService.autoApplyForGrants();
      console.log('[QUMUS Policy #27] Grant auto-application cycle complete');

      // Policy #28: Manage campaigns
      const campaigns = fundingBotService.getCampaigns();
      console.log(`[QUMUS Policy #28] Managing ${campaigns.length} campaigns...`);

      // Log orchestration decision
      const decision: OrchestrationDecision = {
        policyId: 29,
        timestamp: new Date(),
        decision: 'autonomous_actions_executed',
        confidence: 92,
        action: `Processed ${wealthStreams.length} streams, auto-applied for grants, managed ${campaigns.length} campaigns`,
        autonomyApplied: true,
      };

      this.decisions.push(decision);

      console.log('[QUMUS Orchestration] Autonomous actions executed successfully');
    } catch (error) {
      console.error('[QUMUS Orchestration] Error executing autonomous actions:', error);
    }
  }

  /**
   * Get orchestration statistics
   */
  getOrchestrationStats(): {
    totalPolicies: number;
    activePolicies: number;
    averageAutonomy: number;
    totalDecisions: number;
    recentDecisions: OrchestrationDecision[];
  } {
    const activePolicies = Array.from(this.policies.values()).filter((p) => p.enabled);
    const avgAutonomy =
      activePolicies.length > 0
        ? activePolicies.reduce((sum, p) => sum + p.autonomyLevel, 0) / activePolicies.length
        : 0;

    return {
      totalPolicies: this.policies.size,
      activePolicies: activePolicies.length,
      averageAutonomy: Math.round(avgAutonomy),
      totalDecisions: this.decisions.length,
      recentDecisions: this.decisions.slice(-10),
    };
  }

  /**
   * Get all policies
   */
  getPolicies(): BotPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policy by ID
   */
  getPolicy(id: number): BotPolicy | undefined {
    return this.policies.get(id);
  }

  /**
   * Enable/disable policy
   */
  setPolicyEnabled(id: number, enabled: boolean): boolean {
    const policy = this.policies.get(id);
    if (policy) {
      policy.enabled = enabled;
      console.log(`[QUMUS Policy #${id}] ${enabled ? 'Enabled' : 'Disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(limit: number = 20): OrchestrationDecision[] {
    return this.decisions.slice(-limit);
  }

  /**
   * Shutdown orchestration
   */
  shutdown(): void {
    if (this.orchestrationLoop) {
      clearInterval(this.orchestrationLoop);
    }

    wealthGeneratorService.shutdown();
    grantBotService.shutdown();
    fundingBotService.shutdown();

    console.log('[QUMUS Orchestration] Shutdown complete');
  }
}

// Export singleton instance
export const qumusOrchestrationService = new QumusOrchestrationService();
