/**
 * QUMUS Trending Promotion Engine Tests
 * Tests the autonomous track promotion logic
 */
import { describe, it, expect } from 'vitest';
import {
  calculateTrendScore,
  calculateVelocity,
  getBestPromotionSlot,
  calculateConfidence,
  analyzeTrending,
  generatePromotionDecisions,
  getSlotLabel,
  getSlotPriority,
  getAllSlots,
  DEFAULT_PROMOTION_POLICY,
  type TrackPlayData,
} from './qumusTrendingEngine';

// ============================================================
// TEST DATA
// ============================================================
const now = Date.now();
const oneHourAgo = new Date(now - 3600_000).toISOString();
const sixHoursAgo = new Date(now - 6 * 3600_000).toISOString();
const oneDayAgo = new Date(now - 24 * 3600_000).toISOString();
const threeDaysAgo = new Date(now - 72 * 3600_000).toISOString();

const sampleTracks: TrackPlayData[] = [
  { track_id: 't1', title: 'Candy Hunter Theme', artist: 'Seabrun', play_count: 25, last_played_at: oneHourAgo },
  { track_id: 't2', title: 'Boogie Nights', artist: 'Seabrun', play_count: 15, last_played_at: sixHoursAgo },
  { track_id: 't3', title: 'Drop Radio Vibes', artist: 'DJ Sol', play_count: 8, last_played_at: oneDayAgo },
  { track_id: 't4', title: 'Legacy Restored', artist: 'Canryn', play_count: 2, last_played_at: threeDaysAgo },
  { track_id: 't5', title: 'Silent Track', artist: 'Nobody', play_count: 0, last_played_at: null },
];

// ============================================================
// TESTS
// ============================================================

describe('QUMUS Trending Promotion Engine', () => {
  describe('calculateTrendScore', () => {
    it('should return higher score for tracks with more plays', () => {
      const score1 = calculateTrendScore(sampleTracks[0], sampleTracks); // 25 plays
      const score2 = calculateTrendScore(sampleTracks[2], sampleTracks); // 8 plays
      expect(score1).toBeGreaterThan(score2);
    });

    it('should return higher score for recently played tracks', () => {
      const recentTrack: TrackPlayData = {
        track_id: 'recent', title: 'Recent', artist: 'A', play_count: 10, last_played_at: oneHourAgo,
      };
      const oldTrack: TrackPlayData = {
        track_id: 'old', title: 'Old', artist: 'A', play_count: 10, last_played_at: threeDaysAgo,
      };
      const allTracks = [recentTrack, oldTrack];
      const recentScore = calculateTrendScore(recentTrack, allTracks);
      const oldScore = calculateTrendScore(oldTrack, allTracks);
      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should return a score between 0 and 100', () => {
      for (const track of sampleTracks) {
        const score = calculateTrendScore(track, sampleTracks);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('calculateVelocity', () => {
    it('should return 0 for tracks with no plays', () => {
      expect(calculateVelocity(sampleTracks[4])).toBe(0);
    });

    it('should return higher velocity for recent high-play tracks', () => {
      const v1 = calculateVelocity(sampleTracks[0]); // 25 plays, 1hr ago
      const v2 = calculateVelocity(sampleTracks[2]); // 8 plays, 24hr ago
      expect(v1).toBeGreaterThan(v2);
    });

    it('should return a positive number for played tracks', () => {
      const velocity = calculateVelocity(sampleTracks[0]);
      expect(velocity).toBeGreaterThan(0);
    });
  });

  describe('getBestPromotionSlot', () => {
    it('should assign top-of-the-sol for highest scores', () => {
      expect(getBestPromotionSlot(85)).toBe('top-of-the-sol');
    });

    it('should assign drive-time for high scores', () => {
      expect(getBestPromotionSlot(65)).toBe('drive-time');
    });

    it('should assign evening-lounge for medium scores', () => {
      expect(getBestPromotionSlot(45)).toBe('evening-lounge');
    });

    it('should assign afternoon-blend for lower scores', () => {
      expect(getBestPromotionSlot(25)).toBe('afternoon-blend');
    });

    it('should assign late-sol for lowest scores', () => {
      expect(getBestPromotionSlot(10)).toBe('late-sol');
    });
  });

  describe('calculateConfidence', () => {
    it('should return higher confidence for tracks with more plays', () => {
      const c1 = calculateConfidence(sampleTracks[0], 80, sampleTracks);
      const c2 = calculateConfidence(sampleTracks[3], 20, sampleTracks);
      expect(c1).toBeGreaterThan(c2);
    });

    it('should return confidence between 0 and 100', () => {
      const conf = calculateConfidence(sampleTracks[0], 80, sampleTracks);
      expect(conf).toBeGreaterThanOrEqual(0);
      expect(conf).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeTrending', () => {
    it('should filter out tracks below minimum play count', () => {
      const result = analyzeTrending(sampleTracks, DEFAULT_PROMOTION_POLICY);
      // track_id t4 has 2 plays, below default minPlayCount of 3
      const hasLowPlayTrack = result.some(t => t.trackId === 't4');
      expect(hasLowPlayTrack).toBe(false);
    });

    it('should return empty array for empty input', () => {
      expect(analyzeTrending([], DEFAULT_PROMOTION_POLICY)).toEqual([]);
    });

    it('should sort by trend score descending', () => {
      const result = analyzeTrending(sampleTracks, DEFAULT_PROMOTION_POLICY);
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].trendScore).toBeGreaterThanOrEqual(result[i].trendScore);
      }
    });

    it('should respect maxPromotionsPerCycle', () => {
      const policy = { ...DEFAULT_PROMOTION_POLICY, maxPromotionsPerCycle: 2 };
      const result = analyzeTrending(sampleTracks, policy);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should include reason text for trending tracks', () => {
      const result = analyzeTrending(sampleTracks, DEFAULT_PROMOTION_POLICY);
      for (const track of result) {
        expect(track.reason).toBeTruthy();
        expect(typeof track.reason).toBe('string');
      }
    });
  });

  describe('generatePromotionDecisions', () => {
    it('should auto-approve decisions above threshold', () => {
      const trending = analyzeTrending(sampleTracks, DEFAULT_PROMOTION_POLICY);
      const decisions = generatePromotionDecisions(trending, DEFAULT_PROMOTION_POLICY);
      for (const decision of decisions) {
        if (decision.confidence >= DEFAULT_PROMOTION_POLICY.autoApproveThreshold) {
          expect(decision.status).toBe('auto_approved');
          expect(decision.autonomyLevel).toBe(90);
        }
      }
    });

    it('should mark low-confidence decisions as pending_review', () => {
      const lowConfTrending = [{
        trackId: 't3', title: 'Low Conf', artist: 'Test',
        playCount: 3, velocity: 0.1, trendScore: 20,
        promotionSlot: 'late-sol', confidence: 30, reason: 'Test',
      }];
      const decisions = generatePromotionDecisions(lowConfTrending, DEFAULT_PROMOTION_POLICY);
      expect(decisions[0].status).toBe('pending_review');
      expect(decisions[0].autonomyLevel).toBe(50);
    });

    it('should generate unique decision IDs', () => {
      const trending = analyzeTrending(sampleTracks, DEFAULT_PROMOTION_POLICY);
      const decisions = generatePromotionDecisions(trending, DEFAULT_PROMOTION_POLICY);
      const ids = decisions.map(d => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should set type to track_promotion', () => {
      const trending = analyzeTrending(sampleTracks, DEFAULT_PROMOTION_POLICY);
      const decisions = generatePromotionDecisions(trending, DEFAULT_PROMOTION_POLICY);
      for (const d of decisions) {
        expect(d.type).toBe('track_promotion');
      }
    });
  });

  describe('Slot utilities', () => {
    it('getSlotLabel should return label for known slots', () => {
      expect(getSlotLabel('top-of-the-sol')).toContain('Top of the Sol');
    });

    it('getSlotLabel should return id for unknown slots', () => {
      expect(getSlotLabel('unknown-slot')).toBe('unknown-slot');
    });

    it('getSlotPriority should return priority for known slots', () => {
      expect(getSlotPriority('top-of-the-sol')).toBe(100);
      expect(getSlotPriority('drive-time')).toBe(95);
    });

    it('getSlotPriority should return 50 for unknown slots', () => {
      expect(getSlotPriority('unknown')).toBe(50);
    });

    it('getAllSlots should return all 7 schedule slots sorted by priority', () => {
      const slots = getAllSlots();
      expect(slots.length).toBe(7);
      expect(slots[0].id).toBe('top-of-the-sol');
      // Verify sorted descending
      for (let i = 1; i < slots.length; i++) {
        expect(slots[i - 1].priority).toBeGreaterThanOrEqual(slots[i].priority);
      }
    });
  });

  describe('DEFAULT_PROMOTION_POLICY', () => {
    it('should have Top of the Sol as first prime-time slot', () => {
      expect(DEFAULT_PROMOTION_POLICY.primeTimeSlots[0]).toBe('top-of-the-sol');
    });

    it('should have reasonable defaults', () => {
      expect(DEFAULT_PROMOTION_POLICY.minPlayCount).toBeGreaterThan(0);
      expect(DEFAULT_PROMOTION_POLICY.autoApproveThreshold).toBeGreaterThan(50);
      expect(DEFAULT_PROMOTION_POLICY.maxPromotionsPerCycle).toBeGreaterThan(0);
      expect(DEFAULT_PROMOTION_POLICY.cooldownMinutes).toBeGreaterThan(0);
    });
  });
});
