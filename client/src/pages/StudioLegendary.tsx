'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  Archive,
  Sparkles,
  Send,
  MessageCircle,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface Channel {
  id: number;
  name: string;
  description: string;
  frequency: string;
  status: 'live' | 'scheduled';
  listeners: number;
  currentShow: string;
  streamUrl?: string;
  streamFallback?: string;
  category: string;
  icon: string;
}

interface Recording {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  listeners: number;
  date: string;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface Setlist {
  id: string;
  title: string;
  songs: string[];
  duration: number;
  createdAt: Date;
}

const CHANNELS: Channel[] = [
  {
    id: 1,
    name: '432 Hz Pure',
    description: 'Pure 432 Hz healing frequency',
    frequency: '432 Hz',
    status: 'live',
    listeners: 312,
    currentShow: '432 Hz Continuous Stream',
    category: 'healing',
    icon: '🔔',
    streamUrl: 'https://ice5.somafm.com/7soul-128-mp3',
    streamFallback: 'https://ice3.somafm.com/7soul-128-mp3',
  },
  {
    id: 2,
    name: '528 Hz Miracle Tone',
    description: 'DNA repair and transformation',
    frequency: '528 Hz',
    status: 'live',
    listeners: 245,
    currentShow: '528 Hz Miracle Tone',
    category: 'healing',
    icon: '💎',
    streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3',
    streamFallback: 'https://ice3.somafm.com/bootliquor-128-mp3',
  },
  {
    id: 3,
    name: 'Soul & R&B Classics',
    description: 'Timeless soul and classic R&B',
    frequency: '432 Hz',
    status: 'live',
    listeners: 198,
    currentShow: 'Classic Soul Hour',
    category: 'music',
    icon: '🎤',
    streamUrl: 'https://ice5.somafm.com/bagel-128-mp3',
    streamFallback: 'https://ice3.somafm.com/bagel-128-mp3',
  },
  {
    id: 4,
    name: 'Jazz Lounge',
    description: 'Smooth jazz and bebop',
    frequency: '432 Hz',
    status: 'live',
    listeners: 89,
    currentShow: 'Smooth Jazz Evening',
    category: 'music',
    icon: '🎷',
    streamUrl: 'https://ice5.somafm.com/fluid-128-mp3',
    streamFallback: 'https://ice3.somafm.com/fluid-128-mp3',
  },
];

const RECORDINGS: Recording[] = [
  {
    id: 'rec-1',
    title: 'Healing Frequencies - Full Performance',
    artist: 'RRB Studio',
    duration: 3600,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    listeners: 2847,
    date: '2026-03-24',
  },
  {
    id: 'rec-2',
    title: 'Solfeggio Frequencies - 528 Hz',
    artist: 'RRB Studio',
    duration: 1800,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    listeners: 1523,
    date: '2026-03-23',
  },
  {
    id: 'rec-3',
    title: 'Soul Elevation - Live Band',
    artist: 'RRB Studio',
    duration: 2400,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    listeners: 3201,
    date: '2026-03-22',
  },
];

export function StudioLegendary() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState('channels');
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'Chris Battle Sr',
      message: 'Welcome to RRB Legendary Studio! 🎵',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      user: 'C.J. Battle',
      message: 'Ready for today\'s performance?',
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Setlist state
  const [setlists, setSetlists] = useState<Setlist[]>([
    {
      id: '1',
      title: 'Sunday Healing Session',
      songs: ['432 Hz Pure', '528 Hz Miracle Tone', 'Soul Elevation'],
      duration: 120,
      createdAt: new Date(),
    },
  ]);
  const [newSetlistName, setNewSetlistName] = useState('');

  const playChannel = useCallback((channelId: number) => {
    const channel = CHANNELS.find((c) => c.id === channelId);
    if (!channel) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;

    if (activeChannel === channelId && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setActiveChannel(null);
      toast.info('Stream paused');
    } else {
      audio.src = channel.streamUrl || '';
      audio.volume = isMuted ? 0 : volume / 100;

      audio.play().catch(() => {
        toast.error('Could not play stream');
      });

      setActiveChannel(channelId);
      setIsPlaying(true);
      toast.success(`Now playing: ${channel.currentShow}`, {
        description: `${channel.name} • ${channel.frequency}`,
      });
    }
  }, [activeChannel, isPlaying, volume, isMuted]);

  const playRecording = useCallback((recording: Recording) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;
    audio.src = recording.url;
    audio.volume = isMuted ? 0 : volume / 100;

    audio.play().catch(() => {
      toast.error('Could not play recording');
    });

    setIsPlaying(true);
    toast.success(`Now playing: ${recording.title}`);
  }, [volume, isMuted]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    toast.success('Message sent!');
  };

  const handleCreateSetlist = () => {
    if (!newSetlistName.trim()) return;

    const newSetlist: Setlist = {
      id: Date.now().toString(),
      title: newSetlistName,
      songs: [],
      duration: 0,
      createdAt: new Date(),
    };

    setSetlists([...setlists, newSetlist]);
    setNewSetlistName('');
    toast.success('Setlist created!');
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
          <Music className="w-10 h-10 text-purple-400" />
          RRB LEGENDARY STUDIO
        </h1>
        <p className="text-slate-400">Professional Audio & Video Production Ecosystem</p>
      </div>

      {/* Main Controls */}
      <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {activeChannel
                  ? CHANNELS.find((c) => c.id === activeChannel)?.currentShow
                  : 'Select a channel to begin'}
              </h3>
              <p className="text-slate-400 text-sm">
                {isPlaying ? '🎵 Now Playing' : 'Ready to play'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-slate-400 w-8">{volume}%</span>
              </div>

              <Button
                onClick={() => activeChannel && playChannel(activeChannel)}
                className={`${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold px-6`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/40 border border-slate-700/30">
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="setlist" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Setlist
          </TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHANNELS.map((channel) => (
              <Card
                key={channel.id}
                className={`bg-slate-800/40 border-slate-700/30 cursor-pointer transition-all ${
                  activeChannel === channel.id
                    ? 'ring-2 ring-purple-500 bg-slate-800/60'
                    : 'hover:bg-slate-800/50'
                }`}
                onClick={() => playChannel(channel.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">
                        {channel.icon} {channel.name}
                      </CardTitle>
                      <CardDescription>{channel.description}</CardDescription>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {channel.frequency} • {channel.listeners.toLocaleString()} listeners
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        playChannel(channel.id);
                      }}
                      size="sm"
                      className={
                        activeChannel === channel.id && isPlaying
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }
                    >
                      {activeChannel === channel.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          <div className="space-y-3">
            {RECORDINGS.map((recording) => (
              <Card key={recording.id} className="bg-slate-800/40 border-slate-700/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{recording.title}</h4>
                      <p className="text-sm text-slate-400">
                        {recording.artist} • {Math.floor(recording.duration / 60)} min •{' '}
                        {recording.listeners.toLocaleString()} listeners
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => playRecording(recording)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = recording.url;
                          link.download = `${recording.title}.mp3`;
                          link.click();
                        }}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30 h-96 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Band Member Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-purple-400">{msg.user}</span>
                    <span className="text-xs text-slate-500">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 ml-4">{msg.message}</p>
                </div>
              ))}
            </CardContent>
            <div className="border-t border-slate-700/30 p-4">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Setlist Tab */}
        <TabsContent value="setlist" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Create Setlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSetlistName}
                  onChange={(e) => setNewSetlistName(e.target.value)}
                  placeholder="Setlist name..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
                <Button
                  onClick={handleCreateSetlist}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {setlists.map((setlist) => (
                  <Card key={setlist.id} className="bg-slate-700/30 border-slate-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{setlist.title}</h4>
                          <p className="text-sm text-slate-400">
                            {setlist.songs.length} songs • {setlist.duration} min
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setSetlists(setlists.filter((s) => s.id !== setlist.id));
                            toast.success('Setlist deleted');
                          }}
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden audio element */}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );
}
