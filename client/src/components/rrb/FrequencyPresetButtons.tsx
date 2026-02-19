'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SOLFEGGIO_FREQUENCIES } from '@/lib/frequencyEQFilter';

interface FrequencyPresetButtonsProps {
  selectedFrequency?: number;
  onFrequencySelect: (frequency: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PRESET_FREQUENCIES = [174, 285, 396, 417, 528, 639, 741, 852, 432, 440];

export function FrequencyPresetButtons({
  selectedFrequency = 440,
  onFrequencySelect,
  className,
  size = 'sm',
}: FrequencyPresetButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {PRESET_FREQUENCIES.map((freq) => {
        const config = SOLFEGGIO_FREQUENCIES[freq];
        if (!config) return null;

        return (
          <button
            key={freq}
            onClick={() => onFrequencySelect(freq)}
            className={cn(
              'transition-all duration-200 rounded-lg font-semibold',
              size === 'sm' && 'px-3 py-1 text-xs',
              size === 'md' && 'px-4 py-2 text-sm',
              size === 'lg' && 'px-5 py-3 text-base',
              selectedFrequency === freq
                ? 'bg-amber-500 text-black shadow-lg ring-2 ring-amber-300'
                : 'bg-card border border-border text-foreground hover:bg-accent/10'
            )}
            title={config.healingProperty}
          >
            <span className="flex items-center gap-1">
              <span>🎵</span>
              <span>{config.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
