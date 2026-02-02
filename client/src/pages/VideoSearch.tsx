import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";

export default function VideoSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    style: "",
    duration: "",
    resolution: "",
    sortBy: "relevance",
  });

  const mockResults = [
    {
      id: "1",
      title: "Beautiful Sunset Cinematic",
      creator: "Alex Creator",
      views: 1250,
      likes: 89,
      thumbnail: "bg-gradient-to-br from-orange-400 to-red-500",
      duration: "10s",
      style: "cinematic",
      resolution: "1080p",
    },
    {
      id: "2",
      title: "Abstract Motion Graphics",
      creator: "Jordan Visuals",
      views: 2100,
      likes: 156,
      thumbnail: "bg-gradient-to-br from-purple-400 to-pink-500",
      duration: "15s",
      style: "motion-graphics",
      resolution: "4k",
    },
    {
      id: "3",
      title: "Retro Animation Loop",
      creator: "Retro Master",
      views: 890,
      likes: 67,
      thumbnail: "bg-gradient-to-br from-yellow-400 to-orange-500",
      duration: "8s",
      style: "retro",
      resolution: "1080p",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Videos</h1>
          <p className="text-gray-600">Search and explore videos from creators worldwide</p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search videos by title, creator, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </Card>

        {/* Filters and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select value={filters.style} onValueChange={(value) => setFilters({ ...filters, style: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Styles</SelectItem>
                <SelectItem value="cinematic">Cinematic</SelectItem>
                <SelectItem value="animated">Animated</SelectItem>
                <SelectItem value="motion-graphics">Motion Graphics</SelectItem>
                <SelectItem value="retro">Retro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.duration} onValueChange={(value) => setFilters({ ...filters, duration: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Duration</SelectItem>
                <SelectItem value="0-10">Under 10s</SelectItem>
                <SelectItem value="10-30">10-30s</SelectItem>
                <SelectItem value="30+">Over 30s</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.resolution} onValueChange={(value) => setFilters({ ...filters, resolution: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Resolution</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="4k">4K</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="mostViewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockResults.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`${video.thumbnail} h-40 relative group`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-semibold">{video.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{video.creator}</p>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>❤️ {video.likes}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{video.style}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{video.resolution}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {mockResults.map((video) => (
              <Card key={video.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  <div className={`${video.thumbnail} w-32 h-24 rounded-lg flex-shrink-0`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{video.creator}</p>
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>{video.views.toLocaleString()} views</span>
                      <span>❤️ {video.likes} likes</span>
                      <span>{video.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{video.style}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{video.resolution}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
