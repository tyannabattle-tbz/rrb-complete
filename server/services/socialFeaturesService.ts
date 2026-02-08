export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  followers: number;
  following: number;
  totalPlaylists: number;
  joinedAt: number;
  isVerified: boolean;
}

export interface SocialPlaylist {
  id: string;
  name: string;
  description?: string;
  creator: string;
  tracks: number;
  followers: number;
  isPublic: boolean;
  createdAt: number;
  thumbnail?: string;
}

export interface FeedItem {
  id: string;
  type: 'follow' | 'playlist_created' | 'playlist_liked' | 'track_liked' | 'comment';
  userId: string;
  timestamp: number;
  content: {
    action: string;
    targetId?: string;
    targetName?: string;
  };
}

export interface UserFollowRelation {
  followerId: string;
  followingId: string;
  followedAt: number;
}

export class SocialFeaturesService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private followRelations: Map<string, Set<string>> = new Map();
  private socialPlaylists: Map<string, SocialPlaylist> = new Map();
  private feedItems: Map<string, FeedItem[]> = new Map();

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = this.userProfiles.get(userId) || {
      id: userId,
      username: `user_${userId}`,
      displayName: `User ${userId}`,
      followers: 0,
      following: 0,
      totalPlaylists: 0,
      joinedAt: Date.now(),
      isVerified: false,
    };

    const updated = { ...profile, ...updates };
    this.userProfiles.set(userId, updated);
    return updated;
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (!this.followRelations.has(followerId)) {
      this.followRelations.set(followerId, new Set());
    }

    const isFollowing = this.followRelations.get(followerId)!.has(followingId);
    if (!isFollowing) {
      this.followRelations.get(followerId)!.add(followingId);

      // Update follower counts
      const followerProfile = await this.getUserProfile(followerId);
      const followingProfile = await this.getUserProfile(followingId);

      if (followerProfile) {
        await this.updateUserProfile(followerId, { following: followerProfile.following + 1 });
      }

      if (followingProfile) {
        await this.updateUserProfile(followingId, { followers: followingProfile.followers + 1 });
      }

      // Add to feed
      this.addFeedItem(followerId, {
        type: 'follow',
        action: `followed ${followingId}`,
      });

      return true;
    }

    return false;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const followers = this.followRelations.get(followerId);
    if (followers && followers.has(followingId)) {
      followers.delete(followingId);

      // Update follower counts
      const followerProfile = await this.getUserProfile(followerId);
      const followingProfile = await this.getUserProfile(followingId);

      if (followerProfile) {
        await this.updateUserProfile(followerId, { following: Math.max(0, followerProfile.following - 1) });
      }

      if (followingProfile) {
        await this.updateUserProfile(followingId, { followers: Math.max(0, followingProfile.followers - 1) });
      }

      return true;
    }

    return false;
  }

  /**
   * Check if user follows another user
   */
  isFollowing(followerId: string, followingId: string): boolean {
    const followers = this.followRelations.get(followerId);
    return followers ? followers.has(followingId) : false;
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit: number = 20): Promise<UserProfile[]> {
    const followers: UserProfile[] = [];

    for (const [followerId, following] of this.followRelations.entries()) {
      if (following.has(userId) && followers.length < limit) {
        const profile = await this.getUserProfile(followerId);
        if (profile) followers.push(profile);
      }
    }

    return followers;
  }

  /**
   * Get user's following
   */
  async getFollowing(userId: string, limit: number = 20): Promise<UserProfile[]> {
    const following: UserProfile[] = [];
    const followingIds = this.followRelations.get(userId) || new Set();

    for (const followingId of followingIds) {
      if (following.length < limit) {
        const profile = await this.getUserProfile(followingId);
        if (profile) following.push(profile);
      }
    }

    return following;
  }

  /**
   * Create social playlist
   */
  async createSocialPlaylist(
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = true
  ): Promise<SocialPlaylist> {
    const playlist: SocialPlaylist = {
      id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      creator: userId,
      tracks: 0,
      followers: 0,
      isPublic,
      createdAt: Date.now(),
    };

    this.socialPlaylists.set(playlist.id, playlist);

    // Update user profile
    const profile = await this.getUserProfile(userId);
    if (profile) {
      await this.updateUserProfile(userId, { totalPlaylists: profile.totalPlaylists + 1 });
    }

    // Add to feed
    this.addFeedItem(userId, {
      type: 'playlist_created',
      action: `created playlist "${name}"`,
      targetId: playlist.id,
      targetName: name,
    });

    return playlist;
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(userId: string): Promise<SocialPlaylist[]> {
    return Array.from(this.socialPlaylists.values()).filter(p => p.creator === userId);
  }

  /**
   * Get user's feed
   */
  async getUserFeed(userId: string, limit: number = 20): Promise<FeedItem[]> {
    const following = this.followRelations.get(userId) || new Set();
    const feed: FeedItem[] = [];

    // Get feed items from following
    for (const followingId of following) {
      const items = this.feedItems.get(followingId) || [];
      feed.push(...items);
    }

    // Sort by timestamp and limit
    return feed.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Add item to user's feed
   */
  private addFeedItem(userId: string, content: { type: string; action: string; targetId?: string; targetName?: string }) {
    if (!this.feedItems.has(userId)) {
      this.feedItems.set(userId, []);
    }

    const item: FeedItem = {
      id: `feed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: content.type as any,
      userId,
      timestamp: Date.now(),
      content: {
        action: content.action,
        targetId: content.targetId,
        targetName: content.targetName,
      },
    };

    this.feedItems.get(userId)!.push(item);
  }

  /**
   * Get trending playlists
   */
  async getTrendingPlaylists(limit: number = 10): Promise<SocialPlaylist[]> {
    return Array.from(this.socialPlaylists.values())
      .filter(p => p.isPublic)
      .sort((a, b) => b.followers - a.followers)
      .slice(0, limit);
  }

  /**
   * Get recommended users to follow
   */
  async getRecommendedUsers(userId: string, limit: number = 10): Promise<UserProfile[]> {
    const recommended: UserProfile[] = [];
    const following = this.followRelations.get(userId) || new Set();

    for (const [id, profile] of this.userProfiles.entries()) {
      if (id !== userId && !following.has(id) && recommended.length < limit) {
        recommended.push(profile);
      }
    }

    return recommended.sort((a, b) => b.followers - a.followers);
  }

  /**
   * Get social statistics
   */
  getSocialStatistics() {
    return {
      totalUsers: this.userProfiles.size,
      totalFollowRelations: Array.from(this.followRelations.values()).reduce((sum, set) => sum + set.size, 0),
      totalPlaylists: this.socialPlaylists.size,
      publicPlaylists: Array.from(this.socialPlaylists.values()).filter(p => p.isPublic).length,
      totalFeedItems: Array.from(this.feedItems.values()).reduce((sum, items) => sum + items.length, 0),
      averageFollowers: this.userProfiles.size > 0 
        ? Array.from(this.userProfiles.values()).reduce((sum, p) => sum + p.followers, 0) / this.userProfiles.size 
        : 0,
    };
  }
}

export const socialFeaturesService = new SocialFeaturesService();
