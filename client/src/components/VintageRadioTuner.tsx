import React, { useState } from 'react';
import { Volume2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface Frequency {
  name: string;
  hz: number;
  description: string;
  color: string;
}

const SOLFEGGIO_FREQUENCIES: Frequency[] = [
  { name: 'Root Chakra', hz: 174, description: 'Grounding & Protection', color: 'from-red-600 to-red-400' },
  { name: 'Sacral Chakra', hz: 285, description: 'Creativity & Sexuality', color: 'from-orange-600 to-orange-400' },
  { name: 'Solar Plexus', hz: 396, description: 'Liberation & Fear Release', color: 'from-yellow-600 to-yellow-400' },
  { name: 'Heart Chakra', hz: 417, description: 'Transformation & Miracles', color: 'from-green-600 to-green-400' },
  { name: 'Healing Frequency', hz: 432, description: 'Universal Harmony', color: 'from-blue-600 to-blue-400' },
  { name: 'Throat Chakra', hz: 528, description: 'Love & DNA Repair', color: 'from-cyan-600 to-cyan-400' },
  { name: 'Third Eye', hz: 639, description: 'Connection & Relationships', color: 'from-indigo-600 to-indigo-400' },
  { name: 'Crown Chakra', hz: 741, description: 'Intuition & Awakening', color: 'from-purple-600 to-purple-400' },
  { name: 'Divine Connection', hz: 852, description: 'Return to Spiritual Order', color: 'from-violet-600 to-violet-400' },
  { name: 'Ascension', hz: 963, description: 'Pure Consciousness', color: 'from-pink-600 to-pink-400' },
];

interface VintageRadioTunerProps {
  onFrequencyChange?: (frequency: number) => void;
  onPlayToggle?: (isPlaying: boolean) => void;
  onVolumeChange?: (volume: number) => void;
}

export function VintageRadioTuner({ onFrequencyChange, onPlayToggle, onVolumeChange }: VintageRadioTunerProps = {}) {
  const [currentFrequency, setCurrentFrequency] = useState<Frequency>(
    SOLFEGGIO_FREQUENCIES[4] // Default to 432Hz
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [displayFrequency, setDisplayFrequency] = useState(432);

  const handleTune = (frequency: Frequency) => {
    setCurrentFrequency(frequency);
    setDisplayFrequency(frequency.hz);
    onFrequencyChange?.(frequency.hz);
  };

  const handleFrequencySweep = (value: number[]) => {
    const newHz = Math.round(value[0]);
    setDisplayFrequency(newHz);
    
    const closest = SOLFEGGIO_FREQUENCIES.reduce((prev, curr) => {
      return Math.abs(curr.hz - newHz) < Math.abs(prev.hz - newHz) ? curr : prev;
    });
    
    if (closest.hz === newHz) {
      setCurrentFrequency(closest);
      onFrequencyChange?.(closest.hz);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-2xl shadow-2xl p-8 border-8 border-amber-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-amber-300" />
            <h2 className="text-3xl font-bold text-amber-100">RRB Radio</h2>
          </div>
          <div className="text-sm text-amber-300 font-mono">LIVE</div>
        </div>

        <div className="bg-black rounded-lg p-6 mb-6 border-4 border-amber-800 shadow-inner">
          <div className="text-center">
            <div className="text-amber-300 text-sm font-mono tracking-widest mb-2">FREQUENCY</div>
            <div className="text-6xl font-bold text-amber-400 font-mono tracking-tight">
              {displayFrequency}
            </div>
            <div className="text-amber-300 text-lg font-mono mt-2">Hz</div>
          </div>
        </div>

        <div className="bg-amber-900 bg-opacity-50 rounded-lg p-4 mb-6 border-2 border-amber-700">
          <h3 className="text-xl font-bold text-amber-100">{currentFrequency.name}</h3>
          <p className="text-amber-300 text-sm mt-1">{currentFrequency.description}</p>
        </div>

        <div className="mb-8">
          <label className="block text-amber-300 text-sm font-mono mb-3">TUNE FREQUENCY</label>
          <Slider
            value={[displayFrequency]}
            onValueChange={handleFrequencySweep}
            min={174}
            max={963}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-amber-400 font-mono mt-2">
            <span>174 Hz</span>
            <span>963 Hz</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {SOLFEGGIO_FREQUENCIES.map((freq) => (
            <button
              key={freq.hz}
              onClick={() => handleTune(freq)}
              className={`p-3 rounded-lg font-mono text-sm font-bold transition-all ${
                currentFrequency.hz === freq.hz
                  ? `bg-gradient-to-r ${freq.color} text-white shadow-lg scale-105`
                  : 'bg-amber-800 text-amber-200 hover:bg-amber-700'
              }`}
            >
              <div className="text-xs opacity-75">{freq.hz} Hz</div>
              <div className="text-xs">{freq.name}</div>
            </button>
          ))}
        </div>

        <div className="bg-amber-900 bg-opacity-50 rounded-lg p-4 mb-6 border-2 border-amber-700">
          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-amber-300" />
            <Slider
              value={[volume]}
              onValueChange={(value) => {
                setVolume(value[0]);
                onVolumeChange?.(value[0]);
              }}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-amber-300 font-mono text-sm w-12 text-right">{volume}%</span>
          </div>
        </div>

        <Button
          onClick={() => {
            const newState = !isPlaying;
            setIsPlaying(newState);
            onPlayToggle?.(newState);
          }}
          className={`w-full py-6 text-lg font-bold rounded-lg transition-all ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isPlaying ? '⏹ STOP BROADCAST' : '▶ PLAY BROADCAST'}
        </Button>

        {isPlaying && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-amber-300 font-mono text-sm">Broadcasting at {currentFrequency.hz} Hz</span>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Solfeggio Healing Frequencies • Default: 432 Hz Universal Harmony</p>
        <p className="mt-2 text-xs">Select a frequency to tune into healing vibrations</p>
      </div>
    </div>
  );
}
