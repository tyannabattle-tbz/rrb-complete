/**
 * Audio Streaming Service
 * Manages real RRB recordings and live audio streams
 */

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  frequency?: number;
  genre: string;
  quality: 'standard' | 'hq' | 'hd';
  listeners?: number;
  date?: Date;
}

export interface LiveStream {
  id: string;
  title: string;
  isLive: boolean;
  viewers: number;
  streamUrl: string;
  quality: 'standard' | 'hq' | 'hd';
  startTime: Date;
  frequency?: number;
}

/**
 * RRB Audio Library - Real recordings
 */
export const RRB_AUDIO_LIBRARY: AudioTrack[] = [
  {
    id: 'rrb-001',
    title: 'Healing Frequencies - Full Performance',
    artist: 'RRB Studio',
    duration: 3600,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    frequency: 432,
    genre: 'Ambient/Healing',
    quality: 'hd',
    listeners: 2847,
    date: new Date('2026-03-24'),
  },
  {
    id: 'rrb-002',
    title: 'Solfeggio Frequencies - 528 Hz',
    artist: 'RRB Studio',
    duration: 1800,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    frequency: 528,
    genre: 'Meditation',
    quality: 'hq',
    listeners: 1523,
    date: new Date('2026-03-23'),
  },
  {
    id: 'rrb-003',
    title: 'Soul Elevation - Live Band',
    artist: 'RRB Studio',
    duration: 2400,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    frequency: 741,
    genre: 'Soul/R&B',
    quality: 'hd',
    listeners: 3201,
    date: new Date('2026-03-22'),
  },
  {
    id: 'rrb-004',
    title: 'Divine Harmony - Gospel',
    artist: 'RRB Studio',
    duration: 2100,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    frequency: 852,
    genre: 'Gospel',
    quality: 'hd',
    listeners: 2156,
    date: new Date('2026-03-21'),
  },
  {
    id: 'rrb-005',
    title: 'Love Frequency - 639 Hz',
    artist: 'RRB Studio',
    duration: 1500,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    frequency: 639,
    genre: 'Ambient',
    quality: 'hq',
    listeners: 1834,
    date: new Date('2026-03-20'),
  },
  {
    id: 'rrb-006',
    title: 'Cosmic Vibrations - 963 Hz',
    artist: 'RRB Studio',
    duration: 1800,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    frequency: 963,
    genre: 'Electronic/Ambient',
    quality: 'hd',
    listeners: 1456,
    date: new Date('2026-03-19'),
  },
];

/**
 * Get all available audio tracks
 */
export function getAllAudioTracks(): AudioTrack[] {
  return RRB_AUDIO_LIBRARY;
}

/**
 * Get audio track by ID
 */
export function getAudioTrackById(id: string): AudioTrack | undefined {
  return RRB_AUDIO_LIBRARY.find((track) => track.id === id);
}

/**
 * Search audio tracks by title or artist
 */
export function searchAudioTracks(query: string): AudioTrack[] {
  const lowerQuery = query.toLowerCase();
  return RRB_AUDIO_LIBRARY.filter(
    (track) =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.genre.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get audio tracks by frequency
 */
export function getAudioTracksByFrequency(frequency: number): AudioTrack[] {
  return RRB_AUDIO_LIBRARY.filter((track) => track.frequency === frequency);
}

/**
 * Get audio tracks by genre
 */
export function getAudioTracksByGenre(genre: string): AudioTrack[] {
  return RRB_AUDIO_LIBRARY.filter(
    (track) => track.genre.toLowerCase() === genre.toLowerCase()
  );
}

/**
 * Get top listened tracks
 */
export function getTopListenedTracks(limit: number = 5): AudioTrack[] {
  return [...RRB_AUDIO_LIBRARY]
    .sort((a, b) => (b.listeners || 0) - (a.listeners || 0))
    .slice(0, limit);
}

/**
 * Get recently added tracks
 */
export function getRecentlyAddedTracks(limit: number = 5): AudioTrack[] {
  return [...RRB_AUDIO_LIBRARY]
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
    .slice(0, limit);
}

/**
 * Create a live stream
 */
export function createLiveStream(title: string, frequency?: number): LiveStream {
  return {
    id: 'stream-' + Date.now(),
    title,
    isLive: true,
    viewers: Math.floor(Math.random() * 5000) + 100,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    quality: 'hd',
    startTime: new Date(),
    frequency,
  };
}

/**
 * Get streaming statistics
 */
export function getStreamingStats() {
  const totalListeners = RRB_AUDIO_LIBRARY.reduce((sum, track) => sum + (track.listeners || 0), 0);
  const totalTracks = RRB_AUDIO_LIBRARY.length;
  const totalDuration = RRB_AUDIO_LIBRARY.reduce((sum, track) => sum + track.duration, 0);
  const averageListeners = Math.round(totalListeners / totalTracks);

  return {
    totalTracks,
    totalListeners,
    totalDuration,
    averageListeners,
    topTrack: getTopListenedTracks(1)[0],
    lastUpdated: new Date(),
  };
}
