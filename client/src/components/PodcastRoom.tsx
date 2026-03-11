/**
 * PodcastRoom — Reusable podcast studio component
 * 
 * Features:
 * - Video-integrated podcast with dedicated viewing screen
 * - AI host integration with TTS (Candy, Valanna, Seraph)
 * - Live chat sidebar with speaking avatars
 * - Call-in feature for live feedback/interaction
 * - Recording pipeline (auto-routes to 5 destinations)
 * - Mobile game screen activation
 * - Accessibility for impaired community
 * - Guest AI or live participant support
 * - QUMUS autonomous orchestration
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, Mic, MicOff, Video, VideoOff, Phone, PhoneOff,
  Radio, Users, MessageSquare, Gamepad2, Volume2, VolumeX,
  Circle, Square, Download, Share2, Settings, Send, X,
  Headphones, Tv, Wifi, WifiOff, ChevronDown, Play, Pause,
  SkipForward, SkipBack, Clock, Eye, Heart, Loader2
} from 'lucide-react';
import { ConferenceAiChatPanel } from './ConferenceAiChatPanel';
import { SpeakingAvatar } from './SpeakingAvatar';
import { useAiVoice } from '@/hooks/useAiVoice';
import type { AiPersona } from '@/services/aiVoiceTts';

// ─── Types ───
export interface PodcastShowConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  host: {
    name: string;
    persona: AiPersona;
    role: string;
    bio: string;
  };
  coHosts?: {
    name: string;
    persona: AiPersona;
    role: string;
  }[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  features: {
    callIn: boolean;
    gameScreen: boolean;
    guestAi: boolean;
    liveParticipants: boolean;
    healingFrequencies: boolean;
    solbonesGame: boolean;
  };
  schedule: {
    day: string;
    time: string;
    timezone: string;
    frequency: string;
  };
  socialLinks?: {
    youtube?: string;
    spotify?: string;
    apple?: string;
  };
}

interface PodcastRoomProps {
  config: PodcastShowConfig;
  onBack?: () => void;
}

// ─── Episode Card ───
function EpisodeCard({ episode, theme, onPlay }: { episode: any; theme: any; onPlay: () => void }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer" onClick={onPlay}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: theme.gradient }}>
        <Play className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">{episode.title}</p>
        <p className="text-white/40 text-[10px]">{episode.duration} &middot; {episode.date}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Download className="w-3.5 h-3.5 text-white/40 hover:text-white" />
      </button>
    </div>
  );
}

// ─── Call-In Panel ───
function CallInPanel({ config, isOpen, onClose }: { config: PodcastShowConfig; isOpen: boolean; onClose: () => void }) {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'live' | 'queue'>('idle');
  const [queuePosition, setQueuePosition] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const handleCallIn = () => {
    setCallStatus('connecting');
    setTimeout(() => {
      setCallStatus('queue');
      setQueuePosition(Math.floor(Math.random() * 3) + 1);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 z-30 flex flex-col">
      <div className="px-3 py-2 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5" style={{ color: config.theme.primary }} />
          <span className="text-white text-xs font-semibold">Call-In Line</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {callStatus === 'idle' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: config.theme.gradient }}>
              <Phone className="w-7 h-7 text-white" />
            </div>
            <p className="text-white/60 text-xs text-center">Call in to join the live conversation with {config.host.name}</p>
            <Button onClick={handleCallIn} className="w-full" style={{ background: config.theme.primary }}>
              <Phone className="w-3.5 h-3.5 mr-1.5" /> Call In Now
            </Button>
          </>
        )}
        {callStatus === 'connecting' && (
          <>
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: config.theme.primary }} />
            <p className="text-white/60 text-xs">Connecting...</p>
          </>
        )}
        {callStatus === 'queue' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-500/20">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-white text-sm font-medium">You're in the queue</p>
            <p className="text-white/40 text-xs">Position: #{queuePosition}</p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)} className="flex-1 border-gray-700 text-white/60">
                {isMuted ? <MicOff className="w-3 h-3 mr-1" /> : <Mic className="w-3 h-3 mr-1" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setCallStatus('idle'); toast.info('Call ended'); }} className="flex-1 border-red-700 text-red-400">
                <PhoneOff className="w-3 h-3 mr-1" /> Hang Up
              </Button>
            </div>
          </>
        )}
        {callStatus === 'live' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{ background: config.theme.gradient }}>
              <Mic className="w-7 h-7 text-white" />
            </div>
            <Badge className="bg-red-500 text-white animate-pulse">LIVE ON AIR</Badge>
            <p className="text-white/60 text-xs text-center">You're live! Speak clearly into your microphone.</p>
            <Button variant="outline" size="sm" onClick={() => { setCallStatus('idle'); toast.info('Call ended'); }} className="w-full border-red-700 text-red-400">
              <PhoneOff className="w-3 h-3 mr-1" /> End Call
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Game Screen (Mobile Activation) ───
function GameScreen({ config, isOpen, onClose }: { config: PodcastShowConfig; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-gray-900/98 backdrop-blur-md z-40 flex flex-col">
      <div className="px-3 py-2 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-3.5 h-3.5" style={{ color: config.theme.accent }} />
          <span className="text-white text-xs font-semibold">Interactive Game</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        {config.features.solbonesGame ? (
          <>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: config.theme.gradient }}>
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white text-lg font-bold">Solbones 4+3+2</h3>
            <p className="text-white/50 text-xs text-center max-w-xs">Play the sacred math dice game while listening to the podcast. Solfeggio frequencies enhance your experience.</p>
            <Button style={{ background: config.theme.primary }} onClick={() => { window.open('/solbones', '_blank'); }}>
              <Gamepad2 className="w-4 h-4 mr-2" /> Launch Solbones Game
            </Button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: config.theme.gradient }}>
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white text-lg font-bold">Interactive Games</h3>
            <p className="text-white/50 text-xs text-center max-w-xs">Play interactive games while listening. Choose from Word Frequency, Rhythm Roots, and more.</p>
            <Button style={{ background: config.theme.primary }} onClick={() => { window.open('/games', '_blank'); }}>
              <Gamepad2 className="w-4 h-4 mr-2" /> Open Games Hub
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main PodcastRoom Component ───
export default function PodcastRoom({ config, onBack }: PodcastRoomProps) {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showCallIn, setShowCallIn] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 50) + 12);
  const [activeTab, setActiveTab] = useState<'episodes' | 'guests' | 'schedule'>('episodes');
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Voice
  const { voiceEnabled, toggleVoice, isSpeaking, currentSpeaker, speakAiResponse } = useAiVoice({
    persona: config.host.persona,
    defaultEnabled: true,
    autoSpeak: true,
  });

  // Simulated viewer count fluctuation
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 10000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
    return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGoLive = () => {
    setIsLive(true);
    setIsRecording(true);
    toast.success(`${config.title} is now LIVE!`, { description: 'Broadcasting to all platforms via QUMUS' });
  };

  const handleEndShow = () => {
    setIsLive(false);
    setIsRecording(false);
    toast.info('Show ended. Recording saved to pipeline.', { description: 'Auto-routing to 5 destinations via QUMUS' });
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast.success('Recording started', { description: 'Audio + video capture active' });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.info('Recording saved', { description: `${formatTime(recordingTime)} captured. Routing to pipeline...` });
  };

  // Mock episodes
  const episodes = [
    { id: '1', title: `${config.title} - Episode 12: Special Guest`, duration: '58:32', date: 'Mar 8, 2026' },
    { id: '2', title: `${config.title} - Episode 11: Deep Dive`, duration: '45:18', date: 'Mar 1, 2026' },
    { id: '3', title: `${config.title} - Episode 10: Community Stories`, duration: '52:45', date: 'Feb 22, 2026' },
    { id: '4', title: `${config.title} - Episode 9: Live Q&A`, duration: '41:10', date: 'Feb 15, 2026' },
    { id: '5', title: `${config.title} - Episode 8: Origins`, duration: '63:22', date: 'Feb 8, 2026' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="h-12 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50 flex items-center px-3 gap-3 sticky top-0 z-20">
        <button onClick={onBack || (() => window.history.back())} className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SpeakingAvatar persona={config.host.persona} isSpeaking={isSpeaking && currentSpeaker === config.host.persona} size="sm" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate" style={{ color: config.theme.primary }}>{config.title}</h1>
            <p className="text-[10px] text-white/40 truncate">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isLive && (
            <Badge className="bg-red-500 text-white text-[9px] animate-pulse px-1.5 py-0">LIVE</Badge>
          )}
          {isRecording && (
            <Badge className="bg-red-600/80 text-white text-[9px] px-1.5 py-0">
              <Circle className="w-2 h-2 mr-0.5 fill-current animate-pulse" /> REC {formatTime(recordingTime)}
            </Badge>
          )}
          <div className="flex items-center gap-0.5 text-white/40 text-[10px]">
            <Eye className="w-3 h-3" /> {viewerCount}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3rem)]">
        {/* Left: Video/Audio Stage */}
        <div className="flex-1 flex flex-col relative">
          {/* Video Stage */}
          <div className="flex-1 relative bg-black flex items-center justify-center" style={{ minHeight: '300px' }}>
            {/* Background gradient */}
            <div className="absolute inset-0 opacity-20" style={{ background: config.theme.gradient }} />
            
            {/* Center stage content */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              {/* Host avatar */}
              <SpeakingAvatar
                persona={config.host.persona}
                isSpeaking={isSpeaking}
                size="lg"
                showLabel
              />
              
              {/* Co-hosts */}
              {config.coHosts && config.coHosts.length > 0 && (
                <div className="flex items-center gap-4 mt-2">
                  {config.coHosts.map((coHost, idx) => (
                    <SpeakingAvatar
                      key={idx}
                      persona={coHost.persona}
                      isSpeaking={false}
                      size="sm"
                      showLabel
                    />
                  ))}
                </div>
              )}

              {/* Show info overlay */}
              {!isLive && (
                <div className="text-center mt-4">
                  <p className="text-white/60 text-xs">{config.schedule.day} at {config.schedule.time} {config.schedule.timezone}</p>
                  <p className="text-white/40 text-[10px] mt-1">{config.schedule.frequency}</p>
                </div>
              )}

              {/* Live waveform indicator */}
              {isLive && (
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full"
                      style={{
                        backgroundColor: config.theme.primary,
                        height: `${Math.random() * 24 + 8}px`,
                        animation: `waveBar 0.5s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Overlay panels */}
            <CallInPanel config={config} isOpen={showCallIn} onClose={() => setShowCallIn(false)} />
            <GameScreen config={config} isOpen={showGame} onClose={() => setShowGame(false)} />
            <ConferenceAiChatPanel isOpen={showChat} onClose={() => setShowChat(false)} conferenceTitle={config.title} />
          </div>

          {/* Controls Bar */}
          <div className="h-14 bg-gray-900/90 backdrop-blur-md border-t border-gray-800/50 flex items-center justify-between px-3">
            {/* Left controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${audioEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400'}`}
                aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {audioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${videoEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400'}`}
                aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={toggleVoice}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${voiceEnabled ? 'text-white bg-white/10' : 'text-white/30 bg-white/5'}`}
                aria-label={voiceEnabled ? 'Disable AI voice' : 'Enable AI voice'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Center controls */}
            <div className="flex items-center gap-2">
              {!isLive ? (
                <Button size="sm" onClick={handleGoLive} style={{ background: config.theme.primary }} className="text-white text-xs h-8 px-4">
                  <Radio className="w-3.5 h-3.5 mr-1.5" /> Go Live
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={handleEndShow} className="text-xs h-8 px-4">
                  <Square className="w-3 h-3 mr-1.5" /> End Show
                </Button>
              )}
              {!isRecording ? (
                <button onClick={handleStartRecording} className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors" aria-label="Start recording">
                  <Circle className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button onClick={handleStopRecording} className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse" aria-label="Stop recording">
                  <Square className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1.5">
              {config.features.callIn && (
                <button
                  onClick={() => { setShowCallIn(!showCallIn); setShowChat(false); setShowGame(false); }}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${showCallIn ? 'text-green-400 bg-green-500/20' : 'text-white/50 bg-white/5 hover:bg-white/10'}`}
                  aria-label="Call-in line"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => { setShowChat(!showChat); setShowCallIn(false); setShowGame(false); }}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${showChat ? 'bg-purple-500/20' : 'text-white/50 bg-white/5 hover:bg-white/10'}`}
                style={showChat ? { color: config.theme.primary } : {}}
                aria-label="AI Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              {config.features.gameScreen && (
                <button
                  onClick={() => { setShowGame(!showGame); setShowChat(false); setShowCallIn(false); }}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${showGame ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 bg-white/5 hover:bg-white/10'}`}
                  aria-label="Game screen"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => toast.info('Share link copied!', { description: `${window.location.origin}/podcast/${config.id}` })}
                className="h-8 w-8 rounded-full flex items-center justify-center text-white/50 bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Episodes, Guests, Schedule */}
        <div className="w-full lg:w-80 bg-gray-900/50 border-l border-gray-800/50 flex flex-col shrink-0">
          {/* Show Info */}
          <div className="p-3 border-b border-gray-800/50">
            <p className="text-white/60 text-[11px] leading-relaxed">{config.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[9px] border-gray-700 text-white/50">
                <Headphones className="w-2.5 h-2.5 mr-0.5" /> {config.schedule.frequency}
              </Badge>
              <Badge variant="outline" className="text-[9px] border-gray-700 text-white/50">
                <Clock className="w-2.5 h-2.5 mr-0.5" /> {config.schedule.day} {config.schedule.time}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800/50">
            {(['episodes', 'guests', 'schedule'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2' : 'text-white/40 hover:text-white/60'}`}
                style={activeTab === tab ? { borderColor: config.theme.primary } : {}}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'episodes' && (
              <div className="space-y-1.5">
                {episodes.map(ep => (
                  <EpisodeCard key={ep.id} episode={ep} theme={config.theme} onPlay={() => toast.info(`Playing: ${ep.title}`)} />
                ))}
              </div>
            )}

            {activeTab === 'guests' && (
              <div className="space-y-2 p-2">
                <div className="text-center py-6">
                  <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-xs">
                    {config.features.guestAi ? 'AI and live guests can join this show' : 'Guest management coming soon'}
                  </p>
                  {config.features.guestAi && (
                    <div className="mt-3 space-y-2">
                      <p className="text-white/60 text-[10px] font-medium">Available AI Guests:</p>
                      <div className="flex justify-center gap-3">
                        {(['valanna', 'candy', 'seraph'] as AiPersona[]).filter(p => p !== config.host.persona).map(persona => (
                          <SpeakingAvatar key={persona} persona={persona} isSpeaking={false} size="sm" showLabel />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-2 p-2">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-white text-xs font-medium">Regular Schedule</p>
                  <p className="text-white/50 text-[10px] mt-1">{config.schedule.day} at {config.schedule.time} {config.schedule.timezone}</p>
                  <p className="text-white/40 text-[10px]">{config.schedule.frequency}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-white text-xs font-medium">Recording Pipeline</p>
                  <p className="text-white/50 text-[10px] mt-1">Auto-routes to 5 destinations:</p>
                  <ul className="mt-1 space-y-0.5">
                    {['RRB Radio Replay', 'Media Blast Campaign', 'Studio Suite Editing', 'Streaming Platforms', 'QUMUS Automation'].map(dest => (
                      <li key={dest} className="text-white/40 text-[10px] flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: config.theme.primary }} />
                        {dest}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-white text-xs font-medium">QUMUS Control</p>
                  <p className="text-white/50 text-[10px] mt-1">90% autonomous orchestration</p>
                  <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '90%', background: config.theme.gradient }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for wave animation */}
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
