'use client';

import { useState, useEffect } from 'react';
import { Music, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { use432HzToggle, AVAILABLE_FREQUENCIES } from '@/hooks/rrb_use432HzToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

export function FrequencyToggle() {
  const { frequency, baseFrequency, setSelectedFrequency, isLoaded } = use432HzToggle();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return null;
  }

  // Group frequencies by category
  const foundationalFrequencies = AVAILABLE_FREQUENCIES.filter(f => f.value <= 285);
  const solfeggioFrequencies = AVAILABLE_FREQUENCIES.filter(f => f.value >= 396 && f.value <= 852);
  const standardFrequencies = AVAILABLE_FREQUENCIES.filter(f => f.value === 432 || f.value === 440);

  const getCurrentFrequencyLabel = () => {
    const freq = AVAILABLE_FREQUENCIES.find(f => f.value === baseFrequency);
    return freq ? freq.label : `${baseFrequency}Hz`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={`Current tuning: ${baseFrequency}Hz`}
          className="relative"
        >
          {baseFrequency === 432 ? (
            <Music className="w-5 h-5 text-accent" />
          ) : (
            <Music2 className="w-5 h-5" />
          )}
          <span className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-accent rounded text-xs text-white font-bold">
            {baseFrequency}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="text-sm font-semibold">
          Healing Frequencies
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Standard Tuning */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-foreground/60 px-2 py-1">
            Standard Tuning
          </DropdownMenuLabel>
          {standardFrequencies.map((freq) => (
            <DropdownMenuItem
              key={freq.value}
              onClick={() => setSelectedFrequency(freq.value)}
              className={`cursor-pointer ${baseFrequency === freq.value ? 'bg-accent/10' : ''}`}
            >
              <Music className="w-4 h-4 mr-2" />
              <div className="flex-1">
                <div className="font-semibold">{freq.label}</div>
                <div className="text-xs text-foreground/60">{freq.description}</div>
              </div>
              {baseFrequency === freq.value && <span className="ml-2 text-accent">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Foundational Frequencies */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-foreground/60 px-2 py-1">
            Foundational Frequencies
          </DropdownMenuLabel>
          {foundationalFrequencies.map((freq) => (
            <DropdownMenuItem
              key={freq.value}
              onClick={() => setSelectedFrequency(freq.value)}
              className={`cursor-pointer ${baseFrequency === freq.value ? 'bg-accent/10' : ''}`}
            >
              <Music2 className="w-4 h-4 mr-2" />
              <div className="flex-1">
                <div className="font-semibold">{freq.label}</div>
                <div className="text-xs text-foreground/60">{freq.description}</div>
              </div>
              {baseFrequency === freq.value && <span className="ml-2 text-accent">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Solfeggio Frequencies */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-foreground/60 px-2 py-1">
            Solfeggio Frequencies
          </DropdownMenuLabel>
          {solfeggioFrequencies.map((freq) => (
            <DropdownMenuItem
              key={freq.value}
              onClick={() => setSelectedFrequency(freq.value)}
              className={`cursor-pointer ${baseFrequency === freq.value ? 'bg-accent/10' : ''}`}
            >
              <Music className="w-4 h-4 mr-2" />
              <div className="flex-1">
                <div className="font-semibold">{freq.label}</div>
                <div className="text-xs text-foreground/60">{freq.description}</div>
              </div>
              {baseFrequency === freq.value && <span className="ml-2 text-accent">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled className="text-xs text-foreground/60 cursor-default py-2">
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold">Current: {getCurrentFrequencyLabel()}</span>
            <span className="text-foreground/50">Select a frequency to tune all audio</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
