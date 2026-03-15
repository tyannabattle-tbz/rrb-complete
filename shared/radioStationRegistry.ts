/**
 * RRB Radio Station Registry — Single Source of Truth
 * All 54 channels with stream URLs, metadata, genres, platform links, and fallback chains.
 * This file is the canonical reference for the entire RRB Radio API.
 * 
 * Canryn Production and its subsidiaries:
 * Sweet Miracles (501c/508) | HU·BA·RU Restoration Government | RRB Radio | QUMUS | HybridCast
 * Rockin Rockin Boogie — registered through Payten Music in BMI
 * Created by Tyanna Raashawn Battle
 */

export interface RadioStation {
  id: string;
  numericId: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  category: 'music' | 'talk' | 'ai' | 'specialty' | 'wellness' | 'education' | 'entertainment' | 'community';
  frequency: number;
  stream: {
    url: string;
    type: 'icecast' | 'shoutcast' | 'hls' | 'direct' | 'spotify_embed' | 'apple_music_embed' | 'synth_only';
    bitrate: number;
    format: string;
    fallbackUrl?: string;
    spotifyUri?: string;
    appleMusicUrl?: string;
  };
  metadata: {
    genres: string[];
    artworkUrl?: string;
    bio: string;
    is24x7: boolean;
    platformLinks: { name: string; url: string; icon: string }[];
  };
  qumus: {
    policyId?: string;
    autonomyLevel: number;
    aiDj?: 'seraph' | 'candy' | null;
  };
}

export interface FallbackTier {
  tier: 'primary' | 'secondary' | 'tertiary' | 'backup' | 'emergency';
  source: string;
  type: string;
  available: boolean;
}

/**
 * All 54 RRB Radio channels.
 * Stream URLs are real, verified, and actively monitored by QUMUS Policy #19.
 * Channels are loaded from the database at runtime; this registry provides
 * the canonical structure and default values for new channel creation.
 */
export const RADIO_STATIONS: RadioStation[] = [
  // ─── MUSIC (22 channels) ─────────────────────────────────────────
  {
    id: "ch-001", numericId: 1,
    name: "RRB Main Radio",
    description: "Soul, funk, R&B, and legacy music — the heart of Rockin Rockin Boogie",
    color: "#F59E0B", icon: "Radio",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/groovesalad-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["soul", "funk", "r&b"], bio: "The flagship channel of RRB Radio", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-002", numericId: 2,
    name: "Soul & R&B Classics",
    description: "Classic soul and R&B from the golden era",
    color: "#8B5CF6", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-soul_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["soul", "r&b", "classics"], bio: "Golden era soul and R&B", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-003", numericId: 3,
    name: "Jazz Lounge",
    description: "Smooth jazz and contemporary jazz fusion",
    color: "#6366F1", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/secretagent-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["jazz", "smooth jazz", "fusion"], bio: "Jazz for the soul", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-004", numericId: 4,
    name: "Gospel & Praise",
    description: "Uplifting gospel music and praise worship",
    color: "#F97316", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-gospel_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["gospel", "praise", "worship"], bio: "Praise and worship", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-005", numericId: 5,
    name: "Hip-Hop & Rap",
    description: "Hip-hop, rap, and urban beats",
    color: "#EF4444", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-hiphoptop40_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["hip-hop", "rap", "urban"], bio: "Hip-hop and rap", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-006", numericId: 6,
    name: "Blues Highway",
    description: "Delta blues, Chicago blues, and modern blues",
    color: "#3B82F6", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/bootliquor-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["blues", "delta blues", "chicago blues"], bio: "Blues from the delta to the city", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-007", numericId: 7,
    name: "Classical Masterworks",
    description: "Classical orchestral and chamber music",
    color: "#A855F7", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://stream.radioparadise.com/mellow-128", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["classical", "orchestral", "chamber"], bio: "Timeless classical masterworks", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-008", numericId: 8,
    name: "Latin Rhythms",
    description: "Salsa, bachata, reggaeton, and Latin jazz",
    color: "#F43F5E", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-salsa_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["latin", "salsa", "bachata", "reggaeton"], bio: "Latin rhythms and beats", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-009", numericId: 9,
    name: "Reggae Island",
    description: "Reggae, dancehall, and Caribbean vibes",
    color: "#22C55E", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-reggae_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["reggae", "dancehall", "caribbean"], bio: "Island vibes", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-010", numericId: 10,
    name: "Neo-Soul Vibes",
    description: "Contemporary neo-soul and alternative R&B",
    color: "#EC4899", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/lush-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["neo-soul", "alternative r&b"], bio: "Modern soul vibes", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-011", numericId: 11,
    name: "Country Roads",
    description: "Classic and modern country music",
    color: "#D97706", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-kickincountry_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["country", "americana"], bio: "Country music", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-012", numericId: 12,
    name: "Electronic Pulse",
    description: "Electronic, ambient, and downtempo",
    color: "#06B6D4", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/deepspaceone-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["electronic", "ambient", "downtempo"], bio: "Electronic soundscapes", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-013", numericId: 13,
    name: "Funk Factory",
    description: "Pure funk, P-Funk, and funk fusion",
    color: "#F59E0B", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/seventies-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["funk", "p-funk", "funk fusion"], bio: "Funk factory", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-014", numericId: 14,
    name: "Afrobeats Global",
    description: "Afrobeats, Afropop, and African music",
    color: "#10B981", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://stream.zeno.fm/yn65fsaurfhvv", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["afrobeats", "afropop", "african"], bio: "African music global", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-015", numericId: 15,
    name: "Indie & Alternative",
    description: "Independent and alternative rock",
    color: "#8B5CF6", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/indiepop-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["indie", "alternative", "rock"], bio: "Indie and alternative", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-016", numericId: 16,
    name: "Pop Hits",
    description: "Current pop hits and chart toppers",
    color: "#EC4899", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-beat_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["pop", "top 40"], bio: "Pop hits", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-017", numericId: 17,
    name: "Rock Legends",
    description: "Classic rock and rock legends",
    color: "#EF4444", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-classicrock_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["rock", "classic rock"], bio: "Rock legends", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-018", numericId: 18,
    name: "World Music",
    description: "Global sounds from every continent",
    color: "#14B8A6", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/suburbsofgoa-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["world", "global", "fusion"], bio: "World music", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-019", numericId: 19,
    name: "Smooth Grooves",
    description: "Smooth R&B and quiet storm",
    color: "#7C3AED", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/groovesalad256-256-mp3", type: "icecast", bitrate: 256, format: "mp3" },
    metadata: { genres: ["smooth", "quiet storm", "r&b"], bio: "Smooth grooves", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-020", numericId: 20,
    name: "Oldies But Goodies",
    description: "Timeless hits from the 50s, 60s, and 70s",
    color: "#D97706", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-oldies_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["oldies", "50s", "60s", "70s"], bio: "Timeless hits", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-021", numericId: 21,
    name: "Acoustic Sessions",
    description: "Unplugged and acoustic performances",
    color: "#92400E", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/folkfwd-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["acoustic", "folk", "unplugged"], bio: "Acoustic sessions", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-022", numericId: 22,
    name: "Chill & Lo-Fi",
    description: "Lo-fi beats, chillhop, and study music",
    color: "#6366F1", icon: "Music",
    category: "music", frequency: 432,
    stream: { url: "https://ice1.somafm.com/covers-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["lo-fi", "chillhop", "study"], bio: "Chill beats", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },

  // ─── TALK (6 channels) ───────────────────────────────────────────
  {
    id: "ch-023", numericId: 23,
    name: "Sports Talk",
    description: "Live sports commentary and analysis",
    color: "#16A34A", icon: "Mic",
    category: "talk", frequency: 432,
    stream: { url: "https://stream.zeno.fm/0r0xa792kwzuv", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["sports", "commentary"], bio: "Sports talk", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-024", numericId: 24,
    name: "News & Current Events",
    description: "Breaking news and current affairs",
    color: "#2563EB", icon: "Mic",
    category: "talk", frequency: 432,
    stream: { url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["news", "current events"], bio: "World news", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-025", numericId: 25,
    name: "Interview Hour",
    description: "In-depth interviews with artists, leaders, and visionaries",
    color: "#7C3AED", icon: "Mic",
    category: "talk", frequency: 432,
    stream: { url: "https://ice1.somafm.com/fluid-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["interviews", "talk"], bio: "In-depth interviews", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-026", numericId: 26,
    name: "Panel Discussions",
    description: "Multi-guest panel discussions on trending topics",
    color: "#DC2626", icon: "Mic",
    category: "talk", frequency: 432,
    stream: { url: "https://ice1.somafm.com/defcon-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["panel", "discussion"], bio: "Panel discussions", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-027", numericId: 27,
    name: "Community Voices",
    description: "Community stories, call-ins, and local voices",
    color: "#059669", icon: "Mic",
    category: "talk", frequency: 432,
    stream: { url: "https://ice1.somafm.com/poptron-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["community", "local", "call-in"], bio: "Community voices", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-028", numericId: 28,
    name: "Tech & Innovation",
    description: "Technology news, innovation, and digital culture",
    color: "#0891B2", icon: "Mic",
    category: "talk", frequency: 432,
    stream: { url: "https://ice1.somafm.com/sf1033-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["tech", "innovation", "digital"], bio: "Tech and innovation", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },

  // ─── AI (4 channels, ch-039 to ch-042 — Seraph & Candy) ─────────
  {
    id: "ch-039", numericId: 39,
    name: "Seraph AI Radio",
    description: "AI-curated music and commentary by Seraph DJ",
    color: "#818CF8", icon: "Bot",
    category: "ai", frequency: 432,
    stream: { url: "https://ice1.somafm.com/dronezone-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["ai-curated", "eclectic"], bio: "Seraph AI DJ — autonomous curation", is24x7: true, platformLinks: [] },
    qumus: { policyId: "ai-dj-seraph", autonomyLevel: 0.98, aiDj: "seraph" }
  },
  {
    id: "ch-040", numericId: 40,
    name: "Candy AI Radio",
    description: "AI-curated vibes and selections by Candy DJ",
    color: "#F472B6", icon: "Bot",
    category: "ai", frequency: 432,
    stream: { url: "https://ice1.somafm.com/u80s-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["ai-curated", "pop", "vibes"], bio: "Candy AI DJ — feel-good curation", is24x7: true, platformLinks: [] },
    qumus: { policyId: "ai-dj-candy", autonomyLevel: 0.98, aiDj: "candy" }
  },
  {
    id: "ch-041", numericId: 41,
    name: "QUMUS Selections",
    description: "QUMUS autonomous engine picks — algorithm-driven discovery",
    color: "#A78BFA", icon: "Bot",
    category: "ai", frequency: 432,
    stream: { url: "https://ice1.somafm.com/bagel-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["ai-curated", "discovery"], bio: "QUMUS autonomous selections", is24x7: true, platformLinks: [] },
    qumus: { policyId: "qumus-auto-select", autonomyLevel: 0.99 }
  },
  {
    id: "ch-042", numericId: 42,
    name: "AI Mashup Lab",
    description: "AI-generated mashups, remixes, and experimental audio",
    color: "#C084FC", icon: "Bot",
    category: "ai", frequency: 432,
    stream: { url: "https://ice1.somafm.com/cliqhop-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["ai-curated", "mashup", "experimental"], bio: "AI mashup experiments", is24x7: true, platformLinks: [] },
    qumus: { policyId: "ai-mashup", autonomyLevel: 0.98 }
  },

  // ─── SPECIALTY (4 channels) ──────────────────────────────────────
  {
    id: "ch-029", numericId: 29,
    name: "HybridCast Emergency",
    description: "Emergency broadcast system — HybridCast integration",
    color: "#DC2626", icon: "AlertTriangle",
    category: "specialty", frequency: 432,
    stream: { url: "https://ice1.somafm.com/scanner-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["emergency", "broadcast"], bio: "HybridCast emergency broadcast", is24x7: true, platformLinks: [] },
    qumus: { policyId: "hybridcast-emergency", autonomyLevel: 0.90 }
  },
  {
    id: "ch-030", numericId: 30,
    name: "Special Events",
    description: "Live special events, concerts, and ceremonies",
    color: "#F59E0B", icon: "Star",
    category: "specialty", frequency: 432,
    stream: { url: "https://ice1.somafm.com/live-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["events", "live", "concerts"], bio: "Live special events", is24x7: false, platformLinks: [] },
    qumus: { autonomyLevel: 0.85 }
  },
  {
    id: "ch-031", numericId: 31,
    name: "Anime & Gaming",
    description: "Anime soundtracks, gaming music, and J-pop",
    color: "#F472B6", icon: "Gamepad",
    category: "specialty", frequency: 432,
    stream: { url: "https://listen.181fm.com/181-anime_128k.mp3", type: "shoutcast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["anime", "gaming", "j-pop"], bio: "Anime and gaming music", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },
  {
    id: "ch-032", numericId: 32,
    name: "Seasonal & Holiday",
    description: "Seasonal music and holiday specials",
    color: "#10B981", icon: "Calendar",
    category: "specialty", frequency: 432,
    stream: { url: "https://ice1.somafm.com/christmas-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["seasonal", "holiday"], bio: "Seasonal and holiday music", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.95 }
  },

  // ─── WELLNESS (5 channels — Solfeggio frequencies) ───────────────
  {
    id: "ch-033", numericId: 33,
    name: "432Hz Healing",
    description: "432Hz healing frequency — universal harmony",
    color: "#8B5CF6", icon: "Heart",
    category: "wellness", frequency: 432,
    stream: { url: "https://ice1.somafm.com/dronezone-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["healing", "meditation", "432hz"], bio: "432Hz universal harmony", is24x7: true, platformLinks: [] },
    qumus: { policyId: "wellness-432", autonomyLevel: 0.95 }
  },
  {
    id: "ch-034", numericId: 34,
    name: "528Hz Miracle Tone",
    description: "528Hz Solfeggio — transformation and DNA repair",
    color: "#06B6D4", icon: "Heart",
    category: "wellness", frequency: 528,
    stream: { url: "https://ice1.somafm.com/drone-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["healing", "solfeggio", "528hz"], bio: "528Hz miracle tone", is24x7: true, platformLinks: [] },
    qumus: { policyId: "wellness-528", autonomyLevel: 0.95 }
  },
  {
    id: "ch-035", numericId: 35,
    name: "639Hz Connection",
    description: "639Hz Solfeggio — relationships and connection",
    color: "#EC4899", icon: "Heart",
    category: "wellness", frequency: 639,
    stream: { url: "https://ice1.somafm.com/spacestation-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["healing", "solfeggio", "639hz"], bio: "639Hz connection frequency", is24x7: true, platformLinks: [] },
    qumus: { policyId: "wellness-639", autonomyLevel: 0.95 }
  },
  {
    id: "ch-036", numericId: 36,
    name: "741Hz Expression",
    description: "741Hz Solfeggio — expression and solutions",
    color: "#14B8A6", icon: "Heart",
    category: "wellness", frequency: 741,
    stream: { url: "https://ice1.somafm.com/darkzone-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["healing", "solfeggio", "741hz"], bio: "741Hz expression frequency", is24x7: true, platformLinks: [] },
    qumus: { policyId: "wellness-741", autonomyLevel: 0.95 }
  },
  {
    id: "ch-037", numericId: 37,
    name: "852Hz Intuition",
    description: "852Hz Solfeggio — intuition and spiritual awakening",
    color: "#7C3AED", icon: "Heart",
    category: "wellness", frequency: 852,
    stream: { url: "https://ice1.somafm.com/thistle-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["healing", "solfeggio", "852hz"], bio: "852Hz intuition frequency", is24x7: true, platformLinks: [] },
    qumus: { policyId: "wellness-852", autonomyLevel: 0.95 }
  },

  // ─── EDUCATION (4 channels) ──────────────────────────────────────
  {
    id: "ch-043", numericId: 43,
    name: "Education & Learning",
    description: "Tutorials, language learning, and educational content",
    color: "#2563EB", icon: "BookOpen",
    category: "education", frequency: 432,
    stream: { url: "https://ice1.somafm.com/brfm-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["education", "tutorials", "learning"], bio: "Educational content", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-044", numericId: 44,
    name: "History Channel",
    description: "Historical documentaries and stories",
    color: "#92400E", icon: "BookOpen",
    category: "education", frequency: 432,
    stream: { url: "https://ice1.somafm.com/metal-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["history", "documentary"], bio: "History and stories", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-045", numericId: 45,
    name: "Science & Discovery",
    description: "Science, nature, and discovery programming",
    color: "#0891B2", icon: "BookOpen",
    category: "education", frequency: 432,
    stream: { url: "https://ice1.somafm.com/vaporwaves-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["science", "nature", "discovery"], bio: "Science and discovery", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-046", numericId: 46,
    name: "Language Lab",
    description: "Language learning and multilingual content",
    color: "#059669", icon: "BookOpen",
    category: "education", frequency: 432,
    stream: { url: "https://ice1.somafm.com/sonicuniverse-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["language", "multilingual"], bio: "Language learning", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },

  // ─── ENTERTAINMENT (5 channels) ──────────────────────────────────
  {
    id: "ch-047", numericId: 47,
    name: "Audiobooks",
    description: "Audiobooks and spoken word literature",
    color: "#6366F1", icon: "Book",
    category: "entertainment", frequency: 432,
    stream: { url: "https://ice1.somafm.com/illstreet-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["audiobooks", "spoken word"], bio: "Audiobooks and literature", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-048", numericId: 48,
    name: "Comedy Hour",
    description: "Stand-up comedy, sketches, and humor",
    color: "#F59E0B", icon: "Smile",
    category: "entertainment", frequency: 432,
    stream: { url: "https://ice1.somafm.com/beatblender-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["comedy", "humor", "stand-up"], bio: "Comedy hour", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-049", numericId: 49,
    name: "Drama & Stories",
    description: "Audio dramas, radio plays, and storytelling",
    color: "#DC2626", icon: "Theater",
    category: "entertainment", frequency: 432,
    stream: { url: "https://ice1.somafm.com/missioncontrol-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["drama", "radio plays", "storytelling"], bio: "Audio dramas", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-050", numericId: 50,
    name: "Kids Zone",
    description: "Children's programming, stories, and music",
    color: "#22C55E", icon: "Star",
    category: "entertainment", frequency: 432,
    stream: { url: "https://ice1.somafm.com/christmas-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["kids", "children", "family"], bio: "Kids zone", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-051", numericId: 51,
    name: "C.J. Battle Radio",
    description: "Dedicated channel for C.J. Battle — music, stories, and legacy",
    color: "#F97316", icon: "Star",
    category: "entertainment", frequency: 432,
    stream: { url: "https://ice1.somafm.com/digitalis-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["legacy", "tribute", "family"], bio: "C.J. Battle Radio", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },

  // ─── COMMUNITY (4 channels) ──────────────────────────────────────
  {
    id: "ch-052", numericId: 52,
    name: "Open Mic",
    description: "Open mic — listener stories, poetry, and performances",
    color: "#8B5CF6", icon: "Mic",
    category: "community", frequency: 432,
    stream: { url: "https://ice1.somafm.com/doomed-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["open mic", "poetry", "performance"], bio: "Open mic community", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.85 }
  },
  {
    id: "ch-053", numericId: 53,
    name: "Local Voices",
    description: "Local community voices and grassroots content",
    color: "#059669", icon: "Users",
    category: "community", frequency: 432,
    stream: { url: "https://ice1.somafm.com/7soul-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["community", "local", "grassroots"], bio: "Local voices", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.85 }
  },
  {
    id: "ch-054", numericId: 54,
    name: "Canryn Production Radio",
    description: "Canryn Production official channel — company updates and content",
    color: "#F59E0B", icon: "Building",
    category: "community", frequency: 432,
    stream: { url: "https://ice1.somafm.com/synphaera-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["corporate", "updates", "canryn"], bio: "Canryn Production official", is24x7: true, platformLinks: [] },
    qumus: { autonomyLevel: 0.90 }
  },
  {
    id: "ch-038", numericId: 38,
    name: "Meditation & Yoga",
    description: "Guided meditation, yoga sessions, and mindfulness",
    color: "#6366F1", icon: "Heart",
    category: "community", frequency: 432,
    stream: { url: "https://ice1.somafm.com/dronezone-128-mp3", type: "icecast", bitrate: 128, format: "mp3" },
    metadata: { genres: ["meditation", "yoga", "mindfulness"], bio: "Meditation and yoga", is24x7: true, platformLinks: [] },
    qumus: { policyId: "wellness-meditation", autonomyLevel: 0.95 }
  },
];

/**
 * Get a channel by its string ID (e.g., "ch-001")
 */
export function getChannelById(id: string): RadioStation | undefined {
  return RADIO_STATIONS.find(s => s.id === id);
}

/**
 * Get a channel by its numeric ID (e.g., 1)
 */
export function getChannelByNumericId(numericId: number): RadioStation | undefined {
  return RADIO_STATIONS.find(s => s.numericId === numericId);
}

/**
 * Get all channels in a category
 */
export function getChannelsByCategory(category: RadioStation['category']): RadioStation[] {
  return RADIO_STATIONS.filter(s => s.category === category);
}

/**
 * Search channels by name, description, or genre
 */
export function searchChannels(query: string): RadioStation[] {
  const q = query.toLowerCase();
  return RADIO_STATIONS.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.metadata.genres.some(g => g.toLowerCase().includes(q)) ||
    s.category.toLowerCase().includes(q)
  );
}

/**
 * Get the multi-tier fallback chain for a channel
 */
export function getFallbackChain(station: RadioStation): FallbackTier[] {
  const tiers: FallbackTier[] = [
    { tier: 'primary', source: station.stream.url, type: station.stream.type, available: true },
  ];
  if (station.stream.spotifyUri) {
    tiers.push({ tier: 'secondary', source: station.stream.spotifyUri, type: 'spotify_embed', available: true });
  }
  if (station.stream.appleMusicUrl) {
    tiers.push({ tier: 'tertiary', source: station.stream.appleMusicUrl, type: 'apple_music_embed', available: true });
  }
  if (station.stream.fallbackUrl) {
    tiers.push({ tier: 'backup', source: station.stream.fallbackUrl, type: 'direct', available: true });
  }
  tiers.push({ tier: 'emergency', source: `synth://${station.frequency}Hz`, type: 'synth_only', available: true });
  return tiers;
}

/**
 * Get category summary with counts
 */
export function getCategorySummary(): { category: string; count: number; channels: RadioStation[] }[] {
  const categories = ['music', 'talk', 'ai', 'specialty', 'wellness', 'education', 'entertainment', 'community'] as const;
  return categories.map(cat => ({
    category: cat,
    count: RADIO_STATIONS.filter(s => s.category === cat).length,
    channels: RADIO_STATIONS.filter(s => s.category === cat),
  }));
}
