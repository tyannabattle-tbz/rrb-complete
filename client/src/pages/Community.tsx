import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, TrendingUp, Heart, MessageCircle, Share2, Flame } from "lucide-react";
import { toast } from "sonner";

interface Creator {
  userId: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  videoCount: number;
  isFollowing: boolean;
  totalViews: number;
}

interface TrendingVideo {
  videoId: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  views: number;
  likes: number;
  shares: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

export default function Community() {
  const [creators, setCreators] = useState<Creator[]>([
    {
      userId: "1",
      username: "VideoMaster",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VideoMaster",
      bio: "Creating cinematic videos with AI",
      followers: 5234,
      videoCount: 128,
      isFollowing: false,
      totalViews: 524000,
    },
    {
      userId: "2",
      username: "AnimationPro",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimationPro",
      bio: "Animated storytelling expert",
      followers: 3421,
      videoCount: 87,
      isFollowing: true,
      totalViews: 324000,
    },
    {
      userId: "3",
      username: "CinematicDreams",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CinematicDreams",
      bio: "Bringing dreams to life with video",
      followers: 2156,
      videoCount: 64,
      isFollowing: false,
      totalViews: 215000,
    },
  ]);

  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([
    {
      videoId: "1",
      title: "Sunset Over Mountains",
      creator: "VideoMaster",
      creatorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VideoMaster",
      views: 45200,
      likes: 3421,
      shares: 892,
      trend: "up",
      trendPercent: 23,
    },
    {
      videoId: "2",
      title: "Urban Motion Blur",
      creator: "AnimationPro",
      creatorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimationPro",
      views: 32100,
      likes: 2156,
      shares: 654,
      trend: "up",
      trendPercent: 15,
    },
    {
      videoId: "3",
      title: "Abstract Waves",
      creator: "CinematicDreams",
      creatorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CinematicDreams",
      views: 28900,
      likes: 1892,
      shares: 423,
      trend: "stable",
      trendPercent: 0,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCreators, setFilteredCreators] = useState(creators);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilteredCreators(
      creators.filter(
        (c) =>
          c.username.toLowerCase().includes(term.toLowerCase()) ||
          c.bio.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const handleFollowToggle = (userId: string) => {
    setCreators(
      creators.map((c) =>
        c.userId === userId
          ? {
              ...c,
              isFollowing: !c.isFollowing,
              followers: c.isFollowing ? c.followers - 1 : c.followers + 1,
            }
          : c
      )
    );
    setFilteredCreators(
      filteredCreators.map((c) =>
        c.userId === userId
          ? {
              ...c,
              isFollowing: !c.isFollowing,
              followers: c.isFollowing ? c.followers - 1 : c.followers + 1,
            }
          : c
      )
    );
    toast.success("Follow status updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Discover amazing creators and trending videos from the Qumus community
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="creators" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="creators" className="gap-2">
              <Users className="w-4 h-4" />
              Top Creators
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending Videos
            </TabsTrigger>
          </TabsList>

          {/* Top Creators Tab */}
          <TabsContent value="creators" className="space-y-4">
            {/* Search Bar */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search creators..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>

            {/* Creators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => (
                <Card key={creator.userId} className="p-6 text-center hover:shadow-lg transition-shadow">
                  {/* Avatar */}
                  <img
                    src={creator.avatar}
                    alt={creator.username}
                    className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-primary"
                  />

                  {/* Info */}
                  <h3 className="font-semibold text-lg mb-1">{creator.username}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{creator.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
                    <div>
                      <div className="font-semibold">{creator.followers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="font-semibold">{creator.videoCount}</div>
                      <div className="text-xs text-muted-foreground">Videos</div>
                    </div>
                    <div>
                      <div className="font-semibold">{(creator.totalViews / 1000).toFixed(0)}K</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <Button
                    onClick={() => handleFollowToggle(creator.userId)}
                    variant={creator.isFollowing ? "outline" : "default"}
                    className="w-full"
                  >
                    {creator.isFollowing ? "Following" : "Follow"}
                  </Button>
                </Card>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No creators found</p>
              </Card>
            )}
          </TabsContent>

          {/* Trending Videos Tab */}
          <TabsContent value="trending" className="space-y-4">
            <div className="space-y-3">
              {trendingVideos.map((video, index) => (
                <Card key={video.videoId} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted text-lg font-bold">
                      {index === 0 ? (
                        <Flame className="w-6 h-6 text-orange-500" />
                      ) : (
                        <span>#{index + 1}</span>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate mb-1">{video.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={video.creatorAvatar}
                          alt={video.creator}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-muted-foreground">{video.creator}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{video.views.toLocaleString()} views</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {video.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {video.shares.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Trend */}
                    <div className="flex items-center">
                      <div
                        className={`text-right ${
                          video.trend === "up"
                            ? "text-green-500"
                            : video.trend === "down"
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          {video.trend === "up"
                            ? "↑"
                            : video.trend === "down"
                            ? "↓"
                            : "→"}{" "}
                          {video.trendPercent}%
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
