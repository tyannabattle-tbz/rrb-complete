/**
 * Media Blast Campaign Router Tests
 * Tests campaign data, post scheduling, commercial management, and QUMUS automation
 */

import { describe, it, expect } from 'vitest';

// Import the router to test its procedures
import { mediaBlastRouter } from './mediaBlastRouter';

describe('Media Blast Campaign Router', () => {
  describe('getCampaigns', () => {
    it('should return list of campaigns', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const campaigns = await caller.getCampaigns();
      
      expect(campaigns).toBeDefined();
      expect(Array.isArray(campaigns)).toBe(true);
      expect(campaigns.length).toBeGreaterThan(0);
      
      const csw70 = campaigns.find(c => c.id === 'csw70-2026');
      expect(csw70).toBeDefined();
      expect(csw70!.name).toBe('UN CSW70 Media Blast');
      expect(csw70!.status).toBe('active');
      expect(csw70!.platforms.length).toBe(8);
    });

    it('should include post and commercial counts', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const campaigns = await caller.getCampaigns();
      const csw70 = campaigns[0];
      
      expect(csw70.postCount).toBeGreaterThan(0);
      expect(csw70.commercialCount).toBe(3);
      expect(csw70.automationEnabled).toBe(true);
    });
  });

  describe('getCampaign', () => {
    it('should return full campaign details for CSW70', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const campaign = await caller.getCampaign({ campaignId: 'csw70-2026' });
      
      expect(campaign).toBeDefined();
      expect(campaign!.id).toBe('csw70-2026');
      expect(campaign!.name).toBe('UN CSW70 Media Blast');
      expect(campaign!.description).toContain('Commission on the Status of Women');
      expect(campaign!.platforms).toContain('youtube');
      expect(campaign!.platforms).toContain('facebook');
      expect(campaign!.platforms).toContain('instagram');
      expect(campaign!.platforms).toContain('twitch');
      expect(campaign!.platforms).toContain('rumble');
      expect(campaign!.platforms).toContain('linkedin');
      expect(campaign!.platforms).toContain('tiktok');
      expect(campaign!.platforms).toContain('x');
    });

    it('should return null for non-existent campaign', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const campaign = await caller.getCampaign({ campaignId: 'non-existent' });
      expect(campaign).toBeNull();
    });
  });

  describe('getCampaignPosts', () => {
    it('should return all posts for CSW70 campaign', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const posts = await caller.getCampaignPosts({ campaignId: 'csw70-2026' });
      
      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
    });

    it('should filter posts by platform', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const youtubePosts = await caller.getCampaignPosts({ campaignId: 'csw70-2026', platform: 'youtube' });
      
      expect(youtubePosts.length).toBeGreaterThan(0);
      expect(youtubePosts.every(p => p.platform === 'youtube')).toBe(true);
    });

    it('should filter posts by status', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const scheduledPosts = await caller.getCampaignPosts({ campaignId: 'csw70-2026', status: 'scheduled' });
      
      expect(scheduledPosts.length).toBeGreaterThan(0);
      expect(scheduledPosts.every(p => p.status === 'scheduled')).toBe(true);
    });

    it('should return empty array for non-existent campaign', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const posts = await caller.getCampaignPosts({ campaignId: 'non-existent' });
      expect(posts).toEqual([]);
    });

    it('should include hashtags in posts', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const posts = await caller.getCampaignPosts({ campaignId: 'csw70-2026' });
      
      const firstPost = posts[0];
      expect(firstPost.hashtags).toBeDefined();
      expect(firstPost.hashtags.length).toBeGreaterThan(0);
      expect(firstPost.hashtags.some(h => h.includes('CSW70'))).toBe(true);
    });
  });

  describe('getCampaignCommercials', () => {
    it('should return 3 commercial spots', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const commercials = await caller.getCampaignCommercials({ campaignId: 'csw70-2026' });
      
      expect(commercials).toBeDefined();
      expect(commercials.length).toBe(3);
    });

    it('should have correct commercial details', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const commercials = await caller.getCampaignCommercials({ campaignId: 'csw70-2026' });
      
      const announcement = commercials.find(c => c.title === 'The Announcement');
      expect(announcement).toBeDefined();
      expect(announcement!.duration).toBe(30);
      expect(announcement!.status).toBe('produced');
      expect(announcement!.script).toContain('Seraph AI');
      
      const whyItMatters = commercials.find(c => c.title === 'Why It Matters');
      expect(whyItMatters).toBeDefined();
      expect(whyItMatters!.duration).toBe(60);
      expect(whyItMatters!.script).toContain('Candy AI');
      
      const joinMovement = commercials.find(c => c.title === 'Join the Movement');
      expect(joinMovement).toBeDefined();
      expect(joinMovement!.duration).toBe(15);
    });
  });

  describe('getCampaignMetrics', () => {
    it('should return campaign metrics with engagement data', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const metrics = await caller.getCampaignMetrics({ campaignId: 'csw70-2026' });
      
      expect(metrics).toBeDefined();
      expect(metrics!.totalPosts).toBeGreaterThan(0);
      expect(metrics!.postedCount).toBeGreaterThanOrEqual(0);
      expect(metrics!.scheduledCount).toBeGreaterThanOrEqual(0);
      expect(metrics!.totalLikes).toBeGreaterThanOrEqual(0);
      expect(metrics!.totalViews).toBeGreaterThanOrEqual(0);
      expect(metrics!.commercialsTotal).toBe(3);
      expect(metrics!.automationStatus).toBe('active');
    });

    it('should include platform breakdown', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const metrics = await caller.getCampaignMetrics({ campaignId: 'csw70-2026' });
      
      expect(metrics!.platformMetrics).toBeDefined();
      expect(metrics!.platformMetrics['youtube']).toBeDefined();
      expect(metrics!.platformMetrics['facebook']).toBeDefined();
      expect(metrics!.platformMetrics['instagram']).toBeDefined();
    });

    it('should return null for non-existent campaign', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const metrics = await caller.getCampaignMetrics({ campaignId: 'non-existent' });
      expect(metrics).toBeNull();
    });
  });

  describe('getCampaignTimeline', () => {
    it('should return timeline grouped by date', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const timeline = await caller.getCampaignTimeline({ campaignId: 'csw70-2026' });
      
      expect(timeline).toBeDefined();
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
      
      const firstDay = timeline[0];
      expect(firstDay.date).toBeDefined();
      expect(firstDay.posts).toBeGreaterThan(0);
      expect(firstDay.platforms.length).toBeGreaterThan(0);
    });

    it('should be sorted chronologically', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const timeline = await caller.getCampaignTimeline({ campaignId: 'csw70-2026' });
      
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].date >= timeline[i - 1].date).toBe(true);
      }
    });
  });

  describe('Campaign Content Quality', () => {
    it('should have posts for all 8 platforms', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const posts = await caller.getCampaignPosts({ campaignId: 'csw70-2026' });
      
      const platforms = new Set(posts.map(p => p.platform));
      expect(platforms.size).toBe(8);
      expect(platforms.has('youtube')).toBe(true);
      expect(platforms.has('facebook')).toBe(true);
      expect(platforms.has('instagram')).toBe(true);
      expect(platforms.has('twitch')).toBe(true);
      expect(platforms.has('rumble')).toBe(true);
      expect(platforms.has('linkedin')).toBe(true);
      expect(platforms.has('tiktok')).toBe(true);
      expect(platforms.has('x')).toBe(true);
    });

    it('should include RRB branding in post content', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const posts = await caller.getCampaignPosts({ campaignId: 'csw70-2026' });
      
      const hasRRBContent = posts.some(p => 
        p.content.includes("Rockin' Rockin' Boogie") || 
        p.content.includes('qumus.manus.space')
      );
      expect(hasRRBContent).toBe(true);
    });

    it('should include CSW70 hashtags', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const posts = await caller.getCampaignPosts({ campaignId: 'csw70-2026' });
      
      const hasCSW70Tag = posts.some(p => p.hashtags.includes('#CSW70'));
      expect(hasCSW70Tag).toBe(true);
      
      const hasRRBTag = posts.some(p => p.hashtags.includes('#RRBRadio'));
      expect(hasRRBTag).toBe(true);
    });

    it('should have commercial scripts mentioning Seraph and Candy AI', async () => {
      const caller = mediaBlastRouter.createCaller({} as any);
      const commercials = await caller.getCampaignCommercials({ campaignId: 'csw70-2026' });
      
      const hasSeraph = commercials.some(c => c.script.includes('Seraph AI'));
      const hasCandy = commercials.some(c => c.script.includes('Candy AI'));
      
      expect(hasSeraph).toBe(true);
      expect(hasCandy).toBe(true);
    });
  });
});
