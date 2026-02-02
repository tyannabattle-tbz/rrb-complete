import { useState } from "react";
import { Play, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface VideoPreviewEmbedProps {
  videoUrl: string;
  videoId: string;
  duration?: number;
  resolution?: string;
  style?: string;
  fps?: number;
  aspectRatio?: string;
}

export function VideoPreviewEmbed({
  videoUrl,
  videoId,
  duration = 10,
  resolution = "1080p",
  style = "cinematic",
  fps = 24,
  aspectRatio = "16:9",
}: VideoPreviewEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `qumus-video-${videoId}.mp4`;
    link.click();
    toast.success("Download started!");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/video/${videoId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied!");
  };

  return (
    <Card className="overflow-hidden bg-black/5 border border-border/50">
      {/* Video Preview Container */}
      <div className="relative bg-black group">
        {/* Video or Thumbnail */}
        {isPlaying ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full aspect-video"
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 to-black flex items-center justify-center cursor-pointer hover:from-slate-800 hover:to-slate-900 transition-colors"
            onClick={() => setIsPlaying(true)}
          >
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Video Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-2 text-white text-sm">
                <span className="bg-white/20 px-2 py-1 rounded text-xs">{duration}s</span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs">{resolution}</span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs capitalize">{style}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Details & Actions */}
      <div className="p-4 space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="text-muted-foreground">Duration</div>
            <div className="font-semibold">{duration}s</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Resolution</div>
            <div className="font-semibold">{resolution}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">FPS</div>
            <div className="font-semibold">{fps}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Ratio</div>
            <div className="font-semibold text-xs">{aspectRatio}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 h-8"
            onClick={handleDownload}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 h-8"
            onClick={handleShare}
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Info"}
          </Button>
        </div>

        {/* Detailed Info */}
        {showDetails && (
          <div className="pt-2 border-t border-border/50 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Style:</span>
              <span className="font-medium capitalize">{style}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aspect Ratio:</span>
              <span className="font-medium">{aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Video ID:</span>
              <span className="font-mono text-xs truncate">{videoId}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
