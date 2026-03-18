import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Share2, Video, Radio, ExternalLink, Copy, Check, QrCode,
  Mail, MessageCircle, Link2
} from 'lucide-react';
import { toast } from 'sonner';

interface StudioShareBarProps {
  /** Title shown in share dialog and social posts */
  studioName: string;
  /** Optional override for the share URL (defaults to current page) */
  shareUrl?: string;
  /** Whether to show the Zoom PMI entry button (default: true) */
  showZoomEntry?: boolean;
  /** Whether to show the Restream/Multi-Stream entry (default: true) */
  showStreamEntry?: boolean;
  /** Custom class for the container */
  className?: string;
  /** Compact mode for tight toolbars (e.g. StudioSuite DAW bar) */
  compact?: boolean;
}

const ZOOM_PMI_URL = import.meta.env.VITE_ZOOM_URL || 'https://us05web.zoom.us/j/8502225524';

export default function StudioShareBar({
  studioName,
  shareUrl,
  showZoomEntry = true,
  showStreamEntry = true,
  className = '',
  compact = false,
}: StudioShareBarProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const currentUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${studioName} — Canryn Production Studio | QUMUS Autonomous Orchestration`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setLinkCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const copyEmbed = () => {
    const embedCode = `<iframe src="${currentUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    toast.success('Embed code copied');
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: studioName, text: shareText, url: currentUrl });
    } else {
      copyLink();
    }
  };

  const socialPlatforms = [
    { name: 'X / Twitter', icon: '𝕏', url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, color: 'bg-black hover:bg-gray-800' },
    { name: 'Facebook', icon: 'f', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'LinkedIn', icon: 'in', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: 'bg-blue-700 hover:bg-blue-800' },
    { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Telegram', icon: '✈️', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, color: 'bg-sky-500 hover:bg-sky-600' },
    { name: 'Email', icon: '✉️', url: `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`, color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showZoomEntry && (
          <button
            onClick={() => window.open(ZOOM_PMI_URL, '_blank')}
            className="px-1.5 py-0.5 rounded text-[10px] text-[#4ade80] hover:bg-[#333] flex items-center gap-0.5"
            title="Join Zoom Studio Room"
          >
            <Video className="w-3 h-3" /> Zoom
          </button>
        )}
        {showStreamEntry && (
          <button
            onClick={() => window.open('/conference/streaming', '_blank')}
            className="px-1.5 py-0.5 rounded text-[10px] text-[#f97316] hover:bg-[#333] flex items-center gap-0.5"
            title="Multi-Stream Manager"
          >
            <Radio className="w-3 h-3" /> Stream
          </button>
        )}
        <button
          onClick={() => setShowShareDialog(true)}
          className="px-1.5 py-0.5 rounded text-[10px] text-[#60a5fa] hover:bg-[#333] flex items-center gap-0.5"
          title="Share Studio"
        >
          <Share2 className="w-3 h-3" /> Share
        </button>

        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          studioName={studioName}
          currentUrl={currentUrl}
          socialPlatforms={socialPlatforms}
          linkCopied={linkCopied}
          embedCopied={embedCopied}
          copyLink={copyLink}
          copyEmbed={copyEmbed}
          shareNative={shareNative}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showZoomEntry && (
        <Button
          size="sm"
          variant="outline"
          className="border-green-600 text-green-400 hover:bg-green-600/20"
          onClick={() => window.open(ZOOM_PMI_URL, '_blank')}
        >
          <Video className="w-4 h-4 mr-1" />
          Join Zoom Room
        </Button>
      )}
      {showStreamEntry && (
        <Button
          size="sm"
          variant="outline"
          className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
          onClick={() => window.open('/conference/streaming', '_blank')}
        >
          <Radio className="w-4 h-4 mr-1" />
          Multi-Stream
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
        onClick={() => setShowShareDialog(true)}
      >
        <Share2 className="w-4 h-4 mr-1" />
        Share
      </Button>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        studioName={studioName}
        currentUrl={currentUrl}
        socialPlatforms={socialPlatforms}
        linkCopied={linkCopied}
        embedCopied={embedCopied}
        copyLink={copyLink}
        copyEmbed={copyEmbed}
        shareNative={shareNative}
      />
    </div>
  );
}

/** Reusable share dialog */
function ShareDialog({
  open,
  onOpenChange,
  studioName,
  currentUrl,
  socialPlatforms,
  linkCopied,
  embedCopied,
  copyLink,
  copyEmbed,
  shareNative,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  studioName: string;
  currentUrl: string;
  socialPlatforms: { name: string; icon: string; url: string; color: string }[];
  linkCopied: boolean;
  embedCopied: boolean;
  copyLink: () => void;
  copyEmbed: () => void;
  shareNative: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg">Share {studioName}</DialogTitle>
        </DialogHeader>

        {/* Social Platforms */}
        <div className="grid grid-cols-3 gap-2">
          {socialPlatforms.map((p) => (
            <button
              key={p.name}
              onClick={() => window.open(p.url, '_blank', 'width=600,height=400')}
              className={`${p.color} text-white rounded-lg p-3 text-center transition-colors`}
            >
              <span className="text-lg block">{p.icon}</span>
              <span className="text-xs mt-1 block">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link */}
        <div className="space-y-2 pt-2">
          <label className="text-xs text-slate-400 font-medium">Direct Link</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 truncate border border-slate-700">
              {currentUrl}
            </div>
            <Button
              size="sm"
              variant="outline"
              className={linkCopied ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-300'}
              onClick={copyLink}
            >
              {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Embed Code */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Embed Code</label>
          <Button
            size="sm"
            variant="outline"
            className={`w-full ${embedCopied ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-300'}`}
            onClick={copyEmbed}
          >
            {embedCopied ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
            {embedCopied ? 'Copied!' : 'Copy Embed Code'}
          </Button>
        </div>

        {/* Native Share */}
        {'share' in navigator && (
          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-300"
            onClick={shareNative}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Share via Device
          </Button>
        )}

        <p className="text-xs text-slate-500 text-center pt-1">A Canryn Production</p>
      </DialogContent>
    </Dialog>
  );
}
