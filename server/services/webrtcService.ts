import { randomUUID } from 'crypto';

export interface WebRTCPeer {
  id: string;
  panelistId: string;
  connectionId: string;
  offer?: string;
  answer?: string;
  iceCandidates: string[];
  status: 'connecting' | 'connected' | 'failed' | 'disconnected';
  videoEnabled: boolean;
  audioEnabled: boolean;
  bitrate: number;
  latency: number;
  packetLoss: number;
}

export interface WebRTCSession {
  id: string;
  sessionId: string;
  peers: Map<string, WebRTCPeer>;
  signalingServer: string;
  stunServers: string[];
  turnServers: Array<{ urls: string; username?: string; credential?: string }>;
}

/**
 * WebRTC Service
 * Manages peer-to-peer video connections for panelists
 */
export class WebRTCService {
  private sessions: Map<string, WebRTCSession> = new Map();
  private peerConnections: Map<string, any> = new Map();

  constructor() {
    // Initialize STUN/TURN servers for NAT traversal
    this.initializeServers();
  }

  private initializeServers() {
    console.log('[WebRTC] Initializing STUN/TURN servers for NAT traversal');
  }

  /**
   * Create a new WebRTC session
   */
  async createSession(sessionId: string): Promise<WebRTCSession> {
    const webrtcSessionId = randomUUID();

    const session: WebRTCSession = {
      id: webrtcSessionId,
      sessionId,
      peers: new Map(),
      signalingServer: process.env.SIGNALING_SERVER || 'wss://signaling.example.com',
      stunServers: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
      turnServers: [
        {
          urls: process.env.TURN_SERVER || 'turn:turn.example.com:3478',
          username: process.env.TURN_USERNAME || 'user',
          credential: process.env.TURN_PASSWORD || 'pass',
        },
      ],
    };

    this.sessions.set(webrtcSessionId, session);
    console.log(`[WebRTC] Session created: ${webrtcSessionId}`);

    return session;
  }

  /**
   * Add a peer to the session
   */
  async addPeer(
    webrtcSessionId: string,
    panelistId: string
  ): Promise<WebRTCPeer> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peerId = randomUUID();
    const connectionId = randomUUID();

    const peer: WebRTCPeer = {
      id: peerId,
      panelistId,
      connectionId,
      iceCandidates: [],
      status: 'connecting',
      videoEnabled: true,
      audioEnabled: true,
      bitrate: 0,
      latency: 0,
      packetLoss: 0,
    };

    session.peers.set(peerId, peer);
    console.log(`[WebRTC] Peer added: ${panelistId} (${peerId})`);

    return peer;
  }

  /**
   * Create WebRTC offer
   */
  async createOffer(webrtcSessionId: string, peerId: string): Promise<string> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    // Simulate SDP offer generation
    const offer = JSON.stringify({
      type: 'offer',
      sdp: `v=0
o=- ${Date.now()} 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
a=extmap-allow-mixed
a=msid-semantic: WMS stream
m=audio 9 UDP/TLS/RTP/SAVPF 111 63 103 104 9 0 8 106 105 13 110 112 113 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:${randomUUID().slice(0, 8)}
a=ice-pwd:${randomUUID()}
a=fingerprint:sha-256 ${this.generateFingerprint()}
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102 122 127 121 125 107 108 109 124 120 123 119 114 115 116
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:${randomUUID().slice(0, 8)}
a=ice-pwd:${randomUUID()}
a=fingerprint:sha-256 ${this.generateFingerprint()}
a=setup:actpass
a=mid:1
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:13 urn:3gpp:video-orientation
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli`,
    });

    peer.offer = JSON.stringify(offer);
    console.log(`[WebRTC] Offer created for peer ${peerId}`);

    return JSON.stringify(offer);
  }

  /**
   * Handle WebRTC answer
   */
  async handleAnswer(
    webrtcSessionId: string,
    peerId: string,
    answer: string
  ): Promise<void> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    peer.answer = answer;
    peer.status = 'connected';

    console.log(`[WebRTC] Answer received for peer ${peerId}`);
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(
    webrtcSessionId: string,
    peerId: string,
    candidate: string
  ): Promise<void> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    peer.iceCandidates.push(candidate);
    console.log(`[WebRTC] ICE candidate added for peer ${peerId}`);
  }

  /**
   * Update peer connection stats
   */
  async updateStats(
    webrtcSessionId: string,
    peerId: string,
    stats: {
      bitrate: number;
      latency: number;
      packetLoss: number;
    }
  ): Promise<void> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    peer.bitrate = stats.bitrate;
    peer.latency = stats.latency;
    peer.packetLoss = stats.packetLoss;

    // Log quality issues
    if (stats.packetLoss > 5) {
      console.warn(`[WebRTC] High packet loss for peer ${peerId}: ${stats.packetLoss}%`);
    }
    if (stats.latency > 200) {
      console.warn(`[WebRTC] High latency for peer ${peerId}: ${stats.latency}ms`);
    }
  }

  /**
   * Toggle video for peer
   */
  async toggleVideo(webrtcSessionId: string, peerId: string): Promise<boolean> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    peer.videoEnabled = !peer.videoEnabled;
    console.log(`[WebRTC] Video ${peer.videoEnabled ? 'enabled' : 'disabled'} for peer ${peerId}`);

    return peer.videoEnabled;
  }

  /**
   * Toggle audio for peer
   */
  async toggleAudio(webrtcSessionId: string, peerId: string): Promise<boolean> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    peer.audioEnabled = !peer.audioEnabled;
    console.log(`[WebRTC] Audio ${peer.audioEnabled ? 'enabled' : 'disabled'} for peer ${peerId}`);

    return peer.audioEnabled;
  }

  /**
   * Disconnect peer
   */
  async disconnectPeer(webrtcSessionId: string, peerId: string): Promise<void> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    peer.status = 'disconnected';
    session.peers.delete(peerId);

    console.log(`[WebRTC] Peer disconnected: ${peerId}`);
  }

  /**
   * Get session peers
   */
  async getPeers(webrtcSessionId: string): Promise<WebRTCPeer[]> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    return Array.from(session.peers.values());
  }

  /**
   * Get peer connection stats
   */
  async getPeerStats(webrtcSessionId: string, peerId: string): Promise<{
    bitrate: number;
    latency: number;
    packetLoss: number;
    videoEnabled: boolean;
    audioEnabled: boolean;
    status: string;
  }> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    const peer = session.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    return {
      bitrate: peer.bitrate,
      latency: peer.latency,
      packetLoss: peer.packetLoss,
      videoEnabled: peer.videoEnabled,
      audioEnabled: peer.audioEnabled,
      status: peer.status,
    };
  }

  /**
   * Close WebRTC session
   */
  async closeSession(webrtcSessionId: string): Promise<void> {
    const session = this.sessions.get(webrtcSessionId);
    if (!session) {
      throw new Error('WebRTC session not found');
    }

    // Disconnect all peers
    for (const peerId of session.peers.keys()) {
      await this.disconnectPeer(webrtcSessionId, peerId);
    }

    this.sessions.delete(webrtcSessionId);
    console.log(`[WebRTC] Session closed: ${webrtcSessionId}`);
  }

  private generateFingerprint(): string {
    // Simulate SHA-256 fingerprint
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

export const webrtcService = new WebRTCService();
