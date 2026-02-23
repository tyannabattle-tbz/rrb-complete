/**
 * AI Bot Assistant Service
 * Screens calls, answers FAQs, and provides caller context to hosts
 */

export interface CallerProfile {
  id: string;
  name: string;
  phoneNumber: string;
  callHistory: CallRecord[];
  riskLevel: 'low' | 'medium' | 'high';
  notes: string[];
  lastCall?: number;
  totalCalls: number;
  averageCallDuration: number;
}

export interface CallRecord {
  id: string;
  timestamp: number;
  duration: number;
  topic: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  notes: string;
}

export interface BotScreeningResult {
  callerId: string;
  callerName: string;
  isKnownCaller: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedAction: 'connect' | 'screen' | 'decline';
  context: string;
  suggestedQuestions: string[];
  faqAnswered: boolean;
  faqTopic?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

class AIBotAssistantService {
  private callerProfiles: Map<string, CallerProfile>;
  private faqDatabase: FAQItem[];
  private screeningListeners: ((result: BotScreeningResult) => void)[] = [];

  constructor() {
    this.callerProfiles = new Map();
    this.faqDatabase = this.initializeFAQ();
  }

  /**
   * Initialize FAQ database
   */
  private initializeFAQ(): FAQItem[] {
    return [
      {
        id: 'faq-1',
        question: 'What is Rockin\' Rockin\' Boogie?',
        answer: 'Rockin\' Rockin\' Boogie is a legacy restoration platform celebrating the life and music of Seabrun Candy Hunter and Little Richard. We preserve history through audio, video, and community engagement.',
        keywords: ['rockin', 'boogie', 'about', 'what', 'legacy'],
        category: 'General',
      },
      {
        id: 'faq-2',
        question: 'How do I participate in the community?',
        answer: 'You can join our community by visiting the Community section, participating in discussions, sharing memories, and attending live events. Registration is free and open to everyone.',
        keywords: ['community', 'join', 'participate', 'member', 'register'],
        category: 'Community',
      },
      {
        id: 'faq-3',
        question: 'Can I call in to the live show?',
        answer: 'Yes! You can call in during live broadcasts. Dial +1-800-RRB-LIVE to connect. Calls are screened to ensure quality conversation for all listeners.',
        keywords: ['call', 'live', 'phone', 'dial', 'broadcast'],
        category: 'Broadcasting',
      },
      {
        id: 'faq-4',
        question: 'How do I access the music library?',
        answer: 'Visit the Music & Radio section to stream our curated collection of classic and contemporary music. You can also tune into our vintage radio for a continuous listening experience.',
        keywords: ['music', 'library', 'stream', 'radio', 'listen'],
        category: 'Music',
      },
      {
        id: 'faq-5',
        question: 'What is the Proof Vault?',
        answer: 'The Proof Vault is our digital archive preserving historical documents, photos, and evidence related to the RRB legacy. It ensures authenticity and provides researchers with primary sources.',
        keywords: ['vault', 'proof', 'archive', 'documents', 'history'],
        category: 'Archive',
      },
      {
        id: 'faq-6',
        question: 'How can I support the foundation?',
        answer: 'You can support RRB through donations, volunteering, or participating in fundraising events. Visit the Legacy Foundation section to learn about current initiatives and donation options.',
        keywords: ['support', 'donate', 'foundation', 'help', 'contribute'],
        category: 'Support',
      },
    ];
  }

  /**
   * Screen incoming call
   */
  async screenCall(callerId: string, callerName: string, phoneNumber: string): Promise<BotScreeningResult> {
    // Check if caller is known
    let profile = this.callerProfiles.get(callerId);
    const isKnownCaller = !!profile;

    if (!profile) {
      profile = this.createNewCallerProfile(callerId, callerName, phoneNumber);
      this.callerProfiles.set(callerId, profile);
    }

    // Determine risk level
    const riskLevel = this.assessRiskLevel(profile);

    // Generate context
    const context = this.generateCallerContext(profile);

    // Suggest questions for host
    const suggestedQuestions = this.generateSuggestedQuestions(profile);

    // Check if FAQ can answer the call
    const faqResult = await this.checkFAQMatch(callerName);

    const result: BotScreeningResult = {
      callerId,
      callerName,
      isKnownCaller,
      riskLevel,
      recommendedAction: this.getRecommendedAction(riskLevel, isKnownCaller),
      context,
      suggestedQuestions,
      faqAnswered: faqResult.matched,
      faqTopic: faqResult.topic,
    };

    // Notify listeners
    this.notifyScreeningListeners(result);

    return result;
  }

  /**
   * Answer FAQ question
   */
  async answerFAQ(question: string): Promise<{ answer: string; faqId: string } | null> {
    const match = this.matchFAQ(question);
    if (match) {
      return {
        answer: match.answer,
        faqId: match.id,
      };
    }
    return null;
  }

  /**
   * Record call completion
   */
  recordCallCompletion(
    callerId: string,
    duration: number,
    topic: string,
    sentiment: 'positive' | 'neutral' | 'negative',
    notes: string
  ): void {
    const profile = this.callerProfiles.get(callerId);
    if (!profile) return;

    const callRecord: CallRecord = {
      id: `call-${Date.now()}`,
      timestamp: Date.now(),
      duration,
      topic,
      sentiment,
      notes,
    };

    profile.callHistory.push(callRecord);
    profile.totalCalls++;
    profile.lastCall = Date.now();

    // Update average duration
    const totalDuration = profile.callHistory.reduce((sum, c) => sum + c.duration, 0);
    profile.averageCallDuration = totalDuration / profile.callHistory.length;
  }

  /**
   * Add note to caller profile
   */
  addCallerNote(callerId: string, note: string): void {
    const profile = this.callerProfiles.get(callerId);
    if (profile) {
      profile.notes.push(`${new Date().toISOString()}: ${note}`);
    }
  }

  /**
   * Get caller profile
   */
  getCallerProfile(callerId: string): CallerProfile | undefined {
    return this.callerProfiles.get(callerId);
  }

  /**
   * Get all FAQ items
   */
  getAllFAQ(): FAQItem[] {
    return [...this.faqDatabase];
  }

  /**
   * Search FAQ by category
   */
  searchFAQByCategory(category: string): FAQItem[] {
    return this.faqDatabase.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Create new caller profile
   */
  private createNewCallerProfile(callerId: string, callerName: string, phoneNumber: string): CallerProfile {
    return {
      id: callerId,
      name: callerName,
      phoneNumber,
      callHistory: [],
      riskLevel: 'low',
      notes: [],
      totalCalls: 0,
      averageCallDuration: 0,
    };
  }

  /**
   * Assess risk level based on call history
   */
  private assessRiskLevel(profile: CallerProfile): 'low' | 'medium' | 'high' {
    // New callers are low risk
    if (profile.totalCalls === 0) return 'low';

    // Analyze sentiment from call history
    const negativeCount = profile.callHistory.filter(c => c.sentiment === 'negative').length;
    const negativeRatio = negativeCount / profile.callHistory.length;

    if (negativeRatio > 0.5) return 'high';
    if (negativeRatio > 0.25) return 'medium';

    // Check for concerning notes
    if (profile.notes.some(n => n.toLowerCase().includes('abusive') || n.toLowerCase().includes('harass'))) {
      return 'high';
    }

    return 'low';
  }

  /**
   * Generate context about caller for host
   */
  private generateCallerContext(profile: CallerProfile): string {
    if (profile.totalCalls === 0) {
      return 'First-time caller';
    }

    const lastCall = profile.lastCall ? new Date(profile.lastCall).toLocaleDateString() : 'Unknown';
    const sentiment = profile.callHistory[profile.callHistory.length - 1]?.sentiment || 'neutral';
    const avgDuration = Math.round(profile.averageCallDuration / 60);

    return `Returning caller (${profile.totalCalls} calls, avg ${avgDuration}min). Last call: ${lastCall}. Recent sentiment: ${sentiment}`;
  }

  /**
   * Generate suggested questions for host
   */
  private generateSuggestedQuestions(profile: CallerProfile): string[] {
    if (profile.totalCalls === 0) {
      return ['What brings you to RRB today?', 'How did you hear about us?', 'What\'s your connection to the legacy?'];
    }

    const lastTopic = profile.callHistory[profile.callHistory.length - 1]?.topic || '';
    return [
      `Following up on your previous interest in ${lastTopic}?`,
      'Any updates since your last call?',
      'What would you like to share with our listeners today?',
    ];
  }

  /**
   * Check if FAQ can answer the call
   */
  private async checkFAQMatch(callerName: string): Promise<{ matched: boolean; topic?: string }> {
    // Simple heuristic: if caller name contains FAQ keywords
    const lowerName = callerName.toLowerCase();
    for (const faq of this.faqDatabase) {
      if (faq.keywords.some(kw => lowerName.includes(kw))) {
        return { matched: true, topic: faq.category };
      }
    }
    return { matched: false };
  }

  /**
   * Match FAQ item to question
   */
  private matchFAQ(question: string): FAQItem | null {
    const lowerQuestion = question.toLowerCase();
    for (const faq of this.faqDatabase) {
      if (
        faq.question.toLowerCase().includes(lowerQuestion) ||
        faq.keywords.some(kw => lowerQuestion.includes(kw))
      ) {
        return faq;
      }
    }
    return null;
  }

  /**
   * Get recommended action
   */
  private getRecommendedAction(riskLevel: 'low' | 'medium' | 'high', isKnownCaller: boolean): 'connect' | 'screen' | 'decline' {
    if (riskLevel === 'high') return 'decline';
    if (riskLevel === 'medium' || !isKnownCaller) return 'screen';
    return 'connect';
  }

  /**
   * Register listener for screening results
   */
  onScreeningResult(listener: (result: BotScreeningResult) => void): () => void {
    this.screeningListeners.push(listener);
    return () => {
      this.screeningListeners = this.screeningListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of screening results
   */
  private notifyScreeningListeners(result: BotScreeningResult): void {
    this.screeningListeners.forEach(listener => listener(result));
  }
}

// Export singleton instance
export const aiBotAssistantService = new AIBotAssistantService();
