import { db } from './db';
import { users, userFavorites } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface FavoriteChannel {
  id: string;
  channelId: string;
  channelName: string;
  genre: string;
  addedAt: Date;
}

/**
 * Add a channel to user's favorites
 */
export async function addFavorite(userId: number, channelId: string, channelName: string, genre: string): Promise<FavoriteChannel> {
  try {
    const result = await db
      .insert(userFavorites)
      .values({
        userId,
        channelId,
        channelName,
        genre,
        addedAt: new Date(),
      })
      .returning();

    return result[0] as FavoriteChannel;
  } catch (error) {
    console.error('[Favorites] Error adding favorite:', error);
    throw new Error('Failed to add favorite channel');
  }
}

/**
 * Remove a channel from user's favorites
 */
export async function removeFavorite(userId: number, channelId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.channelId, channelId)));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error('[Favorites] Error removing favorite:', error);
    throw new Error('Failed to remove favorite channel');
  }
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId: number): Promise<FavoriteChannel[]> {
  try {
    const favorites = await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .orderBy(userFavorites.addedAt);

    return favorites as FavoriteChannel[];
  } catch (error) {
    console.error('[Favorites] Error fetching favorites:', error);
    return [];
  }
}

/**
 * Check if a channel is favorited by user
 */
export async function isFavorited(userId: number, channelId: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.channelId, channelId)))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('[Favorites] Error checking favorite:', error);
    return false;
  }
}

/**
 * Get favorite count for a user
 */
export async function getFavoriteCount(userId: number): Promise<number> {
  try {
    const result = await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));

    return result.length;
  } catch (error) {
    console.error('[Favorites] Error getting favorite count:', error);
    return 0;
  }
}

/**
 * Clear all favorites for a user
 */
export async function clearAllFavorites(userId: number): Promise<boolean> {
  try {
    const result = await db
      .delete(userFavorites)
      .where(eq(userFavorites.userId, userId));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error('[Favorites] Error clearing favorites:', error);
    throw new Error('Failed to clear favorites');
  }
}

/**
 * Export favorites as JSON
 */
export async function exportFavoritesAsJSON(userId: number): Promise<string> {
  try {
    const favorites = await getUserFavorites(userId);
    return JSON.stringify(favorites, null, 2);
  } catch (error) {
    console.error('[Favorites] Error exporting favorites:', error);
    throw new Error('Failed to export favorites');
  }
}

/**
 * Import favorites from JSON
 */
export async function importFavoritesFromJSON(userId: number, jsonData: string): Promise<FavoriteChannel[]> {
  try {
    const favorites = JSON.parse(jsonData) as Array<{ channelId: string; channelName: string; genre: string }>;
    const imported: FavoriteChannel[] = [];

    for (const fav of favorites) {
      const result = await addFavorite(userId, fav.channelId, fav.channelName, fav.genre);
      imported.push(result);
    }

    return imported;
  } catch (error) {
    console.error('[Favorites] Error importing favorites:', error);
    throw new Error('Failed to import favorites');
  }
}
