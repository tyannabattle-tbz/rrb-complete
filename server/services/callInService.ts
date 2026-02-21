import { invokeLLM } from '../_core/llm';

export interface CallInSession {
  id: string;
  channelId: string;
  showId: string;
  callerId: string;
  callerName: string;
  callerEmail: string;
  status: 'waiting' | 'connected' | 'ended';
  startTime: number;
  endTime?: number;
  duration?: number;
  recordingUrl?: string;
  topic: string;
  notes?: string;
}

export interface CallInRequest {
  channelId: string;
  showId: string;
  callerName: string;
  callerEmail: string;
  topic: string;
}

class CallInService {
  private activeCalls: Map<string, CallInSession> = new Map();
  private callQueue: CallInSession[] = [];
  private callHistory: CallInSession[] = [];

  // Create a new call-in request
  createCallInRequest(request: CallInRequest): CallInSession {
    const session: CallInSession = {
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channelId: request.channelId,
      showId: request.showId,
      callerId: `caller-${Date.now()}`,
      callerName: request.callerName,
      callerEmail: request.callerEmail,
      status: 'waiting',
      startTime: Date.now(),
      topic: request.topic,
    };

    this.callQueue.push(session);
    return session;
  }

  // Get waiting calls
  getWaitingCalls(showId: string): CallInSession[] {
    return this.callQueue.filter(call => call.showId === showId && call.status === 'waiting');
  }

  // Connect a caller
  connectCaller(callId: string): CallInSession | undefined {
    const call = this.callQueue.find(c => c.id === callId);
    if (call) {
      call.status = 'connected';
      call.startTime = Date.now();
      this.activeCalls.set(callId, call);
      this.callQueue = this.callQueue.filter(c => c.id !== callId);
      return call;
    }
    return undefined;
  }

  // End a call
  endCall(callId: string, recordingUrl?: string): CallInSession | undefined {
    const call = this.activeCalls.get(callId);
    if (call) {
      call.status = 'ended';
      call.endTime = Date.now();
      call.duration = Math.floor((call.endTime - call.startTime) / 1000);
      if (recordingUrl) {
        call.recordingUrl = recordingUrl;
      }
      this.activeCalls.delete(callId);
      this.callHistory.push(call);
      return call;
    }
    return undefined;
  }

  // Get active calls for a show
  getActiveCalls(showId: string): CallInSession[] {
    return Array.from(this.activeCalls.values()).filter(call => call.showId === showId);
  }

  // Get call history for a show
  getCallHistory(showId: string): CallInSession[] {
    return this.callHistory.filter(call => call.showId === showId);
  }

  // Get all call history
  getAllCallHistory(): CallInSession[] {
    return this.callHistory;
  }

  // Reject a call
  rejectCall(callId: string): boolean {
    const index = this.callQueue.findIndex(c => c.id === callId);
    if (index !== -1) {
      this.callQueue.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get call by ID
  getCall(callId: string): CallInSession | undefined {
    return this.activeCalls.get(callId) || this.callQueue.find(c => c.id === callId) || this.callHistory.find(c => c.id === callId);
  }
}

// Export singleton instance
export const callInService = new CallInService();
