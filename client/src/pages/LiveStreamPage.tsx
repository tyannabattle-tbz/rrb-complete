import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Radio, Wifi, Users, MessageCircle, Heart, Send,
  ChevronDown, Music, Mic, Video, Monitor, Settings,
  SkipForward, SkipBack, Headphones, Globe
} from 'lucide-react';

// Audio channels for RRB Radio
const radioChannels = [
  { id: 'main', name: 'RRB Main', genre: 'Mixed', frequency: '432 Hz', color: 'from-purple-600 to-blue-600' },
  { id: 'gospel', name: 'Gospel Hour', genre: 'Gospel', frequency: '528 Hz', color: 'from-pink-600 to-rose-600' },
  { id: 'healing', name: 'Healing Frequencies', genre: 'Meditation', frequency: '432 Hz', color: 'from-green-600 to-emerald-600' },
  { id: 'talk', name: 'Community Talk', genre: 'Talk Radio', frequency: 'Standard', color: 'from-orange-600 to-amber-600' },
  { id: 'jazz', name: 'Jazz & Soul', genre: 'Jazz', frequency: '432 Hz', color: 'from-indigo-600 to-violet-600' },
  { id: 'legacy', name: 'Legacy Classics', genre: 'Classics', frequency: '432 Hz', color: 'from-yellow-600 to-orange-600' },
];

// Simulated live chat messages
const initialMessages = [
  { id: 1, user: 'CommunityVoice', message: 'Love the healing frequencies today!', time: '2m ago', avatar: '🎵' },
  { id: 2, user: 'SelmaPride', message: 'Ready for the Jubilee presentation!', time: '5m ago', avatar: '✊' },
  { id: 3, user: 'GhanaConnect', message: 'Greetings from Accra! SQUADD Goals!', time: '8m ago', avatar: '🌍' },
  { id: 4, user: 'SweetMiracles', message: 'A Voice for the Voiceless', time: '12m ago', avatar: '💝' },
];

export default function LiveStreamPage() {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(radioChannels[0]);
  const [activeTab, setActiveTab] = useState<'video' | 'radio' | 'podcast'>('video');
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [listenerCount, setListenerCount] = useState(47);
  const [showChat, setShowChat] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate listener count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
          <div className="flex items-center justify-between">
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
                  onClick={() => setActiveTab(tab.id)}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className={`grid ${showChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {/* Video / Stream Area */}
          <div className={showChat ? 'lg:col-span-2' : ''}>
            <div ref={videoRef} className="relative bg-[#111] rounded-lg overflow-hidden aspect-video">
              {/* Video Display Area */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#111] to-[#0A0A0A]">
                {activeTab === 'video' ? (
                  <div className="text-center">
                    {/* Animated visualization */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${activeChannel.color} opacity-20 ${isPlaying ? 'animate-ping' : ''}`} />
                      <div className={`absolute inset-2 rounded-full bg-gradient-to-r ${activeChannel.color} opacity-30 ${isPlaying ? 'animate-pulse' : ''}`} />
                      <div className={`absolute inset-4 rounded-full bg-gradient-to-r ${activeChannel.color} flex items-center justify-center`}>
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#D4A843] mb-2">RRB Live Stream</h2>
                    <p className="text-[#E8E0D0]/60 text-sm mb-1">Canryn Production Broadcasting</p>
                    <p className="text-[#E8E0D0]/40 text-xs">A Voice for the Voiceless</p>
                  </div>
                ) : activeTab === 'radio' ? (
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${activeChannel.color} opacity-20 ${isPlaying ? 'animate-ping' : ''}`} />
                      <div className={`absolute inset-2 rounded-full bg-gradient-to-r ${activeChannel.color} opacity-30 ${isPlaying ? 'animate-pulse' : ''}`} />
                      <div className={`absolute inset-4 rounded-full bg-gradient-to-r ${activeChannel.color} flex items-center justify-center`}>
                        <Radio className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#D4A843] mb-2">{activeChannel.name}</h2>
                    <p className="text-[#E8E0D0]/60 text-sm mb-1">{activeChannel.genre} • {activeChannel.frequency}</p>
                    <p className="text-[#E8E0D0]/40 text-xs">Registered through Payten Music in BMI</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#D4A843] to-[#8B1A1A] opacity-20 ${isPlaying ? 'animate-ping' : ''}`} />
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
                {/* Progress bar */}
                <div className="w-full h-1 bg-[#333] rounded-full mb-3 cursor-pointer group">
                  <div className="h-full bg-[#D4A843] rounded-full w-1/3 group-hover:bg-[#E8C860] transition-colors relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#D4A843] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
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

                    <span className="text-xs text-[#E8E0D0]/40 ml-2">LIVE</span>
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
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${channel.color}`} />
                      <span className="text-sm font-medium text-[#E8E0D0]">{channel.name}</span>
                    </div>
                    <div className="text-xs text-[#E8E0D0]/50">{channel.genre} • {channel.frequency}</div>
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
                  >
                    <Heart className="w-3.5 h-3.5 mr-1" /> Support
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E8E0D0]/20 text-[#E8E0D0]/60 hover:bg-[#E8E0D0]/10 text-xs"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1" /> Share
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['Sweet Miracles', 'Elder Advocacy', 'SQUADD Goals', 'Healing Frequencies', 'Community'].map(tag => (
                  <Badge key={tag} className="bg-[#1A3A5C]/20 text-[#E8E0D0]/60 border-[#1A3A5C]/30 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
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
                          <span className="text-xs font-semibold text-[#D4A843]">{msg.user}</span>
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
