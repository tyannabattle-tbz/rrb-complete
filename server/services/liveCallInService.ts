import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";

export interface CallInSession {
  id: string;
  podcastId: string;
  callerId: string;
  callerName: string;
  callerPhone: string;
  status: "waiting" | "connected" | "speaking" | "ended";
  startTime: number;
  endTime?: number;
  audioUrl?: string;
  transcript?: string;
  duration?: number;
}

export interface CallInQueue {
  sessionId: string;
  position: number;
  waitTime: number;
  callerName: string;
  topic: string;
}

export class LiveCallInService {
  private activeCalls = new Map<string, CallInSession>();
  private callQueue: CallInQueue[] = [];
  private maxConcurrentCalls = 3;

  async initializeCallInSession(podcastId: string): Promise<string> {
    const sessionId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[CallIn] Initialized session: ${sessionId} for podcast: ${podcastId}`);
    
    return sessionId;
  }

  async requestCallIn(
    sessionId: string,
    callerName: string,
    callerPhone: string,
    topic: string
  ): Promise<CallInQueue> {
    const position = this.callQueue.length + 1;
    const waitTime = position * 5 * 60 * 1000; // 5 min per caller

    const queueItem: CallInQueue = {
      sessionId,
      position,
      waitTime,
      callerName,
      topic,
    };

    this.callQueue.push(queueItem);

    console.log(`[CallIn] Added to queue: ${callerName} (Position: ${position})`);

    return queueItem;
  }

  async connectCaller(sessionId: string): Promise<CallInSession | null> {
    if (this.activeCalls.size >= this.maxConcurrentCalls) {
      console.log(`[CallIn] Max concurrent calls reached (${this.maxConcurrentCalls})`);
      return null;
    }

    const queueIndex = this.callQueue.findIndex((q) => q.sessionId === sessionId);
    if (queueIndex === -1) return null;

    const queueItem = this.callQueue.splice(queueIndex, 1)[0];

    const session: CallInSession = {
      id: sessionId,
      podcastId: queueItem.sessionId,
      callerId: `caller-${Date.now()}`,
      callerName: queueItem.callerName,
      callerPhone: queueItem.callerPhone,
      status: "connected",
      startTime: Date.now(),
    };

    this.activeCalls.set(sessionId, session);

    console.log(`[CallIn] Connected caller: ${queueItem.callerName}`);

    return session;
  }

  async endCall(sessionId: string): Promise<CallInSession | null> {
    const session = this.activeCalls.get(sessionId);
    if (!session) return null;

    session.status = "ended";
    session.endTime = Date.now();
    session.duration = (session.endTime - session.startTime) / 1000; // seconds

    this.activeCalls.delete(sessionId);

    console.log(`[CallIn] Ended call: ${session.callerName} (Duration: ${session.duration}s)`);

    return session;
  }

  async transcribeCallAudio(sessionId: string, audioUrl: string): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a podcast transcription assistant. Transcribe the call-in audio accurately.",
          },
          {
            role: "user",
            content: [
              {
                type: "file_url",
                file_url: {
                  url: audioUrl,
                  mime_type: "audio/mp3",
                },
              },
            ],
          },
        ],
      });

      const transcript =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";

      const session = this.activeCalls.get(sessionId);
      if (session) {
        session.transcript = transcript;
      }

      console.log(`[CallIn] Transcribed call: ${sessionId}`);

      return transcript;
    } catch (error) {
      console.error(`[CallIn] Transcription failed for ${sessionId}:`, error);
      throw error;
    }
  }

  async moderateCall(sessionId: string, action: "mute" | "unmute" | "disconnect"): Promise<boolean> {
    const session = this.activeCalls.get(sessionId);
    if (!session) return false;

    if (action === "disconnect") {
      await this.endCall(sessionId);
    }

    console.log(`[CallIn] Moderator action: ${action} on ${session.callerName}`);

    return true;
  }

  getActiveCallCount(): number {
    return this.activeCalls.size;
  }

  getQueueLength(): number {
    return this.callQueue.length;
  }

  getQueueStatus(): CallInQueue[] {
    return this.callQueue;
  }

  getActiveCallSessions(): CallInSession[] {
    return Array.from(this.activeCalls.values());
  }
}

export const liveCallInService = new LiveCallInService();
