import { getDb } from '../db';
import { playlists, playlistTracks } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface CreatePlaylistInput {
  userId: number;
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdatePlaylistInput {
  id: number;
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddTrackToPlaylistInput {
  playlistId: number;
  trackId: string;
  position: number;
}

export class UserPlaylistService {
  /**
   * Create a new playlist for a user
   */
  static async createPlaylist(input: CreatePlaylistInput) {
    const db = await getDb();
    const result = await db.insert(playlists).values({
      userId: input.userId,
      name: input.name,
      description: input.description || '',
      isPublic: input.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return result[0];
  }

  /**
   * Get all playlists for a user
   */
  static async getUserPlaylists(userId: number) {
    const db = await getDb();
    return db.query.playlists.findMany({
      where: eq(playlists.userId, userId),
      orderBy: (p) => p.updatedAt,
    });
  }

  /**
   * Get a specific playlist with all tracks
   */
  static async getPlaylistWithTracks(playlistId: number, userId: number) {
    const db = await getDb();
    const playlist = await db.query.playlists.findFirst({
      where: and(
        eq(playlists.id, playlistId),
        eq(playlists.userId, userId)
      ),
    });

    if (!playlist) return null;

    const db2 = await getDb();
    const tracks = await db2.query.playlistTracks.findMany({
      where: eq(playlistTracks.playlistId, playlistId),
      orderBy: (t) => t.position,
    });

    return {
      ...playlist,
      tracks,
      trackCount: tracks.length,
    };
  }

  /**
   * Update playlist metadata
   */
  static async updatePlaylist(input: UpdatePlaylistInput, userId: number) {
    const db = await getDb();
    const result = await db
      .update(playlists)
      .set({
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(playlists.id, input.id),
          eq(playlists.userId, userId)
        )
      )
      .returning();

    return result[0];
  }

  /**
   * Delete a playlist
   */
  static async deletePlaylist(playlistId: number, userId: number) {
    // Delete all tracks in the playlist first
    const db = await getDb();
    await db
      .delete(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId));

    // Delete the playlist
    const db2 = await getDb();
    const result = await db2
      .delete(playlists)
      .where(
        and(
          eq(playlists.id, playlistId),
          eq(playlists.userId, userId)
        )
      )
      .returning();

    return result[0];
  }

  /**
   * Add a track to a playlist
   */
  static async addTrackToPlaylist(input: AddTrackToPlaylistInput) {
    const db = await getDb();
    const result = await db.insert(playlistTracks).values({
      playlistId: input.playlistId,
      trackId: input.trackId,
      position: input.position,
      addedAt: new Date(),
    }).returning();

    return result[0];
  }

  /**
   * Remove a track from a playlist
   */
  static async removeTrackFromPlaylist(playlistId: number, trackId: string) {
    const db = await getDb();
    const result = await db
      .delete(playlistTracks)
      .where(
        and(
          eq(playlistTracks.playlistId, playlistId),
          eq(playlistTracks.trackId, trackId)
        )
      )
      .returning();

    return result[0];
  }

  /**
   * Reorder tracks in a playlist
   */
  static async reorderTracks(
    playlistId: number,
    trackIds: string[]
  ) {
    // Update positions for all tracks
    const db = await getDb();
    const updates = trackIds.map((trackId, index) =>
      db
        .update(playlistTracks)
        .set({ position: index })
        .where(
          and(
            eq(playlistTracks.playlistId, playlistId),
            eq(playlistTracks.trackId, trackId)
          )
        )
    );

    await Promise.all(updates);

    return { success: true, trackCount: trackIds.length };
  }

  /**
   * Clear all tracks from a playlist
   */
  static async clearPlaylist(playlistId: number, userId: number) {
    // Verify ownership
    const db = await getDb();
    const playlist = await db.query.userPlaylists.findFirst({
      where: and(
        eq(userPlaylists.id, playlistId),
        eq(userPlaylists.userId, userId)
      ),
    });

    if (!playlist) throw new Error('Playlist not found');

    const db2 = await getDb();
    await db2
      .delete(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId));

    return { success: true };
  }

  /**
   * Get public playlists (for discovery)
   */
  static async getPublicPlaylists(limit = 20, offset = 0) {
    const db = await getDb();
    return db.query.playlists.findMany({
      where: eq(playlists.isPublic, true),
      limit,
      offset,
      orderBy: (playlists) => playlists.updatedAt,
    });
  }

  /**
   * Duplicate a playlist
   */
  static async duplicatePlaylist(
    sourcePlaylistId: number,
    userId: number,
    newName: string
  ) {
    // Get source playlist with tracks
    const source = await this.getPlaylistWithTracks(sourcePlaylistId, userId);
    if (!source) throw new Error('Source playlist not found');

    // Create new playlist
    const newPlaylist = await this.createPlaylist({
      userId,
      name: newName,
      description: source.description,
      isPublic: false,
    });

    // Copy all tracks
    for (const track of source.tracks) {
      await this.addTrackToPlaylist({
        playlistId: newPlaylist.id,
        trackId: track.trackId,
        position: track.position,
      });
    }

    return newPlaylist;
  }
}
