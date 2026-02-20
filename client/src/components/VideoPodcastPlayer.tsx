/**
 * Video Podcast Player Component
 * Full-featured player with game screen for mobile
 * A Canryn Production
 */
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Heart, MessageCircle, Share2, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface VideoPodcastPlayerProps {
  videoId: string;
  title: string;
  duration: number;
  autoplay?: boolean;
}

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export function VideoPodcastPlayer({ videoId, title, duration, autoplay = false }: VideoPodcastPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(window.innerWidth < 768);

  const recordViewMutation = trpc.videoPodcast.recordView.useMutation();
  const addLikeMutation = trpc.videoPodcast.addLike.useMutation();

  useEffect(() => {
    recordViewMutation.mutate({ id: videoId });
  }, [videoId]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = async () => {
    try {
      await addLikeMutation.mutateAsync({ id: videoId });
      setLiked(!liked);
      toast.success(liked ? 'Unliked' : 'Liked!');
    } catch (error) {
      toast.error('Failed to like video');
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/videos/${videoId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const isMobile = window.innerWidth < 768;
  const progress = (currentTime / duration) * 100;

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card className="overflow-hidden bg-black">
        <div className="relative bg-black aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={`/videos/${videoId}.mp4`} type="video/mp4" />
          </video>

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 h-1 rounded cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) {
                    videoRef.current.currentTime = percent * duration;
                  }
                }}>
                  <div className="bg-red-500 h-full rounded" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePlayPause}
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>

                  <div className="flex items-center gap-2 bg-black/50 px-2 py-1 rounded">
                    {volume > 0 ? (
                      <Volume2 className="w-4 h-4 text-white" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-white" />
                    )}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-20 h-1"
                    />
                  </div>

                  <span className="text-white text-sm">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isMobile && (
                    <Button
                      onClick={() => setShowGameScreen(!showGameScreen)}
                      size="sm"
                      variant="outline"
                      className="text-white border-white"
                    >
                      <Gamepad2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={handleFullscreen}
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Video Info & Actions */}
      <Card className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleLike}
            variant={liked ? 'default' : 'outline'}
            className="flex-1"
          >
            <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
            Like
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Comment
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>

      {/* Game Screen for Mobile */}
      {isMobile && showGameScreen && (
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <Tabs defaultValue="trivia" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trivia">🧠 Trivia</TabsTrigger>
              <TabsTrigger value="polls">📊 Polls</TabsTrigger>
            </TabsList>

            <TabsContent value="trivia" className="space-y-3">
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="font-semibold text-gray-900 mb-2">What year was RRB founded?</p>
                <div className="space-y-2">
                  {['2020', '2021', '2022', '2023'].map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast.success(idx === 2 ? 'Correct!' : 'Try again!')}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="polls" className="space-y-3">
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="font-semibold text-gray-900 mb-2">How did you like this episode?</p>
                <div className="space-y-2">
                  {['Amazing (234)', 'Good (156)', 'Okay (45)', 'Not great (12)'].map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => toast.success('Vote recorded!')}
                    >
                      <span>{option.split(' ')[0]}</span>
                      <span className="text-xs text-gray-500">{option.split('(')[1]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
