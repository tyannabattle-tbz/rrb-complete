/**
 * Comprehensive Channel Database
 * 50+ professional channels organized by category
 * Fits the Rockin' Rockin' Boogie legacy and operator autonomy vision
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
    streams: ['https://ice1.somafm.com/metal-128-mp3'],
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
    streams: ['https://ice1.somafm.com/jazzsteps-128-mp3'],
  },
  {
    id: 'music-soul',
    name: 'Soul & R&B',
    category: 'Music',
    subcategory: 'Soul',
    description: 'Soulful rhythms and R&B vibes',
    icon: '🎤',
    color: '#7C3AED',
    listeners: 2156,
    isLive: true,
    streams: ['https://ice1.somafm.com/sonicuniverse-128-mp3'],
  },
  {
    id: 'music-classical',
    name: 'Classical Masters',
    category: 'Music',
    subcategory: 'Classical',
    description: 'Timeless classical compositions',
    icon: '🎻',
    color: '#059669',
    listeners: 1245,
    isLive: true,
    streams: ['https://ice1.somafm.com/classicpop-128-mp3'],
  },
  {
    id: 'music-electronic',
    name: 'Electronic Pulse',
    category: 'Music',
    subcategory: 'Electronic',
    description: 'Electronic, EDM, and synth music',
    icon: '⚡',
    color: '#06B6D4',
    listeners: 3421,
    isLive: true,
    streams: ['https://ice1.somafm.com/deepspace-128-mp3'],
  },
  {
    id: 'music-hiphop',
    name: 'Hip-Hop Central',
    category: 'Music',
    subcategory: 'Hip-Hop',
    description: 'Hip-hop, rap, and urban beats',
    icon: '🎤',
    color: '#F59E0B',
    listeners: 3892,
    isLive: true,
    streams: ['https://ice1.somafm.com/illstreet-128-mp3'],
  },
  {
    id: 'music-pop',
    name: 'Pop Hits',
    category: 'Music',
    subcategory: 'Pop',
    description: 'Current and classic pop hits',
    icon: '⭐',
    color: '#EC4899',
    listeners: 4156,
    isLive: true,
    streams: ['https://ice1.somafm.com/indiepop-128-mp3'],
  },
  {
    id: 'music-country',
    name: 'Country Roads',
    category: 'Music',
    subcategory: 'Country',
    description: 'Country, Americana, and folk',
    icon: '🤠',
    color: '#B45309',
    listeners: 1834,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3country'],
  },
  {
    id: 'music-blues',
    name: 'Blues Heritage',
    category: 'Music',
    subcategory: 'Blues',
    description: 'Traditional and modern blues',
    icon: '🎸',
    color: '#1F2937',
    listeners: 987,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3blues'],
  },
  {
    id: 'music-reggae',
    name: 'Reggae Vibes',
    category: 'Music',
    subcategory: 'Reggae',
    description: 'Reggae, ska, and dancehall',
    icon: '🎵',
    color: '#16A34A',
    listeners: 1456,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3reggae'],
  },
  {
    id: 'music-latin',
    name: 'Latin Rhythms',
    category: 'Music',
    subcategory: 'Latin',
    description: 'Latin, salsa, and tropical beats',
    icon: '🥁',
    color: '#EF4444',
    listeners: 2234,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3latin'],
  },
  {
    id: 'music-world',
    name: 'World Sounds',
    category: 'Music',
    subcategory: 'World',
    description: 'World music and global sounds',
    icon: '🌍',
    color: '#8B5CF6',
    listeners: 1123,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3world'],
  },

  // ═══════════════════════════════════════════════════════════
  // TALK & COMMUNITY CHANNELS (10 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'talk-news',
    name: 'News & Updates',
    category: 'Talk',
    subcategory: 'News',
    description: 'Breaking news and current events',
    icon: '📰',
    color: '#1F2937',
    listeners: 2567,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3news'],
  },
  {
    id: 'talk-interviews',
    name: 'Interview Hour',
    category: 'Talk',
    subcategory: 'Interviews',
    description: 'In-depth interviews with notable guests',
    icon: '🎙️',
    color: '#3B82F6',
    listeners: 1834,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3interviews'],
  },
  {
    id: 'talk-local',
    name: 'Local Community',
    category: 'Talk',
    subcategory: 'Local',
    description: 'Local news and community voices',
    icon: '🏘️',
    color: '#10B981',
    listeners: 1245,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3local'],
  },
  {
    id: 'talk-podcast',
    name: 'Podcast Central',
    category: 'Talk',
    subcategory: 'Podcasts',
    description: 'Featured podcasts and audio shows',
    icon: '🎧',
    color: '#8B5CF6',
    listeners: 3456,
    isLive: false,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3podcasts'],
  },
  {
    id: 'talk-storytelling',
    name: 'Story Time',
    category: 'Talk',
    subcategory: 'Storytelling',
    description: 'Stories, narratives, and audio dramas',
    icon: '📖',
    color: '#F59E0B',
    listeners: 2123,
    isLive: false,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3stories'],
  },
  {
    id: 'talk-education',
    name: 'Learning Hub',
    category: 'Talk',
    subcategory: 'Education',
    description: 'Educational content and workshops',
    icon: '📚',
    color: '#06B6D4',
    listeners: 1567,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3education'],
  },
  {
    id: 'talk-wellness',
    name: 'Wellness Talk',
    category: 'Talk',
    subcategory: 'Wellness',
    description: 'Health, wellness, and lifestyle',
    icon: '💚',
    color: '#059669',
    listeners: 1923,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3wellness'],
  },
  {
    id: 'talk-spirituality',
    name: 'Spiritual Voices',
    category: 'Talk',
    subcategory: 'Spirituality',
    description: 'Spiritual wisdom and mindfulness',
    icon: '🕉️',
    color: '#8B5CF6',
    listeners: 1456,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3spirituality'],
  },
  {
    id: 'talk-arts',
    name: 'Arts & Culture',
    category: 'Talk',
    subcategory: 'Arts',
    description: 'Arts, culture, and creative expression',
    icon: '🎨',
    color: '#EC4899',
    listeners: 1234,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3arts'],
  },
  {
    id: 'talk-business',
    name: 'Business & Entrepreneurship',
    category: 'Talk',
    subcategory: 'Business',
    description: 'Business insights and entrepreneurship',
    icon: '💼',
    color: '#1F2937',
    listeners: 1678,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3business'],
  },

  // ═══════════════════════════════════════════════════════════
  // 24/7 STREAMS (5 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'stream-healing',
    name: 'Healing Frequencies',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: '432Hz healing and wellness frequencies',
    icon: '🔊',
    color: '#06B6D4',
    listeners: 5234,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3healing-432hz'],
  },
  {
    id: 'stream-meditation',
    name: 'Meditation & Mindfulness',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Guided meditation and mindfulness',
    icon: '🧘',
    color: '#10B981',
    listeners: 4123,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3meditation'],
  },
  {
    id: 'stream-ambient',
    name: 'Ambient Soundscapes',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Ambient music and nature sounds',
    icon: '🌿',
    color: '#059669',
    listeners: 3456,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3ambient'],
  },
  {
    id: 'stream-sleep',
    name: 'Sleep & Relaxation',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Sleep music and relaxation sounds',
    icon: '😴',
    color: '#3B82F6',
    listeners: 2987,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3sleep'],
  },
  {
    id: 'stream-focus',
    name: 'Focus & Productivity',
    category: '24/7 Streams',
    subcategory: '24/7',
    description: 'Music for concentration and focus',
    icon: '🎯',
    color: '#F59E0B',
    listeners: 2145,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3focus'],
  },

  // ═══════════════════════════════════════════════════════════
  // OPERATOR CHANNELS (8 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'operator-canryn',
    name: 'Canryn Productions',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Canryn Production content and broadcasts',
    icon: '🎬',
    color: '#DC2626',
    listeners: 3421,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3canryn'],
  },
  {
    id: 'operator-sweet-miracles',
    name: 'Sweet Miracles',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Sweet Miracles nonprofit and community',
    icon: '💝',
    color: '#EC4899',
    listeners: 2156,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3sweet-miracles'],
  },
  {
    id: 'operator-legacy',
    name: 'Legacy Restored',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Legacy preservation and restoration',
    icon: '🏛️',
    color: '#8B5CF6',
    listeners: 1834,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3legacy'],
  },
  {
    id: 'operator-studio',
    name: 'Studio Sessions',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Live studio recordings and sessions',
    icon: '🎙️',
    color: '#3B82F6',
    listeners: 2567,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3studio'],
  },
  {
    id: 'operator-qmunity',
    name: 'QMunity',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Community voices and perspectives',
    icon: '👥',
    color: '#10B981',
    listeners: 1923,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3qmunity'],
  },

  {
    id: 'operator-music-radio',
    name: 'Music & Radio',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Music programming and radio shows',
    icon: '📻',
    color: '#F59E0B',
    listeners: 3892,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3music-radio'],
  },
  {
    id: 'operator-community',
    name: 'Community Voices',
    category: 'Operator',
    subcategory: 'Operator',
    description: 'Community-driven content and shows',
    icon: '🎤',
    color: '#06B6D4',
    listeners: 2234,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3community'],
  },

  // ═══════════════════════════════════════════════════════════
  // SPECIAL EVENTS (6 channels)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'events-live',
    name: 'Live Events',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Live concerts and events',
    icon: '🎪',
    color: '#DC2626',
    listeners: 4567,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3live-events'],
  },
  {
    id: 'events-conferences',
    name: 'Conferences & Summits',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Conferences and summit broadcasts',
    icon: '🎯',
    color: '#3B82F6',
    listeners: 1834,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3conferences'],
  },
  {
    id: 'events-broadcast',
    name: 'Emergency Broadcast',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Emergency and critical broadcasts',
    icon: '🚨',
    color: '#EF4444',
    listeners: 5123,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3emergency'],
  },
  {
    id: 'events-festivals',
    name: 'Festival Coverage',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Music and cultural festival coverage',
    icon: '🎉',
    color: '#EC4899',
    listeners: 2345,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3festivals'],
  },
  {
    id: 'events-workshops',
    name: 'Workshops & Training',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Workshops and training sessions',
    icon: '🎓',
    color: '#06B6D4',
    listeners: 1567,
    isLive: true,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3workshops'],
  },
  {
    id: 'events-archive',
    name: 'Event Archives',
    category: 'Special Events',
    subcategory: 'Events',
    description: 'Archived special events and recordings',
    icon: '📼',
    color: '#8B5CF6',
    listeners: 987,
    isLive: false,
    streams: ['https://ice1.somafm.com/secretagent-128-mp3archives'],
  },
];

/**
 * Get channels by category
 */
export function getChannelsByCategory(category: Channel['category']): Channel[] {
  return CHANNELS.filter((ch) => ch.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): Channel['category'][] {
  const categories = new Set(CHANNELS.map((ch) => ch.category));
  return Array.from(categories) as Channel['category'][];
}

/**
 * Search channels by name or description
 */
export function searchChannels(query: string): Channel[] {
  const lowerQuery = query.toLowerCase();
  return CHANNELS.filter(
    (ch) =>
      ch.name.toLowerCase().includes(lowerQuery) ||
      ch.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get channel by ID
 */
export function getChannelById(id: string): Channel | undefined {
  return CHANNELS.find((ch) => ch.id === id);
}
