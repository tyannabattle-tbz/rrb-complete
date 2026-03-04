import { getDb } from '../db';
import { userStationPreferences, customStations } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

interface UserPreferences {
  userId: string;
  stationId: number;
  isFavorite: boolean;
  lastListenedAt?: Date;
  totalListenTime: number;
}

/**
 * User Preferences Service
 * Manages persistent user preferences for stations
 * Saves favorites, listening history, and personalized settings
 */
export class UserPreferencesService {
  /**
   * Get all user preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const preferences = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, userId));

      return preferences;
    } catch (error) {
      console.error(`Error getting preferences for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get favorite stations for a user
   */
  static async getFavoriteStations(userId: string): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const favorites = await db
        .select({
          stationId: userStationPreferences.stationId,
          station: customStations,
        })
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, userId),
            eq(userStationPreferences.isFavorite, 1)
          )
        );

      return favorites;
    } catch (error) {
      console.error(`Error getting favorites for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Toggle favorite status for a station
   */
  static async toggleFavorite(
    userId: string,
    stationId: number,
    isFavorite: boolean
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      // Check if preference exists
      const existing = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, userId),
            eq(userStationPreferences.stationId, stationId)
          )
        );

      if (existing.length > 0) {
        // Update existing preference
        await db
          .update(userStationPreferences)
          .set({
            isFavorite: isFavorite ? 1 : 0,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userStationPreferences.userId, userId),
              eq(userStationPreferences.stationId, stationId)
            )
          );
      } else {
        // Create new preference
        await db.insert(userStationPreferences).values({
          userId,
          stationId,
          isFavorite: isFavorite ? 1 : 0,
          totalListenTime: 0,
        });
      }

      return true;
    } catch (error) {
      console.error(
        `Error toggling favorite for user ${userId}, station ${stationId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Update last listened time
   */
  static async updateLastListened(
    userId: string,
    stationId: number
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const existing = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, userId),
            eq(userStationPreferences.stationId, stationId)
          )
        );

      if (existing.length > 0) {
        await db
          .update(userStationPreferences)
          .set({
            lastListenedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userStationPreferences.userId, userId),
              eq(userStationPreferences.stationId, stationId)
            )
          );
      } else {
        await db.insert(userStationPreferences).values({
          userId,
          stationId,
          isFavorite: 0,
          lastListenedAt: new Date(),
          totalListenTime: 0,
        });
      }

      return true;
    } catch (error) {
      console.error(
        `Error updating last listened for user ${userId}, station ${stationId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Add listen time to a station
   */
  static async addListenTime(
    userId: string,
    stationId: number,
    seconds: number
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const existing = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, userId),
            eq(userStationPreferences.stationId, stationId)
          )
        );

      if (existing.length > 0) {
        const newTotalTime = (existing[0].totalListenTime || 0) + seconds;
        await db
          .update(userStationPreferences)
          .set({
            totalListenTime: newTotalTime,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userStationPreferences.userId, userId),
              eq(userStationPreferences.stationId, stationId)
            )
          );
      } else {
        await db.insert(userStationPreferences).values({
          userId,
          stationId,
          isFavorite: 0,
          totalListenTime: seconds,
        });
      }

      return true;
    } catch (error) {
      console.error(
        `Error adding listen time for user ${userId}, station ${stationId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get most listened stations
   */
  static async getMostListenedStations(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const stations = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, userId))
        .orderBy((t) => t.totalListenTime);

      return stations.slice(0, limit);
    } catch (error) {
      console.error(`Error getting most listened stations for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get recently listened stations
   */
  static async getRecentlyListenedStations(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const stations = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, userId))
        .orderBy((t) => t.lastListenedAt);

      return stations.slice(0, limit);
    } catch (error) {
      console.error(
        `Error getting recently listened stations for user ${userId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get user listening stats
   */
  static async getListeningStats(userId: string): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const preferences = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, userId));

      const totalListenTime = preferences.reduce(
        (sum, p) => sum + (p.totalListenTime || 0),
        0
      );
      const favoriteCount = preferences.filter((p) => p.isFavorite).length;
      const stationsListened = preferences.length;

      return {
        totalListenTime,
        favoriteCount,
        stationsListened,
        averageListenTimePerStation:
          stationsListened > 0 ? Math.round(totalListenTime / stationsListened) : 0,
      };
    } catch (error) {
      console.error(`Error getting listening stats for user ${userId}:`, error);
      return {
        totalListenTime: 0,
        favoriteCount: 0,
        stationsListened: 0,
        averageListenTimePerStation: 0,
      };
    }
  }

  /**
   * Delete user preferences for a station
   */
  static async deletePreference(
    userId: string,
    stationId: number
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      await db
        .delete(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, userId),
            eq(userStationPreferences.stationId, stationId)
          )
        );

      return true;
    } catch (error) {
      console.error(
        `Error deleting preference for user ${userId}, station ${stationId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Export user preferences (for backup/migration)
   */
  static async exportPreferences(userId: string): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const preferences = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, userId));

      return {
        userId,
        exportedAt: new Date(),
        preferences,
        stats: await this.getListeningStats(userId),
      };
    } catch (error) {
      console.error(`Error exporting preferences for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Import user preferences (for restore/migration)
   */
  static async importPreferences(
    userId: string,
    preferences: UserPreferences[]
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      for (const pref of preferences) {
        await db.insert(userStationPreferences).values({
          userId,
          stationId: pref.stationId,
          isFavorite: pref.isFavorite ? 1 : 0,
          lastListenedAt: pref.lastListenedAt,
          totalListenTime: pref.totalListenTime,
        });
      }

      return true;
    } catch (error) {
      console.error(`Error importing preferences for user ${userId}:`, error);
      return false;
    }
  }
}

export default UserPreferencesService;
