/**
 * QUMUS Trending Promotion Engine
 * 
 * Autonomous decision-making engine that analyzes play count velocity,
 * detects trending tracks, and promotes them to prime-time schedule slots.
 * 
 * Decision Flow:
 * 1. Analyze play counts and calculate velocity (plays per hour)
 * 2. Detect trending tracks (velocity above threshold)
 * 3. Generate promotion decisions with confidence scores
 * 4. Auto-approve decisions above autonomy threshold (90%)
 * 5. Log all decisions to QUMUS decision audit trail
 * 
 * A Canryn Production — All Rights Reserved
 */

// ============================================================
// TYPES
// ============================================================
export interface TrackPlayData {
  track_id: string;
  title: string;
  artist: string;
  play_count: number;
  last_played_at: string | null;
}

export interface TrendingTrack {
  trackId: string;
  title: string;
  artist: string;
  playCount: number;
  velocity: number;        // plays per hour (recent window)
  trendScore: number;      // 0-100 composite score
  promotionSlot: string;   // recommended schedule slot
  confidence: number;      // 0-100 decision confidence
  reason: string;          // human-readable explanation
}

export interface PromotionDecision {
  id: string;
  type: 'track_promotion';
  trackId: string;
  trackTitle: string;
  artist: string;
  fromSlot: string | null;
  toSlot: string;
  trendScore: number;
  confidence: number;
  autonomyLevel: number;
  status: 'auto_approved' | 'pending_review' | 'executed' | 'vetoed';
  reason: string;
  createdAt: string;
}

export interface PromotionPolicy {
  minPlayCount: number;          // minimum plays to be considered
  trendVelocityThreshold: number; // min plays/hour to be "trending"
  autoApproveThreshold: number;   // confidence above this = auto-approve
  maxPromotionsPerCycle: number;  // max tracks promoted per analysis
  primeTimeSlots: string[];       // schedule block IDs for prime time
  cooldownMinutes: number;        // min time between promotions
}

// ============================================================
// DEFAULT POLICY
// ============================================================
export const DEFAULT_PROMOTION_POLICY: PromotionPolicy = {
  minPlayCount: 3,
  trendVelocityThreshold: 0.5,  // 0.5 plays per hour = trending
  autoApproveThreshold: 75,      // 75%+ confidence = auto-approve
  maxPromotionsPerCycle: 3,
  primeTimeSlots: ['top-of-the-sol', 'drive-time'],
  cooldownMinutes: 30,
};

// ============================================================
// SCHEDULE SLOT MAPPING
// ============================================================
const SLOT_PRIORITY: Record<string, number> = {
  'top-of-the-sol': 100,
  'drive-time': 95,
  'evening-lounge': 80,
  'late-sol': 70,
  'afternoon-blend': 65,
  'night-healing': 40,
  'deep-night': 20,
};

const SLOT_LABELS: Record<string, string> = {
  'top-of-the-sol': 'Top of the Sol (6-10 AM)',
  'drive-time': 'Drive Time (3-6 PM)',
  'evening-lounge': 'Evening Lounge (6-9 PM)',
  'late-sol': 'Late Sol (10 AM-12 PM)',
  'afternoon-blend': 'Afternoon Blend (12-3 PM)',
  'night-healing': 'Night Healing (9 PM-12 AM)',
  'deep-night': 'Deep Night (12-6 AM)',
};

// ============================================================
// TRENDING ANALYSIS
// ============================================================

/**
 * Calculate trend score for a track based on play data.
 * Score is a composite of: raw play count, recency, and velocity.
 */
export function calculateTrendScore(
  track: TrackPlayData,
  allTracks: TrackPlayData[]
): number {
  const maxPlays = Math.max(...allTracks.map(t => t.play_count), 1);
  
  // Component 1: Popularity (0-40 points) — raw play count relative to max
  const popularityScore = (track.play_count / maxPlays) * 40;
  
  // Component 2: Recency (0-30 points) — how recently was it played
  let recencyScore = 0;
  if (track.last_played_at) {
    const lastPlayed = new Date(track.last_played_at).getTime();
    const now = Date.now();
    const hoursAgo = (now - lastPlayed) / (1000 * 60 * 60);
    if (hoursAgo < 1) recencyScore = 30;
    else if (hoursAgo < 6) recencyScore = 25;
    else if (hoursAgo < 24) recencyScore = 15;
    else if (hoursAgo < 72) recencyScore = 8;
    else recencyScore = 2;
  }
  
  // Component 3: Velocity estimate (0-30 points)
  // Approximate velocity from play count and recency
  let velocityScore = 0;
  if (track.last_played_at) {
    const lastPlayed = new Date(track.last_played_at).getTime();
    const hoursActive = Math.max(1, (Date.now() - lastPlayed) / (1000 * 60 * 60));
    const velocity = track.play_count / hoursActive;
    velocityScore = Math.min(30, velocity * 10);
  }
  
  return Math.round(popularityScore + recencyScore + velocityScore);
}

/**
 * Calculate play velocity (plays per hour) for a track
 */
export function calculateVelocity(track: TrackPlayData): number {
  if (!track.last_played_at || track.play_count === 0) return 0;
  
  const lastPlayed = new Date(track.last_played_at).getTime();
  const hoursActive = Math.max(0.5, (Date.now() - lastPlayed) / (1000 * 60 * 60));
  return track.play_count / hoursActive;
}

/**
 * Determine the best promotion slot for a trending track
 */
export function getBestPromotionSlot(
  trendScore: number,
  policy: PromotionPolicy = DEFAULT_PROMOTION_POLICY
): string {
  // Higher trend scores get prime-time slots
  if (trendScore >= 80) return policy.primeTimeSlots[0] || 'top-of-the-sol';
  if (trendScore >= 60) return policy.primeTimeSlots[1] || 'drive-time';
  if (trendScore >= 40) return 'evening-lounge';
  if (trendScore >= 20) return 'afternoon-blend';
  return 'late-sol';
}

/**
 * Calculate decision confidence based on data quality
 */
export function calculateConfidence(
  track: TrackPlayData,
  trendScore: number,
  allTracks: TrackPlayData[]
): number {
  let confidence = 0;
  
  // More plays = higher confidence (0-30)
  confidence += Math.min(30, track.play_count * 3);
  
  // Higher trend score = higher confidence (0-30)
  confidence += (trendScore / 100) * 30;
  
  // More data points (tracks) = better context (0-20)
  confidence += Math.min(20, allTracks.length * 2);
  
  // Recency bonus (0-20)
  if (track.last_played_at) {
    const hoursAgo = (Date.now() - new Date(track.last_played_at).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 6) confidence += 20;
    else if (hoursAgo < 24) confidence += 12;
    else confidence += 5;
  }
  
  return Math.min(100, Math.round(confidence));
}

// ============================================================
// PROMOTION DECISION ENGINE
// ============================================================

/**
 * Analyze all tracks and generate promotion decisions.
 * This is the core QUMUS autonomous decision function.
 */
export function analyzeTrending(
  tracks: TrackPlayData[],
  policy: PromotionPolicy = DEFAULT_PROMOTION_POLICY
): TrendingTrack[] {
  if (!tracks || tracks.length === 0) return [];
  
  // Filter tracks that meet minimum play threshold
  const eligible = tracks.filter(t => t.play_count >= policy.minPlayCount);
  
  // Calculate scores for all eligible tracks
  const scored = eligible.map(track => {
    const trendScore = calculateTrendScore(track, tracks);
    const velocity = calculateVelocity(track);
    const confidence = calculateConfidence(track, trendScore, tracks);
    const promotionSlot = getBestPromotionSlot(trendScore, policy);
    
    // Generate human-readable reason
    const reasons: string[] = [];
    if (velocity >= policy.trendVelocityThreshold) {
      reasons.push(`${velocity.toFixed(1)} plays/hr velocity`);
    }
    if (track.play_count >= 10) {
      reasons.push(`${track.play_count} total plays`);
    }
    if (trendScore >= 60) {
      reasons.push('high engagement');
    }
    
    const reason = reasons.length > 0
      ? `Trending: ${reasons.join(', ')}. Recommended for ${SLOT_LABELS[promotionSlot] || promotionSlot}.`
      : `Eligible with ${track.play_count} plays. Monitoring for promotion.`;
    
    return {
      trackId: track.track_id,
      title: track.title,
      artist: track.artist,
      playCount: track.play_count,
      velocity,
      trendScore,
      promotionSlot,
      confidence,
      reason,
    } satisfies TrendingTrack;
  });
  
  // Sort by trend score descending
  scored.sort((a, b) => b.trendScore - a.trendScore);
  
  // Return top N based on policy
  return scored.slice(0, policy.maxPromotionsPerCycle);
}

/**
 * Generate promotion decisions from trending analysis.
 * Decisions above the auto-approve threshold are automatically approved.
 */
export function generatePromotionDecisions(
  trending: TrendingTrack[],
  policy: PromotionPolicy = DEFAULT_PROMOTION_POLICY
): PromotionDecision[] {
  const now = new Date().toISOString();
  
  return trending.map((track, idx) => {
    const isAutoApproved = track.confidence >= policy.autoApproveThreshold;
    
    return {
      id: `promo-${Date.now()}-${idx}`,
      type: 'track_promotion' as const,
      trackId: track.trackId,
      trackTitle: track.title,
      artist: track.artist,
      fromSlot: null,
      toSlot: track.promotionSlot,
      trendScore: track.trendScore,
      confidence: track.confidence,
      autonomyLevel: isAutoApproved ? 90 : 50,
      status: isAutoApproved ? 'auto_approved' : 'pending_review',
      reason: track.reason,
      createdAt: now,
    } satisfies PromotionDecision;
  });
}

/**
 * Get the slot label for display
 */
export function getSlotLabel(slotId: string): string {
  return SLOT_LABELS[slotId] || slotId;
}

/**
 * Get slot priority for sorting
 */
export function getSlotPriority(slotId: string): number {
  return SLOT_PRIORITY[slotId] || 50;
}

/**
 * Get all available promotion slots with their priorities
 */
export function getAllSlots(): Array<{ id: string; label: string; priority: number }> {
  return Object.entries(SLOT_LABELS).map(([id, label]) => ({
    id,
    label,
    priority: SLOT_PRIORITY[id] || 50,
  })).sort((a, b) => b.priority - a.priority);
}
