import { useState, useEffect } from 'react';

export interface FrequencySettings {
  frequency: number; // The selected frequency in Hz
  label: string;
}

const STORAGE_KEY = 'rockin-frequency-setting';

export const AVAILABLE_FREQUENCIES = [
  { value: 174, label: '174Hz', description: 'Pain Relief & Grounding' },
  { value: 285, label: '285Hz', description: 'Tissue Repair & Healing' },
  { value: 396, label: '396Hz', description: 'Liberation from Fear' },
  { value: 417, label: '417Hz', description: 'Undoing Situations' },
  { value: 432, label: '432Hz', description: 'Universal Frequency' },
  { value: 440, label: '440Hz', description: 'Standard Tuning' },
  { value: 528, label: '528Hz', description: 'Miracle Tone (DNA Repair)' },
  { value: 639, label: '639Hz', description: 'Connection & Harmony' },
  { value: 741, label: '741Hz', description: 'Awakening Intuition' },
  { value: 852, label: '852Hz', description: 'Spiritual Order' },
];

export function use432HzToggle() {
  const [frequency, setFrequency] = useState<FrequencySettings>({
    frequency: 432,
    label: '432Hz (Universal Frequency)',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFrequency(parsed);
      } catch (error) {
        console.error('Failed to parse frequency setting:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Update frequency
  const setSelectedFrequency = (frequencyValue: number) => {
    const freqData = AVAILABLE_FREQUENCIES.find(f => f.value === frequencyValue);
    if (freqData) {
      const updated = {
        frequency: frequencyValue,
        label: `${freqData.label} - ${freqData.description}`,
      };
      setFrequency(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Legacy toggle function for backward compatibility
  const toggle432Hz = () => {
    const newFrequency = frequency.frequency === 432 ? 440 : 432;
    setSelectedFrequency(newFrequency);
  };

  return {
    frequency,
    isLoaded,
    toggle432Hz,
    setSelectedFrequency,
    is432HzEnabled: frequency.frequency === 432,
    baseFrequency: frequency.frequency,
    availableFrequencies: AVAILABLE_FREQUENCIES,
  };
}
