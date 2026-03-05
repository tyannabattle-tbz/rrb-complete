import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Radio, Wifi, Users, MessageCircle, Heart, Send,
  Music, Mic, Video, SkipForward, SkipBack, Globe,
  ArrowRight, Calendar, MapPin, Headphones
} from 'lucide-react';

// RRB Radio channels with real streaming URLs (Icecast/Shoutcast compatible)
const radioChannels = [
  {
    id: 'main', name: 'RRB Main', genre: 'Mixed', frequency: '432 Hz',
    color: 'from-purple-600 to-blue-600',
    description: 'Flagship channel — music, talk, community voices',
    streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv',
    listeners: 127,
  },
  {
    id: 'gospel', name: 'Gospel Hour', genre: 'Gospel', frequency: '528 Hz',
    color: 'from-pink-600 to-rose-600',
    description: 'Uplifting gospel and spiritual music',
    streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
    listeners: 84,
  },
  {
    id: 'healing', name: 'Healing Frequencies', genre: 'Meditation', frequency: '432 Hz',
    color: 'from-green-600 to-emerald-600',
    description: 'Solfeggio frequencies — 432 Hz, 528 Hz, 639 Hz healing tones',
    streamUrl: 'https://stream.zeno.fm/4d6bhke3punuv',
    listeners: 203,
  },
  {
    id: 'talk', name: 'Community Talk', genre: 'Talk Radio', frequency: 'Standard',
    color: 'from-orange-600 to-amber-600',
    description: 'Elder advocacy, civil rights, community voices',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    listeners: 56,
  },
  {
    id: 'jazz', name: 'Jazz & Soul', genre: 'Jazz', frequency: '432 Hz',
    color: 'from-indigo-600 to-violet-600',
    description: 'Classic jazz, R&B, and soul — the soundtrack of legacy',
    streamUrl: 'https://stream.zeno.fm/e3b75nnmhzzuv',
    listeners: 91,
  },
  {
    id: 'legacy', name: 'Legacy Classics', genre: 'Classics', frequency: '432 Hz',
    color: 'from-yellow-600 to-orange-600',
    description: 'Honoring Seabrun Candy Hunter — classic hits and memories',
    streamUrl: 'https://stream.zeno.fm/phr3gu5flzzuv',
    listeners: 68,
  },
];

// Simulated live chat messages
const initialMessages = [
  { id: 1, user: 'CommunityVoice', message: 'Love the healing frequencies today! 🎵', time: '2m ago', avatar: '🎵' },
  { id: 2, user: 'SelmaPride', message: 'Ready for the Jubilee on Saturday!', time: '5m ago', avatar: '✊' },
  { id: 3, user: 'GhanaConnect', message: 'Greetings from Accra! SQUADD Goals!', time: '8m ago', avatar: '🌍' },
  { id: 4, user: 'SweetMiracles', message: 'A Voice for the Voiceless 💝', time: '12m ago', avatar: '💝' },
  { id: 5, user: 'Va-Lanna', message: "Hey family! I'm watching over all the streams tonight. Everything's running smooth.", time: '15m ago', avatar: '🤖' },
];

export default function LiveStreamPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(radioChannels[0]);
  const [activeTab, setActiveTab] = useState<'video' | 'radio' | 'podcast'>('video');
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [listenerCount, setListenerCount] = useState(247);
  const [showChat, setShowChat] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    if (audioRef.current && activeTab === 'radio') {
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
  }, [activeChannel]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Simulate listener count
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => Math.max(100, prev + Math.floor(Math.random() * 7) - 3));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handlePlayPause = () => {
    if (activeTab === 'radio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setAudioError(null);
        audioRef.current.src = activeChannel.streamUrl;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
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
                LIVE
              </Badge>
              <div className="flex items-center gap-1 text-xs text-[#E8E0D0]/60">
                <Users className="w-3.5 h-3.5" />
                <span>{listenerCount} listening</span>
              </div>
              <span className="text-xs text-[#E8E0D0]/30 hidden md:inline">Payten Music (BMI) • Canryn Production</span>
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
          </div>
        </div>
      </div>

      {/* Selma Event Quick Link */}
      <div className="bg-gradient-to-r from-[#8B1A1A]/20 to-[#1A3A5C]/20 border-b border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#E8E0D0]/60">
            <Calendar className="w-3.5 h-3.5 text-[#D4A843]" />
            <span><strong className="text-[#D4A843]">NEXT:</strong> GRITS & GREENS — Selma Jubilee, Saturday March 7, 10 AM CST</span>
          </div>
          <button onClick={() => setLocation('/selma')} className="text-xs text-[#D4A843] hover:text-[#E8C860] flex items-center gap-1">
            Event Details <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className={`grid ${showChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {/* Video / Stream Area */}
          <div className={showChat ? 'lg:col-span-2' : ''}>
            <div ref={videoRef} className="relative bg-[#111] rounded-lg overflow-hidden aspect-video">
              {/* Video Display Area */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#111] to-[#0A0A0A]">
                {activeTab === 'video' ? (
                  <div className="w-full h-full relative">
                    {/* Real video player area - iframe for live stream or placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isPlaying ? (
                        <iframe
                          src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0"
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
                  <div className="text-center">
                    {/* Audio visualizer animation */}
                    <div className="flex items-end justify-center gap-1 h-20 mb-6">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 rounded-t bg-gradient-to-t ${activeChannel.color} transition-all duration-150`}
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
                    <p className="text-[#E8E0D0]/60 text-sm mb-1">{activeChannel.genre} • {activeChannel.frequency}</p>
                    <p className="text-[#E8E0D0]/40 text-xs mb-1">{activeChannel.description}</p>
                    <p className="text-[#E8E0D0]/30 text-xs">Registered through Payten Music in BMI</p>
                    {audioError && (
                      <p className="text-amber-400/80 text-xs mt-3">{audioError}</p>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Headphones className="w-4 h-4 text-[#D4A843]/50" />
                      <span className="text-xs text-[#E8E0D0]/40">{activeChannel.listeners} listeners on this channel</span>
                    </div>
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
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button className="p-1.5 text-[#E8E0D0]/60 hover:text-[#E8E0D0]">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-[#E8E0D0]/60 hover:text-[#E8E0D0]">
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

                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs ml-2">
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
            {activeTab === 'radio' && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {radioChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      activeChannel.id === channel.id
                        ? 'bg-[#D4A843]/10 border-[#D4A843]/50'
                        : 'bg-[#111] border-[#222] hover:border-[#D4A843]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${channel.color} ${activeChannel.id === channel.id && isPlaying ? 'animate-pulse' : ''}`} />
                      <span className="text-sm font-medium text-[#E8E0D0]">{channel.name}</span>
                    </div>
                    <div className="text-xs text-[#E8E0D0]/50">{channel.genre} • {channel.frequency}</div>
                    <div className="text-xs text-[#E8E0D0]/30 mt-1">{channel.listeners} listeners</div>
                  </button>
                ))}
              </div>
            )}

            {/* Stream Info */}
            <div className="mt-4 p-4 bg-[#111] rounded-lg border border-[#222]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#E8E0D0]">
                    {activeTab === 'video' ? 'RRB Live Broadcast' : activeTab === 'radio' ? activeChannel.name : 'RRB Podcast Network'}
                  </h3>
                  <p className="text-sm text-[#E8E0D0]/60 mt-1">
                    Canryn Production • A Voice for the Voiceless • Sweet Miracles
                  </p>
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
                {['Sweet Miracles', 'Elder Advocacy', 'SQUADD Goals', 'Healing Frequencies', 'Selma Jubilee', 'UN CSW70'].map(tag => (
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
                { label: 'Selma Event', path: '/selma', icon: MapPin },
                { label: 'RRB Radio', path: '/rrb-radio', icon: Radio },
                { label: 'Ecosystem', path: '/', icon: Music },
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
                    <span className="text-xs text-[#E8E0D0]/50">{listenerCount} online</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[400px] lg:max-h-[500px]">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <div className="text-lg flex-shrink-0">{msg.avatar}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${msg.user === 'Va-Lanna' ? 'text-purple-400' : 'text-[#D4A843]'}`}>
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
    </div>
  );
}
