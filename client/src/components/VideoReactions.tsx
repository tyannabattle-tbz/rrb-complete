import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Share2, Download, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ReactionCounts {
  like: number;
  love: number;
  wow: number;
  haha: number;
  sad: number;
}

interface VideoReactionsProps {
  videoId: string;
  reactions: ReactionCounts;
  userReaction?: string;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  onReact?: (reactionType: string) => void;
  onShare?: () => void;
  onDownload?: () => void;
}

export default function VideoReactions({
  videoId,
  reactions,
  userReaction,
  viewCount,
  shareCount,
  commentCount,
  onReact,
  onShare,
  onDownload,
}: VideoReactionsProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(userReaction || null);
  const [showReactionMenu, setShowReactionMenu] = useState(false);

  const reactionEmojis: Record<string, string> = {
    like: "👍",
    love: "❤️",
    wow: "😮",
    haha: "😂",
    sad: "😢",
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  const handleReact = (reactionType: string) => {
    if (selectedReaction === reactionType) {
      setSelectedReaction(null);
      onReact?.(reactionType);
    } else {
      setSelectedReaction(reactionType);
      onReact?.(reactionType);
    }
    setShowReactionMenu(false);
    toast.success(`Reacted with ${reactionEmojis[reactionType]}`);
  };

  const handleShare = () => {
    onShare?.();
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    onDownload?.();
    toast.success("Download started!");
  };

  return (
    <div className="space-y-4">
      {/* Reaction Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalReactions.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Reactions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{viewCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{shareCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Shares</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{commentCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
        </div>
      </Card>

      {/* Reaction Breakdown */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Reactions</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(reactions).map(([type, count]) => (
            <div
              key={type}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              onClick={() => handleReact(type)}
            >
              <span className="text-2xl">{reactionEmojis[type]}</span>
              <span className="text-xs text-muted-foreground mt-1">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowReactionMenu(!showReactionMenu)}
          >
            <Heart className={`w-4 h-4 mr-2 ${selectedReaction ? "fill-red-500 text-red-500" : ""}`} />
            React
          </Button>

          {/* Reaction Menu */}
          {showReactionMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg p-2 flex gap-1 justify-center shadow-lg z-10">
              {Object.entries(reactionEmojis).map(([type, emoji]) => (
                <button
                  key={type}
                  onClick={() => handleReact(type)}
                  className={`text-2xl p-2 rounded hover:bg-muted transition-colors ${
                    selectedReaction === type ? "bg-muted" : ""
                  }`}
                  title={type}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <Button variant="outline" className="w-full" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* User Reaction Status */}
      {selectedReaction && (
        <Card className="p-3 bg-muted">
          <p className="text-sm text-center">
            You reacted with {reactionEmojis[selectedReaction]} {reactionEmojis[selectedReaction]}
          </p>
        </Card>
      )}
    </div>
  );
}
