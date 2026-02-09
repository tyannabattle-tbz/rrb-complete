/**
 * Text-to-Speech and Content Generation Policy Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { textToSpeechService } from "./qumus/textToSpeech";
import { contentGenerationPolicy } from "./qumus/contentGenerationPolicy";

describe("Text-to-Speech Service", () => {
  beforeEach(() => {
    // Clear cache before each test
    textToSpeechService.clearExpiredCache();
  });

  describe("Audio Synthesis", () => {
    it("should synthesize audio from text", async () => {
      const result = await textToSpeechService.synthesizeAudio({
        text: "Hello, this is a test audio file.",
        language: "en",
      });

      expect(result).toBeDefined();
      expect(result.audioUrl).toBeDefined();
      expect(result.audioKey).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.format).toBe("mp3");
      expect(result.bitrate).toBe("128kbps");
      expect(result.sampleRate).toBe(24000);
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it("should cache synthesized audio", async () => {
      const text = "This is a cached audio test.";

      const result1 = await textToSpeechService.synthesizeAudio({
        text,
        voice: "default",
      });

      const result2 = await textToSpeechService.synthesizeAudio({
        text,
        voice: "default",
      });

      // Both should have the same URL (from cache)
      expect(result1.audioUrl).toBe(result2.audioUrl);
    });

    it("should synthesize with different voices", async () => {
      const result1 = await textToSpeechService.synthesizeAudio({
        text: "Voice one",
        voice: "male",
      });

      const result2 = await textToSpeechService.synthesizeAudio({
        text: "Voice two",
        voice: "female",
      });

      expect(result1.audioUrl).toBeDefined();
      expect(result2.audioUrl).toBeDefined();
    });

    it("should estimate duration correctly", async () => {
      const shortText = "Hi";
      const longText = "This is a much longer text that should take more time to read and synthesize into audio.";

      const shortResult = await textToSpeechService.synthesizeAudio({
        text: shortText,
      });

      const longResult = await textToSpeechService.synthesizeAudio({
        text: longText,
      });

      expect(longResult.duration).toBeGreaterThan(shortResult.duration);
    });

    it("should adjust duration for speech speed", async () => {
      const text = "This is a test sentence for speed adjustment.";

      const normalSpeed = await textToSpeechService.synthesizeAudio({
        text,
        speed: 1.0,
      });

      const fastSpeed = await textToSpeechService.synthesizeAudio({
        text,
        speed: 2.0,
      });

      expect(fastSpeed.duration).toBeLessThan(normalSpeed.duration);
    });
  });

  describe("Multiple Audio Synthesis", () => {
    it("should synthesize multiple segments", async () => {
      const segments = [
        { text: "First segment", speaker: "host" },
        { text: "Second segment", speaker: "guest" },
        { text: "Third segment", speaker: "host" },
      ];

      const results = await textToSpeechService.synthesizeMultiple(segments);

      expect(results.length).toBe(3);
      expect(results.every((r) => r.audioUrl)).toBe(true);
      expect(results.every((r) => r.duration > 0)).toBe(true);
    });
  });

  describe("Audio Metadata", () => {
    it("should store and retrieve audio metadata", () => {
      const metadata = {
        contentId: "test-123",
        title: "Test Audio",
        duration: 300,
        format: "mp3",
        bitrate: "128kbps",
        sampleRate: 24000,
        voice: "default",
        language: "en",
        speed: 1.0,
        pitch: 0,
        fileSize: 5000000,
        uploadedAt: new Date(),
      };

      textToSpeechService.storeAudioMetadata(metadata.contentId, metadata);
      const retrieved = textToSpeechService.getAudioMetadata(metadata.contentId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe("Test Audio");
      expect(retrieved?.duration).toBe(300);
    });

    it("should delete audio metadata", async () => {
      const metadata = {
        contentId: "test-456",
        title: "Test Audio",
        duration: 300,
        format: "mp3",
        bitrate: "128kbps",
        sampleRate: 24000,
        voice: "default",
        language: "en",
        speed: 1.0,
        pitch: 0,
        fileSize: 5000000,
        uploadedAt: new Date(),
      };

      textToSpeechService.storeAudioMetadata(metadata.contentId, metadata);
      const success = await textToSpeechService.deleteAudio(metadata.contentId);
      const retrieved = textToSpeechService.getAudioMetadata(metadata.contentId);

      expect(success).toBe(true);
      expect(retrieved).toBeUndefined();
    });
  });

  describe("Statistics", () => {
    it("should calculate TTS statistics", () => {
      const metadata = {
        contentId: "stat-test",
        title: "Test",
        duration: 600,
        format: "mp3",
        bitrate: "128kbps",
        sampleRate: 24000,
        voice: "default",
        language: "en",
        speed: 1.0,
        pitch: 0,
        fileSize: 10000000,
        uploadedAt: new Date(),
      };

      textToSpeechService.storeAudioMetadata(metadata.contentId, metadata);
      const stats = textToSpeechService.getStatistics();

      expect(stats.totalAudioFiles).toBeGreaterThan(0);
      expect(stats.totalDuration).toBeGreaterThan(0);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });
  });

  describe("Cache Management", () => {
    it("should clear expired cache entries", () => {
      textToSpeechService.clearExpiredCache();
      const stats = textToSpeechService.getStatistics();

      expect(stats.cacheSize).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Content Generation Policy", () => {
  describe("Decision Evaluation", () => {
    it("should evaluate content generation decision", async () => {
      const decision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 5000,
        timeOfDay: 14,
        dayOfWeek: 3,
        recentEngagementRate: 85,
        contentTypePreference: "podcast",
        availableTopics: ["Technology", "Science", "Entertainment"],
      });

      expect(decision).toBeDefined();
      expect(decision?.contentType).toBe("podcast");
      expect(decision?.confidence).toBeGreaterThan(0);
      expect(decision?.priority).toBeDefined();
      expect(decision?.estimatedListeners).toBeGreaterThan(0);
    });

    it("should determine priority based on metrics", async () => {
      const highPriorityDecision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 50000,
        timeOfDay: 12,
        dayOfWeek: 1,
        recentEngagementRate: 95,
        contentTypePreference: "podcast",
        availableTopics: ["Technology"],
      });

      const lowPriorityDecision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 100,
        timeOfDay: 12,
        dayOfWeek: 1,
        recentEngagementRate: 20,
        contentTypePreference: "podcast",
        availableTopics: ["Technology"],
      });

      expect(highPriorityDecision?.priority).toBe("critical");
      expect(lowPriorityDecision?.priority).toBe("low");
    });

    it("should select content type based on time of day", async () => {
      const topOfTheSolDecision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 5000,
        timeOfDay: 8,
        dayOfWeek: 1,
        recentEngagementRate: 80,
        contentTypePreference: "any",
        availableTopics: ["News"],
      });

      const afternoonDecision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 5000,
        timeOfDay: 14,
        dayOfWeek: 1,
        recentEngagementRate: 80,
        contentTypePreference: "any",
        availableTopics: ["News"],
      });

      const eveningDecision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 5000,
        timeOfDay: 20,
        dayOfWeek: 1,
        recentEngagementRate: 80,
        contentTypePreference: "any",
        availableTopics: ["News"],
      });

      expect(topOfTheSolDecision?.contentType).toBe("radio");
      expect(afternoonDecision?.contentType).toBe("podcast");
      expect(eveningDecision?.contentType).toBe("audiobook");
    });
  });

  describe("Decision Execution", () => {
    it("should execute content generation decision", async () => {
      const decision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 5000,
        timeOfDay: 14,
        dayOfWeek: 3,
        recentEngagementRate: 85,
        contentTypePreference: "podcast",
        availableTopics: ["Technology"],
      });

      if (!decision) {
        throw new Error("Decision should not be null");
      }

      const success = await contentGenerationPolicy.executeDecision(decision);

      expect(success).toBe(true);
    }, 30000);
  });

  describe("Policy Metrics", () => {
    it("should track policy metrics", async () => {
      const initialMetrics = contentGenerationPolicy.getMetrics();

      const decision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 5000,
        timeOfDay: 14,
        dayOfWeek: 3,
        recentEngagementRate: 85,
        contentTypePreference: "podcast",
        availableTopics: ["Technology"],
      });

      if (decision) {
        await contentGenerationPolicy.executeDecision(decision);
      }

      const updatedMetrics = contentGenerationPolicy.getMetrics();

      expect(updatedMetrics.totalDecisions).toBeGreaterThanOrEqual(initialMetrics.totalDecisions);
      expect(updatedMetrics.successfulGenerations).toBeGreaterThanOrEqual(initialMetrics.successfulGenerations);
    }, 30000);

    it("should calculate policy effectiveness", async () => {
      const metrics = contentGenerationPolicy.getMetrics();

      expect(metrics.policyEffectiveness).toBeGreaterThanOrEqual(0);
      expect(metrics.policyEffectiveness).toBeLessThanOrEqual(100);
      expect(metrics.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(metrics.averageConfidence).toBeLessThanOrEqual(100);
    });

    it("should reset metrics", () => {
      contentGenerationPolicy.resetMetrics();
      const metrics = contentGenerationPolicy.getMetrics();

      expect(metrics.totalDecisions).toBe(0);
      expect(metrics.successfulGenerations).toBe(0);
      expect(metrics.failedGenerations).toBe(0);
    });
  });

  describe("Decision History", () => {
    it("should retrieve decision history", async () => {
      contentGenerationPolicy.resetMetrics();

      const decision = await contentGenerationPolicy.evaluateAndDecide({
        currentListenerCount: 5000,
        timeOfDay: 14,
        dayOfWeek: 3,
        recentEngagementRate: 85,
        contentTypePreference: "podcast",
        availableTopics: ["Technology"],
      });

      const decisions = contentGenerationPolicy.getDecisions();

      expect(decisions.length).toBeGreaterThan(0);
      expect(decisions[decisions.length - 1].topic).toBeDefined();
    });

    it("should limit decision history retrieval", async () => {
      contentGenerationPolicy.resetMetrics();

      // Make multiple decisions
      for (let i = 0; i < 5; i++) {
        await contentGenerationPolicy.evaluateAndDecide({
          currentListenerCount: 5000,
          timeOfDay: 14,
          dayOfWeek: 3,
          recentEngagementRate: 85,
          contentTypePreference: "podcast",
          availableTopics: ["Technology"],
        });
      }

      const limitedDecisions = contentGenerationPolicy.getDecisions(2);

      expect(limitedDecisions.length).toBeLessThanOrEqual(2);
    });
  });
});
