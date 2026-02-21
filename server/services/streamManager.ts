import { invokeLLM } from '../_core/llm';

export interface StreamChannel {
  id: string;
  name: string;
  category: string;
  description: string;
  streamUrl: string;
  is247: boolean;
  currentTrack?: {
    title: string;
    artist: string;
    duration: number;
    startTime: number;
  };
  listenerCount: number;
  isLive: boolean;
  djName?: string;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  channelId: string;
}

export interface DJShow {
  id: string;
  channelId: string;
  djName: string;
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  isLive: boolean;
}

class StreamManager {
  private channels: Map<string, StreamChannel> = new Map();
  private playlists: Map<string, PlaylistTrack[]> = new Map();
  private djShows: Map<string, DJShow[]> = new Map();
  private listenerCounts: Map<string, number> = new Map();

  constructor() {
    this.initializeChannels();
    this.initializePlaylists();
  }

  private initializeChannels() {
    const channels: StreamChannel[] = [
      // Music Channels
      { id: 'rock', name: 'Rock Legends', category: 'Music', description: 'Classic and modern rock', streamUrl: 'https://ice1.somafm.com/metal-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'jazz', name: 'Jazz Masters', category: 'Music', description: 'Smooth jazz and bebop', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'soul', name: 'Soul & R&B', category: 'Music', description: 'Soul, funk, and R&B classics', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'classical', name: 'Classical Symphonies', category: 'Music', description: 'Classical masterpieces', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'electronic', name: 'Electronic Vibes', category: 'Music', description: 'Electronic and synth', streamUrl: 'https://ice1.somafm.com/poptron-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'hiphop', name: 'Hip-Hop Culture', category: 'Music', description: 'Hip-hop and rap', streamUrl: 'https://ice1.somafm.com/illstreet-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'pop', name: 'Pop Hits', category: 'Music', description: 'Contemporary pop music', streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'country', name: 'Country Roads', category: 'Music', description: 'Country and Americana', streamUrl: 'https://ice1.somafm.com/mission-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'blues', name: 'Blues Heritage', category: 'Music', description: 'Blues and soul blues', streamUrl: 'https://ice1.somafm.com/underground-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'reggae', name: 'Reggae Rhythms', category: 'Music', description: 'Reggae and dancehall', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'latin', name: 'Latin Grooves', category: 'Music', description: 'Latin, salsa, and more', streamUrl: 'https://ice1.somafm.com/mission-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'world', name: 'World Music', category: 'Music', description: 'Global music traditions', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3', is247: false, listenerCount: 0, isLive: true },

      // Talk & Community
      { id: 'news', name: 'News & Current Affairs', category: 'Talk', description: 'Breaking news and analysis', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'interviews', name: 'Interviews & Stories', category: 'Talk', description: 'In-depth interviews', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'local', name: 'Local Community', category: 'Talk', description: 'Local news and events', streamUrl: 'https://ice1.somafm.com/mission-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'podcasts', name: 'Podcast Network', category: 'Talk', description: 'Featured podcasts', streamUrl: 'https://ice1.somafm.com/lush-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'storytelling', name: 'Storytelling Hour', category: 'Talk', description: 'Stories and narratives', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'education', name: 'Learning Center', category: 'Talk', description: 'Educational content', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'wellness', name: 'Wellness & Health', category: 'Talk', description: 'Health and wellness', streamUrl: 'https://ice1.somafm.com/lush-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'spirituality', name: 'Spirituality & Faith', category: 'Talk', description: 'Spiritual content', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'arts', name: 'Arts & Culture', category: 'Talk', description: 'Arts and cultural topics', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'business', name: 'Business & Entrepreneurship', category: 'Talk', description: 'Business insights', streamUrl: 'https://ice1.somafm.com/mission-128-mp3', is247: false, listenerCount: 0, isLive: true },

      // 24/7 Streams
      { id: 'healing', name: 'Healing Frequencies', category: '24/7', description: 'Solfeggio healing music (432Hz)', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3', is247: true, listenerCount: 0, isLive: true },
      { id: 'meditation', name: 'Meditation & Mindfulness', category: '24/7', description: 'Guided meditation', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3', is247: true, listenerCount: 0, isLive: true },
      { id: 'ambient', name: 'Ambient Soundscapes', category: '24/7', description: 'Ambient and atmospheric', streamUrl: 'https://ice1.somafm.com/lush-128-mp3', is247: true, listenerCount: 0, isLive: true },
      { id: 'sleep', name: 'Sleep & Relaxation', category: '24/7', description: 'Sleep music and sounds', streamUrl: 'https://ice1.somafm.com/drone-128-mp3', is247: true, listenerCount: 0, isLive: true },
      { id: 'focus', name: 'Focus & Productivity', category: '24/7', description: 'Concentration music', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: true, listenerCount: 0, isLive: true },

      // Operator Channels
      { id: 'canryn', name: 'Canryn Productions', category: 'Operators', description: 'Canryn Production content', streamUrl: 'https://ice1.somafm.com/mission-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'sweet-miracles', name: 'Sweet Miracles', category: 'Operators', description: 'Sweet Miracles nonprofit', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'legacy', name: 'Legacy Restored', category: 'Operators', description: 'Legacy preservation', streamUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'studio', name: 'Studio Sessions', category: 'Operators', description: 'Live studio recordings', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'qmunity', name: 'QMunity', category: 'Operators', description: 'Community powered content', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'proof', name: 'Proof Vault', category: 'Operators', description: 'Archival documentation', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'music-radio', name: 'Music & Radio', category: 'Operators', description: 'Music and radio content', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'community', name: 'Community Voices', category: 'Operators', description: 'Community broadcasts', streamUrl: 'https://ice1.somafm.com/mission-128-mp3', is247: false, listenerCount: 0, isLive: true },

      // Special Events
      { id: 'live-events', name: 'Live Events', category: 'Events', description: 'Live event broadcasts', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'conferences', name: 'Conferences & Summits', category: 'Events', description: 'Conference coverage', streamUrl: 'https://ice1.somafm.com/mission-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'emergency', name: 'Emergency Broadcast', category: 'Events', description: 'HybridCast emergency', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'festivals', name: 'Music Festivals', category: 'Events', description: 'Festival coverage', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'workshops', name: 'Workshops & Training', category: 'Events', description: 'Educational workshops', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3', is247: false, listenerCount: 0, isLive: true },
      { id: 'archives', name: 'Archives & Classics', category: 'Events', description: 'Historical archives', streamUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3', is247: false, listenerCount: 0, isLive: true },
    ];

    channels.forEach(ch => this.channels.set(ch.id, ch));
  }

  private initializePlaylists() {
    // Initialize with fallback tracks for each channel
    const fallbackTracks: PlaylistTrack[] = [
      {
        id: 'track-1',
        title: 'Rockin\' Rockin\' Boogie',
        artist: 'Seabrun Candy Hunter & Little Richard',
        url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
        duration: 330,
        channelId: 'legacy',
      },
    ];

    // Create playlists for each channel
    for (const channel of this.channels.values()) {
      this.playlists.set(channel.id, [...fallbackTracks]);
    }
  }

  // Get all channels
  getChannels(): StreamChannel[] {
    return Array.from(this.channels.values());
  }

  // Get channel by ID
  getChannel(channelId: string): StreamChannel | undefined {
    return this.channels.get(channelId);
  }

  // Get channels by category
  getChannelsByCategory(category: string): StreamChannel[] {
    return Array.from(this.channels.values()).filter(ch => ch.category === category);
  }

  // Update listener count
  updateListenerCount(channelId: string, count: number) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.listenerCount = count;
    }
  }

  // Get playlist for channel
  getPlaylist(channelId: string): PlaylistTrack[] {
    return this.playlists.get(channelId) || [];
  }

  // Add track to playlist
  addTrackToPlaylist(channelId: string, track: PlaylistTrack) {
    const playlist = this.playlists.get(channelId) || [];
    playlist.push(track);
    this.playlists.set(channelId, playlist);
  }

  // Remove track from playlist
  removeTrackFromPlaylist(channelId: string, trackId: string) {
    const playlist = this.playlists.get(channelId) || [];
    this.playlists.set(channelId, playlist.filter(t => t.id !== trackId));
  }

  // Start DJ show
  startDJShow(show: DJShow) {
    const shows = this.djShows.get(show.channelId) || [];
    shows.push(show);
    this.djShows.set(show.channelId, shows);

    // Update channel
    const channel = this.channels.get(show.channelId);
    if (channel) {
      channel.isLive = true;
      channel.djName = show.djName;
    }
  }

  // End DJ show
  endDJShow(channelId: string, showId: string) {
    const shows = this.djShows.get(channelId) || [];
    this.djShows.set(channelId, shows.filter(s => s.id !== showId));

    // Update channel
    const channel = this.channels.get(channelId);
    if (channel && shows.length === 0) {
      channel.isLive = false;
      channel.djName = undefined;
    }
  }

  // Get DJ shows for channel
  getDJShows(channelId: string): DJShow[] {
    return this.djShows.get(channelId) || [];
  }

  // Get current DJ show
  getCurrentDJShow(channelId: string): DJShow | undefined {
    const shows = this.getDJShows(channelId);
    const now = Date.now();
    return shows.find(s => s.startTime <= now && s.endTime >= now);
  }

  // Simulate listener count update (for demo purposes)
  simulateListenerActivity() {
    for (const channel of this.channels.values()) {
      channel.listenerCount = Math.floor(Math.random() * 1000);
    }
  }
}

// Export singleton instance
export const streamManager = new StreamManager();
