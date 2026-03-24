/**
 * TIERED ACCESS SYSTEM
 * Free, Professional, and Advanced tiers with feature gates
 */

export type UserTier = 'free' | 'professional' | 'advanced';

export interface TierFeatures {
  // Audio Features
  radioChannels: boolean;
  frequencyTuner: boolean;
  soundDNA: boolean;
  creativeCoPilot: boolean;
  frequencyMastering: boolean;
  legacyTimeline: boolean;
  multiDimensionalCollab: boolean;
  predictiveAnalytics: boolean;
  nftMinting: boolean;
  wellnessIntegration: boolean;

  // Video Features
  aiCinematicDirector: boolean;
  vfxEngine: boolean;
  autonomousEditing: boolean;
  holographicCapture: boolean;
  liveStreamingIntelligence: boolean;
  videoNftMinting: boolean;
  cinematicArchive: boolean;
  crossMediaAnalytics: boolean;

  // Studio Features
  bandMemberChat: boolean;
  recordingArchive: boolean;
  setlistGenerator: boolean;
  realTimeNotifications: boolean;
  collaborationInvitations: boolean;
  performanceRecommendations: boolean;

  // Limits
  maxRecordingsPerMonth: number;
  maxBandMembers: number;
  maxStorageGB: number;
  maxConcurrentStreams: number;
  maxApiCallsPerDay: number;
}

export const TIER_FEATURES: Record<UserTier, TierFeatures> = {
  free: {
    // Audio Features
    radioChannels: true,
    frequencyTuner: true,
    soundDNA: false,
    creativeCoPilot: false,
    frequencyMastering: false,
    legacyTimeline: false,
    multiDimensionalCollab: false,
    predictiveAnalytics: false,
    nftMinting: false,
    wellnessIntegration: false,

    // Video Features
    aiCinematicDirector: false,
    vfxEngine: false,
    autonomousEditing: false,
    holographicCapture: false,
    liveStreamingIntelligence: false,
    videoNftMinting: false,
    cinematicArchive: false,
    crossMediaAnalytics: false,

    // Studio Features
    bandMemberChat: true,
    recordingArchive: false,
    setlistGenerator: false,
    realTimeNotifications: true,
    collaborationInvitations: false,
    performanceRecommendations: false,

    // Limits
    maxRecordingsPerMonth: 5,
    maxBandMembers: 2,
    maxStorageGB: 5,
    maxConcurrentStreams: 1,
    maxApiCallsPerDay: 1000,
  },

  professional: {
    // Audio Features
    radioChannels: true,
    frequencyTuner: true,
    soundDNA: true,
    creativeCoPilot: true,
    frequencyMastering: true,
    legacyTimeline: true,
    multiDimensionalCollab: true,
    predictiveAnalytics: true,
    nftMinting: true,
    wellnessIntegration: true,

    // Video Features
    aiCinematicDirector: true,
    vfxEngine: true,
    autonomousEditing: true,
    holographicCapture: false,
    liveStreamingIntelligence: true,
    videoNftMinting: true,
    cinematicArchive: true,
    crossMediaAnalytics: true,

    // Studio Features
    bandMemberChat: true,
    recordingArchive: true,
    setlistGenerator: true,
    realTimeNotifications: true,
    collaborationInvitations: true,
    performanceRecommendations: true,

    // Limits
    maxRecordingsPerMonth: 50,
    maxBandMembers: 10,
    maxStorageGB: 100,
    maxConcurrentStreams: 3,
    maxApiCallsPerDay: 10000,
  },

  advanced: {
    // Audio Features
    radioChannels: true,
    frequencyTuner: true,
    soundDNA: true,
    creativeCoPilot: true,
    frequencyMastering: true,
    legacyTimeline: true,
    multiDimensionalCollab: true,
    predictiveAnalytics: true,
    nftMinting: true,
    wellnessIntegration: true,

    // Video Features
    aiCinematicDirector: true,
    vfxEngine: true,
    autonomousEditing: true,
    holographicCapture: true,
    liveStreamingIntelligence: true,
    videoNftMinting: true,
    cinematicArchive: true,
    crossMediaAnalytics: true,

    // Studio Features
    bandMemberChat: true,
    recordingArchive: true,
    setlistGenerator: true,
    realTimeNotifications: true,
    collaborationInvitations: true,
    performanceRecommendations: true,

    // Limits
    maxRecordingsPerMonth: 999,
    maxBandMembers: 50,
    maxStorageGB: 1000,
    maxConcurrentStreams: 10,
    maxApiCallsPerDay: 100000,
  },
};

export const TIER_DESCRIPTIONS: Record<UserTier, { name: string; description: string; price: string }> = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started. Access to radio channels, frequency tuner, and basic chat.',
    price: '$0/month',
  },
  professional: {
    name: 'Professional',
    description: 'For serious creators. Full audio and video production tools, recording archive, and AI features.',
    price: '$29/month',
  },
  advanced: {
    name: 'Advanced',
    description: 'For legendary creators. Everything including holographic capture, unlimited storage, and priority support.',
    price: '$99/month',
  },
};

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(tier: UserTier, feature: keyof TierFeatures): boolean {
  const features = TIER_FEATURES[tier];
  const featureValue = features[feature];
  
  // If it's a boolean, return it directly
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // If it's a number (limit), return true if limit > 0
  return typeof featureValue === 'number' && featureValue > 0;
}

/**
 * Get feature limit for a tier
 */
export function getFeatureLimit(tier: UserTier, feature: keyof TierFeatures): number {
  const features = TIER_FEATURES[tier];
  const featureValue = features[feature];
  
  if (typeof featureValue === 'number') {
    return featureValue;
  }
  
  return 0;
}

/**
 * Check if user can perform an action based on tier limits
 */
export function canPerformAction(
  tier: UserTier,
  action: 'record' | 'invite' | 'stream' | 'apiCall',
  currentUsage: number
): boolean {
  const features = TIER_FEATURES[tier];
  
  switch (action) {
    case 'record':
      return currentUsage < features.maxRecordingsPerMonth;
    case 'invite':
      return currentUsage < features.maxBandMembers;
    case 'stream':
      return currentUsage < features.maxConcurrentStreams;
    case 'apiCall':
      return currentUsage < features.maxApiCallsPerDay;
    default:
      return false;
  }
}

/**
 * Get upgrade suggestion for locked feature
 */
export function getUpgradeSuggestion(tier: UserTier, feature: keyof TierFeatures): string {
  if (tier === 'free') {
    return 'Upgrade to Professional to unlock this feature.';
  }
  if (tier === 'professional') {
    return 'Upgrade to Advanced to unlock this feature.';
  }
  return 'This feature is already available in your tier.';
}

/**
 * Compare features between tiers
 */
export function compareTiers(tier1: UserTier, tier2: UserTier): { feature: string; tier1: boolean; tier2: boolean }[] {
  const features1 = TIER_FEATURES[tier1];
  const features2 = TIER_FEATURES[tier2];
  const comparison: { feature: string; tier1: boolean; tier2: boolean }[] = [];

  for (const [key, value1] of Object.entries(features1)) {
    if (typeof value1 === 'boolean') {
      const value2 = (features2 as Record<string, unknown>)[key];
      comparison.push({
        feature: key,
        tier1: value1,
        tier2: typeof value2 === 'boolean' ? value2 : false,
      });
    }
  }

  return comparison;
}
