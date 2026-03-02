import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AppliedPreset {
  presetId: string;
  presetName: string;
  effects: Array<{ type: string; intensity: number }>;
  transitions: Array<{ type: string; duration: number }>;
  appliedAt: number;
}

interface PresetContextType {
  appliedPreset: AppliedPreset | null;
  applyPreset: (preset: AppliedPreset) => void;
  clearPreset: () => void;
}

const PresetContext = createContext<PresetContextType | undefined>(undefined);

export function PresetProvider({ children }: { children: ReactNode }) {
  const [appliedPreset, setAppliedPreset] = useState<AppliedPreset | null>(null);

  const applyPreset = (preset: AppliedPreset) => {
    setAppliedPreset(preset);
    // Broadcast to all listeners (Studio, Rockin' Boogie, etc.)
    window.dispatchEvent(
      new CustomEvent('presetApplied', { detail: preset })
    );
  };

  const clearPreset = () => {
    setAppliedPreset(null);
    window.dispatchEvent(new CustomEvent('presetCleared'));
  };

  return (
    <PresetContext.Provider value={{ appliedPreset, applyPreset, clearPreset }}>
      {children}
    </PresetContext.Provider>
  );
}

export function usePreset() {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePreset must be used within PresetProvider');
  }
  return context;
}
