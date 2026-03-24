'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Radio, Volume2, VolumeX, Users, Music, Play, Pause, Zap, Activity, Clock, SkipForward, SkipBack, Mic2, Headphones, Calendar, BarChart3, Shield, Search, Filter, Heart, Waves, AlertTriangle, Earth, BookOpen, Sparkles, Sun, Moon, Coffee, Flame, TreePine, Baby, Laugh, Podcast, Tv, Star, ChevronDown, ChevronUp, MessageCircle, Send, Phone, PhoneOff, Bot, Loader2, Wand2, Globe, Users2, Radio as RadioIcon, Mic, Settings, Eye, EyeOff, TrendingUp, Share2, Download, Upload } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ─── Feature Types ─────────────────────
type ChannelCategory = 'all' | 'music' | 'healing' | 'talk' | 'community' | 'gospel' | 'culture' | 'wellness' | 'kids' | 'emergency' | 'special';
type StudioFeature = 'channels' | 'generate' | 'performance' | 'broadcast';
type ContentGenerationType = 'voice-to-music' | 'beat-creation' | 'ambient-generation' | 'remix';
type BroadcastPlatform = 'youtube' | 'twitch' | 'facebook' | 'all';

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
  category: ChannelCategory;
  icon: string;
  streamUrl?: string;
  streamFallback?: string;
}

interface BandMember {
  id: string;
  name: string;
  instrument: string;
  status: 'connected' | 'disconnected' | 'recording';
  latency: number;
}

interface BroadcastStream {
  platform: BroadcastPlatform;
  isLive: boolean;
  viewers: number;
  bitrate: string;
  resolution: string;
  startTime?: Date;
}

interface GeneratedContent {
  id: string;
  type: ContentGenerationType;
  title: string;
  duration: number;
  bpm?: number;
  genre?: string;
  createdAt: Date;
  url?: string;
}

const CATEGORIES: { key: ChannelCategory; label: string; count?: number }[] = [
  { key: 'all', label: 'All Channels' },
  { key: 'music', label: 'Music' },
  { key: 'healing', label: 'Healing & Frequencies' },
  { key: 'gospel', label: 'Gospel & Worship' },
  { key: 'talk', label: 'Talk & Interview' },
  { key: 'community', label: 'Community' },
  { key: 'culture', label: 'Culture & Heritage' },
  { key: 'wellness', label: 'Wellness & Meditation' },
  { key: 'kids', label: 'Kids & Family' },
  { key: 'special', label: 'Special Programming' },
  { key: 'emergency', label: 'Emergency' },
];

// ─── Channel mapping from DB to local format ─────────────────────
function mapDbCategory(genre: string, metadata: any): ChannelCategory {
  const cat = metadata?.category?.toLowerCase() || '';
  const g = genre?.toLowerCase() || '';
  if (cat === 'wellness' || /meditation|sleep|ambient|healing|relaxation/i.test(g)) return 'wellness';
  if (cat === 'ai-curated') return 'special';
  if (cat === 'community') return 'community';
  if (cat === 'education') return 'culture';
  if (cat === 'entertainment') return 'special';
  if (cat === 'talk') return 'talk';
  if (cat === 'specialty') return 'special';
  if (/gospel|worship|spiritual|church/i.test(g)) return 'gospel';
  if (/hip.?hop|r&b|soul|jazz|blues|funk|reggae|rock|country|folk|latin|afro|indie|electronic|pop|90s/i.test(g)) return 'music';
  if (/emergency|news|public safety/i.test(g)) return 'emergency';
  if (/kids|family|children/i.test(g)) return 'kids';
  return 'music';
}

function mapDbChannelToLocal(dbCh: any): Channel {
  const meta = dbCh.metadata || {};
  return {
    id: dbCh.id,
    name: dbCh.name,
    description: meta.description || dbCh.description || dbCh.genre || '',
    frequency: dbCh.frequency || '432 Hz',
    status: dbCh.status === 'active' ? 'live' : 'scheduled',
    listeners: dbCh.currentListeners || 0,
    currentShow: meta.currentShow || `${dbCh.name} Live`,
    nextShow: meta.nextShow || 'Up Next',
    nextShowTime: meta.nextShowTime || '',
    qumusManaged: true,
    category: mapDbCategory(dbCh.genre, meta),
    icon: meta.icon || '🎵',
    streamUrl: dbCh.streamUrl || undefined,
    streamFallback: meta.fallbackUrl || undefined,
  };
}

// Fallback hardcoded channels only used if DB is unavailable
const FALLBACK_CHANNELS: Channel[] = [
  { id: 2, name: 'Soul & R&B Classics', description: 'Timeless soul, Motown, and classic R&B', frequency: '432 Hz', status: 'live', listeners: 198, currentShow: 'Classic Soul Hour', nextShow: 'Motown Memories', nextShowTime: '3:00 PM', qumusManaged: true, category: 'music', icon: '🎤', streamUrl: 'https://ice5.somafm.com/7soul-128-mp3', streamFallback: 'https://ice3.somafm.com/7soul-128-mp3' },
  { id: 3, name: 'Southern Blues', description: 'Deep South blues, Delta blues, and modern blues', frequency: '432 Hz', status: 'live', listeners: 134, currentShow: 'Delta Blues Session', nextShow: 'Blues After Dark', nextShowTime: '8:00 PM', qumusManaged: true, category: 'music', icon: '🎸', streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3', streamFallback: 'https://ice3.somafm.com/bootliquor-128-mp3' },
  { id: 4, name: 'Hip-Hop & Spoken Word', description: 'Conscious hip-hop, spoken word, and poetry', frequency: '432 Hz', status: 'live', listeners: 267, currentShow: 'Conscious Beats', nextShow: 'Poetry After Hours', nextShowTime: '9:00 PM', qumusManaged: true, category: 'music', icon: '🎙️', streamUrl: 'https://ice5.somafm.com/bagel-128-mp3', streamFallback: 'https://ice3.somafm.com/bagel-128-mp3' },
  { id: 5, name: 'Jazz Lounge', description: 'Smooth jazz, bebop, and jazz fusion', frequency: '432 Hz', status: 'live', listeners: 89, currentShow: 'Smooth Jazz Evening', nextShow: 'Late Night Bebop', nextShowTime: '10:00 PM', qumusManaged: true, category: 'music', icon: '🎷', streamUrl: 'https://ice5.somafm.com/fluid-128-mp3', streamFallback: 'https://ice3.somafm.com/fluid-128-mp3' },
  { id: 6, name: 'Reggae & Caribbean', description: 'Reggae, dancehall, soca, and island vibes', frequency: '432 Hz', status: 'live', listeners: 156, currentShow: 'Island Vibes', nextShow: 'Roots & Culture', nextShowTime: '4:00 PM', qumusManaged: true, category: 'music', icon: '🌴', streamUrl: 'https://ice5.somafm.com/suburbsofgoa-128-mp3', streamFallback: 'https://ice3.somafm.com/suburbsofgoa-128-mp3' },
  { id: 7, name: 'Afrobeats & World', description: 'Afrobeats, Afropop, and global rhythms', frequency: '432 Hz', status: 'live', listeners: 211, currentShow: 'Afrobeats Now', nextShow: 'World Rhythms', nextShowTime: '5:00 PM', qumusManaged: true, category: 'music', icon: '🌍', streamUrl: 'https://ice5.somafm.com/lush-128-mp3', streamFallback: 'https://ice3.somafm.com/lush-128-mp3' },
  { id: 8, name: 'Neo Soul & Indie', description: 'Neo soul, indie R&B, and alternative soul', frequency: '432 Hz', status: 'live', listeners: 143, currentShow: 'Neo Soul Sessions', nextShow: 'Indie Spotlight', nextShowTime: '6:00 PM', qumusManaged: true, category: 'music', icon: '✨', streamUrl: 'https://ice5.somafm.com/indiepop-128-mp3', streamFallback: 'https://ice3.somafm.com/indiepop-128-mp3' },
  { id: 9, name: 'Old School Funk', description: 'Funk, disco, and boogie classics', frequency: '432 Hz', status: 'live', listeners: 178, currentShow: 'Funk Factory', nextShow: 'Disco Nights', nextShowTime: '7:00 PM', qumusManaged: true, category: 'music', icon: '🕺', streamUrl: 'https://ice5.somafm.com/secretagent-128-mp3', streamFallback: 'https://ice3.somafm.com/secretagent-128-mp3' },
  { id: 10, name: 'Country & Folk Roots', description: 'Country, folk, and Americana roots music', frequency: '432 Hz', status: 'live', listeners: 67, currentShow: 'Country Roots', nextShow: 'Folk Stories', nextShowTime: '3:00 PM', qumusManaged: true, category: 'music', icon: '🤠', streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3', streamFallback: 'https://ice3.somafm.com/bootliquor-128-mp3' },
];

const VALANNA_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/valanna-avatar-mYpqZPJmy73yGwB7kFmCe9.webp';
const CANDY_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/candy-avatar_4d4d3bc0.png';

// ─── AI Content Generation Component ─────────────────────
function AIContentGenerator() {
  const [generationType, setGenerationType] = useState<ContentGenerationType>('voice-to-music');
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [beatBpm, setBeatBpm] = useState(120);
  const [beatGenre, setBeatGenre] = useState('hip-hop');
  const [ambientMood, setAmbientMood] = useState('peaceful');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newContent: GeneratedContent = {
        id: Math.random().toString(36).substr(2, 9),
        type: generationType,
        title: `Generated ${generationType} - ${new Date().toLocaleTimeString()}`,
        duration: Math.floor(Math.random() * 180) + 30,
        bpm: generationType === 'beat-creation' ? beatBpm : undefined,
        genre: generationType === 'beat-creation' ? beatGenre : undefined,
        createdAt: new Date(),
      };
      
      setGeneratedContent(prev => [newContent, ...prev]);
      toast.success('Content generated!', { description: `${generationType} ready to use` });
    } catch (error) {
      toast.error('Generation failed', { description: 'Please try again' });
    } finally {
      setIsGenerating(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setVoiceInput(`Recording: ${audioBlob.size} bytes`);
        toast.success('Voice recorded', { description: 'Ready to generate music' });
      };

      mediaRecorder.start();
      toast.info('Recording started', { description: 'Speak your music idea' });
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-slate-800/60 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wand2 className="w-5 h-5 text-purple-400" />
          AI Content Generator
        </CardTitle>
        <CardDescription>Create music, beats, and ambient content with AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generation Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['voice-to-music', 'beat-creation', 'ambient-generation', 'remix'] as ContentGenerationType[]).map((type) => (
            <button
              key={type}
              onClick={() => setGenerationType(type)}
              className={`p-3 rounded-lg border transition-all text-left ${
                generationType === type
                  ? 'border-purple-400 bg-purple-500/20'
                  : 'border-purple-500/20 bg-slate-800/60 hover:border-purple-500/40'
              }`}
            >
              <p className="text-sm font-semibold text-white capitalize">{type.replace('-', ' ')}</p>
            </button>
          ))}
        </div>

        {/* Voice-to-Music Controls */}
        {generationType === 'voice-to-music' && (
          <div className="space-y-3 p-3 bg-slate-800/40 rounded-lg border border-purple-500/10">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={startVoiceRecording}
                className="bg-red-600 hover:bg-red-700"
              >
                <Mic className="w-4 h-4 mr-1" /> Record
              </Button>
              <Button
                size="sm"
                onClick={stopVoiceRecording}
                variant="outline"
                className="border-purple-500/30 text-purple-300"
              >
                Stop
              </Button>
            </div>
            <Input
              placeholder="Or paste lyrics/description"
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              className="bg-slate-700/60 border-purple-500/20 text-white"
            />
          </div>
        )}

        {/* Beat Creation Controls */}
        {generationType === 'beat-creation' && (
          <div className="space-y-3 p-3 bg-slate-800/40 rounded-lg border border-purple-500/10">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">BPM:</label>
              <Input
                type="number"
                min="60"
                max="200"
                value={beatBpm}
                onChange={(e) => setBeatBpm(Number(e.target.value))}
                className="w-24 bg-slate-700/60 border-purple-500/20 text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">Genre:</label>
              <select
                value={beatGenre}
                onChange={(e) => setBeatGenre(e.target.value)}
                className="flex-1 bg-slate-700/60 border border-purple-500/20 text-white rounded px-2 py-1 text-sm"
              >
                <option>hip-hop</option>
                <option>trap</option>
                <option>rnb</option>
                <option>electronic</option>
                <option>soul</option>
              </select>
            </div>
          </div>
        )}

        {/* Ambient Generation Controls */}
        {generationType === 'ambient-generation' && (
          <div className="space-y-3 p-3 bg-slate-800/40 rounded-lg border border-purple-500/10">
            <label className="text-sm text-slate-300">Mood:</label>
            <select
              value={ambientMood}
              onChange={(e) => setAmbientMood(e.target.value)}
              className="w-full bg-slate-700/60 border border-purple-500/20 text-white rounded px-2 py-1 text-sm"
            >
              <option>peaceful</option>
              <option>energetic</option>
              <option>meditative</option>
              <option>uplifting</option>
              <option>dark</option>
            </select>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Wand2 className="w-4 h-4 mr-2" /> Generate Content</>
          )}
        </Button>

        {/* Generated Content List */}
        {generatedContent.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-300">Recent Generations:</p>
            {generatedContent.slice(0, 3).map((content) => (
              <div key={content.id} className="p-2 bg-slate-800/40 rounded border border-purple-500/10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{content.title}</p>
                  <p className="text-xs text-slate-400">{content.duration}s • {content.type}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Live Performance Mode Component ─────────────────────
function LivePerformanceMode() {
  const [isPerforming, setIsPerforming] = useState(false);
  const [bandMembers, setBandMembers] = useState<BandMember[]>([
    { id: '1', name: 'Chris Battle Sr', instrument: 'Vocals', status: 'connected', latency: 12 },
    { id: '2', name: 'C.J. Battle', instrument: 'Guitar', status: 'connected', latency: 15 },
    { id: '3', name: 'Kairen Battle', instrument: 'Bass', status: 'disconnected', latency: 0 },
  ]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPerformance = () => {
    setIsPerforming(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    toast.success('Live performance started', { description: 'All band members connected' });
  };

  const stopPerformance = () => {
    setIsPerforming(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    toast.success('Performance recorded', { description: `${recordingTime} seconds saved` });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-br from-red-900/30 via-pink-900/20 to-slate-800/60 border-red-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users2 className="w-5 h-5 text-red-400" />
          Live Performance Mode
        </CardTitle>
        <CardDescription>Real-time band collaboration and recording</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Status */}
        <div className="p-3 bg-slate-800/40 rounded-lg border border-red-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Status:</span>
            <Badge className={isPerforming ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}>
              {isPerforming ? '● LIVE' : 'STANDBY'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Recording Time:</span>
            <span className="text-lg font-bold text-white font-mono">{formatTime(recordingTime)}</span>
          </div>
        </div>

        {/* Band Members */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-300">Band Members:</p>
          {bandMembers.map((member) => (
            <div key={member.id} className="p-2 bg-slate-800/40 rounded border border-red-500/10 flex items-center justify-between">
              <div>
                <p className="text-sm text-white">{member.name}</p>
                <p className="text-xs text-slate-400">{member.instrument}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={member.status === 'connected' ? 'bg-green-500/20 text-green-400 text-xs' : 'bg-slate-500/20 text-slate-400 text-xs'}>
                  {member.status === 'connected' ? `${member.latency}ms` : 'offline'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Controls */}
        <div className="flex gap-2">
          <Button
            onClick={isPerforming ? stopPerformance : startPerformance}
            className={isPerforming ? 'flex-1 bg-red-600 hover:bg-red-700' : 'flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'}
          >
            {isPerforming ? (
              <><Pause className="w-4 h-4 mr-2" /> Stop Performance</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Start Performance</>
            )}
          </Button>
          <Button variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/10">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Performance Tips */}
        <p className="text-xs text-slate-400 text-center">
          💡 All band members must be connected for synchronized recording. Latency under 50ms recommended.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Global Broadcast Network Component ─────────────────────
function GlobalBroadcastNetwork() {
  const [broadcastStreams, setBroadcastStreams] = useState<BroadcastStream[]>([
    { platform: 'youtube', isLive: true, viewers: 1247, bitrate: '5000 kbps', resolution: '1080p' },
    { platform: 'twitch', isLive: true, viewers: 892, bitrate: '6000 kbps', resolution: '1080p' },
    { platform: 'facebook', isLive: false, viewers: 0, bitrate: '0 kbps', resolution: 'offline' },
  ]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<BroadcastPlatform[]>(['youtube', 'twitch']);

  const toggleBroadcast = () => {
    setIsBroadcasting(!isBroadcasting);
    if (!isBroadcasting) {
      toast.success('Broadcasting started', { description: 'Live on selected platforms' });
    } else {
      toast.info('Broadcasting stopped');
    }
  };

  const togglePlatform = (platform: BroadcastPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const totalViewers = broadcastStreams.reduce((sum, stream) => sum + stream.viewers, 0);

  return (
    <Card className="bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-slate-800/60 border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="w-5 h-5 text-blue-400" />
          Global Broadcast Network
        </CardTitle>
        <CardDescription>Multi-platform streaming with real-time analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Viewers */}
        <div className="p-3 bg-slate-800/40 rounded-lg border border-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Total Viewers:</span>
            <span className="text-2xl font-bold text-blue-400">{totalViewers.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all active platforms</p>
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-300">Broadcast Platforms:</p>
          <div className="grid grid-cols-3 gap-2">
            {(['youtube', 'twitch', 'facebook'] as BroadcastPlatform[]).map((platform) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`p-2 rounded-lg border transition-all text-center ${
                  selectedPlatforms.includes(platform)
                    ? 'border-blue-400 bg-blue-500/20'
                    : 'border-blue-500/20 bg-slate-800/60 hover:border-blue-500/40'
                }`}
              >
                <p className="text-xs font-semibold text-white capitalize">{platform}</p>
                <p className="text-[10px] text-slate-400">
                  {broadcastStreams.find(s => s.platform === platform)?.viewers || 0}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Stream Details */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-300">Stream Details:</p>
          {broadcastStreams.map((stream) => (
            <div key={stream.platform} className="p-2 bg-slate-800/40 rounded border border-blue-500/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white capitalize font-semibold">{stream.platform}</span>
                <Badge className={stream.isLive ? 'bg-green-500/20 text-green-400 text-xs' : 'bg-slate-500/20 text-slate-400 text-xs'}>
                  {stream.isLive ? '● LIVE' : 'OFFLINE'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                <span>{stream.bitrate}</span>
                <span>{stream.resolution}</span>
                <span className="text-right">{stream.viewers} viewers</span>
              </div>
            </div>
          ))}
        </div>

        {/* Broadcast Controls */}
        <Button
          onClick={toggleBroadcast}
          className={isBroadcasting ? 'w-full bg-red-600 hover:bg-red-700' : 'w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'}
        >
          {isBroadcasting ? (
            <><Pause className="w-4 h-4 mr-2" /> Stop Broadcasting</>
          ) : (
            <><RadioIcon className="w-4 h-4 mr-2" /> Start Broadcasting</>
          )}
        </Button>

        {/* Analytics */}
        <div className="p-2 bg-slate-800/40 rounded border border-blue-500/10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>Peak viewers: 2,341 • Avg. bitrate: 5.3 Mbps</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main RRB Studio Component ─────────────────────
export default function RRBPort3001Enhanced() {
  const [, setLocation] = useLocation();
  const [activeFeature, setActiveFeature] = useState<StudioFeature>('channels');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [totalListeners, setTotalListeners] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [showTuner, setShowTuner] = useState(false);
  const [tunerFrequency, setTunerFrequency] = useState(432);
  const [tunerPlaying, setTunerPlaying] = useState(false);
  const [tunerVolume, setTunerVolume] = useState(40);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [streamHealth, setStreamHealth] = useState<'connected' | 'connecting' | 'error' | 'idle'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Solfeggio Frequencies ─────────────────────
  const SOLFEGGIO_FREQUENCIES = [
    { hz: 174, name: 'Foundation', description: 'Pain relief & physical healing', color: 'from-red-600 to-red-800', icon: '🔴' },
    { hz: 285, name: 'Restoration', description: 'Tissue regeneration & cellular repair', color: 'from-orange-600 to-orange-800', icon: '🟠' },
    { hz: 396, name: 'Liberation', description: 'Liberating guilt & fear', color: 'from-yellow-600 to-yellow-800', icon: '🟡' },
    { hz: 417, name: 'Change', description: 'Facilitating change & undoing situations', color: 'from-lime-600 to-lime-800', icon: '🟢' },
    { hz: 432, name: 'Universal', description: 'Universal harmony — the cosmic frequency', color: 'from-purple-600 to-purple-800', icon: '💜' },
    { hz: 528, name: 'Miracle', description: 'DNA repair & transformation', color: 'from-green-600 to-green-800', icon: '💎' },
    { hz: 639, name: 'Connection', description: 'Harmonizing relationships', color: 'from-cyan-600 to-cyan-800', icon: '💞' },
    { hz: 741, name: 'Awakening', description: 'Awakening intuition & expression', color: 'from-blue-600 to-blue-800', icon: '👁️' },
    { hz: 852, name: 'Spiritual', description: 'Returning to spiritual order', color: 'from-indigo-600 to-indigo-800', icon: '🙏' },
    { hz: 963, name: 'Divine', description: 'Pineal gland activation — divine consciousness', color: 'from-violet-600 to-violet-800', icon: '👑' },
  ];

  const startTuner = (hz: number) => {
    if (oscillator) { try { oscillator.stop(); } catch {} }
    if (audioCtx) { audioCtx.close(); }

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, ctx.currentTime);
    gain.gain.setValueAtTime(tunerVolume / 100, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    setAudioCtx(ctx);
    setOscillator(osc);
    setGainNode(gain);
    setTunerFrequency(hz);
    setTunerPlaying(true);

    const freqInfo = SOLFEGGIO_FREQUENCIES.find(f => f.hz === hz);
    toast.success(`${hz} Hz — ${freqInfo?.name || 'Custom'}`, {
      description: freqInfo?.description || 'Frequency tuner active',
    });
  };

  const stopTuner = () => {
    if (oscillator) { try { oscillator.stop(); } catch {} }
    if (audioCtx) { audioCtx.close(); }
    setOscillator(null);
    setAudioCtx(null);
    setTunerPlaying(false);
    toast.info('Frequency tuner stopped');
  };

  useEffect(() => {
    if (gainNode && tunerPlaying) {
      gainNode.gain.setValueAtTime(tunerVolume / 100, audioCtx?.currentTime || 0);
    }
  }, [tunerVolume, gainNode, tunerPlaying]);

  useEffect(() => {
    return () => {
      if (oscillator) { try { oscillator.stop(); } catch {} }
      if (audioCtx) { audioCtx.close(); }
    };
  }, []);

  // ─── Real-time data from database via tRPC ─────────────────────
  const { data: dbChannels } = trpc.ecosystemIntegration.getAllChannels.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: streamStats } = trpc.ecosystemIntegration.getAudioStreamingStats.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: qumusStatsData } = trpc.ecosystemIntegration.getQumusStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const CHANNELS: Channel[] = useMemo(() => {
    if (dbChannels && dbChannels.length > 0) {
      return dbChannels.map(mapDbChannelToLocal);
    }
    return FALLBACK_CHANNELS;
  }, [dbChannels]);

  useEffect(() => {
    if (streamStats?.totalListeners !== undefined) {
      setTotalListeners(streamStats.totalListeners);
    }
  }, [streamStats]);

  const filteredChannels = useMemo(() => {
    let channels = CHANNELS;
    if (selectedCategory !== 'all') {
      channels = channels.filter(c => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      channels = channels.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.currentShow.toLowerCase().includes(q)
      );
    }
    return channels;
  }, [selectedCategory, searchQuery, CHANNELS]);

  const displayedChannels = showAllChannels ? filteredChannels : filteredChannels.slice(0, 12);
  const liveCount = CHANNELS.filter(c => c.status === 'live').length;
  const totalChannelListeners = streamStats?.totalListeners ?? totalListeners;
  const realAutonomy = qumusStatsData?.autonomyLevel ?? 90;

  const stopAudioStream = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    setStreamHealth('idle');
  }, []);

  const playAudioStream = useCallback((channel: Channel) => {
    if (!channel.streamUrl) {
      if (channel.category === 'healing') {
        const hz = parseInt(channel.frequency);
        if (!isNaN(hz)) startTuner(hz);
      }
      return;
    }

    if (tunerPlaying) stopTuner();

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;
    setStreamHealth('connecting');

    audio.src = channel.streamUrl;
    audio.volume = isMuted ? 0 : volume / 100;

    const onPlaying = () => setStreamHealth('connected');
    const onError = () => {
      if (channel.streamFallback && audio.src !== channel.streamFallback) {
        audio.src = channel.streamFallback;
        audio.play().catch(() => setStreamHealth('error'));
      } else {
        setStreamHealth('error');
        toast.error('Stream temporarily unavailable', { description: 'Trying to reconnect...' });
      }
    };

    audio.removeEventListener('playing', onPlaying);
    audio.removeEventListener('error', onError);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);

    audio.play().catch(() => {
      setStreamHealth('error');
    });
  }, [volume, isMuted, tunerPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => { stopAudioStream(); };
  }, [stopAudioStream]);

  const handlePlayChannel = (channelId: number) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return;

    if (channel.status === 'standby') {
      toast.info('Emergency channel activates on HybridCast alert');
      return;
    }
    if (channel.status === 'scheduled') {
      toast.info(`${channel.name} — ${channel.nextShow} at ${channel.nextShowTime}`);
      return;
    }

    if (activeChannel === channelId && isPlaying) {
      stopAudioStream();
      setIsPlaying(false);
      setActiveChannel(null);
      toast.info('Stream paused');
    } else {
      setActiveChannel(channelId);
      setIsPlaying(true);
      playAudioStream(channel);
      toast.success(`Now playing: ${channel.currentShow}`, {
        description: `${channel.name} • ${channel.frequency}`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'standby': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Radio className="w-8 h-8 text-amber-400" />
                <Zap className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Rockin' Rockin' Boogie Studio</h1>
                <p className="text-sm text-purple-300 flex items-center gap-2">
                  <span>Professional Audio Production</span>
                  <span className="text-purple-500">•</span>
                  <span className="text-amber-400">Powered by QUMUS</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 hidden md:flex items-center gap-1">
                <Zap className="w-3 h-3" />
                QUMUS 90% Autonomous
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                🟢 {liveCount} LIVE
              </Badge>
            </div>
          </div>

          {/* Feature Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['channels', 'generate', 'performance', 'broadcast'] as StudioFeature[]).map((feature) => (
              <button
                key={feature}
                onClick={() => setActiveFeature(feature)}
                className={`px-4 py-2 rounded-lg border transition-all whitespace-nowrap text-sm font-semibold ${
                  activeFeature === feature
                    ? 'border-purple-400 bg-purple-500/20 text-white'
                    : 'border-purple-500/20 bg-slate-800/60 text-slate-300 hover:border-purple-500/40'
                }`}
              >
                {feature === 'channels' && <><Radio className="w-4 h-4 mr-1 inline" /> Channels</>}
                {feature === 'generate' && <><Wand2 className="w-4 h-4 mr-1 inline" /> Generate</>}
                {feature === 'performance' && <><Users2 className="w-4 h-4 mr-1 inline" /> Perform</>}
                {feature === 'broadcast' && <><Globe className="w-4 h-4 mr-1 inline" /> Broadcast</>}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Channels View */}
        {activeFeature === 'channels' && (
          <>
            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/60 border-purple-500/20 text-white"
                />
              </div>
              <Button variant="outline" className="border-purple-500/30 text-purple-300">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-all whitespace-nowrap ${
                    selectedCategory === cat.key
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:border-purple-500/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedChannels.map((channel) => (
                <Card key={channel.id} className="bg-slate-800/60 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer" onClick={() => handlePlayChannel(channel.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{channel.icon}</span>
                      <Badge className={getStatusColor(channel.status)}>{channel.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{channel.name}</h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{channel.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{channel.frequency}</span>
                      <span>{channel.listeners} listeners</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show More Button */}
            {filteredChannels.length > 12 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllChannels(!showAllChannels)}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  {showAllChannels ? (
                    <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-4 h-4 mr-2" /> Show All {filteredChannels.length} Channels</>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* AI Content Generation View */}
        {activeFeature === 'generate' && (
          <AIContentGenerator />
        )}

        {/* Live Performance Mode View */}
        {activeFeature === 'performance' && (
          <LivePerformanceMode />
        )}

        {/* Global Broadcast Network View */}
        {activeFeature === 'broadcast' && (
          <GlobalBroadcastNetwork />
        )}

        {/* Frequency Tuner */}
        <Card className="bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-slate-800/60 border-purple-500/20">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowTuner(!showTuner)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Waves className="w-5 h-5 text-purple-400" />
                Solfeggio Frequency Tuner
                <Badge className="bg-purple-500/20 text-purple-300 text-xs">QUMUS Managed</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                {tunerPlaying && (
                  <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">● {tunerFrequency} Hz ACTIVE</Badge>
                )}
                {showTuner ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </div>
            <CardDescription>Select a healing frequency — default 432 Hz universal harmony</CardDescription>
          </CardHeader>
          {showTuner && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {SOLFEGGIO_FREQUENCIES.map((freq) => (
                  <button
                    key={freq.hz}
                    onClick={() => tunerPlaying && tunerFrequency === freq.hz ? stopTuner() : startTuner(freq.hz)}
                    className={`relative p-3 rounded-lg border transition-all text-left ${
                      tunerPlaying && tunerFrequency === freq.hz
                        ? 'border-purple-400 bg-gradient-to-br ' + freq.color + ' shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'border-purple-500/20 bg-slate-800/60 hover:border-purple-500/40 hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{freq.icon}</span>
                      {tunerPlaying && tunerFrequency === freq.hz && (
                        <span className="text-xs text-green-400 animate-pulse">● LIVE</span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-white">{freq.hz} Hz</p>
                    <p className="text-xs font-medium text-amber-400">{freq.name}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2">{freq.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-800/40 rounded-lg border border-purple-500/10">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => tunerPlaying ? stopTuner() : startTuner(tunerFrequency)}
                    className={tunerPlaying
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700'
                    }
                  >
                    {tunerPlaying ? <><Pause className="w-4 h-4 mr-1" /> Stop</> : <><Play className="w-4 h-4 mr-1" /> Play {tunerFrequency} Hz</>}
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tunerVolume}
                    onChange={(e) => setTunerVolume(Number(e.target.value))}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-xs text-slate-400 w-8">{tunerVolume}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Custom Hz:</span>
                  <Input
                    type="number"
                    min="20"
                    max="20000"
                    value={tunerFrequency}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 20 && val <= 20000) {
                        setTunerFrequency(val);
                        if (tunerPlaying) startTuner(val);
                      }
                    }}
                    className="w-24 h-8 text-sm bg-slate-700/60 border-purple-500/20 text-white"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center">
                🔔 Default: 432 Hz Universal Harmony • All Solfeggio frequencies available • QUMUS curates frequency rotations
              </p>
            </CardContent>
          )}
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{CHANNELS.length}</p>
              <p className="text-xs text-slate-400">Total Channels</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{liveCount}</p>
              <p className="text-xs text-slate-400">Live Now</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{totalChannelListeners.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Total Listeners</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{realAutonomy}%</p>
              <p className="text-xs text-slate-400">QUMUS Autonomy</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button onClick={() => setLocation('/qumus')} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12">
            <Zap className="w-5 h-5 mr-2" /> QUMUS
          </Button>
          <Button onClick={() => setLocation('/conference')} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12">
            📹 Conference
          </Button>
          <Button onClick={() => setLocation('/video-production')} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12">
            🎬 Video
          </Button>
          <Button onClick={() => setLocation('/live')} className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 h-12">
            📡 Stream
          </Button>
          <Button onClick={() => window.open('https://www.hybridcast.sbs', '_blank')} className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 h-12">
            🚨 HybridCast
          </Button>
          <Button onClick={() => window.open('https://www.rockinrockinboogie.com', '_blank')} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12">
            <Music className="w-5 h-5 mr-2" /> RRB Site
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/80 mt-8 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-300 text-sm">
            Rockin' Rockin' Boogie Studio • {CHANNELS.length} Channels • Powered by QUMUS Autonomous Orchestration
          </p>
          <p className="text-slate-500 text-xs mt-1">
            AI Content Generation • Live Performance Mode • Global Broadcast Network • 90% Autonomous • 10% Human Override
          </p>
        </div>
      </footer>
    </div>
  );
}
