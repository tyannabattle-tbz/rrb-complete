import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff,
  Send, MessageSquare, Radio, Users, Clock, AlertCircle,
  ChevronDown, ChevronUp, Volume2, Camera, Monitor,
  ExternalLink, Headphones, Wifi, WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

type CallMode = 'idle' | 'text' | 'voice' | 'video' | 'waiting';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'on-air';

interface CallInMessage {
  id: string;
  name: string;
  message: string;
  type: 'text' | 'voice' | 'video';
  timestamp: Date;
  status: 'queued' | 'on-air' | 'completed';
}

interface LiveCallInProps {
  context: 'radio' | 'podcast';
  showName?: string;
  isLive?: boolean;
}

// External platform URLs — configurable via env vars or set directly here
const CALL_IN_URLS = {
  skype: import.meta.env.VITE_CALLIN_SKYPE_URL || 'https://join.skype.com/invite/rrbshow',
  zoom: import.meta.env.VITE_CALLIN_ZOOM_URL || 'https://zoom.us/j/rrbshow',
  meet: import.meta.env.VITE_CALLIN_MEET_URL || 'https://meet.google.com/rrb-show-live',
  discord: import.meta.env.VITE_CALLIN_DISCORD_URL || 'https://discord.gg/rrbshow',
};

export function LiveCallIn({ context, showName = "Rockin' Rockin' Boogie", isLive = true }: LiveCallInProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [callMode, setCallMode] = useState<CallMode>('idle');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [textMessage, setTextMessage] = useState('');
  const [callerName, setCallerName] = useState(user?.name || '');
  const [callerTopic, setCallerTopic] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [callQueue, setCallQueue] = useState<CallInMessage[]>([
    {
      id: '1',
      name: 'Marcus T.',
      message: "Love the show! Can you play more of Seabrun's early recordings?",
      type: 'text',
      timestamp: new Date(Date.now() - 300000),
      status: 'completed',
    },
    {
      id: '2',
      name: 'Denise W.',
      message: 'First time listener, long time fan of Little Richard. This is amazing!',
      type: 'voice',
      timestamp: new Date(Date.now() - 120000),
      status: 'queued',
    },
  ]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Update caller name when user logs in
  useEffect(() => {
    if (user?.name && !callerName) {
      setCallerName(user.name);
    }
  }, [user?.name, callerName]);

  const startVideoCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallMode('video');
      setConnectionStatus('connecting');

      // Simulate connection delay
      setTimeout(() => {
        setConnectionStatus('connected');
        toast.success('Video connected! You are in the call queue.');
      }, 2000);
    } catch (err) {
      toast.error('Camera/microphone access denied. Please allow permissions and try again.');
      console.error('Media access error:', err);
    }
  }, []);

  const startVoiceCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setCallMode('voice');
      setConnectionStatus('connecting');

      setTimeout(() => {
        setConnectionStatus('connected');
        toast.success('Audio connected! You are in the call queue.');
      }, 1500);
    } catch (err) {
      toast.error('Microphone access denied. Please allow permissions and try again.');
      console.error('Audio access error:', err);
    }
  }, []);

  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const newMsg: CallInMessage = {
          id: Date.now().toString(),
          name: callerName || 'Anonymous',
          message: `Voice message (${recordingTime}s)`,
          type: 'voice',
          timestamp: new Date(),
          status: 'queued',
        };
        setCallQueue(prev => [...prev, newMsg]);
        toast.success('Voice message recorded and queued!');
        setRecordingTime(0);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopVoiceRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      toast.error('Microphone access denied.');
    }
  }, [callerName, recordingTime]);

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const endCall = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setCallMode('idle');
    setConnectionStatus('disconnected');
    setIsMuted(false);
    setIsVideoOn(true);
    toast.info('Call ended.');
  }, []);

  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  }, [isVideoOn]);

  const submitTextCallIn = useCallback(() => {
    if (!textMessage.trim()) return;
    const newMsg: CallInMessage = {
      id: Date.now().toString(),
      name: callerName || 'Anonymous',
      message: textMessage.trim(),
      type: 'text',
      timestamp: new Date(),
      status: 'queued',
    };
    setCallQueue(prev => [...prev, newMsg]);
    setTextMessage('');
    toast.success('Message submitted! Your call-in is in the queue.');
  }, [textMessage, callerName]);

  const statusColor = {
    disconnected: 'text-zinc-400',
    connecting: 'text-yellow-400',
    connected: 'text-green-400',
    'on-air': 'text-red-400',
  };

  const statusLabel = {
    disconnected: 'Offline',
    connecting: 'Connecting...',
    connected: 'In Queue',
    'on-air': 'ON AIR',
  };

  return (
    <Card className="overflow-hidden border-amber-500/30">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-amber-500/10 to-purple-500/10 hover:from-red-500/15 hover:via-amber-500/15 hover:to-purple-500/15 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center relative">
            <Phone className="w-5 h-5 text-white" />
            {isLive && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">
              Call In {context === 'radio' ? 'to the Station' : 'to the Show'}
            </p>
            <p className="text-xs text-foreground/60">
              Voice, video, or text — join the conversation live
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs animate-pulse">
              <Radio className="w-3 h-3 mr-1" /> LIVE
            </Badge>
          )}
          <Badge className="bg-zinc-500/20 text-zinc-300 border-zinc-500/30 text-xs">
            <Users className="w-3 h-3 mr-1" /> {callQueue.filter(c => c.status === 'queued').length} in queue
          </Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-foreground/60" /> : <ChevronDown className="w-4 h-4 text-foreground/60" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {/* Connection Status Bar */}
          <div className="px-4 py-2 bg-zinc-900/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {connectionStatus === 'disconnected' ? (
                <WifiOff className={`w-3 h-3 ${statusColor[connectionStatus]}`} />
              ) : (
                <Wifi className={`w-3 h-3 ${statusColor[connectionStatus]}`} />
              )}
              <span className={statusColor[connectionStatus]}>{statusLabel[connectionStatus]}</span>
            </div>
            <span className="text-foreground/40">{showName}</span>
          </div>

          {/* Video Call View */}
          {callMode === 'video' && (
            <div className="relative bg-black aspect-video">
              {/* Remote video (host/show) */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                <div className="text-center space-y-2">
                  <Headphones className="w-12 h-12 text-amber-500/40 mx-auto" />
                  <p className="text-white/60 text-sm">Waiting for host to connect you...</p>
                  <p className="text-amber-400 text-xs">You are #{callQueue.filter(c => c.status === 'queued').length + 1} in the queue</p>
                </div>
              </div>

              {/* Local video (self) */}
              <div className="absolute bottom-3 right-3 w-32 h-24 sm:w-40 sm:h-30 rounded-lg overflow-hidden border-2 border-amber-500/50 bg-zinc-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                />
                {!isVideoOn && (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="w-6 h-6 text-zinc-500" />
                  </div>
                )}
              </div>

              {/* Video call controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={`rounded-full w-10 h-10 p-0 ${isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/10 border-white/20 text-white'}`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`rounded-full w-10 h-10 p-0 ${!isVideoOn ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/10 border-white/20 text-white'}`}
                  onClick={toggleVideo}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 bg-red-600 hover:bg-red-700 text-white"
                  onClick={endCall}
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>

              {/* On-air indicator */}
              {connectionStatus === 'on-air' && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-600 text-white border-red-700 animate-pulse">
                    <Radio className="w-3 h-3 mr-1" /> ON AIR
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Voice Call View */}
          {callMode === 'voice' && (
            <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
                <Headphones className="w-10 h-10 text-white" />
              </div>
              <p className="text-white font-semibold">{connectionStatus === 'connected' ? 'Connected — In Queue' : 'Connecting...'}</p>
              <p className="text-white/60 text-sm text-center">
                You'll be connected to the host when it's your turn.
                {connectionStatus === 'connected' && ` Position: #${callQueue.filter(c => c.status === 'queued').length + 1}`}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className={`rounded-full ${isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/20 text-white'}`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full"
                  onClick={endCall}
                >
                  <PhoneOff className="w-4 h-4 mr-1" /> End Call
                </Button>
              </div>
            </div>
          )}

          {/* Call-In Options (when idle) */}
          {callMode === 'idle' && (
            <div className="p-4 space-y-4">
              {/* Caller Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">Your Name</label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">Topic / Question</label>
                  <input
                    type="text"
                    value={callerTopic}
                    onChange={(e) => setCallerTopic(e.target.value)}
                    placeholder="What do you want to discuss?"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Call-In Methods */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3 gap-1.5 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
                  onClick={startVideoCall}
                >
                  <Video className="w-5 h-5 text-green-400" />
                  <span className="text-xs text-green-300">Video Call</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3 gap-1.5 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50"
                  onClick={startVoiceCall}
                >
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-blue-300">Voice Call</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3 gap-1.5 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50"
                  onClick={() => {
                    if (isRecording) {
                      stopVoiceRecording();
                    } else {
                      startVoiceRecording();
                    }
                  }}
                >
                  <Mic className={`w-5 h-5 ${isRecording ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                  <span className={`text-xs ${isRecording ? 'text-red-300' : 'text-amber-300'}`}>
                    {isRecording ? `Recording ${recordingTime}s` : 'Voice Msg'}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3 gap-1.5 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                  onClick={() => setCallMode('text')}
                >
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-purple-300">Text In</span>
                </Button>
              </div>

              {/* External Video Platforms */}
              <div className="border-t border-border pt-3">
                <p className="text-xs text-foreground/50 mb-2">Join via external platform:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
                    onClick={() => {
                      window.open(CALL_IN_URLS.skype, '_blank');
                      toast.info('Opening Skype — join the RRB show call');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" /> Skype
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                    onClick={() => {
                      window.open(CALL_IN_URLS.zoom, '_blank');
                      toast.info('Opening Zoom — join the RRB show call');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" /> Zoom
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 border-green-500/30 text-green-300 hover:bg-green-500/10"
                    onClick={() => {
                      window.open(CALL_IN_URLS.meet, '_blank');
                      toast.info('Opening Google Meet — join the RRB show call');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" /> Google Meet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                    onClick={() => {
                      window.open(CALL_IN_URLS.discord, '_blank');
                      toast.info('Opening Discord — join the RRB voice channel');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" /> Discord
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Text Call-In Mode */}
          {callMode === 'text' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Send a Text Call-In</p>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setCallMode('idle')}>
                  Back
                </Button>
              </div>
              <textarea
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                placeholder="Type your message, question, or shout-out..."
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={submitTextCallIn}
                  disabled={!textMessage.trim()}
                >
                  <Send className="w-4 h-4 mr-2" /> Submit Call-In
                </Button>
              </div>
            </div>
          )}

          {/* Call Queue */}
          <div className="border-t border-border">
            <div className="px-4 py-2 flex items-center justify-between bg-zinc-900/30">
              <p className="text-xs font-semibold text-foreground/70">Recent Call-Ins</p>
              <Badge variant="outline" className="text-xs">
                {callQueue.filter(c => c.status === 'queued').length} waiting
              </Badge>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {callQueue.slice(-5).reverse().map((msg) => (
                <div key={msg.id} className="px-4 py-2 border-t border-border/50 flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.type === 'video' ? 'bg-green-500/20' :
                    msg.type === 'voice' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {msg.type === 'video' ? <Video className="w-3 h-3 text-green-400" /> :
                     msg.type === 'voice' ? <Mic className="w-3 h-3 text-blue-400" /> :
                     <MessageSquare className="w-3 h-3 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{msg.name}</span>
                      <Badge
                        className={`text-[10px] px-1 py-0 ${
                          msg.status === 'on-air' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          msg.status === 'queued' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {msg.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/60 line-clamp-1">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-foreground/40 flex-shrink-0">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Notice */}
          <div className="px-4 py-2 bg-amber-500/5 border-t border-amber-500/20">
            <p className="text-[10px] text-foreground/40 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Accessible call-in: Text, voice, and video options available. Screen reader compatible.
              All call-ins are moderated before going on air.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
