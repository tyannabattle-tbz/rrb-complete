/**
 * Channel Metadata Service
 * Manages channel-specific metadata including genre, description, and cover art
 */

export interface ChannelMetadata {
  id: string;
  name: string;
  genre: string;
  description: string;
  coverArt: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_CHANNELS: ChannelMetadata[] = [
  {
    id: 'rockin-boogie',
    name: "Rockin' Rockin' Boogie",
    genre: 'Rock & Roll',
    description: 'Classic rock and roll hits featuring Little Richard, Chuck Berry, and more',
    coverArt: 'https://via.placeholder.com/300x300?text=Rockin+Boogie',
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    accentColor: '#ff6b35',
    tags: ['rock', 'classic', 'roll', 'vintage'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'blues-hour',
    name: 'Blues Hour',
    genre: 'Blues & Soul',
    description: 'Classic blues and soul music from B.B. King, Robert Johnson, and blues legends',
    coverArt: 'https://via.placeholder.com/300x300?text=Blues+Hour',
    backgroundColor: '#0f3460',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
    tags: ['blues', 'soul', 'classic', 'emotional'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'jazz-essentials',
    name: 'Jazz Essentials',
    genre: 'Jazz',
    description: 'Smooth jazz and bebop classics from Dave Brubeck, Bill Evans, and jazz pioneers',
    coverArt: 'https://via.placeholder.com/300x300?text=Jazz+Essentials',
    backgroundColor: '#16213e',
    textColor: '#ffffff',
    accentColor: '#ffd60a',
    tags: ['jazz', 'bebop', 'smooth', 'instrumental'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

/**
 * Get all channel metadata
 */
export function getAllChannelMetadata(): ChannelMetadata[] {
  const stored = localStorage.getItem('channel-metadata');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse stored channel metadata:', error);
    }
  }
  return DEFAULT_CHANNELS;
}

/**
 * Get metadata for a specific channel
 */
export function getChannelMetadata(channelId: string): ChannelMetadata | undefined {
  const channels = getAllChannelMetadata();
  return channels.find(ch => ch.id === channelId);
}

/**
 * Update channel metadata
 */
export function updateChannelMetadata(channelId: string, updates: Partial<ChannelMetadata>): ChannelMetadata | undefined {
  const channels = getAllChannelMetadata();
  const index = channels.findIndex(ch => ch.id === channelId);

  if (index === -1) return undefined;

  const updated = {
    ...channels[index],
    ...updates,
    updatedAt: new Date(),
  };

  channels[index] = updated;
  localStorage.setItem('channel-metadata', JSON.stringify(channels));

  return updated;
}

/**
 * Add new channel metadata
 */
export function addChannelMetadata(metadata: ChannelMetadata): ChannelMetadata {
  const channels = getAllChannelMetadata();
  const newChannel = {
    ...metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  channels.push(newChannel);
  localStorage.setItem('channel-metadata', JSON.stringify(channels));

  return newChannel;
}

/**
 * Delete channel metadata
 */
export function deleteChannelMetadata(channelId: string): boolean {
  const channels = getAllChannelMetadata();
  const filtered = channels.filter(ch => ch.id !== channelId);

  if (filtered.length === channels.length) return false;

  localStorage.setItem('channel-metadata', JSON.stringify(filtered));
  return true;
}

/**
 * Get channels by genre
 */
export function getChannelsByGenre(genre: string): ChannelMetadata[] {
  const channels = getAllChannelMetadata();
  return channels.filter(ch => ch.genre.toLowerCase().includes(genre.toLowerCase()));
}

/**
 * Search channels by name or description
 */
export function searchChannels(query: string): ChannelMetadata[] {
  const channels = getAllChannelMetadata();
  const lowerQuery = query.toLowerCase();

  return channels.filter(
    ch =>
      ch.name.toLowerCase().includes(lowerQuery) ||
      ch.description.toLowerCase().includes(lowerQuery) ||
      ch.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get unique genres from all channels
 */
export function getAllGenres(): string[] {
  const channels = getAllChannelMetadata();
  const genres = new Set(channels.map(ch => ch.genre));
  return Array.from(genres).sort();
}

export default {
  getAllChannelMetadata,
  getChannelMetadata,
  updateChannelMetadata,
  addChannelMetadata,
  deleteChannelMetadata,
  getChannelsByGenre,
  searchChannels,
  getAllGenres,
};
