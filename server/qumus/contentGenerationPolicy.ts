/**
 * QUMUS Content Generation Decision Policy
 * 
 * Autonomous policy for scheduling and generating content based on:
 * - Listener engagement metrics
 * - Time-of-day rules
 * - Content type demand
 * - Availability of resources
 */

import { contentGenerator } from "./contentGenerator";
import { textToSpeechService } from "./textToSpeech";

export interface ContentGenerationDecision {
  policyId: string;
  contentType: "podcast" | "audiobook" | "radio";
  topic: string;
  theme?: string;
  targetAudience?: string;
  priority: "low" | "medium" | "high" | "critical";
  scheduledTime: Date;
  expectedDuration: number;
  estimatedListeners: number;
  confidence: number;
  reasoning: string;
}

export interface PolicyMetrics {
  totalDecisions: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageConfidence: number;
  averageListenerImpact: number;
  policyEffectiveness: number; // 0-100
  lastExecutionTime?: Date;
}

class ContentGenerationPolicy {
  private policyId = "content-generation-policy";
  private decisions: ContentGenerationDecision[] = [];
  private metrics: PolicyMetrics = {
    totalDecisions: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    averageConfidence: 0,
    averageListenerImpact: 0,
    policyEffectiveness: 0,
  };

  /**
   * Evaluate and make content generation decision
   */
  async evaluateAndDecide(context: {
    currentListenerCount: number;
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    recentEngagementRate: number; // 0-100
    contentTypePreference: string;
    availableTopics: string[];
  }): Promise<ContentGenerationDecision | null> {
    try {
      // Determine priority based on listener count and engagement
      const priority = this.determinePriority(context.currentListenerCount, context.recentEngagementRate);

      // Select content type based on time and preference
      const contentType = this.selectContentType(context.timeOfDay, context.contentTypePreference);

      // Select topic from available options
      const topic = this.selectTopic(context.availableTopics, context.timeOfDay);

      // Calculate confidence score
      const confidence = this.calculateConfidence(context);

      // Estimate listener impact
      const estimatedListeners = Math.round(context.currentListenerCount * (confidence / 100));

      // Create decision
      const decision: ContentGenerationDecision = {
        policyId: this.policyId,
        contentType,
        topic,
        theme: this.selectTheme(contentType, context.timeOfDay),
        targetAudience: this.selectAudience(contentType),
        priority,
        scheduledTime: new Date(),
        expectedDuration: this.getExpectedDuration(contentType),
        estimatedListeners,
        confidence,
        reasoning: this.generateReasoning(context, contentType, topic),
      };

      // Store decision
      this.decisions.push(decision);
      this.metrics.totalDecisions++;

      return decision;
    } catch (error) {
      console.error("[ContentGenerationPolicy] Decision evaluation failed:", error);
      return null;
    }
  }

  /**
   * Execute content generation decision
   */
  async executeDecision(decision: ContentGenerationDecision): Promise<boolean> {
    try {
      // Generate content based on decision
      let generatedContent;

      switch (decision.contentType) {
        case "podcast":
          generatedContent = await contentGenerator.generatePodcastEpisode({
            type: "podcast",
            title: decision.topic,
            topic: decision.topic,
            theme: decision.theme,
            targetAudience: decision.targetAudience,
            duration: decision.expectedDuration,
            customPrompt: decision.reasoning,
          });
          break;

        case "audiobook":
          generatedContent = await contentGenerator.generateAudiobookChapter({
            type: "audiobook",
            title: decision.topic,
            topic: decision.topic,
            theme: decision.theme,
            targetAudience: decision.targetAudience,
            duration: decision.expectedDuration,
            customPrompt: decision.reasoning,
          });
          break;

        case "radio":
          generatedContent = await contentGenerator.generateRadioShowScript({
            type: "radio",
            title: decision.topic,
            topic: decision.topic,
            theme: decision.theme,
            targetAudience: decision.targetAudience,
            duration: decision.expectedDuration,
            customPrompt: decision.reasoning,
          });
          break;
      }

      if (!generatedContent) {
        this.metrics.failedGenerations++;
        return false;
      }

      // Synthesize audio
      const audioResult = await textToSpeechService.synthesizeAudio({
        text: generatedContent.script,
        language: "en",
        speed: 1.0,
        audioFormat: "mp3",
      });

      // Store audio metadata
      textToSpeechService.storeAudioMetadata(generatedContent.contentId, {
        contentId: generatedContent.contentId,
        title: generatedContent.title,
        duration: audioResult.duration,
        format: audioResult.format,
        bitrate: audioResult.bitrate,
        sampleRate: audioResult.sampleRate,
        voice: "default",
        language: "en",
        speed: 1.0,
        pitch: 0,
        fileSize: 0,
        uploadedAt: new Date(),
      });

      // Approve and publish content
      contentGenerator.approveContent(generatedContent.contentId);
      contentGenerator.publishContent(generatedContent.contentId);

      // Update metrics
      this.metrics.successfulGenerations++;
      this.metrics.lastExecutionTime = new Date();
      this.updateMetrics();

      return true;
    } catch (error) {
      console.error("[ContentGenerationPolicy] Execution failed:", error);
      this.metrics.failedGenerations++;
      return false;
    }
  }

  /**
   * Get policy metrics
   */
  getMetrics(): PolicyMetrics {
    return { ...this.metrics };
  }

  /**
   * Get policy decisions
   */
  getDecisions(limit?: number): ContentGenerationDecision[] {
    if (limit) {
      return this.decisions.slice(-limit);
    }
    return [...this.decisions];
  }

  /**
   * Reset policy metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalDecisions: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageConfidence: 0,
      averageListenerImpact: 0,
      policyEffectiveness: 0,
    };
    this.decisions = [];
  }

  /**
   * Private helper: Determine priority
   */
  private determinePriority(
    listenerCount: number,
    engagementRate: number
  ): "low" | "medium" | "high" | "critical" {
    const score = (listenerCount / 10000) * 50 + (engagementRate / 100) * 50;

    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  }

  /**
   * Private helper: Select content type based on time
   */
  private selectContentType(
    timeOfDay: number,
    preference: string
  ): "podcast" | "audiobook" | "radio" {
    // Morning (6-12): Radio shows
    // Afternoon (12-18): Podcasts
    // Evening (18-24): Audiobooks
    // Night (0-6): Podcasts

    if (timeOfDay >= 6 && timeOfDay < 12) return "radio";
    if (timeOfDay >= 12 && timeOfDay < 18) return "podcast";
    if (timeOfDay >= 18 && timeOfDay < 24) return "audiobook";
    return "podcast";
  }

  /**
   * Private helper: Select topic
   */
  private selectTopic(availableTopics: string[], timeOfDay: number): string {
    if (availableTopics.length === 0) {
      return "Technology and Innovation";
    }

    // Rotate topics based on time
    const index = (timeOfDay + availableTopics.length) % availableTopics.length;
    return availableTopics[index];
  }

  /**
   * Private helper: Select theme
   */
  private selectTheme(contentType: string, timeOfDay: number): string {
    const themes: Record<string, string[]> = {
      podcast: ["Informative", "Engaging", "Educational", "Entertaining"],
      audiobook: ["Narrative", "Immersive", "Dramatic", "Engaging"],
      radio: ["News", "Entertainment", "Music", "Talk Show"],
    };

    const contentThemes = themes[contentType] || ["General"];
    const index = timeOfDay % contentThemes.length;
    return contentThemes[index];
  }

  /**
   * Private helper: Select audience
   */
  private selectAudience(contentType: string): string {
    const audiences: Record<string, string[]> = {
      podcast: ["General audience", "Tech enthusiasts", "Professionals", "Students"],
      audiobook: ["General audience", "Fiction lovers", "Commuters", "Readers"],
      radio: ["General audience", "Commuters", "Workers", "Families"],
    };

    const contentAudiences = audiences[contentType] || ["General audience"];
    return contentAudiences[Math.floor(Math.random() * contentAudiences.length)];
  }

  /**
   * Private helper: Calculate confidence
   */
  private calculateConfidence(context: {
    currentListenerCount: number;
    recentEngagementRate: number;
  }): number {
    const listenerConfidence = Math.min(100, (context.currentListenerCount / 1000) * 50);
    const engagementConfidence = context.recentEngagementRate;
    return Math.round((listenerConfidence + engagementConfidence) / 2);
  }

  /**
   * Private helper: Get expected duration
   */
  private getExpectedDuration(contentType: string): number {
    const durations: Record<string, number> = {
      podcast: 30, // 30 minutes
      audiobook: 45, // 45 minutes
      radio: 60, // 60 minutes
    };
    return durations[contentType] || 30;
  }

  /**
   * Private helper: Generate reasoning
   */
  private generateReasoning(
    context: {
      currentListenerCount: number;
      recentEngagementRate: number;
      timeOfDay: number;
    },
    contentType: string,
    topic: string
  ): string {
    return `Generated ${contentType} content about "${topic}" based on ${context.currentListenerCount} current listeners and ${context.recentEngagementRate}% engagement rate at ${context.timeOfDay}:00.`;
  }

  /**
   * Private helper: Update metrics
   */
  private updateMetrics(): void {
    if (this.decisions.length === 0) return;

    const totalConfidence = this.decisions.reduce((sum, d) => sum + d.confidence, 0);
    const totalListeners = this.decisions.reduce((sum, d) => sum + d.estimatedListeners, 0);

    this.metrics.averageConfidence = Math.round(totalConfidence / this.decisions.length);
    this.metrics.averageListenerImpact = Math.round(totalListeners / this.decisions.length);

    // Calculate effectiveness (success rate * average confidence)
    const successRate = (this.metrics.successfulGenerations / Math.max(1, this.metrics.totalDecisions)) * 100;
    this.metrics.policyEffectiveness = Math.round((successRate * this.metrics.averageConfidence) / 100);
  }
}

export const contentGenerationPolicy = new ContentGenerationPolicy();
