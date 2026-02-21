import React, { useState } from 'react';
import { Volume2, Radio } from 'lucide-react';

// Solfeggio Frequencies for Healing
export const SOLFEGGIO_FREQUENCIES = [
  { hz: 174, name: 'Grounding', description: 'Foundation & Safety' },
  { hz: 285, name: 'Cellular Repair', description: 'Tissue Healing' },
  { hz: 396, name: 'Liberation', description: 'Fear Release' },
  { hz: 417, name: 'Undoing', description: 'Change & Transformation' },
  { hz: 432, name: 'Universal Harmony', description: 'Natural Tuning' }, // Default
  { hz: 528, name: 'Love & Miracles', description: 'DNA Repair' },
  { hz: 639, name: 'Connection', description: 'Relationships' },
  { hz: 741, name: 'Intuition', description: 'Inner Wisdom' },
  { hz: 852, name: 'Awakening', description: 'Spiritual Return' },
  { hz: 963, name: 'Divine', description: 'Pure Consciousness' },
] as const;

interface FrequencyTunerProps {
  currentFrequency?: number;
  onFrequencyChange?: (frequency: number) => void;
}

export function FrequencyTuner({ currentFrequency = 432, onFrequencyChange }: FrequencyTunerProps) {
  const [selectedFreq, setSelectedFreq] = useState(currentFrequency);
  const [showDetails, setShowDetails] = useState(false);

  const handleFrequencyChange = (hz: number) => {
    setSelectedFreq(hz);
    onFrequencyChange?.(hz);
  };

  const currentFreqData = SOLFEGGIO_FREQUENCIES.find(f => f.hz === selectedFreq);

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Radio className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Frequency Tuner</h3>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold text-purple-400">{selectedFreq}Hz</div>
          <div className="text-xs text-gray-400">{currentFreqData?.name}</div>
        </div>
      </div>

      {/* Frequency Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {SOLFEGGIO_FREQUENCIES.map(freq => (
          <button
            key={freq.hz}
            onClick={() => handleFrequencyChange(freq.hz)}
            className={`p-3 rounded-lg transition-all text-center ${
              selectedFreq === freq.hz
                ? 'bg-purple-600 ring-2 ring-purple-400 scale-105'
                : 'bg-slate-700 hover:bg-slate-600 hover:scale-105'
            }`}
            title={`${freq.name}: ${freq.description}`}
          >
            <div className="text-sm font-bold text-white">{freq.hz}</div>
            <div className="text-[10px] text-gray-300 truncate">{freq.name}</div>
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="174"
          max="963"
          step="1"
          value={selectedFreq}
          onChange={(e) => handleFrequencyChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 px-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-sm text-gray-300 transition-colors text-left flex items-center justify-between"
      >
        <span>Frequency Information</span>
        <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Details Panel */}
      {showDetails && currentFreqData && (
        <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-purple-500/20">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-semibold text-purple-300 mb-1">Frequency</div>
              <div className="text-lg font-bold text-white">{currentFreqData.hz} Hz</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-purple-300 mb-1">Name</div>
              <div className="text-white">{currentFreqData.name}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-purple-300 mb-1">Purpose</div>
              <div className="text-gray-300">{currentFreqData.description}</div>
            </div>
            <div className="pt-3 border-t border-slate-600">
              <div className="text-xs text-gray-400">
                {currentFreqData.hz === 432 && 'Default tuning frequency. Universal harmony and natural resonance.'}
                {currentFreqData.hz === 528 && 'Known as the "Love Frequency". Associated with DNA repair and miracles.'}
                {currentFreqData.hz === 741 && 'Awakening intuition and inner wisdom. Spiritual activation.'}
                {currentFreqData.hz === 852 && 'Return to spiritual order. Awakening inner strength.'}
                {currentFreqData.hz === 963 && 'Pure consciousness. Connection to divine source.'}
                {![432, 528, 741, 852, 963].includes(currentFreqData.hz) && 'Solfeggio frequency for healing and transformation.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-gray-400 flex items-center gap-2">
        <Volume2 className="w-3 h-3" />
        <span>Select a frequency to tune the station. Default is 432Hz.</span>
      </div>
    </div>
  );
}
