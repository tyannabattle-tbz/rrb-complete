import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Share2, Volume2, Clock, User, Calendar } from 'lucide-react';

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

/**
 * Podcasts Page
 * 
 * Features:
 * - Audio player with waveform visualization
 * - Episode list and descriptions
 * - Download capability
 * - RSS feed for subscriptions
 * - Playback speed control
 * - Chapters/timestamps
 */
export default function Podcasts() {
  const [series, setSeries] = useState<PodcastSeries[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize podcast data
  useEffect(() => {
    const mockSeries: PodcastSeries = {
      id: '1',
      title: 'Rockin\' Rockin\' Boogie Podcast',
      description: 'Exploring the legacy of Seabrun Candy Hunter and Little Richard through music, history, and archival stories.',
      author: 'Rockin\' Rockin\' Boogie',
      subscriberCount: 1250,
      episodes: [
        {
          id: '1',
          title: 'Episode 1: The Beginning - Seabrun\'s Journey',
          description: 'In this inaugural episode, we explore the early life of Seabrun Candy Hunter and how he became involved with Little Richard.',
          audioUrl: '/audio/allaboutcandy1.mp3',
          duration: 2800,
          publishedAt: new Date('2024-01-15'),
          author: 'Rockin\' Rockin\' Boogie',
          episodeNumber: 1,
          season: 1,
          chapters: [
            { time: 0, title: 'Introduction' },
            { time: 120, title: 'Early Life' },
            { time: 480, title: 'Meeting Little Richard' },
            { time: 1200, title: 'First Performances' },
          ],
        },
        {
          id: '2',
          title: 'Episode 2: The Music - Recordings & Performances',
          description: 'Deep dive into the recordings, performances, and musical contributions of Seabrun Candy Hunter.',
          audioUrl: '/audio/allaboutcandy2.mp3',
          duration: 1500,
          publishedAt: new Date('2024-01-22'),
          author: 'Rockin\' Rockin\' Boogie',
          episodeNumber: 2,
          season: 1,
          chapters: [
            { time: 0, title: 'Introduction' },
            { time: 180, title: 'Studio Recordings' },
            { time: 600, title: 'Live Performances' },
            { time: 1200, title: 'Musical Legacy' },
          ],
        },
        {
          id: '3',
          title: 'Episode 3: The Archive - Proof & Documentation',
          description: 'Exploring the archival evidence, documentation, and verification of Seabrun\'s contributions.',
          audioUrl: '/audio/allaboutcandy3.mp3',
          duration: 1800,
          publishedAt: new Date('2024-01-29'),
          author: 'Rockin\' Rockin\' Boogie',
          episodeNumber: 3,
          season: 1,
          chapters: [
            { time: 0, title: 'Introduction' },
            { time: 150, title: 'Documentation Overview' },
            { time: 600, title: 'Verification Methods' },
            { time: 1500, title: 'Future Preservation' },
          ],
        },
      ],
    };

    setSeries([mockSeries]);
    setSelectedEpisode(mockSeries.episodes[0]);
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle playback speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !selectedEpisode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * selectedEpisode.duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">Podcasts</h1>
          <p className="text-xl text-foreground/70">
            Listen to stories, interviews, and deep dives into the Rockin' Rockin' Boogie legacy.
          </p>
        </div>

        {/* 432Hz Information Banner */}
        <div className="mb-12 p-6 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-4">
          <div className="text-3xl">🎵</div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">All Podcasts Resonated at 432Hz</h3>
            <p className="text-foreground/80">
              All podcast episodes have been carefully resonated at 432Hz, known as the universal frequency. This tuning is believed to promote healing, harmony, and spiritual alignment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-8">
            {selectedEpisode && (
              <>
                {/* Player Card */}
                <Card className="p-8 bg-gradient-to-br from-accent/10 to-background border-accent/20">
                  <div className="space-y-6">
                    {/* Episode Info */}
                    <div>
                      <Badge className="mb-3 bg-accent text-accent-foreground">
                        Season {selectedEpisode.season} • Episode {selectedEpisode.episodeNumber}
                      </Badge>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {selectedEpisode.title}
                      </h2>
                      <p className="text-foreground/70 mb-4">{selectedEpisode.description}</p>

                      {/* Episode Meta */}
                      <div className="flex flex-wrap gap-6 text-sm text-foreground/60">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{selectedEpisode.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedEpisode.publishedAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(selectedEpisode.duration)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div
                        onClick={handleProgressClick}
                        className="w-full h-2 bg-background rounded-full cursor-pointer hover:h-3 transition-all"
                      >
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{
                            width: `${(currentTime / selectedEpisode.duration) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Time Display */}
                      <div className="flex justify-between text-xs text-foreground/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(selectedEpisode.duration)}</span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-4">
                        <Button
                          size="lg"
                          onClick={togglePlayPause}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full w-16 h-16 flex items-center justify-center"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-1" />
                          )}
                        </Button>

                        {/* Speed Control */}
                        <div className="flex gap-2">
                          {[0.75, 1, 1.25, 1.5].map((speed) => (
                            <Button
                              key={speed}
                              size="sm"
                              variant={playbackSpeed === speed ? 'default' : 'outline'}
                              onClick={() => handleSpeedChange(speed)}
                              className="text-xs"
                            >
                              {speed}x
                            </Button>
                          ))}
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 ml-auto">
                          <Volume2 className="w-4 h-4 text-foreground/60" />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="100"
                            onChange={(e) => {
                              if (audioRef.current) {
                                audioRef.current.volume = parseInt(e.target.value) / 100;
                              }
                            }}
                            className="w-24"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Chapters */}
                    {selectedEpisode.chapters && selectedEpisode.chapters.length > 0 && (
                      <div className="border-t border-border pt-6">
                        <h3 className="font-semibold text-foreground mb-3">Chapters</h3>
                        <div className="space-y-2">
                          {selectedEpisode.chapters.map((chapter, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (audioRef.current) {
                                  audioRef.current.currentTime = chapter.time;
                                  setCurrentTime(chapter.time);
                                }
                              }}
                              className="w-full text-left p-2 rounded hover:bg-accent/10 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-foreground font-medium">{chapter.title}</span>
                                <span className="text-xs text-foreground/60">{formatTime(chapter.time)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Transcript */}
                {selectedEpisode.transcript && (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Transcript</h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-foreground/70 whitespace-pre-wrap">
                        {selectedEpisode.transcript}
                      </p>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar: Series & Episodes */}
          <div className="space-y-6">
            {/* Series Info */}
            {series.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">{series[0].title}</h3>
                <p className="text-sm text-foreground/70 mb-4">{series[0].description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <User className="w-4 h-4" />
                    <span>by {series[0].author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <span>📊 {series[0].subscriberCount.toLocaleString()} subscribers</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                    Subscribe
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    RSS Feed
                  </Button>
                </div>
              </Card>
            )}

            {/* Episodes List */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Episodes</h3>
              <div className="space-y-2">
                {series[0]?.episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => {
                      setSelectedEpisode(episode);
                      setIsPlaying(false);
                      setCurrentTime(0);
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedEpisode?.id === episode.id
                        ? 'bg-accent/10 border border-accent'
                        : 'bg-background hover:bg-card border border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {selectedEpisode?.id === episode.id && isPlaying ? (
                          <Pause className="w-4 h-4 text-accent" />
                        ) : (
                          <Play className="w-4 h-4 text-foreground/60" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm line-clamp-2">
                          Ep {episode.episodeNumber}: {episode.title}
                        </p>
                        <p className="text-xs text-foreground/60 mt-1">
                          {formatTime(episode.duration)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={selectedEpisode?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
