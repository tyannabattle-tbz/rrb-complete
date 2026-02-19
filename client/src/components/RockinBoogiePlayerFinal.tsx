import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Plus, Heart } from "lucide-react";
import { getAllDownloadedEpisodes, downloadEpisode, getDownloadProgress } from "@/services/offlineDownloadService";

interface Episode {
  id: string;
  title: string;
  artist: string;
  duration: number;
  streamUrl: string;
  channel: string;
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

  // Initialize player
  useEffect(() => {
    initializePlayer();
  }, []);

  async function initializePlayer() {
    // Load default channels
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
          },
          {
            id: "2",
            title: "Tutti Frutti",
            artist: "Little Richard",
            duration: 160,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            channel: "Rockin' Rockin' Boogie",
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
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            channel: "Blues Hour",
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
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            channel: "Jazz Essentials",
          },
        ],
      },
    ];

    setChannels(defaultChannels);
    setCurrentChannel(defaultChannels[0]);
    setCurrentEpisode(defaultChannels[0].episodes[0]);

    // Load downloaded episodes
    const downloaded = await getAllDownloadedEpisodes();
    setDownloadedEpisodes(new Set(downloaded.map((e) => e.id)));

    // Load playlists from localStorage
    const savedPlaylists = localStorage.getItem("rockinBoogiePlaylists");
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentEpisode, currentChannel]);

  // Update audio src when episode changes
  useEffect(() => {
    if (audioRef.current && currentEpisode) {
      audioRef.current.src = currentEpisode.streamUrl;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentEpisode]);

  // Handle play/pause
  function togglePlay() {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }

  function playNext() {
    if (!currentChannel) return;
    const currentIndex = currentChannel.episodes.findIndex((e) => e.id === currentEpisode?.id);
    if (currentIndex < currentChannel.episodes.length - 1) {
      setCurrentEpisode(currentChannel.episodes[currentIndex + 1]);
    }
  }

  function playPrev() {
    if (!currentChannel) return;
    const currentIndex = currentChannel.episodes.findIndex((e) => e.id === currentEpisode?.id);
    if (currentIndex > 0) {
      setCurrentEpisode(currentChannel.episodes[currentIndex - 1]);
    }
  }

  function switchChannel(channel: Channel) {
    setCurrentChannel(channel);
    setCurrentEpisode(channel.episodes[0]);
  }

  function toggleFavorite(episodeId: string) {
    const newFavorites = new Set(Array.from(favorites));
    if (newFavorites.has(episodeId)) {
      newFavorites.delete(episodeId);
    } else {
      newFavorites.add(episodeId);
    }
    setFavorites(newFavorites);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎙️ RRB - Rockin' Rockin' Boogie</h1>
        <p className="text-slate-400">Premium Podcast & Audio Platform</p>
      </div>

      {/* Current Episode Display */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{currentEpisode?.title}</h2>
            <p className="text-white/80 mb-4">{currentEpisode?.artist}</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {isPlaying ? "▶️ NOW PLAYING" : "⏸️ STOPPED"}
              </span>
              <button
                onClick={() => toggleFavorite(currentEpisode?.id || "")}
                className={`p-2 rounded-full transition ${
                  favorites.has(currentEpisode?.id || "")
                    ? "bg-red-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Heart size={18} />
              </button>
            </div>
          </div>
          {currentEpisode && (
            <button
              onClick={() => handleDownload(currentEpisode)}
              className={`p-3 rounded-full transition ${
                downloadedEpisodes.has(currentEpisode.id)
                  ? "bg-green-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              title={downloadedEpisodes.has(currentEpisode.id) ? "Downloaded" : "Download"}
            >
              <Download size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Channel Selection */}
      <div className="mb-6">
        <h3 className="text-orange-400 font-bold mb-3 uppercase text-sm">Channels</h3>
        <div className="grid grid-cols-3 gap-3">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => switchChannel(channel)}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                currentChannel?.id === channel.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {channel.name}
              <span className="text-xs ml-2">({channel.episodes.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
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
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 mb-6 bg-slate-700/50 p-3 rounded-lg">
        <Volume2 size={20} className="text-orange-400" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => {
            const vol = parseInt(e.target.value);
            setVolume(vol);
            if (audioRef.current) {
              audioRef.current.volume = vol / 100;
            }
          }}
          className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-semibold w-8 text-right">{volume}</span>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={playPrev}
          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition"
        >
          <SkipBack size={24} />
        </button>
        <button
          onClick={togglePlay}
          className="p-4 bg-orange-500 hover:bg-orange-600 rounded-full transition text-white"
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button
          onClick={playNext}
          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Playlist Controls */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowPlaylistModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
        >
          <Plus size={18} /> Create Playlist
        </button>
        <button
          onClick={() => setOfflineMode(!offlineMode)}
          className={`px-4 py-2 rounded-lg transition font-semibold ${
            offlineMode
              ? "bg-green-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }`}
        >
          {offlineMode ? "📡 Offline Mode" : "🌐 Online"}
        </button>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name..."
              className="w-full px-4 py-2 bg-slate-700 rounded-lg mb-4 text-white placeholder-slate-400"
            />
            <div className="flex gap-2">
              <button
                onClick={createPlaylist}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition font-semibold"
              >
                Create
              </button>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Episode List */}
      <div className="mt-8">
        <h3 className="text-orange-400 font-bold mb-4 uppercase text-sm">Episodes</h3>
        <div className="space-y-2">
          {currentChannel?.episodes.map((episode) => (
            <div
              key={episode.id}
              onClick={() => setCurrentEpisode(episode)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                currentEpisode?.id === episode.id
                  ? "bg-orange-500/20 border-l-4 border-orange-500"
                  : "bg-slate-700/50 hover:bg-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{episode.title}</p>
                  <p className="text-sm text-slate-400">{episode.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{formatTime(episode.duration)}</span>
                  {downloadedEpisodes.has(episode.id) && (
                    <span className="text-xs bg-green-600 px-2 py-1 rounded">Downloaded</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playlists Display */}
      {playlists.length > 0 && (
        <div className="mt-8">
          <h3 className="text-orange-400 font-bold mb-4 uppercase text-sm">Your Playlists</h3>
          <div className="grid grid-cols-2 gap-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold">{playlist.name}</p>
                <p className="text-sm text-slate-400">{playlist.episodes.length} episodes</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onVolumeChange={(e) => {
          const audio = e.target as HTMLAudioElement;
          setVolume(Math.round(audio.volume * 100));
        }}
      />
    </div>
  );
}
