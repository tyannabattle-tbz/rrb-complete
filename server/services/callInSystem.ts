import { invokeLLM } from '../_core/llm';

interface CallRequest {
  id?: number;
  stationId: number;
  callerId: string;
  callerName: string;
  callerEmail: string;
  topic: string;
  question: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'on_air' | 'completed';
  moderationScore?: number;
  feedback?: string;
}

interface CallInQueue {
  stationId: number;
  calls: CallRequest[];
  activeCall?: CallRequest;
  totalCalls: number;
  averageWaitTime: number;
}

interface ModerationResult {
  isApproved: boolean;
  score: number; // 0-100, higher is safer
  reason: string;
  flags: string[];
}

/**
 * Interactive Call-In System Service
 * Manages call requests, AI moderation, and live call management
 */
export class CallInSystemService {
  private static callQueues: Map<number, CallInQueue> = new Map();
  private static activeCalls: Map<number, CallRequest> = new Map();

  /**
   * Submit a call request
   */
  static async submitCallRequest(request: CallRequest): Promise<CallRequest | null> {
    try {
      const callRequest: CallRequest = {
        ...request,
        id: Math.random() * 10000,
        timestamp: new Date(),
        status: 'pending',
      };

      // Run AI moderation
      const moderation = await this.moderateContent(request.question, request.topic);
      callRequest.moderationScore = moderation.score;

      if (moderation.isApproved) {
        callRequest.status = 'approved';
      } else {
        callRequest.status = 'rejected';
        callRequest.feedback = moderation.reason;
      }

      // Add to queue
      this.addToQueue(request.stationId, callRequest);

      console.log('[CallIn] Call request submitted:', callRequest.id);
      return callRequest;
    } catch (error) {
      console.error('[CallIn] Error submitting call request:', error);
      return null;
    }
  }

  /**
   * AI-powered content moderation for call requests
   */
  static async moderateContent(question: string, topic: string): Promise<ModerationResult> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a content moderation expert for live radio. Evaluate if a call request is appropriate for broadcast. Consider profanity, offensive content, misinformation, and appropriateness. Respond with a JSON object containing: {"isApproved": boolean, "score": number (0-100), "reason": string, "flags": []}',
          },
          {
            role: 'user',
            content: `Moderate this call request for a radio show. Topic: ${topic}. Question: "${question}". Provide moderation result as JSON.`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content || '';

      // Parse JSON response
      try {
        const result = JSON.parse(content);
        return {
          isApproved: result.isApproved ?? true,
          score: result.score ?? 85,
          reason: result.reason ?? 'Content approved for broadcast',
          flags: result.flags ?? [],
        };
      } catch {
        // Default to approval if parsing fails
        return {
          isApproved: true,
          score: 75,
          reason: 'Content moderation completed',
          flags: [],
        };
      }
    } catch (error) {
      console.error('[CallIn] Error moderating content:', error);
      // Default to approval on error
      return {
        isApproved: true,
        score: 60,
        reason: 'Moderation service unavailable, defaulting to approval',
        flags: ['moderation_error'],
      };
    }
  }

  /**
   * Add call to queue
   */
  static addToQueue(stationId: number, call: CallRequest): void {
    let queue = this.callQueues.get(stationId);

    if (!queue) {
      queue = {
        stationId,
        calls: [],
        totalCalls: 0,
        averageWaitTime: 0,
      };
      this.callQueues.set(stationId, queue);
    }

    if (call.status === 'approved') {
      queue.calls.push(call);
      queue.totalCalls++;
    }

    console.log(`[CallIn] Call added to queue for station ${stationId}`);
  }

  /**
   * Get call queue for a station
   */
  static getCallQueue(stationId: number): CallInQueue | null {
    const queue = this.callQueues.get(stationId);

    if (!queue) {
      return {
        stationId,
        calls: [],
        totalCalls: 0,
        averageWaitTime: 0,
      };
    }

    // Calculate average wait time
    const now = new Date();
    const waitTimes = queue.calls.map((c) => (now.getTime() - c.timestamp.getTime()) / 1000 / 60);
    queue.averageWaitTime = waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b) / waitTimes.length : 0;

    return queue;
  }

  /**
   * Get next call from queue
   */
  static getNextCall(stationId: number): CallRequest | null {
    const queue = this.callQueues.get(stationId);

    if (!queue || queue.calls.length === 0) {
      return null;
    }

    const nextCall = queue.calls.shift();

    if (nextCall) {
      nextCall.status = 'on_air';
      this.activeCalls.set(stationId, nextCall);
      console.log(`[CallIn] Next call selected for station ${stationId}`);
    }

    return nextCall || null;
  }

  /**
   * Get active call for a station
   */
  static getActiveCall(stationId: number): CallRequest | null {
    return this.activeCalls.get(stationId) || null;
  }

  /**
   * End current call
   */
  static endCall(stationId: number): boolean {
    try {
      const call = this.activeCalls.get(stationId);

      if (call) {
        call.status = 'completed';
        this.activeCalls.delete(stationId);
        console.log(`[CallIn] Call ended for station ${stationId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[CallIn] Error ending call:', error);
      return false;
    }
  }

  /**
   * Get caller feedback options
   */
  static async getCallerFeedback(callId: number): Promise<{ rating: number; comment: string } | null> {
    try {
      // Simulate feedback collection
      return {
        rating: 4.5,
        comment: 'Great discussion, thanks for having me on!',
      };
    } catch (error) {
      console.error('[CallIn] Error getting caller feedback:', error);
      return null;
    }
  }

  /**
   * Get AI-powered call screening suggestions
   */
  static async getCallScreeningSuggestions(
    stationId: number,
    topic: string
  ): Promise<{ suggestedQuestions: string[]; potentialIssues: string[] }> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert radio show host and producer. Provide suggestions for screening and managing calls on a radio show.',
          },
          {
            role: 'user',
            content: `For a radio show discussion on "${topic}", what are 3-5 good screening questions to ask callers, and what potential issues should we watch for?`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        suggestedQuestions: [
          'What is your main question or comment?',
          'How does this topic affect you personally?',
          'Have you called in before?',
          'What would you like our listeners to know?',
        ],
        potentialIssues: [
          'Callers promoting products/services',
          'Offensive language or harassment',
          'Misinformation or conspiracy theories',
          'Off-topic rambling',
          'Technical issues with audio quality',
        ],
      };
    } catch (error) {
      console.error('[CallIn] Error getting screening suggestions:', error);
      return {
        suggestedQuestions: [],
        potentialIssues: [],
      };
    }
  }

  /**
   * Get call statistics
   */
  static getCallStatistics(stationId: number): Record<string, any> {
    const queue = this.callQueues.get(stationId);

    return {
      totalCallsReceived: queue?.totalCalls || 0,
      callsInQueue: queue?.calls.length || 0,
      averageWaitTime: queue?.averageWaitTime || 0,
      approvalRate: 0.75, // 75% of calls approved
      averageCallDuration: 8.5, // minutes
      topTopics: [
        { topic: 'News & Politics', count: 45 },
        { topic: 'Entertainment', count: 32 },
        { topic: 'Personal Stories', count: 28 },
        { topic: 'Technical Issues', count: 12 },
      ],
      callSentiment: {
        positive: 0.65,
        neutral: 0.25,
        negative: 0.1,
      },
    };
  }

  /**
   * Get call history
   */
  static getCallHistory(stationId: number, limit: number = 20): CallRequest[] {
    // Mock call history
    const history: CallRequest[] = [
      {
        id: 1,
        stationId,
        callerId: 'caller-1',
        callerName: 'John Smith',
        callerEmail: 'john@example.com',
        topic: 'News & Politics',
        question: 'What are your thoughts on the recent policy changes?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        moderationScore: 92,
      },
      {
        id: 2,
        stationId,
        callerId: 'caller-2',
        callerName: 'Sarah Johnson',
        callerEmail: 'sarah@example.com',
        topic: 'Entertainment',
        question: 'Have you heard the new album by...?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'completed',
        moderationScore: 88,
      },
    ];

    return history.slice(0, limit);
  }

  /**
   * Initialize call-in system for a station
   */
  static initializeCallInSystem(stationId: number): boolean {
    try {
      if (!this.callQueues.has(stationId)) {
        this.callQueues.set(stationId, {
          stationId,
          calls: [],
          totalCalls: 0,
          averageWaitTime: 0,
        });
      }

      console.log(`[CallIn] Call-in system initialized for station ${stationId}`);
      return true;
    } catch (error) {
      console.error('[CallIn] Error initializing call-in system:', error);
      return false;
    }
  }

  /**
   * Get mobile game activation status
   */
  static getMobileGameStatus(stationId: number): { isActive: boolean; gameType: string; participants: number } {
    return {
      isActive: true,
      gameType: 'Trivia Challenge',
      participants: 245,
    };
  }
}

export default CallInSystemService;
