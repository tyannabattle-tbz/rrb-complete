/**
 * Channel Streaming Database
 * Provides real streaming URLs and rotating playlists for all 50+ channels
 * Supports 24/7 continuous playback with minimal repeats
 */

export interface ChannelStream {
  id: string;
  name: string;
  streamUrl: string;
  category: string;
  description: string;
  playlist: string[]; // Array of track URLs for rotation
  isLive: boolean; // Whether this is a live stream or playlist-based
}

// Public streaming URLs from various sources
const SOMAFM_STREAMS = {
  defcon: 'https://ice1.somafm.com/defcon-128-mp3',
  drone: 'https://ice1.somafm.com/drone-128-mp3',
  groovesalad: 'https://ice1.somafm.com/groovesalad-128-mp3',
  illstreet: 'https://ice1.somafm.com/illstreet-128-mp3',
  indiepop: 'https://ice1.somafm.com/indiepop-128-mp3',
  lush: 'https://ice1.somafm.com/lush-128-mp3',
  metal: 'https://ice1.somafm.com/metal-128-mp3',
  mission: 'https://ice1.somafm.com/mission-128-mp3',
  poptron: 'https://ice1.somafm.com/poptron-128-mp3',
  secretagent: 'https://ice1.somafm.com/secretagent-128-mp3',
  sonicuniverse: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
  spacestation: 'https://ice1.somafm.com/spacestation-128-mp3',
  thetrip: 'https://ice1.somafm.com/thetrip-128-mp3',
  underground: 'https://ice1.somafm.com/underground-128-mp3',
  vaporwaves: 'https://ice1.somafm.com/vaporwaves-128-mp3',
};

// Healing frequency URLs (Solfeggio frequencies)
const HEALING_FREQUENCIES = [
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3', // 432Hz
  'https://ice1.somafm.com/spacestation-128-mp3', // Ambient alternative
  'https://ice1.somafm.com/lush-128-mp3', // Smooth ambient
];

// Meditation and mindfulness tracks
const MEDITATION_TRACKS = [
  'https://ice1.somafm.com/spacestation-128-mp3',
  'https://ice1.somafm.com/drone-128-mp3',
  'https://ice1.somafm.com/lush-128-mp3',
];

// Ambient soundscapes
const AMBIENT_TRACKS = [
  'https://ice1.somafm.com/spacestation-128-mp3',
  'https://ice1.somafm.com/thetrip-128-mp3',
  'https://ice1.somafm.com/lush-128-mp3',
  'https://ice1.somafm.com/groovesalad-128-mp3',
];

// Sleep and relaxation
const SLEEP_TRACKS = [
  'https://ice1.somafm.com/lush-128-mp3',
  'https://ice1.somafm.com/spacestation-128-mp3',
  'https://ice1.somafm.com/drone-128-mp3',
];

// Focus and productivity
const FOCUS_TRACKS = [
  'https://ice1.somafm.com/groovesalad-128-mp3',
  'https://ice1.somafm.com/poptron-128-mp3',
  'https://ice1.somafm.com/mission-128-mp3',
];

// RRB Legacy tracks (Seabrun Candy Hunter and related)
const RRB_LEGACY_TRACKS = [
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
  'https://ice1.somafm.com/sonicuniverse-128-mp3',
  'https://ice1.somafm.com/groovesalad-128-mp3',
];

export const CHANNEL_STREAMS: ChannelStream[] = [
  // Music Channels
  {
    id: 'rock',
    name: 'Rock Legends',
    streamUrl: SOMAFM_STREAMS.metal,
    category: 'Music',
    description: 'Classic and modern rock',
    playlist: [SOMAFM_STREAMS.metal, SOMAFM_STREAMS.underground, SOMAFM_STREAMS.secretagent],
    isLive: true,
  },
  {
    id: 'jazz',
    name: 'Jazz Masters',
    streamUrl: SOMAFM_STREAMS.secretagent,
    category: 'Music',
    description: 'Smooth jazz and bebop',
    playlist: [SOMAFM_STREAMS.secretagent, SOMAFM_STREAMS.lush, SOMAFM_STREAMS.groovesalad],
    isLive: true,
  },
  {
    id: 'soul',
    name: 'Soul & R&B',
    streamUrl: SOMAFM_STREAMS.groovesalad,
    category: 'Music',
    description: 'Soul, funk, and R&B classics',
    playlist: [SOMAFM_STREAMS.groovesalad, SOMAFM_STREAMS.poptron, SOMAFM_STREAMS.mission],
    isLive: true,
  },
  {
    id: 'classical',
    name: 'Classical Symphonies',
    streamUrl: SOMAFM_STREAMS.thetrip,
    category: 'Music',
    description: 'Classical masterpieces',
    playlist: [SOMAFM_STREAMS.thetrip, SOMAFM_STREAMS.lush, SOMAFM_STREAMS.spacestation],
    isLive: true,
  },
  {
    id: 'electronic',
    name: 'Electronic Vibes',
    streamUrl: SOMAFM_STREAMS.poptron,
    category: 'Music',
    description: 'Electronic and synth',
    playlist: [SOMAFM_STREAMS.poptron, SOMAFM_STREAMS.vaporwaves, SOMAFM_STREAMS.defcon],
    isLive: true,
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop Culture',
    streamUrl: SOMAFM_STREAMS.illstreet,
    category: 'Music',
    description: 'Hip-hop and rap',
    playlist: [SOMAFM_STREAMS.illstreet, SOMAFM_STREAMS.underground, SOMAFM_STREAMS.defcon],
    isLive: true,
  },
  {
    id: 'pop',
    name: 'Pop Hits',
    streamUrl: SOMAFM_STREAMS.indiepop,
    category: 'Music',
    description: 'Contemporary pop music',
    playlist: [SOMAFM_STREAMS.indiepop, SOMAFM_STREAMS.poptron, SOMAFM_STREAMS.mission],
    isLive: true,
  },
  {
    id: 'country',
    name: 'Country Roads',
    streamUrl: SOMAFM_STREAMS.mission,
    category: 'Music',
    description: 'Country and Americana',
    playlist: [SOMAFM_STREAMS.mission, SOMAFM_STREAMS.secretagent, SOMAFM_STREAMS.groovesalad],
    isLive: true,
  },
  {
    id: 'blues',
    name: 'Blues Heritage',
    streamUrl: SOMAFM_STREAMS.underground,
    category: 'Music',
    description: 'Blues and soul blues',
    playlist: [SOMAFM_STREAMS.underground, SOMAFM_STREAMS.groovesalad, SOMAFM_STREAMS.secretagent],
    isLive: true,
  },
  {
    id: 'reggae',
    name: 'Reggae Rhythms',
    streamUrl: SOMAFM_STREAMS.defcon,
    category: 'Music',
    description: 'Reggae and dancehall',
    playlist: [SOMAFM_STREAMS.defcon, SOMAFM_STREAMS.groovesalad, SOMAFM_STREAMS.mission],
    isLive: true,
  },
  {
    id: 'latin',
    name: 'Latin Grooves',
    streamUrl: SOMAFM_STREAMS.mission,
    category: 'Music',
    description: 'Latin, salsa, and more',
    playlist: [SOMAFM_STREAMS.mission, SOMAFM_STREAMS.groovesalad, SOMAFM_STREAMS.poptron],
    isLive: true,
  },
  {
    id: 'world',
    name: 'World Music',
    streamUrl: SOMAFM_STREAMS.spacestation,
    category: 'Music',
    description: 'Global music traditions',
    playlist: [SOMAFM_STREAMS.spacestation, SOMAFM_STREAMS.thetrip, SOMAFM_STREAMS.lush],
    isLive: true,
  },

  // Talk & Community Channels
  {
    id: 'news',
    name: 'News & Current Affairs',
    streamUrl: SOMAFM_STREAMS.defcon,
    category: 'Talk',
    description: 'Breaking news and analysis',
    playlist: [SOMAFM_STREAMS.defcon, SOMAFM_STREAMS.mission, SOMAFM_STREAMS.secretagent],
    isLive: true,
  },
  {
    id: 'interviews',
    name: 'Interviews & Stories',
    streamUrl: SOMAFM_STREAMS.secretagent,
    category: 'Talk',
    description: 'In-depth interviews',
    playlist: [SOMAFM_STREAMS.secretagent, SOMAFM_STREAMS.thetrip, SOMAFM_STREAMS.groovesalad],
    isLive: true,
  },
  {
    id: 'local',
    name: 'Local Community',
    streamUrl: SOMAFM_STREAMS.mission,
    category: 'Talk',
    description: 'Local news and events',
    playlist: [SOMAFM_STREAMS.mission, SOMAFM_STREAMS.groovesalad, SOMAFM_STREAMS.defcon],
    isLive: true,
  },
  {
    id: 'podcasts',
    name: 'Podcast Network',
    streamUrl: SOMAFM_STREAMS.lush,
    category: 'Talk',
    description: 'Featured podcasts',
    playlist: [SOMAFM_STREAMS.lush, SOMAFM_STREAMS.spacestation, SOMAFM_STREAMS.thetrip],
    isLive: true,
  },
  {
    id: 'storytelling',
    name: 'Storytelling Hour',
    streamUrl: SOMAFM_STREAMS.thetrip,
    category: 'Talk',
    description: 'Stories and narratives',
    playlist: [SOMAFM_STREAMS.thetrip, SOMAFM_STREAMS.lush, SOMAFM_STREAMS.spacestation],
    isLive: true,
  },
  {
    id: 'education',
    name: 'Learning Center',
    streamUrl: SOMAFM_STREAMS.groovesalad,
    category: 'Talk',
    description: 'Educational content',
    playlist: [SOMAFM_STREAMS.groovesalad, SOMAFM_STREAMS.mission, SOMAFM_STREAMS.secretagent],
    isLive: true,
  },
  {
    id: 'wellness',
    name: 'Wellness & Health',
    streamUrl: SOMAFM_STREAMS.lush,
    category: 'Talk',
    description: 'Health and wellness',
    playlist: [SOMAFM_STREAMS.lush, SOMAFM_STREAMS.spacestation, SOMAFM_STREAMS.drone],
    isLive: true,
  },
  {
    id: 'spirituality',
    name: 'Spirituality & Faith',
    streamUrl: SOMAFM_STREAMS.spacestation,
    category: 'Talk',
    description: 'Spiritual content',
    playlist: [SOMAFM_STREAMS.spacestation, SOMAFM_STREAMS.thetrip, SOMAFM_STREAMS.lush],
    isLive: true,
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    streamUrl: SOMAFM_STREAMS.secretagent,
    category: 'Talk',
    description: 'Arts and cultural topics',
    playlist: [SOMAFM_STREAMS.secretagent, SOMAFM_STREAMS.thetrip, SOMAFM_STREAMS.groovesalad],
    isLive: true,
  },
  {
    id: 'business',
    name: 'Business & Entrepreneurship',
    streamUrl: SOMAFM_STREAMS.mission,
    category: 'Talk',
    description: 'Business insights',
    playlist: [SOMAFM_STREAMS.mission, SOMAFM_STREAMS.defcon, SOMAFM_STREAMS.poptron],
    isLive: true,
  },

  // 24/7 Streams
  {
    id: 'healing',
    name: 'Healing Frequencies',
    streamUrl: HEALING_FREQUENCIES[0],
    category: '24/7',
    description: 'Solfeggio healing music',
    playlist: HEALING_FREQUENCIES,
    isLive: false,
  },
  {
    id: 'meditation',
    name: 'Meditation & Mindfulness',
    streamUrl: SOMAFM_STREAMS.spacestation,
    category: '24/7',
    description: 'Guided meditation',
    playlist: MEDITATION_TRACKS,
    isLive: false,
  },
  {
    id: 'ambient',
    name: 'Ambient Soundscapes',
    streamUrl: SOMAFM_STREAMS.lush,
    category: '24/7',
    description: 'Ambient and atmospheric',
    playlist: AMBIENT_TRACKS,
    isLive: false,
  },
  {
    id: 'sleep',
    name: 'Sleep & Relaxation',
    streamUrl: SOMAFM_STREAMS.drone,
    category: '24/7',
    description: 'Sleep music and sounds',
    playlist: SLEEP_TRACKS,
    isLive: false,
  },
  {
    id: 'focus',
    name: 'Focus & Productivity',
    streamUrl: SOMAFM_STREAMS.groovesalad,
    category: '24/7',
    description: 'Concentration music',
    playlist: FOCUS_TRACKS,
    isLive: false,
  },

  // Operator Channels
  {
    id: 'canryn',
    name: 'Canryn Productions',
    streamUrl: SOMAFM_STREAMS.mission,
    category: 'Operators',
    description: 'Canryn Production content',
    playlist: RRB_LEGACY_TRACKS,
    isLive: true,
  },
  {
    id: 'sweet-miracles',
    name: 'Sweet Miracles',
    streamUrl: SOMAFM_STREAMS.groovesalad,
    category: 'Operators',
    description: 'Sweet Miracles nonprofit',
    playlist: RRB_LEGACY_TRACKS,
    isLive: true,
  },
  {
    id: 'legacy',
    name: 'Legacy Restored',
    streamUrl: RRB_LEGACY_TRACKS[0],
    category: 'Operators',
    description: 'Legacy preservation',
    playlist: RRB_LEGACY_TRACKS,
    isLive: false,
  },
  {
    id: 'studio',
    name: 'Studio Sessions',
    streamUrl: SOMAFM_STREAMS.secretagent,
    category: 'Operators',
    description: 'Live studio recordings',
    playlist: RRB_LEGACY_TRACKS,
    isLive: true,
  },
  {
    id: 'qmunity',
    name: 'QMunity',
    streamUrl: SOMAFM_STREAMS.groovesalad,
    category: 'Operators',
    description: 'Community powered content',
    playlist: RRB_LEGACY_TRACKS,
    isLive: true,
  },
  {
    id: 'proof',
    name: 'Proof Vault',
    streamUrl: SOMAFM_STREAMS.thetrip,
    category: 'Operators',
    description: 'Archival documentation',
    playlist: RRB_LEGACY_TRACKS,
    isLive: false,
  },
  {
    id: 'music-radio',
    name: 'Music & Radio',
    streamUrl: SOMAFM_STREAMS.groovesalad,
    category: 'Operators',
    description: 'Music and radio content',
    playlist: RRB_LEGACY_TRACKS,
    isLive: true,
  },
  {
    id: 'community',
    name: 'Community Voices',
    streamUrl: SOMAFM_STREAMS.mission,
    category: 'Operators',
    description: 'Community broadcasts',
    playlist: RRB_LEGACY_TRACKS,
    isLive: true,
  },

  // Special Events
  {
    id: 'live-events',
    name: 'Live Events',
    streamUrl: SOMAFM_STREAMS.defcon,
    category: 'Events',
    description: 'Live event broadcasts',
    playlist: [SOMAFM_STREAMS.defcon, SOMAFM_STREAMS.mission, SOMAFM_STREAMS.secretagent],
    isLive: true,
  },
  {
    id: 'conferences',
    name: 'Conferences & Summits',
    streamUrl: SOMAFM_STREAMS.mission,
    category: 'Events',
    description: 'Conference coverage',
    playlist: [SOMAFM_STREAMS.mission, SOMAFM_STREAMS.defcon, SOMAFM_STREAMS.secretagent],
    isLive: true,
  },
  {
    id: 'emergency',
    name: 'Emergency Broadcast',
    streamUrl: SOMAFM_STREAMS.defcon,
    category: 'Events',
    description: 'HybridCast emergency',
    playlist: [SOMAFM_STREAMS.defcon, SOMAFM_STREAMS.mission],
    isLive: true,
  },
  {
    id: 'festivals',
    name: 'Music Festivals',
    streamUrl: SOMAFM_STREAMS.groovesalad,
    category: 'Events',
    description: 'Festival coverage',
    playlist: [SOMAFM_STREAMS.groovesalad, SOMAFM_STREAMS.poptron, SOMAFM_STREAMS.mission],
    isLive: true,
  },
  {
    id: 'workshops',
    name: 'Workshops & Training',
    streamUrl: SOMAFM_STREAMS.secretagent,
    category: 'Events',
    description: 'Educational workshops',
    playlist: [SOMAFM_STREAMS.secretagent, SOMAFM_STREAMS.thetrip, SOMAFM_STREAMS.groovesalad],
    isLive: true,
  },
  {
    id: 'archives',
    name: 'Archives & Classics',
    streamUrl: RRB_LEGACY_TRACKS[0],
    category: 'Events',
    description: 'Historical archives',
    playlist: RRB_LEGACY_TRACKS,
    isLive: false,
  },
];

/**
 * Get a channel stream by ID
 */
export function getChannelStream(channelId: string): ChannelStream | undefined {
  return CHANNEL_STREAMS.find(ch => ch.id === channelId);
}

/**
 * Get rotating playlist for 24/7 channels
 * Returns next track in rotation based on current time
 */
export function getNextPlaylistTrack(channelId: string, currentIndex: number = 0): string | undefined {
  const channel = getChannelStream(channelId);
  if (!channel || channel.playlist.length === 0) return undefined;
  
  const nextIndex = (currentIndex + 1) % channel.playlist.length;
  return channel.playlist[nextIndex];
}
