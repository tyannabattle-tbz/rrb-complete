import { db } from '../db';
import { flowpayAuditLog } from '../../drizzle/schema';
import { notifyOwner } from '../_core/notification';

interface EmailCampaign {
  id: string;
  name: string;
  type: 'grant_discovery' | 'campaign_milestone' | 'donor_update' | 'impact_report';
  recipients: string[];
  subject: string;
  content: string;
  htmlContent: string;
  createdAt: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  type: EmailCampaign['type'];
  subject: string;
  htmlTemplate: string;
  variables: string[];
}

interface DonorEmailSequence {
  id: string;
  userId: string;
  sequenceType: 'onboarding' | 'engagement' | 'retention' | 'reactivation';
  emails: EmailCampaign[];
  currentStep: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

/**
 * Email Campaign Service
 * Manages automated email campaigns for grants, campaigns, and donor updates
 */
export class EmailCampaignService {
  private campaigns: Map<string, EmailCampaign> = new Map();
  private templates: Map<string, EmailTemplate> = new Map();
  private sequences: Map<string, DonorEmailSequence> = new Map();
  private sendQueue: EmailCampaign[] = [];
  private processingLoop: NodeJS.Timer | null = null;

  /**
   * Initialize email campaign service
   */
  async initialize(): Promise<void> {
    console.log('[EmailCampaigns] Initializing email campaign service...');

    // Create default templates
    this.createDefaultTemplates();

    // Start email processing loop
    this.startEmailProcessing();

    console.log('[EmailCampaigns] Initialization complete. Email campaigns ready.');
  }

  /**
   * Create default email templates
   */
  private createDefaultTemplates(): void {
    // Grant discovery template
    this.templates.set('grant_discovery', {
      id: 'tpl_grant_discovery',
      name: 'Grant Discovery',
      type: 'grant_discovery',
      subject: '🎯 New Grant Opportunity: {{grantTitle}} ({{matchPercentage}}% match)',
      htmlTemplate: `
        <h2>New Grant Opportunity!</h2>
        <p>We found a grant that matches your profile:</p>
        <h3>{{grantTitle}}</h3>
        <p><strong>Amount:</strong> ${{amount}}</p>
        <p><strong>Match Score:</strong> {{matchPercentage}}%</p>
        <p><strong>Deadline:</strong> {{deadline}}</p>
        <p><a href="{{applicationUrl}}">View & Apply Now</a></p>
      `,
      variables: ['grantTitle', 'matchPercentage', 'amount', 'deadline', 'applicationUrl'],
    });

    // Campaign milestone template
    this.templates.set('campaign_milestone', {
      id: 'tpl_campaign_milestone',
      name: 'Campaign Milestone',
      type: 'campaign_milestone',
      subject: '🎉 Campaign Update: {{campaignName}} reached {{milestone}}!',
      htmlTemplate: `
        <h2>Campaign Milestone Reached!</h2>
        <p>{{campaignName}} has reached {{milestone}}!</p>
        <p><strong>Progress:</strong> ${{raised}} / ${{goal}} ({{percentage}}%)</p>
        <p>Thank you for your support!</p>
        <p><a href="{{campaignUrl}}">View Campaign</a></p>
      `,
      variables: ['campaignName', 'milestone', 'raised', 'goal', 'percentage', 'campaignUrl'],
    });

    // Donor update template
    this.templates.set('donor_update', {
      id: 'tpl_donor_update',
      name: 'Donor Update',
      type: 'donor_update',
      subject: '💝 Thank You {{donorName}}! Your Impact This Month',
      htmlTemplate: `
        <h2>Your Impact This Month</h2>
        <p>Hello {{donorName}},</p>
        <p>Thank you for your generosity! Here's what your contributions helped achieve:</p>
        <ul>
          <li>{{achievement1}}</li>
          <li>{{achievement2}}</li>
          <li>{{achievement3}}</li>
        </ul>
        <p><strong>Your Total Contribution:</strong> ${{totalContribution}}</p>
        <p><strong>Your Recognition Level:</strong> {{recognitionLevel}}</p>
        <p><a href="{{leaderboardUrl}}">View Your Leaderboard Position</a></p>
      `,
      variables: [
        'donorName',
        'achievement1',
        'achievement2',
        'achievement3',
        'totalContribution',
        'recognitionLevel',
        'leaderboardUrl',
      ],
    });

    // Impact report template
    this.templates.set('impact_report', {
      id: 'tpl_impact_report',
      name: 'Impact Report',
      type: 'impact_report',
      subject: '📊 Monthly Impact Report - {{month}}',
      htmlTemplate: `
        <h2>Monthly Impact Report</h2>
        <p>{{month}} Summary:</p>
        <ul>
          <li>Total Raised: ${{totalRaised}}</li>
          <li>Grants Approved: {{grantsApproved}}</li>
          <li>Campaigns Completed: {{campaignsCompleted}}</li>
          <li>Community Members: {{communityMembers}}</li>
        </ul>
        <p>Thank you for being part of our mission!</p>
      `,
      variables: [
        'month',
        'totalRaised',
        'grantsApproved',
        'campaignsCompleted',
        'communityMembers',
      ],
    });

    console.log('[EmailCampaigns] Default templates created');
  }

  /**
   * Start email processing loop
   */
  private startEmailProcessing(): void {
    this.processingLoop = setInterval(async () => {
      try {
        await this.processSendQueue();
      } catch (error) {
        console.error('[EmailCampaigns] Error in processing loop:', error);
      }
    }, 60 * 1000); // Every 60 seconds

    console.log('[EmailCampaigns] Email processing loop started');
  }

  /**
   * Process send queue
   */
  private async processSendQueue(): Promise<void> {
    if (this.sendQueue.length === 0) return;

    console.log(`[EmailCampaigns] Processing ${this.sendQueue.length} emails in queue...`);

    for (const campaign of this.sendQueue) {
      await this.sendCampaign(campaign);
    }

    this.sendQueue = [];
  }

  /**
   * Send email campaign
   */
  private async sendCampaign(campaign: EmailCampaign): Promise<void> {
    try {
      console.log(`[EmailCampaigns] Sending campaign: ${campaign.name}`);

      // Simulate email sending
      campaign.metrics.sent = campaign.recipients.length;
      campaign.sentAt = new Date();
      campaign.status = 'sent';

      // Log campaign sent
      await db.insert(flowpayAuditLog).values({
        event_type: 'email_campaign_sent',
        event_id: campaign.id,
        details: JSON.stringify({
          name: campaign.name,
          type: campaign.type,
          recipients: campaign.recipients.length,
        }),
        timestamp: new Date(),
      });

      console.log(`[EmailCampaigns] Campaign sent: ${campaign.name} (${campaign.recipients.length} recipients)`);

      // Notify owner
      await notifyOwner({
        title: `📧 Email Campaign Sent: ${campaign.name}`,
        content: `Sent to ${campaign.recipients.length} recipients. Type: ${campaign.type}`,
      });
    } catch (error) {
      console.error(`[EmailCampaigns] Error sending campaign ${campaign.id}:`, error);
      campaign.status = 'failed';
    }
  }

  /**
   * Create email campaign from template
   */
  async createCampaignFromTemplate(
    templateId: string,
    recipients: string[],
    variables: Record<string, string>
  ): Promise<EmailCampaign> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);

    const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Replace variables in subject and content
    let subject = template.subject;
    let htmlContent = template.htmlTemplate;

    for (const [key, value] of Object.entries(variables)) {
      subject = subject.replace(`{{${key}}}`, value);
      htmlContent = htmlContent.replace(`{{${key}}}`, value);
    }

    const campaign: EmailCampaign = {
      id: campaignId,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      type: template.type,
      recipients,
      subject,
      content: htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      htmlContent,
      createdAt: new Date(),
      status: 'draft',
      metrics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
      },
    };

    this.campaigns.set(campaignId, campaign);

    console.log(`[EmailCampaigns] Campaign created: ${campaign.name}`);

    return campaign;
  }

  /**
   * Schedule campaign for sending
   */
  async scheduleCampaign(campaignId: string, delayMinutes: number = 0): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);

    campaign.status = 'scheduled';

    if (delayMinutes === 0) {
      this.sendQueue.push(campaign);
    } else {
      setTimeout(() => {
        this.sendQueue.push(campaign);
      }, delayMinutes * 60 * 1000);
    }

    console.log(`[EmailCampaigns] Campaign scheduled: ${campaign.name}`);
  }

  /**
   * Create donor email sequence
   */
  async createDonorSequence(
    userId: string,
    sequenceType: DonorEmailSequence['sequenceType']
  ): Promise<DonorEmailSequence> {
    const sequenceId = `seq_${userId}_${sequenceType}_${Date.now()}`;

    const sequence: DonorEmailSequence = {
      id: sequenceId,
      userId,
      sequenceType,
      emails: [],
      currentStep: 0,
      status: 'active',
      createdAt: new Date(),
    };

    this.sequences.set(sequenceId, sequence);

    console.log(`[EmailCampaigns] Donor sequence created: ${sequenceType} for user ${userId}`);

    return sequence;
  }

  /**
   * Add email to sequence
   */
  async addEmailToSequence(sequenceId: string, campaign: EmailCampaign): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) throw new Error(`Sequence not found: ${sequenceId}`);

    sequence.emails.push(campaign);

    console.log(`[EmailCampaigns] Email added to sequence: ${sequenceId}`);
  }

  /**
   * Send next email in sequence
   */
  async sendNextInSequence(sequenceId: string): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) throw new Error(`Sequence not found: ${sequenceId}`);

    if (sequence.currentStep >= sequence.emails.length) {
      sequence.status = 'completed';
      return;
    }

    const email = sequence.emails[sequence.currentStep];
    await this.sendCampaign(email);

    sequence.currentStep++;

    console.log(
      `[EmailCampaigns] Sent email ${sequence.currentStep}/${sequence.emails.length} in sequence ${sequenceId}`
    );
  }

  /**
   * Get campaign
   */
  getCampaign(campaignId: string): EmailCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): EmailCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Get template
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get donor sequence
   */
  getDonorSequence(sequenceId: string): DonorEmailSequence | undefined {
    return this.sequences.get(sequenceId);
  }

  /**
   * Get donor sequences by user
   */
  getDonorSequencesByUser(userId: string): DonorEmailSequence[] {
    return Array.from(this.sequences.values()).filter((s) => s.userId === userId);
  }

  /**
   * Shutdown email campaign service
   */
  shutdown(): void {
    if (this.processingLoop) {
      clearInterval(this.processingLoop);
      console.log('[EmailCampaigns] Shutdown complete');
    }
  }
}

// Export singleton instance
export const emailCampaignService = new EmailCampaignService();
