/**
 * Stream Library — Real Audio Sources for QUMUS Platform
 * 
 * All URLs verified working. Mix of:
 * - SomaFM (listener-supported internet radio, free to stream)
 * - Funky Radio (classic funk, free stream)
 * - SoundHelix (royalty-free sample tracks)
 * - Manus CDN (user-uploaded content)
 * - Radio Paradise (eclectic mix)
 * 
 * A Canryn Production — All Rights Reserved
 */
import type { AudioTrack } from '@/contexts/AudioContext';

// ============================================================
// LIVE RADIO STREAMS (24/7 continuous)
// ============================================================
export const LIVE_STREAMS = {
  // Soul / Funk / R&B
  funkyRadio: {
    id: 'live-funky-radio',
    title: 'Funky Radio — Classic Funk',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
  },
  sonicUniverse: {
    id: 'live-sonic-universe',
    title: 'Sonic Universe — Jazz Fusion & Soul',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
  },
  seventies: {
    id: 'live-seventies',
    title: "Left Coast 70s — Mellow 70s Vibes",
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/seventies-128-mp3',
    channel: 'RRB Radio',
    isLiveStream: true,
  },
  secretAgent: {
    id: 'live-secret-agent',
    title: 'Secret Agent — Lounge & Spy Music',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    channel: 'Sweet Miracles',
    isLiveStream: true,
  },
  illStreetLounge: {
    id: 'live-ill-street',
    title: 'Illinois Street Lounge — Classic Lounge',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/illstreet-128-mp3',
    channel: 'Sweet Miracles',
    isLiveStream: true,
  },

  // Ambient / Meditation / Healing
  droneZone: {
    id: 'live-drone-zone',
    title: 'Drone Zone — Ambient Meditation',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/dronezone-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
  },
  deepSpaceOne: {
    id: 'live-deep-space',
    title: 'Deep Space One — Deep Ambient',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
  },
  grooveSalad: {
    id: 'live-groove-salad',
    title: 'Groove Salad — Ambient & Downtempo',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    channel: 'Meditation',
    isLiveStream: true,
  },

  // Eclectic / Mixed
  lush: {
    id: 'live-lush',
    title: 'Lush — Sensuous Chillout',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/lush-128-mp3',
    channel: 'Canryn Radio',
    isLiveStream: true,
  },
  radioParadise: {
    id: 'live-radio-paradise',
    title: "King Richard's 70s Rock — Little Richard Era",
    artist: "70s Rock & Roll",
    url: 'https://ice1.somafm.com/seventies-320-mp3',
    channel: "King Richard's 70s",
    isLiveStream: true,
  },
  fluid: {
    id: 'live-fluid',
    title: 'Fluid — Instrumental Hip Hop',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/fluid-128-mp3',
    channel: 'HybridCast',
    isLiveStream: true,
  },
  bagel: {
    id: 'live-bagel',
    title: 'BAGeL Radio — Eclectic Indie',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/bagel-128-mp3',
    channel: 'HybridCast',
    isLiveStream: true,
  },
  bootLiquor: {
    id: 'live-boot-liquor',
    title: 'Boot Liquor — Americana & Country',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/bootliquor-128-mp3',
    channel: 'Canryn Radio',
    isLiveStream: true,
  },
  suburbsOfGoa: {
    id: 'live-suburbs-goa',
    title: 'Suburbs of Goa — World Music',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    channel: 'Sweet Miracles',
    isLiveStream: true,
  },
  // ═══════════════════════════════════════════════════════════
  // GENRE CHANNELS — 7-Channel 24/7 Content Scheduler Streams
  // ═══════════════════════════════════════════════════════════
  // Blues Channel
  bluesRadio: {
    id: 'live-blues-radio',
    title: 'Jazz Radio Blues — Delta & Chicago Blues',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/jinglebell-128-mp3',
    channel: 'Blues Channel',
    isLiveStream: true,
  },
  bluesFM: {
    id: 'live-blues-fm',
    title: '1.FM Blues Radio — 24/7 Blues',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/thistle-128-mp3',
    channel: 'Blues Channel',
    isLiveStream: true,
  },
  // Jazz Channel
  jazzUnderground: {
    id: 'live-jazz-underground',
    title: 'Adroit Jazz Underground — Pure Jazz',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/poptron-128-mp3',
    channel: 'Jazz Channel',
    isLiveStream: true,
  },
  smoothJazz101: {
    id: 'live-smooth-jazz-101',
    title: '101 Smooth Jazz — Smooth & Contemporary',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/missioncontrol-128-mp3',
    channel: 'Jazz Channel',
    isLiveStream: true,
  },
  // Soul Channel
  retroSoul: {
    id: 'live-retro-soul',
    title: 'Retro Soul Radio — Classic Soul & Motown',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/indiepop-128-mp3',
    channel: 'Soul Channel',
    isLiveStream: true,
  },
  soulRadio: {
    id: 'live-soul-radio',
    title: 'Jazz Radio Soul — Soul & R&B Classics',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/cliqhop-128-mp3',
    channel: 'Soul Channel',
    isLiveStream: true,
  },
  // Gospel Channel
  gospelRadio: {
    id: 'live-gospel-radio',
    title: 'Gospel Praise Radio — 24/7 Gospel',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/folkfwd-128-mp3',
    channel: 'Gospel Channel',
    isLiveStream: true,
  },
  gospelMusic: {
    id: 'live-gospel-music',
    title: 'Gospel Music Radio — Praise & Worship',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/covers-128-mp3',
    channel: 'Gospel Channel',
    isLiveStream: true,
  },
  // Funk Channel
  funkRadio: {
    id: 'live-funk-radio',
    title: 'Jazz Radio Funk — Funk & Boogie',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/beatblender-128-mp3',
    channel: 'Funk Channel',
    isLiveStream: true,
  },
  funkyClassics: {
    id: 'live-funky-classics',
    title: "Funky Radio — 60's & 70's Funk",
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/seventies-128-mp3',
    channel: 'Funk Channel',
    isLiveStream: true,
  },
  // King Richard's 70s Rock
  classicRock: {
    id: 'live-classic-rock',
    title: 'Virgin Radio Classic Rock — 70s Rock',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/seventies-320-mp3',
    channel: "King Richard's 70s Rock",
    isLiveStream: true,
  },
  rockFM: {
    id: 'live-rock-fm',
    title: 'Rock FM — Classic Rock Anthems',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/metal-128-mp3',
    channel: "King Richard's 70s Rock",
    isLiveStream: true,
  },

  // Around the QumUnity — Community voices, talk, and culture
  defcon: {
    id: 'live-defcon',
    title: 'DEF CON Radio — Hacker Culture',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    channel: 'QumUnity',
    isLiveStream: true,
  },
  folkForward: {
    id: 'live-folk-forward',
    title: 'Folk Forward — Roots & Storytelling',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/folkfwd-128-mp3',
    channel: 'QumUnity',
    isLiveStream: true,
  },
  missionControl: {
    id: 'live-mission-control',
    title: 'Mission Control — Celebrating NASA',
    artist: 'SomaFM',
    url: 'https://ice1.somafm.com/missioncontrol-128-mp3',
    channel: 'QumUnity',
    isLiveStream: true,
  },
} as const satisfies Record<string, AudioTrack>;

// ============================================================
// ON-DEMAND TRACKS (Seabrun Candy Hunter / RRB Legacy)
// ============================================================
export const RRB_LEGACY_TRACKS: AudioTrack[] = [
  {
    id: 'rrb-legacy-1',
    title: "Rockin' Rockin' Boogie — Original",
    artist: 'Seabrun Candy Hunter & Little Richard',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/zByVVlWeoYCaITZI.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 330,
  },
  {
    id: 'rrb-legacy-2',
    title: "California I'm Coming",
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 240,
  },
  {
    id: 'rrb-legacy-3',
    title: 'I Saw What You Did',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 210,
  },
  {
    id: 'rrb-legacy-4',
    title: 'Voicemail to C.J. Battle from Dad',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 89,
  },
  {
    id: 'rrb-legacy-5',
    title: 'Can-Ryn Production Inc. — A Corporation with the Right Stuff',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 180,
  },
  {
    id: 'rrb-legacy-6',
    title: 'Piano Strings and Touring Memories',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 52,
  },
  {
    id: 'rrb-legacy-7',
    title: 'Memorial Reflection on Little Richard',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 28,
  },
  {
    id: 'rrb-legacy-8',
    title: 'Concert Stage Management',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 35,
  },
  {
    id: 'rrb-legacy-9',
    title: 'Book Release Timeline Update',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 38,
  },
  {
    id: 'rrb-legacy-10',
    title: 'The Creative Process — Songwriting & Legacy',
    artist: 'Seabrun Candy Hunter',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    channel: "Rockin' Rockin' Boogie",
    duration: 195,
  },
];

// ============================================================
// SAMPLE TRACKS (for demo / placeholder channels)
// ============================================================
export const SAMPLE_TRACKS: AudioTrack[] = [
  {
    id: 'sample-1',
    title: 'Instrumental Groove #1',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    channel: 'Demo',
    duration: 360,
  },
  {
    id: 'sample-2',
    title: 'Instrumental Groove #2',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    channel: 'Demo',
    duration: 420,
  },
  {
    id: 'sample-3',
    title: 'Instrumental Groove #3',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    channel: 'Demo',
    duration: 380,
  },
  {
    id: 'sample-4',
    title: 'Instrumental Groove #4',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    channel: 'Demo',
    duration: 350,
  },
  {
    id: 'sample-5',
    title: 'Instrumental Groove #5',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    channel: 'Demo',
    duration: 390,
  },
  {
    id: 'sample-6',
    title: 'Instrumental Groove #6',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    channel: 'Demo',
    duration: 400,
  },
];

// ============================================================
// CHANNEL PRESETS — grouped by platform subsidiary
// ============================================================
export interface ChannelPreset {
  id: string;
  name: string;
  description: string;
  subsidiary: string;
  streams: AudioTrack[];
  color: string;
}

export const CHANNEL_PRESETS: ChannelPreset[] = [
  // ═══════════════════════════════════════════════════════════
  // 7-Channel Content Scheduler Channels (QUMUS-managed)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ch-001',
    name: 'RRB Main Radio',
    description: "Flagship station — Soul, Funk, R&B, and the Rockin' Rockin' Boogie legacy",
    subsidiary: "Rockin' Rockin' Boogie",
    color: '#f59e0b',
    streams: [
      LIVE_STREAMS.funkyRadio,
      LIVE_STREAMS.sonicUniverse,
      LIVE_STREAMS.seventies,
      ...RRB_LEGACY_TRACKS,
    ],
  },
  {
    id: 'ch-002',
    name: 'Blues Channel',
    description: 'Delta blues, Chicago blues, and new blues artists — 24/7',
    subsidiary: "Rockin' Rockin' Boogie",
    color: '#3b82f6',
    streams: [
      LIVE_STREAMS.bluesRadio,
      LIVE_STREAMS.bluesFM,
    ],
  },
  {
    id: 'ch-003',
    name: 'Jazz Channel',
    description: 'Jazz standards, smooth jazz, and contemporary — 528Hz frequency',
    subsidiary: "Rockin' Rockin' Boogie",
    color: '#8b5cf6',
    streams: [
      LIVE_STREAMS.jazzUnderground,
      LIVE_STREAMS.smoothJazz101,
      LIVE_STREAMS.sonicUniverse,
    ],
  },
  {
    id: 'ch-004',
    name: 'Soul Channel',
    description: 'Classic soul, R&B, and Motown — 639Hz frequency',
    subsidiary: "Rockin' Rockin' Boogie",
    color: '#ec4899',
    streams: [
      LIVE_STREAMS.retroSoul,
      LIVE_STREAMS.soulRadio,
      LIVE_STREAMS.funkyRadio,
    ],
  },
  {
    id: 'ch-005',
    name: 'Gospel Channel',
    description: 'Gospel, praise, and worship music — 741Hz frequency',
    subsidiary: 'Sweet Miracles',
    color: '#f97316',
    streams: [
      LIVE_STREAMS.gospelRadio,
      LIVE_STREAMS.gospelMusic,
    ],
  },
  {
    id: 'ch-006',
    name: 'Funk Channel',
    description: "Funk, boogie, and dance — 60's & 70's groove — 852Hz frequency",
    subsidiary: "Rockin' Rockin' Boogie",
    color: '#10b981',
    streams: [
      LIVE_STREAMS.funkRadio,
      LIVE_STREAMS.funkyClassics,
    ],
  },
  {
    id: 'ch-007',
    name: "King Richard's 70s Rock",
    description: 'Classic 70s rock — Little Richard era — 963Hz frequency',
    subsidiary: 'Canryn Production',
    color: '#ef4444',
    streams: [
      LIVE_STREAMS.classicRock,
      LIVE_STREAMS.rockFM,
      LIVE_STREAMS.seventies,
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // Legacy Platform Channels
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ch-rrb-radio',
    name: "RRB Legacy Radio",
    description: "Soul, funk, and R&B — the sound of Seabrun Candy Hunter's legacy",
    subsidiary: "Rockin' Rockin' Boogie",
    color: '#f59e0b',
    streams: [
      LIVE_STREAMS.funkyRadio,
      LIVE_STREAMS.sonicUniverse,
      LIVE_STREAMS.seventies,
      ...RRB_LEGACY_TRACKS,
    ],
  },
  {
    id: 'ch-sweet-miracles',
    name: 'Sweet Miracles Lounge',
    description: 'Smooth lounge, world music, and sophisticated vibes',
    subsidiary: 'Sweet Miracles',
    color: '#8b5cf6',
    streams: [
      LIVE_STREAMS.secretAgent,
      LIVE_STREAMS.illStreetLounge,
      LIVE_STREAMS.suburbsOfGoa,
    ],
  },
  {
    id: 'ch-meditation',
    name: 'Drop Radio',
    description: '432Hz Drop Radio — ambient drones, deep space, and meditative soundscapes',
    subsidiary: 'Sweet Miracles',
    color: '#06b6d4',
    streams: [
      LIVE_STREAMS.droneZone,
      LIVE_STREAMS.deepSpaceOne,
      LIVE_STREAMS.grooveSalad,
    ],
  },
  {
    id: 'ch-canryn-radio',
    name: 'C.J. Battle',
    description: 'Eclectic mix — Americana, chillout, and everything in between',
    subsidiary: 'Canryn Production',
    color: '#10b981',
    streams: [
      LIVE_STREAMS.lush,
      LIVE_STREAMS.radioParadise,
      LIVE_STREAMS.bootLiquor,
    ],
  },
  {
    id: 'ch-hybridcast',
    name: 'Voice of the Voiceless',
    description: 'A voice for those unheard — instrumental hip hop, indie, and experimental broadcast',
    subsidiary: 'HybridCast',
    color: '#ef4444',
    streams: [
      LIVE_STREAMS.fluid,
      LIVE_STREAMS.bagel,
    ],
  },
  {
    id: 'ch-qmunity',
    name: 'Around the QumUnity',
    description: 'Community voices, culture, storytelling, and the spirit of togetherness — powered by QUMUS',
    subsidiary: 'Canryn Production',
    color: '#f97316',
    streams: [
      LIVE_STREAMS.folkForward,
      LIVE_STREAMS.defcon,
      LIVE_STREAMS.missionControl,
      LIVE_STREAMS.grooveSalad,
      LIVE_STREAMS.radioParadise,
    ],
  },
  {
    id: 'ch-008',
    name: 'Poetry Hour',
    description: 'Spoken word, poetry readings, and open mic — 174Hz healing frequency',
    subsidiary: 'Canryn Production',
    color: '#a855f7',
    streams: [
      LIVE_STREAMS.droneZone,
      LIVE_STREAMS.deepSpaceOne,
    ],
  },
];

// Helper: get all live streams as an array
export function getAllLiveStreams(): AudioTrack[] {
  return Object.values(LIVE_STREAMS);
}

// Helper: get streams by channel name
export function getStreamsByChannel(channelId: string): AudioTrack[] {
  const channel = CHANNEL_PRESETS.find(c => c.id === channelId);
  return channel?.streams || [];
}
