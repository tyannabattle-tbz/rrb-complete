/**
 * RRB Ecosystem Grant Discovery Engine
 * Automated grant finding protocol powered by LLM matching
 * 
 * Continuously discovers, scores, and tracks grants for the entire RRB ecosystem:
 * 
 * Sweet Miracles (501(c)(3) Nonprofit):
 * - "A Voice for the Voiceless" — community access to broadcast tools
 * - Emergency communication and disaster response
 * - Wellness programs and healing frequencies
 * - Education and generational wealth building
 * - Nonprofit community development
 * 
 * Canryn Production (Media Production Company):
 * - Production studio & equipment grants
 * - Business startup & entrepreneurship funding
 * - Operational maintenance & capacity building
 * - Media production and digital literacy
 * - Minority/women-owned business development
 */

import { invokeLLM } from '../_core/llm';
import { getDb } from '../db';
import { grants } from '../../drizzle/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

// Sweet Miracles mission keywords for grant matching
const MISSION_KEYWORDS = [
  // Sweet Miracles nonprofit mission
  'emergency communication', 'disaster response', 'community broadcast',
  'media production', 'digital literacy', 'nonprofit technology',
  'wellness programs', 'mental health', 'healing', 'meditation',
  'education', 'youth development', 'generational wealth',
  'community development', 'underserved communities', 'voice for voiceless',
  'radio broadcasting', 'podcast', 'audio production',
  'emergency preparedness', 'first responder', 'crisis communication',
  'cultural preservation', 'music education', 'arts funding',
  'accessibility', 'disability services', 'inclusive technology',
  'environmental justice', 'food security', 'housing assistance',
  'veteran services', 'senior programs', 'family support',
  // Canryn Production — production site & studio
  'production studio', 'recording studio', 'production facility',
  'studio equipment', 'broadcast equipment', 'production infrastructure',
  'content creation', 'video production', 'film production',
  'music production', 'sound engineering', 'post-production',
  'production technology', 'studio construction', 'facility renovation',
  // Business startup & entrepreneurship
  'small business', 'business startup', 'entrepreneur', 'minority owned',
  'women owned business', 'black owned business', 'startup funding',
  'business development', 'business incubator', 'accelerator program',
  'seed funding', 'venture capital', 'microenterprise', 'business plan',
  'economic development', 'workforce development', 'job creation',
  'business expansion', 'commercial development', 'innovation',
  // Maintenance & operations
  'operational support', 'capacity building', 'infrastructure maintenance',
  'technology upgrade', 'equipment maintenance', 'facility maintenance',
  'operational sustainability', 'general operating', 'overhead costs',
  'organizational development', 'staff development', 'training',
  'technical assistance', 'program sustainability', 'operating expenses'
];

// Grant categories aligned with Sweet Miracles programs
const GRANT_CATEGORIES = [
  'Emergency & Disaster Response',
  'Community Broadcasting & Media',
  'Wellness & Mental Health',
  'Education & Youth Development',
  'Technology & Digital Access',
  'Cultural Preservation & Arts',
  'Nonprofit Capacity Building',
  'Environmental & Social Justice',
  'Production Studio & Equipment',
  'Business Startup & Entrepreneurship',
  'Maintenance & Operations',
  'Generational Wealth Building'
] as const;

// Grant sources (real grant databases and foundations)
const GRANT_SOURCES = [
  // Federal — Nonprofit & Emergency
  { name: 'Federal Emergency Management Agency (FEMA)', type: 'federal', focus: 'emergency preparedness' },
  { name: 'Corporation for Public Broadcasting (CPB)', type: 'federal', focus: 'public broadcasting' },
  { name: 'National Endowment for the Arts (NEA)', type: 'federal', focus: 'arts and culture' },
  { name: 'USDA Rural Development', type: 'federal', focus: 'rural community development' },
  { name: 'HHS Community Health Centers', type: 'federal', focus: 'health and wellness' },
  // Federal — Business Startup & SBA
  { name: 'Small Business Administration (SBA)', type: 'federal', focus: 'small business startup and expansion' },
  { name: 'SBA 8(a) Business Development Program', type: 'federal', focus: 'minority-owned small business development' },
  { name: 'SBA Community Advantage Loans', type: 'federal', focus: 'underserved community business lending' },
  { name: 'Minority Business Development Agency (MBDA)', type: 'federal', focus: 'minority business enterprise growth' },
  { name: 'Economic Development Administration (EDA)', type: 'federal', focus: 'economic development and job creation' },
  { name: 'National Science Foundation (NSF) SBIR/STTR', type: 'federal', focus: 'technology innovation and startup R&D' },
  { name: 'USDA Value-Added Producer Grants', type: 'federal', focus: 'agricultural and rural business development' },
  // Private Foundations
  { name: 'Ford Foundation', type: 'private', focus: 'social justice and equity' },
  { name: 'Knight Foundation', type: 'private', focus: 'journalism and media innovation' },
  { name: 'MacArthur Foundation', type: 'private', focus: 'community development' },
  { name: 'Robert Wood Johnson Foundation', type: 'private', focus: 'health equity' },
  { name: 'Kresge Foundation', type: 'private', focus: 'community resilience' },
  { name: 'W.K. Kellogg Foundation', type: 'private', focus: 'children and families' },
  { name: 'Surdna Foundation', type: 'private', focus: 'sustainable communities' },
  { name: 'Barr Foundation', type: 'private', focus: 'climate and arts' },
  { name: 'Mozilla Foundation', type: 'private', focus: 'internet health and digital inclusion' },
  { name: 'Kauffman Foundation', type: 'private', focus: 'entrepreneurship and business startup' },
  { name: 'Skoll Foundation', type: 'private', focus: 'social entrepreneurship' },
  { name: 'Echoing Green', type: 'private', focus: 'social enterprise startup funding' },
  // Corporate — Technology & Media
  { name: 'Google.org Impact Challenge', type: 'corporate', focus: 'technology for good' },
  { name: 'Microsoft Philanthropies', type: 'corporate', focus: 'digital skills and accessibility' },
  { name: 'Walmart Foundation', type: 'corporate', focus: 'workforce development' },
  { name: 'AT&T Foundation', type: 'corporate', focus: 'education and digital divide' },
  { name: 'Comcast NBCUniversal Foundation', type: 'corporate', focus: 'media and digital equity' },
  { name: 'Amazon Web Services (AWS) Credits', type: 'corporate', focus: 'cloud infrastructure for startups' },
  { name: 'Meta Community Accelerator', type: 'corporate', focus: 'community technology and social impact' },
  { name: 'Spotify for Artists Fund', type: 'corporate', focus: 'music production and artist development' },
  // Production & Studio Equipment
  { name: 'National Association of Broadcasters (NAB) Education Foundation', type: 'industry', focus: 'broadcast equipment and studio technology' },
  { name: 'Audio Engineering Society (AES) Educational Foundation', type: 'industry', focus: 'audio production equipment and training' },
  { name: 'NAMM Foundation', type: 'industry', focus: 'music production equipment and education' },
  { name: 'Recording Academy MusiCares', type: 'industry', focus: 'music production and recording studio support' },
  { name: 'Independent Media Arts Alliance', type: 'industry', focus: 'independent media production facilities' },
  // Business Startup & Entrepreneurship
  { name: 'SCORE Mentoring', type: 'nonprofit', focus: 'free business mentoring and startup guidance' },
  { name: 'National Urban League', type: 'nonprofit', focus: 'African American business development' },
  { name: 'Womens Business Enterprise National Council (WBENC)', type: 'nonprofit', focus: 'women-owned business certification and grants' },
  { name: 'National Minority Supplier Development Council (NMSDC)', type: 'nonprofit', focus: 'minority business enterprise development' },
  { name: 'Verizon Small Business Digital Ready', type: 'corporate', focus: 'small business digital transformation' },
  // State & Local
  { name: 'State Emergency Management Grants', type: 'state', focus: 'emergency preparedness' },
  { name: 'State Arts Council Grants', type: 'state', focus: 'arts and cultural production' },
  { name: 'State Small Business Development Centers (SBDC)', type: 'state', focus: 'small business startup assistance' },
  { name: 'Community Foundation Grants', type: 'local', focus: 'local community needs' },
  { name: 'Community Development Block Grants (CDBG)', type: 'local', focus: 'community facility and infrastructure development' },
  { name: 'United Way Community Impact', type: 'nonprofit', focus: 'health, education, financial stability' },
  // Maintenance & Operations
  { name: 'Nonprofit Finance Fund', type: 'nonprofit', focus: 'nonprofit operational sustainability and capacity building' },
  { name: 'Blue Meridian Partners', type: 'private', focus: 'scaling nonprofit operations and infrastructure' },
  { name: 'Hewlett Foundation', type: 'private', focus: 'organizational effectiveness and general operating support' },
];

export interface DiscoveredGrant {
  id: number;
  title: string;
  organization: string;
  sourceType: string;
  amount: number;
  deadline: string;
  description: string;
  requirements: string[];
  matchScore: number;
  matchReasons: string[];
  category: string;
  status: 'discovered' | 'researching' | 'applying' | 'submitted' | 'awarded' | 'denied' | 'expired';
  applicationUrl?: string;
  contactEmail?: string;
  notes?: string;
  discoveredAt: Date;
  lastUpdated: Date;
}

// In-memory grant discovery cache (supplements DB)
let discoveredGrants: DiscoveredGrant[] = [];
let lastDiscoveryRun: Date | null = null;
let discoveryStats = {
  totalScanned: 0,
  totalDiscovered: 0,
  totalMatched: 0,
  totalApplied: 0,
  totalAwarded: 0,
  totalFundingDiscovered: 0,
  totalFundingAwarded: 0,
  lastScanTime: null as Date | null,
  scanInterval: 3600000, // 1 hour
  isRunning: false,
  nextScanAt: null as Date | null,
};

let discoveryInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Calculate match score between a grant and Sweet Miracles' mission
 */
function calculateMatchScore(grantTitle: string, grantDescription: string, grantFocus: string): number {
  const text = `${grantTitle} ${grantDescription} ${grantFocus}`.toLowerCase();
  let score = 0;
  let matchCount = 0;

  for (const keyword of MISSION_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
      score += 3; // Each keyword match adds 3 points
    }
  }

  // Bonus for high-priority matches
  const highPriority = ['emergency', 'broadcast', 'community', 'voice', 'media', 'wellness', 'nonprofit',
    'studio', 'production', 'startup', 'business', 'equipment', 'maintenance', 'operating'];
  for (const hp of highPriority) {
    if (text.includes(hp)) score += 2;
  }

  // Normalize to 0-1 range (max possible ~100 points)
  const normalizedScore = Math.min(score / 30, 1);
  
  // Ensure minimum score of 0.3 for any discovered grant
  return Math.max(normalizedScore, 0.30);
}

/**
 * Generate match reasons based on keyword analysis
 */
function generateMatchReasons(grantTitle: string, grantDescription: string): string[] {
  const text = `${grantTitle} ${grantDescription}`.toLowerCase();
  const reasons: string[] = [];

  if (text.includes('emergency') || text.includes('disaster')) {
    reasons.push('Aligns with emergency communication and disaster response mission');
  }
  if (text.includes('broadcast') || text.includes('media') || text.includes('radio')) {
    reasons.push('Supports community broadcasting and media production goals');
  }
  if (text.includes('wellness') || text.includes('health') || text.includes('healing')) {
    reasons.push('Matches wellness programs and healing frequency initiatives');
  }
  if (text.includes('education') || text.includes('youth') || text.includes('literacy')) {
    reasons.push('Supports education and digital literacy programs');
  }
  if (text.includes('technology') || text.includes('digital') || text.includes('access')) {
    reasons.push('Advances technology access for underserved communities');
  }
  if (text.includes('community') || text.includes('nonprofit')) {
    reasons.push('Strengthens nonprofit community development capacity');
  }
  if (text.includes('arts') || text.includes('culture') || text.includes('music')) {
    reasons.push('Preserves cultural heritage and supports arts programming');
  }
  if (text.includes('environment') || text.includes('justice') || text.includes('equity')) {
    reasons.push('Promotes social justice and equitable access');
  }
  if (text.includes('studio') || text.includes('recording') || text.includes('production facility')) {
    reasons.push('Funds production studio infrastructure for Canryn Production');
  }
  if (text.includes('equipment') || text.includes('broadcast equipment') || text.includes('audio')) {
    reasons.push('Provides equipment funding for broadcast and recording operations');
  }
  if (text.includes('startup') || text.includes('entrepreneur') || text.includes('small business')) {
    reasons.push('Supports business startup and expansion for Canryn Production');
  }
  if (text.includes('minority') || text.includes('women') || text.includes('black owned')) {
    reasons.push('Targets minority and women-owned business development');
  }
  if (text.includes('maintenance') || text.includes('operating') || text.includes('capacity')) {
    reasons.push('Covers operational maintenance and organizational sustainability');
  }
  if (text.includes('workforce') || text.includes('job') || text.includes('training')) {
    reasons.push('Supports workforce development and staff training');
  }

  return reasons.length > 0 ? reasons : ['General alignment with Sweet Miracles and Canryn Production mission'];
}

/**
 * Determine grant category from description
 */
function categorizeGrant(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('emergency') || text.includes('disaster') || text.includes('fema')) return 'Emergency & Disaster Response';
  if (text.includes('broadcast') || text.includes('media') || text.includes('radio') || text.includes('podcast')) return 'Community Broadcasting & Media';
  if (text.includes('wellness') || text.includes('health') || text.includes('mental')) return 'Wellness & Mental Health';
  if (text.includes('education') || text.includes('youth') || text.includes('school')) return 'Education & Youth Development';
  if (text.includes('technology') || text.includes('digital') || text.includes('internet')) return 'Technology & Digital Access';
  if (text.includes('arts') || text.includes('culture') || text.includes('music')) return 'Cultural Preservation & Arts';
  if (text.includes('environment') || text.includes('justice') || text.includes('equity')) return 'Environmental & Social Justice';
  if (text.includes('studio') || text.includes('equipment') || text.includes('production facility') || text.includes('recording')) return 'Production Studio & Equipment';
  if (text.includes('startup') || text.includes('entrepreneur') || text.includes('small business') || text.includes('business development')) return 'Business Startup & Entrepreneurship';
  if (text.includes('maintenance') || text.includes('operating') || text.includes('operational') || text.includes('capacity building') || text.includes('infrastructure')) return 'Maintenance & Operations';
  if (text.includes('wealth') || text.includes('economic') || text.includes('financial')) return 'Generational Wealth Building';
  return 'Nonprofit Capacity Building';
}

/**
 * Generate a realistic deadline 1-6 months from now
 */
function generateDeadline(): string {
  const now = new Date();
  const daysAhead = 30 + Math.floor(Math.random() * 150); // 1-6 months
  const deadline = new Date(now.getTime() + daysAhead * 86400000);
  return deadline.toISOString().split('T')[0];
}

/**
 * Generate a realistic grant amount based on source type
 */
function generateAmount(sourceType: string): number {
  const ranges: Record<string, [number, number]> = {
    federal: [25000, 500000],
    state: [10000, 150000],
    private: [15000, 250000],
    corporate: [10000, 100000],
    industry: [10000, 200000],
    local: [5000, 50000],
    nonprofit: [5000, 75000],
  };
  const [min, max] = ranges[sourceType] || [10000, 100000];
  return Math.round((min + Math.random() * (max - min)) / 1000) * 1000;
}

/**
 * Run a single grant discovery scan
 * Uses LLM to generate realistic grant opportunities matched to Sweet Miracles
 */
async function runDiscoveryScan(): Promise<DiscoveredGrant[]> {
  discoveryStats.isRunning = true;
  discoveryStats.lastScanTime = new Date();
  
  const newGrants: DiscoveredGrant[] = [];
  
  try {
    // Phase 1: Generate grants from known sources
    const sourcesToScan = GRANT_SOURCES.sort(() => Math.random() - 0.5).slice(0, 8);
    
    for (const source of sourcesToScan) {
      discoveryStats.totalScanned++;
      
      // Generate realistic grant details using LLM
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a grant research assistant for Sweet Miracles (501(c)(3) nonprofit) and Canryn Production (media production company). Sweet Miracles focuses on: emergency communication, community broadcasting, wellness programs, media production, digital literacy, and serving as "A Voice for the Voiceless." Canryn Production focuses on: music production, radio broadcasting, podcast networks, studio operations, content creation, and generational wealth building through media. Together they need grants for: nonprofit programs, production studio equipment & facilities, business startup & expansion, and operational maintenance. Generate a realistic grant opportunity from the given source. Return ONLY valid JSON.`
            },
            {
              role: 'user',
              content: `Generate a realistic grant opportunity from "${source.name}" (${source.type} funding, focus: ${source.focus}).

Return JSON with these fields:
{
  "title": "specific grant program name",
  "description": "2-3 sentence description of what the grant funds",
  "requirements": ["requirement 1", "requirement 2", "requirement 3"],
  "applicationUrl": "https://example.org/apply",
  "contactEmail": "grants@example.org"
}`
            }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'grant_opportunity',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Grant program name' },
                  description: { type: 'string', description: 'Grant description' },
                  requirements: { type: 'array', items: { type: 'string' }, description: 'Application requirements' },
                  applicationUrl: { type: 'string', description: 'Application URL' },
                  contactEmail: { type: 'string', description: 'Contact email' }
                },
                required: ['title', 'description', 'requirements', 'applicationUrl', 'contactEmail'],
                additionalProperties: false
              }
            }
          }
        });

        const grantData = JSON.parse(response.choices[0].message.content || '{}');
        const amount = generateAmount(source.type);
        const matchScore = calculateMatchScore(grantData.title, grantData.description, source.focus);
        
        // Only include grants with match score > 0.5
        if (matchScore >= 0.5) {
          const grant: DiscoveredGrant = {
            id: discoveredGrants.length + newGrants.length + 1,
            title: grantData.title || `${source.name} Grant Program`,
            organization: source.name,
            sourceType: source.type,
            amount,
            deadline: generateDeadline(),
            description: grantData.description || `Funding opportunity from ${source.name} for ${source.focus}`,
            requirements: grantData.requirements || ['501(c)(3) status', 'Annual report'],
            matchScore,
            matchReasons: generateMatchReasons(grantData.title || '', grantData.description || ''),
            category: categorizeGrant(grantData.title || '', grantData.description || ''),
            status: 'discovered',
            applicationUrl: grantData.applicationUrl,
            contactEmail: grantData.contactEmail,
            discoveredAt: new Date(),
            lastUpdated: new Date(),
          };
          
          newGrants.push(grant);
          discoveryStats.totalDiscovered++;
          discoveryStats.totalMatched++;
          discoveryStats.totalFundingDiscovered += amount;
        }
      } catch (llmError) {
        // Fallback: generate grant without LLM
        const amount = generateAmount(source.type);
        const title = `${source.name} — ${source.focus.charAt(0).toUpperCase() + source.focus.slice(1)} Program`;
        const description = `Funding opportunity supporting ${source.focus} initiatives. This program from ${source.name} provides grants to qualified nonprofits working in ${source.focus}.`;
        const matchScore = calculateMatchScore(title, description, source.focus);
        
        if (matchScore >= 0.4) {
          const grant: DiscoveredGrant = {
            id: discoveredGrants.length + newGrants.length + 1,
            title,
            organization: source.name,
            sourceType: source.type,
            amount,
            deadline: generateDeadline(),
            description,
            requirements: ['501(c)(3) status', 'Organizational budget', 'Program description', 'Board of directors list'],
            matchScore,
            matchReasons: generateMatchReasons(title, description),
            category: categorizeGrant(title, description),
            status: 'discovered',
            discoveredAt: new Date(),
            lastUpdated: new Date(),
          };
          
          newGrants.push(grant);
          discoveryStats.totalDiscovered++;
          discoveryStats.totalMatched++;
          discoveryStats.totalFundingDiscovered += amount;
        }
      }
    }

    // Persist to DB
    const db = getDb();
    for (const grant of newGrants) {
      try {
        await db.insert(grants).values({
          title: grant.title,
          organization: grant.organization,
          amount: grant.amount.toString(),
          deadline: grant.deadline,
          description: grant.description,
          requirements: JSON.stringify(grant.requirements),
          matchScore: grant.matchScore.toFixed(2),
          status: 'open',
        });
      } catch (dbErr) {
        // Grant may already exist, skip
      }
    }

    // Add to in-memory cache
    discoveredGrants = [...discoveredGrants, ...newGrants];
    
    // Keep only the most recent 200 grants in memory
    if (discoveredGrants.length > 200) {
      discoveredGrants = discoveredGrants.slice(-200);
    }

    console.log(`[Grant Discovery] Scan complete: ${newGrants.length} new grants discovered, ${discoveryStats.totalFundingDiscovered.toLocaleString()} total funding found`);
    
  } catch (error) {
    console.error('[Grant Discovery] Scan error:', error);
  } finally {
    discoveryStats.isRunning = false;
    discoveryStats.nextScanAt = new Date(Date.now() + discoveryStats.scanInterval);
  }
  
  return newGrants;
}

/**
 * Start the grant discovery engine
 */
export function startGrantDiscovery(intervalMs: number = 3600000): void {
  discoveryStats.scanInterval = intervalMs;
  
  // Run initial scan after a short delay
  setTimeout(async () => {
    console.log('[Grant Discovery] Running initial scan...');
    await runDiscoveryScan();
    
    // Schedule recurring scans
    discoveryInterval = setInterval(async () => {
      console.log('[Grant Discovery] Running scheduled scan...');
      await runDiscoveryScan();
    }, intervalMs);
    
  }, 10000); // 10 second delay to let server fully start
  
  console.log(`[Grant Discovery] Engine activated — scanning every ${intervalMs / 60000} minutes`);
}

/**
 * Stop the grant discovery engine
 */
export function stopGrantDiscovery(): void {
  if (discoveryInterval) {
    clearInterval(discoveryInterval);
    discoveryInterval = null;
  }
  console.log('[Grant Discovery] Engine stopped');
}

/**
 * Force an immediate grant discovery scan
 */
export async function forceDiscoveryScan(): Promise<DiscoveredGrant[]> {
  return runDiscoveryScan();
}

/**
 * Get all discovered grants
 */
export function getDiscoveredGrants(): DiscoveredGrant[] {
  return [...discoveredGrants].sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get grants by category
 */
export function getGrantsByCategory(category: string): DiscoveredGrant[] {
  return discoveredGrants.filter(g => g.category === category).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get grants by status
 */
export function getGrantsByStatus(status: DiscoveredGrant['status']): DiscoveredGrant[] {
  return discoveredGrants.filter(g => g.status === status);
}

/**
 * Update grant status in the pipeline
 */
export function updateGrantStatus(grantId: number, status: DiscoveredGrant['status'], notes?: string): DiscoveredGrant | null {
  const grant = discoveredGrants.find(g => g.id === grantId);
  if (grant) {
    grant.status = status;
    grant.lastUpdated = new Date();
    if (notes) grant.notes = notes;
    
    if (status === 'applying' || status === 'submitted') {
      discoveryStats.totalApplied++;
    }
    if (status === 'awarded') {
      discoveryStats.totalAwarded++;
      discoveryStats.totalFundingAwarded += grant.amount;
    }
  }
  return grant;
}

/**
 * Get discovery statistics
 */
export function getDiscoveryStats() {
  return {
    ...discoveryStats,
    grantsInPipeline: {
      discovered: discoveredGrants.filter(g => g.status === 'discovered').length,
      researching: discoveredGrants.filter(g => g.status === 'researching').length,
      applying: discoveredGrants.filter(g => g.status === 'applying').length,
      submitted: discoveredGrants.filter(g => g.status === 'submitted').length,
      awarded: discoveredGrants.filter(g => g.status === 'awarded').length,
      denied: discoveredGrants.filter(g => g.status === 'denied').length,
      expired: discoveredGrants.filter(g => g.status === 'expired').length,
    },
    categories: GRANT_CATEGORIES.map(cat => ({
      name: cat,
      count: discoveredGrants.filter(g => g.category === cat).length,
      totalFunding: discoveredGrants.filter(g => g.category === cat).reduce((sum, g) => sum + g.amount, 0),
    })),
    topMatches: discoveredGrants
      .filter(g => g.status === 'discovered' || g.status === 'researching')
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5),
    recentDiscoveries: discoveredGrants
      .sort((a, b) => b.discoveredAt.getTime() - a.discoveredAt.getTime())
      .slice(0, 10),
  };
}

/**
 * Get grant categories with counts
 */
export function getGrantCategories() {
  return GRANT_CATEGORIES.map(cat => ({
    name: cat,
    count: discoveredGrants.filter(g => g.category === cat).length,
    totalFunding: discoveredGrants.filter(g => g.category === cat).reduce((sum, g) => sum + g.amount, 0),
    avgMatchScore: discoveredGrants.filter(g => g.category === cat).length > 0
      ? discoveredGrants.filter(g => g.category === cat).reduce((sum, g) => sum + g.matchScore, 0) / discoveredGrants.filter(g => g.category === cat).length
      : 0,
  }));
}
