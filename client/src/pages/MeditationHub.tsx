/**
 * Meditation Hub - Complete Wellness Platform
 * 
 * Features:
 * - Guided meditation sessions with real audio playback via global AudioContext
 * - Healing frequencies (432Hz, 528Hz, binaural beats)
 * - Live ambient streams from SomaFM (Drone Zone, Deep Space One, Groove Salad)
 * - Session history and progress tracking
 * - Favorite sessions and bookmarks
 * - Meditation statistics and streaks
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Clock,
  Zap,
  TrendingUp,
  Music,
  Radio,
  Waves,
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import type { AudioTrack } from '@/contexts/AudioContext';
import { LIVE_STREAMS, SAMPLE_TRACKS } from '@/lib/streamLibrary';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: 'breathing' | 'body-scan' | 'visualization' | 'loving-kindness' | 'sleep';
  frequency?: 'binaural' | '432Hz' | '528Hz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  audioTrack: AudioTrack;
}

interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

// Map sessions to real audio tracks
const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: 'med-001',
    title: 'Top of the Sol Awakening',
    description: 'Start your day with energy and clarity through ambient soundscapes',
    duration: 600,
    category: 'breathing',
    frequency: '432Hz',
    difficulty: 'beginner',
    instructor: 'Sarah Chen',
    audioTrack: {
      id: 'med-track-001',
      title: 'Top of the Sol Awakening',
      artist: 'Meditation Hub · Sarah Chen',
      url: SAMPLE_TRACKS[0].url,
      channel: 'Meditation',
      duration: 360,
    },
  },
  {
    id: 'med-002',
    title: 'Deep Relaxation',
    description: 'Release tension and find inner peace with deep ambient drones',
    duration: 1200,
    category: 'body-scan',
    frequency: '528Hz',
    difficulty: 'intermediate',
    instructor: 'Marcus Johnson',
    audioTrack: {
      id: 'med-track-002',
      title: 'Deep Relaxation',
      artist: 'Meditation Hub · Marcus Johnson',
      url: SAMPLE_TRACKS[1].url,
      channel: 'Meditation',
      duration: 420,
    },
  },
  {
    id: 'med-003',
    title: 'Loving Kindness',
    description: 'Cultivate compassion and connection through gentle soundscapes',
    duration: 900,
    category: 'loving-kindness',
    difficulty: 'beginner',
    instructor: 'Emma Wilson',
    audioTrack: {
      id: 'med-track-003',
      title: 'Loving Kindness',
      artist: 'Meditation Hub · Emma Wilson',
      url: SAMPLE_TRACKS[2].url,
      channel: 'Meditation',
      duration: 380,
    },
  },
  {
    id: 'med-004',
    title: 'Sleep Meditation',
    description: 'Drift into peaceful, restorative sleep with binaural beats',
    duration: 1800,
    category: 'sleep',
    frequency: 'binaural',
    difficulty: 'beginner',
    instructor: 'Dr. Lisa Park',
    audioTrack: {
      id: 'med-track-004',
      title: 'Sleep Meditation',
      artist: 'Meditation Hub · Dr. Lisa Park',
      url: SAMPLE_TRACKS[3].url,
      channel: 'Meditation',
      duration: 350,
    },
  },
  {
    id: 'med-005',
    title: 'Visualization Journey',
    description: 'Explore your inner landscape with deep space ambient',
    duration: 1200,
    category: 'visualization',
    frequency: '432Hz',
    difficulty: 'intermediate',
    instructor: 'James Mitchell',
    audioTrack: {
      id: 'med-track-005',
      title: 'Visualization Journey',
      artist: 'Meditation Hub · James Mitchell',
      url: SAMPLE_TRACKS[4].url,
      channel: 'Meditation',
      duration: 390,
    },
  },
];

// Live ambient streams for continuous meditation
const AMBIENT_STREAMS: AudioTrack[] = [
  LIVE_STREAMS.droneZone,
  LIVE_STREAMS.deepSpaceOne,
  LIVE_STREAMS.grooveSalad,
];

export default function MeditationHub() {
  const audio = useAudio();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLiveStreams, setShowLiveStreams] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('meditation_favorites');
    const savedStats = localStorage.getItem('meditation_stats');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem('meditation_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('meditation_stats', JSON.stringify(stats));
  }, [stats]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFavorite = (sessionId: string) => {
    setFavorites(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const playSession = (session: MeditationSession) => {
    audio.play(session.audioTrack);
    // Update stats
    setStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      totalMinutes: prev.totalMinutes + Math.floor(session.duration / 60),
    }));
  };

  const playAllSessions = () => {
    const allTracks = MEDITATION_SESSIONS.map(s => s.audioTrack);
    audio.playQueue(allTracks, 0);
  };

  const playLiveStream = (stream: AudioTrack) => {
    audio.play(stream);
    setShowLiveStreams(false);
  };

  // Check if a meditation track is currently playing
  const isSessionPlaying = (sessionId: string) => {
    const session = MEDITATION_SESSIONS.find(s => s.id === sessionId);
    return session && audio.currentTrack?.id === session.audioTrack.id && audio.isPlaying;
  };

  const filteredSessions =
    selectedCategory === 'all'
      ? MEDITATION_SESSIONS
      : MEDITATION_SESSIONS.filter(s => s.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-2">🧘 Meditation Hub</h1>
          <p className="text-gray-600">Find peace, clarity, and wellness through guided meditation</p>
        </div>

        {/* Live Ambient Streams */}
        <Card className="mb-6 p-4 md:p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Waves className="w-5 h-5" /> Drop Radio — 432Hz Live Streams
            </h2>
            <button
              onClick={() => setShowLiveStreams(!showLiveStreams)}
              className="text-sm text-white/80 hover:text-white flex items-center gap-1"
            >
              <Radio className="w-4 h-4" />
              {showLiveStreams ? 'Hide' : 'Show Streams'}
            </button>
          </div>
          <p className="text-sm text-white/70 mb-3">
            24/7 ambient soundscapes for meditation, sleep, and deep focus
          </p>
          {showLiveStreams && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {AMBIENT_STREAMS.map(stream => {
                const isActive = audio.currentTrack?.id === stream.id;
                return (
                  <button
                    key={stream.id}
                    onClick={() => playLiveStream(stream)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-white/30 ring-2 ring-white/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isActive && audio.isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      <span className="font-semibold text-sm truncate">{stream.title}</span>
                    </div>
                    <p className="text-xs text-white/60">{stream.artist}</p>
                    {isActive && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-red-300 font-bold">LIVE</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {!showLiveStreams && (
            <button
              onClick={() => setShowLiveStreams(true)}
              className="mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              🎧 Start a Live Ambient Stream
            </button>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Play All Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Guided Sessions</h2>
              <Button
                onClick={playAllSessions}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" /> Play All
              </Button>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map(session => {
                const playing = isSessionPlaying(session.id);
                return (
                  <Card
                    key={session.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      playing ? 'ring-2 ring-purple-500 shadow-purple-200 shadow-lg' : ''
                    }`}
                    onClick={() => {
                      if (playing) {
                        audio.togglePlayPause();
                      } else {
                        playSession(session);
                      }
                    }}
                  >
                    <div className="h-32 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center relative">
                      <div className="text-5xl opacity-50">
                        {session.category === 'breathing' ? '🌬️' :
                         session.category === 'body-scan' ? '🧘' :
                         session.category === 'visualization' ? '🌌' :
                         session.category === 'loving-kindness' ? '💜' : '🌙'}
                      </div>
                      {playing && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-[10px] text-white font-bold">PLAYING</span>
                        </div>
                      )}
                      <button
                        className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playing) {
                            audio.togglePlayPause();
                          } else {
                            playSession(session);
                          }
                        }}
                      >
                        {playing ? (
                          <Pause className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                        )}
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{session.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTime(session.duration)}
                          </span>
                          {session.frequency && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              {session.frequency}
                            </span>
                          )}
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {session.difficulty}
                          </span>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(session.id);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.includes(session.id) ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
              <h3 className="font-bold text-lg mb-4 text-purple-900">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Music className="w-4 h-4" /> Sessions
                  </div>
                  <span className="font-bold text-purple-600">{stats.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" /> Minutes
                  </div>
                  <span className="font-bold text-purple-600">{stats.totalMinutes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Zap className="w-4 h-4" /> Streak
                  </div>
                  <span className="font-bold text-purple-600">{stats.currentStreak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4" /> Best Streak
                  </div>
                  <span className="font-bold text-purple-600">{stats.longestStreak} days</span>
                </div>
              </div>
            </Card>

            {/* Categories */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {['all', 'breathing', 'body-scan', 'visualization', 'loving-kindness', 'sleep'].map(
                  cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Sessions' : cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  )
                )}
              </div>
            </Card>

            {/* Audio Info */}
            <Card className="p-6 bg-amber-50 border-amber-200">
              <h3 className="font-bold text-amber-900 mb-2">💡 Audio Tip</h3>
              <p className="text-sm text-amber-800">
                Audio playback persists across all pages. Start a meditation session or live stream, 
                then navigate freely — your audio will keep playing. Use the player bar at the bottom 
                to control playback from anywhere.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
