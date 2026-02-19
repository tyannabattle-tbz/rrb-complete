import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  FrequencyEQFilter, 
  SOLFEGGIO_FREQUENCIES, 
  getFrequencyConfig, 
  getAllFrequencies 
} from './frequencyEQFilter';

describe('FrequencyEQFilter', () => {
  let audioElement: HTMLAudioElement;
  let filter: FrequencyEQFilter;

  beforeEach(() => {
    audioElement = document.createElement('audio');
    filter = new FrequencyEQFilter(audioElement);
  });

  afterEach(() => {
    filter.destroy();
  });

  it('initializes with audio element', () => {
    expect(filter).toBeDefined();
  });

  it('applies frequency preset', async () => {
    await filter.applyFrequency(528);
    expect(filter.getCurrentFrequency()).toBe(528);
  });

  it('applies all Solfeggio frequencies without errors', async () => {
    const frequencies = [174, 285, 396, 417, 528, 639, 741, 852, 432, 440];

    for (const freq of frequencies) {
      await expect(filter.applyFrequency(freq)).resolves.not.toThrow();
      expect(filter.getCurrentFrequency()).toBe(freq);
    }
  });

  it('resets to neutral EQ (440 Hz)', async () => {
    await filter.applyFrequency(528);
    await filter.reset();
    expect(filter.getCurrentFrequency()).toBe(440);
  });

  it('handles invalid frequency gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await filter.applyFrequency(999);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('destroys resources without errors', () => {
    expect(() => filter.destroy()).not.toThrow();
  });
});

describe('SOLFEGGIO_FREQUENCIES', () => {
  it('contains all 10 frequencies', () => {
    const frequencies = Object.keys(SOLFEGGIO_FREQUENCIES).map(Number);
    expect(frequencies.length).toBe(10);
  });

  it('contains correct frequency values', () => {
    expect(SOLFEGGIO_FREQUENCIES[174]).toBeDefined();
    expect(SOLFEGGIO_FREQUENCIES[528]).toBeDefined();
    expect(SOLFEGGIO_FREQUENCIES[852]).toBeDefined();
  });

  it('has healing properties for each frequency', () => {
    Object.values(SOLFEGGIO_FREQUENCIES).forEach(config => {
      expect(config.healingProperty).toBeDefined();
      expect(config.healingProperty.length).toBeGreaterThan(0);
    });
  });

  it('has EQ presets for each frequency', () => {
    Object.values(SOLFEGGIO_FREQUENCIES).forEach(config => {
      expect(config.eqPreset).toBeDefined();
      expect(config.eqPreset.bass).toBeDefined();
      expect(config.eqPreset.mid).toBeDefined();
      expect(config.eqPreset.treble).toBeDefined();
    });
  });
});

describe('getFrequencyConfig', () => {
  it('returns config for valid frequency', () => {
    const config = getFrequencyConfig(528);
    expect(config).toBeDefined();
    expect(config?.frequency).toBe(528);
  });

  it('returns null for invalid frequency', () => {
    const config = getFrequencyConfig(999);
    expect(config).toBeNull();
  });
});

describe('getAllFrequencies', () => {
  it('returns all 10 frequencies', () => {
    const frequencies = getAllFrequencies();
    expect(frequencies.length).toBe(10);
  });

  it('returns frequencies sorted by value', () => {
    const frequencies = getAllFrequencies();
    for (let i = 1; i < frequencies.length; i++) {
      expect(frequencies[i].frequency).toBeGreaterThan(frequencies[i - 1].frequency);
    }
  });
});
