/**
 * Content Generation Engine Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { contentGenerator, ContentGenerationRequest } from "./qumus/contentGenerator";

describe("Content Generation Engine", () => {
  beforeEach(() => {
    // Clear generated content before each test
    const allContent = contentGenerator.getAllContent();
    allContent.forEach((c) => contentGenerator.deleteContent(c.contentId));
  });

  describe("Podcast Generation", () => {
    it("should generate a podcast episode with default values", async () => {
      const request: ContentGenerationRequest = {
        type: "podcast",
        title: "Tech Talk Daily",
        topic: "AI and Machine Learning",
      };

      const content = await contentGenerator.generatePodcastEpisode(request);

      expect(content).toBeDefined();
      expect(content.type).toBe("podcast");
      expect(content.title).toBe("Tech Talk Daily");
      expect(content.status).toBe("generated");
      expect(content.script.length).toBeGreaterThan(0);
      expect(content.summary.length).toBeGreaterThan(0);
      expect(content.metadata.topic).toBe("AI and Machine Learning");
      expect(content.metadata.confidence).toBeGreaterThan(0);
    });

    it("should generate podcast with custom duration", async () => {
      const request: ContentGenerationRequest = {
        type: "podcast",
        title: "Quick News",
        duration: 15,
      };

      const content = await contentGenerator.generatePodcastEpisode(request);

      expect(content.duration).toBe(15);
      expect(content.metadata.generatedAt).toBeInstanceOf(Date);
    });

    it("should include tags in generated podcast", async () => {
      const request: ContentGenerationRequest = {
        type: "podcast",
        title: "Science Podcast",
        topic: "Physics",
        theme: "Educational",
      };

      const content = await contentGenerator.generatePodcastEpisode(request);

      expect(content.tags.length).toBeGreaterThan(0);
      expect(content.tags).toContain("Physics");
      expect(content.tags).toContain("podcast");
    });
  });

  describe("Audiobook Generation", () => {
    it("should generate an audiobook chapter", async () => {
      const request: ContentGenerationRequest = {
        type: "audiobook",
        title: "The Chronicles",
        theme: "Fantasy",
      };

      const content = await contentGenerator.generateAudiobookChapter(request);

      expect(content).toBeDefined();
      expect(content.type).toBe("audiobook");
      expect(content.title).toBe("The Chronicles");
      expect(content.status).toBe("generated");
      expect(content.script.length).toBeGreaterThan(0);
      expect(content.metadata.theme).toBe("Fantasy");
    });

    it("should generate audiobook with narrative style", async () => {
      const request: ContentGenerationRequest = {
        type: "audiobook",
        title: "Adventure Story",
        tone: "dramatic and immersive",
      };

      const content = await contentGenerator.generateAudiobookChapter(request);

      expect(content.metadata.generatedBy).toBe("QUMUS ContentGenerator");
      expect(content.script).toContain("[PAUSE]") || expect(content.script.length).toBeGreaterThan(100);
    });
  });

  describe("Radio Show Generation", () => {
    it("should generate a radio show script", async () => {
      const request: ContentGenerationRequest = {
        type: "radio",
        title: "Morning Drive Show",
        topic: "Daily News",
      };

      const content = await contentGenerator.generateRadioShowScript(request);

      expect(content).toBeDefined();
      expect(content.type).toBe("radio");
      expect(content.title).toBe("Morning Drive Show");
      expect(content.status).toBe("generated");
      expect(content.script.length).toBeGreaterThan(0);
      expect(content.metadata.topic).toBe("Daily News");
    });

    it("should generate radio show with time codes", async () => {
      const request: ContentGenerationRequest = {
        type: "radio",
        title: "Evening Show",
        duration: 60,
      };

      const content = await contentGenerator.generateRadioShowScript(request);

      expect(content.duration).toBe(60);
      expect(content.script).toContain("[MUSIC]") || expect(content.script.length).toBeGreaterThan(100);
    });
  });

  describe("Content Management", () => {
    it("should retrieve generated content by ID", async () => {
      const request: ContentGenerationRequest = {
        type: "podcast",
        title: "Test Podcast",
      };

      const generated = await contentGenerator.generatePodcastEpisode(request);
      const retrieved = contentGenerator.getContent(generated.contentId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.contentId).toBe(generated.contentId);
      expect(retrieved?.title).toBe("Test Podcast");
    });

    it("should get all generated content", async () => {
      const podcast = await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Podcast 1",
      });

      const audiobook = await contentGenerator.generateAudiobookChapter({
        type: "audiobook",
        title: "Audiobook 1",
      });

      const allContent = contentGenerator.getAllContent();

      expect(allContent.length).toBeGreaterThanOrEqual(2);
      expect(allContent.some((c) => c.contentId === podcast.contentId)).toBe(true);
      expect(allContent.some((c) => c.contentId === audiobook.contentId)).toBe(true);
    });

    it("should filter content by type", async () => {
      await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Podcast 1",
      });

      await contentGenerator.generateAudiobookChapter({
        type: "audiobook",
        title: "Audiobook 1",
      });

      const podcasts = contentGenerator.getContentByType("podcast");
      const audiobooks = contentGenerator.getContentByType("audiobook");

      expect(podcasts.length).toBeGreaterThanOrEqual(1);
      expect(audiobooks.length).toBeGreaterThanOrEqual(1);
      expect(podcasts.every((c) => c.type === "podcast")).toBe(true);
      expect(audiobooks.every((c) => c.type === "audiobook")).toBe(true);
    });
  });

  describe("Content Status Management", () => {
    it("should approve content", async () => {
      const content = await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Test",
      });

      const success = contentGenerator.approveContent(content.contentId);
      const updated = contentGenerator.getContent(content.contentId);

      expect(success).toBe(true);
      expect(updated?.status).toBe("approved");
    });

    it("should publish content", async () => {
      const content = await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Test",
      });

      const success = contentGenerator.publishContent(content.contentId);
      const updated = contentGenerator.getContent(content.contentId);

      expect(success).toBe(true);
      expect(updated?.status).toBe("published");
    });

    it("should archive content", async () => {
      const content = await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Test",
      });

      const success = contentGenerator.archiveContent(content.contentId);
      const updated = contentGenerator.getContent(content.contentId);

      expect(success).toBe(true);
      expect(updated?.status).toBe("archived");
    });

    it("should delete content", async () => {
      const content = await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Test",
      });

      const success = contentGenerator.deleteContent(content.contentId);
      const retrieved = contentGenerator.getContent(content.contentId);

      expect(success).toBe(true);
      expect(retrieved).toBeUndefined();
    });
  });

  describe("Content Statistics", () => {
    it("should calculate content statistics", async () => {
      await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Podcast 1",
      });

      await contentGenerator.generateAudiobookChapter({
        type: "audiobook",
        title: "Audiobook 1",
      });

      const stats = contentGenerator.getStatistics();

      expect(stats.totalContent).toBeGreaterThanOrEqual(2);
      expect(stats.byType.podcast).toBeGreaterThanOrEqual(1);
      expect(stats.byType.audiobook).toBeGreaterThanOrEqual(1);
      expect(stats.averageConfidence).toBeGreaterThan(0);
      expect(stats.totalDuration).toBeGreaterThan(0);
    });

    it("should track content by status", async () => {
      const content = await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Test",
      });

      contentGenerator.approveContent(content.contentId);

      const stats = contentGenerator.getStatistics();

      expect(stats.byStatus.generated).toBeGreaterThanOrEqual(0);
      expect(stats.byStatus.approved).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Content Export", () => {
    it("should export all content as JSON", async () => {
      await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Test Podcast",
      });

      const exported = contentGenerator.exportContent();
      const parsed = JSON.parse(exported);

      expect(parsed.content).toBeDefined();
      expect(parsed.statistics).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
      expect(Array.isArray(parsed.content)).toBe(true);
    });

    it("should export single content by ID", async () => {
      const content = await contentGenerator.generatePodcastEpisode({
        type: "podcast",
        title: "Test",
      });

      const exported = contentGenerator.exportContent(content.contentId);
      const parsed = JSON.parse(exported);

      expect(parsed.contentId).toBe(content.contentId);
      expect(parsed.title).toBe("Test");
    });
  });

  describe("Content Caching", () => {
    it("should cache generated content", async () => {
      const request: ContentGenerationRequest = {
        type: "podcast",
        title: "Cached Podcast",
        topic: "Technology",
      };

      // Generate first time
      const content1 = await contentGenerator.generatePodcastEpisode(request);

      // Generate with same parameters (should use cache)
      const content2 = await contentGenerator.generatePodcastEpisode(request);

      // Both should have same script (from cache)
      expect(content1.script).toBe(content2.script);
    });

    it("should clear expired cache entries", () => {
      // This test verifies the cache clearing mechanism exists
      const initialStats = contentGenerator.getStatistics();

      contentGenerator.clearExpiredCache();

      const afterStats = contentGenerator.getStatistics();

      // Stats should still be valid after cache clear
      expect(afterStats).toBeDefined();
      expect(afterStats.totalContent).toBeGreaterThanOrEqual(0);
    });
  });
});
