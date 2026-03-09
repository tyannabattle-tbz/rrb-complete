import { ContentScheduler } from './contentScheduler';
import { commercialEngine, UN_CAMPAIGN_COMMERCIALS } from './_core/commercialCampaignService';
import { stateOfStudio } from './_core/stateOfStudio';
import { notifyOwner } from './notification';

/**
 * Automation Engine
 * Manages 24/7 content delivery and scheduling automation
 */

interface AutomationConfig {
  enabled: boolean;
  checkInterval: number; // milliseconds
  commercialInsertionRate: number; // percentage
  fallbackContent: string; // ID of fallback content
}

export class AutomationEngine {
  private static instance: AutomationEngine;
  private config: AutomationConfig;
  private isRunning: boolean = false;
  private currentScheduleId: string | null = null;
  private nextContentQueue: any[] = [];
  private lastCheckTime: number = 0;

  private constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      checkInterval: config.checkInterval ?? 60000, // 1 minute
      commercialInsertionRate: config.commercialInsertionRate ?? 40, // 40% for UN campaign launch (was 15%)
      fallbackContent: config.fallbackContent ?? '',
    };
  }

  /**
   * Get or create singleton instance
   */
  static getInstance(config?: Partial<AutomationConfig>): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine(config);
    }
    return AutomationEngine.instance;
  }

  /**
   * Start automation engine
   */
  async start() {
    if (this.isRunning) {
      console.log('[AutomationEngine] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[AutomationEngine] Started');

    await notifyOwner({
      title: 'Automation Engine Started',
      content: 'Qumus 24/7 content automation engine is now active and managing airwave content.',
    });

    this.scheduleNextCheck();
  }

  /**
   * Stop automation engine
   */
  async stop() {
    this.isRunning = false;
    console.log('[AutomationEngine] Stopped');

    await notifyOwner({
      title: 'Automation Engine Stopped',
      content: 'Qumus 24/7 content automation engine has been stopped.',
    });
  }

  /**
   * Schedule next content check
   */
  private scheduleNextCheck() {
    if (!this.isRunning) return;

    setTimeout(async () => {
      try {
        await this.checkAndQueueContent();
      } catch (error) {
        console.error('[AutomationEngine] Error during content check:', error);
        await notifyOwner({
          title: 'Automation Engine Error',
          content: `Error during content scheduling: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }

      this.scheduleNextCheck();
    }, this.config.checkInterval);
  }

  /**
   * Check and queue next content
   */
  private async checkAndQueueContent() {
    const now = Date.now();

    // Skip if checked recently
    if (now - this.lastCheckTime < this.config.checkInterval / 2) {
      return;
    }

    this.lastCheckTime = now;

    try {
      // Get next scheduled content
      const nextContent = await ContentScheduler.getNextContent();

      if (nextContent) {
        // Add to queue
        this.nextContentQueue.push({
          id: nextContent.id,
          title: nextContent.title,
          duration: nextContent.duration,
          fileUrl: nextContent.fileUrl,
          queuedAt: now,
          type: 'scheduled',
        });

        console.log(`[AutomationEngine] Queued content: ${nextContent.title}`);
      }

      // Check if commercial should be inserted — prioritize UN campaign commercials
      if (Math.random() * 100 < this.config.commercialInsertionRate) {
        // Try UN campaign commercial first (priority during launch period)
        const campaignCommercial = commercialEngine.getNextCommercial('Community');
        if (campaignCommercial) {
          this.nextContentQueue.push({
            id: campaignCommercial.id,
            title: campaignCommercial.title,
            duration: campaignCommercial.duration,
            fileUrl: `campaign://${campaignCommercial.id}`,
            queuedAt: now,
            type: 'commercial',
          });
          console.log(`[AutomationEngine] UN Campaign commercial: ${campaignCommercial.title} (${campaignCommercial.duration}s)`);
          // Log as QUMUS autonomous decision
          try {
            await stateOfStudio.recordAutonomousDecision();
          } catch {}
        } else {
          // Fall back to regular commercials from DB
          const commercial = await ContentScheduler.getNextCommercial();
          if (commercial) {
            this.nextContentQueue.push({
              id: commercial.id,
              title: commercial.title,
              duration: commercial.duration,
              fileUrl: commercial.fileUrl,
              queuedAt: now,
              type: 'commercial',
            });
            console.log(`[AutomationEngine] Inserted commercial: ${commercial.title}`);
            await ContentScheduler.updateCommercialPlayCount(commercial.id);
          }
        }
      }

      // Log current queue status
      this.logQueueStatus();
    } catch (error) {
      console.error('[AutomationEngine] Error queuing content:', error);
    }
  }

  /**
   * Get next content from queue
   */
  async getNextContent() {
    if (this.nextContentQueue.length === 0) {
      // Queue is empty, get next scheduled content
      await this.checkAndQueueContent();
    }

    return this.nextContentQueue.shift() || null;
  }

  /**
   * Get current queue
   */
  getQueue() {
    return [...this.nextContentQueue];
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const scheduled = this.nextContentQueue.filter(c => c.type === 'scheduled').length;
    const commercials = this.nextContentQueue.filter(c => c.type === 'commercial').length;
    const totalDuration = this.nextContentQueue.reduce((sum, c) => sum + c.duration, 0);

    return {
      queueLength: this.nextContentQueue.length,
      scheduledContent: scheduled,
      commercials,
      totalDuration,
      estimatedPlayTime: `${Math.floor(totalDuration / 60)}m ${totalDuration % 60}s`,
    };
  }

  /**
   * Update automation config
   */
  updateConfig(newConfig: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('[AutomationEngine] Configuration updated:', this.config);
  }

  /**
   * Get current config
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get automation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      queueStats: this.getQueueStats(),
      lastCheckTime: this.lastCheckTime,
    };
  }

  /**
   * Log queue status
   */
  private logQueueStatus() {
    const stats = this.getQueueStats();
    console.log(`[AutomationEngine] Queue Status:`, {
      length: stats.queueLength,
      scheduled: stats.scheduledContent,
      commercials: stats.commercials,
      estimatedPlayTime: stats.estimatedPlayTime,
    });
  }

  /**
   * Clear queue
   */
  clearQueue() {
    this.nextContentQueue = [];
    console.log('[AutomationEngine] Queue cleared');
  }

  /**
   * Add content to queue manually
   */
  addToQueue(content: any) {
    this.nextContentQueue.push({
      ...content,
      queuedAt: Date.now(),
      type: content.type || 'manual',
    });
    console.log(`[AutomationEngine] Added to queue: ${content.title}`);
  }

  /**
   * Remove content from queue by index
   */
  removeFromQueue(index: number) {
    if (index >= 0 && index < this.nextContentQueue.length) {
      const removed = this.nextContentQueue.splice(index, 1);
      console.log(`[AutomationEngine] Removed from queue: ${removed[0].title}`);
      return true;
    }
    return false;
  }

  /**
   * Reorder queue
   */
  reorderQueue(fromIndex: number, toIndex: number) {
    if (
      fromIndex >= 0 &&
      fromIndex < this.nextContentQueue.length &&
      toIndex >= 0 &&
      toIndex < this.nextContentQueue.length
    ) {
      const [item] = this.nextContentQueue.splice(fromIndex, 1);
      this.nextContentQueue.splice(toIndex, 0, item);
      console.log(`[AutomationEngine] Reordered queue: ${fromIndex} -> ${toIndex}`);
      return true;
    }
    return false;
  }

  /**
   * Get broadcast statistics
   */
  async getBroadcastStats(hours: number = 24) {
    return await ContentScheduler.getBroadcastStats(hours);
  }
}

/**
 * Initialize and start automation engine
 */
export async function initializeAutomationEngine() {
  const engine = AutomationEngine.getInstance({
    enabled: true,
    checkInterval: 60000, // Check every minute
    commercialInsertionRate: 15, // 15% commercial insertion
  });

  await engine.start();
  return engine;
}
