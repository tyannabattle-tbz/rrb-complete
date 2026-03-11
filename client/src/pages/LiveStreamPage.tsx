import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useRestreamUrl } from '@/hooks/useRestreamUrl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Radio, Wifi, Users, MessageCircle, Heart, Send,
  Music, Mic, Video, SkipForward, SkipBack, Globe,
  ArrowRight, Calendar, MapPin, Headphones, Settings,
  Loader2, Clock, Sparkles, Bot, Tv
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

/**
 * Returns a proxied URL for HTTP streams when running on HTTPS.
 * HTTPS streams pass through directly. HTTP streams are routed through
 * our server-side proxy at /api/stream-proxy to avoid mixed-content blocking.
 */
function getProxiedStreamUrl(streamUrl: string): string {
  if (!streamUrl) return streamUrl;
  // If the stream is already HTTPS, use it directly
  if (streamUrl.startsWith('https://')) return streamUrl;
  // If we're on HTTPS, proxy HTTP streams through our server
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return `/api/stream-proxy?url=${encodeURIComponent(streamUrl)}`;
  }
  // On HTTP (local dev), use directly
  return streamUrl;
}

// DJ avatar/color mapping
const djStyles: Record<string, { avatar: string; color: string }> = {
  dj_valanna: { avatar: '💜', color: 'text-purple-400' },
  dj_seraph: { avatar: '⚡', color: 'text-blue-400' },
  dj_candy: { avatar: '🍬', color: 'text-pink-400' },
  system: { avatar: '📡', color: 'text-yellow-400' },
  user: { avatar: '👤', color: 'text-[#D4A843]' },
};

export default function LiveStreamPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { openRestream, restreamUrl } = useRestreamUrl();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'radio' | 'podcast' | 'conference'>('radio');

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

  // Fetch current DJ and schedule from DB
  const { data: currentDj } = trpc.ecosystemIntegration.getCurrentDj.useQuery(undefined, {
    refetchInterval: 60000,
  });
  const { data: dailySchedule } = trpc.ecosystemIntegration.getDailySchedule.useQuery(undefined, {
    staleTime: 300000,
  });
  const { data: broadcastSchedule } = trpc.ecosystemIntegration.getBroadcastSchedule.useQuery(undefined, {
    staleTime: 300000,
  });

  // AI DJ intro generation
  const djIntroMutation = trpc.ecosystemIntegration.getDjIntro.useMutation();
  const [djIntroText, setDjIntroText] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

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

  // Record tune-in event + generate DJ intro
  const recordTuneIn = useCallback((channel: any) => {
    if (!channel) return;
    sessionStartRef.current = Date.now();
    recordEvent.mutate({
      channelId: channel.id,
      channelName: channel.name,
      listenerCount: 1,
      deviceType,
    });
    // Generate AI DJ intro for this channel
    djIntroMutation.mutate(
      { channelName: channel.name, genre: channel.genre || 'Music', listenerCount: channel.currentListeners || 0 },
      { onSuccess: (data) => setDjIntroText(data.text) }
    );
  }, [recordEvent, deviceType, djIntroMutation]);

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
      audioRef.current.src = getProxiedStreamUrl(activeChannel.streamUrl);
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

  // Fetch real chat messages from DB
  const channelNameForChat = activeChannel?.name || 'RRB Gospel Hour';
  const { data: chatMessages, refetch: refetchChat } = trpc.ecosystemIntegration.getChatMessages.useQuery(
    { channelName: channelNameForChat, limit: 50 },
    { refetchInterval: 5000, enabled: showChat }
  );
  const sendChatMutation = trpc.ecosystemIntegration.sendChatMessage.useMutation({
    onSuccess: () => refetchChat(),
  });

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
        audioRef.current.src = getProxiedStreamUrl(activeChannel.streamUrl);
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
    sendChatMutation.mutate({
      channelId: activeChannel?.id || 0,
      channelName: channelNameForChat,
      userName: user?.name || 'Guest',
      message: newMessage.trim(),
    });
    setNewMessage('');
  }, [newMessage, user, activeChannel, channelNameForChat, sendChatMutation]);

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
                { id: 'conference' as const, icon: <Globe className="w-4 h-4" />, label: 'Conference' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'conference') {
                      setLocation('/conference');
                      return;
                    }
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

            {/* AI DJ Personality Banner */}
            {currentDj && (
              <div className="mt-4 p-4 bg-gradient-to-r from-[#D4A843]/10 via-[#111] to-[#8B1A1A]/10 rounded-lg border border-[#D4A843]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A843] to-[#8B1A1A] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#D4A843]">{currentDj.name}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">ON AIR</Badge>
                      </div>
                      <p className="text-xs text-[#E8E0D0]/60">{currentDj.show} &bull; {currentDj.timeSlot}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 text-xs"
                      onClick={() => setShowSchedule(!showSchedule)}
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule
                    </Button>
                  </div>
                </div>
                {/* AI DJ Intro Text */}
                {djIntroText && (
                  <div className="mt-3 p-3 bg-[#0A0A0A]/50 rounded-lg border border-[#D4A843]/10">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4A843] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#E8E0D0]/80 italic">"{djIntroText}"</p>
                    </div>
                    <p className="text-xs text-[#E8E0D0]/30 mt-1 ml-6">— {currentDj.name}, AI DJ</p>
                  </div>
                )}
                {djIntroMutation.isPending && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#E8E0D0]/40">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{currentDj.name} is preparing an intro...</span>
                  </div>
                )}
              </div>
            )}

            {/* Broadcast Schedule Panel */}
            {showSchedule && dailySchedule && (
              <div className="mt-3 p-4 bg-[#111] rounded-lg border border-[#222]">
                <h4 className="text-sm font-bold text-[#D4A843] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Daily DJ Schedule
                </h4>
                <div className="space-y-2">
                  {dailySchedule.map((slot, i) => {
                    const isActive = currentDj?.show === slot.show;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        isActive ? 'bg-[#D4A843]/10 border border-[#D4A843]/30' : 'hover:bg-[#1A1A1A]'
                      }`}>
                        <div className="w-24 flex-shrink-0">
                          <span className="text-xs font-mono text-[#E8E0D0]/50">{slot.timeSlot.split(' - ')[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#E8E0D0]">{slot.show}</span>
                            {isActive && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">NOW</Badge>}
                          </div>
                          <p className="text-xs text-[#E8E0D0]/40">{slot.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`text-xs font-medium ${
                            slot.dj === 'Valanna' ? 'text-purple-400' :
                            slot.dj === 'Seraph' ? 'text-blue-400' :
                            slot.dj === 'Candy' ? 'text-amber-400' : 'text-[#E8E0D0]/40'
                          }`}>{slot.dj}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Broadcast Schedule from DB */}
                {broadcastSchedule && broadcastSchedule.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#222]">
                    <h4 className="text-sm font-bold text-[#E8E0D0] mb-3 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#D4A843]" /> Program Schedule
                    </h4>
                    <div className="space-y-1.5">
                      {broadcastSchedule.filter(s => s.title !== 'Emergency Broadcast Channel').map(show => {
                        const startHour = new Date(show.startTime).getUTCHours();
                        const endHour = new Date(show.endTime).getUTCHours();
                        const nowHour = new Date().getUTCHours();
                        const isNow = nowHour >= startHour && nowHour < endHour;
                        return (
                          <div key={show.id} className={`flex items-center gap-3 p-2 rounded ${
                            isNow ? 'bg-[#D4A843]/5 border border-[#D4A843]/20' : ''
                          }`}>
                            <span className="w-28 flex-shrink-0 text-xs font-mono text-[#E8E0D0]/50">
                              {startHour.toString().padStart(2,'0')}:00 - {endHour.toString().padStart(2,'0')}:00
                            </span>
                            <div className="flex-1">
                              <span className="text-sm text-[#E8E0D0]">{show.title}</span>
                              {isNow && <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">LIVE</Badge>}
                            </div>
                            <Badge className={`text-xs ${
                              show.type === 'music' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              show.type === 'talk' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>{show.type}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* UN Campaign Commercial Banner */}
            <CommercialBanner channelGenre={activeChannel?.genre || 'Community'} />

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
                  <p className="text-xs text-purple-400/50 mt-0.5">
                    Built by Ty Battle (Ty Bat Zan) &bull; TBZ Operating System &bull; QUMUS Powered
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
                { label: 'Conference Hub', path: '/conference', icon: Video },
                { label: 'Restream Studio', path: restreamUrl || 'https://studio.restream.io', icon: Tv },
                { label: 'Meditation Hub', path: '/meditation', icon: Music },
                { label: 'RRB Radio Station', path: '/rrb-radio', icon: Radio },
              ].map(link => (
                <button
                  key={link.path}
                  onClick={() => link.path.startsWith('http') ? window.open(link.path, '_blank') : setLocation(link.path)}
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
                  {(chatMessages || []).map((msg: any) => {
                    const style = djStyles[msg.messageType] || djStyles.user;
                    const timeAgo = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    return (
                      <div key={msg.id} className="flex items-start gap-2">
                        <div className="text-lg flex-shrink-0">{style.avatar}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${style.color}`}>
                              {msg.userName}
                            </span>
                            {msg.isAiGenerated ? <Badge variant="outline" className="text-[8px] px-1 py-0 border-purple-500/30 text-purple-400">AI</Badge> : null}
                            <span className="text-xs text-[#E8E0D0]/30">{timeAgo}</span>
                          </div>
                          <p className="text-sm text-[#E8E0D0]/80 break-words">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
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

// ─── Commercial Break Banner Component ─────────────────────────────────────
function CommercialBanner({ channelGenre }: { channelGenre: string }) {
  const [showCommercial, setShowCommercial] = useState(true);
  const [currentCommercialIdx, setCurrentCommercialIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [djIntro, setDjIntro] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice configuration for DJ personalities using Web Speech API
  const getDjVoiceConfig = useCallback((djName: string) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    const femaleVoices = voices.filter(v => /female|woman|zira|samantha|victoria|karen|moira|fiona/i.test(v.name));
    const maleVoices = voices.filter(v => /male|man|david|james|daniel|alex|fred|thomas/i.test(v.name));
    const anyVoice = voices[0] || null;
    switch (djName) {
      case 'valanna': return { voice: femaleVoices[0] || anyVoice, rate: 0.92, pitch: 1.05 };
      case 'seraph': return { voice: maleVoices[0] || anyVoice, rate: 0.88, pitch: 0.85 };
      case 'candy': return { voice: maleVoices[1] || maleVoices[0] || anyVoice, rate: 0.95, pitch: 0.85 };
      default: return { voice: anyVoice, rate: 1.0, pitch: 1.0 };
    }
  }, []);

  const speakCommercial = useCallback((text: string, djName: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const config = getDjVoiceConfig(djName);
    if (config.voice) utterance.voice = config.voice;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 0.8;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [getDjVoiceConfig]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // Preload voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', handler);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', handler);
  }, []);

  // Fetch next commercial based on channel genre
  const { data: commercial } = trpc.ecosystemIntegration.getNextCommercial.useQuery(
    { channelGenre },
    { refetchInterval: 120000 } // Rotate every 2 minutes
  );

  // Fetch all commercials for the campaign library view
  const { data: allCommercials } = trpc.ecosystemIntegration.getAllCommercials.useQuery(undefined, {
    staleTime: 300000,
  });

  // Fetch rotation stats
  const { data: rotationStats } = trpc.ecosystemIntegration.getCommercialRotationStats.useQuery(undefined, {
    staleTime: 60000,
  });

  // Record impression
  const recordImpression = trpc.ecosystemIntegration.recordCommercialImpression.useMutation();

  // Generate DJ intro for commercial
  const djIntroMutation = trpc.ecosystemIntegration.generateCommercialDjIntro.useMutation();

  // Auto-rotate through commercials
  useEffect(() => {
    if (!allCommercials || allCommercials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentCommercialIdx(prev => (prev + 1) % allCommercials.length);
    }, 45000); // Rotate every 45 seconds
    return () => clearInterval(interval);
  }, [allCommercials]);

  // Record impression when commercial is shown
  useEffect(() => {
    if (commercial && showCommercial) {
      recordImpression.mutate({ commercialId: commercial.id, channelName: channelGenre });
    }
  }, [commercial?.id]);

  const displayCommercial = allCommercials?.[currentCommercialIdx] || commercial;

  // Auto-play commercial audio when it rotates
  useEffect(() => {
    if (autoPlay && displayCommercial) {
      speakCommercial(displayCommercial.script, displayCommercial.djVoice);
    }
    return () => { if (autoPlay) stopSpeaking(); };
  }, [currentCommercialIdx, autoPlay, displayCommercial?.id]);

  if (!displayCommercial || !showCommercial) return null;

  // Calculate days until March 17
  const launchDate = new Date('2026-03-17T00:00:00');
  const now = new Date();
  const daysUntil = Math.max(0, Math.ceil((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const djColors: Record<string, string> = {
    valanna: 'from-purple-500 to-violet-600',
    seraph: 'from-blue-500 to-cyan-600',
    candy: 'from-amber-500 to-orange-600',
  };

  return (
    <div className="mt-4">
      {/* Campaign Countdown Banner */}
      <div className="p-4 bg-gradient-to-r from-[#8B1A1A]/30 via-[#D4A843]/20 to-[#1A3A5C]/30 rounded-lg border border-[#D4A843]/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Campaign Commercial</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-[#D4A843]">{daysUntil}</span>
              <span className="text-xs text-[#E8E0D0]/50 ml-1">days until launch</span>
            </div>
            <button
              onClick={() => setShowCommercial(false)}
              className="text-[#E8E0D0]/30 hover:text-[#E8E0D0]/60 text-xs"
            >
              ×
            </button>
          </div>
        </div>

        {/* Commercial Content */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${djColors[displayCommercial.djVoice] || djColors.valanna} flex items-center justify-center flex-shrink-0`}>
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[#D4A843]">{displayCommercial.title}</span>
              <Badge className={`text-xs ${
                displayCommercial.category === 'promo' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                displayCommercial.category === 'psa' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                displayCommercial.category === 'bumper' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                displayCommercial.category === 'countdown' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                displayCommercial.category === 'testimonial' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/30'
              }`}>{displayCommercial.category}</Badge>
              <span className="text-xs text-[#E8E0D0]/30">{displayCommercial.duration}s</span>
            </div>
            <p className={`text-sm text-[#E8E0D0]/70 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
              {displayCommercial.script}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-[#D4A843] hover:text-[#E8C860]"
              >
                {isExpanded ? 'Show less' : 'Read full script'}
              </button>
              <span className="text-xs text-[#E8E0D0]/30">
                Voice: <span className={`font-medium ${
                  displayCommercial.djVoice === 'valanna' ? 'text-purple-400' :
                  displayCommercial.djVoice === 'seraph' ? 'text-blue-400' :
                  'text-amber-400'
                }`}>{displayCommercial.djVoice}</span>
              </span>
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    speakCommercial(displayCommercial.script, displayCommercial.djVoice);
                  }
                }}
                className={`text-xs flex items-center gap-1 ${isSpeaking ? 'text-red-400 hover:text-red-300' : 'text-[#D4A843]/60 hover:text-[#D4A843]'}`}
              >
                {isSpeaking ? <><VolumeX className="w-3 h-3" /> Stop</> : <><Volume2 className="w-3 h-3" /> Listen</>}
              </button>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`text-xs flex items-center gap-1 ${autoPlay ? 'text-green-400' : 'text-[#E8E0D0]/30 hover:text-[#E8E0D0]/50'}`}
              >
                <Radio className="w-3 h-3" /> {autoPlay ? 'Auto ON' : 'Auto OFF'}
              </button>
              <button
                onClick={() => {
                  djIntroMutation.mutate(
                    { commercialId: displayCommercial.id },
                    { onSuccess: (data) => {
                      setDjIntro(data.intro);
                      speakCommercial(data.intro, displayCommercial.djVoice);
                    }}
                  );
                }}
                className="text-xs text-[#D4A843]/60 hover:text-[#D4A843] flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> DJ Intro
              </button>
            </div>
            {djIntro && (
              <div className="mt-2 p-2 bg-[#0A0A0A]/50 rounded border border-[#D4A843]/10">
                <p className="text-xs text-[#E8E0D0]/60 italic">"{djIntro}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Campaign CTA */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[#E8E0D0]/40">
            <span>UN NGO CSW70 • March 17, 2026</span>
            <span>In Partnership with Ghana</span>
            {rotationStats && <span>{rotationStats.activeCommercials} commercials in rotation</span>}
          </div>
          <Button
            size="sm"
            className="bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860] text-xs"
            onClick={() => window.open('/squadd', '_blank')}
          >
            <ArrowRight className="w-3.5 h-3.5 mr-1" /> View SQUADD Goals
          </Button>
        </div>

        {/* Commercial Navigation Dots */}
        {allCommercials && allCommercials.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {allCommercials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentCommercialIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentCommercialIdx ? 'bg-[#D4A843] w-4' : 'bg-[#E8E0D0]/20 hover:bg-[#E8E0D0]/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
