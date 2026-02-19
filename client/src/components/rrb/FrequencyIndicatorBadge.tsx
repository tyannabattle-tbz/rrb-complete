'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SOLFEGGIO_FREQUENCIES } from '@/lib/frequencyEQFilter';

interface FrequencyIndicatorBadgeProps {
  frequency?: number;
  className?: string;
  showHealingProperty?: boolean;
}

export function FrequencyIndicatorBadge({
  frequency = 440,
  className,
  showHealingProperty = true,
}: FrequencyIndicatorBadgeProps) {
  const config = SOLFEGGIO_FREQUENCIES[frequency];

  if (!config) {
    return null;
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30',
      className
    )}>
      <span className="text-lg">🎵</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-amber-600">
          {config.name}
        </span>
        {showHealingProperty && (
          <span className="text-xs text-amber-600/70">
            {config.healingProperty}
          </span>
        )}
      </div>
    </div>
  );
}
