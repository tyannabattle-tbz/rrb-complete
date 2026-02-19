import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChannelSurfBar, type Channel } from './ChannelSurfBar';

describe('ChannelSurfBar', () => {
  const mockChannels: Channel[] = [
    {
      id: 'rrb-main',
      name: 'RRB Main',
      color: 'from-amber-500 to-orange-500',
      listeners: 1240,
      isLive: true,
      description: 'Main RRB broadcast',
    },
    {
      id: 'seans-music',
      name: "Sean's Music",
      color: 'from-blue-500 to-cyan-500',
      listeners: 342,
      isLive: true,
      description: 'Music and sound publishing',
    },
  ];

  const mockOnChannelSelect = vi.fn();

  it('renders channel buttons', () => {
    render(
      <ChannelSurfBar
        channels={mockChannels}
        selectedChannelId="rrb-main"
        onChannelSelect={mockOnChannelSelect}
      />
    );

    expect(screen.getByText('RRB Main')).toBeInTheDocument();
    expect(screen.getByText("Sean's Music")).toBeInTheDocument();
  });

  it('calls onChannelSelect when channel is clicked', () => {
    render(
      <ChannelSurfBar
        channels={mockChannels}
        selectedChannelId="rrb-main"
        onChannelSelect={mockOnChannelSelect}
      />
    );

    const seansButton = screen.getByRole('button', { name: /Sean's Music/i });
    fireEvent.click(seansButton);

    expect(mockOnChannelSelect).toHaveBeenCalledWith('seans-music');
  });

  it('displays listener counts', () => {
    render(
      <ChannelSurfBar
        channels={mockChannels}
        selectedChannelId="rrb-main"
        onChannelSelect={mockOnChannelSelect}
      />
    );

    expect(screen.getByText('1,240 listeners')).toBeInTheDocument();
    expect(screen.getByText('342 listeners')).toBeInTheDocument();
  });

  it('uses default channels when none provided', () => {
    render(
      <ChannelSurfBar
        selectedChannelId="rrb-main"
        onChannelSelect={mockOnChannelSelect}
      />
    );

    expect(screen.getByText('RRB Main')).toBeInTheDocument();
    expect(screen.getByText("Sean's Music")).toBeInTheDocument();
  });
});
