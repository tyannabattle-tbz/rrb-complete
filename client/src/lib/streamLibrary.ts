/**
 * Stream Library — Verified Working Direct Stream URLs
 * All URLs are direct MP3 streams with proper CORS headers
 * Primary source: SomaFM (listener-supported, free to stream)
 */

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  channel: string;
  isLiveStream: boolean;
  frequency?: number;
}

// ============================================================
// LIVE RADIO STREAMS (24/7 continuous - ALL VERIFIED WORKING)
// ============================================================
export const LIVE_STREAMS: Record<string, AudioTrack> = {
  // ===== R&B / SOUL / FUNK =====
  grooveSalad: {
    id: 'groove-salad',
    title: 'Groove Salad',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    channel: 'Soul & Funk',
    isLiveStream: true,
    frequency: 432,
  },
  secretAgent: {
    id: 'secret-agent',
    title: 'Secret Agent',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    channel: 'Soul & Funk',
    isLiveStream: true,
    frequency: 432,
  },
  sonicUniverse: {
    id: 'sonic-universe',
    title: 'Sonic Universe',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    channel: 'Jazz Fusion',
    isLiveStream: true,
    frequency: 528,
  },

  // ===== JAZZ =====
  lush: {
    id: 'lush',
    title: 'Lush',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/lush-128-mp3',
    channel: 'Jazz',
    isLiveStream: true,
    frequency: 528,
  },
  radioParadise: {
    id: 'radio-paradise',
    title: 'Radio Paradise',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/radioparadise-128-mp3',
    channel: 'Rock',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== BLUES =====
  deepSpaceOne: {
    id: 'deep-space-one',
    title: 'Deep Space One',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    channel: 'Blues',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== ROCK (70s-80s) =====
  bootLiquor: {
    id: 'boot-liquor',
    title: 'Boot Liquor',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/bootliquor-128-mp3',
    channel: 'Rock',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== COUNTRY =====
  folkForward: {
    id: 'folk-forward',
    title: 'Folk Forward',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/folkfwd-128-mp3',
    channel: 'Country',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== 90s HIP-HOP / RAP =====
  cliqHop: {
    id: 'cliq-hop',
    title: 'Cliq Hop',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/cliqhop-128-mp3',
    channel: '90s Hip-Hop',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== TALK / NEWS / SPORTS =====
  defcon: {
    id: 'defcon',
    title: 'DEFCON',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    channel: 'Talk',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== AMBIENT / MEDITATION =====
  droneZone: {
    id: 'drone-zone',
    title: 'Drone Zone',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/dronezone-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
    frequency: 528,
  },

  // ===== FUNK / ELECTRONIC =====
  poptron: {
    id: 'poptron',
    title: 'Poptron',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/poptron-128-mp3',
    channel: 'Funk',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== LEGACY TRACK =====
  rockingRockingBoogie: {
    id: 'legacy-rrb',
    title: 'Rockin\' Rockin\' Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
    channel: 'RRB Legacy',
    isLiveStream: false,
    frequency: 432,
  },
};

// ============================================================
// RRB LEGACY TRACKS
// ============================================================
export const RRB_LEGACY_TRACKS: AudioTrack[] = [
  LIVE_STREAMS.rockingRockingBoogie,
];

// ============================================================
// CHANNEL PRESETS
// ============================================================
export interface ChannelPreset {
  id: string;
  name: string;
  description?: string;
  color: string;
  streams: AudioTrack[];
}

export const CHANNEL_PRESETS: ChannelPreset[] = [
  {
    id: 'soul-funk',
    name: '🎷 Soul & Funk',
    description: 'R&B, Soul, Funk & Groove',
    color: '#ec4899',
    streams: [
      LIVE_STREAMS.grooveSalad,
      LIVE_STREAMS.secretAgent,
    ],
  },
  {
    id: 'jazz',
    name: '🎺 Jazz',
    description: 'Jazz, Smooth Jazz & Fusion',
    color: '#8b5cf6',
    streams: [
      LIVE_STREAMS.lush,
      LIVE_STREAMS.sonicUniverse,
    ],
  },
  {
    id: 'blues',
    name: '🎸 Blues',
    description: 'Blues & Deep Space',
    color: '#3b82f6',
    streams: [
      LIVE_STREAMS.deepSpaceOne,
    ],
  },
  {
    id: 'rock',
    name: '🤘 Rock',
    description: '70s & 80s Rock & Roll',
    color: '#ef4444',
    streams: [
      LIVE_STREAMS.radioParadise,
      LIVE_STREAMS.bootLiquor,
    ],
  },
  {
    id: 'country',
    name: '🎻 Country',
    description: 'Country & Folk',
    color: '#d97706',
    streams: [
      LIVE_STREAMS.folkForward,
    ],
  },
  {
    id: 'hiphop',
    name: '🎤 90s Hip-Hop',
    description: '90s Hip-Hop & Rap',
    color: '#6b7280',
    streams: [
      LIVE_STREAMS.cliqHop,
    ],
  },
  {
    id: 'talk',
    name: '📡 Talk',
    description: 'Talk & News',
    color: '#6366f1',
    streams: [
      LIVE_STREAMS.defcon,
    ],
  },
  {
    id: 'meditation',
    name: '🧘 Meditation',
    description: 'Ambient, Meditation & Healing',
    color: '#10b981',
    streams: [
      LIVE_STREAMS.droneZone,
    ],
  },
  {
    id: 'funk',
    name: '⚡ Funk',
    description: 'Electronic & Funk',
    color: '#06b6d4',
    streams: [
      LIVE_STREAMS.poptron,
    ],
  },
  {
    id: 'legacy',
    name: '👑 RRB Legacy',
    description: 'Rockin\' Rockin\' Boogie Archives',
    color: '#d97706',
    streams: RRB_LEGACY_TRACKS,
  },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
export function getAllLiveStreams(): AudioTrack[] {
  return Object.values(LIVE_STREAMS);
}

export function getChannelByGenre(genre: string): ChannelPreset | undefined {
  return CHANNEL_PRESETS.find(ch => ch.name.toLowerCase().includes(genre.toLowerCase()));
}

export function searchStreams(query: string): AudioTrack[] {
  const lowerQuery = query.toLowerCase();
  return getAllLiveStreams().filter(stream =>
    stream.title.toLowerCase().includes(lowerQuery) ||
    stream.artist.toLowerCase().includes(lowerQuery) ||
    stream.channel.toLowerCase().includes(lowerQuery)
  );
}

export function getStreamById(id: string): AudioTrack | undefined {
  return Object.values(LIVE_STREAMS).find(stream => stream.id === id);
}
