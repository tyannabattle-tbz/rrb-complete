import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Search, TrendingUp, Hash, Filter, Play, Users, Radio, Zap, Star } from "lucide-react";

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "sessions" | "messages" | "tools">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "trending" | "discover">("search");

  const searchMutation = trpc.analytics.advancedSearch.search.useQuery(
    { query, type: searchType, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, limit: 50 },
    { enabled: false }
  );
  const searchTrigger = trpc.analytics.advancedSearch.search.useQuery;
  const suggestionQuery = trpc.analytics.advancedSearch.getSuggestions.useQuery(
    { query, limit: 5 },
    { enabled: query.length > 0 }
  );

  const handleSearch = async () => {
    if (!query.trim()) return;
    setHasSearched(true);
  };

  const results = searchMutation.data;

  const TRENDING_HASHTAGS = [
    { hashtag: "#MusicShowcase", mentions: 2450, growth: 35, topBroadcasts: ["Weekly Music Showcase", "Artist Spotlight"] },
    { hashtag: "#WellnessJourney", mentions: 1820, growth: 28, topBroadcasts: ["Healing Frequencies", "Meditation Series"] },
    { hashtag: "#GamingTournament", mentions: 1540, growth: 42, topBroadcasts: ["Solbones Championship", "Gaming Live"] },
    { hashtag: "#CommunityVoices", mentions: 1230, growth: 18, topBroadcasts: ["Community Q&A", "Town Hall"] },
    { hashtag: "#LegacyRestored", mentions: 980, growth: 52, topBroadcasts: ["Archive Stories", "History Uncovered"] },
    { hashtag: "#CreatorLife", mentions: 850, growth: 25, topBroadcasts: ["Creator Spotlight", "Behind the Scenes"] },
  ];

  const DISCOVERY_CATEGORIES = [
    { name: "Music & Radio", icon: "🎵", count: 324, trending: true },
    { name: "Wellness & Meditation", icon: "🧘", count: 156, trending: true },
    { name: "Gaming & Entertainment", icon: "🎮", count: 89, trending: false },
    { name: "Community & Talk", icon: "💬", count: 234, trending: false },
    { name: "Documentary & Archive", icon: "📚", count: 67, trending: true },
    { name: "Live Events", icon: "📻", count: 45, trending: false },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Search className="w-8 h-8" /> Advanced Search & Discovery</h1>
        <p className="text-gray-600">Search across broadcasts, creators, and events with advanced filters</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[{ id: "search", label: "Search Results" }, { id: "trending", label: "Trending" }, { id: "discover", label: "Discover" }].map((tab) => (
          <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} onClick={() => setActiveTab(tab.id as any)}>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>Enter your search query and apply filters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Query Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <div className="relative">
                <Input
                  placeholder="Search broadcasts, creators, or events..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pr-10"
                />
                {suggestionQuery.data && suggestionQuery.data.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-10">
                    {suggestionQuery.data.map((suggestion, idx) => (
                      <div
                        key={`item-${idx}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setQuery(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Type</label>
              <div className="flex gap-2">
                {(["all", "sessions", "messages", "tools"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={searchType === type ? "default" : "outline"}
                    onClick={() => setSearchType(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            {/* Search Button */}
            <Button onClick={handleSearch} disabled={!query.trim()} className="w-full">
              Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trending Tab */}
      {activeTab === "trending" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRENDING_HASHTAGS.map((item) => (
            <Card key={item.hashtag} className="cursor-pointer hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold">{item.hashtag}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">+{item.growth}%</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{item.mentions.toLocaleString()} mentions</p>
                <div className="space-y-1">
                  <p className="text-gray-700 text-xs font-semibold">Top Broadcasts:</p>
                  {item.topBroadcasts.map((broadcast) => (
                    <p key={broadcast} className="text-gray-600 text-sm">• {broadcast}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === "discover" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DISCOVERY_CATEGORIES.map((category) => (
              <Card key={category.name} className="cursor-pointer hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-3xl mb-2">{category.icon}</p>
                      <h3 className="text-lg font-bold">{category.name}</h3>
                    </div>
                    {category.trending && <TrendingUp className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">{category.count} broadcasts</span>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Play className="w-3 h-3" /> Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {activeTab === "search" && hasSearched && results && (
        <div className="space-y-4">
          {/* Sessions Results */}
          {results.sessions && results.sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sessions ({results.sessions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.sessions.map((session: any) => (
                    <div key={session.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{session.sessionName}</p>
                          <p className="text-sm text-gray-600">
                            Created: {format(new Date(session.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                        <Badge className="bg-blue-500">{session.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages Results */}
          {results.messages && results.messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Messages ({results.messages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.messages.map((message: any) => (
                    <div key={message.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className={message.role === "user" ? "bg-green-500" : "bg-purple-500"}>
                            {message.role}
                          </Badge>
                          <p className="mt-2 text-sm line-clamp-2">{message.content}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {format(new Date(message.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools Results */}
          {results.tools && results.tools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tools ({results.tools.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.tools.map((tool: any) => (
                    <div key={tool.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{tool.toolName}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(tool.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                        <Badge className="bg-orange-500">Tool</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {(!results.sessions || results.sessions.length === 0) &&
            (!results.messages || results.messages.length === 0) &&
            (!results.tools || results.tools.length === 0) && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">No results found for "{query}"</p>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
