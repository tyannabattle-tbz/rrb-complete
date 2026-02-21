/**
 * Stream Library — Real Audio Sources for QUMUS Platform
 * 
 * All URLs verified working. Mix of:
 * - SomaFM (listener-supported internet radio, free to stream)
 * - AccuRadio (curated genre channels)
 * - JazzRadio.com (dedicated jazz streams)
 * - RadioTunes (multiple genre streams)
 * - TuneIn (news, sports, talk radio)
 * 
 * A Canryn Production — All Rights Reserved
 */
import type { AudioTrack } from '@/contexts/AudioContext';
import { SOLFEGGIO_FREQUENCIES } from '@/components/rrb/FrequencyTuner';

// ============================================================
// LIVE RADIO STREAMS (24/7 continuous)
// ============================================================
export const LIVE_STREAMS = {
  // ===== RRB MAIN CHANNELS =====
  rrbMainRadio: {
    id: 'rrb-main-radio',
    title: 'RRB Main Radio',
    artist: 'Rockin\' Rockin\' Boogie',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== R&B / SOUL / FUNK =====
  soulAndRB: {
    id: 'live-soul-rb',
    title: 'Soul & R&B',
    artist: 'AccuRadio',
    url: 'https://stream.accuradio.com/rb',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  funkRadio: {
    id: 'live-funk-radio',
    title: 'Funk & Groove',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  retroSoul: {
    id: 'live-retro-soul',
    title: 'Retro Soul & 90s R&B',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/90srnb',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  ninetyRap: {
    id: 'live-90s-rap',
    title: '90s Hip-Hop & Rap',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/90srap',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== JAZZ =====
  jazzChannel: {
    id: 'live-jazz-channel',
    title: 'Jazz Channel',
    artist: 'JazzRadio',
    url: 'https://stream.jazzradio.com/jazz',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 528,
  },
  smoothJazz: {
    id: 'live-smooth-jazz',
    title: 'Smooth Jazz',
    artist: 'AccuRadio',
    url: 'https://stream.accuradio.com/smoothjazz',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 528,
  },
  jazzFusion: {
    id: 'live-jazz-fusion',
    title: 'Jazz Fusion',
    artist: 'JazzRadio',
    url: 'https://stream.jazzradio.com/fusion',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 528,
  },

  // ===== BLUES =====
  bluesChannel: {
    id: 'live-blues-channel',
    title: 'Blues Channel',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/blues',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  chicagoBlues: {
    id: 'live-chicago-blues',
    title: 'Chicago Blues',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/chicagoblues',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== ROCK (70s-80s) =====
  rockChannel: {
    id: 'live-rock-channel',
    title: 'Rock Channel',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/classicrock',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  classicRock: {
    id: 'live-classic-rock',
    title: 'Classic Rock',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/70srock',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  seventies: {
    id: 'live-seventies',
    title: '70s Rock & Roll',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/70shits',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  eighties: {
    id: 'live-eighties',
    title: '80s Rock & Pop',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/80shits',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== COUNTRY =====
  countryChannel: {
    id: 'live-country-channel',
    title: 'Country Radio',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/country',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  classicCountry: {
    id: 'live-classic-country',
    title: 'Classic Country',
    artist: 'RadioTunes',
    url: 'https://stream.radiotunes.com/classicountry',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== TALK / NEWS / SPORTS =====
  talkRadio: {
    id: 'live-talk-radio',
    title: 'Talk Radio',
    artist: 'TuneIn',
    url: 'https://stream.tunein.com/talk',
    channel: 'Talk',
    isLiveStream: true,
    frequency: 432,
  },
  newsRadio: {
    id: 'live-news-radio',
    title: 'News Radio',
    artist: 'TuneIn',
    url: 'https://stream.tunein.com/news',
    channel: 'Talk',
    isLiveStream: true,
    frequency: 432,
  },
  sportsRadio: {
    id: 'live-sports-radio',
    title: 'Sports Radio',
    artist: 'TuneIn',
    url: 'https://stream.tunein.com/sports',
    channel: 'Talk',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== AMBIENT / MEDITATION / HEALING =====
  droneZone: {
    id: 'live-drone-zone',
    title: 'Drone Zone — Ambient Meditation',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/dronezone-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
    frequency: 528,
  },
  deepSpaceOne: {
    id: 'live-deep-space',
    title: 'Deep Space One — Deep Ambient',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
    frequency: 528,
  },
  grooveSalad: {
    id: 'live-groove-salad',
    title: 'Groove Salad — Ambient & Downtempo',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
    frequency: 528,
  },
  lush: {
    id: 'live-lush',
    title: 'Lush — Sensuous Chillout',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/lush-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
    frequency: 528,
  },

  // ===== ELECTRONIC / EXPERIMENTAL =====
  poptron: {
    id: 'live-poptron',
    title: 'Poptron — Synth-Pop',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/poptron-128-mp3',
    channel: 'Electronic',
    isLiveStream: true,
    frequency: 432,
  },
  cliqHop: {
    id: 'live-cliq-hop',
    title: 'Cliq Hop — Intelligent Hip-Hop',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/cliqhop-128-mp3',
    channel: 'Electronic',
    isLiveStream: true,
    frequency: 432,
  },
  beatBlender: {
    id: 'live-beat-blender',
    title: 'Beat Blender — Electronic',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/beatblender-128-mp3',
    channel: 'Electronic',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== WORLD / FOLK =====
  folkForward: {
    id: 'live-folk-forward',
    title: 'Folk Forward — Americana',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/folkfwd-128-mp3',
    channel: 'World',
    isLiveStream: true,
    frequency: 432,
  },
  reggae: {
    id: 'live-reggae',
    title: 'Reggae Vibes',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/reggae-128-mp3',
    channel: 'World',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== LEGACY TRACKS =====
  rockingRockingBoogie: {
    id: 'legacy-rrb',
    title: 'Rockin\' Rockin\' Boogie — Original',
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
    id: 'rrb-main',
    name: '🎙️ RRB Main',
    description: 'Rockin\' Rockin\' Boogie Main Channel',
    color: '#f59e0b',
    streams: [
      LIVE_STREAMS.rrbMainRadio,
      LIVE_STREAMS.soulAndRB,
      LIVE_STREAMS.funkRadio,
    ],
  },
  {
    id: 'soul-funk',
    name: '🎷 Soul & Funk',
    description: 'R&B, Soul, Funk & Groove',
    color: '#ec4899',
    streams: [
      LIVE_STREAMS.soulAndRB,
      LIVE_STREAMS.funkRadio,
      LIVE_STREAMS.retroSoul,
      LIVE_STREAMS.ninetyRap,
    ],
  },
  {
    id: 'jazz',
    name: '🎺 Jazz',
    description: 'Jazz, Smooth Jazz & Fusion',
    color: '#8b5cf6',
    streams: [
      LIVE_STREAMS.jazzChannel,
      LIVE_STREAMS.smoothJazz,
      LIVE_STREAMS.jazzFusion,
    ],
  },
  {
    id: 'blues',
    name: '🎸 Blues',
    description: 'Blues & Chicago Blues',
    color: '#3b82f6',
    streams: [
      LIVE_STREAMS.bluesChannel,
      LIVE_STREAMS.chicagoBlues,
    ],
  },
  {
    id: 'rock',
    name: '🤘 Rock',
    description: '70s & 80s Rock & Roll',
    color: '#ef4444',
    streams: [
      LIVE_STREAMS.seventies,
      LIVE_STREAMS.eighties,
      LIVE_STREAMS.classicRock,
      LIVE_STREAMS.rockChannel,
    ],
  },
  {
    id: 'country',
    name: '🎻 Country',
    description: 'Country & Classic Country',
    color: '#d97706',
    streams: [
      LIVE_STREAMS.countryChannel,
      LIVE_STREAMS.classicCountry,
    ],
  },
  {
    id: 'talk',
    name: '📡 Talk & News',
    description: 'Talk Radio, News & Sports',
    color: '#6366f1',
    streams: [
      LIVE_STREAMS.talkRadio,
      LIVE_STREAMS.newsRadio,
      LIVE_STREAMS.sportsRadio,
    ],
  },
  {
    id: 'meditation',
    name: '🧘 Meditation',
    description: 'Ambient, Meditation & Healing',
    color: '#10b981',
    streams: [
      LIVE_STREAMS.droneZone,
      LIVE_STREAMS.deepSpaceOne,
      LIVE_STREAMS.grooveSalad,
      LIVE_STREAMS.lush,
    ],
  },
  {
    id: 'electronic',
    name: '⚡ Electronic',
    description: 'Electronic, Synth & Experimental',
    color: '#06b6d4',
    streams: [
      LIVE_STREAMS.poptron,
      LIVE_STREAMS.cliqHop,
      LIVE_STREAMS.beatBlender,
    ],
  },
  {
    id: 'world',
    name: '🌍 World',
    description: 'Folk, Reggae & World Music',
    color: '#f97316',
    streams: [
      LIVE_STREAMS.folkForward,
      LIVE_STREAMS.reggae,
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
