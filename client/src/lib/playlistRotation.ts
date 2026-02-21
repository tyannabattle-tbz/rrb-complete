/**
 * 24/7 Playlist Rotation Service
 * Manages continuous playback with minimal repeats
 * Rotates through playlists to create seamless 24/7 streaming experience
 */

export interface PlaylistState {
  channelId: string;
  currentTrackIndex: number;
  playlistHistory: string[]; // Tracks played recently to avoid repeats
  lastRotationTime: number; // Timestamp of last rotation
}

// Store playlist states in memory
const playlistStates = new Map<string, PlaylistState>();

/**
 * Initialize playlist state for a channel
 */
export function initializePlaylist(channelId: string, playlist: string[]): PlaylistState {
  const state: PlaylistState = {
    channelId,
    currentTrackIndex: 0,
    playlistHistory: [],
    lastRotationTime: Date.now(),
  };
  playlistStates.set(channelId, state);
  return state;
}

/**
 * Get current track for a channel
 */
export function getCurrentTrack(channelId: string, playlist: string[]): string | undefined {
  let state = playlistStates.get(channelId);
  
  if (!state) {
    state = initializePlaylist(channelId, playlist);
  }
  
  if (playlist.length === 0) return undefined;
  return playlist[state.currentTrackIndex % playlist.length];
}

/**
 * Advance to next track in playlist
 * Tracks are rotated to minimize repeats
 */
export function getNextTrack(channelId: string, playlist: string[]): string | undefined {
  let state = playlistStates.get(channelId);
  
  if (!state) {
    state = initializePlaylist(channelId, playlist);
  }
  
  if (playlist.length === 0) return undefined;
  
  // Move to next track
  state.currentTrackIndex = (state.currentTrackIndex + 1) % playlist.length;
  state.lastRotationTime = Date.now();
  
  // Track history to avoid repeats
  const currentTrack = playlist[state.currentTrackIndex];
  state.playlistHistory.push(currentTrack);
  
  // Keep only last 50 tracks in history to avoid memory issues
  if (state.playlistHistory.length > 50) {
    state.playlistHistory.shift();
  }
  
  return currentTrack;
}

/**
 * Get playlist progress (0-1)
 */
export function getPlaylistProgress(channelId: string, playlistLength: number): number {
  const state = playlistStates.get(channelId);
  if (!state || playlistLength === 0) return 0;
  return (state.currentTrackIndex + 1) / playlistLength;
}

/**
 * Get time until next track rotation
 * Assumes each track is ~3-4 minutes (180-240 seconds)
 */
export function getTimeUntilNextTrack(channelId: string): number {
  const state = playlistStates.get(channelId);
  if (!state) return 0;
  
  const AVERAGE_TRACK_DURATION = 210; // 3.5 minutes in seconds
  const timeSinceRotation = (Date.now() - state.lastRotationTime) / 1000;
  const timeUntilNext = Math.max(0, AVERAGE_TRACK_DURATION - timeSinceRotation);
  
  return timeUntilNext;
}

/**
 * Reset playlist state (for channel switching)
 */
export function resetPlaylist(channelId: string): void {
  playlistStates.delete(channelId);
}

/**
 * Get all active playlists
 */
export function getActivePlaylists(): PlaylistState[] {
  return Array.from(playlistStates.values());
}

/**
 * Clear all playlist states
 */
export function clearAllPlaylists(): void {
  playlistStates.clear();
}
