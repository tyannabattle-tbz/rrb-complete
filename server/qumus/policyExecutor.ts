/**
 * QUMUS Policy Executor
 * 
 * Executes autonomous policies for content generation scheduling
 * Integrates with decision engine and content generation
 */

import { getDb } from "../db";
import { rockinBoogieContent } from "../../drizzle/schema";
import { contentGenerator, ContentGenerationRequest } from "./contentGenerator";

export interface PolicyExecutionContext {
  policyId: string;
  policyName: string;
  contentType: "podcast" | "audiobook" | "radio";
  topic: string;
  theme?: string;
  targetAudience?: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  enabled: boolean;
  lastExecution?: Date;
  nextExecution: Date;
}

export interface PolicyExecutionResult {
  policyId: string;
  success: boolean;
  contentId?: string;
  contentTitle?: string;
  executedAt: Date;
  duration: number; // milliseconds
  error?: string;
}

export class PolicyExecutor {
  private executionHistory: PolicyExecutionResult[] = [];
  private executionTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a policy for autonomous execution
   */
  registerPolicy(context: PolicyExecutionContext): void {
    if (!context.enabled) return;

    const nextRun = this.calculateNextRun(context);
    const delayMs = nextRun.getTime() - Date.now();

    if (delayMs > 0) {
      const timerId = setTimeout(
        () => this.executePolicy(context),
        delayMs
      );
      this.executionTimers.set(context.policyId, timerId);
      console.log(
        `Policy ${context.policyName} scheduled for ${nextRun.toISOString()}`
      );
    }
  }

  /**
   * Execute a policy immediately
   */
  async executePolicy(context: PolicyExecutionContext): Promise<PolicyExecutionResult> {
    const startTime = Date.now();
    const result: PolicyExecutionResult = {
      policyId: context.policyId,
      success: false,
      executedAt: new Date(),
      duration: 0,
    };

    try {
      // Generate content based on policy
      const request: ContentGenerationRequest = {
        type: context.contentType,
        topic: context.topic,
        theme: context.theme || "General",
        targetAudience: context.targetAudience || "General"
      };
      const generatedContent = await contentGenerator.generatePodcastEpisode(request);

      // Save to database
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      // Log execution without database insert for now
      console.log("Generated content:", generatedContent.title);

      result.success = true;
      result.contentId = generatedContent.title;
      result.contentTitle = generatedContent.title;

      // Log execution
      this.executionHistory.push(result);

      // Re-schedule for next execution
      this.registerPolicy({
        ...context,
        lastExecution: new Date(),
        nextExecution: this.calculateNextRun(context),
      });

      console.log(
        `Policy ${context.policyName} executed successfully: ${generatedContent.title}`
      );
    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : "Unknown error";
      this.executionHistory.push(result);
      console.error(`Policy ${context.policyName} execution failed:`, error);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Calculate next execution time based on frequency
   */
  private calculateNextRun(context: PolicyExecutionContext): Date {
    const now = new Date();
    const [hours, minutes] = context.time.split(":").map(Number);

    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    // Adjust based on frequency
    if (context.frequency === "weekly") {
      // Schedule for next week
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (context.frequency === "monthly") {
      // Schedule for next month
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    return nextRun;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(policyId?: string): PolicyExecutionResult[] {
    if (policyId) {
      return this.executionHistory.filter((e) => e.policyId === policyId);
    }
    return this.executionHistory;
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    averageDuration: number;
  } {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter((e) => e.success).length;
    const failed = total - successful;
    const avgDuration =
      total > 0
        ? this.executionHistory.reduce((sum, e) => sum + e.duration, 0) / total
        : 0;

    return {
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageDuration: avgDuration,
    };
  }

  /**
   * Cancel a scheduled policy
   */
  cancelPolicy(policyId: string): void {
    const timerId = this.executionTimers.get(policyId);
    if (timerId) {
      clearTimeout(timerId);
      this.executionTimers.delete(policyId);
      console.log(`Policy ${policyId} cancelled`);
    }
  }

  /**
   * Cancel all scheduled policies
   */
  cancelAllPolicies(): void {
    this.executionTimers.forEach((timerId) => clearTimeout(timerId));
    this.executionTimers.clear();
    console.log("All policies cancelled");
  }
}

// Create singleton instance
export const policyExecutor = new PolicyExecutor();
