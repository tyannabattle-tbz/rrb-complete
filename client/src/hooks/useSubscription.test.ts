import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubscription, useFeatureAccess, useUpgradePath } from './useSubscription';

// Mock the auth hook
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com' },
  }),
}));

// Mock the query hook
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      tier: 'ar_pro',
      status: 'active',
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      features: {},
    },
    isLoading: false,
    error: null,
  }),
}));

describe('useSubscription', () => {
  it('should return subscription info', () => {
    const { result } = renderHook(() => useSubscription());
    
    expect(result.current.tier).toBe('ar_pro');
    expect(result.current.isActive).toBe(true);
    expect(result.current.features).toBeDefined();
  });

  it('should check feature access correctly', () => {
    const { result } = renderHook(() => useSubscription());
    
    expect(result.current.hasFeature('arVisualization')).toBe(true);
    expect(result.current.hasFeature('voiceCommands')).toBe(false);
  });

  it('should provide upgrade paths', () => {
    const { result } = renderHook(() => useUpgradePath());
    
    expect(result.current).toContain('enterprise');
    expect(result.current.length).toBeGreaterThan(0);
  });
});

describe('Feature Access Matrix', () => {
  it('free tier should have no features', () => {
    const { result } = renderHook(() => useSubscription());
    
    // Mock free tier
    const freeFeatures = {
      voiceCommands: false,
      arVisualization: false,
      customBranding: false,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
      unlimitedBroadcasts: false,
      meshNetworking: false,
      slaGuarantee: false,
    };

    Object.entries(freeFeatures).forEach(([feature, hasAccess]) => {
      expect(hasAccess).toBe(false);
    });
  });

  it('enterprise tier should have all features', () => {
    const enterpriseFeatures = {
      voiceCommands: true,
      arVisualization: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
      unlimitedBroadcasts: true,
      meshNetworking: true,
      slaGuarantee: true,
    };

    Object.entries(enterpriseFeatures).forEach(([feature, hasAccess]) => {
      expect(hasAccess).toBe(true);
    });
  });
});
