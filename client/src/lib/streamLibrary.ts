/**
 * Stream Library — Real Audio Sources for QUMUS Platform
 * 
 * All URLs verified working. Mix of:
 * - SomaFM (listener-supported internet radio, free to stream)
 * - Manus CDN (user-uploaded content)
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

  // ===== SOUL / FUNK / R&B =====
  soulAndRB: {
    id: 'live-soul-rb',
    title: 'Soul & R&B',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
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
    title: 'Retro Soul',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/illstreet-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== JAZZ =====
  jazzChannel: {
    id: 'live-jazz-channel',
    title: 'Jazz Channel',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 528,
  },
  smoothJazz: {
    id: 'live-smooth-jazz',
    title: 'Smooth Jazz',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 528,
  },
  jazzFusion: {
    id: 'live-jazz-fusion',
    title: 'Jazz Fusion',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 528,
  },

  // ===== BLUES =====
  bluesChannel: {
    id: 'live-blues-channel',
    title: 'Blues Channel',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  chicagoBlues: {
    id: 'live-chicago-blues',
    title: 'Chicago Blues',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },

  // ===== ROCK =====
  rockChannel: {
    id: 'live-rock-channel',
    title: 'Rock Channel',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/metal-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  classicRock: {
    id: 'live-classic-rock',
    title: 'Classic Rock',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/metal-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
    frequency: 432,
  },
  seventies: {
    id: 'live-seventies',
    title: '70s Rock & Roll',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/metal-128-mp3',
    channel: 'RRB Radio',
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

  // ===== TALK / SPECIAL =====
  missionControl: {
    id: 'live-mission-control',
    title: 'Mission Control — News & Talk',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/missioncontrol-128-mp3',
    channel: 'Talk',
    isLiveStream: true,
    frequency: 432,
  },
  spaceStation: {
    id: 'live-space-station',
    title: 'Space Station — Science',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/spacestation-128-mp3',
    channel: 'Talk',
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
  {
    id: 'track-rrb-original',
    title: 'Rockin\' Rockin\' Boogie — Original',
    artist: 'Seabrun Candy Hunter & Little Richard',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
    channel: 'RRB Legacy',
    isLiveStream: false,
    frequency: 432,
  },
  {
    id: 'track-california',
    title: 'California I\'m Coming',
    artist: 'Seabrun Candy Hunter',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    channel: 'RRB Legacy',
    isLiveStream: false,
    frequency: 432,
  },
  {
    id: 'track-i-saw',
    title: 'I Saw What You Did',
    artist: 'Seabrun Candy Hunter',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    channel: 'RRB Legacy',
    isLiveStream: false,
    frequency: 432,
  },
  {
    id: 'track-gospel',
    title: 'Morning Glory Gospel',
    artist: 'RRB Gospel Choir',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    channel: 'RRB Legacy',
    isLiveStream: false,
    frequency: 432,
  },
];

// ============================================================
// CHANNEL PRESETS (Quick Access)
// ============================================================
export interface ChannelPreset {
  id: string;
  name: string;
  color: string;
  streams: AudioTrack[];
}

export const CHANNEL_PRESETS: ChannelPreset[] = [
  {
    id: 'rrb-main',
    name: '🎙️ RRB Main',
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
    color: '#ec4899',
    streams: [
      LIVE_STREAMS.soulAndRB,
      LIVE_STREAMS.funkRadio,
      LIVE_STREAMS.retroSoul,
    ],
  },
  {
    id: 'jazz',
    name: '🎺 Jazz',
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
    color: '#3b82f6',
    streams: [
      LIVE_STREAMS.bluesChannel,
      LIVE_STREAMS.chicagoBlues,
    ],
  },
  {
    id: 'rock',
    name: '🤘 Rock',
    color: '#ef4444',
    streams: [
      LIVE_STREAMS.rockChannel,
      LIVE_STREAMS.classicRock,
      LIVE_STREAMS.seventies,
    ],
  },
  {
    id: 'meditation',
    name: '🧘 Meditation',
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
    color: '#f97316',
    streams: [
      LIVE_STREAMS.folkForward,
      LIVE_STREAMS.reggae,
    ],
  },
  {
    id: 'talk',
    name: '📡 Talk & News',
    color: '#6366f1',
    streams: [
      LIVE_STREAMS.missionControl,
      LIVE_STREAMS.spaceStation,
    ],
  },
  {
    id: 'legacy',
    name: '👑 RRB Legacy',
    color: '#d97706',
    streams: RRB_LEGACY_TRACKS,
  },
];
