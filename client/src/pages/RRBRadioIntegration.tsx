import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Play, Pause, SkipForward, Volume2, VolumeX, Radio, Heart,
  Share2, Users, Music, Headphones, Wifi, Globe, ArrowRight,
  Calendar, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// RRB Radio Channels — matching the Live Stream page
const channels = [
  {
    id: 1, name: 'RRB Main', icon: '📻', genre: 'Mixed',
    frequency: '432 Hz', color: 'from-purple-600 to-blue-600',
    description: 'Flagship channel — music, talk, community voices. The heartbeat of Canryn Production.',
    streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv',
    listeners: 127, nowPlaying: 'Community Hour with Sweet Miracles',
  },
  {
    id: 2, name: 'Gospel Hour', icon: '🙏', genre: 'Gospel',
    frequency: '528 Hz', color: 'from-pink-600 to-rose-600',
    description: 'Uplifting gospel and spiritual music. The Love Frequency at 528 Hz.',
    streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
    listeners: 84, nowPlaying: 'Sunday Morning Praise',
  },
  {
    id: 3, name: 'Healing Frequencies', icon: '🧘', genre: 'Meditation',
    frequency: '432 Hz', color: 'from-green-600 to-emerald-600',
    description: 'Solfeggio frequencies — 432 Hz, 528 Hz, 639 Hz healing tones for mind and body.',
    streamUrl: 'https://stream.zeno.fm/4d6bhke3punuv',
    listeners: 203, nowPlaying: '432 Hz Deep Healing Session',
  },
  {
    id: 4, name: 'Community Talk', icon: '🎙️', genre: 'Talk Radio',
    frequency: 'Standard', color: 'from-orange-600 to-amber-600',
    description: 'Elder advocacy, civil rights, community voices. SQUADD Goals discussions.',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    listeners: 56, nowPlaying: 'SQUADD Goals Roundtable',
  },
  {
    id: 5, name: 'Jazz & Soul', icon: '🎷', genre: 'Jazz',
    frequency: '432 Hz', color: 'from-indigo-600 to-violet-600',
    description: 'Classic jazz, R&B, and soul — the soundtrack of legacy.',
    streamUrl: 'https://stream.zeno.fm/e3b75nnmhzzuv',
    listeners: 91, nowPlaying: 'Late Night Jazz Sessions',
  },
  {
    id: 6, name: 'Legacy Classics', icon: '🎵', genre: 'Classics',
    frequency: '432 Hz', color: 'from-yellow-600 to-orange-600',
    description: 'Honoring Seabrun Candy Hunter — classic hits and memories.',
    streamUrl: 'https://stream.zeno.fm/phr3gu5flzzuv',
    listeners: 68, nowPlaying: 'Seabrun Hunter Legacy Mix',
  },
];

export const RRBRadioIntegration: React.FC = () => {
  const [, navigate] = useLocation();
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [totalListeners, setTotalListeners] = useState(629);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      setAudioError('Stream temporarily unavailable. Try another channel.');
      setIsPlaying(false);
    });
    audio.addEventListener('playing', () => setAudioError(null));

    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Listener count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalListeners(prev => Math.max(400, prev + Math.floor(Math.random() * 11) - 5));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleChannelSelect = (channel: typeof channels[0]) => {
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedChannel(channel);
    setAudioError(null);
    if (wasPlaying && audioRef.current) {
      audioRef.current.src = channel.streamUrl;
      audioRef.current.play().catch(() => {
        setAudioError('Tap play to start streaming');
        setIsPlaying(false);
      });
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAudioError(null);
      audioRef.current.src = selectedChannel.streamUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        setAudioError('Unable to connect. Please try again.');
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#D4A843]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#0A0A0A] to-[#1A3A5C]/20" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#D4A843]">RRB Radio</h1>
              <p className="text-[#E8E0D0]/60">Rockin' Rockin' Boogie • Payten Music (BMI) • Canryn Production</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#E8E0D0]/50">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#D4A843]" /> {channels.length} Channels
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D4A843]" /> {totalListeners} Listeners
            </span>
            <span className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-green-500" /> 24/7 Live
            </span>
            <span className="flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#D4A843]" /> 432 Hz Tuned
            </span>
          </div>
        </div>
      </div>

      {/* Now Playing Bar */}
      <div className="bg-[#111] border-b border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="w-14 h-14 rounded-full bg-[#D4A843] hover:bg-[#E8C860] transition-colors flex items-center justify-center text-[#0A0A0A] flex-shrink-0"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedChannel.icon}</span>
                  <h2 className="text-xl font-bold text-[#E8E0D0]">{selectedChannel.name}</h2>
                  {isPlaying && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse text-xs">
                      LIVE
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[#E8E0D0]/50">
                  {selectedChannel.genre} • {selectedChannel.frequency} • {selectedChannel.nowPlaying}
                </p>
                {audioError && <p className="text-xs text-amber-400 mt-1">{audioError}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="text-[#E8E0D0]/60 hover:text-[#E8E0D0]">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range" min="0" max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(parseInt(e.target.value)); setIsMuted(false); }}
                  className="w-24 h-1 accent-[#D4A843]"
                />
              </div>
              <span className="text-xs text-[#E8E0D0]/40 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" /> {selectedChannel.listeners}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#D4A843] mb-6">Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelSelect(channel)}
              className={`text-left p-5 rounded-lg border transition-all ${
                selectedChannel.id === channel.id
                  ? 'bg-[#D4A843]/10 border-[#D4A843]/50'
                  : 'bg-[#111] border-[#222] hover:border-[#D4A843]/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${channel.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {channel.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#E8E0D0]">{channel.name}</h3>
                    {selectedChannel.id === channel.id && isPlaying && (
                      <div className="flex gap-0.5">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-1 bg-[#D4A843] rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#D4A843]/70 mb-1">{channel.genre} • {channel.frequency}</p>
                  <p className="text-xs text-[#E8E0D0]/40 line-clamp-2">{channel.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#E8E0D0]/30">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {channel.listeners}</span>
                    <span className="italic truncate">{channel.nowPlaying}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Frequency Info */}
      <div className="border-t border-[#D4A843]/10 bg-[#111]/50">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-[#D4A843] mb-6">Healing Frequencies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { hz: '432 Hz', name: 'Universal Harmony', desc: 'Natural tuning — reduces anxiety, promotes calm' },
              { hz: '528 Hz', name: 'Love Frequency', desc: 'DNA repair, transformation, miracles' },
              { hz: '639 Hz', name: 'Connection', desc: 'Harmonizing relationships, communication' },
              { hz: '741 Hz', name: 'Awakening', desc: 'Intuition, problem solving, self-expression' },
            ].map(freq => (
              <div key={freq.hz} className="p-4 bg-[#0A0A0A] border border-[#D4A843]/10 rounded-lg">
                <p className="text-2xl font-bold text-[#D4A843] mb-1">{freq.hz}</p>
                <p className="text-sm font-semibold text-[#E8E0D0]/80 mb-1">{freq.name}</p>
                <p className="text-xs text-[#E8E0D0]/40">{freq.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860]" onClick={() => navigate('/live')}>
              <Radio className="w-4 h-4 mr-2" /> Live Stream
            </Button>
            <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10" onClick={() => navigate('/selma')}>
              <MapPin className="w-4 h-4 mr-2" /> Selma Event
            </Button>
            <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10" onClick={() => navigate('/squadd')}>
              <Globe className="w-4 h-4 mr-2" /> SQUADD Goals
            </Button>
            <Button variant="outline" className="border-[#E8E0D0]/20 text-[#E8E0D0]/60 hover:bg-[#E8E0D0]/10" onClick={() => navigate('/')}>
              <ArrowRight className="w-4 h-4 mr-2" /> Ecosystem Home
            </Button>
          </div>
          <p className="text-center text-xs text-[#E8E0D0]/30 mt-6">
            Payten Music (BMI) • Canryn Production • In Honor of Seabrun Candy Hunter
          </p>
        </div>
      </div>
    </div>
  );
};

export default RRBRadioIntegration;
