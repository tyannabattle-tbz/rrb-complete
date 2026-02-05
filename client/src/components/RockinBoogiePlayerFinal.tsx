"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Plus, Heart, Wifi, WifiOff } from "lucide-react";
import { getAllDownloadedEpisodes, downloadEpisode } from "@/services/offlineDownloadService";

interface Episode {
  id: string;
  title: string;
  artist: string;
  duration: number;
  streamUrl: string;
  channel: string;
  imageUrl?: string;
}

interface Playlist {
  id: string;
  name: string;
  episodes: Episode[];
}

interface Channel {
  id: string;
  name: string;
  episodes: Episode[];
}

export function RockinBoogiePlayerFinal() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<Set<string>>(new Set());
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [offlineMode, setOfflineMode] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // Initialize player
  useEffect(() => {
    initializePlayer();
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  // Update audio element when episode changes
  useEffect(() => {
    if (audioRef.current && currentEpisode) {
      audioRef.current.src = currentEpisode.streamUrl;
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error("Play failed:", e));
      }
    }
  }, [currentEpisode]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentChannel, currentEpisode]);

  async function initializePlayer() {
    // Load default channels with iTunes-compatible structure
    const defaultChannels: Channel[] = [
      {
        id: "rockin",
        name: "Rockin' Rockin' Boogie",
        episodes: [
          {
            id: "1",
            title: "Rockin' Rockin' Boogie - Original Recording",
            artist: "Little Richard",
            duration: 180,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            channel: "Rockin' Rockin' Boogie",
            imageUrl: "https://via.placeholder.com/200?text=Little+Richard",
          },
          {
            id: "2",
            title: "Tutti Frutti",
            artist: "Little Richard",
            duration: 160,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            channel: "Rockin' Rockin' Boogie",
            imageUrl: "https://via.placeholder.com/200?text=Little+Richard",
          },
          {
            id: "5",
            title: "Johnny B. Goode",
            artist: "Chuck Berry",
            duration: 170,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            channel: "Rockin' Rockin' Boogie",
            imageUrl: "https://via.placeholder.com/200?text=Chuck+Berry",
          },
        ],
      },
      {
        id: "blues",
        name: "Blues Hour",
        episodes: [
          {
            id: "3",
            title: "The Thrill is Gone",
            artist: "B.B. King",
            duration: 280,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            channel: "Blues Hour",
            imageUrl: "https://via.placeholder.com/200?text=BB+King",
          },
          {
            id: "6",
            title: "Stormy Monday",
            artist: "T-Bone Walker",
            duration: 240,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
            channel: "Blues Hour",
            imageUrl: "https://via.placeholder.com/200?text=T-Bone+Walker",
          },
        ],
      },
      {
        id: "jazz",
        name: "Jazz Essentials",
        episodes: [
          {
            id: "4",
            title: "Take Five",
            artist: "Dave Brubeck",
            duration: 320,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            channel: "Jazz Essentials",
            imageUrl: "https://via.placeholder.com/200?text=Dave+Brubeck",
          },
          {
            id: "7",
            title: "Kind of Blue",
            artist: "Miles Davis",
            duration: 300,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
            channel: "Jazz Essentials",
            imageUrl: "https://via.placeholder.com/200?text=Miles+Davis",
          },
        ],
      },
    ];

    setChannels(defaultChannels);
    setCurrentChannel(defaultChannels[0]);
    setCurrentEpisode(defaultChannels[0].episodes[0]);

    // Load favorites and playlists from localStorage
    const savedFavorites = localStorage.getItem("rockinBoogieFavorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    const savedPlaylists = localStorage.getItem("rockinBoogiePlaylists");
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }

    // Load downloaded episodes
    const downloaded = await getAllDownloadedEpisodes();
    setDownloadedEpisodes(new Set(downloaded.map((e) => e.id)));
  }

  function togglePlayPause() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error("Play failed:", e));
    }
    setIsPlaying(!isPlaying);
  }

  function playNext() {
    if (!currentChannel) return;
    const currentIndex = currentChannel.episodes.findIndex((e) => e.id === currentEpisode?.id);
    if (currentIndex < currentChannel.episodes.length - 1) {
      setCurrentEpisode(currentChannel.episodes[currentIndex + 1]);
      setIsPlaying(true);
    }
  }

  function playPrev() {
    if (!currentChannel) return;
    const currentIndex = currentChannel.episodes.findIndex((e) => e.id === currentEpisode?.id);
    if (currentIndex > 0) {
      setCurrentEpisode(currentChannel.episodes[currentIndex - 1]);
      setIsPlaying(true);
    }
  }

  function switchChannel(channel: Channel) {
    setCurrentChannel(channel);
    setCurrentEpisode(channel.episodes[0]);
    setIsPlaying(false);
  }

  function toggleFavorite(episodeId: string) {
    const newFavorites = new Set(Array.from(favorites));
    if (newFavorites.has(episodeId)) {
      newFavorites.delete(episodeId);
    } else {
      newFavorites.add(episodeId);
    }
    setFavorites(newFavorites);
    localStorage.setItem("rockinBoogieFavorites", JSON.stringify(Array.from(newFavorites)));
  }

  async function handleDownload(episode: Episode) {
    try {
      await downloadEpisode(
        episode.id,
        episode.title,
        episode.artist,
        episode.streamUrl,
        episode.duration,
        (progress) => {
          console.log(`Download progress: ${progress}%`);
        }
      );
      setDownloadedEpisodes((prev) => {
        const updated = new Set(Array.from(prev));
        updated.add(episode.id);
        return updated;
      });
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  function createPlaylist() {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      episodes: [],
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem("rockinBoogiePlaylists", JSON.stringify(updatedPlaylists));
    setNewPlaylistName("");
    setShowPlaylistModal(false);
  }

  function addToPlaylist(playlistId: string, episode: Episode) {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return {
          ...p,
          episodes: [...p.episodes, episode],
        };
      }
      return p;
    });

    setPlaylists(updatedPlaylists);
    localStorage.setItem("rockinBoogiePlaylists", JSON.stringify(updatedPlaylists));
  }

  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  const favoriteEpisodes = currentChannel?.episodes.filter((e) => favorites.has(e.id)) || [];

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border border-orange-500/30 shadow-2xl">
      {/* Header with Online Status */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">RRB - Rockin' Rockin' Boogie</h1>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1 text-green-400">
              <Wifi size={16} />
              <span className="text-xs">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <WifiOff size={16} />
              <span className="text-xs">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Episode Display */}
      {currentEpisode && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{currentEpisode.title}</h2>
              <p className="text-orange-100 mb-4">{currentEpisode.artist}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFavorite(currentEpisode.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                    favorites.has(currentEpisode.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Heart size={16} fill={favorites.has(currentEpisode.id) ? "currentColor" : "none"} />
                  {favorites.has(currentEpisode.id) ? "Favorited" : "Add to Favorites"}
                </button>
                <button
                  onClick={() => handleDownload(currentEpisode)}
                  disabled={downloadedEpisodes.has(currentEpisode.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                    downloadedEpisodes.has(currentEpisode.id)
                      ? "bg-green-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Download size={16} />
                  {downloadedEpisodes.has(currentEpisode.id) ? "Downloaded" : "Download"}
                </button>
              </div>
            </div>
            {currentEpisode.imageUrl && (
              <img src={currentEpisode.imageUrl} alt={currentEpisode.artist} className="w-32 h-32 rounded-lg ml-4" />
            )}
          </div>
        </div>
      )}

      {/* Playback Status */}
      <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-center">
        <p className="text-orange-400 font-semibold">
          {isPlaying ? "🎵 NOW PLAYING" : "⏸️ STOPPED"}
        </p>
      </div>

      {/* Channels */}
      <div className="bg-slate-700/30 rounded-lg p-4 mb-6 border border-slate-600">
        <h3 className="text-orange-400 font-bold mb-3 uppercase text-sm">CHANNELS</h3>
        <div className="grid grid-cols-3 gap-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => switchChannel(channel)}
              className={`px-4 py-2 rounded-lg transition font-semibold ${
                currentChannel?.id === channel.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-600 text-slate-200 hover:bg-slate-500"
              }`}
            >
              {channel.name}
              <span className="text-xs ml-1">({channel.episodes.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-700/50 rounded-lg p-3 mb-4 border border-slate-600">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          onChange={(e) => {
            if (audioRef.current) {
              audioRef.current.currentTime = parseFloat(e.target.value);
            }
          }}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="bg-slate-700/50 rounded-lg p-3 mb-6 border border-slate-600 flex items-center gap-3">
        <Volume2 size={20} className="text-orange-400" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <span className="text-sm text-slate-300 w-8 text-right">{volume}</span>
      </div>

      {/* Audio Visualizer */}
      <div className="bg-slate-700/50 rounded-lg p-4 mb-6 border-2 border-dashed border-orange-500/50 h-24 flex items-center justify-center">
        <div className="flex items-center justify-center gap-1 h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-orange-400 to-orange-600 rounded-full transition-all"
              style={{
                height: isPlaying ? `${Math.random() * 100}%` : "20%",
                animation: isPlaying ? `pulse 0.5s ease-in-out ${i * 0.05}s infinite` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={playPrev}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition font-semibold"
        >
          <SkipBack size={20} />
          PREV
        </button>
        <button
          onClick={togglePlayPause}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-semibold text-lg"
        >
          {isPlaying ? (
            <>
              <Pause size={20} />
              PAUSE
            </>
          ) : (
            <>
              <Play size={20} />
              PLAY
            </>
          )}
        </button>
        <button
          onClick={playNext}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition font-semibold"
        >
          NEXT
          <SkipForward size={20} />
        </button>
      </div>

      {/* Offline Mode Toggle */}
      {downloadedEpisodes.size > 0 && (
        <button
          onClick={() => setOfflineMode(!offlineMode)}
          className={`w-full px-4 py-2 rounded-lg transition font-semibold mb-6 ${
            offlineMode
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-slate-600 hover:bg-slate-500 text-slate-200"
          }`}
        >
          {offlineMode ? "📱 Offline Mode ON" : "🌐 Online Mode"}
        </button>
      )}

      {/* Favorite Episodes */}
      {favoriteEpisodes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-orange-400 font-bold mb-3 uppercase text-sm">❤️ Favorite Episodes</h3>
          <div className="space-y-2">
            {favoriteEpisodes.map((episode) => (
              <div
                key={episode.id}
                onClick={() => setCurrentEpisode(episode)}
                className="p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition border border-orange-500/30"
              >
                <p className="font-semibold text-white">{episode.title}</p>
                <p className="text-sm text-slate-400">{episode.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-orange-400 font-bold uppercase text-sm">📋 Your Playlists</h3>
            <button
              onClick={() => setShowPlaylistModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition text-sm"
            >
              <Plus size={16} />
              New
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <p className="font-semibold text-white">{playlist.name}</p>
                <p className="text-xs text-slate-400">{playlist.episodes.length} episodes</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Playlist Button */}
      {playlists.length === 0 && (
        <button
          onClick={() => setShowPlaylistModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition font-semibold mb-6"
        >
          <Plus size={20} />
          Create Playlist
        </button>
      )}

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg max-w-sm w-full border border-orange-500/30">
            <h3 className="text-xl font-bold mb-4 text-white">Create New Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name..."
              className="w-full px-4 py-2 bg-slate-700 rounded-lg mb-4 text-white placeholder-slate-400 border border-slate-600"
            />
            <div className="flex gap-2">
              <button
                onClick={createPlaylist}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition font-semibold text-white"
              >
                Create
              </button>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Episodes List */}
      {!offlineMode && (
        <div>
          <h3 className="text-orange-400 font-bold mb-3 uppercase text-sm">Episodes</h3>
          <div className="space-y-2">
            {currentChannel?.episodes.map((episode) => (
              <div
                key={episode.id}
                onClick={() => setCurrentEpisode(episode)}
                className={`p-3 rounded-lg cursor-pointer transition border ${
                  currentEpisode?.id === episode.id
                    ? "bg-orange-500/20 border-orange-500"
                    : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{episode.title}</p>
                    <p className="text-sm text-slate-400">{episode.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{formatTime(episode.duration)}</span>
                    {downloadedEpisodes.has(episode.id) && (
                      <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">Downloaded</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Episodes List */}
      {offlineMode && (
        <div>
          <h3 className="text-orange-400 font-bold mb-3 uppercase text-sm">📱 Downloaded Episodes</h3>
          <div className="space-y-2">
            {currentChannel?.episodes
              .filter((e) => downloadedEpisodes.has(e.id))
              .map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => setCurrentEpisode(episode)}
                  className={`p-3 rounded-lg cursor-pointer transition border ${
                    currentEpisode?.id === episode.id
                      ? "bg-green-500/20 border-green-500"
                      : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{episode.title}</p>
                      <p className="text-sm text-slate-400">{episode.artist}</p>
                    </div>
                    <span className="text-sm text-slate-400">{formatTime(episode.duration)}</span>
                  </div>
                </div>
              ))}
            {currentChannel?.episodes.filter((e) => downloadedEpisodes.has(e.id)).length === 0 && (
              <p className="text-slate-400 text-center py-4">No downloaded episodes in this channel</p>
            )}
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* CSS for visualizer animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { height: 20%; }
          50% { height: 80%; }
        }
      `}</style>
    </div>
  );
}
