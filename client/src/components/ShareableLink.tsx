import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareableLinkProps {
  videoId: string;
  videoUrl: string;
  title?: string;
  description?: string;
}

export default function ShareableLink({
  videoId,
  videoUrl,
  title = "Check out this video",
  description = "Generated with Qumus",
}: ShareableLinkProps) {
  const [copied, setCopied] = useState(false);

  // Generate shareable link
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/share/video/${videoId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Share this video</span>
      </div>

      <div className="flex items-center gap-2 bg-background rounded-lg p-2 border border-border">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 bg-transparent text-sm outline-none text-foreground"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => shareToSocial("twitter")}
          className="text-xs"
        >
          Twitter
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => shareToSocial("facebook")}
          className="text-xs"
        >
          Facebook
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => shareToSocial("linkedin")}
          className="text-xs"
        >
          LinkedIn
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => shareToSocial("whatsapp")}
          className="text-xs"
        >
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
