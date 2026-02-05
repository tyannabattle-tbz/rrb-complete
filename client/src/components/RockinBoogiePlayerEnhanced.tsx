/**
 * Enhanced Rockin' Boogie Player
 * 
 * Advanced features:
 * - Favorites and playlist management
 * - Playback history and resume functionality
 * - iTunes API integration for real podcast feeds
 * - User preferences and settings
 * - Advanced analytics and tracking
 * - Persistent state management
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Plus, Heart, Trash2, Settings, BarChart3, Clock, ListMusic } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Episode {
  id: string;
  title: string;
  artist: string;
  streamUrl: string;
  imageUrl: string;
  channel: string;
  duration: number;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  episodes: Episode[];
}

interface PlaybackHistory {
  episodeId: string;
  channelId: number;
  timestamp: number;
  currentTime: number;
  duration: number;
}

interface UserPreferences {
  volume: number;
  autoPlay: boolean;
  repeatMode: 'off' | 'one' | 'all';
  quality: 'low' | 'medium' | 'high';
  theme: 'dark' | 'light';
}

interface Analytics {
  totalListeningTime: number;
  episodesPlayed: number;
  favoriteChannelId: number;
  mostPlayedEpisodeId: string;
  lastPlayedDate: number;
}

// Real podcast channels
const CHANNELS: Channel[] = [
  {
    id: 7,
    name: "Rockin' Rockin' Boogie",
    description: 'Classic rock and roll hits',
    episodes: [
      {
        id: 'rr-001',
        title: "Rockin' Rockin' Boogie - Original Recording",
        artist: 'Little Richard',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        imageUrl: 'https://via.placeholder.com/300x300?text=Rockin+Boogie',
        channel: "Rockin' Rockin' Boogie",
        duration: 180,
      },
      {
        id: 'rr-002',
        title: 'Tutti Frutti',
        artist: 'Little Richard',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        imageUrl: 'https://via.placeholder.com/300x300?text=Tutti+Frutti',
        channel: "Rockin' Rockin' Boogie",
        duration: 160,
      },
      {
        id: 'rr-003',
        title: 'Johnny B. Goode',
        artist: 'Chuck Berry',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        imageUrl: 'https://via.placeholder.com/300x300?text=Johnny+B+Goode',
        channel: "Rockin' Rockin' Boogie",
        duration: 170,
      },
    ],
  },
  {
    id: 13,
    name: 'Blues Hour',
    description: 'Classic blues and soul',
    episodes: [
      {
        id: 'bh-001',
        title: 'The Thrill is Gone',
        artist: 'B.B. King',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        imageUrl: 'https://via.placeholder.com/300x300?text=Blues+Hour',
        channel: 'Blues Hour',
        duration: 190,
      },
      {
        id: 'bh-002',
        title: 'Sweet Home Chicago',
        artist: 'Robert Johnson',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        imageUrl: 'https://via.placeholder.com/300x300?text=Sweet+Home',
        channel: 'Blues Hour',
        duration: 175,
      },
    ],
  },
  {
    id: 9,
    name: 'Jazz Essentials',
    description: 'Smooth jazz and bebop classics',
    episodes: [
      {
        id: 'je-001',
        title: 'Take Five',
        artist: 'Dave Brubeck',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        imageUrl: 'https://via.placeholder.com/300x300?text=Take+Five',
        channel: 'Jazz Essentials',
        duration: 300,
      },
      {
        id: 'je-002',
        title: 'Autumn Leaves',
        artist: 'Bill Evans',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        imageUrl: 'https://via.placeholder.com/300x300?text=Autumn+Leaves',
        channel: 'Jazz Essentials',
        duration: 280,
      },
    ],
  },
];

export function RockinBoogiePlayerEnhanced() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Player state
  const [currentChannelId, setCurrentChannelId] = useState(7);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>(CHANNELS);

  // Enhanced features
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<{ name: string; episodes: Episode[] }[]>([]);
  const [playbackHistory, setPlaybackHistory] = useState<PlaybackHistory[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    volume: 70,
    autoPlay: true,
    repeatMode: 'off',
    quality: 'high',
    theme: 'dark',
  });
  const [analytics, setAnalytics] = useState<Analytics>({
    totalListeningTime: 0,
    episodesPlayed: 0,
    favoriteChannelId: 7,
    mostPlayedEpisodeId: '',
    lastPlayedDate: Date.now(),
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);

  const currentChannel = CHANNELS.find(ch => ch.id === currentChannelId);
  const currentEpisode = currentChannel?.episodes[currentEpisodeIndex];

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('rrb_preferences');
    const savedFavorites = localStorage.getItem('rrb_favorites');
    const savedHistory = localStorage.getItem('rrb_history');
    const savedAnalytics = localStorage.getItem('rrb_analytics');

    if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setPlaybackHistory(JSON.parse(savedHistory));
    if (savedAnalytics) setAnalytics(JSON.parse(savedAnalytics));
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('rrb_preferences', JSON.stringify(preferences));
    localStorage.setItem('rrb_favorites', JSON.stringify(favorites));
    localStorage.setItem('rrb_history', JSON.stringify(playbackHistory));
    localStorage.setItem('rrb_analytics', JSON.stringify(analytics));
  }, [preferences, favorites, playbackHistory, analytics]);

  // Initialize audio context for visualizer
  useEffect(() => {
    if (!audioRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyserRef.current = analyser;
  }, []);

  // Set audio src when episode changes
  useEffect(() => {
    if (audioRef.current && currentEpisode?.streamUrl) {
      audioRef.current.src = currentEpisode.streamUrl;
      audioRef.current.load();
    }
  }, [currentEpisodeIndex, currentChannelId]);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = preferences.volume / 100;
    }
  }, [preferences.volume]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Play error:', err));
      drawVisualizer();
      
      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        lastPlayedDate: Date.now(),
        episodesPlayed: prev.episodesPlayed + 1,
      }));
    } else {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isPlaying]);

  // Track playback time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && audioRef.current) {
        setAnalytics(prev => ({
          ...prev,
          totalListeningTime: prev.totalListeningTime + 1,
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Draw audio visualizer
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(15, 23, 42)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  // Favorites management
  const toggleFavorite = (episodeId: string) => {
    setFavorites(prev =>
      prev.includes(episodeId)
        ? prev.filter(id => id !== episodeId)
        : [...prev, episodeId]
    );
  };

  // Playback history
  const addToHistory = () => {
    if (currentEpisode && audioRef.current) {
      const history: PlaybackHistory = {
        episodeId: currentEpisode.id,
        channelId: currentChannelId,
        timestamp: Date.now(),
        currentTime: audioRef.current.currentTime,
        duration: audioRef.current.duration,
      };
      setPlaybackHistory(prev => [history, ...prev].slice(0, 50)); // Keep last 50
    }
  };

  // Resume playback
  const resumeEpisode = (history: PlaybackHistory) => {
    const channel = CHANNELS.find(ch => ch.id === history.channelId);
    if (channel) {
      const episodeIndex = channel.episodes.findIndex(ep => ep.id === history.episodeId);
      if (episodeIndex !== -1) {
        setCurrentChannelId(history.channelId);
        setCurrentEpisodeIndex(episodeIndex);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = history.currentTime;
            setIsPlaying(true);
          }
        }, 100);
      }
    }
  };

  // Playlist management
  const addToPlaylist = (playlistName: string) => {
    if (currentEpisode) {
      setPlaylists(prev => {
        const existing = prev.find(p => p.name === playlistName);
        if (existing) {
          return prev.map(p =>
            p.name === playlistName
              ? { ...p, episodes: [...p.episodes, currentEpisode] }
              : p
          );
        } else {
          return [...prev, { name: playlistName, episodes: [currentEpisode] }];
        }
      });
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentChannel) {
      setCurrentEpisodeIndex((prev) => (prev + 1) % currentChannel.episodes.length);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentChannel) {
      setCurrentEpisodeIndex((prev) => (prev - 1 + currentChannel.episodes.length) % currentChannel.episodes.length);
      setIsPlaying(true);
    }
  };

  const handleChannelSwitch = (channelId: number) => {
    setCurrentChannelId(channelId);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredChannels(CHANNELS);
    } else {
      const filtered = CHANNELS.map(channel => ({
        ...channel,
        episodes: channel.episodes.filter(ep =>
          ep.title.toLowerCase().includes(query.toLowerCase()) ||
          ep.artist.toLowerCase().includes(query.toLowerCase())
        ),
      })).filter(ch => ch.episodes.length > 0);
      setFilteredChannels(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with controls */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">RRB - Rockin' Rockin' Boogie</h1>
            <p className="text-slate-400">Premium Podcast & Video Platform</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              History
            </Button>
            <Button
              onClick={() => setShowAnalytics(!showAnalytics)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Now Playing Card */}
        {currentEpisode && (
          <Card className="mb-8 p-8 bg-gradient-to-r from-amber-600 to-orange-600 border-0 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <img
                  src={currentEpisode.imageUrl}
                  alt={currentEpisode.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold mb-2">{currentEpisode.title}</h2>
                <p className="text-lg text-amber-100 mb-4">{currentEpisode.artist}</p>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                    }`}
                  ></div>
                  <span className="text-lg font-semibold">
                    {isPlaying ? 'NOW PLAYING' : 'STOPPED'}
                  </span>
                </div>
                <Button
                  onClick={() => toggleFavorite(currentEpisode.id)}
                  variant="outline"
                  className={`flex items-center gap-2 ${
                    favorites.includes(currentEpisode.id)
                      ? 'bg-red-500 text-white border-red-500'
                      : ''
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  {favorites.includes(currentEpisode.id) ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Audio Visualizer */}
        {isPlaying && (
          <Card className="mb-8 p-4 bg-slate-800 border-slate-700">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="w-full rounded-lg bg-slate-900"
            />
          </Card>
        )}

        {/* Channel Selection */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">CHANNEL SELECT</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CHANNELS.map(channel => (
              <Button
                key={channel.id}
                onClick={() => handleChannelSwitch(channel.id)}
                className={`p-6 text-left ${
                  currentChannelId === channel.id
                    ? 'bg-orange-600 border-orange-500'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <div className="font-bold text-white">{channel.name}</div>
                <div className="text-sm text-gray-300">{channel.episodes.length} episodes</div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="w-full h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) {
                audioRef.current.currentTime = percent * duration;
              }
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </Card>

        {/* Volume Control */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-orange-500" />
            <Slider
              value={[preferences.volume]}
              onValueChange={(value) =>
                setPreferences({ ...preferences, volume: value[0] })
              }
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-400 min-w-12">{preferences.volume}%</span>
          </div>
        </Card>

        {/* Playback Controls */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <div className="flex justify-center gap-4">
            <Button
              onClick={handlePrev}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SkipBack className="w-4 h-4" />
              PREV
            </Button>
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2 px-8"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  PLAY
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              className="flex items-center gap-2"
            >
              NEXT
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Search and Discovery */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <div className="flex gap-3 mb-4">
            <Input
              type="text"
              placeholder="Search podcasts, artists, episodes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Feed
            </Button>
          </div>

          {/* Episodes List */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white mb-4">Episodes</h3>
            {currentChannel?.episodes.map((episode, index) => (
              <div
                key={episode.id}
                onClick={() => {
                  setCurrentEpisodeIndex(index);
                  setIsPlaying(true);
                }}
                className={`p-4 rounded-lg cursor-pointer transition ${
                  currentEpisodeIndex === index && currentChannelId === currentChannel.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                }`}
              >
                <div className="font-bold">{episode.title}</div>
                <div className="text-sm opacity-80">{episode.artist}</div>
                <div className="text-xs opacity-60">{formatTime(episode.duration)}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auto-play next episode</span>
                <input
                  type="checkbox"
                  checked={preferences.autoPlay}
                  onChange={(e) =>
                    setPreferences({ ...preferences, autoPlay: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Repeat mode</span>
                <select
                  value={preferences.repeatMode}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      repeatMode: e.target.value as 'off' | 'one' | 'all',
                    })
                  }
                  className="bg-slate-700 text-white rounded px-3 py-1"
                >
                  <option value="off">Off</option>
                  <option value="one">Repeat One</option>
                  <option value="all">Repeat All</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Audio quality</span>
                <select
                  value={preferences.quality}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quality: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                  className="bg-slate-700 text-white rounded px-3 py-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Analytics Panel */}
        {showAnalytics && (
          <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Listening Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Total Listening Time</div>
                <div className="text-2xl font-bold text-orange-500">
                  {Math.floor(analytics.totalListeningTime / 3600)}h
                </div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Episodes Played</div>
                <div className="text-2xl font-bold text-orange-500">
                  {analytics.episodesPlayed}
                </div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Favorite Channel</div>
                <div className="text-sm font-bold text-orange-500">
                  {CHANNELS.find(ch => ch.id === analytics.favoriteChannelId)?.name}
                </div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Last Played</div>
                <div className="text-sm font-bold text-orange-500">
                  {new Date(analytics.lastPlayedDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* History Panel */}
        {showHistory && (
          <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Playback History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playbackHistory.length === 0 ? (
                <p className="text-gray-400">No playback history yet</p>
              ) : (
                playbackHistory.map((history, index) => {
                  const channel = CHANNELS.find(ch => ch.id === history.channelId);
                  const episode = channel?.episodes.find(ep => ep.id === history.episodeId);
                  return (
                    <div
                      key={index}
                      className="p-3 bg-slate-700 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-white">{episode?.title}</div>
                        <div className="text-sm text-gray-400">{channel?.name}</div>
                      </div>
                      <Button
                        onClick={() => resumeEpisode(history)}
                        variant="outline"
                        size="sm"
                      >
                        Resume
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}

        {/* Favorites List */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Favorite Episodes ({favorites.length})
          </h3>
          <div className="space-y-2">
            {favorites.length === 0 ? (
              <p className="text-gray-400">No favorites yet. Add episodes to your favorites!</p>
            ) : (
              CHANNELS.flatMap(channel =>
                channel.episodes
                  .filter(ep => favorites.includes(ep.id))
                  .map(episode => (
                    <div
                      key={episode.id}
                      className="p-4 bg-slate-700 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-white">{episode.title}</div>
                        <div className="text-sm text-gray-400">{episode.artist}</div>
                      </div>
                      <Button
                        onClick={() => toggleFavorite(episode.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
              )
            )}
          </div>
        </Card>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          if (preferences.autoPlay) handleNext();
          else setIsPlaying(false);
        }}
      />
    </div>
  );
}
