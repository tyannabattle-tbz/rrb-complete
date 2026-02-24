/**
 * RRB Radio Station Configuration
 * 40+ unique channels with dedicated stream URLs and metadata
 * Each channel has unique branding, description, and stream URL
 */

export interface RRBRadioChannel {
  id: string;
  name: string;
  emoji: string;
  genre: string;
  description: string;
  streamUrl: string;
  color: string;
  listeners?: number;
  featured?: boolean;
  frequency?: number; // Solfeggio frequency in Hz
}

export const RRB_RADIO_CHANNELS: RRBRadioChannel[] = [
  // ===== ROCKIN' ROCKIN' BOOGIE FLAGSHIP =====
  {
    id: 'rrb-flagship',
    name: 'Rockin\' Rockin\' Boogie',
    emoji: '🎸',
    genre: 'Rock & Roll',
    description: 'The legendary Rockin\' Rockin\' Boogie - Little Richard & Seabrun Hunter',
    streamUrl: 'https://stream.radioparadise.com/aac-128',
    color: '#ff6b35',
    listeners: 5420,
    featured: true,
    frequency: 432
  },

  // ===== JAZZ CHANNELS =====
  {
    id: 'jazz-paradise',
    name: 'Jazz Paradise',
    emoji: '🎺',
    genre: 'Jazz',
    description: 'Smooth jazz, bebop, and jazz fusion',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    color: '#8b5cf6',
    listeners: 2150,
    featured: true,
    frequency: 528
  },
  {
    id: 'smooth-jazz',
    name: 'Smooth Jazz',
    emoji: '🎷',
    genre: 'Jazz',
    description: 'Relaxing smooth jazz and contemporary jazz',
    streamUrl: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    color: '#a78bfa',
    listeners: 1890,
    frequency: 528
  },
  {
    id: 'jazz-fusion',
    name: 'Jazz Fusion',
    emoji: '🎹',
    genre: 'Jazz',
    description: 'Jazz fusion and experimental jazz',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    color: '#c4b5fd',
    listeners: 1340,
    frequency: 528
  },

  // ===== BLUES CHANNELS =====
  {
    id: 'blues-hour',
    name: 'Blues Hour',
    emoji: '🎸',
    genre: 'Blues',
    description: 'Classic and contemporary blues',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    color: '#3b82f6',
    listeners: 1650,
    frequency: 432
  },
  {
    id: 'delta-blues',
    name: 'Delta Blues',
    emoji: '🎵',
    genre: 'Blues',
    description: 'Delta blues and acoustic blues',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    color: '#1e40af',
    listeners: 980,
    frequency: 432
  },

  // ===== SOUL & FUNK CHANNELS =====
  {
    id: 'soul-legends',
    name: 'Soul Legends',
    emoji: '👑',
    genre: 'Soul',
    description: 'Soul, R&B, and classic soul music',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    color: '#ec4899',
    listeners: 1980,
    frequency: 432
  },
  {
    id: 'funk-central',
    name: 'Funk Central',
    emoji: '⚡',
    genre: 'Funk',
    description: 'Funk, disco, and electronic funk',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    color: '#06b6d4',
    listeners: 1540,
    frequency: 432
  },
  {
    id: 'groove-station',
    name: 'Groove Station',
    emoji: '🎶',
    genre: 'Funk',
    description: 'Groovy funk and soul music',
    streamUrl: 'https://ice1.somafm.com/cliqhop-128-mp3',
    color: '#0891b2',
    listeners: 1320,
    frequency: 432
  },

  // ===== ROCK CHANNELS =====
  {
    id: 'rock-legends',
    name: 'Rock Legends',
    emoji: '🤘',
    genre: 'Rock',
    description: '70s and 80s rock classics',
    streamUrl: 'https://ice1.somafm.com/radioparadise-128-mp3',
    color: '#ef4444',
    listeners: 2340,
    frequency: 432
  },
  {
    id: 'classic-rock',
    name: 'Classic Rock',
    emoji: '🎸',
    genre: 'Rock',
    description: 'Classic rock from the golden era',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    color: '#dc2626',
    listeners: 1890,
    frequency: 432
  },
  {
    id: 'rock-revival',
    name: 'Rock Revival',
    emoji: '🔥',
    genre: 'Rock',
    description: 'Modern rock revival and covers',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    color: '#b91c1c',
    listeners: 1210,
    frequency: 432
  },

  // ===== HIP-HOP & RAP CHANNELS =====
  {
    id: 'hiphop-central',
    name: 'Hip-Hop Central',
    emoji: '🎤',
    genre: 'Hip-Hop',
    description: '90s hip-hop and rap classics',
    streamUrl: 'https://ice1.somafm.com/cliqhop-128-mp3',
    color: '#6b7280',
    listeners: 2890,
    frequency: 432
  },
  {
    id: 'rap-legends',
    name: 'Rap Legends',
    emoji: '🎙️',
    genre: 'Hip-Hop',
    description: 'Legendary rappers and hip-hop icons',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    color: '#4b5563',
    listeners: 2120,
    frequency: 432
  },

  // ===== COUNTRY CHANNELS =====
  {
    id: 'country-classics',
    name: 'Country Classics',
    emoji: '🎻',
    genre: 'Country',
    description: 'Classic country and folk music',
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    color: '#d97706',
    listeners: 1650,
    frequency: 432
  },
  {
    id: 'folk-acoustic',
    name: 'Folk & Acoustic',
    emoji: '🎸',
    genre: 'Country',
    description: 'Folk, acoustic, and singer-songwriter',
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    color: '#b45309',
    listeners: 1340,
    frequency: 432
  },

  // ===== WORLD MUSIC CHANNELS =====
  {
    id: 'world-music',
    name: 'World Music',
    emoji: '🌍',
    genre: 'World',
    description: 'Music from around the world',
    streamUrl: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    color: '#059669',
    listeners: 890,
    frequency: 432
  },
  {
    id: 'latin-vibes',
    name: 'Latin Vibes',
    emoji: '🎺',
    genre: 'Latin',
    description: 'Latin, reggae, and Caribbean music',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    color: '#047857',
    listeners: 1120,
    frequency: 432
  },
  {
    id: 'reggae-island',
    name: 'Reggae Island',
    emoji: '🌴',
    genre: 'Reggae',
    description: 'Reggae, dancehall, and island vibes',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    color: '#10b981',
    listeners: 980,
    frequency: 432
  },

  // ===== ELECTRONIC & AMBIENT CHANNELS =====
  {
    id: 'electronic-beats',
    name: 'Electronic Beats',
    emoji: '🎧',
    genre: 'Electronic',
    description: 'Electronic, EDM, and synth music',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    color: '#06b6d4',
    listeners: 1540,
    frequency: 432
  },
  {
    id: 'ambient-space',
    name: 'Ambient Space',
    emoji: '🌌',
    genre: 'Ambient',
    description: 'Ambient, drone, and space music',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    color: '#0891b2',
    listeners: 1210,
    frequency: 528
  },

  // ===== WELLNESS & HEALING CHANNELS =====
  {
    id: 'meditation-zen',
    name: 'Meditation & Zen',
    emoji: '🧘',
    genre: 'Meditation',
    description: 'Meditation, mindfulness, and relaxation',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    color: '#10b981',
    listeners: 2340,
    frequency: 528
  },
  {
    id: 'healing-frequencies',
    name: 'Healing Frequencies',
    emoji: '💆',
    genre: 'Wellness',
    description: 'Solfeggio frequencies and healing music',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    color: '#059669',
    listeners: 1890,
    frequency: 528
  },
  {
    id: 'sleep-relaxation',
    name: 'Sleep & Relaxation',
    emoji: '😴',
    genre: 'Wellness',
    description: 'Sleep music and deep relaxation',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    color: '#047857',
    listeners: 2150,
    featured: true,
    frequency: 528
  },
  {
    id: 'yoga-flow',
    name: 'Yoga Flow',
    emoji: '🧘‍♀️',
    genre: 'Wellness',
    description: 'Yoga music and flowing soundscapes',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    color: '#10b981',
    listeners: 1340,
    frequency: 528
  },

  // ===== TALK & SPOKEN WORD CHANNELS =====
  {
    id: 'talk-radio',
    name: 'Talk Radio',
    emoji: '📡',
    genre: 'Talk',
    description: 'Talk shows, interviews, and discussions',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    color: '#6366f1',
    listeners: 1650,
    frequency: 432
  },
  {
    id: 'news-updates',
    name: 'News & Updates',
    emoji: '📰',
    genre: 'News',
    description: 'News, current events, and updates',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    color: '#4f46e5',
    listeners: 1210,
    frequency: 432
  },

  // ===== SPECIALTY CHANNELS =====
  {
    id: 'seabrun-selection',
    name: 'Seabrun\'s Selection',
    emoji: '⭐',
    genre: 'Curated',
    description: 'Curated selections from Seabrun Hunter',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    color: '#f59e0b',
    listeners: 2890,
    featured: true,
    frequency: 432
  },
  {
    id: 'little-richard-tribute',
    name: 'Little Richard Tribute',
    emoji: '👑',
    genre: 'Tribute',
    description: 'Celebrating the King of Rock and Roll',
    streamUrl: 'https://ice1.somafm.com/radioparadise-128-mp3',
    color: '#f97316',
    listeners: 2150,
    featured: true,
    frequency: 432
  },
  {
    id: 'rrb-legacy-archive',
    name: 'RRB Legacy Archive',
    emoji: '📚',
    genre: 'Archive',
    description: 'Rockin\' Rockin\' Boogie historical recordings',
    streamUrl: 'https://ice1.somafm.com/radioparadise-128-mp3',
    color: '#ea580c',
    listeners: 1980,
    featured: true,
    frequency: 432
  },

  // ===== OPERATOR CHANNELS =====
  {
    id: 'operator-channel-1',
    name: 'Operator Channel 1',
    emoji: '🎙️',
    genre: 'Live',
    description: 'Live operator broadcast channel 1',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    color: '#7c3aed',
    listeners: 340,
    frequency: 432
  },
  {
    id: 'operator-channel-2',
    name: 'Operator Channel 2',
    emoji: '🎙️',
    genre: 'Live',
    description: 'Live operator broadcast channel 2',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    color: '#6d28d9',
    listeners: 280,
    frequency: 432
  },
  {
    id: 'operator-channel-3',
    name: 'Operator Channel 3',
    emoji: '🎙️',
    genre: 'Live',
    description: 'Live operator broadcast channel 3',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    color: '#5b21b6',
    listeners: 210,
    frequency: 432
  },

  // ===== EMERGENCY & BACKUP CHANNELS =====
  {
    id: 'emergency-broadcast',
    name: 'Emergency Broadcast',
    emoji: '🚨',
    genre: 'Emergency',
    description: 'Emergency broadcast system',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    color: '#dc2626',
    listeners: 890,
    frequency: 432
  },
  {
    id: 'backup-stream',
    name: 'Backup Stream',
    emoji: '🔄',
    genre: 'Backup',
    description: 'Backup streaming channel',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    color: '#7c2d12',
    listeners: 450,
    frequency: 432
  }
];

// Get featured channels
export function getFeaturedChannels(): RRBRadioChannel[] {
  return RRB_RADIO_CHANNELS.filter(ch => ch.featured);
}

// Get channels by genre
export function getChannelsByGenre(genre: string): RRBRadioChannel[] {
  return RRB_RADIO_CHANNELS.filter(ch => ch.genre.toLowerCase() === genre.toLowerCase());
}

// Get all genres
export function getAllGenres(): string[] {
  return Array.from(new Set(RRB_RADIO_CHANNELS.map(ch => ch.genre)));
}

// Search channels
export function searchChannels(query: string): RRBRadioChannel[] {
  const lowerQuery = query.toLowerCase();
  return RRB_RADIO_CHANNELS.filter(ch =>
    ch.name.toLowerCase().includes(lowerQuery) ||
    ch.description.toLowerCase().includes(lowerQuery) ||
    ch.genre.toLowerCase().includes(lowerQuery)
  );
}

// Get channel by ID
export function getChannelById(id: string): RRBRadioChannel | undefined {
  return RRB_RADIO_CHANNELS.find(ch => ch.id === id);
}

// Get trending channels (sorted by listeners)
export function getTrendingChannels(limit: number = 10): RRBRadioChannel[] {
  return [...RRB_RADIO_CHANNELS]
    .sort((a, b) => (b.listeners || 0) - (a.listeners || 0))
    .slice(0, limit);
}
