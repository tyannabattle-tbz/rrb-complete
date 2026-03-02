import { useEffect, useState } from 'react';

/**
 * User Capability Levels
 * - BEGINNER: Simple, guided interface with minimal options
 * - INTERMEDIATE: Standard interface with common features
 * - ADVANCED: Full feature set with power user options
 * - OPERATOR: Complete control, all features, admin capabilities
 */
export type CapabilityLevel = 'beginner' | 'intermediate' | 'advanced' | 'operator';

export interface UserCapabilityProfile {
  level: CapabilityLevel;
  confidence: number; // 0-100, how confident we are in this level
  detectedFeatures: string[]; // Features user has interacted with
  interactionCount: number;
  lastUpdated: number;
  accessibilityProfile?: AccessibilityProfile;
  preferredLanguage?: string;
  timezone?: string;
}

export interface AccessibilityProfile {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReaderOptimized: boolean;
  keyboardOnly: boolean;
  hapticFeedback: boolean;
  voiceControl: boolean;
}

const DEFAULT_PROFILE: UserCapabilityProfile = {
  level: 'beginner',
  confidence: 0,
  detectedFeatures: [],
  interactionCount: 0,
  lastUpdated: Date.now(),
  accessibilityProfile: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    dyslexiaFont: false,
    colorBlindMode: 'none',
    screenReaderOptimized: false,
    keyboardOnly: false,
    hapticFeedback: true,
    voiceControl: false,
  },
};

/**
 * Hook for detecting and managing user capability level
 * Learns from user interactions and adapts UI complexity
 */
export function useUserCapability() {
  const [profile, setProfile] = useState<UserCapabilityProfile>(() => {
    // Load from localStorage
    const stored = localStorage.getItem('userCapabilityProfile');
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
  });

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userCapabilityProfile', JSON.stringify(profile));
  }, [profile]);

  // Detect accessibility preferences from system
  useEffect(() => {
    const newAccessibility = { ...profile.accessibilityProfile };

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      newAccessibility.highContrast = true;
    }

    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      newAccessibility.reducedMotion = true;
    }

    // Detect color scheme preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Dark mode preference
    }

    // Check for screen reader
    if (navigator.userAgent.toLowerCase().includes('screen reader')) {
      newAccessibility.screenReaderOptimized = true;
    }

    setProfile((prev) => ({
      ...prev,
      accessibilityProfile: newAccessibility,
    }));
  }, []);

  /**
   * Record a feature interaction to help determine capability level
   */
  const recordFeatureInteraction = (featureName: string, complexity: 'simple' | 'intermediate' | 'advanced' | 'expert') => {
    setProfile((prev) => {
      const newProfile = { ...prev };

      // Add feature to detected features if not already there
      if (!newProfile.detectedFeatures.includes(featureName)) {
        newProfile.detectedFeatures.push(featureName);
      }

      newProfile.interactionCount += 1;
      newProfile.lastUpdated = Date.now();

      // Determine capability level based on features used
      const advancedFeatureCount = newProfile.detectedFeatures.filter((f) =>
        ['advancedAnalytics', 'customization', 'automation', 'scripting', 'api'].includes(f)
      ).length;

      const intermediateFeatureCount = newProfile.detectedFeatures.filter((f) =>
        ['scheduling', 'filtering', 'export', 'sharing', 'collaboration'].includes(f)
      ).length;

      // Update capability level
      if (advancedFeatureCount >= 3 && newProfile.interactionCount > 20) {
        newProfile.level = 'advanced';
        newProfile.confidence = Math.min(100, 50 + advancedFeatureCount * 10);
      } else if (intermediateFeatureCount >= 2 && newProfile.interactionCount > 10) {
        newProfile.level = 'intermediate';
        newProfile.confidence = Math.min(100, 40 + intermediateFeatureCount * 10);
      } else if (newProfile.interactionCount < 5) {
        newProfile.level = 'beginner';
        newProfile.confidence = Math.max(0, 100 - newProfile.interactionCount * 10);
      }

      return newProfile;
    });
  };

  /**
   * Manually set capability level (for user preference)
   */
  const setCapabilityLevel = (level: CapabilityLevel) => {
    setProfile((prev) => ({
      ...prev,
      level,
      confidence: 100, // User explicitly set it
      lastUpdated: Date.now(),
    }));
  };

  /**
   * Update accessibility preferences
   */
  const updateAccessibility = (updates: Partial<AccessibilityProfile>) => {
    setProfile((prev) => ({
      ...prev,
      accessibilityProfile: {
        ...prev.accessibilityProfile,
        ...updates,
      },
      lastUpdated: Date.now(),
    }));
  };

  /**
   * Check if a feature should be shown at current capability level
   */
  const shouldShowFeature = (featureLevel: CapabilityLevel): boolean => {
    const levels: CapabilityLevel[] = ['beginner', 'intermediate', 'advanced', 'operator'];
    const currentIndex = levels.indexOf(profile.level);
    const featureIndex = levels.indexOf(featureLevel);
    return currentIndex >= featureIndex;
  };

  /**
   * Get UI complexity settings for current level
   */
  const getUIComplexity = () => {
    const complexityMap = {
      beginner: {
        showAdvancedSettings: false,
        showKeyboardShortcuts: false,
        showExpertMode: false,
        showAnalytics: false,
        maxVisibleOptions: 5,
        showTooltips: true,
        showGuidance: true,
        animationDuration: 600,
      },
      intermediate: {
        showAdvancedSettings: true,
        showKeyboardShortcuts: true,
        showExpertMode: false,
        showAnalytics: true,
        maxVisibleOptions: 10,
        showTooltips: true,
        showGuidance: false,
        animationDuration: 300,
      },
      advanced: {
        showAdvancedSettings: true,
        showKeyboardShortcuts: true,
        showExpertMode: true,
        showAnalytics: true,
        maxVisibleOptions: 20,
        showTooltips: false,
        showGuidance: false,
        animationDuration: 200,
      },
      operator: {
        showAdvancedSettings: true,
        showKeyboardShortcuts: true,
        showExpertMode: true,
        showAnalytics: true,
        maxVisibleOptions: 999,
        showTooltips: false,
        showGuidance: false,
        animationDuration: 100,
      },
    };

    return complexityMap[profile.level];
  };

  return {
    profile,
    recordFeatureInteraction,
    setCapabilityLevel,
    updateAccessibility,
    shouldShowFeature,
    getUIComplexity,
  };
}
