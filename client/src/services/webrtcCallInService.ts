/**
 * WebRTC Call-In Service
 * Manages WebRTC connections for live call-in features
 */

export type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended' | 'error';

export interface CallInConfig {
  phoneNumber: string;
  broadcastUrl: string;
  maxConcurrentCalls: number;
  callTimeoutSeconds: number;
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  status: CallStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  peerConnection?: RTCPeerConnection;
  audioStream?: MediaStream;
}

export interface CallQueue {
  waiting: CallSession[];
  active: CallSession | null;
  history: CallSession[];
}

class WebRTCCallInService {
  private config: CallInConfig;
  private callQueue: CallQueue;
  private peerConnections: Map<string, RTCPeerConnection>;
  private audioContext: AudioContext | null = null;
  private callListeners: ((queue: CallQueue) => void)[] = [];

  constructor(config: Partial<CallInConfig> = {}) {
    this.config = {
      phoneNumber: config.phoneNumber || '+1-800-RRB-LIVE',
      broadcastUrl: config.broadcastUrl || '',
      maxConcurrentCalls: config.maxConcurrentCalls || 5,
      callTimeoutSeconds: config.callTimeoutSeconds || 3600,
    };

    this.callQueue = {
      waiting: [],
      active: null,
      history: [],
    };

    this.peerConnections = new Map();
  }

  /**
   * Initialize audio context for call mixing
   */
  async initializeAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Create a new call session
   */
  createCallSession(callerId: string, callerName: string): CallSession {
    return {
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callerId,
      callerName,
      status: 'idle',
    };
  }

  /**
   * Add a call to the queue
   */
  addCallToQueue(session: CallSession): void {
    if (this.callQueue.waiting.length < this.config.maxConcurrentCalls) {
      session.status = 'ringing';
      this.callQueue.waiting.push(session);
      this.notifyListeners();
    }
  }

  /**
   * Accept the next call in queue
   */
  async acceptNextCall(): Promise<CallSession | null> {
    if (this.callQueue.waiting.length === 0) {
      return null;
    }

    // End current active call if exists
    if (this.callQueue.active) {
      await this.endCall(this.callQueue.active.id);
    }

    const nextCall = this.callQueue.waiting.shift();
    if (nextCall) {
      nextCall.status = 'connected';
      nextCall.startTime = Date.now();
      this.callQueue.active = nextCall;
      this.notifyListeners();
      return nextCall;
    }

    return null;
  }

  /**
   * Reject a call
   */
  rejectCall(callId: string): void {
    const callIndex = this.callQueue.waiting.findIndex(c => c.id === callId);
    if (callIndex !== -1) {
      const call = this.callQueue.waiting.splice(callIndex, 1)[0];
      call.status = 'ended';
      call.endTime = Date.now();
      this.callQueue.history.push(call);
      this.notifyListeners();
    }
  }

  /**
   * End an active call
   */
  async endCall(callId: string): Promise<void> {
    if (this.callQueue.active?.id === callId) {
      const call = this.callQueue.active;
      call.status = 'ended';
      call.endTime = Date.now();
      call.duration = call.endTime - (call.startTime || 0);

      // Close peer connection
      const peerConnection = this.peerConnections.get(callId);
      if (peerConnection) {
        peerConnection.close();
        this.peerConnections.delete(callId);
      }

      // Stop audio stream
      if (call.audioStream) {
        call.audioStream.getTracks().forEach(track => track.stop());
      }

      this.callQueue.history.push(call);
      this.callQueue.active = null;
      this.notifyListeners();
    }
  }

  /**
   * Create WebRTC peer connection for a call
   */
  async createPeerConnection(callId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };

    this.peerConnections.set(callId, peerConnection);
    return peerConnection;
  }

  /**
   * Get call queue status
   */
  getQueueStatus(): CallQueue {
    return {
      ...this.callQueue,
      waiting: [...this.callQueue.waiting],
      history: [...this.callQueue.history],
    };
  }

  /**
   * Get phone number for call-in
   */
  getPhoneNumber(): string {
    return this.config.phoneNumber;
  }

  /**
   * Register listener for queue changes
   */
  onQueueChange(listener: (queue: CallQueue) => void): () => void {
    this.callListeners.push(listener);
    return () => {
      this.callListeners = this.callListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    const queue = this.getQueueStatus();
    this.callListeners.forEach(listener => listener(queue));
  }

  /**
   * Clear all calls (for cleanup)
   */
  async clearAll(): Promise<void> {
    // Close all peer connections
    for (const [callId, peerConnection] of this.peerConnections) {
      peerConnection.close();
    }
    this.peerConnections.clear();

    // Clear call queue
    this.callQueue = {
      waiting: [],
      active: null,
      history: [],
    };

    this.notifyListeners();
  }
}

// Export singleton instance
export const webrtcCallInService = new WebRTCCallInService({
  phoneNumber: '+1-800-RRB-LIVE',
  maxConcurrentCalls: 5,
  callTimeoutSeconds: 3600,
});
