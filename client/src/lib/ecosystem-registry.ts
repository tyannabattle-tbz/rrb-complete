/**
 * ECOSYSTEM REGISTRY — Growth Infrastructure for Canryn Production
 * 
 * This registry enables continual growth by providing a centralized
 * configuration for all family members, subsidiaries, bots, and
 * commercial content. To add a new family member or subsidiary:
 * 
 * 1. Create a new page file in client/src/pages/{Name}.tsx
 * 2. Register the route in this file
 * 3. Add the route to App.tsx
 * 
 * The FamilyMemberPage component handles all rendering automatically.
 * 
 * © Canryn Production and its subsidiaries. All rights reserved.
 */

// ============================================================================
// FAMILY MEMBER REGISTRY — Birth Order: Carlos, Sean, Tyanna, LaShanna, Jaelon
// ============================================================================

export interface FamilyMemberEntry {
  id: string;
  name: string;
  route: string;
  subsidiary: string;
  role: string;
  accentColor: string;
  botCount: number;
  commercialCount: number;
  accomplishmentCount: number;
  status: 'active' | 'coming_soon';
}

export const FAMILY_MEMBERS: FamilyMemberEntry[] = [
  {
    id: 'carlos',
    name: 'Carlos Kembrel',
    route: '/carlos',
    subsidiary: 'Little C',
    role: 'Creative Visionary',
    accentColor: 'blue',
    botCount: 5,
    commercialCount: 4,
    accomplishmentCount: 6,
    status: 'active',
  },
  {
    id: 'sean',
    name: 'Sean Hunter',
    route: '/sean',
    subsidiary: "Sean's Music",
    role: 'Musical Heir',
    accentColor: 'emerald',
    botCount: 5,
    commercialCount: 4,
    accomplishmentCount: 6,
    status: 'active',
  },
  {
    id: 'tyanna',
    name: 'Tyanna Battle',
    route: '/tyanna',
    subsidiary: "Anna's Promotions",
    role: 'Brand Strategist',
    accentColor: 'rose',
    botCount: 5,
    commercialCount: 5,
    accomplishmentCount: 7,
    status: 'active',
  },
  {
    id: 'lashanna',
    name: 'LaShanna Russell',
    route: '/lashanna',
    subsidiary: "Anna's Promotions",
    role: 'Community Advocate',
    accentColor: 'purple',
    botCount: 5,
    commercialCount: 5,
    accomplishmentCount: 8,
    status: 'active',
  },
  {
    id: 'jaelon',
    name: 'Jaelon Hunter',
    route: '/jaelon',
    subsidiary: 'Jaelon Enterprises',
    role: 'Enterprise Builder',
    accentColor: 'amber',
    botCount: 5,
    commercialCount: 4,
    accomplishmentCount: 6,
    status: 'active',
  },
];

// ============================================================================
// SUBSIDIARY REGISTRY
// ============================================================================

export interface SubsidiaryEntry {
  id: string;
  name: string;
  description: string;
  directors: string[];
  route: string;
  status: 'active' | 'coming_soon';
  botCount: number;
}

export const SUBSIDIARIES: SubsidiaryEntry[] = [
  {
    id: 'little_c',
    name: 'Little C',
    description: 'Creative content arm of Canryn Production',
    directors: ['Carlos Kembrel'],
    route: '/carlos',
    status: 'active',
    botCount: 5,
  },
  {
    id: 'seans_music',
    name: "Sean's Music",
    description: 'Music production and legacy preservation',
    directors: ['Sean Hunter'],
    route: '/sean',
    status: 'active',
    botCount: 5,
  },
  {
    id: 'annas_promotions',
    name: "Anna's Promotions",
    description: 'Promotional duties and brand development',
    directors: ['Tyanna Battle', 'LaShanna Russell'],
    route: '/tyanna',
    status: 'active',
    botCount: 10,
  },
  {
    id: 'jaelon_enterprises',
    name: 'Jaelon Enterprises',
    description: 'Business development and innovation',
    directors: ['Jaelon Hunter'],
    route: '/jaelon',
    status: 'active',
    botCount: 5,
  },
  {
    id: 'sweet_miracles',
    name: 'Sweet Miracles',
    description: '501(c)(3) & 508 — A Voice for the Voiceless',
    directors: ['LaShanna Russell'],
    route: '/sweet-miracles',
    status: 'active',
    botCount: 3,
  },
  {
    id: 'squadd_coalition',
    name: 'SQUADD Coalition',
    description: 'Sisters Questing Unapologetically After Divine Destiny',
    directors: ['Tyanna Battle', 'LaShanna Russell'],
    route: '/squadd',
    status: 'active',
    botCount: 3,
  },
];

// ============================================================================
// PLATFORM PARTNER REGISTRY
// ============================================================================

export interface PlatformPartner {
  id: string;
  name: string;
  version: string;
  url: string;
  description: string;
  features: string[];
  status: 'active' | 'integration' | 'planned';
}

export const PLATFORM_PARTNERS: PlatformPartner[] = [
  {
    id: 'hybridcast',
    name: 'HybridCast Emergency Broadcast PWA',
    version: 'v2.47.24',
    url: 'https://hybridcast.manus.space/',
    description: 'Emergency broadcast command center with mesh networking, satellite tracking, AI monitoring, and QUMUS integration',
    features: ['Emergency Alerts', 'Mesh Networking', 'Offline-First', 'GPS Tracking', 'AI Monitoring', 'QUMUS Integration'],
    status: 'active',
  },
];

// ============================================================================
// ECOSYSTEM STATS — Computed from registries
// ============================================================================

export function getEcosystemStats() {
  const totalBots = FAMILY_MEMBERS.reduce((sum, m) => sum + m.botCount, 0);
  const totalCommercials = FAMILY_MEMBERS.reduce((sum, m) => sum + m.commercialCount, 0);
  const totalAccomplishments = FAMILY_MEMBERS.reduce((sum, m) => sum + m.accomplishmentCount, 0);
  const activeMembers = FAMILY_MEMBERS.filter(m => m.status === 'active').length;
  const activeSubsidiaries = SUBSIDIARIES.filter(s => s.status === 'active').length;
  const activePartners = PLATFORM_PARTNERS.filter(p => p.status === 'active').length;

  return {
    totalBots,
    totalCommercials,
    totalAccomplishments,
    activeMembers,
    activeSubsidiaries,
    activePartners,
    totalEntities: activeMembers + activeSubsidiaries + activePartners,
  };
}

// ============================================================================
// GROWTH HELPERS — For adding new members/subsidiaries
// ============================================================================

/**
 * Template for creating a new family member page.
 * Copy this pattern and customize the data arrays.
 * 
 * File: client/src/pages/{Name}.tsx
 * 
 * ```tsx
 * import FamilyMemberPage, { 
 *   type FamilyMemberData, type ActiveBot, type Commercial, type Accomplishment,
 *   Star, Award, Heart, Users, Megaphone, Globe, Music, BookOpen, Zap, Radio
 * } from '@/components/FamilyMemberPage';
 * 
 * const BOTS: ActiveBot[] = [ ... ];
 * const COMMERCIALS: Commercial[] = [ ... ];
 * const ACCOMPLISHMENTS: Accomplishment[] = [ ... ];
 * 
 * const MEMBER_DATA: FamilyMemberData = {
 *   name: 'New Member Name',
 *   title: 'Title — Role — Description',
 *   subtitle: 'Subsidiary | Canryn Production',
 *   parentOrg: 'Canryn Production — Subsidiary Name',
 *   accentColor: 'purple', // purple | blue | emerald | rose | amber | cyan
 *   gradientFrom: 'bg-gradient-to-br',
 *   gradientVia: 'from-slate-900 via-{color}-950 to-slate-900',
 *   bots: BOTS,
 *   commercials: COMMERCIALS,
 *   accomplishments: ACCOMPLISHMENTS,
 *   platformCount: '5+',
 *   showHybridCast: true,
 * };
 * 
 * export default function NewMember() {
 *   return <FamilyMemberPage data={MEMBER_DATA} />;
 * }
 * ```
 * 
 * Then add to App.tsx:
 * ```tsx
 * import NewMember from './pages/NewMember';
 * // In Router:
 * <Route path="/newmember" component={NewMember} />
 * ```
 * 
 * And register in ecosystem-registry.ts FAMILY_MEMBERS array.
 */
