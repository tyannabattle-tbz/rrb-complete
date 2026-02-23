import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AlertAudio {
  id: string;
  type: 'weather' | 'public_safety' | 'health' | 'critical';
  title: string;
  message: string;
  audioUrl: string;
  duration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AudioAlertPlayerProps {
  alert: AlertAudio;
  onClose?: () => void;
  autoPlay?: boolean;
}

export function AudioAlertPlayer({ alert, onClose, autoPlay = true }: AudioAlertPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(err => console.error('Auto-play failed:', err));
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = () => {
    switch (alert.priority) {
      case 'critical':
        return 'bg-red-600 border-red-700';
      case 'high':
        return 'bg-orange-600 border-orange-700';
      case 'medium':
        return 'bg-yellow-600 border-yellow-700';
      default:
        return 'bg-blue-600 border-blue-700';
    }
  };

  const getPriorityIcon = () => {
    switch (alert.priority) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`${getPriorityColor()} border-2 rounded-lg shadow-2xl overflow-hidden`}>
      {/* Header */}
      <div className="bg-black/30 p-4 border-b border-white/20">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getPriorityIcon()}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{alert.title}</h3>
              <p className="text-sm text-white/80">{alert.type.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-white/90 text-sm">{alert.message}</p>
      </div>

      {/* Audio Player */}
      <div className="bg-black/50 p-4">
        <audio
          ref={audioRef}
          src={alert.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {/* Play/Pause and Info */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={handlePlayPause}
            className={`p-3 rounded-full transition-colors ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </Button>

          <div className="flex-1">
            <div className="w-full bg-black/50 rounded-full h-2 mb-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${(currentTime / alert.duration) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(alert.duration)}</span>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleMute}
            className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </Button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #fff 0%, #fff ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />

          <span className="text-xs text-white/70 min-w-fit">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Alert Info */}
      <div className="bg-black/30 p-3 border-t border-white/20 text-xs text-white/70">
        <p>
          🔊 Alert ID: {alert.id} | Priority: {alert.priority.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

/**
 * Generate synthetic alert audio using Web Audio API
 */
export function generateAlertAudio(
  type: 'weather' | 'public_safety' | 'health' | 'critical',
  duration: number = 3
): string {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = audioBuffer.getChannelData(0);

  // Generate alert tone based on type
  const frequencies = {
    weather: [800, 1000, 800, 1000], // Alternating tones
    public_safety: [1000, 1200, 1000, 1200],
    health: [600, 800, 600, 800],
    critical: [1200, 1400, 1200, 1400],
  };

  const freqs = frequencies[type];
  const toneLength = (sampleRate * duration) / freqs.length;

  for (let i = 0; i < data.length; i++) {
    const toneIndex = Math.floor(i / toneLength) % freqs.length;
    const frequency = freqs[toneIndex];
    const t = i / sampleRate;

    // Generate sine wave with envelope
    const envelope = Math.exp(-t * 2); // Decay envelope
    data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
  }

  // Create blob and return data URL
  const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();

  return audioBuffer.getChannelData(0).toString(); // Simplified return
}
