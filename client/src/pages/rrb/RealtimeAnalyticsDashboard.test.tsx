import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RealtimeAnalyticsDashboard from './RealtimeAnalyticsDashboard';
import { trpc } from '@/lib/trpc';

// Mock tRPC
vi.mock('@/lib/trpc', () => ({
  trpc: {
    realtimeAnalytics: {
      getLiveMetrics: {
        useQuery: vi.fn(),
      },
      getGeographicDistribution: {
        useQuery: vi.fn(),
      },
      getDemographics: {
        useQuery: vi.fn(),
      },
      getTopTracks: {
        useQuery: vi.fn(),
      },
      getCommercialMetrics: {
        useQuery: vi.fn(),
      },
      getEngagementTrends: {
        useQuery: vi.fn(),
      },
      getPlatformComparison: {
        useQuery: vi.fn(),
      },
    },
  },
}));

const mockLiveMetrics = {
  totalListeners: 274000,
  activeListeners: 12450,
  trends: {
    dailyGrowth: 18.5,
    weeklyGrowth: 45.2,
    monthlyGrowth: 125.8,
  },
  platformBreakdown: [
    { platform: 'Spotify', listeners: 95000, activeNow: 3500, growthRate: 12.3 },
    { platform: 'YouTube', listeners: 92000, activeNow: 4200, growthRate: 15.6 },
    { platform: 'Apple Podcasts', listeners: 72000, activeNow: 2800, growthRate: 10.2 },
    { platform: 'Amazon Music', listeners: 40000, activeNow: 1500, growthRate: 8.5 },
  ],
};

const mockGeoData = {
  totalCountries: 127,
  topCountries: [
    { country: 'United States', listeners: 98500, percentage: 35.9 },
    { country: 'United Kingdom', listeners: 34200, percentage: 12.5 },
    { country: 'Canada', listeners: 28900, percentage: 10.5 },
  ],
};

const mockDemographics = {
  ageGroups: {
    '18-24': { percentage: 22, listeners: 60280 },
    '25-34': { percentage: 35, listeners: 95900 },
    '35-44': { percentage: 20, listeners: 54800 },
  },
  interests: [
    { interest: 'Music', percentage: 92 },
    { interest: 'Jazz', percentage: 78 },
    { interest: 'Healing/Wellness', percentage: 65 },
  ],
};

const mockTopTracks = {
  topTracks: [
    {
      rank: 1,
      title: 'Rockin\' Rockin\' Boogie - Original',
      artist: 'Seabrun Candy Hunter',
      plays: 156000,
      saves: 12500,
      shares: 4200,
      trend: '↑ +8.5%',
    },
    {
      rank: 2,
      title: 'Healing Frequencies - Solfeggio 528Hz',
      artist: 'RRB Healing',
      plays: 142000,
      saves: 11200,
      shares: 3800,
      trend: '↑ +6.2%',
    },
  ],
};

const mockCommercialMetrics = {
  totalImpressions: 2450000,
  clickThroughRate: 6.4,
  totalClicks: 156800,
  topCommercials: [
    {
      id: 1,
      name: 'Sweet Miracles Donation Campaign',
      impressions: 450000,
      clicks: 28800,
      ctr: 6.4,
      revenue: 14500,
    },
  ],
};

const mockEngagement = {
  follows: { daily: 450, trend: '↑ +18.5%' },
  subscribes: { daily: 320, trend: '↑ +12.3%' },
  saves: { daily: 520, trend: '↑ +15.2%' },
  retention: { dayThirty: 38.9, trend: '↑ +2.3%' },
};

describe('RealtimeAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations
    (trpc.realtimeAnalytics.getLiveMetrics.useQuery as any).mockReturnValue({
      data: mockLiveMetrics,
      isLoading: false,
      refetch: vi.fn(),
    });

    (trpc.realtimeAnalytics.getGeographicDistribution.useQuery as any).mockReturnValue({
      data: mockGeoData,
      isLoading: false,
    });

    (trpc.realtimeAnalytics.getDemographics.useQuery as any).mockReturnValue({
      data: mockDemographics,
      isLoading: false,
    });

    (trpc.realtimeAnalytics.getTopTracks.useQuery as any).mockReturnValue({
      data: mockTopTracks,
      isLoading: false,
    });

    (trpc.realtimeAnalytics.getCommercialMetrics.useQuery as any).mockReturnValue({
      data: mockCommercialMetrics,
      isLoading: false,
    });

    (trpc.realtimeAnalytics.getEngagementTrends.useQuery as any).mockReturnValue({
      data: mockEngagement,
      isLoading: false,
    });

    (trpc.realtimeAnalytics.getPlatformComparison.useQuery as any).mockReturnValue({
      data: {},
      isLoading: false,
    });
  });

  it('renders the dashboard with title and description', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument();
    expect(screen.getByText('Live listener metrics from all platforms')).toBeInTheDocument();
  });

  it('displays total listeners metric', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('274,000')).toBeInTheDocument();
  });

  it('displays active listeners metric', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('12,450')).toBeInTheDocument();
  });

  it('displays countries metric', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('127')).toBeInTheDocument();
  });

  it('displays daily growth trend', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('↑ +18.5% today')).toBeInTheDocument();
  });

  it('has live/paused toggle button', () => {
    render(<RealtimeAnalyticsDashboard />);
    const liveButton = screen.getByText('● Live');
    expect(liveButton).toBeInTheDocument();
  });

  it('has refresh now button', () => {
    render(<RealtimeAnalyticsDashboard />);
    const refreshButton = screen.getByText('Refresh Now');
    expect(refreshButton).toBeInTheDocument();
  });

  it('displays platform tabs', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('Platforms')).toBeInTheDocument();
    expect(screen.getByText('Geography')).toBeInTheDocument();
    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Top Tracks')).toBeInTheDocument();
    expect(screen.getByText('Commercial')).toBeInTheDocument();
  });

  it('displays platform breakdown data', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('Spotify')).toBeInTheDocument();
    expect(screen.getByText('95,000')).toBeInTheDocument();
  });

  it('displays top countries in geography tab', async () => {
    render(<RealtimeAnalyticsDashboard />);
    const geoTab = screen.getByText('Geography');
    await userEvent.click(geoTab);
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('98,500')).toBeInTheDocument();
    });
  });

  it('displays demographics data', async () => {
    render(<RealtimeAnalyticsDashboard />);
    const demoTab = screen.getByText('Demographics');
    await userEvent.click(demoTab);
    
    await waitFor(() => {
      expect(screen.getByText('Age Groups')).toBeInTheDocument();
    });
  });

  it('displays top tracks data', async () => {
    render(<RealtimeAnalyticsDashboard />);
    const tracksTab = screen.getByText('Top Tracks');
    await userEvent.click(tracksTab);
    
    await waitFor(() => {
      expect(screen.getByText(/Rockin' Rockin' Boogie/)).toBeInTheDocument();
      expect(screen.getByText('156,000')).toBeInTheDocument();
    });
  });

  it('displays commercial metrics', async () => {
    render(<RealtimeAnalyticsDashboard />);
    const commercialTab = screen.getByText('Commercial');
    await userEvent.click(commercialTab);
    
    await waitFor(() => {
      expect(screen.getByText('2.45M')).toBeInTheDocument();
      expect(screen.getByText('6.4%')).toBeInTheDocument();
    });
  });

  it('displays engagement trends', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('Engagement Trends')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument(); // Daily follows
  });

  it('toggles live/paused state', async () => {
    render(<RealtimeAnalyticsDashboard />);
    const liveButton = screen.getByText('● Live');
    
    await userEvent.click(liveButton);
    expect(screen.getByText('Paused')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Paused'));
    expect(screen.getByText('● Live')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    (trpc.realtimeAnalytics.getLiveMetrics.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    });

    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('displays all platform names in breakdown', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('Spotify')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Apple Podcasts')).toBeInTheDocument();
    expect(screen.getByText('Amazon Music')).toBeInTheDocument();
  });

  it('formats large numbers with commas', () => {
    render(<RealtimeAnalyticsDashboard />);
    // Check that numbers are formatted with commas
    expect(screen.getByText('274,000')).toBeInTheDocument();
    expect(screen.getByText('12,450')).toBeInTheDocument();
  });

  it('displays growth rates for platforms', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('↑ 12.3%')).toBeInTheDocument();
    expect(screen.getByText('↑ 15.6%')).toBeInTheDocument();
  });

  it('displays percentage breakdowns in geography', async () => {
    render(<RealtimeAnalyticsDashboard />);
    const geoTab = screen.getByText('Geography');
    await userEvent.click(geoTab);
    
    await waitFor(() => {
      expect(screen.getByText('35.9%')).toBeInTheDocument();
      expect(screen.getByText('12.5%')).toBeInTheDocument();
    });
  });

  it('renders all required metric cards', () => {
    render(<RealtimeAnalyticsDashboard />);
    expect(screen.getByText('Total Listeners')).toBeInTheDocument();
    expect(screen.getByText('Active Now')).toBeInTheDocument();
    expect(screen.getByText('Top Platform')).toBeInTheDocument();
    expect(screen.getByText('Countries')).toBeInTheDocument();
  });
});
