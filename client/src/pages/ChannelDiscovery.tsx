/**
 * Channel Discovery Page
 * Phase 8+: Multi-format content discovery interface
 * 
 * Supports:
 * - Audio (podcasts, music, broadcasts)
 * - Documents (PDFs, articles, evidence)
 * - Videos (recordings, tutorials, testimonials)
 * - Transcripts (searchable text with timestamps)
 * 
 * Features:
 * - Full-text search across all channels and content types
 * - Browse by topic/category
 * - Filter by content type
 * - View trending content
 * - Get personalized recommendations
 * - Bookmark content
 * - Subscribe to channels
 */

import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Play, Clock, Zap, TrendingUp, Search as SearchIcon, FileText, Video, BookOpen } from "lucide-react";

type ContentType = "audio" | "document" | "video" | "transcript";

const CONTENT_TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  audio: <Play className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  transcript: <BookOpen className="w-4 h-4" />,
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  audio: "Audio",
  document: "Document",
  video: "Video",
  transcript: "Transcript",
};

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  audio: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  document: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  video: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  transcript: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function ChannelDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [bookmarkedContent, setBookmarkedContent] = useState<Set<string>>(new Set());

  // Fetch data from backend
  const { data: searchResults, isLoading: searchLoading } = trpc.channelDiscovery.search.useQuery(
    {
      query: searchQuery,
      limit: 20,
      filters: {
        topic: selectedTopic || undefined,
        contentType: selectedContentType || undefined,
      },
    },
    { enabled: searchQuery.length > 0 }
  );

  const { data: topics } = trpc.channelDiscovery.getTopics.useQuery();
  const { data: trendingTopics } = trpc.channelDiscovery.getTrendingTopics.useQuery();
  const { data: popularContent } = trpc.channelDiscovery.getPopularContent.useQuery({
    timeRange: "week",
    limit: 10,
    contentType: selectedContentType || undefined,
  });

  const { data: contentStats } = trpc.channelDiscovery.getContentStats.useQuery();

  const { data: userRecommendations } = trpc.channelDiscovery.getRecommendations.useQuery(
    { limit: 10, contentType: selectedContentType || undefined },
    { enabled: activeTab === "recommendations" }
  );

  const { data: userBookmarks } = trpc.channelDiscovery.getBookmarks.useQuery(
    {},
    { enabled: activeTab === "bookmarks" }
  );

  const { data: searchFilters } = trpc.channelDiscovery.getSearchFilters.useQuery();

  const bookmarkMutation = trpc.channelDiscovery.bookmarkContent.useMutation();

  const handleBookmark = (contentId: string) => {
    bookmarkMutation.mutate({ contentId });
    setBookmarkedContent(prev => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderContentMetadata = (item: any) => {
    return (
      <div className="flex flex-wrap gap-2 text-sm text-slate-400">
        {item.type === "audio" && item.duration && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(item.duration)}
          </span>
        )}
        {item.type === "document" && item.pages && (
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {item.pages} pages
          </span>
        )}
        {item.type === "video" && item.duration && (
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            {formatDuration(item.duration)}
          </span>
        )}
        {item.type === "transcript" && item.words && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {item.words.toLocaleString()} words
          </span>
        )}
        <span>{item.plays?.toLocaleString() || 0} views</span>
        <span>⭐ {item.rating?.toFixed(1) || "N/A"}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white mb-2">🔍 Discover Content</h1>
          <p className="text-slate-400">Search across all RRB channels, explore topics, and find your next favorite content in any format</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 mb-8">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recommendations">For You</TabsTrigger>
            <TabsTrigger value="bookmarks" className="hidden lg:inline-flex">Bookmarks</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search episodes, documents, videos, transcripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              {/* Content Type Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedContentType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedContentType(null)}
                  className="rounded-full"
                >
                  All Content
                </Button>
                {["audio", "document", "video", "transcript"].map((type) => (
                  <Button
                    key={type}
                    variant={selectedContentType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedContentType(type as ContentType)}
                    className="rounded-full flex items-center gap-2"
                  >
                    {CONTENT_TYPE_ICONS[type as ContentType]}
                    {CONTENT_TYPE_LABELS[type as ContentType]}
                  </Button>
                ))}
              </div>
            </form>

            {/* Search Results */}
            {searchLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                <p className="text-slate-400 mt-4">Searching across all channels...</p>
              </div>
            )}

            {searchResults && searchResults.results.length > 0 && (
              <div className="space-y-4">
                <p className="text-slate-400">Found {searchResults.total} results</p>
                {searchResults.results.map((item) => (
                  <Card key={item.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${CONTENT_TYPE_COLORS[item.type as ContentType]} border`}>
                              {CONTENT_TYPE_ICONS[item.type as ContentType]}
                              <span className="ml-1">{CONTENT_TYPE_LABELS[item.type as ContentType]}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">{item.channel}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1 truncate">{item.name}</h3>
                          {renderContentMetadata(item)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(item.id)}
                            className={bookmarkedContent.has(item.id) ? "text-red-400" : "text-slate-400"}
                          >
                            <Heart className={`w-4 h-4 ${bookmarkedContent.has(item.id) ? "fill-current" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {searchQuery && searchResults && searchResults.results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No results found for "{searchQuery}"</p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-12">
                <p className="text-slate-400">Start typing to search across all RRB channels</p>
              </div>
            )}
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics?.map((topic) => (
                <Card
                  key={topic.id}
                  className="bg-slate-800 border-slate-700 hover:border-accent cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setActiveTab("search");
                    setSearchQuery(topic.name);
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-3">{topic.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{topic.name}</h3>
                    <p className="text-slate-400 text-sm">{topic.episodeCount} items</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            {/* Trending Topics */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Trending Topics</h2>
              <div className="space-y-3">
                {trendingTopics?.map((item, idx) => (
                  <Card key={`item-${idx}`} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{item.topic}</p>
                          <p className="text-slate-400 text-sm">{item.mentions} mentions</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${item.trend === "↑" ? "text-green-400" : "text-red-400"}`}>
                            {item.trend}
                          </p>
                          <p className="text-slate-400 text-sm">{item.growth}% growth</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Content */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Popular This Week</h2>
              <div className="space-y-4">
                {popularContent?.map((item) => (
                  <Card key={item.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${CONTENT_TYPE_COLORS[item.type as ContentType]} border`}>
                              {CONTENT_TYPE_ICONS[item.type as ContentType]}
                              <span className="ml-1">{CONTENT_TYPE_LABELS[item.type as ContentType]}</span>
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                          <p className="text-slate-400 text-sm">{item.channel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-accent font-semibold">{item.plays?.toLocaleString()} views</p>
                          <p className="text-slate-400 text-sm">⭐ {item.rating?.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {userRecommendations && userRecommendations.length > 0 ? (
              <div className="space-y-4">
                {userRecommendations.map((item) => (
                  <Card key={item.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-accent/10 text-accent border-accent/20">
                              {Math.round(item.match * 100)}% match
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                          <p className="text-slate-400 text-sm">{item.channel}</p>
                          <p className="text-slate-500 text-xs mt-2">{item.reason}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">Listen to more content to get personalized recommendations</p>
              </div>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-6">
            {userBookmarks && userBookmarks.length > 0 ? (
              <div className="space-y-4">
                {userBookmarks.map((item) => (
                  <Card key={item.contentId} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                          <p className="text-slate-400 text-sm">{item.channel}</p>
                          {item.timestamp && (
                            <p className="text-slate-500 text-xs mt-2">Bookmarked at {Math.floor(item.timestamp / 60)}:{String(item.timestamp % 60).padStart(2, "0")}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-400">
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">Bookmark your favorite content to access it later</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Content Statistics */}
        {contentStats && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">{contentStats.audio}</p>
                  <p className="text-slate-400 text-sm mt-2">Audio Episodes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">{contentStats.document}</p>
                  <p className="text-slate-400 text-sm mt-2">Documents</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">{contentStats.video}</p>
                  <p className="text-slate-400 text-sm mt-2">Videos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{contentStats.transcript}</p>
                  <p className="text-slate-400 text-sm mt-2">Transcripts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
