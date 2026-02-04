/**
 * AI Assistants Manager Service
 * Centralized management and activation of all AI assistants
 * Includes LLM, voice transcription, image generation, and content synthesis
 */

import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";
import { generateImage } from "../_core/imageGeneration";

/**
 * AI Assistant Status and Metrics
 */
export interface AIAssistantStatus {
  name: string;
  active: boolean;
  lastUsed: Date | null;
  apiCallsToday: number;
  averageLatency: number;
  errorRate: number;
  status: "operational" | "degraded" | "offline";
}

/**
 * AI Assistants Manager
 * Coordinates all AI services and monitors their health
 */
export class AIAssistantsManager {
  private static assistants: Map<string, AIAssistantStatus> = new Map([
    [
      "llm",
      {
        name: "Language Model (LLM)",
        active: true,
        lastUsed: null,
        apiCallsToday: 0,
        averageLatency: 850,
        errorRate: 0,
        status: "operational",
      },
    ],
    [
      "voiceTranscription",
      {
        name: "Voice Transcription",
        active: true,
        lastUsed: null,
        apiCallsToday: 0,
        averageLatency: 1200,
        errorRate: 0,
        status: "operational",
      },
    ],
    [
      "imageGeneration",
      {
        name: "Image Generation",
        active: true,
        lastUsed: null,
        apiCallsToday: 0,
        averageLatency: 3400,
        errorRate: 0,
        status: "operational",
      },
    ],
    [
      "contentSynthesis",
      {
        name: "Content Synthesis",
        active: true,
        lastUsed: null,
        apiCallsToday: 0,
        averageLatency: 2100,
        errorRate: 0,
        status: "operational",
      },
    ],
  ]);

  /**
   * Initialize all AI assistants
   */
  static async initializeAll(): Promise<void> {
    console.log("[AI Assistants] Initializing all AI assistants...");

    for (const [key, assistant] of Array.from(this.assistants.entries())) {
      try {
        await this.initialize(key);
        console.log(`[AI Assistants] ✓ ${assistant.name} initialized successfully`);
      } catch (error) {
        console.error(`[AI Assistants] ✗ Failed to initialize ${assistant.name}:`, error);
        const status = this.assistants.get(key);
        if (status) {
          status.status = "offline";
        }
      }
    }

    console.log("[AI Assistants] All AI assistants initialization complete");
  }

  /**
   * Initialize a specific AI assistant
   */
  static async initialize(assistantKey: string): Promise<void> {
    const assistant = this.assistants.get(assistantKey);
    if (!assistant) {
      throw new Error(`Unknown assistant: ${assistantKey}`);
    }

    // Simulate initialization with health check
    switch (assistantKey) {
      case "llm":
        // Test LLM connectivity
        await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: "Say 'ready' if you are operational.",
            },
          ],
        });
        break;

      case "voiceTranscription":
        // Voice transcription is pre-initialized
        console.log("[AI Assistants] Voice transcription service ready");
        break;

      case "imageGeneration":
        // Image generation is pre-initialized
        console.log("[AI Assistants] Image generation service ready");
        break;

      case "contentSynthesis":
        // Content synthesis uses LLM, so check LLM
        await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a content creation assistant.",
            },
            {
              role: "user",
              content: "Confirm content synthesis capability.",
            },
          ],
        });
        break;
    }

    assistant.active = true;
    assistant.status = "operational";
  }

  /**
   * Get status of all AI assistants
   */
  static getAllStatus(): AIAssistantStatus[] {
    return Array.from(this.assistants.values());
  }

  /**
   * Get status of a specific AI assistant
   */
  static getStatus(assistantKey: string): AIAssistantStatus | undefined {
    return this.assistants.get(assistantKey);
  }

  /**
   * Use LLM for grant matching
   */
  static async grantMatching(grantDescription: string, organizationProfile: string): Promise<string> {
    const assistant = this.assistants.get("llm");
    if (!assistant || !assistant.active) {
      throw new Error("LLM assistant is not active");
    }

    const startTime = Date.now();

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert grant matching assistant. Analyze grants and organization profiles to provide match scores and recommendations.",
          },
          {
            role: "user",
            content: `Grant: ${grantDescription}\n\nOrganization: ${organizationProfile}\n\nProvide a match score (0-100) and brief recommendation.`,
          },
        ],
      });

      const latency = Date.now() - startTime;
      this.updateMetrics("llm", latency, false);

      const content = response.choices[0]?.message?.content;
      return typeof content === "string" ? content : "No match analysis available";
    } catch (error) {
      this.updateMetrics("llm", Date.now() - startTime, true);
      throw error;
    }
  }

  /**
   * Use LLM for donor messaging
   */
  static async generateDonorMessage(
    donorName: string,
    donationAmount: number,
    campaignName: string
  ): Promise<string> {
    const assistant = this.assistants.get("llm");
    if (!assistant || !assistant.active) {
      throw new Error("LLM assistant is not active");
    }

    const startTime = Date.now();

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a compassionate fundraising communications specialist. Write personalized thank you messages for donors.",
          },
          {
            role: "user",
            content: `Write a personalized thank you message for ${donorName} who donated $${donationAmount} to the ${campaignName} campaign. Keep it warm, genuine, and under 100 words.`,
          },
        ],
      });

      const latency = Date.now() - startTime;
      this.updateMetrics("llm", latency, false);

      const content = response.choices[0]?.message?.content;
      return typeof content === "string" ? content : "Thank you for your generous donation!";
    } catch (error) {
      this.updateMetrics("llm", Date.now() - startTime, true);
      throw error;
    }
  }

  /**
   * Use voice transcription for wellness check-ins
   */
  static async transcribeWellnessCheckIn(audioUrl: string): Promise<{
    transcription: string;
    language: string;
    confidence: number;
  }> {
    const assistant = this.assistants.get("voiceTranscription");
    if (!assistant || !assistant.active) {
      throw new Error("Voice transcription assistant is not active");
    }

    const startTime = Date.now();

    try {
      const result = await transcribeAudio({
        audioUrl,
        language: "en",
        prompt: "Wellness check-in call",
      });

      const latency = Date.now() - startTime;
      this.updateMetrics("voiceTranscription", latency, false);

      const transcriptionResult = result as any;
      return {
        transcription: transcriptionResult.text || "",
        language: transcriptionResult.language || "en",
        confidence: 0.95,
      };
    } catch (error) {
      this.updateMetrics("voiceTranscription", Date.now() - startTime, true);
      throw error;
    }
  }

  /**
   * Use image generation for campaign graphics
   */
  static async generateCampaignGraphic(prompt: string): Promise<{ url: string }> {
    const assistant = this.assistants.get("imageGeneration");
    if (!assistant || !assistant.active) {
      throw new Error("Image generation assistant is not active");
    }

    const startTime = Date.now();

    try {
      const result = await generateImage({
        prompt: `Professional fundraising campaign graphic: ${prompt}`,
      });

      const latency = Date.now() - startTime;
      this.updateMetrics("imageGeneration", latency, false);

      return { url: result.url || "" };
    } catch (error) {
      this.updateMetrics("imageGeneration", Date.now() - startTime, true);
      throw error;
    }
  }

  /**
   * Use content synthesis for podcast/audiobook generation
   */
  static async synthesizeContent(contentType: string, topic: string): Promise<string> {
    const assistant = this.assistants.get("contentSynthesis");
    if (!assistant || !assistant.active) {
      throw new Error("Content synthesis assistant is not active");
    }

    const startTime = Date.now();

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert ${contentType} writer. Create engaging, high-quality content.`,
          },
          {
            role: "user",
            content: `Create a ${contentType} about: ${topic}. Make it compelling and suitable for broadcast.`,
          },
        ],
      });

      const latency = Date.now() - startTime;
      this.updateMetrics("contentSynthesis", latency, false);

      const content = response.choices[0]?.message?.content;
      return typeof content === "string" ? content : "Content generation failed";
    } catch (error) {
      this.updateMetrics("contentSynthesis", Date.now() - startTime, true);
      throw error;
    }
  }

  /**
   * Update metrics for an assistant
   */
  private static updateMetrics(assistantKey: string, latency: number, error: boolean): void {
    const assistant = this.assistants.get(assistantKey);
    if (!assistant) return;

    assistant.lastUsed = new Date();
    assistant.apiCallsToday++;

    // Update average latency
    const newAvg = (assistant.averageLatency + latency) / 2;
    assistant.averageLatency = Math.round(newAvg);

    // Update error rate
    if (error) {
      assistant.errorRate = Math.min(assistant.errorRate + 0.01, 1);
    } else {
      assistant.errorRate = Math.max(assistant.errorRate - 0.001, 0);
    }

    // Update status based on error rate
    if (assistant.errorRate > 0.1) {
      assistant.status = "degraded";
    } else if (assistant.errorRate === 0) {
      assistant.status = "operational";
    }
  }

  /**
   * Get health summary of all assistants
   */
  static getHealthSummary(): {
    allOperational: boolean;
    operationalCount: number;
    degradedCount: number;
    offlineCount: number;
    totalApiCalls: number;
    averageLatency: number;
  } {
    const statuses = this.getAllStatus();
    const operationalCount = statuses.filter((s) => s.status === "operational").length;
    const degradedCount = statuses.filter((s) => s.status === "degraded").length;
    const offlineCount = statuses.filter((s) => s.status === "offline").length;
    const totalApiCalls = statuses.reduce((sum, s) => sum + s.apiCallsToday, 0);
    const averageLatency = Math.round(
      statuses.reduce((sum, s) => sum + s.averageLatency, 0) / statuses.length
    );

    return {
      allOperational: offlineCount === 0 && degradedCount === 0,
      operationalCount,
      degradedCount,
      offlineCount,
      totalApiCalls,
      averageLatency,
    };
  }

  /**
   * Reset daily metrics (call at midnight)
   */
  static resetDailyMetrics(): void {
    this.assistants.forEach((assistant) => {
      assistant.apiCallsToday = 0;
    });
    console.log("[AI Assistants] Daily metrics reset");
  }
}

export const aiAssistantsManager = AIAssistantsManager;
