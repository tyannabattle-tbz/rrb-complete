import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';

export type SubscriptionTier = 
  | 'free' 
  | 'ar_pro' 
  | 'voice_training' 
  | 'enterprise' 
  | 'hybridcast_basic' 
  | 'hybridcast_pro' 
  | 'hybridcast_enterprise';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  features: Record<string, boolean>;
}

interface FeatureAccess {
  voiceCommands: boolean;
  arVisualization: boolean;
  customBranding: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  unlimitedBroadcasts: boolean;
  meshNetworking: boolean;
  slaGuarantee: boolean;
}

const TIER_FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    voiceCommands: false,
    arVisualization: false,
    customBranding: false,
    advancedAnalytics: false,
    apiAccess: false,
    prioritySupport: false,
    unlimitedBroadcasts: false,
    meshNetworking: false,
    slaGuarantee: false,
  },
  ar_pro: {
    voiceCommands: false,
    arVisualization: true,
    customBranding: false,
    advancedAnalytics: true,
    apiAccess: false,
    prioritySupport: false,
    unlimitedBroadcasts: false,
    meshNetworking: false,
    slaGuarantee: false,
  },
  voice_training: {
    voiceCommands: true,
    arVisualization: false,
    customBranding: false,
    advancedAnalytics: true,
    apiAccess: false,
    prioritySupport: false,
    unlimitedBroadcasts: false,
    meshNetworking: false,
    slaGuarantee: false,
  },
  enterprise: {
    voiceCommands: true,
    arVisualization: true,
    customBranding: true,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
    unlimitedBroadcasts: true,
    meshNetworking: true,
    slaGuarantee: true,
  },
  hybridcast_basic: {
    voiceCommands: false,
    arVisualization: false,
    customBranding: false,
    advancedAnalytics: false,
    apiAccess: false,
    prioritySupport: false,
    unlimitedBroadcasts: false,
    meshNetworking: false,
    slaGuarantee: false,
  },
  hybridcast_pro: {
    voiceCommands: false,
    arVisualization: false,
    customBranding: true,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
    unlimitedBroadcasts: false,
    meshNetworking: true,
    slaGuarantee: false,
  },
  hybridcast_enterprise: {
    voiceCommands: false,
    arVisualization: false,
    customBranding: true,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
    unlimitedBroadcasts: true,
    meshNetworking: true,
    slaGuarantee: true,
  },
};

/**
 * Hook to check user subscription status and feature access
 */
export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const response = await fetch('/api/subscription/info');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      return response.json() as Promise<SubscriptionInfo>;
    },
    enabled: !!user,
  });

  const tier = subscription?.tier || 'free';
  const features = TIER_FEATURES[tier];

  return {
    subscription,
    tier,
    features,
    isLoading,
    error,
    hasFeature: (feature: keyof FeatureAccess) => features[feature],
    isActive: subscription?.status === 'active',
    isPastDue: subscription?.status === 'past_due',
    isCanceled: subscription?.status === 'canceled',
    canUpgrade: tier === 'free' || tier.startsWith('hybridcast_basic'),
  };
}

/**
 * Hook to check if user has access to a specific feature
 */
export function useFeatureAccess(feature: keyof FeatureAccess) {
  const { features } = useSubscription();
  return features[feature];
}

/**
 * Hook to get upgrade path for a user
 */
export function useUpgradePath() {
  const { tier } = useSubscription();

  const upgradePaths: Record<SubscriptionTier, SubscriptionTier[]> = {
    free: ['ar_pro', 'voice_training', 'enterprise', 'hybridcast_basic'],
    ar_pro: ['enterprise'],
    voice_training: ['enterprise'],
    enterprise: [],
    hybridcast_basic: ['hybridcast_pro', 'hybridcast_enterprise'],
    hybridcast_pro: ['hybridcast_enterprise'],
    hybridcast_enterprise: [],
  };

  return upgradePaths[tier] || [];
}
