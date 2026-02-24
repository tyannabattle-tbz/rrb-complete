import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Zap } from 'lucide-react';

export interface StreamQuality {
  id: string;
  label: string;
  bitrate: number;
  format: string;
  bandwidth: 'low' | 'medium' | 'high';
  description: string;
}

export const STREAM_QUALITIES: StreamQuality[] = [
  {
    id: 'low',
    label: 'Low Quality',
    bitrate: 64,
    format: 'MP3',
    bandwidth: 'low',
    description: '64 kbps - Best for slow connections',
  },
  {
    id: 'medium',
    label: 'Standard Quality',
    bitrate: 128,
    format: 'AAC',
    bandwidth: 'medium',
    description: '128 kbps - Balanced quality and bandwidth',
  },
  {
    id: 'high',
    label: 'High Quality',
    bitrate: 320,
    format: 'AAC',
    bandwidth: 'high',
    description: '320 kbps - Best audio quality',
  },
];

interface StreamQualitySelectorProps {
  currentQuality: string;
  onQualityChange: (qualityId: string) => void;
  disabled?: boolean;
}

export const StreamQualitySelector: React.FC<StreamQualitySelectorProps> = ({
  currentQuality,
  onQualityChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = STREAM_QUALITIES.find(q => q.id === currentQuality) || STREAM_QUALITIES[1];

  return (
    <div className="relative inline-block">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        title="Change stream quality"
      >
        <Volume2 className="w-4 h-4" />
        <span className="text-xs font-medium">{current.bitrate}kbps</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-[280px]">
          <div className="p-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white">Stream Quality</h3>
            <p className="text-xs text-slate-400 mt-1">Select your preferred audio quality</p>
          </div>

          <div className="p-2 space-y-2">
            {STREAM_QUALITIES.map(quality => (
              <button
                key={quality.id}
                onClick={() => {
                  onQualityChange(quality.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  currentQuality === quality.id
                    ? 'bg-amber-600/20 border border-amber-600 text-amber-400'
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{quality.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{quality.description}</div>
                  </div>
                  {currentQuality === quality.id && <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />}
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-slate-700 bg-slate-900/50">
            <p className="text-xs text-slate-400">
              💡 <strong>Tip:</strong> Choose based on your internet speed. Higher quality requires more bandwidth.
            </p>
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default StreamQualitySelector;
