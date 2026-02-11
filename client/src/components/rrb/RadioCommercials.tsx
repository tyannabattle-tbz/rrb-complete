import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipForward, SkipBack, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Commercial {
  id: number;
  title: string;
  bookTitle: string;
  duration: number;
  audioUrl: string;
  description: string;
  bookLink: string;
  playCount?: number;
  clickCount?: number;
  seasonal?: boolean;
  seasonalPeriod?: string;
}

export default function RadioCommercials() {
  const [currentCommercialIndex, setCurrentCommercialIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [commercialStats, setCommercialStats] = useState<Record<number, { plays: number; clicks: number }>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const commercials: Commercial[] = [
    {
      id: 1,
      title: 'The Legacy Restored',
      bookTitle: "Rockin' Rockin' Boogie: The Legacy Restored",
      duration: 60,
      audioUrl: '/audio/commercials/rockin-rockin-boogie-commercial.wav',
      description: 'The definitive autobiography documenting the creative journey and cultural impact of the Rockin\' Rockin\' Boogie legacy.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 2,
      title: 'The Miracles Series',
      bookTitle: 'Miracles Books 1-7',
      duration: 45,
      audioUrl: '/audio/commercials/miracles-series-commercial.wav',
      description: 'A complete spiritual journey through seven volumes of inspiration, hope, and transformation.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 3,
      title: 'A Woman\'s Instinct',
      bookTitle: "A Woman's Instinct",
      duration: 45,
      audioUrl: '/audio/commercials/womans-instinct-commercial.wav',
      description: 'A celebration of the strength and wisdom of women everywhere.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 4,
      title: 'Just Imagine',
      bookTitle: 'Just Imagine',
      duration: 30,
      audioUrl: '/audio/commercials/just-imagine-commercial.wav',
      description: 'Unlock your creative potential and explore infinite possibilities.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 5,
      title: 'It Animal Poetry Time',
      bookTitle: 'It Animal Poetry Time',
      duration: 30,
      audioUrl: '/audio/commercials/animal-poetry-commercial.wav',
      description: 'Poetry that celebrates the beauty and wisdom of our natural world.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 6,
      title: 'King Richard and I',
      bookTitle: 'King Richard and I',
      duration: 45,
      audioUrl: '/audio/commercials/king-richard-commercial.wav',
      description: 'The untold story of a legendary partnership that changed music history.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 7,
      title: 'All About Candy',
      bookTitle: 'All About Candy',
      duration: 30,
      audioUrl: '/audio/commercials/all-about-candy-commercial.wav',
      description: 'The personal memoir behind the legacy.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 8,
      title: 'Drawn to Danger',
      bookTitle: 'Drawn to Danger',
      duration: 45,
      audioUrl: '/audio/commercials/drawn-to-danger-commercial.wav',
      description: 'Stories of risk, courage, and transformation.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0,
      seasonal: true,
      seasonalPeriod: 'New Year Campaign'
    },
    {
      id: 9,
      title: 'RRB Ecosystem Explainer',
      bookTitle: 'The Complete Canryn Production Platform',
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/cfWvEqBGZbBnvEIe.mp4',
      description: 'Five platforms. One autonomous brain. QUMUS coordinates everything — from radio broadcasting to emergency communication, from charitable giving to entertainment. A Canryn Production.',
      bookLink: '/',
      playCount: 0,
      clickCount: 0
    }
  ];

  const currentCommercial = commercials[currentCommercialIndex];

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

  const handleNext = () => {
    setCurrentCommercialIndex((prev) => (prev + 1) % commercials.length);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentCommercialIndex((prev) => (prev - 1 + commercials.length) % commercials.length);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    trackCommercialPlay(currentCommercial.id);
    handleNext();
  };

  const trackCommercialPlay = (commercialId: number) => {
    setCommercialStats(prev => ({
      ...prev,
      [commercialId]: {
        plays: (prev[commercialId]?.plays || 0) + 1,
        clicks: prev[commercialId]?.clicks || 0
      }
    }));
  };

  const trackCommercialClick = (commercialId: number) => {
    setCommercialStats(prev => ({
      ...prev,
      [commercialId]: {
        plays: prev[commercialId]?.plays || 0,
        clicks: (prev[commercialId]?.clicks || 0) + 1
      }
    }));
  };

  // Auto-rotate commercials every 5 minutes
  useEffect(() => {
    if (autoRotate) {
      rotationIntervalRef.current = setInterval(() => {
        handleNext();
      }, 300000); // 5 minutes
    }

    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [autoRotate, currentCommercialIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / currentCommercial.duration) * 100;

  // Calculate total stats
  const totalPlays = Object.values(commercialStats).reduce((sum, stat) => sum + stat.plays, 0);
  const totalClicks = Object.values(commercialStats).reduce((sum, stat) => sum + stat.clicks, 0);

  return (
    <section className="py-16 md:py-24 bg-card border-t border-border">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Volume2 className="w-8 h-8 text-accent" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">RRB Commercials</h2>
        </div>

        <p className="text-lg text-foreground/80 mb-8">
          Tune in to hear about Seabrun Candy Hunter's published works, the Canryn Production ecosystem, and the mission behind it all. Discover stories of legacy, inspiration, and transformation.
        </p>

        {/* Commercial Player */}
        <div className="bg-background border border-border rounded-lg p-8 mb-8">
          {/* Current Commercial Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{currentCommercial.title}</h3>
                <p className="text-accent font-semibold mb-3">{currentCommercial.bookTitle}</p>
                {currentCommercial.seasonal && (
                  <p className="text-xs bg-accent/20 text-accent px-2 py-1 rounded inline-block mb-3">
                    {currentCommercial.seasonalPeriod}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </div>
            <p className="text-foreground/80 mb-4">{currentCommercial.description}</p>
          </div>

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={currentCommercial.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-foreground/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentCommercial.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="icon"
              className="h-12 w-12"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={handlePlayPause}
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 w-14"
              size="icon"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              onClick={handleNext}
              variant="outline"
              size="icon"
              className="h-12 w-12"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Auto-Rotate Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={() => setAutoRotate(!autoRotate)}
              variant={autoRotate ? 'default' : 'outline'}
              size="sm"
              className={autoRotate ? 'bg-accent hover:bg-accent/90' : ''}
            >
              {autoRotate ? '🔄 Auto-Rotate ON' : '🔄 Auto-Rotate OFF'}
            </Button>
            <p className="text-xs text-foreground/60">
              {autoRotate ? 'Changes every 5 minutes' : 'Manual control'}
            </p>
          </div>

          {/* Commercial Counter */}
          <div className="text-center text-sm text-foreground/60 mb-6">
            Commercial {currentCommercialIndex + 1} of {commercials.length}
          </div>

          {/* Analytics Display */}
          {showAnalytics && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="font-bold text-foreground mb-3">This Commercial Performance</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Plays</p>
                  <p className="text-2xl font-bold text-accent">{commercialStats[currentCommercial.id]?.plays || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Clicks</p>
                  <p className="text-2xl font-bold text-accent">{commercialStats[currentCommercial.id]?.clicks || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Engagement</p>
                  <p className="text-2xl font-bold text-accent">
                    {commercialStats[currentCommercial.id]?.plays ? 
                      ((commercialStats[currentCommercial.id]?.clicks || 0) / commercialStats[currentCommercial.id]?.plays * 100).toFixed(1) 
                      : '0'}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learn More Button */}
          <a href={currentCommercial.bookLink} onClick={() => trackCommercialClick(currentCommercial.id)}>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Learn More
            </Button>
          </a>
        </div>

        {/* Overall Analytics Summary */}
        {showAnalytics && (
          <div className="mb-8 p-6 bg-accent/10 border border-accent/20 rounded-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">Overall Campaign Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Total Plays</p>
                <p className="text-3xl font-bold text-accent">{totalPlays}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-2">Total Clicks</p>
                <p className="text-3xl font-bold text-accent">{totalClicks}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-2">Overall Engagement</p>
                <p className="text-3xl font-bold text-accent">
                  {totalPlays ? ((totalClicks / totalPlays) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Commercial List */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">All Commercials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commercials.map((commercial, index) => (
              <button
                key={commercial.id}
                onClick={() => {
                  setCurrentCommercialIndex(index);
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
                className={`p-4 rounded-lg border transition-all ${
                  index === currentCommercialIndex
                    ? 'bg-accent/20 border-accent'
                    : 'bg-background border-border hover:border-accent/50'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-bold text-foreground">{commercial.title}</h4>
                    {commercial.seasonal && (
                      <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                        Seasonal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70 mb-2">{commercial.bookTitle}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-accent font-semibold">{commercial.duration} seconds</p>
                    {showAnalytics && (
                      <p className="text-xs text-foreground/60">
                        {commercialStats[commercial.id]?.plays || 0} plays
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* About Book Commercials */}
        <div className="mt-12 p-6 bg-accent/10 border border-accent/20 rounded-lg">
          <h3 className="text-lg font-bold text-foreground mb-3">About These Commercials</h3>
          <p className="text-foreground/80 mb-3">
            These radio commercials are designed to introduce listeners to Seabrun Candy Hunter's published works. Each commercial highlights a different book or series, showcasing the themes, inspiration, and impact of Candy's literary legacy.
          </p>
          <p className="text-foreground/80 mb-3">
            <strong>Auto-Rotation:</strong> Enable auto-rotate to automatically cycle through commercials every 5 minutes, simulating a real radio station experience.
          </p>
          <p className="text-foreground/80">
            <strong>Analytics:</strong> Track performance metrics to see which commercials resonate most with your audience. Whether you're interested in autobiography, poetry, spirituality, or philosophy, there's a book waiting for you.
          </p>
        </div>
      </div>
    </section>
  );
}
