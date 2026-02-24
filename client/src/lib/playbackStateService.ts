/**
 * Playback State Service
 * Manages persistent playback state including current channel, time, and volume
 */

export interface PlaybackState {
  currentChannelId: string;
  currentEpisodeId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  quality: 'low' | 'medium' | 'high';
  lastPlayedAt: Date;
  playHistory: PlayHistoryEntry[];
}

export interface PlayHistoryEntry {
  channelId: string;
  episodeId: string;
  playedAt: Date;
  duration: number;
}

const STORAGE_KEY = 'playback-state';
const HISTORY_KEY = 'play-history';
const MAX_HISTORY_ENTRIES = 100;

const DEFAULT_STATE: PlaybackState = {
  currentChannelId: 'rockin-boogie',
  currentEpisodeId: 'rr-001',
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  volume: 70,
  quality: 'medium',
  lastPlayedAt: new Date(),
  playHistory: [],
};

/**
 * Get current playback state
 */
export function getPlaybackState(): PlaybackState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        lastPlayedAt: new Date(parsed.lastPlayedAt),
        playHistory: (parsed.playHistory || []).map((entry: any) => ({
          ...entry,
          playedAt: new Date(entry.playedAt),
        })),
      };
    }
  } catch (error) {
    console.error('Failed to parse playback state:', error);
  }
  return DEFAULT_STATE;
}

/**
 * Update playback state
 */
export function updatePlaybackState(updates: Partial<PlaybackState>): PlaybackState {
  const current = getPlaybackState();
  const updated = {
    ...current,
    ...updates,
    lastPlayedAt: new Date(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Save current playback position
 */
export function savePlaybackPosition(channelId: string, episodeId: string, currentTime: number, duration: number): void {
  const state = getPlaybackState();
  updatePlaybackState({
    currentChannelId: channelId,
    currentEpisodeId: episodeId,
    currentTime,
    duration,
  });

  // Add to history
  addToPlayHistory(channelId, episodeId, duration);
}

/**
 * Add entry to play history
 */
export function addToPlayHistory(channelId: string, episodeId: string, duration: number): void {
  const state = getPlaybackState();
  const history = state.playHistory || [];

  const newEntry: PlayHistoryEntry = {
    channelId,
    episodeId,
    playedAt: new Date(),
    duration,
  };

  history.unshift(newEntry);

  // Keep only last 100 entries
  if (history.length > MAX_HISTORY_ENTRIES) {
    history.pop();
  }

  updatePlaybackState({ playHistory: history });
}

/**
 * Get play history
 */
export function getPlayHistory(): PlayHistoryEntry[] {
  const state = getPlaybackState();
  return state.playHistory || [];
}

/**
 * Get most recently played channels
 */
export function getMostRecentChannels(limit: number = 5): string[] {
  const history = getPlayHistory();
  const channels = new Map<string, Date>();

  history.forEach(entry => {
    if (!channels.has(entry.channelId) || channels.get(entry.channelId)! < entry.playedAt) {
      channels.set(entry.channelId, entry.playedAt);
    }
  });

  return Array.from(channels.entries())
    .sort((a, b) => b[1].getTime() - a[1].getTime())
    .slice(0, limit)
    .map(([channelId]) => channelId);
}

/**
 * Get listening statistics
 */
export function getListeningStats(): {
  totalChannelsPlayed: number;
  totalTimeListened: number;
  mostPlayedChannel: string | null;
  averageSessionLength: number;
} {
  const history = getPlayHistory();

  if (history.length === 0) {
    return {
      totalChannelsPlayed: 0,
      totalTimeListened: 0,
      mostPlayedChannel: null,
      averageSessionLength: 0,
    };
  }

  const channels = new Set(history.map(h => h.channelId));
  const totalTime = history.reduce((sum, h) => sum + h.duration, 0);
  const channelCounts = new Map<string, number>();

  history.forEach(entry => {
    channelCounts.set(entry.channelId, (channelCounts.get(entry.channelId) || 0) + 1);
  });

  let mostPlayedChannel: string | null = null;
  let maxCount = 0;

  channelCounts.forEach((count, channelId) => {
    if (count > maxCount) {
      maxCount = count;
      mostPlayedChannel = channelId;
    }
  });

  return {
    totalChannelsPlayed: channels.size,
    totalTimeListened: totalTime,
    mostPlayedChannel,
    averageSessionLength: totalTime / history.length,
  };
}

/**
 * Clear playback state
 */
export function clearPlaybackState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Resume playback from saved state
 */
export function resumePlayback(): PlaybackState {
  const state = getPlaybackState();
  return {
    ...state,
    isPlaying: true,
  };
}

/**
 * Pause playback
 */
export function pausePlayback(): PlaybackState {
  const state = getPlaybackState();
  return updatePlaybackState({
    isPlaying: false,
  });
}

export default {
  getPlaybackState,
  updatePlaybackState,
  savePlaybackPosition,
  addToPlayHistory,
  getPlayHistory,
  getMostRecentChannels,
  getListeningStats,
  clearPlaybackState,
  resumePlayback,
  pausePlayback,
};
