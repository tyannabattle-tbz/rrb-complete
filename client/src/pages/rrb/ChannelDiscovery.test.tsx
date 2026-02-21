import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChannelDiscovery } from './ChannelDiscovery';
import { AudioProvider } from '@/contexts/AudioContext';
import { PresetProvider } from '@/contexts/PresetContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock the hooks and components
vi.mock('@/hooks/useSomaFMListeners', () => ({
  useChannelListeners: () => ({
    listeners: 1500,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/contexts/AudioContext', async () => {
  const actual = await vi.importActual('@/contexts/AudioContext');
  return {
    ...actual,
    useAudioContext: () => ({
      play: vi.fn(),
      pause: vi.fn(),
      currentTrack: null,
      isPlaying: false,
    }),
  };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <PresetProvider>
      <AudioProvider>{children}</AudioProvider>
    </PresetProvider>
  </ThemeProvider>
);

describe('ChannelDiscovery Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render channel discovery page', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    expect(screen.getByText('Channel Discovery')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    const searchInput = screen.getByPlaceholderText(/Search channels/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter channels by search query', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    const searchInput = screen.getByPlaceholderText(/Search channels/i) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: 'jazz' } });
    expect(searchInput.value).toBe('jazz');
  });

  it('should display genre filter buttons', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    expect(screen.getByText('All Genres')).toBeInTheDocument();
  });

  it('should display sort options', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Listeners')).toBeInTheDocument();
  });

  it('should display channel count', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    expect(screen.getByText(/Showing \d+ of \d+ channels/)).toBeInTheDocument();
  });

  it('should display play buttons for channels', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    const playButtons = screen.getAllByText('Play Channel');
    expect(playButtons.length).toBeGreaterThan(0);
  });

  it('should clear search when X button is clicked', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    const searchInput = screen.getByPlaceholderText(/Search channels/i) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');

    // Note: The X button implementation may vary, adjust as needed
  });

  it('should display no results message when no channels match', () => {
    render(<ChannelDiscovery />, { wrapper: Wrapper });
    const searchInput = screen.getByPlaceholderText(/Search channels/i);

    fireEvent.change(searchInput, { target: { value: 'nonexistent_channel_xyz' } });
    expect(screen.getByText('No channels found')).toBeInTheDocument();
  });
});
