import { db } from '../db';
import { users, listenerFavorites } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface FavoriteChannel {
  id: string;
  userId: string;
  channelId: string;
  channelName: string;
  addedAt: Date;
  lastListened?: Date;
}

/**
 * Add a channel to user's favorites
 */
export async function addFavorite(userId: string, channelId: string, channelName: string): Promise<FavoriteChannel> {
  const favorite = await db
    .insert(listenerFavorites)
    .values({
      userId,
      channelId,
      channelName,
      addedAt: new Date(),
    })
    .returning();

  return {
    id: favorite[0].id,
    userId: favorite[0].userId,
    channelId: favorite[0].channelId,
    channelName: favorite[0].channelName,
    addedAt: favorite[0].addedAt,
    lastListened: favorite[0].lastListened,
  };
}

/**
 * Remove a channel from user's favorites
 */
export async function removeFavorite(userId: string, channelId: string): Promise<boolean> {
  const result = await db
    .delete(listenerFavorites)
    .where(and(eq(listenerFavorites.userId, userId), eq(listenerFavorites.channelId, channelId)));

  return result.rowsAffected > 0;
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId: string): Promise<FavoriteChannel[]> {
  const favorites = await db
    .select()
    .from(listenerFavorites)
    .where(eq(listenerFavorites.userId, userId))
    .orderBy(listenerFavorites.addedAt);

  return favorites.map(fav => ({
    id: fav.id,
    userId: fav.userId,
    channelId: fav.channelId,
    channelName: fav.channelName,
    addedAt: fav.addedAt,
    lastListened: fav.lastListened,
  }));
}

/**
 * Check if a channel is favorited by user
 */
export async function isFavorited(userId: string, channelId: string): Promise<boolean> {
  const favorite = await db
    .select()
    .from(listenerFavorites)
    .where(and(eq(listenerFavorites.userId, userId), eq(listenerFavorites.channelId, channelId)))
    .limit(1);

  return favorite.length > 0;
}

/**
 * Update last listened time for a favorite
 */
export async function updateLastListened(userId: string, channelId: string): Promise<void> {
  await db
    .update(listenerFavorites)
    .set({ lastListened: new Date() })
    .where(and(eq(listenerFavorites.userId, userId), eq(listenerFavorites.channelId, channelId)));
}

/**
 * Get top favorite channels across all users
 */
export async function getTopFavorites(limit: number = 10): Promise<Array<{ channelId: string; count: number }>> {
  const result = await db.execute(
    `SELECT channelId, COUNT(*) as count FROM listener_favorites GROUP BY channelId ORDER BY count DESC LIMIT ?`,
    [limit]
  );

  return result as Array<{ channelId: string; count: number }>;
}

/**
 * Get personalized recommendations based on user's favorites
 */
export async function getRecommendations(userId: string, limit: number = 5): Promise<string[]> {
  // Get user's favorite categories
  const userFavorites = await getUserFavorites(userId);
  if (userFavorites.length === 0) {
    return [];
  }

  // Get top channels from same categories
  const topChannels = await getTopFavorites(limit);
  const recommendedIds = topChannels
    .map(t => t.channelId)
    .filter(id => !userFavorites.some(fav => fav.channelId === id))
    .slice(0, limit);

  return recommendedIds;
}

export default {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorited,
  updateLastListened,
  getTopFavorites,
  getRecommendations,
};
