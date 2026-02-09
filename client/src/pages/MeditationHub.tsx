/**
 * Meditation Hub - Complete Wellness Platform
 * 
 * Features:
 * - Guided meditation sessions with audio playback
 * - Healing frequencies (432Hz, 528Hz, binaural beats)
 * - Session history and progress tracking
 * - Favorite sessions and bookmarks
 * - Meditation statistics and streaks
 * - Personalized recommendations
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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
  Waves,
} from 'lucide-react';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  audioUrl: string;
  category: 'breathing' | 'body-scan' | 'visualization' | 'loving-kindness' | 'sleep';
  frequency?: 'binaural' | '432Hz' | '528Hz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  instructor: string;
}

interface UserProgress {
  sessionId: string;
  completedAt: number;
  duration: number; // actual listening time
  rating: number; // 1-5
}

interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string;
  lastSessionDate: number;
}

const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: 'med-001',
    title: 'Top of the Sol Awakening',
    description: 'Start your day with energy and clarity',
    duration: 600, // 10 minutes
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    category: 'breathing',
    frequency: '432Hz',
    difficulty: 'beginner',
    imageUrl: 'https://via.placeholder.com/300x300?text=Top+of+the+Sol+Awakening',
    instructor: 'Sarah Chen',
  },
  {
    id: 'med-002',
    title: 'Deep Relaxation',
    description: 'Release tension and find inner peace',
    duration: 1200, // 20 minutes
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    category: 'body-scan',
    frequency: '528Hz',
    difficulty: 'intermediate',
    imageUrl: 'https://via.placeholder.com/300x300?text=Deep+Relaxation',
    instructor: 'Marcus Johnson',
  },
  {
    id: 'med-003',
    title: 'Loving Kindness',
    description: 'Cultivate compassion and connection',
    duration: 900, // 15 minutes
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    category: 'loving-kindness',
    difficulty: 'beginner',
    imageUrl: 'https://via.placeholder.com/300x300?text=Loving+Kindness',
    instructor: 'Emma Wilson',
  },
  {
    id: 'med-004',
    title: 'Sleep Meditation',
    description: 'Drift into peaceful, restorative sleep',
    duration: 1800, // 30 minutes
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    category: 'sleep',
    frequency: 'binaural',
    difficulty: 'beginner',
    imageUrl: 'https://via.placeholder.com/300x300?text=Sleep+Meditation',
    instructor: 'Dr. Lisa Park',
  },
  {
    id: 'med-005',
    title: 'Visualization Journey',
    description: 'Explore your inner landscape',
    duration: 1200, // 20 minutes
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    category: 'visualization',
    frequency: '432Hz',
    difficulty: 'intermediate',
    imageUrl: 'https://via.placeholder.com/300x300?text=Visualization',
    instructor: 'James Mitchell',
  },
];

export default function MeditationHub() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>(MEDITATION_SESSIONS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteCategory: '',
    lastSessionDate: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sessionRating, setSessionRating] = useState(0);

  const currentSession = MEDITATION_SESSIONS.find(s => s.id === currentSessionId);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('meditation_favorites');
    const savedProgress = localStorage.getItem('meditation_progress');
    const savedStats = localStorage.getItem('meditation_stats');

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('meditation_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('meditation_progress', JSON.stringify(progress));
    localStorage.setItem('meditation_stats', JSON.stringify(stats));
  }, [progress, stats]);

  // Set audio src when session changes
  useEffect(() => {
    if (audioRef.current && currentSession?.audioUrl) {
      audioRef.current.src = currentSession.audioUrl;
      audioRef.current.load();
      setCurrentTime(0);
    }
  }, [currentSessionId, currentSession]);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle session end
  const handleSessionEnd = () => {
    setIsPlaying(false);

    // Record session completion
    if (currentSession) {
      const newProgress: UserProgress = {
        sessionId: currentSession.id,
        completedAt: Date.now(),
        duration: currentTime,
        rating: sessionRating,
      };

      setProgress([...progress, newProgress]);

      // Update stats
      const newStats = { ...stats };
      newStats.totalSessions += 1;
      newStats.totalMinutes += Math.floor(currentTime / 60);
      newStats.lastSessionDate = Date.now();

      // Calculate streak
      const today = new Date().toDateString();
      const lastSessionDate = new Date(stats.lastSessionDate).toDateString();
      if (lastSessionDate === today) {
        newStats.currentStreak = stats.currentStreak + 1;
      } else {
        newStats.currentStreak = 1;
      }

      if (newStats.currentStreak > stats.longestStreak) {
        newStats.longestStreak = newStats.currentStreak;
      }

      setStats(newStats);
      setSessionRating(0);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  // Toggle favorite
  const toggleFavorite = (sessionId: string) => {
    setFavorites(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Filter sessions by category
  const filteredSessions =
    selectedCategory === 'all'
      ? MEDITATION_SESSIONS
      : MEDITATION_SESSIONS.filter(s => s.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">🧘 Meditation Hub</h1>
          <p className="text-gray-600">Find peace, clarity, and wellness through guided meditation</p>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleSessionEnd}
        />

        {/* Current Session Display */}
        {currentSession && (
          <Card className="mb-8 p-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{currentSession.title}</h2>
                <p className="text-purple-100 mb-4">{currentSession.description}</p>
                <div className="flex gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                    {currentSession.instructor}
                  </span>
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                    {currentSession.difficulty}
                  </span>
                  {currentSession.frequency && (
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                      {currentSession.frequency}
                    </span>
                  )}
                </div>
              </div>
              <img
                src={currentSession.imageUrl}
                alt={currentSession.title}
                className="w-32 h-32 rounded-lg object-cover ml-4"
              />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <Card className="p-6">
              <div className="space-y-4">
                <div
                  onClick={handleProgressClick}
                  className="w-full h-2 bg-gray-200 rounded-full cursor-pointer hover:h-3 transition-all"
                >
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </Card>

            {/* Volume Control */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8 text-right">{volume}%</span>
              </div>
            </Card>

            {/* Playback Controls */}
            <Card className="p-6">
              <div className="flex gap-4 justify-center items-center">
                <Button
                  onClick={() => {
                    const currentIndex = MEDITATION_SESSIONS.findIndex(
                      s => s.id === currentSessionId
                    );
                    if (currentIndex > 0) {
                      setCurrentSessionId(MEDITATION_SESSIONS[currentIndex - 1].id);
                      setIsPlaying(true);
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <SkipBack className="w-4 h-4" />
                  Previous
                </Button>

                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg font-bold flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Play
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    const currentIndex = MEDITATION_SESSIONS.findIndex(
                      s => s.id === currentSessionId
                    );
                    if (currentIndex < MEDITATION_SESSIONS.length - 1) {
                      setCurrentSessionId(MEDITATION_SESSIONS[currentIndex + 1].id);
                      setIsPlaying(true);
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next
                  <SkipForward className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => toggleFavorite(currentSession?.id || '')}
                  className={`ml-auto ${
                    favorites.includes(currentSession?.id || '')
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-200 hover:bg-gray-300'
                  } text-white`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(currentSession?.id || '') ? 'fill-current' : ''
                    }`}
                  />
                </Button>
              </div>
            </Card>

            {/* Session Rating */}
            <Card className="p-6">
              <div className="space-y-3">
                <p className="font-semibold text-gray-700">Rate this session</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setSessionRating(rating)}
                      className={`px-4 py-2 rounded-lg transition ${
                        sessionRating >= rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
              <h3 className="font-bold text-lg mb-4 text-purple-900">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Music className="w-4 h-4" />
                    Sessions
                  </div>
                  <span className="font-bold text-purple-600">{stats.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    Minutes
                  </div>
                  <span className="font-bold text-purple-600">{stats.totalMinutes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Zap className="w-4 h-4" />
                    Streak
                  </div>
                  <span className="font-bold text-purple-600">{stats.currentStreak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4" />
                    Best Streak
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
                      {cat === 'all' ? 'All Sessions' : cat.replace('-', ' ').toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map(session => (
              <Card
                key={session.id}
                className={`overflow-hidden cursor-pointer transition hover:shadow-lg ${
                  currentSessionId === session.id ? 'ring-2 ring-purple-600' : ''
                }`}
                onClick={() => {
                  setCurrentSessionId(session.id);
                  setIsPlaying(true);
                }}
              >
                <img
                  src={session.imageUrl}
                  alt={session.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{session.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatTime(session.duration)}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
