import { describe, it, expect } from 'vitest';
import { getContentScheduler } from './services/contentSchedulerService';
import { rrbRadioService } from './_core/rrbRadioService';
import { contentRecommendationService } from './services/contentRecommendationService';

describe('Session 3: Final Production Pass', () => {
  describe('Content Scheduler - 24/7 Coverage', () => {
    const scheduler = getContentScheduler();

    it('should have 62 schedule slots across all channels', () => {
      const slots = scheduler.getScheduleSlots();
      expect(slots.length).toBe(62);
    });

    it('should have 7 active channels', () => {
      const channels = scheduler.getChannels();
      expect(channels.length).toBe(7);
      expect(channels.filter(c => c.status === 'active').length).toBe(7);
    });

    it('should have RRB Main Radio with full day coverage', () => {
      const slots = scheduler.getSlotsByChannel('ch-001');
      expect(slots.length).toBeGreaterThanOrEqual(7);
      const overnight = slots.find(s => s.startTime === '00:00' && s.endTime === '06:00');
      expect(overnight).toBeDefined();
    });

    it('should have Emergency Broadcast with 24/7 standby', () => {
      const slots = scheduler.getSlotsByChannel('ch-004');
      expect(slots.length).toBe(4);
      slots.forEach(slot => {
        expect(slot.contentType).toBe('emergency');
        expect(slot.priority).toBe(10);
      });
    });

    it('should have Drop Radio 432Hz with Solfeggio frequency programming', () => {
      const slots = scheduler.getSlotsByChannel('ch-007');
      expect(slots.length).toBe(8);
      const freqSlots = slots.filter(s => s.title.includes('Hz'));
      expect(freqSlots.length).toBeGreaterThanOrEqual(7);
    });

    it('should have commercial breaks across channels', () => {
      const slots = scheduler.getScheduleSlots().filter(s => s.contentType === 'commercial');
      expect(slots.length).toBeGreaterThanOrEqual(10);
    });

    it('scheduler should start and report status', () => {
      scheduler.start();
      const status = scheduler.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.activeChannels).toBe(7);
      expect(status.totalSlots).toBe(62);
      expect(status.autonomyLevel).toBe(90);
    });
  });

  describe('Router Stubs', () => {
    it('contentRecommendationService should return recommendations', async () => {
      const recs = await contentRecommendationService.getRecommendations('test-user', 5);
      expect(Array.isArray(recs)).toBe(true);
    });

    it('rrbRadioService should return broadcast stats', async () => {
      const stats = await rrbRadioService.getBroadcastStats();
      expect(stats).toHaveProperty('totalBroadcasts');
      expect(stats).toHaveProperty('liveBroadcasts');
    });
  });

  describe('Icon and Asset Configuration', () => {
    it('should use CDN URLs for icons in index.html', async () => {
      const fs = await import('fs');
      const html = fs.readFileSync('client/index.html', 'utf-8');
      expect(html).not.toContain('href="/icon-192.png"');
      expect(html).not.toContain('href="/favicon.ico"');
      expect(html).toContain('manuscdn.com');
    });

    it('manifest.json should use CDN URLs for icons', async () => {
      const fs = await import('fs');
      const manifest = JSON.parse(fs.readFileSync('client/public/manifest.json', 'utf-8'));
      manifest.icons.forEach((icon: { src: string }) => {
        expect(icon.src).toContain('manuscdn.com');
      });
    });
  });
});
