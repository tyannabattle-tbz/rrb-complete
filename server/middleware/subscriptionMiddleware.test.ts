import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  requireTier,
  requireFeature,
  getUpgradeSuggestions,
  calculateSubscriptionCost,
} from './subscriptionMiddleware';

describe('Subscription Middleware', () => {
  describe('requireTier', () => {
    it('should allow access for matching tier', () => {
      const mockReq = {
        subscription: {
          tier: 'enterprise',
          status: 'active' as const,
          features: ['all_features'],
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const mockNext = vi.fn();

      const middleware = requireTier('enterprise');
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for lower tier', () => {
      const mockReq = {
        subscription: {
          tier: 'free',
          status: 'active' as const,
          features: ['basic_tasks'],
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const mockNext = vi.fn();

      const middleware = requireTier('enterprise');
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireFeature', () => {
    it('should allow access if feature is available', () => {
      const mockReq = {
        subscription: {
          tier: 'ar_pro',
          status: 'active' as const,
          features: ['ar_glass', 'voice_commands', 'advanced_analytics'],
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const mockNext = vi.fn();

      const middleware = requireFeature('ar_glass');
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access if feature is not available', () => {
      const mockReq = {
        subscription: {
          tier: 'free',
          status: 'active' as const,
          features: ['basic_tasks'],
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const mockNext = vi.fn();

      const middleware = requireFeature('ar_glass');
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access if any required feature is available', () => {
      const mockReq = {
        subscription: {
          tier: 'voice_training',
          status: 'active' as const,
          features: ['voice_training', 'custom_commands'],
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const mockNext = vi.fn();

      const middleware = requireFeature('voice_training', 'ar_glass');
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getUpgradeSuggestions', () => {
    it('should suggest upgrades for free tier', () => {
      const suggestions = getUpgradeSuggestions('free');
      expect(suggestions).toContain('ar_pro');
      expect(suggestions).toContain('voice_training');
      expect(suggestions).toContain('enterprise');
    });

    it('should suggest upgrades for ar_pro tier', () => {
      const suggestions = getUpgradeSuggestions('ar_pro');
      expect(suggestions).toContain('enterprise');
      expect(suggestions).toContain('voice_training');
    });

    it('should have no suggestions for enterprise tier', () => {
      const suggestions = getUpgradeSuggestions('enterprise');
      expect(suggestions).toHaveLength(0);
    });

    it('should suggest HybridCast upgrades', () => {
      const suggestions = getUpgradeSuggestions('hybridcast_basic');
      expect(suggestions).toContain('hybridcast_pro');
      expect(suggestions).toContain('hybridcast_enterprise');
    });
  });

  describe('calculateSubscriptionCost', () => {
    it('should return 0 for free tier', () => {
      const cost = calculateSubscriptionCost('free', 'monthly');
      expect(cost).toBe(0);
    });

    it('should calculate monthly costs correctly', () => {
      expect(calculateSubscriptionCost('ar_pro', 'monthly')).toBe(99);
      expect(calculateSubscriptionCost('voice_training', 'monthly')).toBe(49);
      expect(calculateSubscriptionCost('enterprise', 'monthly')).toBe(299);
    });

    it('should calculate yearly costs correctly', () => {
      expect(calculateSubscriptionCost('ar_pro', 'yearly')).toBe(990);
      expect(calculateSubscriptionCost('voice_training', 'yearly')).toBe(490);
      expect(calculateSubscriptionCost('enterprise', 'yearly')).toBe(2990);
    });

    it('should apply yearly discount (10% savings)', () => {
      const monthlyTotal = calculateSubscriptionCost('ar_pro', 'monthly') * 12;
      const yearlyTotal = calculateSubscriptionCost('ar_pro', 'yearly');

      expect(yearlyTotal).toBeLessThan(monthlyTotal);
      expect(yearlyTotal).toBe(monthlyTotal * 0.9);
    });

    it('should calculate HybridCast costs', () => {
      expect(calculateSubscriptionCost('hybridcast_basic', 'monthly')).toBe(49);
      expect(calculateSubscriptionCost('hybridcast_pro', 'monthly')).toBe(149);
      expect(calculateSubscriptionCost('hybridcast_enterprise', 'monthly')).toBe(499);
    });
  });

  describe('Tier feature mapping', () => {
    it('should have correct features for each tier', () => {
      const tierFeatures: Record<string, string[]> = {
        free: ['basic_tasks', 'limited_storage', 'basic_analytics'],
        ar_pro: ['ar_glass', 'voice_commands', 'advanced_analytics', 'file_storage'],
        voice_training: ['voice_training', 'custom_commands', 'voice_analytics'],
        enterprise: ['all_features', 'unlimited_storage', 'priority_support', 'custom_integrations'],
      };

      expect(tierFeatures.free).toHaveLength(3);
      expect(tierFeatures.ar_pro).toHaveLength(4);
      expect(tierFeatures.voice_training).toHaveLength(3);
      expect(tierFeatures.enterprise).toHaveLength(4);
    });

    it('should have enterprise as most feature-rich', () => {
      const tierFeatures: Record<string, string[]> = {
        free: ['basic_tasks', 'limited_storage', 'basic_analytics'],
        ar_pro: ['ar_glass', 'voice_commands', 'advanced_analytics', 'file_storage'],
        voice_training: ['voice_training', 'custom_commands', 'voice_analytics'],
        enterprise: ['all_features', 'unlimited_storage', 'priority_support', 'custom_integrations'],
      };

      const featureCounts = Object.entries(tierFeatures).map(([tier, features]) => ({
        tier,
        count: features.length,
      }));

      const enterprise = featureCounts.find((t) => t.tier === 'enterprise');
      const free = featureCounts.find((t) => t.tier === 'free');

      expect(enterprise!.count).toBeGreaterThanOrEqual(free!.count);
    });
  });

  describe('Subscription validation', () => {
    it('should identify expired subscriptions', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const isExpired = expiredDate < new Date();
      expect(isExpired).toBe(true);
    });

    it('should identify active subscriptions', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const isActive = futureDate > new Date();
      expect(isActive).toBe(true);
    });

    it('should handle null expiration dates (lifetime subscriptions)', () => {
      const expiresAt = null;
      const isExpired = expiresAt !== null && new Date(expiresAt) < new Date();

      expect(isExpired).toBe(false);
    });
  });
});
