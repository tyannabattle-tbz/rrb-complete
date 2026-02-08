import { db } from '../db';
import { userProfiles, userFollows } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface UserProfileInput {
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  spotifyUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

export class SocialService {
  /**
   * Create or update user profile
   */
  async upsertUserProfile(input: UserProfileInput) {
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, input.userId),
    });

    if (existing) {
      return await db
        .update(userProfiles)
        .set({
          displayName: input.displayName,
          bio: input.bio,
          avatarUrl: input.avatarUrl,
          location: input.location,
          website: input.website,
          spotifyUrl: input.spotifyUrl,
          twitterUrl: input.twitterUrl,
          instagramUrl: input.instagramUrl,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, input.userId))
        .returning();
    } else {
      return await db.insert(userProfiles).values({
        id: `prof_${Date.now()}`,
        userId: input.userId,
        displayName: input.displayName,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
        location: input.location,
        website: input.website,
        spotifyUrl: input.spotifyUrl,
        twitterUrl: input.twitterUrl,
        instagramUrl: input.instagramUrl,
        followerCount: 0,
        followingCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    return await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string) {
    // Check if already following
    const existing = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      ),
    });

    if (existing) {
      return existing;
    }

    // Create follow relationship
    const follow = await db.insert(userFollows).values({
      id: `follow_${Date.now()}`,
      followerId,
      followingId,
      createdAt: new Date(),
    }).returning();

    // Update follower counts
    const followingProfile = await this.getUserProfile(followingId);
    if (followingProfile) {
      await db
        .update(userProfiles)
        .set({
          followerCount: (followingProfile.followerCount || 0) + 1,
        })
        .where(eq(userProfiles.userId, followingId));
    }

    const followerProfile = await this.getUserProfile(followerId);
    if (followerProfile) {
      await db
        .update(userProfiles)
        .set({
          followingCount: (followerProfile.followingCount || 0) + 1,
        })
        .where(eq(userProfiles.userId, followerId));
    }

    return follow[0];
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string) {
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId)
        )
      );

    // Update follower counts
    const followingProfile = await this.getUserProfile(followingId);
    if (followingProfile) {
      await db
        .update(userProfiles)
        .set({
          followerCount: Math.max(0, (followingProfile.followerCount || 0) - 1),
        })
        .where(eq(userProfiles.userId, followingId));
    }

    const followerProfile = await this.getUserProfile(followerId);
    if (followerProfile) {
      await db
        .update(userProfiles)
        .set({
          followingCount: Math.max(0, (followerProfile.followingCount || 0) - 1),
        })
        .where(eq(userProfiles.userId, followerId));
    }
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string) {
    const follow = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      ),
    });
    return !!follow;
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(userId: string, limit = 50, offset = 0) {
    const follows = await db.query.userFollows.findMany({
      where: eq(userFollows.followingId, userId),
      limit,
      offset,
    });

    const followerIds = follows.map((f) => f.followerId);
    const profiles = await db.query.userProfiles.findMany({
      where: (table) => {
        // Filter by followerIds
        return followerIds.length > 0 ? undefined : undefined;
      },
    });

    return profiles.filter((p) => followerIds.includes(p.userId));
  }

  /**
   * Get users that a user is following
   */
  async getUserFollowing(userId: string, limit = 50, offset = 0) {
    const follows = await db.query.userFollows.findMany({
      where: eq(userFollows.followerId, userId),
      limit,
      offset,
    });

    const followingIds = follows.map((f) => f.followingId);
    const profiles = await db.query.userProfiles.findMany({
      where: (table) => {
        // Filter by followingIds
        return followingIds.length > 0 ? undefined : undefined;
      },
    });

    return profiles.filter((p) => followingIds.includes(p.userId));
  }

  /**
   * Get mutual followers (users who follow each other)
   */
  async getMutualFollowers(userId1: string, userId2: string) {
    const user1Following = await db.query.userFollows.findMany({
      where: eq(userFollows.followerId, userId1),
    });

    const user2Following = await db.query.userFollows.findMany({
      where: eq(userFollows.followerId, userId2),
    });

    const user1FollowingIds = new Set(user1Following.map((f) => f.followingId));
    const user2FollowingIds = new Set(user2Following.map((f) => f.followingId));

    const mutual = Array.from(user1FollowingIds).filter((id) =>
      user2FollowingIds.has(id)
    );

    return mutual;
  }

  /**
   * Generate share URL for Spotify
   */
  generateSpotifyShareUrl(contentId: string, contentType: string): string {
    // Format: spotify:track:{id} or spotify:playlist:{id}
    return `spotify:${contentType}:${contentId}`;
  }

  /**
   * Generate share URL for Twitter
   */
  generateTwitterShareUrl(
    contentTitle: string,
    contentUrl: string,
    hashtags: string[] = []
  ): string {
    const text = `Check out: ${contentTitle} ${contentUrl}`;
    const hashtagString = hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : '';
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${hashtagString}`;
  }

  /**
   * Generate share URL for TikTok
   */
  generateTikTokShareUrl(contentUrl: string): string {
    return `https://www.tiktok.com/share?url=${encodeURIComponent(contentUrl)}`;
  }

  /**
   * Generate share URL for Instagram
   */
  generateInstagramShareUrl(contentUrl: string): string {
    // Instagram doesn't have a direct share URL, but can use web share
    return `https://www.instagram.com/`;
  }

  /**
   * Get trending users (by follower count)
   */
  async getTrendingUsers(limit = 10) {
    const profiles = await db.query.userProfiles.findMany({
      limit,
      orderBy: (table) => {
        // Order by followerCount descending
        return [];
      },
    });

    return profiles.sort(
      (a, b) => (b.followerCount || 0) - (a.followerCount || 0)
    );
  }

  /**
   * Search for users
   */
  async searchUsers(query: string, limit = 20) {
    const profiles = await db.query.userProfiles.findMany({
      limit,
    });

    return profiles.filter(
      (p) =>
        p.displayName.toLowerCase().includes(query.toLowerCase()) ||
        p.bio?.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get user activity feed (from following)
   */
  async getUserActivityFeed(userId: string, limit = 50) {
    const following = await db.query.userFollows.findMany({
      where: eq(userFollows.followerId, userId),
    });

    const followingIds = following.map((f) => f.followingId);

    // In a real implementation, this would query activity/events from following users
    // For now, return empty
    return [];
  }
}

export const socialService = new SocialService();
