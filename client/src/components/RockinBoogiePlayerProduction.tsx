'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, BarChart3, History, Heart, Search, Plus, Download, Wifi, WifiOff } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  artist: string;
  duration: number;
  streamUrl: string;
  description?: string;
  imageUrl?: string;
  pubDate?: string;
}

interface Channel {
  id: string;
  name: string;
  episodes: Episode[];
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentEpisodeId: string;
  currentChannelId: string;
}

interface OfflineEpisode extends Episode {
  downloadedAt: number;
  localUrl?: string;
}

const RockinBoogiePlayerProduction: React.FC = () => {
  // Audio refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 70,
    currentEpisodeId: '',
    currentChannelId: '',
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineEpisodes, setOfflineEpisodes] = useState<Map<string, OfflineEpisode>>(new Map());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoPlay, setAutoPlay] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [audioQuality, setAudioQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [listeningTime, setListeningTime] = useState(0);
  const [episodesPlayed, setEpisodesPlayed] = useState(0);
  const [playbackHistory, setPlaybackHistory] = useState<Array<{ episodeId: string; timestamp: number }>>([]);

  // Initialize channels with real iTunes API data
  const initializeChannels = useCallback(async () => {
    try {
      // Fetch from iTunes API
      const channels: Channel[] = [];

      // Channel 1: Rockin' Rockin' Boogie
      const rockResponse = await fetch(
        'https://itunes.apple.com/search?term=rock+music&media=podcast&limit=5'
      ).catch(() => null);

      if (rockResponse?.ok) {
        const rockData = await rockResponse.json();
        channels.push({
          id: 'rockin',
          name: "Rockin' Rockin' Boogie",
          episodes: rockData.results?.slice(0, 3).map((item: any, idx: number) => ({
            id: `rock-${idx}`,
            title: item.collectionName || 'Rock Episode',
            artist: item.artistName || 'Various Artists',
            duration: 180,
            streamUrl: item.feedUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            description: item.collectionViewUrl,
            imageUrl: item.artworkUrl100,
            pubDate: new Date().toISOString(),
          })) || [],
        });
      } else {
        // Fallback to test data
        channels.push({
          id: 'rockin',
          name: "Rockin' Rockin' Boogie",
          episodes: [
            {
              id: 'rock-1',
              title: "Rockin' Rockin' Boogie - Original Recording",
              artist: 'Little Richard',
              duration: 180,
              streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              description: 'The original recording of Rockin Rockin Boogie',
              imageUrl: 'https://via.placeholder.com/100?text=Rock',
              pubDate: new Date().toISOString(),
            },
            {
              id: 'rock-2',
              title: 'Tutti Frutti',
              artist: 'Little Richard',
              duration: 160,
              streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
              description: 'Classic rock and roll',
              imageUrl: 'https://via.placeholder.com/100?text=Rock',
              pubDate: new Date().toISOString(),
            },
            {
              id: 'rock-3',
              title: 'Johnny B. Goode',
              artist: 'Chuck Berry',
              duration: 170,
              streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
              description: 'Rock and roll classic',
              imageUrl: 'https://via.placeholder.com/100?text=Rock',
              pubDate: new Date().toISOString(),
            },
          ],
        });
      }

      // Channel 2: Blues Hour
      channels.push({
        id: 'blues',
        name: 'Blues Hour',
        episodes: [
          {
            id: 'blues-1',
            title: 'The Thrill is Gone',
            artist: 'B.B. King',
            duration: 200,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            description: 'Classic blues',
            imageUrl: 'https://via.placeholder.com/100?text=Blues',
            pubDate: new Date().toISOString(),
          },
          {
            id: 'blues-2',
            title: 'Stormy Monday',
            artist: 'T-Bone Walker',
            duration: 190,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
            description: 'Blues standard',
            imageUrl: 'https://via.placeholder.com/100?text=Blues',
            pubDate: new Date().toISOString(),
          },
        ],
      });

      // Channel 3: Jazz Essentials
      channels.push({
        id: 'jazz',
        name: 'Jazz Essentials',
        episodes: [
          {
            id: 'jazz-1',
            title: 'Take Five',
            artist: 'Dave Brubeck Quartet',
            duration: 330,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
            description: 'Jazz classic',
            imageUrl: 'https://via.placeholder.com/100?text=Jazz',
            pubDate: new Date().toISOString(),
          },
          {
            id: 'jazz-2',
            title: 'Autumn Leaves',
            artist: 'Bill Evans',
            duration: 300,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
            description: 'Jazz standard',
            imageUrl: 'https://via.placeholder.com/100?text=Jazz',
            pubDate: new Date().toISOString(),
          },
        ],
      });

      setChannels(channels);

      // Set first episode as current
      if (channels.length > 0 && channels[0].episodes.length > 0) {
        setPlaybackState((prev) => ({
          ...prev,
          currentChannelId: channels[0].id,
          currentEpisodeId: channels[0].episodes[0].id,
        }));
      }
    } catch (error) {
      console.error('Failed to initialize channels:', error);
    }
  }, []);

  // Initialize audio context for visualizer
  const initializeAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 256;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  // Draw visualizer
  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    requestAnimationFrame(drawVisualizer);
  }, []);

  // Handle play
  const handlePlay = useCallback(() => {
    if (!audioRef.current) return;

    const currentChannel = channels.find((c) => c.id === playbackState.currentChannelId);
    const currentEpisode = currentChannel?.episodes.find((e) => e.id === playbackState.currentEpisodeId);

    if (!currentEpisode) return;

    // Initialize audio context on first play
    if (!audioContextRef.current) {
      initializeAudioContext();
    }

    audioRef.current.src = currentEpisode.streamUrl;
    audioRef.current.play().catch((error) => {
      console.error('Failed to play audio:', error);
      alert(`Failed to play: ${error.message}`);
    });

    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
    drawVisualizer();

    // Add to history
    setPlaybackHistory((prev) => [
      ...prev,
      { episodeId: currentEpisode.id, timestamp: Date.now() },
    ]);
    setEpisodesPlayed((prev) => prev + 1);
  }, [channels, playbackState.currentChannelId, playbackState.currentEpisodeId, initializeAudioContext, drawVisualizer]);

  // Handle pause
  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Handle next
  const handleNext = useCallback(() => {
    const currentChannel = channels.find((c) => c.id === playbackState.currentChannelId);
    if (!currentChannel) return;

    const currentIndex = currentChannel.episodes.findIndex((e) => e.id === playbackState.currentEpisodeId);
    const nextIndex = (currentIndex + 1) % currentChannel.episodes.length;

    setPlaybackState((prev) => ({
      ...prev,
      currentEpisodeId: currentChannel.episodes[nextIndex].id,
    }));

    if (playbackState.isPlaying) {
      setTimeout(handlePlay, 100);
    }
  }, [channels, playbackState.currentChannelId, playbackState.currentEpisodeId, playbackState.isPlaying, handlePlay]);

  // Handle previous
  const handlePrev = useCallback(() => {
    const currentChannel = channels.find((c) => c.id === playbackState.currentChannelId);
    if (!currentChannel) return;

    const currentIndex = currentChannel.episodes.findIndex((e) => e.id === playbackState.currentEpisodeId);
    const prevIndex = currentIndex === 0 ? currentChannel.episodes.length - 1 : currentIndex - 1;

    setPlaybackState((prev) => ({
      ...prev,
      currentEpisodeId: currentChannel.episodes[prevIndex].id,
    }));

    if (playbackState.isPlaying) {
      setTimeout(handlePlay, 100);
    }
  }, [channels, playbackState.currentChannelId, playbackState.currentEpisodeId, playbackState.isPlaying, handlePlay]);

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setPlaybackState((prev) => ({ ...prev, volume: newVolume }));
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle channel switch
  const handleChannelSwitch = (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId);
    if (channel && channel.episodes.length > 0) {
      setPlaybackState((prev) => ({
        ...prev,
        currentChannelId: channelId,
        currentEpisodeId: channel.episodes[0].id,
      }));

      if (playbackState.isPlaying) {
        setTimeout(handlePlay, 100);
      }
    }
  };

  // Handle favorite toggle
  const toggleFavorite = (episodeId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(episodeId)) {
        newFavorites.delete(episodeId);
      } else {
        newFavorites.add(episodeId);
      }
      return newFavorites;
    });
  };

  // Handle offline download
  const handleDownloadEpisode = async (episode: Episode) => {
    try {
      const response = await fetch(episode.streamUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const offlineEpisode: OfflineEpisode = {
        ...episode,
        downloadedAt: Date.now(),
        localUrl: url,
      };

      setOfflineEpisodes((prev) => new Map(prev).set(episode.id, offlineEpisode));
      console.log(`Downloaded episode: ${episode.title}`);
    } catch (error) {
      console.error('Failed to download episode:', error);
      alert('Failed to download episode');
    }
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration,
      }));

      setListeningTime((prev) => prev + 1);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (autoPlay) {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', () => {
      console.log('Audio metadata loaded');
    });
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('error', () => {});
    };
  }, [autoPlay, repeatMode, handleNext]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeChannels();
  }, [initializeChannels]);

  const currentChannel = channels.find((c) => c.id === playbackState.currentChannelId);
  const currentEpisode = currentChannel?.episodes.find((e) => e.id === playbackState.currentEpisodeId);
  const filteredEpisodes = currentChannel?.episodes.filter(
    (e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.artist.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">RRB - Rockin' Rockin' Boogie</h1>
            <p className="text-slate-400">Premium Podcast & Video Platform</p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-400" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-400" />
            )}
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                offlineMode
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {offlineMode ? 'Offline Mode' : 'Online Mode'}
            </button>
          </div>
        </div>

        {/* Current Episode */}
        {currentEpisode && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentEpisode.title}</h2>
                <p className="text-lg opacity-90">{currentEpisode.artist}</p>
              </div>
              <button
                onClick={() => toggleFavorite(currentEpisode.id)}
                className={`p-3 rounded-full transition ${
                  favorites.has(currentEpisode.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className="w-6 h-6" fill={favorites.has(currentEpisode.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-75">
              <span>Status: {playbackState.isPlaying ? '🔴 NOW PLAYING' : '⚫ STOPPED'}</span>
            </div>
          </div>
        )}

        {/* Channels */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-orange-400 font-bold mb-4 uppercase">Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelSwitch(channel.id)}
                className={`p-4 rounded-lg font-bold transition ${
                  playbackState.currentChannelId === channel.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {channel.name} ({channel.episodes.length} episodes)
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
          <input
            type="range"
            min="0"
            max={playbackState.duration || 0}
            value={playbackState.currentTime}
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.currentTime = parseFloat(e.target.value);
              }
            }}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-slate-400 mt-2">
            <span>{Math.floor(playbackState.currentTime)}s</span>
            <span>{Math.floor(playbackState.duration)}s</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700 flex items-center gap-4">
          <Volume2 className="w-5 h-5 text-orange-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={playbackState.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-slate-300 font-medium w-12 text-right">{playbackState.volume}%</span>
        </div>

        {/* Visualizer */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-orange-500/30">
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-32 bg-slate-900 rounded-lg"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handlePrev}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <SkipBack className="w-5 h-5" />
            PREV
          </button>
          <button
            onClick={playbackState.isPlaying ? handlePause : handlePlay}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            {playbackState.isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                PLAY
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            NEXT
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Settings, Analytics, History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <History className="w-5 h-5" />
            History
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h3 className="text-orange-400 font-bold mb-4">Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-white">Auto-play next episode</span>
              </label>
              <div>
                <label className="text-white mb-2 block">Repeat Mode</label>
                <select
                  value={repeatMode}
                  onChange={(e) => setRepeatMode(e.target.value as any)}
                  className="w-full bg-slate-700 text-white p-2 rounded-lg"
                >
                  <option value="off">Off</option>
                  <option value="one">Repeat One</option>
                  <option value="all">Repeat All</option>
                </select>
              </div>
              <div>
                <label className="text-white mb-2 block">Audio Quality</label>
                <select
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(e.target.value as any)}
                  className="w-full bg-slate-700 text-white p-2 rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h3 className="text-orange-400 font-bold mb-4">Listening Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Total Listening Time</p>
                <p className="text-2xl font-bold text-white">{Math.floor(listeningTime / 60)}m</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Episodes Played</p>
                <p className="text-2xl font-bold text-white">{episodesPlayed}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Favorite Channel</p>
                <p className="text-lg font-bold text-white">{currentChannel?.name || 'N/A'}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Favorites</p>
                <p className="text-2xl font-bold text-white">{favorites.size}</p>
              </div>
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h3 className="text-orange-400 font-bold mb-4">Playback History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playbackHistory.length === 0 ? (
                <p className="text-slate-400">No history yet</p>
              ) : (
                playbackHistory.map((entry, idx) => {
                  const episode = channels
                    .flatMap((c) => c.episodes)
                    .find((e) => e.id === entry.episodeId);
                  return (
                    <div key={idx} className="bg-slate-700 p-3 rounded-lg text-sm">
                      <p className="text-white font-medium">{episode?.title || 'Unknown'}</p>
                      <p className="text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search podcasts, artists, episodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-700 text-white p-3 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Feed
            </button>
          </div>
        </div>

        {/* Episodes List */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-orange-400 font-bold mb-4">Episodes</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEpisodes.map((episode) => (
              <div
                key={episode.id}
                className={`p-4 rounded-lg cursor-pointer transition ${
                  playbackState.currentEpisodeId === episode.id
                    ? 'bg-orange-500/20 border border-orange-500'
                    : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
                }`}
                onClick={() => {
                  setPlaybackState((prev) => ({ ...prev, currentEpisodeId: episode.id }));
                  setTimeout(handlePlay, 100);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-bold">{episode.title}</p>
                    <p className="text-slate-400 text-sm">{episode.artist}</p>
                    <p className="text-slate-500 text-xs mt-1">{Math.floor(episode.duration / 60)}m {episode.duration % 60}s</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadEpisode(episode);
                    }}
                    className="p-2 hover:bg-slate-500 rounded-lg transition"
                  >
                    <Download className="w-5 h-5 text-slate-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onLoadedMetadata={() => console.log('Audio loaded')}
        onError={(e) => console.error('Audio error:', e)}
      />
    </div>
  );
};

export default RockinBoogiePlayerProduction;
