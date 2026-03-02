import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Music, Zap, Users, Mic } from "lucide-react";

interface RRBChannelBrowserProps {
  onChannelSelect: (channelId: number, channelName: string) => void;
  selectedChannelId?: number;
}

export function RRBChannelBrowser({
  onChannelSelect,
  selectedChannelId,
}: RRBChannelBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all channels
  const { data: allChannels, isLoading } = trpc.rrbChannels.getAllChannels.useQuery();

  // Fetch channels by category if selected
  const { data: categoryChannels } = trpc.rrbChannels.getChannelsByCategory.useQuery(
    { category: selectedCategory! },
    { enabled: !!selectedCategory }
  );

  // Search channels
  const { data: searchResults } = trpc.rrbChannels.searchChannels.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Determine which channels to display
  const displayChannels = useMemo(() => {
    if (searchQuery.length > 0) {
      return searchResults || [];
    }
    if (selectedCategory) {
      return categoryChannels || [];
    }
    return allChannels || [];
  }, [searchQuery, selectedCategory, searchResults, categoryChannels, allChannels]);

  // Get unique categories from all channels
  const categories = useMemo(() => {
    if (!allChannels) return [];
    const cats = new Set(allChannels.map((ch) => ch.category));
    return Array.from(cats);
  }, [allChannels]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "music":
        return <Music className="w-4 h-4" />;
      case "healing":
        return <Zap className="w-4 h-4" />;
      case "community":
        return <Users className="w-4 h-4" />;
      case "talk":
        return <Mic className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "music":
        return "bg-blue-100 text-blue-800";
      case "healing":
        return "bg-purple-100 text-purple-800";
      case "community":
        return "bg-green-100 text-green-800";
      case "talk":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="gap-2"
          >
            {getCategoryIcon(category)}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Channels Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : displayChannels && displayChannels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {displayChannels.map((channel) => (
            <Card
              key={channel.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedChannelId === channel.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => onChannelSelect(channel.id, channel.name)}
            >
              {/* Channel Artwork */}
              {channel.artwork && (
                <img
                  src={channel.artwork}
                  alt={channel.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}

              {/* Channel Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2">
                  {channel.name}
                </h3>

                {channel.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {channel.description}
                  </p>
                )}

                {/* Category Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getCategoryColor(channel.category)}`}
                  >
                    {getCategoryIcon(channel.category)}
                    <span className="ml-1">
                      {channel.category.charAt(0).toUpperCase() +
                        channel.category.slice(1)}
                    </span>
                  </Badge>

                  {channel.genre && (
                    <Badge variant="outline" className="text-xs">
                      {channel.genre}
                    </Badge>
                  )}
                </div>

                {/* Listeners */}
                {channel.listeners > 0 && (
                  <p className="text-xs text-gray-500">
                    👥 {channel.listeners} listening
                  </p>
                )}

                {/* Select Button */}
                <Button
                  size="sm"
                  className="w-full mt-2"
                  variant={
                    selectedChannelId === channel.id ? "default" : "outline"
                  }
                  onClick={() => onChannelSelect(channel.id, channel.name)}
                >
                  {selectedChannelId === channel.id ? "✓ Selected" : "Select"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No channels found</p>
        </div>
      )}

      {/* Results Count */}
      {displayChannels && displayChannels.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing {displayChannels.length} channel
          {displayChannels.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
