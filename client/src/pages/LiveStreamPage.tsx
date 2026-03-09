import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Radio, Wifi, Users, MessageCircle, Heart, Send,
  Music, Mic, Video, SkipForward, SkipBack, Globe,
  ArrowRight, Calendar, MapPin, Headphones, Settings,
  Loader2
} from 'lucide-react';

// Color palette for channels based on genre
const genreColors: Record<string, string> = {
  'Gospel': 'from-pink-600 to-rose-500',
  'Jazz': 'from-indigo-600 to-violet-500',
  'Soul / R&B': 'from-amber-600 to-orange-500',
  'Hip-Hop / R&B': 'from-red-600 to-pink-500',
  'Healing / Meditation': 'from-green-600 to-emerald-500',
  'Funk / Disco': 'from-yellow-500 to-orange-500',
  'Rock & Roll': 'from-purple-600 to-blue-500',
};

// Configurable broadcast stream URL - admin can update via settings
const DEFAULT_STREAM_URL = 'https://www.youtube.com/embed/jfKfPfyJRdk';

function getStreamUrl(): string {
  try {
    const saved = localStorage.getItem('rrb_broadcast_url');
    if (saved) return saved;
  } catch (e) {}
  return DEFAULT_STREAM_URL;
}

function setStreamUrl(url: string): void {
  try {
    localStorage.setItem('rrb_broadcast_url', url);
  } catch (e) {}
}

// Simulated live chat messages
const initialMessages = [
  { id: 1, user: 'CommunityVoice', message: 'Love the healing frequencies today!', time: '2m ago', avatar: '🎵' },
  { id: 2, user: 'SelmaPride', message: 'Ready for the Jubilee!', time: '5m ago', avatar: '✊' },
  { id: 3, user: 'GhanaConnect', message: 'Greetings from Accra! SQUADD Goals!', time: '8m ago', avatar: '🌍' },
  { id: 4, user: 'SweetMiracles', message: 'A Voice for the Voiceless', time: '12m ago', avatar: '💝' },
  { id: 5, user: 'Valanna', message: "Hey family! I'm watching over all the streams tonight. Everything's running smooth.", time: '15m ago', avatar: '🤖' },
];

export default function LiveStreamPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'radio' | 'podcast'>('radio');
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showStreamSettings, setShowStreamSettings] = useState(false);
  const [customStreamUrl, setCustomStreamUrl] = useState(getStreamUrl());
  const videoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch real channels from database
  const { data: channels, isLoading: channelsLoading } = trpc.ecosystemIntegration.getAllChannels.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30s for live listener counts
  });

  // Record listener events to DB
  const recordEvent = trpc.listenerAnalytics.recordEvent.useMutation();
  const sessionStartRef = useRef<number>(0);

  // Detect device type
  const deviceType = useMemo(() => {
    if (typeof navigator === 'undefined') return 'desktop' as const;
    const ua = navigator.userAgent;
    if (/tablet|ipad/i.test(ua)) return 'tablet' as const;
    if (/mobile|android|iphone/i.test(ua)) return 'mobile' as const;
    return 'desktop' as const;
  }, []);

  // Record tune-in event
  const recordTuneIn = useCallback((channel: any) => {
    if (!channel) return;
    sessionStartRef.current = Date.now();
    recordEvent.mutate({
      channelId: channel.id,
      channelName: channel.name,
      listenerCount: 1,
      deviceType,
    });
  }, [recordEvent, deviceType]);

  // Record tune-out event with session duration
  const recordTuneOut = useCallback((channel: any) => {
    if (!channel || !sessionStartRef.current) return;
    const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    if (duration > 5) { // Only record if listened for more than 5 seconds
      recordEvent.mutate({
        channelId: channel.id,
        channelName: channel.name,
        listenerCount: 1,
        sessionDurationSeconds: duration,
        deviceType,
      });
    }
    sessionStartRef.current = 0;
  }, [recordEvent, deviceType]);

  // Record on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (isPlaying && activeChannel) {
        recordTuneOut(activeChannel);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isPlaying, activeChannel, recordTuneOut]);

  // Set initial active channel when data loads
  useEffect(() => {
    if (channels && channels.length > 0 && activeChannelId === null) {
      // Default to Gospel Hour
      const gospel = channels.find(c => c.genre === 'Gospel');
      setActiveChannelId(gospel?.id || channels[0].id);
    }
  }, [channels, activeChannelId]);

  const activeChannel = useMemo(() => {
    if (!channels) return null;
    return channels.find(c => c.id === activeChannelId) || channels[0] || null;
  }, [channels, activeChannelId]);

  const channelColor = useMemo(() => {
    if (!activeChannel) return 'from-purple-600 to-blue-600';
    return genreColors[activeChannel.genre] || 'from-purple-600 to-blue-600';
  }, [activeChannel]);

  // Create and manage audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      setAudioError('Stream temporarily unavailable. Try another channel.');
      setIsPlaying(false);
    });

    audio.addEventListener('playing', () => {
      setAudioError(null);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle channel changes
  useEffect(() => {
    if (audioRef.current && activeTab === 'radio' && activeChannel?.streamUrl) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = activeChannel.streamUrl;
      if (wasPlaying) {
        audioRef.current.play().catch(() => {
          setAudioError('Tap play to start streaming');
          setIsPlaying(false);
        });
      }
    }
  }, [activeChannelId]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handlePlayPause = () => {
    if (activeTab === 'radio' && audioRef.current && activeChannel?.streamUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        recordTuneOut(activeChannel);
      } else {
        setAudioError(null);
        audioRef.current.src = activeChannel.streamUrl;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          recordTuneIn(activeChannel);
        }).catch(() => {
          setAudioError('Unable to connect to stream. Please try again.');
          setIsPlaying(false);
        });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      user: user?.name || 'Guest',
      message: newMessage.trim(),
      time: 'now',
      avatar: '👤',
    };
    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
  }, [newMessage, user]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && videoRef.current) {
      videoRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const totalListeners = useMemo(() => {
    if (!channels) return 0;
    return channels.reduce((sum, c) => sum + (c.currentListeners || 0), 0);
  }, [channels]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-[#D4A843]/10 bg-[#0D0D0D]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#D4A843]" />
                <h1 className="text-lg font-bold text-[#D4A843]">RRB LIVE</h1>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 animate-pulse">
                24/7 LIVE
              </Badge>
              <div className="flex items-center gap-1 text-xs text-[#E8E0D0]/60">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <span>{channels?.length || 0} channels</span>
              </div>
              <span className="text-xs text-[#E8E0D0]/30 hidden md:inline">Payten Music (BMI) &bull; Canryn Production</span>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-[#111] rounded-lg p-1">
              {[
                { id: 'video' as const, icon: <Video className="w-4 h-4" />, label: 'Video' },
                { id: 'radio' as const, icon: <Radio className="w-4 h-4" />, label: 'Radio' },
                { id: 'podcast' as const, icon: <Mic className="w-4 h-4" />, label: 'Podcast' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'radio' && audioRef.current) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#D4A843]/20 text-[#D4A843]'
                      : 'text-[#E8E0D0]/50 hover:text-[#E8E0D0]/80'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Stream Settings Button */}
            <button
              onClick={() => setShowStreamSettings(true)}
              className="p-2 rounded-lg bg-[#111] text-[#E8E0D0]/50 hover:text-[#D4A843] hover:bg-[#D4A843]/10 transition-all"
              title="Broadcast Stream Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className={`grid ${showChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {/* Stream Area */}
          <div className={showChat ? 'lg:col-span-2' : ''}>
            <div ref={videoRef} className="relative bg-[#111] rounded-lg overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#111] to-[#0A0A0A]">
                {activeTab === 'video' ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isPlaying ? (
                        <iframe
                          src={`${getStreamUrl()}?autoplay=1&mute=0`}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title="RRB Live Stream"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20" />
                            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-30" />
                            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                              <Video className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <h2 className="text-2xl font-bold text-[#D4A843] mb-2">RRB Live Broadcast</h2>
                          <p className="text-[#E8E0D0]/60 text-sm mb-1">Canryn Production Broadcasting</p>
                          <p className="text-[#E8E0D0]/40 text-xs mb-4">A Voice for the Voiceless</p>
                          <p className="text-[#E8E0D0]/30 text-xs">Press play to connect to live stream</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeTab === 'radio' ? (
                  <div className="text-center px-4">
                    {channelsLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-[#D4A843] animate-spin" />
                        <p className="text-[#E8E0D0]/60 text-sm">Loading channels...</p>
                      </div>
                    ) : activeChannel ? (
                      <>
                        {/* Audio visualizer animation */}
                        <div className="flex items-end justify-center gap-1 h-20 mb-6">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 rounded-t bg-gradient-to-t ${channelColor} transition-all duration-150`}
                              style={{
                                height: isPlaying
                                  ? `${20 + Math.sin(Date.now() / 200 + i * 0.5) * 30 + Math.random() * 20}%`
                                  : '15%',
                                opacity: isPlaying ? 0.8 : 0.3,
                              }}
                            />
                          ))}
                        </div>
                        <h2 className="text-3xl font-bold text-[#D4A843] mb-2">{activeChannel.name}</h2>
                        <p className="text-[#E8E0D0]/60 text-sm mb-1">{activeChannel.genre} &bull; {activeChannel.frequency}</p>
                        {activeChannel.metadata && (
                          <p className="text-[#E8E0D0]/40 text-xs mb-1">
                            Source: {typeof activeChannel.metadata === 'object' ? (activeChannel.metadata as any).source : ''} &bull; {typeof activeChannel.metadata === 'object' ? `${(activeChannel.metadata as any).bitrate}kbps ${(activeChannel.metadata as any).codec}` : ''}
                          </p>
                        )}
                        <p className="text-[#E8E0D0]/30 text-xs">Registered through Payten Music in BMI</p>
                        {audioError && (
                          <p className="text-amber-400/80 text-xs mt-3">{audioError}</p>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Headphones className="w-4 h-4 text-[#D4A843]/50" />
                          <span className="text-xs text-[#E8E0D0]/40">
                            {activeChannel.streamUrl ? 'Real 24/7 stream' : 'No stream URL configured'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-[#E8E0D0]/60">No channels available</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#D4A843] to-[#8B1A1A] opacity-20 ${isPlaying ? 'animate-pulse' : ''}`} />
                      <div className={`absolute inset-2 rounded-full bg-gradient-to-r from-[#D4A843] to-[#8B1A1A] opacity-30 ${isPlaying ? 'animate-pulse' : ''}`} />
                      <div className="absolute inset-4 rounded-full bg-gradient-to-r from-[#D4A843] to-[#8B1A1A] flex items-center justify-center">
                        <Mic className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#D4A843] mb-2">RRB Podcast Network</h2>
                    <p className="text-[#E8E0D0]/60 text-sm mb-1">Community Stories & Advocacy</p>
                    <p className="text-[#E8E0D0]/40 text-xs">Sweet Miracles Presents</p>
                  </div>
                )}
              </div>

              {/* Playback Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayPause}
                      className="p-2 bg-[#D4A843] rounded-full hover:bg-[#E8C860] transition-colors text-[#0A0A0A]"
                      disabled={activeTab === 'radio' && !activeChannel?.streamUrl}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      className="p-1.5 text-[#E8E0D0]/60 hover:text-[#E8E0D0]"
                      onClick={() => {
                        if (channels && activeChannel) {
                          const idx = channels.findIndex(c => c.id === activeChannel.id);
                          const prev = channels[(idx - 1 + channels.length) % channels.length];
                          setActiveChannelId(prev.id);
                        }
                      }}
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 text-[#E8E0D0]/60 hover:text-[#E8E0D0]"
                      onClick={() => {
                        if (channels && activeChannel) {
                          const idx = channels.findIndex(c => c.id === activeChannel.id);
                          const next = channels[(idx + 1) % channels.length];
                          setActiveChannelId(next.id);
                        }
                      }}
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 text-[#E8E0D0]/60 hover:text-[#E8E0D0]"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseInt(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-20 h-1 accent-[#D4A843]"
                      />
                    </div>

                    <Badge className={`text-xs ml-2 ${isPlaying ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-[#222] text-[#E8E0D0]/50 border-[#333]'}`}>
                      {isPlaying ? 'STREAMING' : 'READY'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="p-1.5 text-[#E8E0D0]/60 hover:text-[#E8E0D0]"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 text-[#E8E0D0]/60 hover:text-[#E8E0D0]"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Selector (Radio mode) */}
            {activeTab === 'radio' && channels && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {channels.map(channel => {
                  const color = genreColors[channel.genre] || 'from-purple-600 to-blue-600';
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannelId(channel.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        activeChannelId === channel.id
                          ? 'bg-[#D4A843]/10 border-[#D4A843]/50'
                          : 'bg-[#111] border-[#222] hover:border-[#D4A843]/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${color} ${activeChannelId === channel.id && isPlaying ? 'animate-pulse' : ''}`} />
                        <span className="text-sm font-medium text-[#E8E0D0] truncate">{channel.name}</span>
                      </div>
                      <div className="text-xs text-[#E8E0D0]/50">{channel.genre} &bull; {channel.frequency}</div>
                      {channel.metadata && typeof channel.metadata === 'object' && (
                        <div className="text-xs text-[#E8E0D0]/30 mt-1">
                          {(channel.metadata as any).bitrate}kbps {(channel.metadata as any).codec}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Stream Info */}
            <div className="mt-4 p-4 bg-[#111] rounded-lg border border-[#222]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#E8E0D0]">
                    {activeTab === 'video' ? 'RRB Live Broadcast' : activeTab === 'radio' ? (activeChannel?.name || 'RRB Radio') : 'RRB Podcast Network'}
                  </h3>
                  <p className="text-sm text-[#E8E0D0]/60 mt-1">
                    Canryn Production &bull; A Voice for the Voiceless &bull; Sweet Miracles
                  </p>
                  {activeTab === 'radio' && activeChannel && (
                    <p className="text-xs text-[#E8E0D0]/40 mt-1">
                      Rockin Rockin Boogie 24/7 Radio Network &bull; {channels?.length || 0} channels streaming live
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 text-xs"
                    onClick={() => setLocation('/squadd')}
                  >
                    <Heart className="w-3.5 h-3.5 mr-1" /> Support
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E8E0D0]/20 text-[#E8E0D0]/60 hover:bg-[#E8E0D0]/10 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    <Globe className="w-3.5 h-3.5 mr-1" /> Share
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['Sweet Miracles', 'Elder Advocacy', 'SQUADD Goals', 'Healing Frequencies', 'Canryn Production'].map(tag => (
                  <Badge key={tag} className="bg-[#1A3A5C]/20 text-[#E8E0D0]/60 border-[#1A3A5C]/30 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'SQUADD Goals', path: '/squadd', icon: Globe },
                { label: 'Meditation Hub', path: '/meditation', icon: Music },
                { label: 'RRB Radio Station', path: '/rrb-radio', icon: Radio },
                { label: 'Ecosystem', path: '/', icon: MapPin },
              ].map(link => (
                <button
                  key={link.path}
                  onClick={() => setLocation(link.path)}
                  className="flex items-center gap-2 p-3 bg-[#111] border border-[#222] rounded-lg hover:border-[#D4A843]/30 transition-colors text-left"
                >
                  <link.icon className="w-4 h-4 text-[#D4A843]" />
                  <span className="text-xs text-[#E8E0D0]/70">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Chat Panel */}
          {showChat && (
            <div className="lg:col-span-1">
              <Card className="bg-[#111] border-[#222] h-full flex flex-col">
                <div className="p-3 border-b border-[#222] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#D4A843]" />
                    <span className="text-sm font-semibold text-[#E8E0D0]">Live Chat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-[#E8E0D0]/50">online</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[400px] lg:max-h-[500px]">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <div className="text-lg flex-shrink-0">{msg.avatar}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${msg.user === 'Valanna' ? 'text-purple-400' : 'text-[#D4A843]'}`}>
                            {msg.user}
                          </span>
                          <span className="text-xs text-[#E8E0D0]/30">{msg.time}</span>
                        </div>
                        <p className="text-sm text-[#E8E0D0]/80 break-words">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-[#222]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Send a message..."
                      className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#E8E0D0] placeholder-[#E8E0D0]/30 focus:outline-none focus:border-[#D4A843]/50"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-[#D4A843] rounded-lg hover:bg-[#E8C860] transition-colors text-[#0A0A0A]"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Admin Stream URL Settings Modal */}
      {showStreamSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowStreamSettings(false)}>
          <div className="bg-[#111] border border-[#D4A843]/30 rounded-xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#D4A843] mb-4">Broadcast Stream Settings</h3>
            <p className="text-xs text-[#E8E0D0]/50 mb-4">Set the live stream embed URL for broadcasts. Supports YouTube, Facebook Live, Zoom, or any embeddable video URL.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#E8E0D0]/60 mb-1 block">Stream Embed URL</label>
                <input
                  type="text"
                  value={customStreamUrl}
                  onChange={(e) => setCustomStreamUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#E8E0D0] placeholder-[#E8E0D0]/30 focus:outline-none focus:border-[#D4A843]/50"
                />
              </div>
              <div className="text-xs text-[#E8E0D0]/40 space-y-1">
                <p>Quick formats:</p>
                <p>YouTube: https://www.youtube.com/embed/VIDEO_ID</p>
                <p>Facebook: https://www.facebook.com/plugins/video.php?href=URL</p>
                <p>Zoom: Your Zoom webinar embed link</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setStreamUrl(customStreamUrl);
                    setShowStreamSettings(false);
                    window.location.reload();
                  }}
                  className="flex-1 bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860]"
                >
                  Save & Apply
                </Button>
                <Button
                  onClick={() => {
                    setCustomStreamUrl(DEFAULT_STREAM_URL);
                    setStreamUrl(DEFAULT_STREAM_URL);
                  }}
                  variant="outline"
                  className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10"
                >
                  Reset Default
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
