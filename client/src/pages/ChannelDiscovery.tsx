/**
 * Channel Discovery Page
 * Phase 8: Comprehensive content discovery interface
 * 
 * Features:
 * - Full-text search across all channels
 * - Browse by topic/category
 * - View trending content
 * - Get personalized recommendations
 * - Bookmark episodes
 * - Subscribe to channels
 */

import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Play, Clock, Zap, TrendingUp, Search as SearchIcon } from "lucide-react";

export function ChannelDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [bookmarkedEpisodes, setBookmarkedEpisodes] = useState<Set<string>>(new Set());

  // Fetch data from backend
  const { data: searchResults, isLoading: searchLoading } = trpc.channelDiscovery.search.useQuery(
    {
      query: searchQuery,
      limit: 20,
      filters: selectedTopic ? { topic: selectedTopic } : undefined,
    },
    { enabled: searchQuery.length > 0 }
  );

  const { data: topics } = trpc.channelDiscovery.getTopics.useQuery();
  const { data: trendingTopics } = trpc.channelDiscovery.getTrendingTopics.useQuery();
  const { data: popularEpisodes } = trpc.channelDiscovery.getPopularEpisodes.useQuery({
    timeRange: "week",
    limit: 10,
  });

  const { data: userRecommendations } = trpc.channelDiscovery.getRecommendations.useQuery(
    { limit: 10 },
    { enabled: activeTab === "recommendations" }
  );

  const { data: userBookmarks } = trpc.channelDiscovery.getBookmarks.useQuery(
    {},
    { enabled: activeTab === "bookmarks" }
  );

  const bookmarkMutation = trpc.channelDiscovery.bookmarkEpisode.useMutation();

  const handleBookmark = (episodeId: string) => {
    bookmarkMutation.mutate({ episodeId });
    setBookmarkedEpisodes(prev => {
      const next = new Set(prev);
      if (next.has(episodeId)) {
        next.delete(episodeId);
      } else {
        next.add(episodeId);
      }
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered by query state change
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Content</h1>
          <p className="text-slate-400">Search across all RRB channels, explore topics, and find your next favorite episode</p>
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
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search episodes, channels, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </form>

            {/* Search Results */}
            {searchQuery && (
              <div className="space-y-4">
                {searchLoading ? (
                  <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-24 bg-slate-700/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : searchResults && searchResults.results.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                      Found {searchResults.total} results for "{searchResults.query}"
                    </p>
                    {searchResults.results.map((episode) => (
                      <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        isBookmarked={bookmarkedEpisodes.has(episode.id)}
                        onBookmark={() => handleBookmark(episode.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No episodes found. Try a different search.</p>
                  </div>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Enter a search term to discover content</p>
              </div>
            )}
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics?.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isSelected={selectedTopic === topic.id}
                  onSelect={() => {
                    setSelectedTopic(topic.id);
                    setSearchQuery("");
                    setActiveTab("search");
                  }}
                />
              ))}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {trendingTopics?.map((item, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.topic}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {item.mentions.toLocaleString()} mentions
                        </CardDescription>
                      </div>
                      <div className={`text-2xl font-bold ${item.trend === "↑" ? "text-green-500" : "text-red-500"}`}>
                        {item.trend}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      <span className={`text-sm font-semibold ${item.growth > 0 ? "text-green-500" : "text-red-500"}`}>
                        {item.growth > 0 ? "+" : ""}{item.growth}% growth
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Popular Episodes */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Popular This Week</h2>
              <div className="space-y-4">
                {popularEpisodes?.map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    isBookmarked={bookmarkedEpisodes.has(episode.id)}
                    onBookmark={() => handleBookmark(episode.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {userRecommendations && userRecommendations.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Personalized for you based on your listening history</p>
                {userRecommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    isBookmarked={bookmarkedEpisodes.has(rec.id)}
                    onBookmark={() => handleBookmark(rec.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">Start listening to get personalized recommendations</p>
              </div>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-6">
            {userBookmarks && userBookmarks.length > 0 ? (
              <div className="space-y-4">
                {userBookmarks.map((bookmark) => (
                  <Card key={bookmark.episodeId} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{bookmark.title}</CardTitle>
                          <CardDescription>{bookmark.channel}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(bookmark.episodeId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                        {bookmark.timestamp && (
                          <span>Resume at {Math.floor(bookmark.timestamp / 60)}:{String(bookmark.timestamp % 60).padStart(2, "0")}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No bookmarked episodes yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Episode Card Component
 */
function EpisodeCard({
  episode,
  isBookmarked,
  onBookmark,
}: {
  episode: any;
  isBookmarked: boolean;
  onBookmark: () => void;
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{episode.title}</CardTitle>
            <CardDescription className="text-sm mt-1">{episode.channel}</CardDescription>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmark}
              className={isBookmarked ? "text-red-500" : "text-slate-400"}
            >
              <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            <span>{episode.plays?.toLocaleString() || 0} plays</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{Math.floor((episode.duration || 0) / 60)}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>{episode.rating || 0} rating</span>
          </div>
          {episode.relevance && (
            <Badge variant="secondary" className="ml-auto">
              {Math.round((episode.relevance || 0) * 100)}% match
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Topic Card Component
 */
function TopicCard({
  topic,
  isSelected,
  onSelect,
}: {
  topic: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer transition ${
        isSelected
          ? "bg-blue-600 border-blue-500"
          : "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
      }`}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{topic.icon}</span>
          <div className="flex-1">
            <CardTitle className={isSelected ? "text-white" : ""}>{topic.name}</CardTitle>
            <CardDescription className={isSelected ? "text-blue-100" : ""}>
              {topic.episodeCount} episodes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

/**
 * Recommendation Card Component
 */
function RecommendationCard({
  recommendation,
  isBookmarked,
  onBookmark,
}: {
  recommendation: any;
  isBookmarked: boolean;
  onBookmark: () => void;
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{recommendation.title}</CardTitle>
            <CardDescription className="text-sm mt-1">{recommendation.channel}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBookmark}
            className={isBookmarked ? "text-red-500" : "text-slate-400"}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">{recommendation.reason}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(recommendation.match || 0) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-blue-400">
              {Math.round((recommendation.match || 0) * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChannelDiscovery;
