import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share2, Users, Video, Award, Calendar } from "lucide-react";
// User profile component - auth handled by parent page

interface UserProfileData {
  userId: string;
  username: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  totalVideos: number;
  totalViews: number;
  joinedDate: Date;
  isFollowing: boolean;
}

interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  createdAt: Date;
}

export default function UserProfile({ userId }: { userId?: string }) {
  const [profile, setProfile] = useState<UserProfileData>({
    userId: userId || "1",
    username: "VideoCreator",
    bio: "Creating amazing videos with Qumus AI",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VideoCreator",
    followers: 1234,
    following: 567,
    totalVideos: 42,
    totalViews: 125000,
    joinedDate: new Date("2025-01-01"),
    isFollowing: false,
  });

  const [videos, setVideos] = useState<VideoItem[]>([
    {
      videoId: "video-1",
      title: "Cinematic Sunset",
      thumbnail: "",
      views: 5200,
      likes: 342,
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      videoId: "video-2",
      title: "Urban Motion",
      thumbnail: "",
      views: 3100,
      likes: 218,
      createdAt: new Date(Date.now() - 172800000),
    },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [editedBio, setEditedBio] = useState(profile.bio);

  const isOwnProfile = true; // Simplified for now

  const handleFollowToggle = () => {
    setProfile({
      ...profile,
      isFollowing: !profile.isFollowing,
      followers: profile.isFollowing ? profile.followers - 1 : profile.followers + 1,
    });
  };

  const handleSaveBio = () => {
    setProfile({ ...profile, bio: editedBio });
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary"
            />

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{profile.username}</h1>
                <Award className="w-6 h-6 text-primary" />
              </div>

              {editMode && isOwnProfile ? (
                <div className="space-y-2 mb-4">
                  <Input
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    placeholder="Edit your bio..."
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveBio}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setEditedBio(profile.bio);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <div className="font-semibold text-lg">{profile.totalVideos}</div>
                  <div className="text-muted-foreground">Videos</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">{profile.followers.toLocaleString()}</div>
                  <div className="text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">{profile.following.toLocaleString()}</div>
                  <div className="text-muted-foreground">Following</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">{(profile.totalViews / 1000).toFixed(0)}K</div>
                  <div className="text-muted-foreground">Views</div>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4" />
                Joined {profile.joinedDate.toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button onClick={() => setEditMode(!editMode)} variant="outline">
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleFollowToggle} variant={profile.isFollowing ? "outline" : "default"}>
                      <Users className="w-4 h-4 mr-2" />
                      {profile.isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-2">
              <Heart className="w-4 h-4" />
              Liked
            </TabsTrigger>
            <TabsTrigger value="followers" className="gap-2">
              <Users className="w-4 h-4" />
              Followers
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card key={video.videoId} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative bg-black aspect-video flex items-center justify-center group">
                    <video
                      src={video.thumbnail}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold truncate mb-2">{video.title}</h3>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{video.views.toLocaleString()} views</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {video.likes}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Liked Tab */}
          <TabsContent value="liked">
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No liked videos yet</p>
            </Card>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=follower${i}`}
                      alt={`Follower ${i}`}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">Follower {i}</p>
                      <p className="text-xs text-muted-foreground">@follower{i}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
