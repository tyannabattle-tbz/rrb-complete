/**
 * Frequency Selector Component
 * 
 * Allows listeners to select healing/meditation frequencies
 * Supports 432 Hz, 528 Hz, and other Solfeggio frequencies
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Radio } from 'lucide-react';

export interface FrequencySelectorProps {
  currentFrequency: number;
  onFrequencyChange: (frequency: number) => void;
  channelId?: string;
  supportedFrequencies?: number[];
}

interface FrequencyInfo {
  hz: number;
  name: string;
  description: string;
  benefits: string[];
  solfeggio?: boolean;
}

const SOLFEGGIO_FREQUENCIES: FrequencyInfo[] = [
  {
    hz: 174,
    name: 'Root Chakra',
    description: 'Foundation & Grounding',
    benefits: ['Stability', 'Security', 'Grounding'],
    solfeggio: true,
  },
  {
    hz: 285,
    name: 'Sacral Chakra',
    description: 'Creativity & Sexuality',
    benefits: ['Creativity', 'Passion', 'Sensuality'],
    solfeggio: true,
  },
  {
    hz: 396,
    name: 'Solar Plexus',
    description: 'Personal Power',
    benefits: ['Confidence', 'Willpower', 'Transformation'],
    solfeggio: true,
  },
  {
    hz: 432,
    name: 'Heart Chakra',
    description: 'Love & Harmony',
    benefits: ['Love', 'Compassion', 'Harmony'],
    solfeggio: true,
  },
  {
    hz: 528,
    name: 'Throat Chakra',
    description: 'Communication & Truth',
    benefits: ['Communication', 'Truth', 'Healing'],
    solfeggio: true,
  },
  {
    hz: 639,
    name: 'Third Eye',
    description: 'Intuition & Vision',
    benefits: ['Intuition', 'Clarity', 'Insight'],
    solfeggio: true,
  },
  {
    hz: 741,
    name: 'Crown Chakra',
    description: 'Spiritual Connection',
    benefits: ['Spirituality', 'Awareness', 'Enlightenment'],
    solfeggio: true,
  },
  {
    hz: 852,
    name: 'Transcendence',
    description: 'Higher Consciousness',
    benefits: ['Transcendence', 'Awakening', 'Connection'],
    solfeggio: true,
  },
];

export function FrequencySelector({
  currentFrequency,
  onFrequencyChange,
  channelId,
  supportedFrequencies,
}: FrequencySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter to supported frequencies if specified
  const availableFrequencies = supportedFrequencies
    ? SOLFEGGIO_FREQUENCIES.filter(f => supportedFrequencies.includes(f.hz))
    : SOLFEGGIO_FREQUENCIES;

  const currentFreqInfo = availableFrequencies.find(f => f.hz === currentFrequency);

  return (
    <div className="w-full space-y-3">
      {/* Compact Frequency Display */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20">
            <Radio className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Frequency</p>
            <p className="text-lg font-semibold">
              {currentFrequency} Hz
              {currentFreqInfo && ` • ${currentFreqInfo.name}`}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          {isExpanded ? 'Hide' : 'Select'} Frequency
        </Button>
      </div>

      {/* Expanded Frequency Selector */}
      {isExpanded && (
        <Card className="border-purple-500/30 bg-gradient-to-b from-purple-950/10 to-blue-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Solfeggio Healing Frequencies</CardTitle>
            <CardDescription>
              Select a frequency to enhance your listening experience with healing vibrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              {availableFrequencies.map(freq => (
                <button
                  key={freq.hz}
                  onClick={() => {
                    onFrequencyChange(freq.hz);
                    setIsExpanded(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    currentFrequency === freq.hz
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-muted hover:border-purple-500/50 hover:bg-purple-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {freq.hz} Hz • {freq.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{freq.description}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {freq.benefits.map(benefit => (
                          <Badge key={benefit} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {currentFrequency === freq.hz && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center mt-1 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Frequency Info */}
            {currentFreqInfo && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-semibold text-blue-100 mb-2">
                  {currentFreqInfo.name} ({currentFrequency} Hz)
                </p>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  {currentFreqInfo.description}. This frequency is associated with {currentFreqInfo.benefits.join(', ')}.
                </p>
              </div>
            )}

            {/* Default Frequency Note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-100">
                💡 <strong>Tip:</strong> 432 Hz and 528 Hz are the most commonly used healing frequencies. Try different frequencies to find what resonates with you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Frequency Indicator Badge
 * Shows current frequency in a compact badge format
 */
export function FrequencyBadge({ frequency }: { frequency: number }) {
  const freqInfo = SOLFEGGIO_FREQUENCIES.find(f => f.hz === frequency);

  return (
    <Badge variant="outline" className="gap-1 bg-purple-500/10 border-purple-500/30">
      <Radio className="w-3 h-3" />
      {frequency} Hz {freqInfo && `• ${freqInfo.name}`}
    </Badge>
  );
}

/**
 * Frequency Indicator with Visual Waveform
 */
export function FrequencyWaveform({ frequency }: { frequency: number }) {
  // Generate waveform visualization based on frequency
  const bars = Array.from({ length: 20 }, (_, i) => {
    const wave = Math.sin((i / 20) * Math.PI * 2 + (frequency / 100)) * 0.5 + 0.5;
    return wave;
  });

  return (
    <div className="flex items-center gap-1 h-8">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-sm opacity-75"
          style={{
            height: `${height * 100}%`,
            minHeight: '2px',
          }}
        />
      ))}
    </div>
  );
}
