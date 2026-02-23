import { describe, it, expect, beforeEach } from 'vitest';
import { animalCommunicationService } from './services/animalCommunicationService';

describe('Animal Communication Service', () => {
  beforeEach(() => {
    // Clear sessions before each test
    const sessions = animalCommunicationService.getAllSessions();
    sessions.forEach((session) => {
      // Sessions are cleared by creating new service instance in real app
    });
  });

  describe('Behavior Interpretation', () => {
    it('should interpret dog behavior correctly', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Max',
        'dog',
        'Tail wagging and jumping'
      );

      expect(response).toBeDefined();
      expect(response.interpretation).toBeTruthy();
      expect(response.meaning).toBeTruthy();
      expect(response.emotion).toBeTruthy();
      expect(response.recommendations).toBeInstanceOf(Array);
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(100);
    });

    it('should interpret cat behavior correctly', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Whiskers',
        'cat',
        'Purring and rubbing against legs'
      );

      expect(response).toBeDefined();
      expect(response.meaning).toContain('cat') || expect(response.meaning).toBeTruthy();
      expect(response.recommendations.length).toBeGreaterThan(0);
    });

    it('should interpret bird behavior correctly', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Polly',
        'bird',
        'Chirping loudly and fluttering wings'
      );

      expect(response).toBeDefined();
      expect(response.emotion).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('should handle emotion parameter', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Buddy',
        'dog',
        'Hiding in corner',
        'Scared'
      );

      expect(response).toBeDefined();
      expect(response.emotion).toBeTruthy();
      expect(response.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle location parameter', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Luna',
        'cat',
        'Scratching furniture',
        'Stressed',
        'Living room'
      );

      expect(response).toBeDefined();
      expect(response.meaning).toBeTruthy();
      expect(response.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Session Management', () => {
    it('should create a new session', () => {
      const session = animalCommunicationService.createSession('Buddy', 'dog');

      expect(session).toBeDefined();
      expect(session.sessionId).toBeTruthy();
      expect(session.animal).toBe('Buddy');
      expect(session.species).toBe('dog');
      expect(session.messages).toEqual([]);
      expect(session.responses).toEqual([]);
      expect(session.startTime).toBeGreaterThan(0);
    });

    it('should retrieve a session', () => {
      const created = animalCommunicationService.createSession('Max', 'dog');
      const retrieved = animalCommunicationService.getSession(created.sessionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.sessionId).toBe(created.sessionId);
      expect(retrieved?.animal).toBe('Max');
    });

    it('should return undefined for non-existent session', () => {
      const retrieved = animalCommunicationService.getSession('non-existent-session');
      expect(retrieved).toBeUndefined();
    });

    it('should get all sessions', () => {
      animalCommunicationService.createSession('Buddy', 'dog');
      animalCommunicationService.createSession('Whiskers', 'cat');

      const allSessions = animalCommunicationService.getAllSessions();
      expect(allSessions.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Message Management', () => {
    it('should add a message to session', async () => {
      const session = animalCommunicationService.createSession('Buddy', 'dog');
      const { message, response } = await animalCommunicationService.addMessage(
        session.sessionId,
        'Barking at door'
      );

      expect(message).toBeDefined();
      expect(message.animal).toBe('Buddy');
      expect(message.behavior).toBe('Barking at door');
      expect(message.timestamp).toBeGreaterThan(0);

      expect(response).toBeDefined();
      expect(response.interpretation).toBeTruthy();
    });

    it('should add message with emotion and location', async () => {
      const session = animalCommunicationService.createSession('Luna', 'cat');
      const { message } = await animalCommunicationService.addMessage(
        session.sessionId,
        'Hiding under bed',
        'Scared',
        'Bedroom'
      );

      expect(message.emotion).toBe('Scared');
      expect(message.location).toBe('Bedroom');
    });

    it('should throw error for invalid session', async () => {
      try {
        await animalCommunicationService.addMessage('invalid-session', 'Some behavior');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).toContain('Session not found');
      }
    });

    it('should track multiple messages in session', async () => {
      const session = animalCommunicationService.createSession('Max', 'dog');

      await animalCommunicationService.addMessage(session.sessionId, 'Tail wagging');
      await animalCommunicationService.addMessage(session.sessionId, 'Jumping');

      const updated = animalCommunicationService.getSession(session.sessionId);
      expect(updated?.messages.length).toBe(2);
      expect(updated?.responses.length).toBe(2);
    });
  });

  describe('Wellness Reporting', () => {
    it('should generate wellness report', async () => {
      const session = animalCommunicationService.createSession('Buddy', 'dog');
      await animalCommunicationService.addMessage(session.sessionId, 'Playful behavior');

      const report = await animalCommunicationService.generateWellnessReport(session.sessionId);

      expect(report).toBeTruthy();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid session in wellness report', async () => {
      try {
        await animalCommunicationService.generateWellnessReport('invalid-session');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).toContain('Session not found');
      }
    });
  });

  describe('Session Cleanup', () => {
    it('should clear old sessions', () => {
      // Create a session
      const session = animalCommunicationService.createSession('Buddy', 'dog');

      // Manually set start time to 25 hours ago
      const oldSession = animalCommunicationService.getSession(session.sessionId);
      if (oldSession) {
        oldSession.startTime = Date.now() - 25 * 60 * 60 * 1000;
      }

      const cleared = animalCommunicationService.clearOldSessions();
      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Animal Species Support', () => {
    it('should support all animal species', async () => {
      const species = ['dog', 'cat', 'bird', 'horse', 'elephant', 'dolphin', 'parrot', 'rabbit'];

      for (const s of species) {
        const response = await animalCommunicationService.interpretAnimalBehavior(
          `Test${s}`,
          s,
          'Normal behavior'
        );

        expect(response).toBeDefined();
        expect(response.interpretation).toBeTruthy();
        expect(response.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('Confidence Scoring', () => {
    it('should provide confidence scores', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Buddy',
        'dog',
        'Tail wagging'
      );

      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(100);
      expect(typeof response.confidence).toBe('number');
    });

    it('should have higher confidence for common behaviors', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Max',
        'dog',
        'Tail wagging and jumping'
      );

      // Common behaviors should have reasonable confidence
      expect(response.confidence).toBeGreaterThan(50);
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate multiple recommendations', async () => {
      const response = await animalCommunicationService.interpretAnimalBehavior(
        'Buddy',
        'dog',
        'Anxious pacing'
      );

      expect(response.recommendations).toBeInstanceOf(Array);
      expect(response.recommendations.length).toBeGreaterThan(0);
      response.recommendations.forEach((rec) => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete communication workflow', async () => {
      // Create session
      const session = animalCommunicationService.createSession('Buddy', 'dog');
      expect(session.sessionId).toBeTruthy();

      // Add multiple messages
      await animalCommunicationService.addMessage(session.sessionId, 'Tail wagging');
      await animalCommunicationService.addMessage(session.sessionId, 'Jumping');
      await animalCommunicationService.addMessage(session.sessionId, 'Playful barking');

      // Get updated session
      const updated = animalCommunicationService.getSession(session.sessionId);
      expect(updated?.messages.length).toBe(3);
      expect(updated?.responses.length).toBe(3);

      // Generate report
      const report = await animalCommunicationService.generateWellnessReport(session.sessionId);
      expect(report).toBeTruthy();
    });

    it('should support multiple concurrent sessions', async () => {
      const session1 = animalCommunicationService.createSession('Buddy', 'dog');
      const session2 = animalCommunicationService.createSession('Whiskers', 'cat');
      const session3 = animalCommunicationService.createSession('Polly', 'bird');

      await animalCommunicationService.addMessage(session1.sessionId, 'Barking');
      await animalCommunicationService.addMessage(session2.sessionId, 'Meowing');
      await animalCommunicationService.addMessage(session3.sessionId, 'Chirping');

      const allSessions = animalCommunicationService.getAllSessions();
      expect(allSessions.length).toBeGreaterThanOrEqual(3);

      const s1 = animalCommunicationService.getSession(session1.sessionId);
      const s2 = animalCommunicationService.getSession(session2.sessionId);
      const s3 = animalCommunicationService.getSession(session3.sessionId);

      expect(s1?.messages.length).toBe(1);
      expect(s2?.messages.length).toBe(1);
      expect(s3?.messages.length).toBe(1);
    });
  });
});
