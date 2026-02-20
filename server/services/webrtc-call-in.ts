/**
 * WebRTC Call-In Service
 * 
 * Manages live radio call-in sessions, queue management, and WebRTC signaling.
 * Handles real-time listener participation with audio quality control.
 * 
 * A Canryn Production
 */

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  channelId: string;
  status: 'pending' | 'active' | 'ended';
  topic?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  audioQuality: 'low' | 'medium' | 'high';
  transcript?: string;
}

export interface CallQueue {
  channelId: string;
  waitingCalls: CallSession[];
  activeCalls: CallSession[];
  totalWaiting: number;
  totalActive: number;
  averageWaitTime: number;
}

export interface CallStats {
  channelId: string;
  totalCalls: number;
  totalActive: number;
  totalWaiting: number;
  averageCallDuration: number;
  averageWaitTime: number;
  peakHour: string;
}

// In-memory storage
const callSessions = new Map<string, CallSession>();
const channelQueues = new Map<string, CallQueue>();

export function initiateCall(
  callerId: string,
  callerName: string,
  channelId: string,
  topic?: string
): CallSession {
  const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const session: CallSession = {
    id: callId,
    callerId,
    callerName,
    channelId,
    status: 'pending',
    topic,
    startTime: new Date(),
    audioQuality: 'medium',
  };

  callSessions.set(callId, session);
  
  // Add to queue
  if (!channelQueues.has(channelId)) {
    channelQueues.set(channelId, {
      channelId,
      waitingCalls: [],
      activeCalls: [],
      totalWaiting: 0,
      totalActive: 0,
      averageWaitTime: 0,
    });
  }

  const queue = channelQueues.get(channelId)!;
  queue.waitingCalls.push(session);
  queue.totalWaiting = queue.waitingCalls.length;

  return session;
}

export function acceptCall(callId: string): CallSession | null {
  const session = callSessions.get(callId);
  if (!session) return null;

  session.status = 'active';
  session.startTime = new Date();

  // Move from waiting to active
  const queue = channelQueues.get(session.channelId);
  if (queue) {
    queue.waitingCalls = queue.waitingCalls.filter(c => c.id !== callId);
    queue.activeCalls.push(session);
    queue.totalWaiting = queue.waitingCalls.length;
    queue.totalActive = queue.activeCalls.length;
  }

  return session;
}

export function endCall(callId: string): CallSession | null {
  const session = callSessions.get(callId);
  if (!session) return null;

  session.status = 'ended';
  session.endTime = new Date();
  session.duration = Math.floor(
    (session.endTime.getTime() - session.startTime.getTime()) / 1000
  );

  // Remove from queue
  const queue = channelQueues.get(session.channelId);
  if (queue) {
    queue.activeCalls = queue.activeCalls.filter(c => c.id !== callId);
    queue.waitingCalls = queue.waitingCalls.filter(c => c.id !== callId);
    queue.totalWaiting = queue.waitingCalls.length;
    queue.totalActive = queue.activeCalls.length;
  }

  return session;
}

export function getCallQueue(channelId: string): CallQueue | null {
  return channelQueues.get(channelId) || null;
}

export function getCallSession(callId: string): CallSession | null {
  return callSessions.get(callId) || null;
}

export function updateAudioQuality(
  callId: string,
  quality: 'low' | 'medium' | 'high'
): CallSession | null {
  const session = callSessions.get(callId);
  if (!session) return null;

  session.audioQuality = quality;
  return session;
}

export function addTranscript(callId: string, transcript: string): CallSession | null {
  const session = callSessions.get(callId);
  if (!session) return null;

  session.transcript = transcript;
  return session;
}

export function getChannelCallStats(channelId: string): CallStats {
  const queue = channelQueues.get(channelId);
  const allCalls = Array.from(callSessions.values()).filter(
    c => c.channelId === channelId
  );

  const activeCalls = allCalls.filter(c => c.status === 'active');
  const waitingCalls = allCalls.filter(c => c.status === 'pending');
  const completedCalls = allCalls.filter(c => c.status === 'ended');

  const avgDuration = completedCalls.length > 0
    ? completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / completedCalls.length
    : 0;

  const avgWaitTime = waitingCalls.length > 0
    ? waitingCalls.reduce((sum, c) => {
        const now = new Date();
        return sum + (now.getTime() - c.startTime.getTime());
      }, 0) / waitingCalls.length / 1000 / 60
    : 0;

  return {
    channelId,
    totalCalls: allCalls.length,
    totalActive: activeCalls.length,
    totalWaiting: waitingCalls.length,
    averageCallDuration: Math.round(avgDuration),
    averageWaitTime: Math.round(avgWaitTime),
    peakHour: new Date().toLocaleTimeString(),
  };
}
