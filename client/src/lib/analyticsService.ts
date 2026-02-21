import { create } from 'zustand';

export interface ChannelAnalytics {
  channelId: string;
  channelName: string;
  totalListeners: number;
  peakListeners: number;
  averageListeners: number;
  peakHour: number; // 0-23
  totalStreamsToday: number;
  totalStreamTime: number; // in seconds
  listenerDemographics: {
    countries: Record<string, number>;
    devices: Record<string, number>;
    browsers: Record<string, number>;
  };
  topTracks: Array<{
    title: string;
    artist: string;
    plays: number;
    duration: number;
  }>;
  trendingMetrics: {
    listenerTrend: 'up' | 'down' | 'stable';
    trendPercentage: number;
    weeklyGrowth: number;
  };
  lastUpdated: number;
}

export interface AnalyticsDataPoint {
  timestamp: number;
  listeners: number;
  channelId: string;
}

interface AnalyticsStore {
  analytics: Record<string, ChannelAnalytics>;
  historicalData: AnalyticsDataPoint[];
  selectedChannelId: string | null;

  // Actions
  updateChannelAnalytics: (channelId: string, data: Partial<ChannelAnalytics>) => void;
  getChannelAnalytics: (channelId: string) => ChannelAnalytics | null;
  addHistoricalDataPoint: (point: AnalyticsDataPoint) => void;
  getChannelHistory: (channelId: string, hours?: number) => AnalyticsDataPoint[];
  selectChannel: (channelId: string) => void;
  getAllAnalytics: () => ChannelAnalytics[];
  getTopChannels: (limit?: number) => ChannelAnalytics[];
  calculateGrowthRate: (channelId: string) => number;
}

const DEFAULT_ANALYTICS: ChannelAnalytics = {
  channelId: '',
  channelName: '',
  totalListeners: 0,
  peakListeners: 0,
  averageListeners: 0,
  peakHour: 0,
  totalStreamsToday: 0,
  totalStreamTime: 0,
  listenerDemographics: {
    countries: {},
    devices: {},
    browsers: {},
  },
  topTracks: [],
  trendingMetrics: {
    listenerTrend: 'stable',
    trendPercentage: 0,
    weeklyGrowth: 0,
  },
  lastUpdated: Date.now(),
};

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  analytics: {},
  historicalData: [],
  selectedChannelId: null,

  updateChannelAnalytics: (channelId, data) => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        [channelId]: {
          ...DEFAULT_ANALYTICS,
          ...(state.analytics[channelId] || {}),
          ...data,
          channelId,
          lastUpdated: Date.now(),
        },
      },
    }));
  },

  getChannelAnalytics: (channelId) => {
    return get().analytics[channelId] || null;
  },

  addHistoricalDataPoint: (point) => {
    set((state) => ({
      historicalData: [...state.historicalData, point].slice(-1000), // Keep last 1000 points
    }));
  },

  getChannelHistory: (channelId, hours = 24) => {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return get().historicalData.filter(
      (point) => point.channelId === channelId && point.timestamp > cutoffTime
    );
  },

  selectChannel: (channelId) => {
    set({ selectedChannelId: channelId });
  },

  getAllAnalytics: () => {
    return Object.values(get().analytics);
  },

  getTopChannels: (limit = 10) => {
    return Object.values(get().analytics)
      .sort((a, b) => b.totalListeners - a.totalListeners)
      .slice(0, limit);
  },

  calculateGrowthRate: (channelId) => {
    const history = get().getChannelHistory(channelId, 24);
    if (history.length < 2) return 0;

    const oldestListeners = history[0].listeners;
    const newestListeners = history[history.length - 1].listeners;

    if (oldestListeners === 0) return 0;
    return ((newestListeners - oldestListeners) / oldestListeners) * 100;
  },
}));

// Mock analytics data generator for testing
export function generateMockAnalytics(channelId: string, channelName: string): ChannelAnalytics {
  const now = Date.now();
  const peakHour = Math.floor(Math.random() * 24);
  const baseListeners = Math.floor(Math.random() * 5000) + 1000;

  return {
    channelId,
    channelName,
    totalListeners: baseListeners,
    peakListeners: Math.floor(baseListeners * 1.5),
    averageListeners: Math.floor(baseListeners * 0.8),
    peakHour,
    totalStreamsToday: Math.floor(Math.random() * 100) + 20,
    totalStreamTime: Math.floor(Math.random() * 86400) + 3600,
    listenerDemographics: {
      countries: {
        'United States': Math.floor(baseListeners * 0.4),
        'United Kingdom': Math.floor(baseListeners * 0.15),
        'Canada': Math.floor(baseListeners * 0.1),
        'Australia': Math.floor(baseListeners * 0.08),
        'Other': Math.floor(baseListeners * 0.27),
      },
      devices: {
        'Mobile': Math.floor(baseListeners * 0.6),
        'Desktop': Math.floor(baseListeners * 0.3),
        'Tablet': Math.floor(baseListeners * 0.1),
      },
      browsers: {
        'Chrome': Math.floor(baseListeners * 0.45),
        'Safari': Math.floor(baseListeners * 0.25),
        'Firefox': Math.floor(baseListeners * 0.15),
        'Edge': Math.floor(baseListeners * 0.1),
        'Other': Math.floor(baseListeners * 0.05),
      },
    },
    topTracks: [
      {
        title: 'Rockin\' Rockin\' Boogie',
        artist: 'Seabrun Candy Hunter & Little Richard',
        plays: Math.floor(Math.random() * 500) + 100,
        duration: 180,
      },
      {
        title: 'Soul & Funk Vibes',
        artist: 'Various Artists',
        plays: Math.floor(Math.random() * 400) + 80,
        duration: 240,
      },
      {
        title: 'Jazz Fusion Dreams',
        artist: 'Various Artists',
        plays: Math.floor(Math.random() * 300) + 60,
        duration: 300,
      },
    ],
    trendingMetrics: {
      listenerTrend: Math.random() > 0.5 ? 'up' : 'down',
      trendPercentage: Math.floor(Math.random() * 20) + 5,
      weeklyGrowth: Math.floor(Math.random() * 30) + 5,
    },
    lastUpdated: now,
  };
}
