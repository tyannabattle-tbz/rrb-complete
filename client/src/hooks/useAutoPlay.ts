/**
 * useAutoPlay Hook
 * 
 * Automatically plays RRB Main Radio at low volume (20%) on website entry.
 * Uses 432Hz frequency as default for healing properties.
 * Respects user preferences via localStorage.
 * 
 * A Canryn Production
 */
import { useEffect } from 'react';

const AUTOPLAY_ENABLED_KEY = 'rrb-autoplay-enabled';
const AUTOPLAY_VOLUME = 0.2; // 20%
const DEFAULT_FREQUENCY = 432; // Hz
const DEFAULT_CHANNEL_ID = 'ch-001'; // RRB Main Radio

export function useAutoPlay() {
  useEffect(() => {
    // Check if auto-play is enabled (default: true)
    const autoplayDisabled = localStorage.getItem(AUTOPLAY_ENABLED_KEY) === 'false';
    
    if (autoplayDisabled) {
      return;
    }

    // Simulate auto-play by dispatching a custom event
    const autoplayEvent = new CustomEvent('rrb-autoplay-request', {
      detail: {
        channelId: DEFAULT_CHANNEL_ID,
        volume: AUTOPLAY_VOLUME,
        frequency: DEFAULT_FREQUENCY,
        timestamp: Date.now(),
      },
    });

    window.dispatchEvent(autoplayEvent);
  }, []);

  const disableAutoPlay = () => {
    localStorage.setItem(AUTOPLAY_ENABLED_KEY, 'false');
  };

  const enableAutoPlay = () => {
    localStorage.setItem(AUTOPLAY_ENABLED_KEY, 'true');
  };

  const isAutoPlayEnabled = () => {
    return localStorage.getItem(AUTOPLAY_ENABLED_KEY) !== 'false';
  };

  return {
    disableAutoPlay,
    enableAutoPlay,
    isAutoPlayEnabled,
    AUTOPLAY_VOLUME,
    DEFAULT_FREQUENCY,
    DEFAULT_CHANNEL_ID,
  };
}
