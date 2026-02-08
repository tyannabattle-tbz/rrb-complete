import React, { useState, useRef, useEffect } from 'react';
import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Radio, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

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

  // Sample streams for demo
  const sampleStreams: StreamConfig[] = [
    {
      url: 'https://stream.example.com/rockin-live',
      name: 'RockinRockinBoogie Live',
      genre: 'Rock/Pop',
      bitrate: '320 kbps',
    },
    {
      url: 'https://stream.example.com/rockin-classics',
      name: 'RRB Classics',
      genre: 'Classic Rock',
      bitrate: '256 kbps',
    },
    {
      url: 'https://stream.example.com/rockin-indie',
      name: 'RRB Indie Mix',
      genre: 'Indie/Alternative',
      bitrate: '192 kbps',
    },
  ];

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
        await audioRef.current.play();
        setIsPlaying(true);
        setStreamStatus('Playing');
        // Simulate listener count
        setListeners(Math.floor(Math.random() * 500) + 50);
      } catch (error) {
        console.error('Error playing stream:', error);
        setStreamStatus('Error connecting to stream');
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Radio className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">RockinRockinBoogie</h1>
          </div>
          <p className="text-purple-200">Live Audio Streaming Station</p>
        </div>

        {/* Main Player Card */}
        <Card className="bg-slate-800 border-purple-500 border-2 p-8 mb-6">
          <audio ref={audioRef} crossOrigin="anonymous" />

          {/* Now Playing */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentStream?.name || 'Select a Stream'}
            </h2>
            <p className="text-purple-300 mb-4">
              {currentStream?.genre || 'Choose a station to start listening'}
            </p>
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-purple-400 text-sm">Status</p>
                <p className="text-white font-semibold">{streamStatus}</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 text-sm">Listeners</p>
                <p className="text-white font-semibold">{listeners.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 text-sm">Quality</p>
                <p className="text-white font-semibold">{currentStream?.bitrate || '---'}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Play/Pause Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-full text-lg font-semibold flex items-center gap-3"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Play
                  </>
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-purple-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-white font-semibold w-12 text-right">{volume}%</span>
            </div>

            {/* Stream URL Input */}
            <div className="space-y-2">
              <label className="text-purple-300 text-sm font-semibold">Custom Stream URL</label>
              <Input
                type="text"
                placeholder="Enter stream URL (e.g., https://stream.example.com/live)"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="bg-slate-700 border-purple-500 text-white placeholder-slate-400"
              />
            </div>
          </div>
        </Card>

        {/* Stream Selection */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            Available Streams
          </h3>
          <div className="grid gap-4">
            {sampleStreams.map((stream, idx) => (
              <Card
                key={idx}
                className={`p-4 cursor-pointer transition-all ${
                  currentStream?.name === stream.name
                    ? 'bg-purple-600 border-purple-400 border-2'
                    : 'bg-slate-800 border-slate-700 hover:border-purple-500'
                }`}
                onClick={() => selectStream(stream)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-semibold">{stream.name}</h4>
                    <p className="text-purple-300 text-sm">{stream.genre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{stream.bitrate}</p>
                    <p className="text-purple-300 text-sm">Bitrate</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold w-full"
          >
            <Settings className="w-5 h-5" />
            Advanced Settings
          </button>

          {showSettings && (
            <div className="mt-4 space-y-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-purple-300 text-sm font-semibold">Auto-reconnect</label>
                <input type="checkbox" defaultChecked className="mt-2" />
              </div>
              <div>
                <label className="text-purple-300 text-sm font-semibold">Notifications</label>
                <input type="checkbox" defaultChecked className="mt-2" />
              </div>
              <div>
                <label className="text-purple-300 text-sm font-semibold">Buffer Size</label>
                <select className="mt-2 w-full bg-slate-700 text-white rounded p-2 border border-slate-600">
                  <option>Low (2s)</option>
                  <option selected>Normal (5s)</option>
                  <option>High (10s)</option>
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Info Footer */}
        <div className="text-center mt-8 text-purple-300 text-sm">
          <p>🎵 Streaming live from RockinRockinBoogie Studios</p>
          <p>© Canryn Production and its subsidiaries</p>
        </div>
      </div>
    </div>
  );
}
