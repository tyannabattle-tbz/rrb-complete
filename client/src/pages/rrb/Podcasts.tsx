import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Share2, Volume2, Clock, User, Calendar, Radio, ChevronDown, ChevronUp, Youtube, Apple, Music as SpotifyIcon, Radio as RadioIcon, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { FrequencyPresetButtons } from '@/components/rrb/FrequencyPresetButtons';
import { FrequencyIndicatorBadge } from '@/components/rrb/FrequencyIndicatorBadge';
import { FrequencyModal } from '@/components/rrb/FrequencyModal';
import { FrequencyEQFilter } from '@/lib/frequencyEQFilter';
import { Music } from 'lucide-react';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishedAt: Date;
  author: string;
  episodeNumber: number;
  season: number;
  thumbnailUrl?: string;
  transcript?: string;
  chapters?: { time: number; title: string }[];
  downloadUrl?: string;
  videoUrl?: string;
}

interface PodcastSeries {
  id: string;
  title: string;
  description: string;
  author: string;
  episodes: PodcastEpisode[];
  rssUrl?: string;
  thumbnailUrl?: string;
  subscriberCount: number;
}

interface Channel {
  id: string;
  name: string;
  listeners: number;
  isLive: boolean;
  color: string;
}

const CHANNELS: Channel[] = [
  { id: 'rrb-main', name: 'RRB Main', listeners: 1240, isLive: true, color: 'orange' },
  { id: 'sean-music', name: "Sean's Music", listeners: 342, isLive: true, color: 'blue' },
  { id: 'anna-company', name: "Anna's Company", listeners: 156, isLive: true, color: 'purple' },
  { id: 'jaelon-enterprises', name: 'Jaelon Enterprises', listeners: 89, isLive: true, color: 'pink' },
  { id: 'little-c', name: 'Little C Productions', listeners: 203, isLive: true, color: 'green' },
];

export default function Podcasts() {
  const [series, setSeries] = useState<PodcastSeries[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedChannelId, setSelectedChannelId] = useState('rrb-main');
  const [selectedFrequency, setSelectedFrequency] = useState(440);
  const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);
  const [showFrequencyControls, setShowFrequencyControls] = useState(false);
  const eqFilterRef = useRef<FrequencyEQFilter | null>(null);
  const { user } = useAuth();

  // Initialize EQ filter
  useEffect(() => {
    if (audioRef.current && !eqFilterRef.current) {
      eqFilterRef.current = new FrequencyEQFilter(audioRef.current);
    }
  }, []);

  // Apply frequency filter when selected frequency changes
  useEffect(() => {
    if (eqFilterRef.current && isPlaying) {
      eqFilterRef.current.setFrequency(selectedFrequency);
    }
  }, [selectedFrequency, isPlaying]);

  // Mock podcast data
  useEffect(() => {
    const mockSeries: PodcastSeries = {
      id: '1',
      title: "Rockin' Rockin' Boogie Podcast",
      description: "Exploring the legacy of Seabrun Candy Hunter and Little Richard through music, history, and archival stories.",
      author: "Rockin' Rockin' Boogie",
      subscriberCount: 1250,
      episodes: [
        {
          id: '1',
          title: "Episode 1: The Beginning - Seabrun's Journey",
          description: "In this inaugural episode, we explore the early life of Seabrun Candy Hunter and how he became involved with Little Richard.",
          audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
          duration: 330,
          publishedAt: new Date('2024-01-15'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 1,
          season: 1,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          id: '2',
          title: 'Episode 2: The Music - Recordings & Performances',
          description: "Deep dive into the recordings, performances, and musical contributions of Seabrun Candy Hunter.",
          audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/zByVVlWeoYCaITZI.mp3',
          duration: 372,
          publishedAt: new Date('2024-01-22'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 2,
          season: 1,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          id: '3',
          title: 'Episode 3: The Archive - Proof & Documentation',
          description: "Exploring the archival evidence, documentation, and verification of Seabrun's contributions to music history.",
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          duration: 600,
          publishedAt: new Date('2024-01-29'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 3,
          season: 1,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          id: '4',
          title: 'Episode 4: The Legacy - Impact & Influence',
          description: "Examining how Seabrun's work continues to influence modern music and culture.",
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          duration: 420,
          publishedAt: new Date('2024-02-05'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 4,
          season: 1,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          id: '5',
          title: 'Episode 5: The Collaborations - Working with Legends',
          description: "Exploring Seabrun's collaborations with other legendary musicians and artists.",
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          duration: 480,
          publishedAt: new Date('2024-02-12'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 5,
          season: 1,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          id: '6',
          title: 'Episode 6: The Performances - Live Recordings',
          description: "A collection of live performances and concert recordings from Seabrun's career.",
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
          duration: 540,
          publishedAt: new Date('2024-02-19'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 6,
          season: 1,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      ],
    };
    setSeries([mockSeries]);
    setSelectedEpisode(mockSeries.episodes[0]);
  }, []);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentChannel = CHANNELS.find(c => c.id === selectedChannelId) || CHANNELS[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold mb-2">Podcast & Video</h1>
          <p className="text-sm text-foreground/60">A Canryn Production — QUMUS Orchestrated</p>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-semibold">Current Channel:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannelId(channel.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedChannelId === channel.id
                  ? `border-${channel.color}-500 bg-${channel.color}-500/10`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-sm">{channel.name}</div>
              <div className="text-xs text-foreground/60">{channel.listeners.toLocaleString()} listeners</div>
            </button>
          ))}
        </div>
      </div>

      {/* Currently Playing */}
      {selectedEpisode && (
        <div className="container mx-auto px-4 py-6">
          <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-purple-500/5 border-amber-500/20">
            {/* Video Player */}
            {selectedEpisode.videoUrl && (
              <div className="mb-6 rounded-lg overflow-hidden bg-black aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedEpisode.videoUrl}
                  title={selectedEpisode.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">{selectedEpisode.title}</h2>
                <div className="flex items-center gap-4 text-sm text-foreground/60">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedEpisode.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(selectedEpisode.duration)}
                  </span>
                </div>
              </div>
              <FrequencyIndicatorBadge frequency={selectedFrequency} />
            </div>

            {/* Audio Player */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={audioDuration}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setCurrentTime(newTime);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-foreground/60">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePlayPause}
                    className="rounded-full w-12 h-12 p-0 bg-orange-500 hover:bg-orange-600"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-foreground/60" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        if (audioRef.current) {
                          audioRef.current.volume = parseFloat(e.target.value) / 100;
                        }
                      }}
                      className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-foreground/60 w-8">{volume}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toast.success('Download started')}>
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.success('Copied to clipboard')}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600 text-white gap-2"
                    onClick={() => {
                      toast.success('🔴 LIVE: Broadcasting started! You are now on air.');
                      setIsPlaying(true);
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Go Live
                  </Button>
                </div>
              </div>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={selectedEpisode.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
          </Card>
        </div>
      )}

      {/* RSS Feeds & Frequency Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RSS Feeds */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <RadioIcon className="w-5 h-5" />
              Subscribe on Your Platform
            </h3>
            <div className="space-y-2">
              <Button className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700" asChild>
                <a href="https://www.youtube.com/@rockinrockinboogie" target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-5 h-5" />
                  YouTube
                </a>
              </Button>
              <Button className="w-full justify-start gap-2 bg-black hover:bg-gray-800" asChild>
                <a href="https://podcasts.apple.com" target="_blank" rel="noopener noreferrer">
                  <Apple className="w-5 h-5" />
                  Apple Podcasts
                </a>
              </Button>
              <Button className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700" asChild>
                <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer">
                  <SpotifyIcon className="w-5 h-5" />
                  Spotify
                </a>
              </Button>
              <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                <a href="https://podcasts.google.com" target="_blank" rel="noopener noreferrer">
                  <RadioIcon className="w-5 h-5" />
                  Google Podcasts
                </a>
              </Button>
            </div>
          </div>

          {/* Frequency Controls */}
          <div>
            <button
              onClick={() => setShowFrequencyControls(!showFrequencyControls)}
              className="flex items-center gap-2 text-lg font-bold mb-3 text-orange-500 hover:text-orange-600 w-full"
            >
              <Music className="w-5 h-5" />
              Frequency Tuning
              {showFrequencyControls ? (
                <ChevronUp className="w-5 h-5 ml-auto" />
              ) : (
                <ChevronDown className="w-5 h-5 ml-auto" />
              )}
            </button>

            {showFrequencyControls && (
              <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <FrequencyPresetButtons
                  selectedFrequency={selectedFrequency}
                  onSelectFrequency={setSelectedFrequency}
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Episode List */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">All Episodes ({series[0]?.episodes.length || 0})</h2>
        <div className="space-y-3">
          {series[0]?.episodes.map(episode => (
            <Card
              key={episode.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedEpisode?.id === episode.id
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedEpisode(episode);
                setIsPlaying(false);
              }}
            >
              <div className="flex items-start gap-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEpisode(episode);
                    handlePlayPause();
                  }}
                  className="rounded-full w-10 h-10 p-0 bg-orange-500 hover:bg-orange-600 flex-shrink-0 mt-1"
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </Button>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2">{episode.title}</h3>
                  <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{episode.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-foreground/50">
                    <span>{formatTime(episode.duration)}</span>
                    <span>{new Date(episode.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
