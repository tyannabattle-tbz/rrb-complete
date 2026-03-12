import { useState } from "react";
import { Download, Share2, Play, Film, Subtitles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AccessibleVideoPlayer from "@/components/AccessibleVideoPlayer";
import { Link } from "wouter";

interface ProducedVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  poster?: string;
  duration: string;
  type: 'narrated' | 'instrumental' | 'social' | 'vertical' | 'presentation';
  aspectRatio: '16:9' | '9:16';
  narratedBy?: string;
  tags: string[];
  pageLink?: string;
  pageLinkLabel?: string;
}

const PRODUCED_VIDEOS: ProducedVideo[] = [
  {
    id: 'narrated-campaign',
    title: 'Sweet Miracles & RRB — Building the Bridge Across the World (Narrated)',
    description: '32-second narrated campaign video for UN CSW70. From Selma to the United Nations. Voiced by AI DJs Valanna & Candy.',
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-Campaign-Narrated-Valanna-Candy_2630011e.mp4',
    poster: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/frame3-bridge-theme-v2-MD2HJ9zFDZMH44DK8wTL28.webp',
    duration: '0:32',
    type: 'narrated',
    aspectRatio: '16:9',
    narratedBy: 'Valanna & Candy',
    tags: ['Campaign', 'UN CSW70', 'Narrated', 'CC'],
    pageLink: '/media-blast',
    pageLinkLabel: 'Social Media Kit',
  },
  {
    id: 'instrumental-campaign',
    title: 'Campaign Video — Instrumental Version',
    description: 'Music-only version of the UN CSW70 campaign video. For background playback or custom voiceover overlay.',
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-UN-Campaign-Building-The-Bridge-Across-The-World_697e578a.mp4',
    poster: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/frame3-bridge-theme-v2-MD2HJ9zFDZMH44DK8wTL28.webp',
    duration: '0:32',
    type: 'instrumental',
    aspectRatio: '16:9',
    tags: ['Campaign', 'Instrumental', 'CC'],
    pageLink: '/media-blast',
    pageLinkLabel: 'Social Media Kit',
  },
  {
    id: 'ecosystem-full',
    title: 'RRB Ecosystem — Full Captioned Presentation',
    description: 'Complete 3:42 walkthrough of the entire Rockin\' Rockin\' Boogie ecosystem. 54 channels, QUMUS autonomous control, HybridCast, SQUADD, and more.',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/HPWKWjcKyPinNDUP.mp4',
    duration: '3:42',
    type: 'presentation',
    aspectRatio: '16:9',
    narratedBy: 'Valanna & Candy',
    tags: ['Ecosystem', 'Full Length', 'Captioned', 'CC'],
    pageLink: '/ecosystem',
    pageLinkLabel: 'Interactive Presentation',
  },
  {
    id: '60s-social-cut',
    title: '60-Second Social Media Cut',
    description: 'Condensed 60-second version optimized for social media sharing. Landscape format for Twitter, Facebook, and LinkedIn.',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/hpJXnZlwAEvMMHmi.mp4',
    duration: '1:00',
    type: 'social',
    aspectRatio: '16:9',
    tags: ['Social Media', '60s', 'Landscape', 'CC'],
  },
  {
    id: 'vertical-stories',
    title: '9:16 Vertical — Stories & Reels',
    description: 'Vertical format video optimized for Instagram Stories, TikTok, and YouTube Shorts. Perfect for mobile-first audiences.',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/BUxkLtbiEBvBJoZn.mp4',
    duration: '0:30',
    type: 'vertical',
    aspectRatio: '9:16',
    tags: ['Vertical', 'Stories', 'Reels', 'CC'],
  },
  {
    id: 'selma-slideshow',
    title: 'GRITS & GREENS — Selma Slideshow Demo',
    description: 'AI-powered slideshow demonstration featuring Valanna & Candy walking through the ecosystem. From the GRITS & GREENS presentation.',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/BYppFQPhGhmbYOkr.mp4',
    poster: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/QuhbrRHSBnIQdOgm.png',
    duration: '2:40',
    type: 'presentation',
    aspectRatio: '16:9',
    narratedBy: 'Valanna & Candy',
    tags: ['Selma', 'GRITS & GREENS', 'Demo', 'CC'],
    pageLink: '/selma-slideshow',
    pageLinkLabel: 'Full Slideshow',
  },
];

const TYPE_COLORS: Record<string, string> = {
  narrated: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  instrumental: 'bg-gray-700/50 text-gray-300 border-gray-600/30',
  social: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  vertical: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  presentation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  narrated: 'NARRATED',
  instrumental: 'INSTRUMENTAL',
  social: 'SOCIAL CUT',
  vertical: 'VERTICAL',
  presentation: 'PRESENTATION',
};

export default function VideoGallery() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredVideos = activeFilter
    ? PRODUCED_VIDEOS.filter(v => v.type === activeFilter)
    : PRODUCED_VIDEOS;

  const handleShare = (video: ProducedVideo) => {
    navigator.clipboard.writeText(video.url);
    toast.success(`${video.title} — URL copied to clipboard!`);
  };

  const handleDownload = (video: ProducedVideo) => {
    const a = document.createElement('a');
    a.href = video.url;
    a.download = `${video.id}.mp4`;
    a.click();
    toast.success('Download started!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1208] to-[#0A0A0A] border-b border-[#D4A843]/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Film className="w-8 h-8 text-[#D4A843]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#D4A843]">Video Gallery</h1>
          </div>
          <p className="text-[#E8E0D0]/60 max-w-2xl">
            All produced videos for the Rockin' Rockin' Boogie ecosystem — campaign videos, presentations, social cuts, and more. Every video includes closed captions (CC) for accessibility.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Subtitles className="w-4 h-4 text-[#D4A843]" />
            <span className="text-sm text-[#D4A843]">All videos include closed captions</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeFilter ? 'bg-[#D4A843] text-black' : 'bg-[#111] text-[#E8E0D0]/60 hover:text-[#D4A843] border border-[#D4A843]/20'
            }`}
          >
            All ({PRODUCED_VIDEOS.length})
          </button>
          {Object.entries(TYPE_LABELS).map(([key, label]) => {
            const count = PRODUCED_VIDEOS.filter(v => v.type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === key ? 'bg-[#D4A843] text-black' : 'bg-[#111] text-[#E8E0D0]/60 hover:text-[#D4A843] border border-[#D4A843]/20'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="bg-[#111111] border-[#D4A843]/15 overflow-hidden">
              <CardContent className="p-0">
                {/* Video Player */}
                {playingId === video.id ? (
                  <AccessibleVideoPlayer
                    src={video.url}
                    poster={video.poster}
                    title={video.title}
                    narratedBy={video.narratedBy}
                    className={video.aspectRatio === '9:16' ? 'max-h-[400px] mx-auto' : ''}
                  />
                ) : (
                  <div
                    className="relative aspect-video bg-black cursor-pointer group"
                    onClick={() => setPlayingId(video.id)}
                  >
                    {video.poster ? (
                      <img src={video.poster} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1208] to-[#0a0a0a] flex items-center justify-center">
                        <Film className="w-16 h-16 text-[#D4A843]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#D4A843]/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_COLORS[video.type]}`}>
                        {TYPE_LABELS[video.type]}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="bg-[#D4A843] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">CC</span>
                      <span className="bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">{video.duration}</span>
                    </div>
                    {video.aspectRatio === '9:16' && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-pink-500/20 text-pink-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-pink-500/30">9:16</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-bold text-[#D4A843] text-base mb-1">{video.title}</h3>
                  <p className="text-sm text-[#E8E0D0]/50 mb-3">{video.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {video.tags.map(tag => (
                      <Badge key={tag} className="bg-[#D4A843]/10 text-[#D4A843]/80 border-[#D4A843]/20 text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 h-8 text-xs"
                      onClick={() => handleDownload(video)}
                    >
                      <Download className="w-3 h-3 mr-1" /> Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 h-8 text-xs"
                      onClick={() => handleShare(video)}
                    >
                      <Share2 className="w-3 h-3 mr-1" /> Copy Link
                    </Button>
                    {video.pageLink && (
                      <Link href={video.pageLink}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500/30 text-purple-400 hover:bg-purple-900/10 h-8 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> {video.pageLinkLabel}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legal Footer */}
        <div className="text-center text-xs text-[#E8E0D0]/30 py-8 border-t border-[#D4A843]/10 mt-8">
          <p>&copy; {new Date().getFullYear()} Canryn Production. All rights reserved.</p>
          <p className="mt-1">All videos are the intellectual property of Canryn Production and its subsidiaries.</p>
          <p className="mt-1">Unauthorized reproduction or distribution is prohibited.</p>
        </div>
      </div>
    </div>
  );
}
