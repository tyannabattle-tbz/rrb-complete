import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Share2, Volume2, Clock, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

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

export default function Podcasts() {
  const [series, setSeries] = useState<PodcastSeries[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Real audio URLs — Seabrun Candy Hunter legacy content
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
          description: "In this inaugural episode, we explore the early life of Seabrun Candy Hunter and how he became involved with Little Richard. From the streets of Georgia to the stages of the world, this is where the legacy began.",
          audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/LhZvyaWhSQodjVFs.mp3',
          duration: 330,
          publishedAt: new Date('2024-01-15'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 1,
          season: 1,
          chapters: [
            { time: 0, title: 'Introduction' },
            { time: 30, title: 'Early Life' },
            { time: 120, title: 'Meeting Little Richard' },
            { time: 240, title: 'First Performances' },
          ],
        },
        {
          id: '2',
          title: 'Episode 2: The Music - Recordings & Performances',
          description: "Deep dive into the recordings, performances, and musical contributions of Seabrun Candy Hunter. The songs that defined an era.",
          audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/zByVVlWeoYCaITZI.mp3',
          duration: 372,
          publishedAt: new Date('2024-01-22'),
          author: "Rockin' Rockin' Boogie",
          episodeNumber: 2,
          season: 1,
          chapters: [
            { time: 0, title: 'Introduction' },
            { time: 45, title: 'Studio Recordings' },
            { time: 150, title: 'Live Performances' },
            { time: 280, title: 'Musical Legacy' },
          ],
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
          chapters: [
            { time: 0, title: 'Introduction' },
            { time: 60, title: 'Documentation Overview' },
            { time: 240, title: 'Verification Methods' },
            { time: 480, title: 'Future Preservation' },
          ],
        },
      ],
    };

    setSeries([mockSeries]);
    setSelectedEpisode(mockSeries.episodes[0]);
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) setAudioDuration(audio.duration);
    };
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      toast.error('Audio playback error. Please try again.');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        toast.error('Click anywhere on the page first, then try again (browser autoplay policy).');
      });
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * (audioDuration || audio.duration || 0);
    if (isFinite(newTime)) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  const handleDownload = () => {
    if (!selectedEpisode) return;
    const a = document.createElement('a');
    a.href = selectedEpisode.audioUrl;
    a.download = `${selectedEpisode.title}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started!');
  };

  const handleShare = () => {
    if (!selectedEpisode) return;
    if (navigator.share) {
      navigator.share({
        title: selectedEpisode.title,
        text: selectedEpisode.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleEpisodeSelect = (episode: PodcastEpisode) => {
    const audio = audioRef.current;
    setSelectedEpisode(episode);
    setCurrentTime(0);
    setIsPlaying(false);
    if (audio) {
      audio.pause();
      audio.src = episode.audioUrl;
      audio.load();
    }
  };

  const handleChapterClick = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
    if (!isPlaying) {
      audio.play().catch(() => {});
    }
  };

  const displayDuration = audioDuration > 0 ? audioDuration : (selectedEpisode?.duration || 0);
  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEpisode && (
              <>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Season {selectedEpisode.season} · Episode {selectedEpisode.episodeNumber}
                      </Badge>
                      <h1 className="text-2xl font-bold text-foreground">{selectedEpisode.title}</h1>
                      <div className="flex items-center gap-4 mt-2 text-sm text-foreground/60">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedEpisode.author}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedEpisode.publishedAt.toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(displayDuration)}</span>
                      </div>
                    </div>

                    <p className="text-foreground/70">{selectedEpisode.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div
                        className="h-2 bg-zinc-700 rounded-full cursor-pointer relative overflow-hidden"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-150"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-foreground/50">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(displayDuration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          size="lg"
                          className="rounded-full w-14 h-14 bg-amber-500 hover:bg-amber-600 text-black"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                        </Button>

                        {/* Speed Controls */}
                        <div className="flex gap-1">
                          {[0.75, 1, 1.25, 1.5].map(speed => (
                            <Button
                              key={speed}
                              size="sm"
                              variant={playbackSpeed === speed ? 'default' : 'outline'}
                              className="text-xs px-2"
                              onClick={() => handleSpeedChange(speed)}
                            >
                              {speed}x
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-foreground/60" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                          className="w-24 accent-amber-500"
                        />
                      </div>
                    </div>

                    {/* Download & Share */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Chapters */}
                {selectedEpisode.chapters && selectedEpisode.chapters.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">Chapters</h3>
                    <div className="space-y-2">
                      {selectedEpisode.chapters.map((chapter, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChapterClick(chapter.time)}
                          className="w-full text-left p-3 rounded-lg hover:bg-accent/10 transition-colors border border-transparent hover:border-amber-500/30"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Play className="w-3 h-3 text-amber-500" />
                              <span className="text-foreground font-medium">{chapter.title}</span>
                            </div>
                            <span className="text-xs text-foreground/60">{formatTime(chapter.time)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar: Series & Episodes */}
          <div className="space-y-6">
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
                    <span>{series[0].subscriberCount.toLocaleString()} subscribers</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black" onClick={() => toast.success('Subscribed!')}>
                    Subscribe
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info('RSS feed coming soon')}>
                    RSS Feed
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Episodes</h3>
              <div className="space-y-2">
                {series[0]?.episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeSelect(episode)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedEpisode?.id === episode.id
                        ? 'bg-amber-500/10 border border-amber-500'
                        : 'bg-background hover:bg-card border border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {selectedEpisode?.id === episode.id && isPlaying ? (
                          <Pause className="w-4 h-4 text-amber-500" />
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
        preload="auto"
      />
    </div>
  );
}
