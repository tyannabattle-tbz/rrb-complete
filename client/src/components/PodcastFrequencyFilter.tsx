import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

export const SOLFEGGIO_FREQUENCIES = [
  { hz: 174, name: 'Root Chakra', color: 'bg-red-600', description: 'Foundation & Grounding' },
  { hz: 285, name: 'Sacral Chakra', color: 'bg-orange-600', description: 'Creativity & Sexuality' },
  { hz: 396, name: 'Solar Plexus', color: 'bg-yellow-600', description: 'Power & Will' },
  { hz: 417, name: 'Heart Chakra', color: 'bg-green-600', description: 'Love & Healing' },
  { hz: 528, name: 'Throat Chakra', color: 'bg-blue-600', description: 'Communication & Truth' },
  { hz: 639, name: 'Third Eye', color: 'bg-indigo-600', description: 'Intuition & Vision' },
  { hz: 741, name: 'Crown Chakra', color: 'bg-purple-600', description: 'Enlightenment & Unity' },
  { hz: 852, name: 'Ascension', color: 'bg-pink-600', description: 'Spiritual Awakening' },
];

interface PodcastFrequencyFilterProps {
  selectedFrequencies?: number[];
  onFrequencyChange?: (frequencies: number[]) => void;
  className?: string;
}

export function PodcastFrequencyFilter({
  selectedFrequencies = [],
  onFrequencyChange,
  className = '',
}: PodcastFrequencyFilterProps) {
  const [selected, setSelected] = useState<number[]>(selectedFrequencies);

  const handleFrequencyToggle = (hz: number) => {
    const newSelected = selected.includes(hz)
      ? selected.filter((f) => f !== hz)
      : [...selected, hz];
    setSelected(newSelected);
    onFrequencyChange?.(newSelected);
  };

  const handleClearAll = () => {
    setSelected([]);
    onFrequencyChange?.([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-pink-400" />
          Solfeggio Frequencies
        </h3>
        {selected.length > 0 && (
          <Button
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SOLFEGGIO_FREQUENCIES.map((freq) => (
          <button
            key={freq.hz}
            onClick={() => handleFrequencyToggle(freq.hz)}
            className={`p-3 rounded-lg border-2 transition-all text-left group ${
              selected.includes(freq.hz)
                ? `${freq.color} border-white/50 text-white`
                : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-pink-500/50'
            }`}
          >
            <div className="font-semibold text-sm">{freq.hz} Hz</div>
            <div className="text-xs font-medium mt-1 opacity-90">{freq.name}</div>
            <div className="text-xs opacity-75 mt-1">{freq.description}</div>
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="p-3 bg-slate-800/50 rounded-lg border border-pink-500/20">
          <p className="text-sm text-gray-300 mb-2">Selected Frequencies:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((hz) => {
              const freq = SOLFEGGIO_FREQUENCIES.find((f) => f.hz === hz);
              return (
                <Badge
                  key={hz}
                  className={`${freq?.color} text-white`}
                >
                  {hz} Hz - {freq?.name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
