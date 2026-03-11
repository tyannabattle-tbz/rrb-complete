/**
 * WebRTC Signaling Service for Podcast Call-In
 * 
 * Extends the existing WebSocket infrastructure to handle WebRTC
 * signaling (SDP offer/answer, ICE candidate exchange) for the
 * podcast call-in system. Manages peer connections between callers
 * and podcast hosts.
 * 
 * A Canryn Production
 */
import { getWebSocketManager } from '../websocket';

// ─── Types ───────────────────────────────────────────────
interface SignalingMessage {
  type: 'webrtc:offer' | 'webrtc:answer' | 'webrtc:ice-candidate' | 'webrtc:join-room' | 'webrtc:leave-room' | 'webrtc:mute' | 'webrtc:unmute';
  roomId: string;       // podcast show slug
  peerId: string;       // unique peer identifier
  callInId?: number;    // database call-in queue ID
  targetPeerId?: string; // for directed messages
  payload?: any;        // SDP or ICE candidate data
}

interface PeerInfo {
  peerId: string;
  callInId?: number;
  role: 'host' | 'caller';
  ws: any; // WebSocket reference
  joinedAt: number;
  isMuted: boolean;
}

interface Room {
  id: string;
  showSlug: string;
  host: PeerInfo | null;
  callers: Map<string, PeerInfo>;
  createdAt: number;
}

// ─── Room Manager ────────────────────────────────────────
class WebRTCSignalingManager {
  private rooms: Map<string, Room> = new Map();
  private peerToRoom: Map<string, string> = new Map(); // peerId -> roomId

  // ICE servers configuration
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  // ─── Handle Signaling Message ──────────────────────────
  handleMessage(ws: any, message: SignalingMessage): void {
    switch (message.type) {
      case 'webrtc:join-room':
        this.handleJoinRoom(ws, message);
        break;
      case 'webrtc:leave-room':
        this.handleLeaveRoom(message.peerId);
        break;
      case 'webrtc:offer':
        this.relayMessage(message);
        break;
      case 'webrtc:answer':
        this.relayMessage(message);
        break;
      case 'webrtc:ice-candidate':
        this.relayMessage(message);
        break;
      case 'webrtc:mute':
      case 'webrtc:unmute':
        this.handleMuteToggle(message);
        break;
      default:
        console.warn('[WebRTC Signaling] Unknown message type:', (message as any).type);
    }
  }

  // ─── Join Room ─────────────────────────────────────────
  private handleJoinRoom(ws: any, message: SignalingMessage): void {
    const { roomId, peerId, callInId, payload } = message;
    const role = payload?.role || 'caller';

    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        showSlug: roomId,
        host: null,
        callers: new Map(),
        createdAt: Date.now(),
      });
      console.log(`[WebRTC Signaling] Room created: ${roomId}`);
    }

    const room = this.rooms.get(roomId)!;
    const peerInfo: PeerInfo = {
      peerId,
      callInId,
      role,
      ws,
      joinedAt: Date.now(),
      isMuted: role === 'caller', // Callers start muted
    };

    if (role === 'host') {
      room.host = peerInfo;
      console.log(`[WebRTC Signaling] Host joined room ${roomId}: ${peerId}`);
    } else {
      room.callers.set(peerId, peerInfo);
      console.log(`[WebRTC Signaling] Caller joined room ${roomId}: ${peerId} (callInId: ${callInId})`);
    }

    this.peerToRoom.set(peerId, roomId);

    // Send room info back to the joining peer
    this.sendToPeer(ws, {
      type: 'webrtc:room-joined',
      roomId,
      peerId,
      iceServers: this.iceServers,
      peers: this.getRoomPeers(roomId, peerId),
    });

    // Notify other peers in the room
    this.broadcastToRoom(roomId, {
      type: 'webrtc:peer-joined',
      roomId,
      peerId,
      role,
      callInId,
    }, peerId);
  }

  // ─── Leave Room ────────────────────────────────────────
  handleLeaveRoom(peerId: string): void {
    const roomId = this.peerToRoom.get(peerId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.host?.peerId === peerId) {
      room.host = null;
      console.log(`[WebRTC Signaling] Host left room ${roomId}`);
    } else {
      room.callers.delete(peerId);
      console.log(`[WebRTC Signaling] Caller left room ${roomId}: ${peerId}`);
    }

    this.peerToRoom.delete(peerId);

    // Notify remaining peers
    this.broadcastToRoom(roomId, {
      type: 'webrtc:peer-left',
      roomId,
      peerId,
    });

    // Clean up empty rooms
    if (!room.host && room.callers.size === 0) {
      this.rooms.delete(roomId);
      console.log(`[WebRTC Signaling] Room destroyed: ${roomId}`);
    }
  }

  // ─── Relay SDP/ICE Messages ────────────────────────────
  private relayMessage(message: SignalingMessage): void {
    const { roomId, peerId, targetPeerId, payload } = message;
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (targetPeerId) {
      // Directed message to specific peer
      const targetPeer = room.host?.peerId === targetPeerId
        ? room.host
        : room.callers.get(targetPeerId);

      if (targetPeer) {
        this.sendToPeer(targetPeer.ws, {
          type: message.type,
          roomId,
          peerId, // sender
          payload,
        });
      }
    } else {
      // Broadcast to all other peers in room
      this.broadcastToRoom(roomId, {
        type: message.type,
        roomId,
        peerId,
        payload,
      }, peerId);
    }
  }

  // ─── Mute/Unmute ───────────────────────────────────────
  private handleMuteToggle(message: SignalingMessage): void {
    const { roomId, peerId, type } = message;
    const room = this.rooms.get(roomId);
    if (!room) return;

    const isMuted = type === 'webrtc:mute';
    const peer = room.host?.peerId === peerId ? room.host : room.callers.get(peerId);
    if (peer) {
      peer.isMuted = isMuted;
    }

    // Notify all peers
    this.broadcastToRoom(roomId, {
      type: isMuted ? 'webrtc:peer-muted' : 'webrtc:peer-unmuted',
      roomId,
      peerId,
    });
  }

  // ─── Helpers ───────────────────────────────────────────
  private getRoomPeers(roomId: string, excludePeerId?: string): Array<{ peerId: string; role: string; isMuted: boolean }> {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const peers: Array<{ peerId: string; role: string; isMuted: boolean }> = [];
    if (room.host && room.host.peerId !== excludePeerId) {
      peers.push({ peerId: room.host.peerId, role: 'host', isMuted: room.host.isMuted });
    }
    for (const [id, caller] of room.callers) {
      if (id !== excludePeerId) {
        peers.push({ peerId: caller.peerId, role: 'caller', isMuted: caller.isMuted });
      }
    }
    return peers;
  }

  private sendToPeer(ws: any, data: any): void {
    try {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(data));
      }
    } catch (err) {
      console.error('[WebRTC Signaling] Failed to send to peer:', err);
    }
  }

  private broadcastToRoom(roomId: string, data: any, excludePeerId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.host && room.host.peerId !== excludePeerId) {
      this.sendToPeer(room.host.ws, data);
    }
    for (const [id, caller] of room.callers) {
      if (id !== excludePeerId) {
        this.sendToPeer(caller.ws, data);
      }
    }
  }

  // ─── Status ────────────────────────────────────────────
  getStatus() {
    return {
      activeRooms: this.rooms.size,
      totalPeers: this.peerToRoom.size,
      rooms: Array.from(this.rooms.entries()).map(([id, room]) => ({
        id,
        hasHost: !!room.host,
        callerCount: room.callers.size,
        createdAt: room.createdAt,
      })),
    };
  }

  // ─── Cleanup disconnected peer ─────────────────────────
  handleDisconnect(ws: any): void {
    // Find the peer associated with this WebSocket
    for (const [peerId, roomId] of this.peerToRoom) {
      const room = this.rooms.get(roomId);
      if (!room) continue;

      if (room.host?.ws === ws) {
        this.handleLeaveRoom(peerId);
        return;
      }

      const caller = room.callers.get(peerId);
      if (caller?.ws === ws) {
        this.handleLeaveRoom(peerId);
        return;
      }
    }
  }
}

// ─── Singleton ───────────────────────────────────────────
let signalingManager: WebRTCSignalingManager | null = null;

export function getSignalingManager(): WebRTCSignalingManager {
  if (!signalingManager) {
    signalingManager = new WebRTCSignalingManager();
  }
  return signalingManager;
}

export function initializeWebRTCSignaling(): WebRTCSignalingManager {
  signalingManager = new WebRTCSignalingManager();
  console.log('[WebRTC Signaling] Manager initialized');
  return signalingManager;
}
