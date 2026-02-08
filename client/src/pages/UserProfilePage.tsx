import { useState } from 'react';
import { useRoute } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Globe,
  Music,
  Twitter,
  Instagram,
  Users,
  UserPlus,
  UserCheck,
  Edit2,
  Share2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function UserProfilePage() {
  const { user: currentUser } = useAuth();
  const [, params] = useRoute('/profile/:userId');
  const userId = params?.userId || currentUser?.id;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    spotifyUrl: '',
    twitterUrl: '',
    instagramUrl: '',
  });

  const { data: profile } = trpc.social.getUserProfile.useQuery({
    userId: userId || '',
  });

  const { data: followers } = trpc.social.getUserFollowers.useQuery({
    userId: userId || '',
  });

  const { data: following } = trpc.social.getUserFollowing.useQuery({
    userId: userId || '',
  });

  const { data: isFollowing } = trpc.social.isFollowing.useQuery({
    followerId: currentUser?.id || '',
    followingId: userId || '',
  });

  const followMutation = trpc.social.followUser.useMutation();
  const unfollowMutation = trpc.social.unfollowUser.useMutation();
  const updateProfileMutation = trpc.social.updateProfile.useMutation();

  const isOwnProfile = currentUser?.id === userId;

  const handleFollow = () => {
    if (!currentUser?.id || !userId) return;
    if (isFollowing) {
      unfollowMutation.mutate({
        followerId: currentUser.id,
        followingId: userId,
      });
    } else {
      followMutation.mutate({
        followerId: currentUser.id,
        followingId: userId,
      });
    }
  };

  const handleUpdateProfile = () => {
    if (!userId) return;
    updateProfileMutation.mutate({
      userId,
      ...editData,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        {profile && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden mb-6">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-500" />

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-800 flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-16 h-16 text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white">
                    {profile.displayName}
                  </h1>
                  {profile.bio && (
                    <p className="text-slate-400 mt-1">{profile.bio}</p>
                  )}
                </div>
                {isOwnProfile ? (
                  <Button
                    onClick={() => {
                      setEditData({
                        displayName: profile.displayName,
                        bio: profile.bio || '',
                        location: profile.location || '',
                        website: profile.website || '',
                        spotifyUrl: profile.spotifyUrl || '',
                        twitterUrl: profile.twitterUrl || '',
                        instagramUrl: profile.instagramUrl || '',
                      });
                      setIsEditingProfile(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    className={
                      isFollowing
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-amber-500 hover:bg-amber-600'
                    }
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {profile.followerCount || 0}
                  </p>
                  <p className="text-slate-400 text-sm">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {profile.followingCount || 0}
                  </p>
                  <p className="text-slate-400 text-sm">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-slate-400 text-sm">Playlists</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-slate-400 text-sm">Likes</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                {profile.location && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-amber-500 hover:text-amber-400"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {profile.spotifyUrl && (
                  <a
                    href={profile.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-500 hover:text-green-400"
                  >
                    <Music className="w-4 h-4" />
                    Spotify
                  </a>
                )}
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {profile.instagramUrl && (
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-500 hover:text-pink-400"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Followers Section */}
        {followers && followers.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Followers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.slice(0, 6).map((follower) => (
                <div
                  key={follower.userId}
                  className="p-4 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">
                        {follower.displayName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {follower.followerCount} followers
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Display Name
              </label>
              <Input
                value={editData.displayName}
                onChange={(e) =>
                  setEditData({ ...editData, displayName: e.target.value })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Bio</label>
              <Input
                value={editData.bio}
                onChange={(e) =>
                  setEditData({ ...editData, bio: e.target.value })
                }
                placeholder="Tell us about yourself"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Location
              </label>
              <Input
                value={editData.location}
                onChange={(e) =>
                  setEditData({ ...editData, location: e.target.value })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Website
              </label>
              <Input
                value={editData.website}
                onChange={(e) =>
                  setEditData({ ...editData, website: e.target.value })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProfile}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
