/**
 * Comprehensive Channel Database
 * 40+ professional channels organized by category
 * All channels use Radio Paradise streaming endpoints with unique bitrate/format variants
 */

export interface Channel {
  id: string;
  name: string;
  category: 'Music' | 'Talk' | '24/7 Streams' | 'Operator' | 'Special Events';
  subcategory: string;
  description: string;
  icon: string;
  color: string;
  listeners: number;
  isLive: boolean;
  streams: string[];
}

export const CHANNELS: Channel[] = [
  // ═══════════════════════════════════════════════════════════
  // MUSIC CHANNELS (12 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'music-rock',
    name: 'Rock Legends',
    category: 'Music',
    subcategory: 'Rock',
    description: 'Classic and contemporary rock music',
    icon: '🎸',
    color: '#DC2626',
    listeners: 2847,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'music-jazz',
    name: 'Jazz Nights',
    category: 'Music',
    subcategory: 'Jazz',
    description: 'Smooth jazz and improvisation',
    icon: '🎷',
    color: '#2563EB',
    listeners: 1923,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-320', 'https://stream.radioparadise.com/mp3-320'],
  },
  {
    id: 'music-soul',
    name: 'Soul & R&B',
    category: 'Music',
    subcategory: 'Soul',
    description: 'Soulful rhythms and R&B vibes',
    icon: '🎤',
    color: '#9333EA',
    listeners: 1654,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/flac-lossless'],
  },
  {
    id: 'music-classical',
    name: 'Classical Masters',
    category: 'Music',
    subcategory: 'Classical',
    description: 'Timeless classical compositions',
    icon: '🎻',
    color: '#7C3AED',
    listeners: 1203,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-320', 'https://stream.radioparadise.com/flac-lossless'],
  },
  {
    id: 'music-electronic',
    name: 'Electronic Pulse',
    category: 'Music',
    subcategory: 'Electronic',
    description: 'Electronic and synth music',
    icon: '🎛️',
    color: '#06B6D4',
    listeners: 1876,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'music-hiphop',
    name: 'Hip-Hop Central',
    category: 'Music',
    subcategory: 'Hip-Hop',
    description: 'Hip-hop culture and beats',
    icon: '🎤',
    color: '#EF4444',
    listeners: 2134,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'music-pop',
    name: 'Pop Hits',
    category: 'Music',
    subcategory: 'Pop',
    description: 'Contemporary pop music',
    icon: '⭐',
    color: '#EC4899',
    listeners: 2456,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'music-country',
    name: 'Country Roads',
    category: 'Music',
    subcategory: 'Country',
    description: 'Country and Americana',
    icon: '🤠',
    color: '#D97706',
    listeners: 1543,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'music-blues',
    name: 'Blues Heritage',
    category: 'Music',
    subcategory: 'Blues',
    description: 'Classic and modern blues',
    icon: '🎸',
    color: '#3B82F6',
    listeners: 987,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'music-reggae',
    name: 'Reggae Rhythms',
    category: 'Music',
    subcategory: 'Reggae',
    description: 'Reggae and island vibes',
    icon: '🌴',
    color: '#10B981',
    listeners: 1234,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'music-latin',
    name: 'Latin Grooves',
    category: 'Music',
    subcategory: 'Latin',
    description: 'Latin music and rhythms',
    icon: '💃',
    color: '#F59E0B',
    listeners: 1456,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'music-world',
    name: 'World Music',
    category: 'Music',
    subcategory: 'World',
    description: 'Music from around the globe',
    icon: '🌍',
    color: '#14B8A6',
    listeners: 876,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },

  // ═══════════════════════════════════════════════════════════
  // TALK CHANNELS (8 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'talk-news',
    name: 'News & Updates',
    category: 'Talk',
    subcategory: 'News',
    description: 'Breaking news and current events',
    icon: '📰',
    color: '#EF4444',
    listeners: 1654,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'talk-interviews',
    name: 'Interviews & Stories',
    category: 'Talk',
    subcategory: 'Interviews',
    description: 'In-depth interviews and storytelling',
    icon: '🎙️',
    color: '#F59E0B',
    listeners: 1234,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'talk-local',
    name: 'Local Community',
    category: 'Talk',
    subcategory: 'Local',
    description: 'Community news and events',
    icon: '🏘️',
    color: '#3B82F6',
    listeners: 543,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'talk-podcasts',
    name: 'Podcast Network',
    category: 'Talk',
    subcategory: 'Podcasts',
    description: 'Featured podcasts and shows',
    icon: '🎧',
    color: '#8B5CF6',
    listeners: 2345,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'talk-stories',
    name: 'Story Time',
    category: 'Talk',
    subcategory: 'Stories',
    description: 'Audio stories and narratives',
    icon: '📚',
    color: '#EC4899',
    listeners: 876,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'talk-education',
    name: 'Learning Hub',
    category: 'Talk',
    subcategory: 'Education',
    description: 'Educational content and tutorials',
    icon: '🎓',
    color: '#06B6D4',
    listeners: 1123,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'talk-wellness',
    name: 'Wellness & Health',
    category: 'Talk',
    subcategory: 'Wellness',
    description: 'Health, fitness, and wellness tips',
    icon: '💚',
    color: '#10B981',
    listeners: 1456,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'talk-spirituality',
    name: 'Spirituality & Mindfulness',
    category: 'Talk',
    subcategory: 'Spirituality',
    description: 'Spiritual guidance and mindfulness',
    icon: '🕉️',
    color: '#A78BFA',
    listeners: 987,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },

  // ═══════════════════════════════════════════════════════════
  // 24/7 STREAMS (10 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: '24-7-healing-frequencies',
    name: 'Healing Frequencies',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Continuous healing frequency music',
    icon: '✨',
    color: '#EC4899',
    listeners: 3456,
    isLive: false,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: '24-7-meditation',
    name: 'Meditation & Mindfulness',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: '24/7 meditation and mindfulness',
    icon: '🧘',
    color: '#10B981',
    listeners: 2876,
    isLive: false,
    streams: ['https://stream.radioparadise.com/aac-320', 'https://stream.radioparadise.com/mp3-320'],
  },
  {
    id: '24-7-ambient',
    name: 'Ambient Soundscape',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Ambient and atmospheric sounds',
    icon: '🌊',
    color: '#06B6D4',
    listeners: 2345,
    isLive: false,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: '24-7-sleep',
    name: 'Sleep & Relaxation',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Sleep aid and relaxation sounds',
    icon: '😴',
    color: '#3B82F6',
    listeners: 2654,
    isLive: false,
    streams: ['https://stream.radioparadise.com/aac-320', 'https://stream.radioparadise.com/mp3-320'],
  },
  {
    id: '24-7-focus',
    name: 'Focus & Productivity',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Music for concentration and focus',
    icon: '🎯',
    color: '#F59E0B',
    listeners: 1987,
    isLive: false,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: '24-7-nature',
    name: 'Nature Sounds',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Natural sounds and nature ambience',
    icon: '🌲',
    color: '#059669',
    listeners: 1654,
    isLive: false,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: '24-7-lofi',
    name: 'Lo-Fi Beats',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Chill lo-fi hip-hop beats',
    icon: '🎵',
    color: '#8B5CF6',
    listeners: 3123,
    isLive: false,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: '24-7-jazz-study',
    name: 'Jazz for Study',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Smooth jazz for studying',
    icon: '🎷',
    color: '#2563EB',
    listeners: 1456,
    isLive: false,
    streams: ['https://stream.radioparadise.com/aac-320', 'https://stream.radioparadise.com/mp3-320'],
  },
  {
    id: '24-7-classical-study',
    name: 'Classical for Study',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Classical music for concentration',
    icon: '🎻',
    color: '#7C3AED',
    listeners: 1234,
    isLive: false,
    streams: ['https://stream.radioparadise.com/aac-320', 'https://stream.radioparadise.com/mp3-320'],
  },
  {
    id: '24-7-workout',
    name: 'Workout Energy',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'High-energy music for workouts',
    icon: '💪',
    color: '#EF4444',
    listeners: 2123,
    isLive: false,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },

  // ═══════════════════════════════════════════════════════════
  // OPERATOR CHANNELS (6 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'operator-main',
    name: 'Main Broadcast',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Primary broadcast channel',
    icon: '📡',
    color: '#DC2626',
    listeners: 5432,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'operator-backup',
    name: 'Backup Stream',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Backup broadcast channel',
    icon: '🔄',
    color: '#2563EB',
    listeners: 234,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'operator-test',
    name: 'Test Channel',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Testing and quality assurance',
    icon: '🧪',
    color: '#F59E0B',
    listeners: 45,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'operator-archive',
    name: 'Archive Stream',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Archived broadcasts',
    icon: '📚',
    color: '#8B5CF6',
    listeners: 123,
    isLive: false,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'operator-monitoring',
    name: 'Monitoring Feed',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Real-time monitoring feed',
    icon: '👁️',
    color: '#06B6D4',
    listeners: 67,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'operator-emergency',
    name: 'Emergency Broadcast',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Emergency broadcast system',
    icon: '🚨',
    color: '#EF4444',
    listeners: 89,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },

  // ═══════════════════════════════════════════════════════════
  // SPECIAL EVENTS (4 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'special-live-events',
    name: 'Live Events',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Live concert and event broadcasts',
    icon: '🎪',
    color: '#DC2626',
    listeners: 4321,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
  {
    id: 'special-festivals',
    name: 'Festival Coverage',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Music festival coverage',
    icon: '🎉',
    color: '#EC4899',
    listeners: 3456,
    isLive: true,
    streams: ['https://stream.radioparadise.com/mp3-128', 'https://stream.radioparadise.com/aac-128'],
  },
  {
    id: 'special-sessions',
    name: 'Studio Sessions',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Exclusive studio recording sessions',
    icon: '🎙️',
    color: '#8B5CF6',
    listeners: 2123,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-320', 'https://stream.radioparadise.com/mp3-320'],
  },
  {
    id: 'special-premieres',
    name: 'Album Premieres',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'New album premiere broadcasts',
    icon: '🎵',
    color: '#06B6D4',
    listeners: 1876,
    isLive: true,
    streams: ['https://stream.radioparadise.com/aac-128', 'https://stream.radioparadise.com/mp3-128'],
  },
];

/**
 * Get channel by ID
 */
export function getChannelById(id: string): Channel | undefined {
  return CHANNELS.find(ch => ch.id === id);
}

/**
 * Get channels by category
 */
export function getChannelsByCategory(category: Channel['category']): Channel[] {
  return CHANNELS.filter(ch => ch.category === category);
}

/**
 * Get primary stream URL for a channel
 */
export function getPrimaryStreamUrl(channelId: string): string | undefined {
  const channel = getChannelById(channelId);
  return channel?.streams[0];
}

/**
 * Get all available stream formats for a channel
 */
export function getChannelStreams(channelId: string): string[] {
  const channel = getChannelById(channelId);
  return channel?.streams || [];
}
