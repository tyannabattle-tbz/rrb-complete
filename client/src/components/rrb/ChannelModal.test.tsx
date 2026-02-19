import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChannelModal } from './ChannelModal';

const mockChannels = [
  {
    id: 'rrb-main',
    name: 'RRB Main',
    listeners: 1240,
    isLive: true,
    color: 'orange',
  },
  {
    id: 'sean-music',
    name: "Sean's Music",
    listeners: 342,
    isLive: true,
    color: 'blue',
  },
];

describe('ChannelModal', () => {
  it('renders the modal when isOpen is true', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
      />
    );

    expect(screen.getByText('Select Channel')).toBeInTheDocument();
  });

  it('displays all channels', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
      />
    );

    expect(screen.getByText('RRB Main')).toBeInTheDocument();
    expect(screen.getByText("Sean's Music")).toBeInTheDocument();
  });

  it('shows listener count for each channel', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
      />
    );

    expect(screen.getByText(/1,240 listeners/)).toBeInTheDocument();
    expect(screen.getByText(/342 listeners/)).toBeInTheDocument();
  });

  it('calls onSelectChannel when a channel is clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
      />
    );

    const rrbMainButton = screen.getByText('RRB Main').closest('button');
    fireEvent.click(rrbMainButton!);

    expect(mockOnSelectChannel).toHaveBeenCalledWith('rrb-main');
  });

  it('closes the modal after selecting a channel', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
      />
    );

    const rrbMainButton = screen.getByText('RRB Main').closest('button');
    fireEvent.click(rrbMainButton!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows selected channel indicator', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
        selectedChannelId="rrb-main"
      />
    );

    expect(screen.getByText('✓ Selected')).toBeInTheDocument();
  });

  it('closes the modal when close button is clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays live indicator for live channels', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectChannel = vi.fn();

    render(
      <ChannelModal
        isOpen={true}
        onClose={mockOnClose}
        channels={mockChannels}
        onSelectChannel={mockOnSelectChannel}
      />
    );

    expect(screen.getByText(/Live/)).toBeInTheDocument();
  });
});
