/**
 * PodcastTemplate — Reusable Template for New Podcast Shows
 * 
 * Clone this file and customize the config to create a new podcast show.
 * Each show gets its own room with:
 * - Go Live streaming via Zoom + Restream
 * - AI co-host with customizable personality
 * - Call-in system for guests
 * - Recording pipeline with auto-distribution
 * - Episode management
 * - Full social sharing (Twitter/X, Facebook, LinkedIn, WhatsApp, Telegram, Email, QR)
 * - Streaming entry (Zoom, Restream, RTMP multi-stream)
 * 
 * HOW TO CREATE A NEW SHOW:
 * 1. Copy this file to a new name: e.g., MyNewPodcast.tsx
 * 2. Update the config object below with your show details
 * 3. Add a route in App.tsx: <Route path="/podcast/my-new-show" component={MyNewPodcast} />
 * 4. Add the show to the PodcastsHub SHOW_CONFIGS
 * 5. Create the show in the database via the Podcasts Hub admin
 * 
 * Canryn Production LLC — Powered by QUMUS
 */
import PodcastRoom from '@/components/PodcastRoom';
import type { PodcastShowConfig } from '@/components/PodcastRoom';

// ═══════════════════════════════════════════════════
// CUSTOMIZE YOUR SHOW BELOW
// ═══════════════════════════════════════════════════

const NEW_SHOW_CONFIG: PodcastShowConfig = {
  // ─── Show Identity ───
  id: 'your-show-slug',  // Unique slug — use kebab-case, must match DB slug
  title: 'Your Show Name',
  subtitle: 'Your Show Tagline — Hosted by You',
  description: 'Describe what your show is about. This appears in the show info section and the sidebar. Keep it concise but compelling.',

  // ─── Host Info ───
  host: {
    name: 'Your Name',
    persona: 'valanna',  // AI persona: 'valanna' | 'candy' | 'seraph'
    role: 'Host & Creator',
    bio: 'A brief bio about the host. This appears in the guest tab.',
  },

  // ─── Co-Hosts (optional) ───
  coHosts: [
    { name: 'Valanna', persona: 'valanna', role: 'AI Co-Host' },
  ],

  // ─── Theme Colors ───
  theme: {
    primary: '#D4A843',    // Main accent color (buttons, highlights)
    secondary: '#1a1a2e',  // Secondary color
    accent: '#e74c3c',     // Tertiary accent
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #D4A843 50%, #e74c3c 100%)',
  },

  // ─── Features (enable/disable) ───
  features: {
    callIn: true,            // Allow listeners to call in via WebRTC
    gameScreen: true,        // Enable interactive game screen overlay
    guestAi: true,           // Enable AI guest personalities
    liveParticipants: true,  // Allow live participant joining
    healingFrequencies: false, // Solfeggio frequency integration
    solbonesGame: false,     // Solbones 4+3+2 dice game integration
  },

  // ─── Schedule ───
  schedule: {
    day: 'Day TBD',
    time: 'Time TBD',
    timezone: 'CT',
    frequency: 'Weekly',
  },

  // ─── Social Links (optional) ───
  socialLinks: {
    youtube: 'https://youtube.com/@rockinrockinboogie',
  },

  // ─── Streaming ───
  zoomRoomUrl: import.meta.env.VITE_ZOOM_URL || undefined,
  streamingUrl: 'https://studio.restream.io/enk-osex-pju',
};

// ═══════════════════════════════════════════════════
// DO NOT EDIT BELOW — This renders the podcast room
// ═══════════════════════════════════════════════════

export default function PodcastTemplate() {
  return <PodcastRoom config={NEW_SHOW_CONFIG} />;
}
