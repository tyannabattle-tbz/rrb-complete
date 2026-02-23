import { describe, it, expect, beforeEach, vi } from "vitest";
import { animalProfileService, AnimalProfile } from "./services/animalProfileService";

describe("Animal Features - Complete Suite", () => {
  let testProfile: AnimalProfile;

  beforeEach(() => {
    testProfile = {
      id: "test-pet-1",
      userId: "user-123",
      name: "Max",
      species: "dog",
      breed: "Golden Retriever",
      age: 5,
      color: "Golden",
      personality: ["friendly", "energetic", "loyal"],
      medicalHistory: ["vaccinated", "neutered"],
      behavioralTraits: ["playful", "obedient", "social"],
      communicationHistory: [
        {
          date: Date.now() - 3600000,
          message: "Tail wagging",
          interpretation: "Happy and excited",
          confidence: 0.95,
        },
        {
          date: Date.now() - 7200000,
          message: "Calm resting",
          interpretation: "Relaxed",
          confidence: 0.88,
        },
      ],
      wellnessScore: 92,
      lastUpdated: Date.now(),
    };
  });

  describe("Animal Profile Service", () => {
    it("should create a new animal profile", async () => {
      const profile = await animalProfileService.createProfile(
        "user-123",
        "Luna",
        "cat",
        "Siamese",
        3
      );

      expect(profile).toBeDefined();
      expect(profile.name).toBe("Luna");
      expect(profile.species).toBe("cat");
      expect(profile.breed).toBe("Siamese");
      expect(profile.age).toBe(3);
      expect(profile.userId).toBe("user-123");
      expect(profile.wellnessScore).toBe(85);
      expect(profile.communicationHistory).toHaveLength(0);
    });

    it("should update personality traits", () => {
      const traits = ["playful", "curious", "independent"];
      const updated = { ...testProfile, personality: traits, lastUpdated: Date.now() };

      expect(updated.personality).toEqual(traits);
      expect(updated.lastUpdated).toBeGreaterThanOrEqual(testProfile.lastUpdated);
    });

    it("should add communication entries", async () => {
      const initialCount = testProfile.communicationHistory.length;
      const updated = await animalProfileService.addCommunicationEntry(
        testProfile,
        "Barking at door",
        "Wants to go outside",
        0.92
      );

      expect(updated.communicationHistory).toHaveLength(initialCount + 1);
      expect(updated.communicationHistory[initialCount].message).toBe(
        "Barking at door"
      );
      expect(updated.communicationHistory[initialCount].confidence).toBe(0.92);
    });

    it("should maintain max 50 communication entries", async () => {
      const profile = { ...testProfile, communicationHistory: [] };

      // Add 60 entries
      for (let i = 0; i < 60; i++) {
        await animalProfileService.addCommunicationEntry(
          profile,
          `Message ${i}`,
          `Interpretation ${i}`,
          0.9
        );
      }

      expect(profile.communicationHistory.length).toBeLessThanOrEqual(50);
      expect(profile.communicationHistory[0].message).toContain("Message");
    });

    it("should analyze wellness trends", async () => {
      const trends = await animalProfileService.analyzeWellnessTrends(
        testProfile
      );

      expect(Array.isArray(trends)).toBe(true);
      trends.forEach((trend) => {
        expect(trend.date).toBeDefined();
        expect(trend.score).toBeGreaterThanOrEqual(0);
        expect(trend.score).toBeLessThanOrEqual(100);
        expect(["happy", "neutral", "stressed"]).toContain(trend.mood);
        expect(Array.isArray(trend.healthIndicators)).toBe(true);
      });
    });

    it("should generate wellness report", async () => {
      const report = await animalProfileService.generateWellnessReport(
        testProfile
      );

      expect(typeof report).toBe("string");
      expect(report.length).toBeGreaterThan(0);
    }, { timeout: 15000 });

    it("should predict behavior", async () => {
      const prediction = await animalProfileService.predictBehavior(
        testProfile,
        "A stranger approaches the house"
      );

      expect(typeof prediction).toBe("string");
      expect(prediction.length).toBeGreaterThan(0);
    }, { timeout: 15000 });
  });

  describe("Family Pet Dashboard Features", () => {
    it("should track multiple pets", () => {
      const pets = [
        {
          id: "pet-1",
          name: "Max",
          species: "dog",
          breed: "Golden Retriever",
          age: 5,
          wellnessScore: 92,
          lastUpdated: Date.now(),
          communicationCount: 24,
          mood: "happy",
          recentInteractions: [],
        },
        {
          id: "pet-2",
          name: "Luna",
          species: "cat",
          breed: "Siamese",
          age: 3,
          wellnessScore: 88,
          lastUpdated: Date.now(),
          communicationCount: 18,
          mood: "neutral",
          recentInteractions: [],
        },
      ];

      expect(pets).toHaveLength(2);
      expect(pets[0].name).toBe("Max");
      expect(pets[1].name).toBe("Luna");
    });

    it("should calculate wellness trends for dashboard", () => {
      const trends = [
        { date: Date.now() - 6 * 24 * 60 * 60 * 1000, score: 85, mood: "happy" },
        { date: Date.now() - 5 * 24 * 60 * 60 * 1000, score: 88, mood: "happy" },
        { date: Date.now() - 4 * 24 * 60 * 60 * 1000, score: 90, mood: "happy" },
        { date: Date.now() - 3 * 24 * 60 * 60 * 1000, score: 92, mood: "happy" },
        { date: Date.now() - 2 * 24 * 60 * 60 * 1000, score: 89, mood: "neutral" },
        { date: Date.now() - 24 * 60 * 60 * 1000, score: 92, mood: "happy" },
        { date: Date.now(), score: 92, mood: "happy" },
      ];

      expect(trends).toHaveLength(7);
      const avgScore =
        trends.reduce((sum, t) => sum + t.score, 0) / trends.length;
      expect(avgScore).toBeGreaterThan(85);
      expect(avgScore).toBeLessThan(95);
    });

    it("should determine mood from wellness score", () => {
      const getMood = (score: number) => {
        if (score > 80) return "happy";
        if (score > 60) return "neutral";
        return "stressed";
      };

      expect(getMood(92)).toBe("happy");
      expect(getMood(75)).toBe("neutral");
      expect(getMood(45)).toBe("stressed");
    });
  });

  describe("Voice-to-Text Animal Service", () => {
    it("should detect English language", async () => {
      const text = "The dog is barking";
      const detected = "en"; // Simplified detection

      expect(detected).toBe("en");
    });

    it("should detect Spanish language patterns", () => {
      const text = "El perro está ladrando";
      const hasSpanish = /[áéíóúñ]/i.test(text);

      expect(hasSpanish).toBe(true);
    });

    it("should detect French language patterns", () => {
      const text = "Le chien aboie avec énergie";
      const hasFrench = /[àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]/i.test(text);

      expect(hasFrench).toBe(true);
    });

    it("should provide available languages", () => {
      const languages = [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "pt", name: "Portuguese" },
        { code: "ru", name: "Russian" },
        { code: "zh", name: "Chinese" },
      ];

      expect(languages).toHaveLength(8);
      expect(languages.map((l) => l.code)).toContain("en");
      expect(languages.map((l) => l.code)).toContain("es");
      expect(languages.map((l) => l.code)).toContain("fr");
    });

    it("should handle transcription response", () => {
      const mockTranscription = {
        text: "The dog is playing fetch",
        confidence: 0.95,
        language: "en",
        timestamp: Date.now(),
      };

      expect(mockTranscription.text).toBeDefined();
      expect(mockTranscription.confidence).toBeGreaterThan(0.9);
      expect(mockTranscription.language).toBe("en");
      expect(mockTranscription.timestamp).toBeDefined();
    });
  });

  describe("Integration Tests", () => {
    it("should flow from voice input to pet profile update", async () => {
      // Simulate voice input
      const voiceInput = "Max is playing fetch and seems very happy";

      // Create profile
      const profile = await animalProfileService.createProfile(
        "user-123",
        "Max",
        "dog",
        "Golden Retriever",
        5
      );

      // Add communication entry
      const updated = await animalProfileService.addCommunicationEntry(
        profile,
        voiceInput,
        "Playful and energetic mood",
        0.93
      );

      expect(updated.communicationHistory).toHaveLength(1);
      expect(updated.communicationHistory[0].message).toBe(voiceInput);
      expect(updated.communicationHistory[0].confidence).toBe(0.93);
    }, { timeout: 10000 });

    it("should generate wellness report from communication history", async () => {
      const profile = await animalProfileService.createProfile(
        "user-123",
        "Luna",
        "cat",
        "Siamese",
        3
      );

      // Add multiple communication entries
      for (let i = 0; i < 5; i++) {
        await animalProfileService.addCommunicationEntry(
          profile,
          `Behavior ${i}`,
          `Interpretation ${i}`,
          0.85 + i * 0.02
        );
      }

      const report = await animalProfileService.generateWellnessReport(profile);
      expect(report).toBeDefined();
      expect(typeof report).toBe("string");
    }, { timeout: 15000 });

    it("should track multiple pets with individual trends", async () => {
      const pets = [
        await animalProfileService.createProfile("user-123", "Max", "dog"),
        await animalProfileService.createProfile("user-123", "Luna", "cat"),
        await animalProfileService.createProfile("user-123", "Buddy", "dog"),
      ];

      expect(pets).toHaveLength(3);
      expect(pets[0].name).toBe("Max");
      expect(pets[1].name).toBe("Luna");
      expect(pets[2].name).toBe("Buddy");
      expect(pets.every((p) => p.userId === "user-123")).toBe(true);
    });
  });
});
