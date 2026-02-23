/**
 * QUMUS Autonomous Responder Assignment Policy
 * Automatically assigns SOS alerts to the best available responder
 * based on availability, location, certification, and current load
 */

export interface ResponderAssignmentContext {
  alertId: string;
  alertType: 'medical' | 'security' | 'mental-health' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  callerLocation?: {
    latitude: number;
    longitude: number;
  };
  requiredCertifications?: string[];
  preferredLanguage?: string;
}

export interface ResponderProfile {
  id: string;
  name: string;
  role: 'coordinator' | 'operator' | 'medical' | 'security' | 'volunteer';
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
  currentCallCount: number;
  maxConcurrentCalls: number;
  certifications: string[];
  languages: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  responseTime: number; // seconds
  successRate: number; // 0-100
  lastAssignmentTime?: Date;
  specializations?: string[];
}

export interface AssignmentDecision {
  responderId: string;
  confidence: number; // 0-1
  reasoning: string;
  alternativeResponders: string[];
  autoAssign: boolean;
  requiresHumanApproval: boolean;
}

class QumusResponderAssignmentPolicy {
  /**
   * Analyze context and assign responder automatically
   */
  analyzeAndAssign(context: ResponderAssignmentContext, availableResponders: ResponderProfile[]): AssignmentDecision {
    // Filter responders by availability
    const availableForAssignment = availableResponders.filter(r => this.isResponderAvailable(r, context));

    if (availableForAssignment.length === 0) {
      return {
        responderId: '',
        confidence: 0,
        reasoning: 'No responders available for assignment',
        alternativeResponders: [],
        autoAssign: false,
        requiresHumanApproval: true,
      };
    }

    // Score each responder
    const scoredResponders = availableForAssignment.map(responder => ({
      responder,
      score: this.calculateResponderScore(responder, context),
    }));

    // Sort by score (highest first)
    scoredResponders.sort((a, b) => b.score - a.score);

    const topResponder = scoredResponders[0];
    const alternatives = scoredResponders.slice(1, 4).map(r => r.responder.id);

    // Determine if auto-assignment is appropriate
    const autoAssign = topResponder.score >= 0.75; // 75% confidence threshold
    const requiresHumanApproval = context.severity === 'critical' || topResponder.score < 0.6;

    return {
      responderId: topResponder.responder.id,
      confidence: topResponder.score,
      reasoning: this.generateReasoning(topResponder.responder, context, topResponder.score),
      alternativeResponders: alternatives,
      autoAssign,
      requiresHumanApproval,
    };
  }

  /**
   * Check if responder is available for assignment
   */
  private isResponderAvailable(responder: ResponderProfile, context: ResponderAssignmentContext): boolean {
    // Check status
    if (responder.status === 'inactive' || responder.status === 'off-duty') {
      return false;
    }

    // Check capacity
    if (responder.currentCallCount >= responder.maxConcurrentCalls) {
      return false;
    }

    // Check certifications if required
    if (context.requiredCertifications && context.requiredCertifications.length > 0) {
      const hasCertifications = context.requiredCertifications.every(cert => responder.certifications.includes(cert));
      if (!hasCertifications) {
        return false;
      }
    }

    // Check language if preferred
    if (context.preferredLanguage && !responder.languages.includes(context.preferredLanguage)) {
      return false;
    }

    return true;
  }

  /**
   * Calculate responder score for assignment
   * Factors: specialization match, current load, success rate, response time, location proximity
   */
  private calculateResponderScore(responder: ResponderProfile, context: ResponderAssignmentContext): number {
    let score = 0;

    // 1. Specialization match (30%)
    const specializationScore = this.calculateSpecializationMatch(responder, context);
    score += specializationScore * 0.3;

    // 2. Current load (25%)
    const loadScore = this.calculateLoadScore(responder);
    score += loadScore * 0.25;

    // 3. Success rate (20%)
    const successScore = responder.successRate / 100;
    score += successScore * 0.2;

    // 4. Response time (15%)
    const responseScore = this.calculateResponseScore(responder);
    score += responseScore * 0.15;

    // 5. Location proximity (10%)
    const locationScore = this.calculateLocationScore(responder, context);
    score += locationScore * 0.1;

    return Math.min(score, 1); // Cap at 1.0
  }

  /**
   * Calculate specialization match score
   */
  private calculateSpecializationMatch(responder: ResponderProfile, context: ResponderAssignmentContext): number {
    // Match by role
    const roleMatch = this.getRoleMatchScore(responder.role, context.alertType);

    // Match by certifications
    let certMatch = 1;
    if (context.requiredCertifications && context.requiredCertifications.length > 0) {
      const matchedCerts = context.requiredCertifications.filter(cert => responder.certifications.includes(cert)).length;
      certMatch = matchedCerts / context.requiredCertifications.length;
    }

    // Match by specializations
    let specMatch = 1;
    if (responder.specializations && responder.specializations.length > 0) {
      const hasRelevantSpec = responder.specializations.some(spec => {
        const contextType = context.alertType.toLowerCase();
        return spec.toLowerCase().includes(contextType);
      });
      specMatch = hasRelevantSpec ? 1 : 0.5;
    }

    return (roleMatch + certMatch + specMatch) / 3;
  }

  /**
   * Get role match score for alert type
   */
  private getRoleMatchScore(role: 'coordinator' | 'operator' | 'medical' | 'security' | 'volunteer', alertType: string): number {
    const matches: Record<string, Record<string, number>> = {
      medical: {
        medical: 1.0,
        'mental-health': 0.8,
        other: 0.3,
        security: 0.2,
      },
      security: {
        security: 1.0,
        other: 0.5,
        medical: 0.2,
        'mental-health': 0.2,
      },
      'mental-health': {
        'mental-health': 1.0,
        medical: 0.6,
        other: 0.4,
        security: 0.3,
      },
      other: {
        other: 0.8,
        medical: 0.5,
        security: 0.5,
        'mental-health': 0.5,
      },
    };

    const roleScores = matches[alertType] || {};
    return roleScores[role] || 0.5;
  }

  /**
   * Calculate load score (lower load = higher score)
   */
  private calculateLoadScore(responder: ResponderProfile): number {
    const loadPercentage = responder.currentCallCount / responder.maxConcurrentCalls;
    return 1 - loadPercentage; // Inverse: less load = higher score
  }

  /**
   * Calculate response time score (faster = higher score)
   */
  private calculateResponseScore(responder: ResponderProfile): number {
    // Assume 60 seconds is ideal response time
    const idealResponseTime = 60;
    const score = Math.max(0, 1 - responder.responseTime / (idealResponseTime * 2));
    return score;
  }

  /**
   * Calculate location proximity score
   */
  private calculateLocationScore(responder: ResponderProfile, context: ResponderAssignmentContext): number {
    if (!responder.location || !context.callerLocation) {
      return 0.5; // Neutral if location data unavailable
    }

    const distance = this.calculateDistance(responder.location, context.callerLocation);

    // Score: closer = higher score
    // Assume 10km is max acceptable distance
    const maxDistance = 10;
    const score = Math.max(0, 1 - distance / maxDistance);
    return score;
  }

  /**
   * Calculate distance between two coordinates (simplified)
   */
  private calculateDistance(loc1: { latitude: number; longitude: number }, loc2: { latitude: number; longitude: number }): number {
    // Simplified Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((loc1.latitude * Math.PI) / 180) * Math.cos((loc2.latitude * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Generate human-readable reasoning for assignment
   */
  private generateReasoning(responder: ResponderProfile, context: ResponderAssignmentContext, score: number): string {
    const reasons: string[] = [];

    // Role match
    const roleMatch = this.getRoleMatchScore(responder.role, context.alertType);
    if (roleMatch > 0.8) {
      reasons.push(`${responder.role} is ideal for ${context.alertType} alerts`);
    }

    // Load
    const loadPercentage = (responder.currentCallCount / responder.maxConcurrentCalls) * 100;
    if (loadPercentage < 50) {
      reasons.push(`Low current load (${responder.currentCallCount}/${responder.maxConcurrentCalls} calls)`);
    }

    // Success rate
    if (responder.successRate > 90) {
      reasons.push(`High success rate (${responder.successRate}%)`);
    }

    // Confidence
    const confidencePercent = Math.round(score * 100);
    reasons.push(`Assignment confidence: ${confidencePercent}%`);

    return reasons.join('. ');
  }

  /**
   * Get policy metadata
   */
  getPolicyMetadata() {
    return {
      name: 'Automatic Responder Assignment',
      version: '1.0',
      description: 'Autonomously assigns SOS alerts to the best available responder',
      factors: [
        'Specialization match (30%)',
        'Current load (25%)',
        'Success rate (20%)',
        'Response time (15%)',
        'Location proximity (10%)',
      ],
      confidenceThreshold: 0.75,
      autoAssignThreshold: 0.75,
      humanApprovalThreshold: 0.6,
      criticalSeverityRequiresApproval: true,
    };
  }
}

export const qumusResponderAssignmentPolicy = new QumusResponderAssignmentPolicy();
