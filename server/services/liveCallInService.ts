import { db } from '../db';
import { invokeLLM } from '../_core/llm';

export interface Caller {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  topic?: string;
  waitTime: number;
  status: 'waiting' | 'screening' | 'approved' | 'live' | 'ended' | 'rejected';
  joinedAt: Date;
  audioLevel: number;
  isMuted: boolean;
}

export interface CallSession {
  id: string;
  broadcastId: string;
  operatorId: string;
  callers: Caller[];
  activeCaller: Caller | null;
  audioMixLevel: number;
  recordingEnabled: boolean;
  startedAt: Date;
  endedAt?: Date;
}

class LiveCallInService {
  private callSessions: Map<string, CallSession> = new Map();
  private callerQueue: Map<string, Caller[]> = new Map();

  /**
   * Initialize a new call-in session for a broadcast
   */
  async initializeCallSession(broadcastId: string, operatorId: string): Promise<CallSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CallSession = {
      id: sessionId,
      broadcastId,
      operatorId,
      callers: [],
      activeCaller: null,
      audioMixLevel: 0.8,
      recordingEnabled: true,
      startedAt: new Date(),
    };

    this.callSessions.set(sessionId, session);
    this.callerQueue.set(sessionId, []);

    return session;
  }

  /**
   * Add a new caller to the queue
   */
  async addCaller(
    sessionId: string,
    name: string,
    phoneNumber: string,
    topic?: string,
    email?: string
  ): Promise<Caller> {
    const caller: Caller = {
      id: `caller-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      phoneNumber,
      email,
      topic,
      waitTime: 0,
      status: 'waiting',
      joinedAt: new Date(),
      audioLevel: 0.7,
      isMuted: false,
    };

    const queue = this.callerQueue.get(sessionId) || [];
    queue.push(caller);
    this.callerQueue.set(sessionId, queue);

    const session = this.callSessions.get(sessionId);
    if (session) {
      session.callers.push(caller);
    }

    return caller;
  }

  /**
   * Screen a caller using AI
   */
  async screenCaller(sessionId: string, callerId: string): Promise<{ approved: boolean; reason: string }> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const caller = session.callers.find((c) => c.id === callerId);
    if (!caller) throw new Error('Caller not found');

    caller.status = 'screening';

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a broadcast call screener. Evaluate if a caller should be allowed on air based on their topic and background. Respond with JSON: {approved: boolean, reason: string}',
          },
          {
            role: 'user',
            content: `Caller: ${caller.name}, Topic: ${caller.topic || 'General'}, Email: ${caller.email || 'Not provided'}. Should this caller go on air?`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'caller_screening',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                approved: { type: 'boolean' },
                reason: { type: 'string' },
              },
              required: ['approved', 'reason'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const result = typeof content === 'string' ? JSON.parse(content) : content;

      caller.status = result.approved ? 'approved' : 'rejected';
      return result;
    } catch (error) {
      caller.status = 'rejected';
      return { approved: false, reason: 'Screening failed' };
    }
  }

  /**
   * Move caller to live broadcast
   */
  async goLive(sessionId: string, callerId: string): Promise<Caller> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // End previous caller if any
    if (session.activeCaller) {
      session.activeCaller.status = 'ended';
    }

    const caller = session.callers.find((c) => c.id === callerId);
    if (!caller) throw new Error('Caller not found');

    caller.status = 'live';
    session.activeCaller = caller;

    return caller;
  }

  /**
   * Adjust audio mix level
   */
  async adjustAudioMix(sessionId: string, level: number): Promise<number> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.audioMixLevel = Math.max(0, Math.min(1, level));
    return session.audioMixLevel;
  }

  /**
   * Mute/unmute caller
   */
  async toggleCallerMute(sessionId: string, callerId: string, mute: boolean): Promise<Caller> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const caller = session.callers.find((c) => c.id === callerId);
    if (!caller) throw new Error('Caller not found');

    caller.isMuted = mute;
    return caller;
  }

  /**
   * Adjust caller audio level
   */
  async adjustCallerAudioLevel(sessionId: string, callerId: string, level: number): Promise<Caller> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const caller = session.callers.find((c) => c.id === callerId);
    if (!caller) throw new Error('Caller not found');

    caller.audioLevel = Math.max(0, Math.min(1, level));
    return caller;
  }

  /**
   * End caller session
   */
  async endCaller(sessionId: string, callerId: string): Promise<Caller> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const caller = session.callers.find((c) => c.id === callerId);
    if (!caller) throw new Error('Caller not found');

    caller.status = 'ended';
    if (session.activeCaller?.id === callerId) {
      session.activeCaller = null;
    }

    return caller;
  }

  /**
   * Get next caller in queue
   */
  async getNextCaller(sessionId: string): Promise<Caller | null> {
    const queue = this.callerQueue.get(sessionId) || [];
    return queue.find((c) => c.status === 'approved') || null;
  }

  /**
   * Get all callers for a session
   */
  async getCallers(sessionId: string): Promise<Caller[]> {
    const session = this.callSessions.get(sessionId);
    return session?.callers || [];
  }

  /**
   * Get session stats
   */
  async getSessionStats(sessionId: string): Promise<{
    totalCallers: number;
    waitingCallers: number;
    activeCaller: Caller | null;
    averageWaitTime: number;
  }> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const waitingCallers = session.callers.filter((c) => c.status === 'waiting');
    const averageWaitTime =
      waitingCallers.length > 0
        ? waitingCallers.reduce((sum, c) => sum + c.waitTime, 0) / waitingCallers.length
        : 0;

    return {
      totalCallers: session.callers.length,
      waitingCallers: waitingCallers.length,
      activeCaller: session.activeCaller || null,
      averageWaitTime,
    };
  }

  /**
   * End call session
   */
  async endSession(sessionId: string): Promise<CallSession> {
    const session = this.callSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.endedAt = new Date();
    return session;
  }
}

export const liveCallInService = new LiveCallInService();
