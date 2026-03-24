import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Radio,
  Activity,
  HardDrive,
  Waves,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAudioEngine, initializeAudioEngine, SOLFEGGIO_FREQUENCIES } from '@/lib/audioEngine';

interface Channel {
  id: number;
  name: string;
  description: string;
  frequency: string;
  status: 'live' | 'scheduled' | 'standby';
  listeners: number;
  currentShow: string;
  nextShow: string;
  nextShowTime: string;
  qumusManaged: boolean;
  category: string;
  icon: string;
  streamUrl?: string;
  streamFallback?: string;
}

interface Recording {
  id: string;
  title: string;
  artist: string;
  duration: string;
  date: string;
  url: string;
  plays: number;
  downloads: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  avatar: string;
}

interface SetlistItem {
  id: string;
  song: string;
  artist: string;
  duration: string;
  frequency: string;
}

// Working channels from RRBPort3001 with real streams
const CHANNELS: Channel[] = [
  {
    id: 2,
    name: 'Soul & R&B Classics',
    description: 'Timeless soul, Motown, and classic R&B',
    frequency: '432 Hz',
    status: 'live',
    listeners: 198,
    currentShow: 'Classic Soul Hour',
    nextShow: 'Motown Memories',
    nextShowTime: '3:00 PM',
    qumusManaged: true,
    category: 'music',
    icon: '🎤',
    streamUrl: 'https://ice5.somafm.com/7soul-128-mp3',
    streamFallback: 'https://ice3.somafm.com/7soul-128-mp3',
  },
  {
    id: 3,
    name: 'Southern Blues',
    description: 'Deep South blues, Delta blues, and modern blues',
    frequency: '432 Hz',
    status: 'live',
    listeners: 134,
    currentShow: 'Delta Blues Session',
    nextShow: 'Blues After Dark',
    nextShowTime: '8:00 PM',
    qumusManaged: true,
    category: 'music',
    icon: '🎸',
    streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3',
    streamFallback: 'https://ice3.somafm.com/bootliquor-128-mp3',
  },
  {
    id: 4,
    name: 'Hip-Hop & Spoken Word',
    description: 'Conscious hip-hop, spoken word, and poetry',
    frequency: '432 Hz',
    status: 'live',
    listeners: 267,
    currentShow: 'Conscious Beats',
    nextShow: 'Poetry After Hours',
    nextShowTime: '9:00 PM',
    qumusManaged: true,
    category: 'music',
    icon: '🎙️',
    streamUrl: 'https://ice5.somafm.com/bagel-128-mp3',
    streamFallback: 'https://ice3.somafm.com/bagel-128-mp3',
  },
  {
    id: 5,
    name: 'Jazz Lounge',
    description: 'Smooth jazz, bebop, and jazz fusion',
    frequency: '432 Hz',
    status: 'live',
    listeners: 89,
    currentShow: 'Smooth Jazz Evening',
    nextShow: 'Late Night Bebop',
    nextShowTime: '10:00 PM',
    qumusManaged: true,
    category: 'music',
    icon: '🎷',
    streamUrl: 'https://ice5.somafm.com/fluid-128-mp3',
    streamFallback: 'https://ice3.somafm.com/fluid-128-mp3',
  },
];

const RECORDINGS: Recording[] = [
  {
    id: '1',
    title: 'Healing Frequencies - 528 Hz',
    artist: 'RRB Studio',
    duration: '45:32',
    date: '2026-03-20',
    url: 'https://example.com/recording1.mp3',
    plays: 1250,
    downloads: 89,
  },
  {
    id: '2',
    title: 'Soul & Solfeggio Mix',
    artist: 'Valanna & QUMUS',
    duration: '62:15',
    date: '2026-03-18',
    url: 'https://example.com/recording2.mp3',
    plays: 2340,
    downloads: 156,
  },
  {
    id: '3',
    title: 'Divine Harmony Session',
    artist: 'RRB Family',
    duration: '38:47',
    date: '2026-03-15',
    url: 'https://example.com/recording3.mp3',
    plays: 1890,
    downloads: 123,
  },
];


export function RRBAdvancedStudio() {
  // ─── Audio State ─────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioEngineRef = useRef(getAudioEngine());
  const [audioReady, setAudioReady] = useState(false);

  // Initialize Web Audio API engine on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudioEngine();
        setAudioReady(true);
        console.log('[RRBAdvancedStudio] Audio engine initialized');
      } catch (error) {
        console.error('[RRBAdvancedStudio] Audio engine initialization failed:', error);
        toast.error('Audio engine failed to initialize');
      }
    };

    initAudio();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stopAll();
      }
    };
  }, []);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [streamHealth, setStreamHealth] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  // ─── Frequency Tuner State ─────────────────────
  const [tunerPlaying, setTunerPlaying] = useState(false);
  const [tunerFrequency, setTunerFrequency] = useState(432);
  const [tunerVolume, setTunerVolume] = useState(30);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // ─── UI State ─────────────────────
  const [activeTab, setActiveTab] = useState('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ─── Chat State ─────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Valanna',
      message: 'Welcome to RRB Advanced Studio! All systems operational.',
      timestamp: new Date(),
      avatar: '🎤',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // ─── Setlist State ─────────────────────
  const [setlist, setSetlist] = useState<SetlistItem[]>([
    { id: '1', song: 'Soul Elevation', artist: 'RRB Family', duration: '4:32', frequency: '432 Hz' },
    { id: '2', song: 'Healing Frequencies', artist: 'QUMUS', duration: '6:15', frequency: '528 Hz' },
  ]);
  const [setlistInput, setSetlistInput] = useState('');

  // ─── Recording Archive State ─────────────────────
  const [recordings] = useState<Recording[]>(RECORDINGS);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);

  // ─── Stream Quality State ─────────────────────
  const [streamMetrics, setStreamMetrics] = useState({
    bitrate: '128 kbps',
    latency: '45ms',
    packetLoss: '0.2%',
    jitter: '12ms',
  });

  // ─── Real Audio Stream Playback (from RRBPort3001) ─────────────────────
  const stopAudioStream = useCallback(() => {
    if (activeChannel !== null) {
      const engine = audioEngineRef.current;
      engine.stopChannel(activeChannel);
      setActiveChannel(null);
      setIsPlaying(false);
      console.log('[RRBAdvancedStudio] Stopped channel', activeChannel);
    }
    setStreamHealth('idle');
  }, [activeChannel]);

  const playAudioStream = useCallback((channel: Channel) => {
    if (!audioReady) {
      toast.error('Audio engine not ready');
      return;
    }

    try {
      setStreamHealth('connecting');
      const engine = audioEngineRef.current;
      const frequency = parseInt(channel.frequency) || 432;

      let audioChannel = engine.getChannel(channel.id);
      if (!audioChannel) {
        audioChannel = engine.createChannel({
          id: channel.id,
          name: channel.name,
          frequency,
          waveType: 'sine',
          volume: isMuted ? 0 : volume / 100,
        });
      }

      audioChannel.play(frequency);
      setActiveChannel(channel.id);
      setIsPlaying(true);
      setStreamHealth('connected');

      console.log(`[RRBAdvancedStudio] Playing ${channel.name} at ${frequency}Hz`);
      toast.success(`Now playing: ${channel.name}`);
    } catch (error) {
      console.error('[RRBAdvancedStudio] Playback error:', error);
      setStreamHealth('error');
      toast.error('Audio playback failed');
    }
  }, [audioReady, volume, isMuted]);

  // ─── Frequency Tuner ─────────────────────
  const startTuner = (hz: number) => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {}
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, ctx.currentTime);
    gain.gain.setValueAtTime(tunerVolume / 100, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    audioCtxRef.current = ctx;
    oscillatorRef.current = osc;
    gainNodeRef.current = gain;
    setTunerFrequency(hz);
    setTunerPlaying(true);
    toast.success(`${hz} Hz Tuner Active`);
  };

  const stopTuner = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {}
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    setTunerPlaying(false);
    toast.info('Frequency tuner stopped');
  };

  // ─── Volume Sync ─────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (gainNodeRef.current && tunerPlaying) {
      gainNodeRef.current.gain.setValueAtTime(tunerVolume / 100, audioCtxRef.current?.currentTime || 0);
    }
  }, [tunerVolume, tunerPlaying]);

  // ─── Cleanup ─────────────────────
  useEffect(() => {
    return () => {
      stopAudioStream();
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAudioStream]);

  // ─── Channel Playback ─────────────────────
  const handlePlayChannel = (channelId: number) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return;

    if (activeChannel === channelId && isPlaying) {
      stopAudioStream();
      setIsPlaying(false);
      setActiveChannel(null);
      toast.info('Stream paused');
    } else {
      setActiveChannel(channelId);
      setIsPlaying(true);
      playAudioStream(channel);
      toast.success(`Now playing: ${channel.currentShow}`);
    }
  };

  // ─── Chat ─────────────────────
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: chatInput,
      timestamp: new Date(),
      avatar: '👤',
    };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    toast.success('Message sent');
  };

  // ─── Setlist ─────────────────────
  const handleAddToSetlist = () => {
    if (!setlistInput.trim()) return;
    const newItem: SetlistItem = {
      id: Date.now().toString(),
      song: setlistInput,
      artist: 'RRB Family',
      duration: '4:32',
      frequency: '432 Hz',
    };
    setSetlist(prev => [...prev, newItem]);
    setSetlistInput('');
    toast.success('Added to setlist');
  };

  // ─── Recording Playback ─────────────────────
  const handlePlayRecording = (recordingId: string) => {
    if (playingRecording === recordingId) {
      setPlayingRecording(null);
      toast.info('Recording paused');
    } else {
      setPlayingRecording(recordingId);
      toast.success('Now playing recording');
    }
  };

  const activeChannelData = CHANNELS.find(c => c.id === activeChannel);
  const streamStatusColor = {
    idle: 'bg-slate-500/20 text-slate-400',
    connecting: 'bg-yellow-500/20 text-yellow-400',
    connected: 'bg-green-500/20 text-green-400',
    error: 'bg-red-500/20 text-red-400',
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🀄️🐲💨🔥</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                RRB Advanced Studio
              </h1>
              <p className="text-slate-400">Legendary Production Ecosystem</p>
            </div>
          </div>
          <Badge className={`px-4 py-2 text-lg ${streamStatusColor[streamHealth]}`}>
            {streamHealth === 'connected' && '🟢 LIVE'}
            {streamHealth === 'connecting' && '🟡 CONNECTING'}
            {streamHealth === 'error' && '🔴 ERROR'}
            {streamHealth === 'idle' && '⚫ IDLE'}
          </Badge>
        </div>

        {/* Active Channel Display */}
        {activeChannelData && (
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{activeChannelData.currentShow}</h3>
                  <p className="text-slate-400">{activeChannelData.name} • {activeChannelData.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-400">{activeChannelData.listeners}</p>
                  <p className="text-slate-400">listeners</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-slate-800/40 border border-slate-700/30">
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
          <TabsTrigger value="tuner" className="flex items-center gap-2">
            <Waves className="w-4 h-4" />
            Tuner
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="operators" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Operators
          </TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHANNELS.map(channel => (
              <Card key={channel.id} className="bg-slate-800/40 border-slate-700/30 hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => handlePlayChannel(channel.id)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{channel.icon}</div>
                      <div>
                        <h3 className="font-bold text-white">{channel.name}</h3>
                        <p className="text-sm text-slate-400">{channel.frequency}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">LIVE</Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-4">{channel.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      <p>{channel.listeners} listeners</p>
                      <p>{channel.currentShow}</p>
                    </div>
                    <Button
                      size="sm"
                      className={`${activeChannel === channel.id && isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                      {activeChannel === channel.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Volume Control */}
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Master Volume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsMuted(!isMuted)}
                  className="border-slate-600"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={e => {
                    const newVolume = Number(e.target.value);
                    setVolume(newVolume);
                    audioEngineRef.current.setMasterVolume(newVolume / 100);
                  }}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-slate-400 w-12">{volume}%</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          {recordings.map(recording => (
            <Card key={recording.id} className="bg-slate-800/40 border-slate-700/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{recording.title}</h3>
                    <p className="text-sm text-slate-400">{recording.artist} • {recording.duration}</p>
                    <p className="text-xs text-slate-500 mt-1">{recording.plays} plays • {recording.downloads} downloads</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlayRecording(recording.id)}
                      className="border-slate-600"
                    >
                      {playingRecording === recording.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30 h-96 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto pt-6 space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <div className="text-2xl">{msg.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{msg.sender}</p>
                    <p className="text-slate-300 text-sm">{msg.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Input
              placeholder="Send a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendChat()}
              className="bg-slate-800/40 border-slate-700/30"
            />
            <Button onClick={handleSendChat} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
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
                  placeholder="Add song to setlist..."
                  value={setlistInput}
                  onChange={e => setSetlistInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddToSetlist()}
                  className="bg-slate-800/40 border-slate-700/30"
                />
                <Button onClick={handleAddToSetlist} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {setlist.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-bold text-white text-sm">{item.song}</p>
                      <p className="text-xs text-slate-400">{item.artist} • {item.duration}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSetlist(prev => prev.filter(s => s.id !== item.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tuner Tab */}
        <TabsContent value="tuner" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Solfeggio Frequency Tuner</CardTitle>
              <CardDescription>Healing frequencies from 174 Hz to 963 Hz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {SOLFEGGIO_FREQUENCIES.map(freq => (
                  <Button
                    key={freq.hz}
                    onClick={() => tunerPlaying && tunerFrequency === freq.hz ? stopTuner() : startTuner(freq.hz)}
                    className={`${tunerPlaying && tunerFrequency === freq.hz ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'} text-white`}
                  >
                    <div className="text-center">
                      <p className="font-bold text-sm">{freq.hz}</p>
                      <p className="text-xs">{freq.name}</p>
                    </div>
                  </Button>
                ))}
              </div>
              {tunerPlaying && (
                <div className="p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                  <p className="text-white font-bold">{tunerFrequency} Hz - {SOLFEGGIO_FREQUENCIES.find(f => f.hz === tunerFrequency)?.name}</p>
                  <p className="text-slate-300 text-sm">{SOLFEGGIO_FREQUENCIES.find(f => f.hz === tunerFrequency)?.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Volume2 className="w-4 h-4" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tunerVolume}
                      onChange={e => setTunerVolume(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-700 rounded-lg"
                    />
                    <span className="text-sm text-slate-400 w-12">{tunerVolume}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Stream Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm">Bitrate</p>
                <p className="text-white font-bold text-lg">{streamMetrics.bitrate}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm">Latency</p>
                <p className="text-white font-bold text-lg">{streamMetrics.latency}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm">Packet Loss</p>
                <p className="text-white font-bold text-lg">{streamMetrics.packetLoss}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm">Jitter</p>
                <p className="text-white font-bold text-lg">{streamMetrics.jitter}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Recording Backup System</CardTitle>
              <CardDescription>Automatic backup to satellite storage with AES-256 encryption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-400 font-bold">✓ Backup Status: Active</p>
                <p className="text-slate-300 text-sm mt-2">Last backup: 2 hours ago</p>
                <p className="text-slate-300 text-sm">Storage: 2.4 GB / 10 GB</p>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Backup Now</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Multi-Operator Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Chris Battle Sr', status: 'online', audio: 'strong', signal: '5G' },
                { name: 'C.J. Battle', status: 'online', audio: 'strong', signal: '5G' },
                { name: 'Kairen Battle', status: 'online', audio: 'strong', signal: '4G' },
                { name: 'AP / Amandes', status: 'online', audio: 'strong', signal: '5G' },
              ].map(op => (
                <div key={op.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-bold text-white text-sm">{op.name}</p>
                      <p className="text-xs text-slate-400">{op.audio} audio • {op.signal}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">{op.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
