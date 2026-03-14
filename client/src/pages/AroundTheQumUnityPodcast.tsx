/**
 * Around the QumUnity — Dedicated Podcast Room
 * 
 * Hosted by Valanna with nova/warm female voice.
 * Community-focused podcast covering QUMUS ecosystem updates,
 * community stories, and the QumUnity movement.
 */

import PodcastRoom from '@/components/PodcastRoom';
import type { PodcastShowConfig } from '@/components/PodcastRoom';

const AROUND_THE_QUMUNITY_CONFIG: PodcastShowConfig = {
  id: 'around-the-qumunity',
  title: 'Around the QumUnity',
  subtitle: 'Community Voices, QUMUS Updates & Movement Building',
  description: 'Around the QumUnity is the community pulse of the entire ecosystem. Valanna hosts conversations with community members, covers QUMUS platform updates, highlights Sweet Miracles impact stories, and explores how technology and community intersect to create lasting change.',
  host: {
    name: 'Valanna',
    persona: 'valanna',
    role: 'Host',
    bio: 'Valanna is the voice of the QumUnity — connecting community members, sharing impact stories, and keeping everyone informed about the ecosystem.',
  },
  coHosts: [
    { name: 'Candy', persona: 'candy', role: 'Legacy Correspondent' },
    { name: 'Seraph', persona: 'seraph', role: 'Tech & Strategy Analyst' },
  ],
  theme: {
    primary: '#a78bfa',
    secondary: '#7c3aed',
    accent: '#c4b5fd',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #a78bfa 50%, #c4b5fd 100%)',
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
    day: 'Monday & Friday',
    time: '6:00 PM',
    timezone: 'CT',
    frequency: 'Twice weekly',
  },
  socialLinks: {
    youtube: 'https://youtube.com/@rockinrockinboogie',
  },
  zoomRoomUrl: import.meta.env.VITE_ZOOM_URL || undefined,
  streamingUrl: 'https://studio.restream.io/enk-osex-pju',
};

export default function AroundTheQumUnityPodcast() {
  return <PodcastRoom config={AROUND_THE_QUMUNITY_CONFIG} />;
}
