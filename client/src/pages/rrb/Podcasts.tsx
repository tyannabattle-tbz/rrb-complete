import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Share2, Volume2, Clock, User, Calendar, Radio, MonitorPlay, Maximize2, Minimize2, Bot, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { LiveCallIn } from '@/components/rrb/LiveCallIn';

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

// Commercial break component for podcast pages
function PodcastCommercialBreak() {
  const { data: commercials } = trpc.commercials.getCommercials.useQuery(undefined, {
    retry: false,
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get active commercials
  const activeCommercials = commercials?.filter(
    (c: any) => c.status === 'active' || c.status === 'approved'
  ) || [];

  // Rotate every 60 seconds
  useEffect(() => {
    if (activeCommercials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % activeCommercials.length);
    }, 60000);
    return () => clearInterval(interval);
  }, [activeCommercials.length]);

  const current = activeCommercials[currentIdx];

  if (!current) {
    // Show a static promo if no commercials loaded
    return (
      <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-500/30">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Brought to you by Canryn Production</p>
            <p className="text-xs text-foreground/60">Supporting the legacy of Seabrun Candy Hunter</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-500/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Sponsor Message</span>
        </div>
        {activeCommercials.length > 1 && (
          <span className="text-xs text-foreground/40">{currentIdx + 1}/{activeCommercials.length}</span>
        )}
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{current.title}</p>
      <p className={`text-xs text-foreground/70 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {current.script}
      </p>
      {current.script && current.script.length > 120 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-amber-500 hover:text-amber-400 mt-1"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-foreground/40">{current.brand?.replace('_', ' ')}</span>
        {activeCommercials.length > 1 && (
          <button
            onClick={() => setCurrentIdx(prev => (prev + 1) % activeCommercials.length)}
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            Next sponsor →
          </button>
        )}
      </div>
    </Card>
  );
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(true);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // QUMUS AI Assistant
  const { user } = useAuth();
  const [showAI, setShowAI] = useState(true);
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant'; content: string}[]>([
    { role: 'assistant', content: "Hey there! I'm QUMUS, your podcast AI assistant. I can help you explore episodes, discuss the legacy of Seabrun Candy Hunter, recommend content, and answer questions about the Rockin' Rockin' Boogie ecosystem. What would you like to know?" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const aiScrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.ai.qumusChat.chat.useMutation({
    onSuccess: (data) => {
      const content = typeof data.message === 'string' ? data.message : 'I encountered an issue. Please try again.';
      setAiMessages(prev => [...prev, { role: 'assistant', content }]);
    },
    onError: () => {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' }]);
    }
  });

  const sendAiMessage = () => {
    if (!aiInput.trim() || chatMutation.isPending) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput('');
    const contextPrefix = selectedEpisode 
      ? `[User is currently on the podcast page, viewing "${selectedEpisode.title}" - Episode ${selectedEpisode.episodeNumber}, Season ${selectedEpisode.season}. The podcast is about the legacy of Seabrun Candy Hunter and Little Richard.] ` 
      : '[User is on the podcast page of Rockin\' Rockin\' Boogie.] ';
    chatMutation.mutate({
      query: contextPrefix + userMsg,
      messages: aiMessages.slice(-6).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    });
  };

  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages]);

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
          audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
          videoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/cfWvEqBGZbBnvEIe.mp4',
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
          videoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/cfWvEqBGZbBnvEIe.mp4',
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
                {/* Video Viewing Screen */}
                {selectedEpisode.videoUrl && (
                  <Card className="overflow-hidden" ref={videoContainerRef}>
                    {showVideo ? (
                      <div className={`relative bg-black ${isVideoFullscreen ? 'fixed inset-0 z-50' : ''}`}>
                        <video
                          ref={videoRef}
                          src={selectedEpisode.videoUrl}
                          className="w-full aspect-video object-contain"
                          controls
                          playsInline
                          poster=""
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-black/60 border-white/20 text-white hover:bg-black/80 backdrop-blur-sm"
                            onClick={() => {
                              if (isVideoFullscreen) {
                                document.exitFullscreen?.();
                                setIsVideoFullscreen(false);
                              } else {
                                videoContainerRef.current?.requestFullscreen?.();
                                setIsVideoFullscreen(true);
                              }
                            }}
                          >
                            {isVideoFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MonitorPlay className="w-4 h-4 text-amber-500" />
                              <span className="text-sm text-white font-medium">Video Podcast</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-black/40 border-white/20 text-white hover:bg-black/60 text-xs"
                              onClick={() => setShowVideo(false)}
                            >
                              Audio Only
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 aspect-video flex items-center justify-center cursor-pointer group"
                        onClick={() => setShowVideo(true)}
                      >
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto group-hover:bg-amber-500/30 transition-colors">
                            <MonitorPlay className="w-8 h-8 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Watch Video Version</p>
                            <p className="text-white/60 text-sm">Tap to switch to video podcast</p>
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <MonitorPlay className="w-3 h-3 mr-1" /> Video Available
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

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

                {/* Podcast Commercial Break */}
                <PodcastCommercialBreak />

                {/* QUMUS AI Podcast Assistant */}
                <Card className="overflow-hidden border-amber-500/30">
                  <button
                    onClick={() => setShowAI(!showAI)}
                    className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-purple-500/10 hover:from-amber-500/15 hover:to-purple-500/15 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">QUMUS Podcast Assistant</p>
                        <p className="text-xs text-foreground/60">Ask about episodes, legacy, or get recommendations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
                      {showAI ? <ChevronUp className="w-4 h-4 text-foreground/60" /> : <ChevronDown className="w-4 h-4 text-foreground/60" />}
                    </div>
                  </button>
                  {showAI && (
                    <div className="border-t border-border">
                      <div ref={aiScrollRef} className="h-64 overflow-y-auto p-4 space-y-3">
                        {aiMessages.map((msg, i) => (
                          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              msg.role === 'user'
                                ? 'bg-amber-500 text-black'
                                : 'bg-card border border-border text-foreground'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {chatMutation.isPending && (
                          <div className="flex gap-2 justify-start">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
                            </div>
                            <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground/60">
                              Thinking...
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-border flex gap-2">
                        <input
                          type="text"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                          placeholder="Ask QUMUS about this episode..."
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <Button
                          size="sm"
                          onClick={sendAiMessage}
                          disabled={chatMutation.isPending || !aiInput.trim()}
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Live Call-In */}
                <LiveCallIn context="podcast" showName={selectedEpisode?.title || "RRB Podcast"} isLive={true} />

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
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open('/rss', '_blank')}>
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

      {/* Podcast Commercial Break - also in sidebar for mobile */}
      {!selectedEpisode && (
        <div className="container mx-auto px-4 max-w-7xl mb-8">
          <PodcastCommercialBreak />
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={selectedEpisode?.audioUrl}
        preload="auto"
      />
    </div>
  );
}
