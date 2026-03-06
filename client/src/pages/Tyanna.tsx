import FamilyMemberPage, { 
  type FamilyMemberData, type ActiveBot, type Commercial, type Accomplishment,
  Star, Award, Heart, Users, Megaphone, Globe, Music, BookOpen, Zap, Radio
} from '@/components/FamilyMemberPage';

const BOTS: ActiveBot[] = [
  {
    id: 'annas_promo_bot',
    name: "Anna's Promotions Bot",
    status: 'active',
    platform: ['Twitter/X', 'Instagram', 'Facebook', 'TikTok'],
    description: "Cross-platform social media promotion for Anna's Promotions events and brand campaigns",
    lastAction: 'Launched Selma Jubilee 2026 countdown campaign across all platforms',
    autonomyLevel: 0.88,
  },
  {
    id: 'event_management_bot',
    name: 'Event Management Bot',
    status: 'active',
    platform: ['Web', 'Facebook'],
    description: 'Coordinates event logistics, RSVPs, vendor communications, and attendee management',
    lastAction: 'Finalized vendor lineup for Grits & Greens Selma Jubilee',
    autonomyLevel: 0.82,
  },
  {
    id: 'brand_strategy_bot',
    name: 'Brand Strategy Bot',
    status: 'active',
    platform: ['Web', 'Instagram'],
    description: 'Analyzes brand performance, tracks engagement metrics, and optimizes promotional strategies',
    lastAction: 'Generated weekly brand performance report for Canryn Production subsidiaries',
    autonomyLevel: 0.85,
  },
  {
    id: 'community_outreach_bot',
    name: 'Community Outreach Bot',
    status: 'active',
    platform: ['Discord', 'Facebook'],
    description: 'Manages community relationships, volunteer coordination, and grassroots outreach campaigns',
    lastAction: 'Coordinated SQUADD Coalition volunteer signup for UN NGO CSW70 prep',
    autonomyLevel: 0.80,
  },
  {
    id: 'content_production_bot',
    name: 'Content Production Bot',
    status: 'active',
    platform: ['Web', 'YouTube'],
    description: 'Produces and schedules promotional content, video teasers, and brand storytelling pieces',
    lastAction: 'Published event teaser video for Selma Jubilee 2026',
    autonomyLevel: 0.87,
  },
];

const COMMERCIALS: Commercial[] = [
  {
    id: 'comm_annas_vision',
    title: "Anna's Promotions — Where Vision Meets Action",
    type: 'audio',
    duration: '30s',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/tyanna_annas_vision_4e2070be.wav',
    script: `Where vision meets action. Anna's Promotions turns ideas into impact. Tyanna Battle brings strategic brand thinking and community-first event production to every project. From local gatherings to international stages, Anna's Promotions delivers. Named in honor of family legacy, built for the future. Visit manuweb.sbs/tyanna. A Canryn Production subsidiary.`,
    tagline: "Anna's Promotions — Where Vision Meets Action",
    category: 'Brand',
  },
  {
    id: 'comm_squadd_united',
    title: 'SQUADD Coalition — United We Rise',
    type: 'audio',
    duration: '30s',
    script: `United we rise. The SQUADD Coalition — Sisters Questing Unapologetically After Divine Destiny — brings women together from every walk of life. Co-founded by Tyanna Battle and LaShanna Russell, SQUADD turns collective faith into collective action. From Selma to the United Nations. Join the movement at manuweb.sbs/squadd. A Canryn Production.`,
    tagline: 'United We Rise — SQUADD Coalition',
    category: 'Coalition',
  },
  {
    id: 'comm_grits_tyanna',
    title: 'Grits & Greens — A Tyanna Battle Production',
    type: 'audio',
    duration: '15s',
    script: `Grits and Greens! Selma Jubilee 2026 — produced by Tyanna Battle and Anna's Promotions. March 7th. Wallace Community College. Be there. Details at manuweb.sbs/selma. A Canryn Production.`,
    tagline: 'Produced by Tyanna Battle',
    category: 'Events',
  },
  {
    id: 'comm_brand_building',
    title: "Brand Building — Anna's Promotions",
    type: 'audio',
    duration: '30s',
    script: `Building brands that build communities. Anna's Promotions doesn't just promote — we partner with organizations, businesses, and movements to create lasting impact. Tyanna Battle and the Anna's Promotions team bring decades of community knowledge to every campaign. Brand building with purpose. A Canryn Production subsidiary.`,
    tagline: 'Building Brands That Build Communities',
    category: 'Business',
  },
  {
    id: 'comm_community_first',
    title: 'Community First — Canryn Production',
    type: 'audio',
    duration: '15s',
    script: `Community first. Always. Tyanna Battle and Anna's Promotions put people before profit, impact before impressions. That's the Canryn Production way. Visit manuweb.sbs. A Canryn Production.`,
    tagline: 'Community First, Always',
    category: 'Community',
  },
];

const ACCOMPLISHMENTS: Accomplishment[] = [
  {
    title: "Anna's Promotions Co-Director",
    description: "Co-directs Anna's Promotions alongside LaShanna Russell — the promotional powerhouse of Canryn Production, handling brand development, event production, and community outreach across multiple platforms.",
    year: '2024–Present',
    category: 'Business',
    icon: Star,
  },
  {
    title: 'SQUADD Coalition Co-Founder',
    description: 'Co-founded Sisters Questing Unapologetically After Divine Destiny — a coalition uniting women across communities for advocacy, empowerment, and collective action on local and global stages.',
    year: '2024–Present',
    category: 'Leadership',
    icon: Users,
  },
  {
    title: 'Selma Jubilee 2026 Co-Organizer',
    description: 'Co-organizing the Grits & Greens Selma Jubilee 2026 event — "Turning Individual Grit into Collective Green" — a landmark community gathering for empowerment and cultural celebration.',
    year: '2026',
    category: 'Events',
    icon: Award,
  },
  {
    title: 'Brand Strategy Architect',
    description: "Architecting brand strategies for Canryn Production and its subsidiaries — creating cohesive visual identities, messaging frameworks, and promotional campaigns that resonate with communities.",
    year: '2024–Present',
    category: 'Business',
    icon: Megaphone,
  },
  {
    title: 'Community Event Producer',
    description: 'Producing community events that bring people together — from intimate gatherings to large-scale celebrations, each event designed to strengthen community bonds and create lasting memories.',
    year: '2025–Present',
    category: 'Events',
    icon: Heart,
  },
  {
    title: 'Digital Marketing Pioneer',
    description: 'Pioneering digital marketing strategies for community organizations — leveraging social media, content creation, and data analytics to amplify community voices and drive engagement.',
    year: '2025–Present',
    category: 'Technology',
    icon: Zap,
  },
  {
    title: 'Sweet Miracles Advocate',
    description: 'Active advocate for Sweet Miracles 501(c)(3) & 508 — "A Voice for the Voiceless" — supporting community crisis response and resource distribution through promotional campaigns.',
    year: '2024–Present',
    category: 'Nonprofit',
    icon: Globe,
  },
];

const MEMBER_DATA: FamilyMemberData = {
  name: 'Tyanna Battle',
  title: 'U.S. Navy Veteran — Civil Rights Advocate — App Developer — Founder',
  subtitle: "Co-Director, Anna's Promotions | SQUADD Coalition | Canryn Production",
  parentOrg: "Canryn Production — Anna's Promotions",
  accentColor: 'rose',
  gradientFrom: 'bg-gradient-to-br',
  gradientVia: 'from-slate-900 via-rose-950 to-slate-900',
  bots: BOTS,
  commercials: COMMERCIALS,
  accomplishments: ACCOMPLISHMENTS,
  platformCount: '5+',
  showHybridCast: true,
};

export default function Tyanna() {
  return <FamilyMemberPage data={MEMBER_DATA} />;
}
