import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { Download, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface VideoMetadata {
  videoId: string;
  url: string;
  duration: number;
  resolution: string;
  style: string;
  fps: number;
  aspectRatio: string;
  createdAt: Date;
  description?: string;
}

export default function SharedVideoPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse video ID from URL
    if (!videoId) {
      setError("Invalid video ID");
      setLoading(false);
      return;
    }

    // Construct video URL
    const videoUrl = `/videos/video-${videoId}.mp4`;

    // Set mock metadata (in production, fetch from database)
    setVideo({
      videoId,
      url: videoUrl,
      duration: 10,
      resolution: "1080p",
      style: "cinematic",
      fps: 24,
      aspectRatio: "16:9",
      createdAt: new Date(),
      description: "Video generated with Qumus AI",
    });

    setLoading(false);
  }, [videoId]);

  const handleDownload = () => {
    if (!video) return;
    const link = document.createElement("a");
    link.href = video.url;
    link.download = `qumus-video-${video.videoId}.mp4`;
    link.click();
    toast.success("Download started!");
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Video Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The video you're looking for doesn't exist or has been deleted."}
            </p>
            <Button onClick={() => window.history.back()} className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Shared Video</h1>
          <p className="text-muted-foreground mt-2">Generated with Qumus AI Video Generator</p>
        </div>

        {/* Video Player */}
        <Card className="mb-6 overflow-hidden bg-black">
          <video
            src={video.url}
            controls
            className="w-full aspect-video"
            controlsList="nodownload"
          />
        </Card>

        {/* Video Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Duration</div>
            <div className="text-2xl font-bold">{video.duration}s</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Resolution</div>
            <div className="text-2xl font-bold">{video.resolution}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Style</div>
            <div className="text-2xl font-bold capitalize">{video.style}</div>
          </Card>
        </div>

        {/* Additional Metadata */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Video Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">FPS</div>
              <div className="font-medium">{video.fps} fps</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Aspect Ratio</div>
              <div className="font-medium">{video.aspectRatio}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Created</div>
              <div className="font-medium">{new Date(video.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Video ID</div>
              <div className="font-medium text-xs truncate">{video.videoId}</div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleDownload} className="flex-1 gap-2" size="lg">
            <Download className="w-4 h-4" />
            Download Video
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1 gap-2" size="lg">
            <Share2 className="w-4 h-4" />
            Share Link
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>This video was generated with Qumus AI Video Generator</p>
          <p className="mt-2">
            <a href="/" className="text-primary hover:underline">
              Create your own videos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
