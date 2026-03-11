/**
 * Solbones Podcast — Dedicated Podcast Room
 * 
 * Hosted by Seraph with onyx/deep male voice.
 * Features Solbones 4+3+2 dice game integration,
 * Solfeggio healing frequencies, and sacred math discussions.
 */

import PodcastRoom from '@/components/PodcastRoom';
import type { PodcastShowConfig } from '@/components/PodcastRoom';

const SOLBONES_PODCAST_CONFIG: PodcastShowConfig = {
  id: 'solbones',
  title: 'Solbones Podcast',
  subtitle: 'Sacred Math, Solfeggio Frequencies & the Dice Game',
  description: 'The Solbones Podcast explores the intersection of sacred mathematics, Solfeggio healing frequencies, and the Solbones 4+3+2 dice game. Seraph guides listeners through frequency science, game strategy, and spiritual wellness — all while you can play along live.',
  host: {
    name: 'Seraph',
    persona: 'seraph',
    role: 'Host',
    bio: 'Seraph brings deep knowledge of frequencies, sacred geometry, and the mathematics behind the Solbones game.',
  },
  coHosts: [
    { name: 'Valanna', persona: 'valanna', role: 'Frequency Guide' },
    { name: 'Candy', persona: 'candy', role: 'Guest Contributor' },
  ],
  theme: {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 50%, #fbbf24 100%)',
  },
  features: {
    callIn: true,
    gameScreen: true,
    guestAi: true,
    liveParticipants: true,
    healingFrequencies: true,
    solbonesGame: true,
  },
  schedule: {
    day: 'Wednesday & Saturday',
    time: '8:00 PM',
    timezone: 'CT',
    frequency: 'Twice weekly',
  },
  socialLinks: {
    youtube: 'https://youtube.com/@rockinrockinboogie',
  },
};

export default function SolbonesPodcast() {
  return <PodcastRoom config={SOLBONES_PODCAST_CONFIG} />;
}
