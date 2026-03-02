import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, SkipForward, Volume2, Radio } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  plays: number;
}

export function RockinBoogieWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [volume, setVolume] = useState(70);

  // Mock data for demonstration
  useEffect(() => {
    const mockTracks: Track[] = [
      { id: '1', title: 'Electric Dreams', artist: 'The Boogie Band', duration: 240, plays: 1250 },
      { id: '2', title: 'Rockin All Night', artist: 'Night Riders', duration: 180, plays: 890 },
      { id: '3', title: 'Boogie Fever', artist: 'Groove Masters', duration: 210, plays: 650 },
      { id: '4', title: 'Dance Revolution', artist: 'Synth Wave', duration: 195, plays: 420 },
    ];
    setTracks(mockTracks);
    setCurrentTrack(mockTracks[0]);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (currentTrack && tracks.length > 0) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentTrack(tracks[nextIndex]);
      setIsPlaying(true);
    }
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-purple-700 p-6 text-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 rounded-lg p-2">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Rockin Rockin Boogie</h3>
              <p className="text-purple-200 text-sm">Live Music Streaming</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-700/50 rounded-full px-3 py-1">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-sm font-semibold">LIVE</span>
          </div>
        </div>

        {/* Now Playing */}
        {currentTrack && (
          <div className="bg-purple-700/30 rounded-lg p-4 space-y-3">
            <p className="text-purple-200 text-xs uppercase tracking-wide">Now Playing</p>
            <div>
              <h4 className="text-lg font-bold truncate">{currentTrack.title}</h4>
              <p className="text-purple-200 text-sm truncate">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-purple-200">
              <span>{Math.floor(currentTrack.duration / 60)}:{String(currentTrack.duration % 60).padStart(2, '0')}</span>
              <span>{currentTrack.plays.toLocaleString()} plays</span>
            </div>
          </div>
        )}

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handlePlayPause}
            className="bg-purple-600 hover:bg-purple-500 rounded-full w-12 h-12 p-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
          <Button
            onClick={handleNextTrack}
            className="bg-purple-700 hover:bg-purple-600 rounded-full w-12 h-12 p-0"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Volume2 className="w-4 h-4 text-purple-300" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="flex-1 h-1 bg-purple-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-purple-200 w-8 text-right">{volume}%</span>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-2">
          <p className="text-purple-200 text-xs uppercase tracking-wide">Up Next</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => selectTrack(track)}
                className={`w-full text-left p-2 rounded transition-colors ${
                  currentTrack?.id === track.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-700/30 text-purple-200 hover:bg-purple-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.title}</p>
                    <p className="text-xs opacity-75 truncate">{track.artist}</p>
                  </div>
                  <span className="text-xs ml-2 opacity-75">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-purple-700/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-300">{tracks.length}</p>
            <p className="text-xs text-purple-200">Tracks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-300">{tracks.reduce((sum, t) => sum + t.plays, 0).toLocaleString()}</p>
            <p className="text-xs text-purple-200">Total Plays</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
