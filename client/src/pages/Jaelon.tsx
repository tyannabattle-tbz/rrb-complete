import FamilyMemberPage, { 
  type FamilyMemberData, type ActiveBot, type Commercial, type Accomplishment,
  Star, Award, Heart, Users, Megaphone, Earth, Music, BookOpen, Zap, Radio
} from '@/components/FamilyMemberPage';

const BOTS: ActiveBot[] = [
  {
    id: 'enterprise_growth_bot',
    name: 'Enterprise Growth Bot',
    status: 'active',
    platform: ['Twitter/X', 'Instagram'],
    description: 'Drives business development, partnership outreach, and growth strategy execution for Jaelon Enterprises',
    lastAction: 'Identified 3 new community partnership opportunities for Q2 2026',
    autonomyLevel: 0.85,
  },
  {
    id: 'innovation_tracker_bot',
    name: 'Innovation Tracker Bot',
    status: 'active',
    platform: ['Web'],
    description: 'Monitors technology trends, innovation opportunities, and ecosystem integration possibilities',
    lastAction: 'Compiled weekly innovation digest for Canryn Production leadership',
    autonomyLevel: 0.90,
  },
  {
    id: 'community_investment_bot',
    name: 'Community Investment Bot',
    status: 'active',
    platform: ['Facebook', 'Discord'],
    description: 'Manages community investment initiatives, tracks impact metrics, and coordinates outreach programs',
    lastAction: 'Published community investment impact report for Selma region',
    autonomyLevel: 0.80,
  },
  {
    id: 'business_analytics_bot',
    name: 'Business Analytics Bot',
    status: 'active',
    platform: ['Web'],
    description: 'Tracks business performance, generates financial insights, and monitors ecosystem health metrics',
    lastAction: 'Generated monthly ecosystem performance dashboard for all subsidiaries',
    autonomyLevel: 0.92,
  },
  {
    id: 'legacy_continuity_bot',
    name: 'Legacy Continuity Bot',
    status: 'active',
    platform: ['Web'],
    description: 'Ensures business continuity and legacy preservation across all Canryn Production entities',
    lastAction: 'Completed quarterly legacy continuity audit for all subsidiaries',
    autonomyLevel: 0.88,
  },
];

const COMMERCIALS: Commercial[] = [
  {
    id: 'comm_building_tomorrow',
    title: 'Jaelon Enterprises — Building Tomorrow Today',
    type: 'audio',
    duration: '30s',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/jaelon_building_tomorrow_22fd62c7.wav',
    script: `Building tomorrow, today. Jaelon Enterprises is the innovation and business development arm of Canryn Production. Jaelon Hunter drives growth strategies that create generational wealth while serving communities. From business development to technology integration, Jaelon Enterprises builds the future. Visit manuweb.sbs/jaelon. A Canryn Production subsidiary.`,
    tagline: 'Jaelon Enterprises — Building Tomorrow Today',
    category: 'Business',
  },
  {
    id: 'comm_innovation_legacy',
    title: 'Innovation Meets Legacy — Jaelon Hunter',
    type: 'audio',
    duration: '30s',
    script: `Where innovation meets legacy. Jaelon Hunter runs Jaelon Enterprises — the business engine his father Seabrun Candy Hunter founded as part of the Canryn Production ecosystem. Combining cutting-edge technology with time-honored values, Jaelon Enterprises is building generational wealth that serves communities. Innovation meets legacy. A Canryn Production.`,
    tagline: 'Where Innovation Meets Legacy',
    category: 'Legacy',
  },
  {
    id: 'comm_community_invest',
    title: 'Community Investment — Jaelon Enterprises',
    type: 'audio',
    duration: '15s',
    script: `Investing in community. Jaelon Enterprises puts resources where they matter most — in the communities that need them. Jaelon Hunter — building wealth, building community. Visit manuweb.sbs. A Canryn Production.`,
    tagline: 'Investing in Community',
    category: 'Community',
  },
  {
    id: 'comm_next_generation',
    title: 'The Next Generation — A Canryn Production',
    type: 'audio',
    duration: '30s',
    script: `The next generation is here. Jaelon Hunter represents the future of Canryn Production — bringing fresh vision, bold strategy, and unwavering commitment to the ecosystem his father built. From enterprise solutions to community investment, the next generation delivers. Jaelon Enterprises — a Canryn Production subsidiary. Visit manuweb.sbs/jaelon.`,
    tagline: 'The Next Generation Is Here',
    category: 'Innovation',
  },
];

const ACCOMPLISHMENTS: Accomplishment[] = [
  {
    title: 'Jaelon Enterprises Operations Director',
    description: 'Runs Jaelon Enterprises — the business development and innovation subsidiary of Canryn Production, founded by his father Seabrun Candy Hunter. Manages all enterprise operations, partnerships, and growth strategies.',
    year: '2024–Present',
    category: 'Business',
    icon: Star,
  },
  {
    title: 'Innovation & Growth Strategist',
    description: 'Driving innovation strategy across the Canryn Production ecosystem — identifying technology opportunities, building partnerships, and creating scalable solutions for community impact.',
    year: '2025–Present',
    category: 'Technology',
    icon: Zap,
  },
  {
    title: 'Community Investment Champion',
    description: 'Leading community investment initiatives through Jaelon Enterprises — directing resources toward programs that create lasting economic impact in underserved communities.',
    year: '2025–Present',
    category: 'Community',
    icon: Heart,
  },
  {
    title: 'Ecosystem Integration Architect',
    description: 'Architecting the integration of all Canryn Production subsidiaries into a cohesive ecosystem — ensuring seamless communication, shared resources, and unified growth across all entities.',
    year: '2025–Present',
    category: 'Technology',
    icon: Earth,
  },
  {
    title: 'Youth Entrepreneurship Mentor',
    description: 'Mentoring young entrepreneurs in business development, financial literacy, and community-focused enterprise building — passing forward the lessons of generational wealth creation.',
    year: '2025–Present',
    category: 'Leadership',
    icon: Users,
  },
  {
    title: 'Legacy Business Continuity',
    description: "Ensuring the continuity of all business entities within the Canryn Production ecosystem — preserving his father's vision while adapting to modern market demands and community needs.",
    year: '2024–Present',
    category: 'Legacy',
    icon: BookOpen,
  },
];

const MEMBER_DATA: FamilyMemberData = {
  name: 'Jaelon Hunter',
  title: 'Enterprise Builder — Innovation Driver — Future Leader',
  subtitle: 'Runs Jaelon Enterprises | Canryn Production',
  parentOrg: 'Canryn Production — Jaelon Enterprises',
  accentColor: 'amber',
  gradientFrom: 'bg-gradient-to-br',
  gradientVia: 'from-slate-900 via-amber-950 to-slate-900',
  bots: BOTS,
  commercials: COMMERCIALS,
  accomplishments: ACCOMPLISHMENTS,
  platformCount: '5+',
  showHybridCast: true,
};

export default function Jaelon() {
  return <FamilyMemberPage data={MEMBER_DATA} />;
}
