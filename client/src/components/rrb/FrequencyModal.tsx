'use client';

import React from 'react';
import { X, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SOLFEGGIO_FREQUENCIES } from '@/lib/frequencyEQFilter';

interface FrequencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFrequency?: number;
  onFrequencySelect: (frequency: number) => void;
}

const PRESET_FREQUENCIES = [174, 285, 396, 417, 528, 639, 741, 852, 432, 440];

export function FrequencyModal({
  isOpen,
  onClose,
  selectedFrequency = 440,
  onFrequencySelect,
}: FrequencyModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet Modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl z-50 lg:hidden max-h-[80vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">
              Frequency Tuning
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Current Selection Display */}
          <div className="bg-accent/10 border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-foreground/60 mb-2">Currently Tuned To</p>
            <p className="text-3xl font-bold text-amber-500">
              🎵 {selectedFrequency} Hz
            </p>
            {SOLFEGGIO_FREQUENCIES[selectedFrequency] && (
              <p className="text-sm text-foreground/70 mt-2">
                {SOLFEGGIO_FREQUENCIES[selectedFrequency].healingProperty}
              </p>
            )}
          </div>

          {/* Frequency Grid */}
          <div>
            <p className="text-xs font-semibold text-foreground/60 mb-3 uppercase tracking-wide">
              Solfeggio Frequencies
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_FREQUENCIES.map((freq) => {
                const config = SOLFEGGIO_FREQUENCIES[freq];
                if (!config) return null;

                const isSelected = selectedFrequency === freq;

                return (
                  <button
                    key={freq}
                    onClick={() => {
                      onFrequencySelect(freq);
                      onClose();
                    }}
                    className={cn(
                      'p-4 rounded-lg transition-all duration-200 text-center',
                      isSelected
                        ? 'bg-amber-500 text-black shadow-lg ring-2 ring-amber-300'
                        : 'bg-card border border-border text-foreground hover:bg-accent/20'
                    )}
                  >
                    <p className="text-2xl mb-1">🎵</p>
                    <p className="font-semibold text-sm">{freq} Hz</p>
                    <p className="text-xs text-foreground/70 mt-1">
                      {config.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency Info */}
          <div className="bg-background/50 border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
              About These Frequencies
            </p>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Solfeggio frequencies are believed to have healing properties. Each frequency resonates with different aspects of wellness and transformation. Tap any frequency above to tune your listening experience.
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
