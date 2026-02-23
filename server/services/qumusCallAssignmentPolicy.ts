/**
 * QUMUS Call Assignment Policy
 * Autonomous decision-making for assigning SOS alerts to responders
 * Based on: specialization match, current load, success rate, response time, location
 */

interface Responder {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
  currentCallCount: number;
  maxConcurrentCalls: number;
  successRate: number;
  responseTime: number;
  specializations: string[];
  location?: { latitude: number; longitude: number };
}

interface SOSAlert {
  id: string;
  alertType: 'medical' | 'security' | 'mental-health' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: { latitude: number; longitude: number };
}

interface AssignmentScore {
  responderId: string;
  score: number;
  confidence: number;
  reasoning: string;
  factors: {
    specializationMatch: number;
    loadBalance: number;
    successRate: number;
    responseTime: number;
    locationProximity: number;
  };
}

export class QUMUSCallAssignmentPolicy {
  /**
   * Calculate specialization match score (0-100)
   */
  private calculateSpecializationMatch(
    responder: Responder,
    alert: SOSAlert
  ): number {
    const specializationMap: Record<string, string[]> = {
      medical: ['cardiac', 'trauma', 'respiratory', 'stroke'],
      security: ['threat-assessment', 'de-escalation', 'weapons-training'],
      'mental-health': ['crisis-intervention', 'suicide-prevention', 'trauma-counseling'],
    };

    const requiredSpecializations = specializationMap[alert.alertType] || [];
    const matchedSpecializations = responder.specializations.filter(s =>
      requiredSpecializations.includes(s)
    ).length;

    return requiredSpecializations.length > 0
      ? (matchedSpecializations / requiredSpecializations.length) * 100
      : 50;
  }

  /**
   * Calculate load balance score (0-100)
   * Higher score = more available capacity
   */
  private calculateLoadBalance(responder: Responder): number {
    const availableCapacity = responder.maxConcurrentCalls - responder.currentCallCount;
    const capacityPercentage = (availableCapacity / responder.maxConcurrentCalls) * 100;
    return Math.max(0, capacityPercentage);
  }

  /**
   * Calculate success rate score (0-100)
   */
  private calculateSuccessRateScore(responder: Responder): number {
    return responder.successRate;
  }

  /**
   * Calculate response time score (0-100)
   * Lower response time = higher score
   */
  private calculateResponseTimeScore(responder: Responder): number {
    const maxResponseTime = 300; // 5 minutes
    const score = Math.max(0, 100 - (responder.responseTime / maxResponseTime) * 100);
    return score;
  }

  /**
   * Calculate location proximity score (0-100)
   * Closer distance = higher score
   */
  private calculateLocationProximity(
    responder: Responder,
    alert: SOSAlert
  ): number {
    if (!responder.location || !alert.location) {
      return 50; // Neutral score if location data unavailable
    }

    const R = 3959; // Earth radius in miles
    const lat1 = (responder.location.latitude * Math.PI) / 180;
    const lat2 = (alert.location.latitude * Math.PI) / 180;
    const deltaLat = ((alert.location.latitude - responder.location.latitude) * Math.PI) / 180;
    const deltaLon = ((alert.location.longitude - responder.location.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Score: 100 at 0 miles, 0 at 50+ miles
    const proximityScore = Math.max(0, 100 - (distance / 50) * 100);
    return proximityScore;
  }

  /**
   * Assign SOS alert to best responder
   */
  assignAlert(responders: Responder[], alert: SOSAlert): AssignmentScore | null {
    // Filter available responders
    const availableResponders = responders.filter(
      r =>
        r.status === 'on-duty' &&
        r.currentCallCount < r.maxConcurrentCalls &&
        r.role === alert.alertType
    );

    if (availableResponders.length === 0) {
      console.log('[QUMUS] No available responders for alert type:', alert.alertType);
      return null;
    }

    // Calculate scores for each responder
    const scores: AssignmentScore[] = availableResponders.map(responder => {
      const specializationMatch = this.calculateSpecializationMatch(responder, alert);
      const loadBalance = this.calculateLoadBalance(responder);
      const successRate = this.calculateSuccessRateScore(responder);
      const responseTime = this.calculateResponseTimeScore(responder);
      const locationProximity = this.calculateLocationProximity(responder, alert);

      // Weighted scoring
      const weights = {
        specialization: 0.35,
        load: 0.25,
        success: 0.2,
        response: 0.1,
        location: 0.1,
      };

      const totalScore =
        specializationMatch * weights.specialization +
        loadBalance * weights.load +
        successRate * weights.success +
        responseTime * weights.response +
        locationProximity * weights.location;

      // Calculate confidence (0-100)
      const confidence = Math.min(100, totalScore + (specializationMatch > 0 ? 10 : 0));

      return {
        responderId: responder.id,
        score: totalScore,
        confidence: confidence,
        reasoning: this.generateReasoning(responder, alert, {
          specializationMatch,
          loadBalance,
          successRate,
          responseTime,
          locationProximity,
        }),
        factors: {
          specializationMatch,
          loadBalance,
          successRate,
          responseTime,
          locationProximity,
        },
      };
    });

    // Sort by score and return best match
    scores.sort((a, b) => b.score - a.score);
    const bestMatch = scores[0];

    console.log('[QUMUS] Alert assigned to responder:', {
      responderId: bestMatch.responderId,
      score: bestMatch.score.toFixed(2),
      confidence: bestMatch.confidence.toFixed(2),
      reasoning: bestMatch.reasoning,
    });

    return bestMatch;
  }

  /**
   * Generate human-readable reasoning for assignment
   */
  private generateReasoning(
    responder: Responder,
    alert: SOSAlert,
    factors: Record<string, number>
  ): string {
    const reasons: string[] = [];

    if (factors.specializationMatch > 80) {
      reasons.push(`Strong specialization match (${factors.specializationMatch.toFixed(0)}%)`);
    }

    if (factors.loadBalance > 70) {
      reasons.push(`High availability (${factors.loadBalance.toFixed(0)}% capacity)`);
    }

    if (factors.successRate > 95) {
      reasons.push(`Excellent success rate (${factors.successRate.toFixed(0)}%)`);
    }

    if (factors.responseTime > 80) {
      reasons.push('Fast response time');
    }

    if (factors.locationProximity > 70) {
      reasons.push('Close proximity to incident');
    }

    return reasons.length > 0
      ? reasons.join(', ')
      : `Assigned to ${responder.name} based on availability`;
  }

  /**
   * Get alternative responders for transfer
   */
  getAlternativeResponders(
    responders: Responder[],
    alert: SOSAlert,
    excludeResponderId: string,
    limit: number = 3
  ): AssignmentScore[] {
    const available = responders.filter(
      r =>
        r.id !== excludeResponderId &&
        r.status === 'on-duty' &&
        r.currentCallCount < r.maxConcurrentCalls
    );

    const scores: AssignmentScore[] = available.map(responder => {
      const specializationMatch = this.calculateSpecializationMatch(responder, alert);
      const loadBalance = this.calculateLoadBalance(responder);
      const successRate = this.calculateSuccessRateScore(responder);
      const responseTime = this.calculateResponseTimeScore(responder);
      const locationProximity = this.calculateLocationProximity(responder, alert);

      const weights = {
        specialization: 0.35,
        load: 0.25,
        success: 0.2,
        response: 0.1,
        location: 0.1,
      };

      const totalScore =
        specializationMatch * weights.specialization +
        loadBalance * weights.load +
        successRate * weights.success +
        responseTime * weights.response +
        locationProximity * weights.location;

      const confidence = Math.min(100, totalScore + (specializationMatch > 0 ? 10 : 0));

      return {
        responderId: responder.id,
        score: totalScore,
        confidence: confidence,
        reasoning: this.generateReasoning(responder, alert, {
          specializationMatch,
          loadBalance,
          successRate,
          responseTime,
          locationProximity,
        }),
        factors: {
          specializationMatch,
          loadBalance,
          successRate,
          responseTime,
          locationProximity,
        },
      };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, limit);
  }

  /**
   * Get policy statistics
   */
  getStatistics() {
    return {
      policyName: 'QUMUS Call Assignment Policy',
      version: '1.0.0',
      factors: [
        'Specialization Match (35%)',
        'Load Balance (25%)',
        'Success Rate (20%)',
        'Response Time (10%)',
        'Location Proximity (10%)',
      ],
      autonomyLevel: 90,
      humanOversight: 10,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const qumusCallAssignmentPolicy = new QUMUSCallAssignmentPolicy();
