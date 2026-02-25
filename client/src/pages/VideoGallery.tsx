import { useState, useEffect } from "react";
import { Search, Filter, Download, Share2, Eye, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface GalleryVideo {
  videoId: string;
  url: string;
  duration: number;
  resolution: string;
  style: string;
  fps: number;
  aspectRatio: string;
  createdAt: Date;
  views: number;
  downloads: number;
  shares: number;
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest");

  // Mock video data - in production, fetch from API
  useEffect(() => {
    const mockVideos: GalleryVideo[] = [
      {
        videoId: "video-1770028842286-0v6pzrmxd",
        url: "/videos/video-1770028842286-0v6pzrmxd.mp4",
        duration: 10,
        resolution: "1080p",
        style: "cinematic",
        fps: 24,
        aspectRatio: "16:9",
        createdAt: new Date(Date.now() - 3600000),
        views: 245,
        downloads: 12,
        shares: 8,
      },
      {
        videoId: "video-1770027261553-4v2do7gu",
        url: "/videos/video-1770027261553-4v2do7gu.mp4",
        duration: 10,
        resolution: "1080p",
        style: "cinematic",
        fps: 24,
        aspectRatio: "16:9",
        createdAt: new Date(Date.now() - 7200000),
        views: 189,
        downloads: 9,
        shares: 5,
      },
    ];

    setVideos(mockVideos);
    setFilteredVideos(mockVideos);
    setLoading(false);
  }, []);

  // Filter and sort videos
  useEffect(() => {
    let filtered = videos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.videoId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Style filter
    if (selectedStyle) {
      filtered = filtered.filter((v) => v.style === selectedStyle);
    }

    // Resolution filter
    if (selectedResolution) {
      filtered = filtered.filter((v) => v.resolution === selectedResolution);
    }

    // Sort
    if (sortBy === "popular") {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === "trending") {
      filtered.sort((a, b) => (b.downloads + b.shares) - (a.downloads + a.shares));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredVideos(filtered);
  }, [searchTerm, selectedStyle, selectedResolution, sortBy, videos]);

  const styles = Array.from(new Set(videos.map((v) => v.style)));
  const resolutions = Array.from(new Set(videos.map((v) => v.resolution)));

  const handleShare = (videoId: string) => {
    const shareUrl = `${window.location.origin}/share/video/${videoId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied!");
  };

  const handleDownload = (videoUrl: string, videoId: string) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `qumus-video-${videoId}.mp4`;
    link.click();
    toast.success("Download started!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Video Gallery</h1>
          <p className="text-muted-foreground">
            Browse and discover videos created with Qumus AI Video Generator
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 md:p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Style Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Style
                </label>
                <select
                  value={selectedStyle || ""}
                  onChange={(e) => setSelectedStyle(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                >
                  <option value="">All Styles</option>
                  {styles.map((style) => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resolution Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Resolution
                </label>
                <select
                  value={selectedResolution || ""}
                  onChange={(e) => setSelectedResolution(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                >
                  <option value="">All Resolutions</option>
                  {resolutions.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "trending")}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Viewed</option>
                  <option value="trending">Trending</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                  className="flex-1"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                  className="flex-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Videos Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading videos...</p>
            </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <Card key={video.videoId} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative bg-black aspect-video flex items-center justify-center group cursor-pointer">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                    {video.duration}s
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                      {video.style}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{video.resolution}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{video.views}</div>
                      <div>views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{video.downloads}</div>
                      <div>downloads</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{video.shares}</div>
                      <div>shares</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 h-8"
                      onClick={() => handleDownload(video.url, video.videoId)}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 h-8"
                      onClick={() => handleShare(video.videoId)}
                    >
                      <Share2 className="w-3 h-3" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <Card key={video.videoId} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-black rounded flex-shrink-0 flex items-center justify-center">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium capitalize">{video.style}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{video.resolution}</span>
                      <span className="text-xs text-muted-foreground">{video.duration}s</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(video.createdAt).toLocaleDateString()} • {video.views} views
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 h-8"
                        onClick={() => handleDownload(video.url, video.videoId)}
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 h-8"
                        onClick={() => handleShare(video.videoId)}
                      >
                        <Share2 className="w-3 h-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>Showing {filteredVideos.length} of {videos.length} videos</p>
        </div>
      </div>
    </div>
  );
}
