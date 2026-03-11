/**
 * CallInSystem — WebRTC-based call-in system for live podcast participation.
 * 
 * Provides:
 * - Caller queue management (join, hold, on-air, disconnect)
 * - WebRTC peer connection for real-time audio
 * - Host controls (accept, reject, mute, unmute, end call)
 * - Audience view with queue position
 * - QUMUS autonomous queue management
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import {
  Phone, PhoneOff, PhoneIncoming, PhoneOutgoing, Mic, MicOff,
  Volume2, VolumeX, Users, Clock, Radio, X, Check, AlertCircle,
  Loader2, ChevronUp, ChevronDown, Headphones, Signal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface CallInSystemProps {
  showId: number;
  showSlug: string;
  isHost?: boolean;
  accentColor?: string;
  onCallerOnAir?: (callerName: string) => void;
  onCallerDisconnect?: () => void;
}

type CallStatus = 'idle' | 'requesting' | 'queued' | 'connecting' | 'on-air' | 'on-hold' | 'ended';

// ─── WebRTC Audio Manager ─────────────────────────────────
class WebRTCAudioManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private onStateChange: (state: string) => void;

  constructor(onStateChange: (state: string) => void) {
    this.onStateChange = onStateChange;
  }

  async initializeLocalAudio(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video: false,
      });
      return this.localStream;
    } catch (err) {
      throw new Error('Microphone access denied. Please allow microphone access to call in.');
    }
  }

  async createPeerConnection(iceServers?: RTCIceServer[]): Promise<RTCPeerConnection> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Add local audio tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Handle remote audio
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteAudio) {
        this.remoteAudio = new Audio();
        this.remoteAudio.autoplay = true;
      }
      this.remoteAudio.srcObject = event.streams[0];
      this.onStateChange('connected');
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      this.onStateChange(this.peerConnection?.iceConnectionState || 'unknown');
    };

    return this.peerConnection;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('No peer connection');
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('No peer connection');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('No peer connection');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  addIceCandidate(candidate: RTCIceCandidateInit): void {
    this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
  }

  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // returns true if muted
      }
    }
    return false;
  }

  setMuted(muted: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
      }
    }
  }

  disconnect(): void {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnection?.close();
    if (this.remoteAudio) {
      this.remoteAudio.srcObject = null;
    }
    this.localStream = null;
    this.peerConnection = null;
    this.remoteAudio = null;
  }
}

// ─── Caller View (Audience) ──────────────────────────────
function CallerView({ showId, showSlug, accentColor }: { showId: number; showSlug: string; accentColor: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [muted, setMuted] = useState(false);
  const [callerName, setCallerName] = useState(user?.name || '');
  const [topic, setTopic] = useState('');
  const [queuePosition, setQueuePosition] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const audioManagerRef = useRef<WebRTCAudioManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peerIdRef = useRef<string>(`caller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const joinQueue = trpc.podcastManagement.joinCallInQueue.useMutation({
    onSuccess: (data) => {
      setQueuePosition(data.position);
      setCallStatus('queued');
      toast({ title: 'In Queue', description: `You're #${data.position} in line. Please wait...` });
    },
    onError: (err) => {
      setCallStatus('idle');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const leaveQueue = trpc.podcastManagement.leaveCallInQueue.useMutation({
    onSuccess: () => {
      setCallStatus('idle');
      toast({ title: 'Left Queue', description: 'You have left the call-in queue' });
    },
  });

  // Poll queue status when queued
  const { data: queueStatus } = trpc.podcastManagement.getCallInQueue.useQuery(
    { showId },
    { 
      enabled: callStatus === 'queued' || callStatus === 'on-hold',
      refetchInterval: 3000,
    }
  );

  useEffect(() => {
    if (queueStatus && user) {
      const myEntry = queueStatus.queue?.find((q: any) => q.callerName === callerName);
      if (myEntry) {
        if (myEntry.status === 'on-air' && callStatus !== 'on-air') {
          setCallStatus('on-air');
          // Start call duration timer
          timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
          toast({ title: 'You\'re ON AIR!', description: 'You are now live on the podcast' });
        } else if (myEntry.status === 'on-hold' && callStatus !== 'on-hold') {
          setCallStatus('on-hold');
          toast({ title: 'On Hold', description: 'The host has put you on hold' });
        }
        setQueuePosition(myEntry.position || 0);
      }
    }
  }, [queueStatus, callStatus, callerName, user]);

  const handleCallIn = async () => {
    if (!callerName.trim()) {
      toast({ title: 'Name Required', description: 'Please enter your name', variant: 'destructive' });
      return;
    }

    setCallStatus('requesting');

    try {
      // Initialize WebRTC audio
      audioManagerRef.current = new WebRTCAudioManager((state) => {
        console.log('[CallIn] WebRTC state:', state);
      });
      await audioManagerRef.current.initializeLocalAudio();

      // Connect to WebSocket signaling server
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[CallIn] WebSocket connected, joining signaling room');
        ws.send(JSON.stringify({
          type: 'webrtc:join-room',
          roomId: showSlug,
          peerId: peerIdRef.current,
          payload: { role: 'caller' },
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'webrtc:room-joined') {
            // Create peer connection with provided ICE servers
            const pc = await audioManagerRef.current!.createPeerConnection(msg.iceServers);
            // Set up ICE candidate forwarding
            pc.onicecandidate = (e) => {
              if (e.candidate && wsRef.current?.readyState === 1) {
                wsRef.current.send(JSON.stringify({
                  type: 'webrtc:ice-candidate',
                  roomId: showSlug,
                  peerId: peerIdRef.current,
                  payload: e.candidate.toJSON(),
                }));
              }
            };
            // Create and send offer to host
            const offer = await audioManagerRef.current!.createOffer();
            ws.send(JSON.stringify({
              type: 'webrtc:offer',
              roomId: showSlug,
              peerId: peerIdRef.current,
              payload: offer,
            }));
          } else if (msg.type === 'webrtc:answer') {
            await audioManagerRef.current?.handleAnswer(msg.payload);
          } else if (msg.type === 'webrtc:ice-candidate') {
            audioManagerRef.current?.addIceCandidate(msg.payload);
          } else if (msg.type === 'webrtc:peer-muted' || msg.type === 'webrtc:peer-unmuted') {
            console.log(`[CallIn] Peer ${msg.peerId} ${msg.type === 'webrtc:peer-muted' ? 'muted' : 'unmuted'}`);
          }
        } catch (err) {
          console.error('[CallIn] Signaling message error:', err);
        }
      };

      ws.onerror = (err) => console.error('[CallIn] WebSocket error:', err);
      ws.onclose = () => console.log('[CallIn] WebSocket disconnected');

      // Join the queue
      joinQueue.mutate({
        showId,
        callerName: callerName.trim(),
        topic: topic.trim() || undefined,
      });
    } catch (err: any) {
      setCallStatus('idle');
      toast({ title: 'Microphone Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleHangUp = () => {
    audioManagerRef.current?.disconnect();
    // Leave signaling room
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type: 'webrtc:leave-room',
        roomId: showSlug,
        peerId: peerIdRef.current,
      }));
      wsRef.current.close();
    }
    wsRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setCallDuration(0);
    
    if (callStatus === 'queued' || callStatus === 'on-hold') {
      leaveQueue.mutate({ showId, callerName });
    }
    setCallStatus('idle');
  };

  const handleToggleMute = () => {
    const isMuted = audioManagerRef.current?.toggleMute() ?? false;
    setMuted(isMuted);
    // Notify peers via signaling
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type: isMuted ? 'webrtc:mute' : 'webrtc:unmute',
        roomId: showSlug,
        peerId: peerIdRef.current,
      }));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioManagerRef.current?.disconnect();
      if (wsRef.current?.readyState === 1) {
        wsRef.current.close();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {callStatus === 'idle' && (
        <>
          <div className="text-center py-3">
            <Phone className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="text-white/60 text-xs">Call in to join the live show</p>
          </div>
          <Input
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
            placeholder="Your name..."
            className="bg-zinc-800 border-zinc-700 text-white text-xs"
          />
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What would you like to discuss? (optional)"
            className="bg-zinc-800 border-zinc-700 text-white text-xs"
          />
          <Button
            onClick={handleCallIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Phone className="w-4 h-4 mr-2" /> Call In
          </Button>
        </>
      )}

      {callStatus === 'requesting' && (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white/40" />
          <p className="text-white/60 text-xs">Requesting microphone access...</p>
        </div>
      )}

      {callStatus === 'queued' && (
        <div className="text-center py-4 space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-yellow-500/50 flex items-center justify-center mx-auto animate-pulse">
              <PhoneIncoming className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <p className="text-white font-medium text-sm">In Queue</p>
            <p className="text-white/40 text-xs">Position: #{queuePosition}</p>
            <p className="text-white/30 text-[10px] mt-1">Waiting for host to accept...</p>
          </div>
          <Button onClick={handleHangUp} variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
            <PhoneOff className="w-3.5 h-3.5 mr-1.5" /> Leave Queue
          </Button>
        </div>
      )}

      {callStatus === 'on-hold' && (
        <div className="text-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-full border-2 border-orange-500/50 flex items-center justify-center mx-auto">
            <Headphones className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">On Hold</p>
            <p className="text-white/40 text-xs">The host will bring you on air shortly</p>
          </div>
          <Button onClick={handleHangUp} variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/20">
            <PhoneOff className="w-3.5 h-3.5 mr-1.5" /> Hang Up
          </Button>
        </div>
      )}

      {callStatus === 'on-air' && (
        <div className="text-center py-4 space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <Badge className="absolute -top-1 -right-4 bg-red-600 text-white text-[9px] animate-pulse">
              LIVE
            </Badge>
          </div>
          <div>
            <p className="text-white font-medium text-sm">You're ON AIR!</p>
            <p className="text-red-400 text-xs font-mono">{formatTime(callDuration)}</p>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              onClick={handleToggleMute}
              variant="outline"
              size="sm"
              className={muted ? 'border-red-700 text-red-400' : 'border-zinc-700 text-white'}
            >
              {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </Button>
            <Button onClick={handleHangUp} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <PhoneOff className="w-3.5 h-3.5 mr-1.5" /> End Call
            </Button>
          </div>
        </div>
      )}

      {callStatus === 'ended' && (
        <div className="text-center py-4 space-y-3">
          <Check className="w-8 h-8 text-green-400 mx-auto" />
          <p className="text-white/60 text-xs">Thanks for calling in!</p>
          <Button onClick={() => setCallStatus('idle')} variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
            Call Again
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Host Controls (Queue Management) ────────────────────
function HostControls({ showId, showSlug, onCallerOnAir, onCallerDisconnect }: {
  showId: number;
  showSlug: string;
  onCallerOnAir?: (name: string) => void;
  onCallerDisconnect?: () => void;
}) {
  const { toast } = useToast();

  const { data: queueData, refetch } = trpc.podcastManagement.getCallInQueue.useQuery(
    { showId },
    { refetchInterval: 2000 }
  );

  const updateCaller = trpc.podcastManagement.updateCallerStatus.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Updated', description: data.message });
      refetch();
      if (data.status === 'on-air') {
        onCallerOnAir?.(data.callerName);
      } else if (data.status === 'disconnected') {
        onCallerDisconnect?.();
      }
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const queue = queueData?.queue ?? [];
  const waitingCallers = queue.filter((q: any) => q.status === 'waiting');
  const onAirCaller = queue.find((q: any) => q.status === 'on-air');
  const onHoldCallers = queue.filter((q: any) => q.status === 'on-hold');

  const statusColors: Record<string, string> = {
    waiting: 'border-yellow-700 text-yellow-400',
    'on-air': 'border-red-700 text-red-400',
    'on-hold': 'border-orange-700 text-orange-400',
    disconnected: 'border-zinc-700 text-zinc-500',
  };

  return (
    <div className="space-y-3">
      {/* On-Air Caller */}
      {onAirCaller && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="text-white text-xs font-medium">ON AIR</span>
            </div>
            <Badge className="bg-red-600 text-white text-[9px]">LIVE</Badge>
          </div>
          <p className="text-white text-sm font-medium">{onAirCaller.callerName}</p>
          {onAirCaller.topic && <p className="text-white/40 text-[10px] mt-0.5">{onAirCaller.topic}</p>}
          <div className="flex gap-1.5 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateCaller.mutate({ showId, callerId: onAirCaller.id, status: 'on-hold' })}
              className="border-orange-700 text-orange-400 hover:bg-orange-900/20 text-[10px] h-6"
            >
              Hold
            </Button>
            <Button
              size="sm"
              onClick={() => updateCaller.mutate({ showId, callerId: onAirCaller.id, status: 'disconnected' })}
              className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-6"
            >
              <PhoneOff className="w-3 h-3 mr-1" /> End
            </Button>
          </div>
        </div>
      )}

      {/* On-Hold Callers */}
      {onHoldCallers.length > 0 && (
        <div>
          <p className="text-white/40 text-[10px] font-medium mb-1.5">ON HOLD ({onHoldCallers.length})</p>
          {onHoldCallers.map((caller: any) => (
            <div key={caller.id} className="flex items-center justify-between p-2 rounded bg-orange-900/10 border border-orange-800/30 mb-1">
              <div>
                <p className="text-white text-xs">{caller.callerName}</p>
                {caller.topic && <p className="text-white/30 text-[10px]">{caller.topic}</p>}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => updateCaller.mutate({ showId, callerId: caller.id, status: 'on-air' })}
                  className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-6"
                >
                  <Phone className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCaller.mutate({ showId, callerId: caller.id, status: 'disconnected' })}
                  className="border-red-700 text-red-400 text-[10px] h-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Waiting Queue */}
      <div>
        <p className="text-white/40 text-[10px] font-medium mb-1.5">
          QUEUE ({waitingCallers.length} waiting)
        </p>
        {waitingCallers.length > 0 ? (
          waitingCallers.map((caller: any, idx: number) => (
            <div key={caller.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-zinc-800/50 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-[10px] font-mono">#{idx + 1}</span>
                <div>
                  <p className="text-white text-xs">{caller.callerName}</p>
                  {caller.topic && <p className="text-white/30 text-[10px]">{caller.topic}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => updateCaller.mutate({ showId, callerId: caller.id, status: 'on-air' })}
                  className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-6"
                >
                  <Phone className="w-3 h-3 mr-0.5" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCaller.mutate({ showId, callerId: caller.id, status: 'on-hold' })}
                  className="border-orange-700 text-orange-400 text-[10px] h-6"
                >
                  Hold
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCaller.mutate({ showId, callerId: caller.id, status: 'disconnected' })}
                  className="border-red-700 text-red-400 text-[10px] h-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-white/20 text-xs">
            <Phone className="w-5 h-5 mx-auto mb-1 opacity-30" />
            No callers waiting
          </div>
        )}
      </div>

      {/* Queue stats */}
      <div className="flex items-center justify-between text-[10px] text-white/30 pt-2 border-t border-zinc-800/50">
        <span>Total today: {queueData?.totalToday ?? 0}</span>
        <span className="flex items-center gap-1">
          <Signal className="w-3 h-3" />
          WebRTC {onAirCaller ? 'Active' : 'Standby'}
        </span>
      </div>
    </div>
  );
}

// ─── Main CallInSystem ────────────────────────────────────
export default function CallInSystem({ showId, showSlug, isHost = false, accentColor = 'text-purple-400', onCallerOnAir, onCallerDisconnect }: CallInSystemProps) {
  return (
    <div className="space-y-2">
      <h3 className={`text-sm font-semibold ${accentColor} flex items-center gap-2`}>
        <Phone className="w-4 h-4" />
        Call-In Line
      </h3>
      {isHost ? (
        <HostControls showId={showId} showSlug={showSlug} onCallerOnAir={onCallerOnAir} onCallerDisconnect={onCallerDisconnect} />
      ) : (
        <CallerView showId={showId} showSlug={showSlug} accentColor={accentColor || 'text-purple-400'} />
      )}
    </div>
  );
}
