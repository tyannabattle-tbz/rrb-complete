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
 * 
 * HOW TO CREATE A NEW SHOW:
 * 1. Copy this file to a new name: e.g., MyNewPodcast.tsx
 * 2. Update the config object below with your show details
 * 3. Add a route in App.tsx: <Route path="/podcast/my-new-show" component={MyNewPodcast} />
 * 4. Add the show to the PodcastsHub navigation
 */
import PodcastRoom from '@/components/PodcastRoom';
import type { PodcastShowConfig } from '@/components/PodcastRoom';

// ═══════════════════════════════════════════════════
// CUSTOMIZE YOUR SHOW BELOW
// ═══════════════════════════════════════════════════

const NEW_SHOW_CONFIG: PodcastShowConfig = {
  // ─── Show Identity ───
  title: 'Your Show Name',
  subtitle: 'Your Show Tagline',
  description: 'Describe what your show is about. This appears in the show info section.',
  showId: 'your-show-id', // Unique identifier — use kebab-case
  
  // ─── Host Info ───
  hostName: 'Your Name',
  hostTitle: 'Host & Creator',
  
  // ─── AI Co-Host ───
  aiCoHostName: 'QUMUS AI',
  aiCoHostPersonality: 'Supportive and knowledgeable co-host who helps guide conversations and provides relevant insights.',
  
  // ─── Theme Colors ───
  theme: {
    primary: '#D4A843',    // Main accent color (buttons, highlights)
    secondary: '#1a1a2e',  // Background / secondary color
    accent: '#e74c3c',     // LIVE indicator / alerts
    gradient: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]', // Background gradient
  },
  
  // ─── Streaming ───
  zoomRoomUrl: import.meta.env.VITE_ZOOM_URL || undefined,
  streamingUrl: 'https://studio.restream.io/enk-osex-pju',
  
  // ─── Schedule ───
  schedule: 'Weekly — Day & Time TBD',
  
  // ─── Categories & Tags ───
  categories: ['General', 'Community'],
  tags: ['podcast', 'community', 'canryn-production'],
  
  // ─── Features (enable/disable) ───
  features: {
    callIn: true,        // Allow listeners to call in
    recording: true,     // Enable recording
    aiCoHost: true,      // Enable AI co-host
    liveChat: true,      // Enable live chat during shows
    episodes: true,      // Show episode library
  },
};

// ═══════════════════════════════════════════════════
// DO NOT EDIT BELOW — This renders the podcast room
// ═══════════════════════════════════════════════════

export default function PodcastTemplate() {
  return <PodcastRoom config={NEW_SHOW_CONFIG} />;
}
