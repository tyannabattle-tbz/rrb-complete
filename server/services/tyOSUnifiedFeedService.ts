/**
 * Ty OS Unified Feed Service
 * Source of truth for all 54 radio channels
 * Feeds QUMUS, RRB, and all subsystems
 */

import { EventEmitter } from 'events';

export interface RadioChannel {
  numericId: number;
  name: string;
  genre: string;
  streamUrl: string;
}

export interface FeedUpdate {
  channel: RadioChannel;
  timestamp: number;
  status: 'live' | 'offline' | 'error';
}

// Ty OS Registry - Single source of truth
const TY_OS_REGISTRY: RadioChannel[] = [
  { numericId: 1, name: "RRB Main Radio", genre: "Soul, Funk, R&B", streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { numericId: 2, name: "Soul & R&B Classics", genre: "Soul, R&B, Classics", streamUrl: "https://listen.181fm.com/181-soul_128k.mp3" },
  { numericId: 3, name: "Jazz Lounge", genre: "Jazz, Smooth Jazz, Fusion", streamUrl: "https://ice1.somafm.com/secretagent-128-mp3" },
  { numericId: 4, name: "80s Hits", genre: "80s, Pop, Rock, New Wave", streamUrl: "https://listen.181fm.com/181-awesome80s_128k.mp3" },
  { numericId: 5, name: "Hip-Hop & Rap", genre: "Hip-Hop, Rap, Urban", streamUrl: "https://listen.181fm.com/181-hiphoptop40_128k.mp3" },
  { numericId: 6, name: "Blues Highway", genre: "Blues, Delta Blues, Chicago Blues", streamUrl: "https://ice1.somafm.com/bootliquor-128-mp3" },
  { numericId: 7, name: "Classical Masterworks", genre: "Classical, Orchestral, Chamber", streamUrl: "https://stream.radioparadise.com/mellow-128" },
  { numericId: 8, name: "Latin Rhythms", genre: "Salsa, Bachata, Reggaeton", streamUrl: "https://listen.181fm.com/181-salsa_128k.mp3" },
  { numericId: 9, name: "Reggae Island", genre: "Reggae, Dancehall, Caribbean", streamUrl: "https://listen.181fm.com/181-reggae_128k.mp3" },
  { numericId: 10, name: "Neo-Soul Vibes", genre: "Neo-Soul, R&B, Alt Soul", streamUrl: "https://ice1.somafm.com/lush-128-mp3" },
  { numericId: 11, name: "Country Roads", genre: "Country, Americana, Folk", streamUrl: "https://listen.181fm.com/181-kickincountry_128k.mp3" },
  { numericId: 12, name: "Electronic Pulse", genre: "EDM, House, Techno", streamUrl: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { numericId: 13, name: "Funk Factory", genre: "Funk, Disco, Groove", streamUrl: "https://ice1.somafm.com/seventies-128-mp3" },
  { numericId: 14, name: "Afrobeats Global", genre: "Afrobeats, Amapiano, Afropop", streamUrl: "https://stream.zeno.fm/yn65fsaurfhvv" },
  { numericId: 15, name: "Indie & Alternative", genre: "Indie, Alternative, Underground", streamUrl: "https://ice1.somafm.com/indiepop-128-mp3" },
  { numericId: 16, name: "Pop Hits", genre: "Pop, Top 40, Hits", streamUrl: "https://listen.181fm.com/181-beat_128k.mp3" },
  { numericId: 17, name: "Rock Legends", genre: "Rock, Classic Rock, Alternative", streamUrl: "https://listen.181fm.com/181-classicrock_128k.mp3" },
  { numericId: 18, name: "World Music", genre: "World, Fusion, Global", streamUrl: "https://ice1.somafm.com/suburbsofgoa-128-mp3" },
  { numericId: 19, name: "Smooth Grooves", genre: "Smooth R&B, Quiet Storm", streamUrl: "https://ice1.somafm.com/groovesalad256-256-mp3" },
  { numericId: 20, name: "Oldies But Goodies", genre: "Oldies, 60s, 70s Classics", streamUrl: "https://listen.181fm.com/181-oldies_128k.mp3" },
  { numericId: 21, name: "Acoustic Sessions", genre: "Acoustic, Folk, Singer-Songwriter", streamUrl: "https://ice1.somafm.com/folkfwd-128-mp3" },
  { numericId: 22, name: "Chill & Lo-Fi", genre: "Lo-Fi, Chill, Downtempo", streamUrl: "https://ice1.somafm.com/covers-128-mp3" },
  { numericId: 23, name: "Sports Talk", genre: "Sports, Analysis, Commentary", streamUrl: "https://stream.zeno.fm/0r0xa792kwzuv" },
  { numericId: 24, name: "News & Current Events", genre: "News, Commentary, Current Affairs", streamUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { numericId: 25, name: "Interview Hour", genre: "Interviews, Talk, Conversations", streamUrl: "https://ice1.somafm.com/fluid-128-mp3" },
  { numericId: 26, name: "Panel Discussions", genre: "Panel, Debate, Discussion", streamUrl: "https://ice1.somafm.com/defcon-128-mp3" },
  { numericId: 27, name: "Community Voices", genre: "Community, Talk, Call-In", streamUrl: "https://ice1.somafm.com/poptron-128-mp3" },
  { numericId: 28, name: "Tech & Innovation", genre: "Technology, Innovation, AI", streamUrl: "https://ice1.somafm.com/sf1033-128-mp3" },
  { numericId: 29, name: "HybridCast Emergency", genre: "Emergency, News, Public Safety", streamUrl: "https://ice1.somafm.com/scanner-128-mp3" },
  { numericId: 30, name: "Special Events", genre: "Live Events, Concerts", streamUrl: "https://ice1.somafm.com/live-128-mp3" },
  { numericId: 31, name: "Anime & Gaming", genre: "Anime, Gaming, J-Pop, Chiptune", streamUrl: "https://listen.181fm.com/181-anime_128k.mp3" },
  { numericId: 32, name: "90s R&B", genre: "90s, R&B, New Jack Swing", streamUrl: "https://listen.181fm.com/181-90srnb_128k.mp3" },
  { numericId: 33, name: "432Hz Healing", genre: "Healing, 432Hz, Ambient", streamUrl: "https://ice1.somafm.com/dronezone-128-mp3" },
  { numericId: 34, name: "528Hz Miracle Tone", genre: "528Hz, Healing, Meditation", streamUrl: "https://ice1.somafm.com/drone-128-mp3" },
  { numericId: 35, name: "639Hz Connection", genre: "639Hz, Harmony, Ambient", streamUrl: "https://ice1.somafm.com/spacestation-128-mp3" },
  { numericId: 36, name: "741Hz Expression", genre: "741Hz, Expression, Ambient", streamUrl: "https://ice1.somafm.com/darkzone-128-mp3" },
  { numericId: 37, name: "852Hz Intuition", genre: "852Hz, Intuition, Ambient", streamUrl: "https://ice1.somafm.com/thistle-128-mp3" },
  { numericId: 38, name: "2000s Hits", genre: "2000s, Pop, R&B, Hip-Hop", streamUrl: "https://listen.181fm.com/181-2000srnb_128k.mp3" },
  { numericId: 39, name: "Seraph AI Radio", genre: "AI-Curated, Experimental, Ambient", streamUrl: "https://ice1.somafm.com/dronezone-128-mp3" },
  { numericId: 40, name: "Candy AI Radio", genre: "AI-Curated, 80s, Vaporwave", streamUrl: "https://ice1.somafm.com/u80s-128-mp3" },
  { numericId: 41, name: "QUMUS Selections", genre: "AI-Curated, Eclectic, Discovery", streamUrl: "https://ice1.somafm.com/bagel-128-mp3" },
  { numericId: 42, name: "AI Mashup Lab", genre: "AI-Curated, Electronic, Mashup", streamUrl: "https://ice1.somafm.com/cliqhop-128-mp3" },
  { numericId: 43, name: "Education & Learning", genre: "Education, Learning, Ambient", streamUrl: "https://ice1.somafm.com/brfm-128-mp3" },
  { numericId: 44, name: "Classic Hip-Hop", genre: "Classic Hip-Hop, 90s Rap, Golden Era", streamUrl: "https://listen.181fm.com/181-oldschoolhiphop_128k.mp3" },
  { numericId: 45, name: "Science & Discovery", genre: "Science, Technology, Discovery", streamUrl: "https://ice1.somafm.com/vaporwaves-128-mp3" },
  { numericId: 46, name: "R&B Slow Jams", genre: "R&B, Slow Jams, Love Songs", streamUrl: "https://listen.181fm.com/181-rnb_128k.mp3" },
  { numericId: 47, name: "Audiobooks", genre: "Audiobooks, Stories, Narration", streamUrl: "https://ice1.somafm.com/illstreet-128-mp3" },
  { numericId: 48, name: "Comedy Hour", genre: "Comedy, Stand-Up, Humor", streamUrl: "https://ice1.somafm.com/beatblender-128-mp3" },
  { numericId: 49, name: "Drama & Stories", genre: "Drama, Radio Drama, Stories", streamUrl: "https://ice1.somafm.com/missioncontrol-128-mp3" },
  { numericId: 50, name: "90s Hip-Hop", genre: "90s Hip-Hop, East Coast, West Coast", streamUrl: "https://listen.181fm.com/181-90ship-hop_128k.mp3" },
  { numericId: 51, name: "C.J. Battle Radio", genre: "Hip-Hop, R&B, Live Battles", streamUrl: "https://ice1.somafm.com/digitalis-128-mp3" },
  { numericId: 52, name: "Open Mic", genre: "Open Mic, Freestyle, Live", streamUrl: "https://ice1.somafm.com/doomed-128-mp3" },
  { numericId: 53, name: "Local Voices", genre: "Local, Community, Talk", streamUrl: "https://ice1.somafm.com/7soul-128-mp3" },
  { numericId: 54, name: "Canryn Production Radio", genre: "Production, Studio, Mixed", streamUrl: "https://ice1.somafm.com/synphaera-128-mp3" },
];

class TyOSUnifiedFeedService extends EventEmitter {
  private channels: Map<number, RadioChannel> = new Map();
  private channelStatus: Map<number, FeedUpdate> = new Map();
  private isHealthy = true;
  private lastSync = Date.now();

  constructor() {
    super();
    this.initializeChannels();
    this.startHealthCheck();
  }

  private initializeChannels() {
    for (const channel of TY_OS_REGISTRY) {
      this.channels.set(channel.numericId, channel);
      this.channelStatus.set(channel.numericId, {
        channel,
        timestamp: Date.now(),
        status: 'live',
      });
    }
  }

  private startHealthCheck() {
    setInterval(() => {
      this.lastSync = Date.now();
      this.emit('health-check', {
        isHealthy: this.isHealthy,
        channelCount: this.channels.size,
        liveChannels: Array.from(this.channelStatus.values()).filter(s => s.status === 'live').length,
        timestamp: Date.now(),
      });
    }, 5000); // 5-second health check
  }

  /**
   * Get all channels (for QUMUS and RRB)
   */
  getAllChannels(): RadioChannel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Get single channel by ID
   */
  getChannel(numericId: number): RadioChannel | undefined {
    return this.channels.get(numericId);
  }

  /**
   * Get channels by genre (for QUMUS filtering)
   */
  getChannelsByGenre(genre: string): RadioChannel[] {
    return Array.from(this.channels.values()).filter(ch =>
      ch.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  /**
   * Get feed for QUMUS (WebSocket stream)
   */
  getFeedForQUMUS() {
    return {
      channels: this.getAllChannels(),
      status: this.isHealthy ? 'healthy' : 'degraded',
      lastSync: this.lastSync,
      totalChannels: this.channels.size,
      timestamp: Date.now(),
    };
  }

  /**
   * Get feed for RRB (stream URLs only)
   */
  getFeedForRRB() {
    return {
      channels: this.getAllChannels().map(ch => ({
        id: ch.numericId,
        name: ch.name,
        streamUrl: ch.streamUrl,
      })),
      status: this.isHealthy ? 'healthy' : 'degraded',
      timestamp: Date.now(),
    };
  }

  /**
   * Update channel status (called by health checks)
   */
  updateChannelStatus(numericId: number, status: 'live' | 'offline' | 'error') {
    const channel = this.channels.get(numericId);
    if (channel) {
      this.channelStatus.set(numericId, {
        channel,
        timestamp: Date.now(),
        status,
      });
      this.emit('channel-status-update', {
        numericId,
        status,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get channel status
   */
  getChannelStatus(numericId: number): FeedUpdate | undefined {
    return this.channelStatus.get(numericId);
  }

  /**
   * Get all channel statuses
   */
  getAllChannelStatuses(): FeedUpdate[] {
    return Array.from(this.channelStatus.values());
  }

  /**
   * Set overall health status
   */
  setHealthStatus(isHealthy: boolean) {
    this.isHealthy = isHealthy;
    this.emit('health-status-change', { isHealthy, timestamp: Date.now() });
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isHealthy: this.isHealthy,
      lastSync: this.lastSync,
      channelCount: this.channels.size,
      liveChannels: Array.from(this.channelStatus.values()).filter(s => s.status === 'live').length,
      timestamp: Date.now(),
    };
  }
}

// Singleton instance
export const tyOSFeedService = new TyOSUnifiedFeedService();
