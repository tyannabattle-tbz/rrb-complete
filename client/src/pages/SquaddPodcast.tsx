/**
 * SQUADD Podcast — Sisters Questing Unapologetically After Divine Destiny
 * 
 * The official podcast of the SQUADD Coalition.
 * Hosted by Tyanna (Ty) Battle with the full coalition as co-hosts.
 * Covers elder advocacy, civil rights, community organizing,
 * economic sovereignty, faith-based outreach, and legacy preservation.
 * 
 * Features: Call-in, live participants, AI guest support, Zoom streaming
 */
import PodcastRoom from '@/components/PodcastRoom';
import type { PodcastShowConfig } from '@/components/PodcastRoom';

const SQUADD_PODCAST_CONFIG: PodcastShowConfig = {
  id: 'squadd-podcast',
  title: 'SQUADD Podcast',
  subtitle: 'Sisters Questing Unapologetically After Divine Destiny',
  description: 'The official voice of the SQUADD Coalition — seven women united in the fight for elder justice, civil rights, economic sovereignty, and community healing. Each episode brings real conversations about systemic reform, legacy preservation, and the power of collective action. From the UN CSW70 stage to your living room.',
  host: {
    name: 'Tyanna (Ty) Battle',
    persona: 'valanna',
    role: 'Host & Founder',
    bio: 'Founder of Sweet Miracles & Civil Rights Advocate. Truth Documentation, Tech Accessibility & Legacy Preservation. The driving force behind the SQUADD Coalition and the Canryn Production ecosystem.',
  },
  coHosts: [
    { name: 'Karen Jones', persona: 'seraph', role: 'Civic Engagement & Agricultural Sovereignty' },
    { name: 'Luv Russell', persona: 'candy', role: 'Economic Sovereignty & Land Reconnection' },
    { name: 'Jessica Fortune Barker', persona: 'seraph', role: 'Strategic Development & Business Architecture' },
    { name: 'Jaffe Silcott, Esq.', persona: 'valanna', role: 'Law, Civil Rights & Systemic Reform' },
    { name: 'Furlesia Bell', persona: 'candy', role: 'Community Mediation & Restorative Outreach' },
    { name: 'Rev. Karen R. Shuford', persona: 'seraph', role: 'Faith-Based Advocacy & Prison Reentry' },
  ],
  theme: {
    primary: '#9333ea',
    secondary: '#7c3aed',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #581c87 0%, #9333ea 50%, #c084fc 100%)',
  },
  features: {
    callIn: true,
    gameScreen: false,
    guestAi: true,
    liveParticipants: true,
    healingFrequencies: false,
    solbonesGame: false,
  },
  schedule: {
    day: 'Monday & Thursday',
    time: '7:00 PM',
    timezone: 'CT',
    frequency: 'Twice weekly',
  },
  socialLinks: {
    youtube: 'https://youtube.com/@rockinrockinboogie',
  },
  zoomRoomUrl: import.meta.env.VITE_ZOOM_URL || undefined,
  streamingUrl: 'https://studio.restream.io/enk-osex-pju',
};

export default function SquaddPodcast() {
  return <PodcastRoom config={SQUADD_PODCAST_CONFIG} />;
}
