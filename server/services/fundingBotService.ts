import { db } from '../db';
import { flowpayTransactions, flowpayAuditLog } from '../../drizzle/schema';
import { invokeLLM } from '../_core/llm';
import { notifyOwner } from '../_core/notification';

interface FundingCampaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: Date;
  source: 'twitter' | 'email' | 'website' | 'social' | 'api';
  status: 'active' | 'paused' | 'completed' | 'failed';
  treasuryAllocation: number; // Percentage to route to treasury
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignContribution {
  campaignId: string;
  amount: number;
  contributor: string;
  timestamp: Date;
  treasuryAmount: number;
  userAmount: number;
}

/**
 * QUMUS Policy #28: Autonomous Funding Campaign Management
 * Auto-creates campaigns, routes funds to treasury, and manages fundraising
 * 90%+ autonomy - minimal human intervention
 */
export class FundingBotService {
  private campaigns: Map<string, FundingCampaign> = new Map();
  private campaignLoop: NodeJS.Timer | null = null;
  private defaultTreasuryAllocation = 0.2; // 20% to treasury by default

  /**
   * Initialize funding bot with campaign management loop
   */
  async initialize(): Promise<void> {
    console.log('[FundingBot] Initializing autonomous funding campaign management...');

    // Start autonomous campaign management loop
    this.startCampaignManagement();

    console.log('[FundingBot] Initialization complete. Campaign management loop started.');
  }

  /**
   * Start autonomous campaign management loop (QUMUS Policy #28)
   * Manages campaigns every 30 minutes with 90%+ autonomy
   */
  private startCampaignManagement(): void {
    this.campaignLoop = setInterval(async () => {
      try {
        await this.manageCampaigns();
      } catch (error) {
        console.error('[FundingBot] Error in campaign management loop:', error);
      }
    }, 30 * 60 * 1000); // Manage every 30 minutes

    // Run initial management immediately
    this.manageCampaigns().catch((error) =>
      console.error('[FundingBot] Initial management error:', error)
    );

    console.log('[FundingBot] Autonomous campaign management loop started (90%+ autonomy)');
  }

  /**
   * Create new funding campaign (QUMUS Policy #28)
   */
  async createCampaign(
    title: string,
    description: string,
    goal: number,
    deadline: Date,
    source: FundingCampaign['source'],
    treasuryAllocation?: number
  ): Promise<FundingCampaign> {
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const campaign: FundingCampaign = {
      id: campaignId,
      title,
      description,
      goal,
      raised: 0,
      deadline,
      source,
      status: 'active',
      treasuryAllocation: treasuryAllocation || this.defaultTreasuryAllocation,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.campaigns.set(campaignId, campaign);

    // Log campaign creation
    await db.insert(flowpayAuditLog).values({
      event_type: 'funding_campaign_created',
      event_id: campaignId,
      details: JSON.stringify({
        title,
        goal,
        deadline,
        source,
        treasuryAllocation: campaign.treasuryAllocation,
      }),
      timestamp: new Date(),
    });

    console.log(
      `[FundingBot] Created campaign: ${title} (Goal: $${goal}) - Treasury: ${(campaign.treasuryAllocation * 100).toFixed(0)}%`
    );

    await notifyOwner({
      title: '🎯 Funding Campaign Created (QUMUS Policy #28)',
      content: `Campaign: ${title}. Goal: $${goal}. Deadline: ${deadline.toLocaleDateString()}. Treasury allocation: ${(campaign.treasuryAllocation * 100).toFixed(0)}%`,
    });

    return campaign;
  }

  /**
   * Record contribution to campaign and auto-route to treasury
   */
  async recordContribution(
    campaignId: string,
    amount: number,
    contributor: string
  ): Promise<CampaignContribution | null> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      console.error(`[FundingBot] Campaign not found: ${campaignId}`);
      return null;
    }

    // Calculate treasury allocation
    const treasuryAmount = amount * campaign.treasuryAllocation;
    const userAmount = amount - treasuryAmount;

    const contribution: CampaignContribution = {
      campaignId,
      amount,
      contributor,
      timestamp: new Date(),
      treasuryAmount,
      userAmount,
    };

    // Update campaign raised amount
    campaign.raised += amount;
    campaign.updatedAt = new Date();

    // Record transaction to FlowPay
    await db.insert(flowpayTransactions).values({
      stripe_payment_intent_id: `campaign_${campaignId}_${Date.now()}`,
      user_id: 1, // System account
      amount: treasuryAmount,
      currency: 'USD',
      status: 'completed',
      transaction_type: 'campaign_contribution',
      description: `Campaign contribution routed to treasury: ${campaign.title}`,
      metadata: JSON.stringify({
        campaignId,
        contributor,
        totalAmount: amount,
        treasuryAmount,
        userAmount,
      }),
      processed_at: new Date(),
    });

    // Log contribution
    await db.insert(flowpayAuditLog).values({
      event_type: 'campaign_contribution',
      event_id: campaignId,
      details: JSON.stringify({
        contributor,
        amount,
        treasuryAmount,
        userAmount,
      }),
      timestamp: new Date(),
    });

    console.log(
      `[FundingBot] Contribution recorded: $${amount} to ${campaign.title}. Treasury: $${treasuryAmount.toFixed(2)}`
    );

    // Check if campaign goal reached
    if (campaign.raised >= campaign.goal) {
      await this.completeCampaign(campaignId);
    }

    return contribution;
  }

  /**
   * Manage active campaigns (QUMUS Policy #28)
   */
  private async manageCampaigns(): Promise<void> {
    const activeCampaigns = Array.from(this.campaigns.values()).filter(
      (c) => c.status === 'active'
    );

    for (const campaign of activeCampaigns) {
      const now = new Date();

      // Check if deadline passed
      if (now > campaign.deadline) {
        if (campaign.raised >= campaign.goal) {
          await this.completeCampaign(campaign.id);
        } else {
          await this.failCampaign(campaign.id);
        }
      }
    }
  }

  /**
   * Complete campaign when goal reached
   */
  private async completeCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    campaign.status = 'completed';

    await db.insert(flowpayAuditLog).values({
      event_type: 'campaign_completed',
      event_id: campaignId,
      details: JSON.stringify({
        title: campaign.title,
        goal: campaign.goal,
        raised: campaign.raised,
        treasuryAmount: campaign.raised * campaign.treasuryAllocation,
      }),
      timestamp: new Date(),
    });

    console.log(
      `[FundingBot] Campaign completed: ${campaign.title}. Raised: $${campaign.raised} (Goal: $${campaign.goal})`
    );

    await notifyOwner({
      title: '✅ Funding Campaign Completed (QUMUS Policy #28)',
      content: `${campaign.title} reached goal! Raised: $${campaign.raised}. Treasury allocation: $${(campaign.raised * campaign.treasuryAllocation).toFixed(2)}`,
    });
  }

  /**
   * Fail campaign when deadline passes without reaching goal
   */
  private async failCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    campaign.status = 'failed';

    await db.insert(flowpayAuditLog).values({
      event_type: 'campaign_failed',
      event_id: campaignId,
      details: JSON.stringify({
        title: campaign.title,
        goal: campaign.goal,
        raised: campaign.raised,
        shortfall: campaign.goal - campaign.raised,
      }),
      timestamp: new Date(),
    });

    console.log(
      `[FundingBot] Campaign failed: ${campaign.title}. Raised: $${campaign.raised} (Goal: $${campaign.goal})`
    );

    await notifyOwner({
      title: '❌ Funding Campaign Failed (QUMUS Policy #28)',
      content: `${campaign.title} did not reach goal. Raised: $${campaign.raised}. Shortfall: $${(campaign.goal - campaign.raised).toFixed(2)}`,
    });
  }

  /**
   * Get all campaigns
   */
  getCampaigns(filter?: { status?: string }): FundingCampaign[] {
    let campaigns = Array.from(this.campaigns.values());

    if (filter?.status) {
      campaigns = campaigns.filter((c) => c.status === filter.status);
    }

    return campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get campaign statistics
   */
  getCampaignStats(): {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    failedCampaigns: number;
    totalRaised: number;
    totalTreasuryAmount: number;
    successRate: number;
  } {
    const campaigns = Array.from(this.campaigns.values());
    const completed = campaigns.filter((c) => c.status === 'completed');
    const failed = campaigns.filter((c) => c.status === 'failed');

    const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
    const totalTreasuryAmount = campaigns.reduce(
      (sum, c) => sum + c.raised * c.treasuryAllocation,
      0
    );

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      completedCampaigns: completed.length,
      failedCampaigns: failed.length,
      totalRaised,
      totalTreasuryAmount,
      successRate:
        campaigns.length > 0
          ? ((completed.length / (completed.length + failed.length)) * 100) || 0
          : 0,
    };
  }

  /**
   * Get campaign by ID
   */
  getCampaign(campaignId: string): FundingCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Pause campaign
   */
  pauseCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (campaign && campaign.status === 'active') {
      campaign.status = 'paused';
      console.log(`[FundingBot] Paused campaign: ${campaign.title}`);
      return true;
    }
    return false;
  }

  /**
   * Resume campaign
   */
  resumeCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (campaign && campaign.status === 'paused') {
      campaign.status = 'active';
      console.log(`[FundingBot] Resumed campaign: ${campaign.title}`);
      return true;
    }
    return false;
  }

  /**
   * Shutdown funding bot
   */
  shutdown(): void {
    if (this.campaignLoop) {
      clearInterval(this.campaignLoop);
      console.log('[FundingBot] Shutdown complete');
    }
  }
}

// Export singleton instance
export const fundingBotService = new FundingBotService();
