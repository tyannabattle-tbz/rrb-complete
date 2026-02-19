'use client';

import React, { useState } from 'react';
import { Radio, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Channel {
  id: string;
  name: string;
  color: string;
  listeners?: number;
  isLive?: boolean;
  description?: string;
}

interface ChannelSurfBarProps {
  channels?: Channel[];
  selectedChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  className?: string;
  compactMode?: boolean;
}

const DEFAULT_CHANNELS: Channel[] = [
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
  {
    id: 'annas-company',
    name: "Anna's Company",
    color: 'from-pink-500 to-rose-500',
    listeners: 156,
    isLive: false,
    description: 'Artist and model management',
  },
  {
    id: 'jaelon-enterprises',
    name: 'Jaelon Enterprises',
    color: 'from-purple-500 to-violet-500',
    listeners: 89,
    isLive: true,
    description: 'Investment and bookkeeping',
  },
  {
    id: 'little-c',
    name: 'Little C Productions',
    color: 'from-green-500 to-emerald-500',
    listeners: 203,
    isLive: true,
    description: 'Video and sound recording',
  },
];

export function ChannelSurfBar({
  channels = DEFAULT_CHANNELS,
  selectedChannelId = 'rrb-main',
  onChannelSelect,
  className,
  compactMode = false,
}: ChannelSurfBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Desktop: Fixed right sidebar
  const desktopBar = (
    <div className={cn(
      'hidden lg:flex flex-col gap-3 p-4 bg-card border border-border rounded-lg',
      className
    )}>
      <h3 className="text-sm font-semibold text-foreground">Channels</h3>
      <div className="space-y-2">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={cn(
              'w-full p-3 rounded-lg text-left transition-all duration-200 group',
              selectedChannelId === channel.id
                ? 'ring-2 ring-offset-2 ring-offset-background bg-amber-500/10'
                : 'hover:bg-accent/10'
            )}
            title={channel.description}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-3 h-3 rounded-full transition-all',
                channel.isLive ? 'animate-pulse bg-red-500' : 'bg-gray-500'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {channel.name}
                </p>
                {channel.listeners && (
                  <p className="text-xs text-foreground/60">
                    {channel.listeners.toLocaleString()} listeners
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Mobile: Floating button + dropdown
  const mobileBar = (
    <div className="lg:hidden fixed bottom-20 right-4 z-40">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-card border border-border rounded-lg shadow-lg p-3 w-48 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Channels</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-accent/10 rounded"
            >
              <X className="w-4 h-4 text-foreground/60" />
            </button>
          </div>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  onChannelSelect(channel.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full p-2 rounded-lg text-left text-xs transition-colors',
                  selectedChannelId === channel.id
                    ? 'bg-amber-500/20 border border-amber-500'
                    : 'hover:bg-accent/10'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    channel.isLive ? 'animate-pulse bg-red-500' : 'bg-gray-500'
                  )} />
                  <span className="font-semibold text-foreground">{channel.name}</span>
                </div>
                {channel.listeners && (
                  <p className="text-xs text-foreground/60 ml-4">
                    {channel.listeners.toLocaleString()} listeners
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-14 h-14 p-0 bg-amber-500 hover:bg-amber-600 text-black shadow-lg"
        title="Channel Surf"
      >
        <Radio className="w-6 h-6" />
      </Button>
    </div>
  );

  return (
    <>
      {desktopBar}
      {mobileBar}
    </>
  );
}
