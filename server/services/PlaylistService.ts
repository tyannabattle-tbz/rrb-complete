import { db } from '../db';
import { playlists, playlistItems } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface PlaylistInput {
  name: string;
  description?: string;
  userId: string;
  isPublic?: boolean;
}

export interface PlaylistItemInput {
  playlistId: string;
  contentId: string;
  contentType: 'song' | 'podcast' | 'video';
  position: number;
}

export class PlaylistService {
  async createPlaylist(input: PlaylistInput) {
    const playlist = await db.insert(playlists).values({
      id: `pl_${Date.now()}`,
      name: input.name,
      description: input.description,
      userId: input.userId,
      isPublic: input.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return playlist[0];
  }

  async getPlaylistsByUser(userId: string) {
    return await db.query.playlists.findMany({
      where: eq(playlists.userId, userId),
      orderBy: (playlists, { desc }) => [desc(playlists.createdAt)],
    });
  }

  async getPlaylistById(playlistId: string) {
    return await db.query.playlists.findFirst({
      where: eq(playlists.id, playlistId),
      with: {
        items: {
          orderBy: (items, { asc }) => [asc(items.position)],
        },
      },
    });
  }

  async updatePlaylist(
    playlistId: string,
    userId: string,
    updates: Partial<PlaylistInput>
  ) {
    const playlist = await db
      .update(playlists)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(playlists.id, playlistId),
          eq(playlists.userId, userId)
        )
      )
      .returning();
    return playlist[0];
  }

  async deletePlaylist(playlistId: string, userId: string) {
    // Delete playlist items first
    await db
      .delete(playlistItems)
      .where(eq(playlistItems.playlistId, playlistId));

    // Delete playlist
    await db
      .delete(playlists)
      .where(
        and(
          eq(playlists.id, playlistId),
          eq(playlists.userId, userId)
        )
      );
  }

  async addItemToPlaylist(input: PlaylistItemInput) {
    const item = await db.insert(playlistItems).values({
      id: `pli_${Date.now()}`,
      playlistId: input.playlistId,
      contentId: input.contentId,
      contentType: input.contentType,
      position: input.position,
      addedAt: new Date(),
    }).returning();
    return item[0];
  }

  async removeItemFromPlaylist(itemId: string) {
    await db.delete(playlistItems).where(eq(playlistItems.id, itemId));
  }

  async reorderPlaylistItems(
    playlistId: string,
    items: Array<{ id: string; position: number }>
  ) {
    for (const item of items) {
      await db
        .update(playlistItems)
        .set({ position: item.position })
        .where(eq(playlistItems.id, item.id));
    }
  }

  async sharePlaylist(playlistId: string, userId: string) {
    return await db
      .update(playlists)
      .set({
        isPublic: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(playlists.id, playlistId),
          eq(playlists.userId, userId)
        )
      )
      .returning();
  }

  async getPublicPlaylists() {
    return await db.query.playlists.findMany({
      where: eq(playlists.isPublic, true),
      orderBy: (playlists, { desc }) => [desc(playlists.createdAt)],
    });
  }
}

export const playlistService = new PlaylistService();
