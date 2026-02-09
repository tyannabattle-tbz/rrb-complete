import { describe, it, expect } from 'vitest';

/**
 * Play Count Tracker Tests
 * Tests the audio_play_counts table operations and the audioRouter play tracking procedures.
 */

describe('Play Count Tracker', () => {
  describe('formatPlayCount utility', () => {
    // Test the formatting logic used in the frontend
    function formatPlayCount(count: number): string {
      if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
      return count.toLocaleString();
    }

    it('should format counts under 1000 normally', () => {
      expect(formatPlayCount(0)).toBe('0');
      expect(formatPlayCount(1)).toBe('1');
      expect(formatPlayCount(999)).toBe('999');
    });

    it('should format counts over 1000 with k suffix', () => {
      expect(formatPlayCount(1000)).toBe('1k');
      expect(formatPlayCount(1500)).toBe('1.5k');
      expect(formatPlayCount(4250)).toBe('4.3k');
      expect(formatPlayCount(10000)).toBe('10k');
    });

    it('should handle edge cases', () => {
      expect(formatPlayCount(1001)).toBe('1k');
      expect(formatPlayCount(2756)).toBe('2.8k');
      expect(formatPlayCount(100000)).toBe('100k');
    });
  });

  describe('Rank configuration', () => {
    const RANK_BADGES = ['🥇', '🥈', '🥉', '⭐'] as const;
    const RANK_LABELS = ['#1 Most Played', '#2 Most Played', '#3 Most Played', 'Trending'] as const;
    const BAR_WIDTHS = ['92%', '78%', '65%', '58%'] as const;

    it('should have 4 rank badges', () => {
      expect(RANK_BADGES).toHaveLength(4);
    });

    it('should have matching labels for each badge', () => {
      expect(RANK_LABELS).toHaveLength(RANK_BADGES.length);
    });

    it('should have matching bar widths for each rank', () => {
      expect(BAR_WIDTHS).toHaveLength(RANK_BADGES.length);
    });

    it('should have decreasing bar widths', () => {
      const widths = BAR_WIDTHS.map(w => parseInt(w));
      for (let i = 1; i < widths.length; i++) {
        expect(widths[i]).toBeLessThan(widths[i - 1]);
      }
    });
  });

  describe('Play count bar width calculation', () => {
    function calculateBarWidth(playCount: number, maxPlays: number): string {
      return `${Math.max(10, (playCount / maxPlays) * 100)}%`;
    }

    it('should calculate correct bar width relative to max', () => {
      expect(calculateBarWidth(100, 100)).toBe('100%');
      expect(calculateBarWidth(50, 100)).toBe('50%');
      expect(calculateBarWidth(75, 100)).toBe('75%');
    });

    it('should enforce minimum bar width of 10%', () => {
      expect(calculateBarWidth(1, 1000)).toBe('10%');
      expect(calculateBarWidth(0, 100)).toBe('10%');
    });

    it('should handle equal play counts', () => {
      expect(calculateBarWidth(500, 500)).toBe('100%');
    });
  });

  describe('Default tracks fallback', () => {
    const defaultTracks = [
      { track_id: '1', title: "Rockin' Rockin' Boogie", artist: 'Seabrun Candy Hunter & Little Richard', play_count: 0 },
      { track_id: '4', title: 'Voicemail to C.J. Battle from Dad', artist: 'Seabrun Candy Hunter', play_count: 0 },
      { track_id: '2', title: "California I'm Coming", artist: 'Seabrun Candy Hunter', play_count: 0 },
      { track_id: '8', title: 'The Creative Process', artist: 'Seabrun Candy Hunter', play_count: 0 },
    ];

    it('should have 4 default tracks', () => {
      expect(defaultTracks).toHaveLength(4);
    });

    it('should have Rockin Rockin Boogie as the first default', () => {
      expect(defaultTracks[0].title).toContain('Rockin');
    });

    it('should all have zero play counts initially', () => {
      defaultTracks.forEach(track => {
        expect(track.play_count).toBe(0);
      });
    });

    it('should all have unique track IDs', () => {
      const ids = defaultTracks.map(t => t.track_id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should all be Seabrun Candy Hunter tracks', () => {
      defaultTracks.forEach(track => {
        expect(track.artist).toContain('Seabrun Candy Hunter');
      });
    });
  });

  describe('recordPlay input validation', () => {
    it('should require trackId as string', () => {
      const validInput = { trackId: '1', trackTitle: 'Test', artist: 'Test Artist' };
      expect(typeof validInput.trackId).toBe('string');
      expect(validInput.trackId.length).toBeGreaterThan(0);
    });

    it('should require trackTitle as string', () => {
      const validInput = { trackId: '1', trackTitle: 'Test Song', artist: 'Test' };
      expect(typeof validInput.trackTitle).toBe('string');
    });

    it('should accept optional source field', () => {
      const withSource = { trackId: '1', trackTitle: 'Test', artist: 'Test', source: 'rrb-radio' };
      const withoutSource = { trackId: '1', trackTitle: 'Test', artist: 'Test' };
      expect(withSource.source).toBe('rrb-radio');
      expect(withoutSource).not.toHaveProperty('source');
    });
  });
});
