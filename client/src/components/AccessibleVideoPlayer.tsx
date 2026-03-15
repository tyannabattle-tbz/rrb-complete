import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Subtitles, Volume2, VolumeX, Maximize, Minimize, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface CaptionCue {
  start: number;
  end: number;
  text: string;
}

interface AccessibleVideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  captions?: CaptionCue[];
  className?: string;
  autoGenerateCaptions?: boolean;
  narratedBy?: string;
}

// Default captions for known videos
const KNOWN_CAPTIONS: Record<string, CaptionCue[]> = {
  'RRB-Campaign-Narrated-Valanna-Candy': [
    { start: 0, end: 4, text: 'Sweet Miracles at the Table presents...' },
    { start: 4, end: 8, text: 'Rockin\' Rockin\' Boogie — Building the Bridge Across the World' },
    { start: 8, end: 12, text: 'From the heart of Selma, Alabama...' },
    { start: 12, end: 16, text: 'To the halls of the United Nations.' },
    { start: 16, end: 20, text: 'One family\'s legacy becomes a global movement.' },
    { start: 20, end: 24, text: 'Sweet Miracles — a voice for the voiceless.' },
    { start: 24, end: 28, text: 'Powered by QUMUS autonomous technology.' },
    { start: 28, end: 32, text: 'Join us. March 17, 2026. UN CSW70.' },
  ],
  'RRB-UN-Campaign-Building-The-Bridge': [
    { start: 0, end: 4, text: '♪ Rockin\' Rockin\' Boogie ♪' },
    { start: 4, end: 8, text: '♪ Building the bridge across the world ♪' },
    { start: 8, end: 16, text: '♪ From Selma to the United Nations ♪' },
    { start: 16, end: 24, text: '♪ Sweet Miracles at the Table ♪' },
    { start: 24, end: 32, text: '♪ A Canryn Production ♪' },
  ],
  'ecosystem-full': [
    { start: 0, end: 5, text: 'Welcome to the Rockin\' Rockin\' Boogie ecosystem.' },
    { start: 5, end: 12, text: 'What if one family\'s legacy could change the world?' },
    { start: 12, end: 20, text: 'This is the story of Rockin\' Rockin\' Boogie — a movement born from love.' },
    { start: 20, end: 30, text: 'Built on purpose, and powered by QUMUS — the most advanced autonomous technology.' },
    { start: 30, end: 40, text: 'Candy Hunter — a father, a musician, a visionary.' },
    { start: 40, end: 50, text: 'His song wasn\'t just music. It was a declaration.' },
    { start: 50, end: 60, text: 'Sweet Miracles at the Table — voice for the voiceless.' },
    { start: 60, end: 75, text: 'From the halls of the United Nations to communities across the world.' },
    { start: 75, end: 90, text: 'QUMUS orchestrates 54 radio channels, 18 subsystems, 20 active policies.' },
    { start: 90, end: 110, text: '90% autonomous control with human override capabilities.' },
    { start: 110, end: 130, text: 'HybridCast Emergency Broadcast — resilient communication when it matters most.' },
    { start: 130, end: 150, text: 'SQUADD Coalition — Strategy, Quality, Unity, Accountability, Dedication, Determination.' },
    { start: 150, end: 170, text: 'Canryn Production — the parent company overseeing the entire ecosystem.' },
    { start: 170, end: 190, text: 'From Selma, Alabama to the United Nations — building the bridge across the world.' },
    { start: 190, end: 210, text: 'Powered by love. Driven by purpose. A Canryn Production.' },
    { start: 210, end: 222, text: '© Canryn Production. All rights reserved.' },
  ],
  'selma-grits-greens': [
    { start: 0, end: 5, text: 'GRITS & GREENS — The Movement Starts Here.' },
    { start: 5, end: 12, text: 'From Selma, Alabama — where history was made.' },
    { start: 12, end: 20, text: 'SQUADD Coalition brings the community together.' },
    { start: 20, end: 30, text: 'Strategy, Quality, Unity, Accountability, Dedication, Determination.' },
    { start: 30, end: 40, text: 'Powered by QUMUS autonomous technology.' },
    { start: 40, end: 50, text: 'A Canryn Production.' },
  ],
  '60s-social-cut': [
    { start: 0, end: 5, text: 'Rockin\' Rockin\' Boogie — the movement.' },
    { start: 5, end: 12, text: 'One family\'s legacy. One global mission.' },
    { start: 12, end: 20, text: 'Sweet Miracles — voice for the voiceless.' },
    { start: 20, end: 30, text: 'From Selma to the United Nations.' },
    { start: 30, end: 40, text: 'QUMUS — 90% autonomous. 100% purpose-driven.' },
    { start: 40, end: 50, text: 'Join the movement. March 17, 2026.' },
    { start: 50, end: 60, text: 'A Canryn Production. #BuildTheBridge' },
  ],
  'vertical-stories': [
    { start: 0, end: 5, text: 'Sweet Miracles at the Table' },
    { start: 5, end: 12, text: 'Building the Bridge Across the World' },
    { start: 12, end: 20, text: 'From Selma to the United Nations' },
    { start: 20, end: 30, text: 'Join the movement — March 17, 2026' },
    { start: 30, end: 40, text: 'A Canryn Production' },
  ],
};

function getCaptionsForUrl(url: string): CaptionCue[] {
  if (url.includes('Narrated-Valanna-Candy')) return KNOWN_CAPTIONS['RRB-Campaign-Narrated-Valanna-Candy'];
  if (url.includes('Building-The-Bridge-Across-The-World')) return KNOWN_CAPTIONS['RRB-UN-Campaign-Building-The-Bridge'];
  if (url.includes('HPWKWjcKyPinNDUP')) return KNOWN_CAPTIONS['ecosystem-full'];
  if (url.includes('BYppFQPhGhmbYOkr')) return KNOWN_CAPTIONS['selma-grits-greens'];
  if (url.includes('hpJXnZlwAEvMMHmi')) return KNOWN_CAPTIONS['60s-social-cut'];
  if (url.includes('BUxkLtbiEBvBJoZn')) return KNOWN_CAPTIONS['vertical-stories'];
  return [];
}

export default function AccessibleVideoPlayer({
  src,
  poster,
  title,
  captions: propCaptions,
  className = '',
  narratedBy,
}: AccessibleVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ccEnabled, setCcEnabled] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const captions = propCaptions || getCaptionsForUrl(src);

  // Update current caption based on time
  useEffect(() => {
    if (!ccEnabled || captions.length === 0) {
      setCurrentCaption('');
      return;
    }
    const cue = captions.find(c => currentTime >= c.start && currentTime < c.end);
    setCurrentCaption(cue?.text || '');
  }, [currentTime, ccEnabled, captions]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  }, [duration]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative group bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      role="region"
      aria-label={`Video player: ${title}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        crossOrigin="anonymous"
        aria-label={title}
      />

      {/* Closed Captions Overlay */}
      {ccEnabled && currentCaption && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center px-4 pointer-events-none z-10">
          <div className="bg-black/85 text-white text-sm sm:text-base px-4 py-2 rounded-lg max-w-[90%] text-center font-medium shadow-lg">
            {currentCaption}
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 mb-2 accent-[#D4A843] cursor-pointer"
          aria-label="Video progress"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => skip(-10)} className="p-1.5 text-white/80 hover:text-white" aria-label="Rewind 10 seconds">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={togglePlay} className="p-1.5 text-white hover:text-[#D4A843]" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={() => skip(10)} className="p-1.5 text-white/80 hover:text-white" aria-label="Forward 10 seconds">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={toggleMute} className="p-1.5 text-white/80 hover:text-white" aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs text-white/60 ml-1 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* CC Toggle */}
            <button
              onClick={() => setCcEnabled(!ccEnabled)}
              className={`p-1.5 rounded transition-colors ${ccEnabled ? 'text-[#D4A843] bg-[#D4A843]/20' : 'text-white/50 hover:text-white'}`}
              aria-label={ccEnabled ? 'Disable closed captions' : 'Enable closed captions'}
              title={ccEnabled ? 'CC On' : 'CC Off'}
            >
              <Subtitles className="w-4 h-4" />
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 text-white/80 hover:text-white" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Narrated by indicator */}
        {narratedBy && (
          <div className="text-[10px] text-purple-400/70 text-right mt-0.5">
            Narrated by {narratedBy}
          </div>
        )}
      </div>

      {/* CC Badge - always visible */}
      {captions.length > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ccEnabled ? 'bg-[#D4A843] text-black' : 'bg-black/50 text-white/50'}`}>
            CC
          </span>
        </div>
      )}

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          <div className="w-16 h-16 rounded-full bg-[#D4A843]/90 flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-black ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}
