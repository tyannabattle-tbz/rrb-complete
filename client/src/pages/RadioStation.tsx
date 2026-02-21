import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Radio, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { NotificationCenter } from '@/components/rrb/NotificationCenter';
import { RecordingPanel } from '@/components/rrb/RecordingPanel';
import { AnalyticsDashboard } from '@/components/rrb/AnalyticsDashboard';
import { initializeNotifications } from '@/lib/notificationService';

interface StreamConfig {
  url: string;
  name: string;
  genre: string;
  bitrate: string;
}

export default function RadioStation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [streamUrl, setStreamUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [currentStream, setCurrentStream] = useState<StreamConfig | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [streamStatus, setStreamStatus] = useState('Ready');
  const [listeners, setListeners] = useState(0);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Real audio streams with working URLs
  const sampleStreams: StreamConfig[] = [
    {
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      name: 'Sonic Universe — Jazz Fusion & Soul',
      genre: 'Jazz/Soul/Funk',
      bitrate: '128 kbps',
    },
    {
      url: 'https://funkyradio.streamingmedia.it/play.mp3',
      name: 'Funky Radio — Classic Funk',
      genre: 'Funk/Soul/R&B',
      bitrate: '128 kbps',
    },
    {
      url: 'https://ice1.somafm.com/seventies-128-mp3',
      name: 'Left Coast 70s — Mellow Vibes',
      genre: '70s Rock/Soul',
      bitrate: '128 kbps',
    },
    {
      url: 'https://ice1.somafm.com/secretagent-128-mp3',
      name: 'Secret Agent — Lounge & Spy',
      genre: 'Lounge/Jazz',
      bitrate: '128 kbps',
    },
    {
      url: 'https://stream.radioparadise.com/mp3-128',
      name: 'Radio Paradise — Eclectic Mix',
      genre: 'Eclectic/Rock',
      bitrate: '128 kbps',
    },
  ];

  // Initialize audio element with proper event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setStreamStatus('Playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      setStreamStatus('Paused');
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setStreamStatus('Stream error - check URL');
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setStreamStatus('Playing');
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const handlePlayPause = async () => {
    if (!currentStream && !streamUrl) {
      alert('Please select or enter a stream URL');
      return;
    }

    const url = currentStream?.url || streamUrl;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setStreamStatus('Paused');
    } else if (audioRef.current) {
      try {
        audioRef.current.src = url;
        audioRef.current.volume = volume / 100;
        audioRef.current.crossOrigin = 'anonymous';
        
        // Add comprehensive error handling
        audioRef.current.onerror = () => {
          console.error('Audio playback error for URL:', url);
          setStreamStatus('Stream unavailable - check network');
          setIsPlaying(false);
        };
        
        audioRef.current.onloadstart = () => {
          setStreamStatus('Connecting...');
        };
        
        audioRef.current.onloadedmetadata = () => {
          setStreamStatus('Stream loaded');
        };
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setStreamStatus('Playing');
          // Simulate listener count
          setListeners(Math.floor(Math.random() * 500) + 50);
        }
      } catch (error) {
        console.error('Error playing stream:', error);
        setStreamStatus(`Error: ${error instanceof Error ? error.message : 'Unable to connect'}`);
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const selectStream = (stream: StreamConfig) => {
    setCurrentStream(stream);
    setStreamUrl(stream.url);
    setStreamStatus('Ready');
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Notification Center */}
        <div className="text-center mb-8 flex items-center justify-between">
          <div className="flex items-center justify-center gap-3 flex-1">
            <Radio className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">RockinRockinBoogie</h1>
          </div>
          <NotificationCenter />
        </div>
        <p className="text-purple-200 text-center mb-8">Live Audio Streaming Station</p>

        {/* Main Player Card */}
        <Card className="bg-slate-800 border-purple-500 border-2 p-8 mb-6">
          {/* Hidden Audio Element */}
          <audio ref={audioRef} crossOrigin="anonymous" />

          {/* Current Stream Display */}
          <div className="mb-6 p-4 bg-slate-700 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              {currentStream?.name || 'Select a stream'}
            </h2>
            {currentStream && (
              <div className="text-sm text-gray-300 space-y-1">
                <p>Genre: {currentStream.genre}</p>
                <p>Bitrate: {currentStream.bitrate}</p>
              </div>
            )}
          </div>

          {/* Status Display */}
          <div className="mb-6 p-3 bg-slate-600 rounded text-center">
            <p className="text-white font-medium">{streamStatus}</p>
            {listeners > 0 && (
              <p className="text-purple-300 text-sm mt-1">
                {listeners} listeners online
              </p>
            )}
          </div>

          {/* Play/Pause Button */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Volume</span>
              <span className="text-gray-400 ml-auto">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Custom Stream URL */}
          <div className="mb-6">
            <label className="text-white font-medium mb-2 block">
              Custom Stream URL
            </label>
            <Input
              type="text"
              placeholder="Enter stream URL (e.g., https://stream.example.com/live)"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
            />
          </div>
        </Card>

        {/* Available Streams */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Available Streams</h3>
          <div className="grid grid-cols-1 gap-3">
            {sampleStreams.map((stream) => (
              <Card
                key={stream.url}
                onClick={() => selectStream(stream)}
                className={`p-4 cursor-pointer transition-all ${
                  currentStream?.url === stream.url
                    ? 'bg-purple-600 border-purple-400'
                    : 'bg-slate-800 border-slate-700 hover:border-purple-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{stream.name}</h4>
                    <p className="text-sm text-gray-400">
                      {stream.genre} • {stream.bitrate}
                    </p>
                  </div>
                  {currentStream?.url === stream.url && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Stream Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">
                  Preferred Bitrate
                </label>
                <select className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2">
                  <option>320 kbps (High Quality)</option>
                  <option>256 kbps (Standard)</option>
                  <option>192 kbps (Low Bandwidth)</option>
                </select>
              </div>
              <div>
                <label className="text-white font-medium mb-2 block">
                  Auto-reconnect on Disconnect
                </label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </div>
          </Card>
        )}

        {/* Settings and Advanced Features Toggle */}
        <div className="mt-6 text-center space-y-4 mb-8">
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </Button>
            <Button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              {showAdvancedFeatures ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </div>
        </div>

        {/* Advanced Features Section */}
        {showAdvancedFeatures && currentStream && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Advanced Features</h2>
            
            {/* Recording Panel */}
            <RecordingPanel channelId={currentStream.url} channelName={currentStream.name} />

            {/* Analytics Dashboard */}
            <AnalyticsDashboard channelId={currentStream.url} channelName={currentStream.name} />
          </div>
        )}

        {showAdvancedFeatures && !currentStream && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">Select a stream to access advanced features like recording and analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
