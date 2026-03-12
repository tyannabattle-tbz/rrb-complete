import FamilyMemberPage, { 
  type FamilyMemberData, type ActiveBot, type Commercial, type Accomplishment,
  Star, Award, Heart, Users, Megaphone, Earth, Music, BookOpen, Zap, Radio, MessageCircle
} from '@/components/FamilyMemberPage';

const BOTS: ActiveBot[] = [
  {
    id: 'littlec_content_bot',
    name: 'Little C Content Bot',
    status: 'active',
    platform: ['Twitter/X', 'Instagram', 'TikTok'],
    description: 'Automated content scheduling and cross-platform posting for Little C creative productions',
    lastAction: 'Scheduled creative showcase reel for community engagement',
    autonomyLevel: 0.88,
  },
  {
    id: 'creative_director_bot',
    name: 'Creative Director Bot',
    status: 'active',
    platform: ['Web', 'YouTube'],
    description: 'Curates and manages video content, creative assets, and production timelines',
    lastAction: 'Published community spotlight video to YouTube channel',
    autonomyLevel: 0.85,
  },
  {
    id: 'community_media_bot',
    name: 'Community Media Bot',
    status: 'active',
    platform: ['Facebook', 'Discord'],
    description: 'Manages community interactions, media requests, and collaborative projects',
    lastAction: 'Coordinated community media workshop registration',
    autonomyLevel: 0.80,
  },
  {
    id: 'digital_archive_bot',
    name: 'Digital Archive Bot',
    status: 'active',
    platform: ['Web'],
    description: 'Preserves and catalogs all digital creative works and legacy content',
    lastAction: 'Archived Little C production catalog with metadata tagging',
    autonomyLevel: 0.92,
  },
  {
    id: 'brand_ambassador_bot',
    name: 'Brand Ambassador Bot',
    status: 'active',
    platform: ['Twitter/X', 'Instagram'],
    description: 'Promotes Little C brand identity and creative partnerships across social platforms',
    lastAction: 'Launched brand awareness campaign for Selma Jubilee 2026',
    autonomyLevel: 0.85,
  },
];

const COMMERCIALS: Commercial[] = [
  {
    id: 'comm_littlec_brand',
    title: 'Little C — Where Creativity Meets Community',
    type: 'audio',
    duration: '30s',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/carlos_littlec_brand_9846a1f3.wav',
    script: `Little C — where creativity meets community. Carlos Kembrel brings vision to life through digital content that speaks to the heart of every community. From storytelling to production, Little C is the creative engine of Canryn Production. See the vision at manuweb.sbs/carlos. A Canryn Production subsidiary.`,
    tagline: 'Little C — Where Creativity Meets Community',
    category: 'Brand',
  },
  {
    id: 'comm_digital_dreams',
    title: 'Digital Dreams — Carlos Kembrel',
    type: 'audio',
    duration: '15s',
    script: `Digital dreams, real impact. Carlos Kembrel and Little C are creating content that changes communities. Watch, listen, and be inspired at manuweb.sbs. A Canryn Production.`,
    tagline: 'Digital Dreams, Real Impact',
    category: 'Creative',
  },
  {
    id: 'comm_community_content',
    title: 'Community Content — By the People, For the People',
    type: 'audio',
    duration: '30s',
    script: `By the people, for the people. Little C believes every community has a story worth telling. Carlos Kembrel is putting the tools of media production into the hands of those who need them most. Community content that matters. Little C — a Canryn Production subsidiary. Visit manuweb.sbs to join the movement.`,
    tagline: 'By the People, For the People',
    category: 'Community',
  },
  {
    id: 'comm_legacy_lenses',
    title: 'Legacy Through Lenses — Little C Productions',
    type: 'audio',
    duration: '30s',
    script: `Every frame tells a story. Every story preserves a legacy. Little C Productions captures the moments that matter — from family history to community milestones. Carlos Kembrel continues the vision his father Seabrun Candy Hunter started. Legacy through lenses. A Canryn Production.`,
    tagline: 'Every Frame Tells a Story',
    category: 'Legacy',
  },
];

const ACCOMPLISHMENTS: Accomplishment[] = [
  {
    title: 'Digital Content Pioneer',
    description: 'Leading the charge in community-focused digital content creation through Little C, producing media that amplifies underserved voices and preserves cultural narratives.',
    year: '2024–Present',
    category: 'Technology',
    icon: Zap,
  },
  {
    title: 'Little C Brand Architect',
    description: 'Built Little C from the ground up as the creative content arm of Canryn Production — establishing brand identity, production workflows, and community partnerships.',
    year: '2024–Present',
    category: 'Business',
    icon: Star,
  },
  {
    title: 'Community Media Producer',
    description: 'Producing media content that gives communities their own voice — training, equipping, and empowering local storytellers through Little C production resources.',
    year: '2025–Present',
    category: 'Broadcasting',
    icon: Radio,
  },
  {
    title: 'Legacy Digital Archivist',
    description: 'Digitizing and preserving the Seabrun Candy Hunter legacy through modern media — ensuring family history and cultural contributions are accessible for future generations.',
    year: '2024–Present',
    category: 'Legacy',
    icon: BookOpen,
  },
  {
    title: 'Youth Empowerment Advocate',
    description: 'Mentoring young creators in digital media production, teaching them to use technology as a tool for community building and self-expression.',
    year: '2025–Present',
    category: 'Community',
    icon: Heart,
  },
  {
    title: 'Creative Arts Director',
    description: 'Directing creative arts initiatives across the Canryn Production ecosystem — from visual design to multimedia storytelling that connects communities.',
    year: '2025–Present',
    category: 'Arts',
    icon: Megaphone,
  },
];

const MEMBER_DATA: FamilyMemberData = {
  name: 'Carlos Kembrel',
  title: 'Creative Visionary — Content Creator — Digital Pioneer',
  subtitle: "Founder's First, Little C | Canryn Production",
  parentOrg: 'Canryn Production — Little C',
  accentColor: 'blue',
  gradientFrom: 'bg-gradient-to-br',
  gradientVia: 'from-slate-900 via-blue-950 to-slate-900',
  bots: BOTS,
  commercials: COMMERCIALS,
  accomplishments: ACCOMPLISHMENTS,
  platformCount: '5+',
  showHybridCast: true,
};

export default function Carlos() {
  return <FamilyMemberPage data={MEMBER_DATA} />;
}
