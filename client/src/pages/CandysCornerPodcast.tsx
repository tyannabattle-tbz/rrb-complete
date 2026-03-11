/**
 * Candy's Corner — Dedicated Podcast Room
 * 
 * Hosted by Candy (dad) with echo/warm male voice.
 * Supports guest AI (Valanna, Seraph) and live participants.
 * Features call-in, game screen, and full recording pipeline.
 */

import PodcastRoom from '@/components/PodcastRoom';
import type { PodcastShowConfig } from '@/components/PodcastRoom';

const CANDYS_CORNER_CONFIG: PodcastShowConfig = {
  id: 'candys-corner',
  title: "Candy's Corner",
  subtitle: 'Hosted by Candy — Stories, Music & Legacy',
  description: "Candy's Corner is where legacy meets conversation. Candy hosts intimate discussions about family, music, healing frequencies, and the Rockin\' Rockin\' Boogie journey. Featuring guest AI personalities and live call-ins from the community.",
  host: {
    name: 'Candy',
    persona: 'candy',
    role: 'Host',
    bio: 'The heart and soul of RRB. Candy brings warmth, wisdom, and real talk to every episode.',
  },
  coHosts: [
    { name: 'Valanna', persona: 'valanna', role: 'Co-Host / AI Assistant' },
  ],
  theme: {
    primary: '#60a5fa',
    secondary: '#3b82f6',
    accent: '#93c5fd',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 50%, #93c5fd 100%)',
  },
  features: {
    callIn: true,
    gameScreen: true,
    guestAi: true,
    liveParticipants: true,
    healingFrequencies: false,
    solbonesGame: false,
  },
  schedule: {
    day: 'Tuesday & Thursday',
    time: '7:00 PM',
    timezone: 'CT',
    frequency: 'Twice weekly',
  },
  socialLinks: {
    youtube: 'https://youtube.com/@rockinrockinboogie',
  },
};

export default function CandysCornerPodcast() {
  return <PodcastRoom config={CANDYS_CORNER_CONFIG} />;
}
