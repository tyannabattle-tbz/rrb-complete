/**
 * Audio Quality Selector Component
 * Allows users to select audio bitrate (128/192/320 kbps)
 */

import React, { useState, useEffect } from 'react';
import { Volume2, ChevronDown } from 'lucide-react';
import {
  getCurrentQuality,
  setQuality,
  getQualityOptions,
  getQualityDetails,
  getConnectionType,
  recommendQuality,
  type AudioQuality,
} from '@/lib/audioQuality';

interface AudioQualitySelectorProps {
  onQualityChange?: (quality: AudioQuality) => void;
  compact?: boolean;
  showRecommendation?: boolean;
}

export function AudioQualitySelector({
  onQualityChange,
  compact = false,
  showRecommendation = true,
}: AudioQualitySelectorProps) {
  const [currentQuality, setCurrentQuality] = useState<AudioQuality>(getCurrentQuality());
  const [isOpen, setIsOpen] = useState(false);
  const [recommendedQuality, setRecommendedQuality] = useState<AudioQuality | null>(null);

  useEffect(() => {
    if (showRecommendation) {
      const connectionType = getConnectionType();
      const recommended = recommendQuality(connectionType);
      setRecommendedQuality(recommended);
    }
  }, [showRecommendation]);

  const handleQualityChange = (quality: AudioQuality) => {
    setQuality(quality);
    setCurrentQuality(quality);
    onQualityChange?.(quality);
    setIsOpen(false);
  };

  const qualityOptions = getQualityOptions();
  const currentDetails = getQualityDetails(currentQuality);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
          title="Select audio quality"
        >
          <Volume2 className="w-4 h-4" />
          <span>{currentDetails.label}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-white/10 rounded-lg shadow-lg z-50 min-w-[200px]">
            {qualityOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleQualityChange(option.value)}
                className={`w-full text-left px-4 py-2 transition-colors ${
                  currentQuality === option.value
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'hover:bg-white/10 text-white'
                } ${option.value === recommendedQuality ? 'border-l-2 border-green-400' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {option.value === recommendedQuality && (
                    <span className="text-xs text-green-400">Recommended</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold">Audio Quality</h3>
      </div>

      <div className="space-y-2">
        {qualityOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleQualityChange(option.value)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              currentQuality === option.value
                ? 'bg-amber-500/20 border-2 border-amber-500'
                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">{option.label}</span>
              {option.value === recommendedQuality && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400">{option.description}</p>
            <p className="text-xs text-zinc-500 mt-1">{option.fileSize}</p>
          </button>
        ))}
      </div>

      <div className="text-xs text-zinc-400 p-2 bg-black/20 rounded">
        <p className="font-semibold mb-1">💡 Tip:</p>
        <p>
          Higher quality uses more data. On mobile, 128 kbps is recommended for 3G, 192 for 4G.
        </p>
      </div>
    </div>
  );
}
