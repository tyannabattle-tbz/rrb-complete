import FamilyMemberPage, { 
  type FamilyMemberData, type ActiveBot, type Commercial, type Accomplishment,
  Star, Award, Heart, Users, Megaphone, Globe, Music, BookOpen, Zap, Radio
} from '@/components/FamilyMemberPage';

const BOTS: ActiveBot[] = [
  {
    id: 'music_distribution_bot',
    name: 'Music Distribution Bot',
    status: 'active',
    platform: ['Web', 'YouTube'],
    description: 'Manages music distribution across streaming platforms and maintains catalog availability',
    lastAction: 'Updated Rockin Rockin Boogie catalog metadata across platforms',
    autonomyLevel: 0.90,
  },
  {
    id: 'social_music_bot',
    name: 'Social Media Music Bot',
    status: 'active',
    platform: ['Twitter/X', 'Instagram', 'TikTok'],
    description: 'Promotes Sean\'s Music releases, legacy tracks, and community music events',
    lastAction: 'Shared throwback feature of Seabrun Candy Hunter\'s original recordings',
    autonomyLevel: 0.85,
  },
  {
    id: 'community_music_bot',
    name: 'Community Music Bot',
    status: 'active',
    platform: ['Facebook', 'Discord'],
    description: 'Engages music community, coordinates jam sessions, and manages fan interactions',
    lastAction: 'Organized community music appreciation thread for Selma Jubilee',
    autonomyLevel: 0.80,
  },
  {
    id: 'legacy_catalog_bot',
    name: 'Legacy Catalog Bot',
    status: 'active',
    platform: ['Web'],
    description: 'Maintains and verifies the complete Rockin Rockin Boogie music catalog and rights documentation',
    lastAction: 'Verified BMI registration status for 12 legacy tracks',
    autonomyLevel: 0.92,
  },
  {
    id: 'radio_programming_bot',
    name: 'Radio Programming Bot',
    status: 'active',
    platform: ['Web'],
    description: 'Schedules and manages music programming for RRB Radio channels',
    lastAction: 'Programmed weekend legacy music marathon on RRB Radio',
    autonomyLevel: 0.88,
  },
];

const COMMERCIALS: Commercial[] = [
  {
    id: 'comm_seans_legacy',
    title: "Sean's Music — The Legacy Continues",
    type: 'audio',
    duration: '30s',
    script: `The music never stops. Sean Hunter carries forward the sound that Seabrun Candy Hunter created — the Rockin Rockin Boogie legacy lives on through Sean's Music. From the studios of Canryn Production, the rhythm continues. Sean's Music — where legacy meets the future. Listen now at manuweb.sbs/sean. A Canryn Production subsidiary.`,
    tagline: "Sean's Music — The Legacy Continues",
    category: 'Music',
  },
  {
    id: 'comm_rrb_gift',
    title: "Rockin Rockin Boogie — A Father's Gift",
    type: 'audio',
    duration: '30s',
    script: `A father's gift to the world. Seabrun Candy Hunter created the Rockin Rockin Boogie — a sound that moved communities and touched souls. Now his son Sean Hunter preserves that gift, ensuring every note, every beat, every memory lives on. Rockin Rockin Boogie — a father's gift, a son's mission. BMI registered. A Canryn Production.`,
    tagline: "A Father's Gift, A Son's Mission",
    category: 'Legacy',
  },
  {
    id: 'comm_sound_selma',
    title: 'Sound of Selma — Sean Hunter',
    type: 'audio',
    duration: '15s',
    script: `The sound of Selma. Sean Hunter and Sean's Music bring the heartbeat of Alabama to the world. From community stages to digital platforms — the music plays on. Visit manuweb.sbs. A Canryn Production.`,
    tagline: 'The Sound of Selma',
    category: 'Community',
  },
  {
    id: 'comm_bmi_registered',
    title: "BMI Registered — Sean's Music",
    type: 'audio',
    duration: '30s',
    script: `Professionally registered. Legally protected. Creatively unstoppable. Sean's Music is BMI registered, ensuring that every composition from the Rockin Rockin Boogie catalog and new productions receives proper rights management and royalty tracking. Sean Hunter — protecting the music, honoring the legacy. A Canryn Production subsidiary.`,
    tagline: 'Professionally Registered, Legally Protected',
    category: 'Business',
  },
];

const ACCOMPLISHMENTS: Accomplishment[] = [
  {
    title: "Sean's Music Operations Director",
    description: "Runs Sean's Music — the music subsidiary of Canryn Production, founded by his father Seabrun Candy Hunter. Manages all music operations, distribution, and rights management.",
    year: '2024–Present',
    category: 'Business',
    icon: Star,
  },
  {
    title: 'BMI Music Registration',
    description: 'Secured BMI (Broadcast Music, Inc.) registration for the Rockin Rockin Boogie catalog and new compositions — ensuring proper royalty tracking and rights protection for all musical works.',
    year: '2024–Present',
    category: 'Music',
    icon: Music,
  },
  {
    title: 'Rockin Rockin Boogie Legacy Keeper',
    description: "Primary guardian of Seabrun Candy Hunter's musical legacy — preserving, digitizing, and maintaining the complete Rockin Rockin Boogie catalog for current and future generations.",
    year: '2024–Present',
    category: 'Legacy',
    icon: BookOpen,
  },
  {
    title: 'Sound Engineering Pioneer',
    description: 'Advancing sound engineering capabilities within Canryn Production — modernizing recording techniques while preserving the authentic sound that defined the Rockin Rockin Boogie era.',
    year: '2025–Present',
    category: 'Technology',
    icon: Zap,
  },
  {
    title: 'Community Music Programs',
    description: 'Establishing community music programs that give aspiring musicians access to professional tools, mentorship, and performance opportunities through Canryn Production resources.',
    year: '2025–Present',
    category: 'Community',
    icon: Heart,
  },
  {
    title: 'RRB Radio Music Director',
    description: 'Directing music programming across all 42 RRB Radio channels — curating playlists, scheduling legacy tracks, and ensuring the Rockin Rockin Boogie sound reaches every listener.',
    year: '2025–Present',
    category: 'Broadcasting',
    icon: Radio,
  },
];

const MEMBER_DATA: FamilyMemberData = {
  name: 'Sean Hunter',
  title: 'Musical Heir — Sound Engineer — Legacy Keeper',
  subtitle: "Runs Sean's Music | Canryn Production | BMI Registered",
  parentOrg: "Canryn Production — Sean's Music",
  accentColor: 'emerald',
  gradientFrom: 'bg-gradient-to-br',
  gradientVia: 'from-slate-900 via-emerald-950 to-slate-900',
  bots: BOTS,
  commercials: COMMERCIALS,
  accomplishments: ACCOMPLISHMENTS,
  platformCount: '5+',
  showHybridCast: true,
};

export default function Sean() {
  return <FamilyMemberPage data={MEMBER_DATA} />;
}
