/**
 * Playlist Management Service
 * Handles creation, editing, and management of user playlists
 */

interface PlaylistEpisode {
  episodeId: string;
  title: string;
  artist: string;
  duration: number;
  streamUrl: string;
  addedAt: number;
  order: number;
}

interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string;
  episodes: PlaylistEpisode[];
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  coverImageUrl?: string;
}

// In-memory storage (replace with database in production)
const playlists = new Map<string, Playlist>();
let playlistIdCounter = 1;

/**
 * Create a new playlist
 */
export function createPlaylist(
  userId: string,
  name: string,
  description = ""
): Playlist {
  const id = `playlist-${playlistIdCounter++}`;
  const now = Date.now();

  const playlist: Playlist = {
    id,
    userId,
    name,
    description,
    episodes: [],
    createdAt: now,
    updatedAt: now,
    isPublic: false,
  };

  playlists.set(id, playlist);
  return playlist;
}

/**
 * Get playlist by ID
 */
export function getPlaylist(playlistId: string): Playlist | null {
  return playlists.get(playlistId) || null;
}

/**
 * Get all playlists for a user
 */
export function getUserPlaylists(userId: string): Playlist[] {
  return Array.from(playlists.values()).filter((p) => p.userId === userId);
}

/**
 * Add episode to playlist
 */
export function addEpisodeToPlaylist(
  playlistId: string,
  episodeId: string,
  title: string,
  artist: string,
  duration: number,
  streamUrl: string
): Playlist | null {
  const playlist = playlists.get(playlistId);
  if (!playlist) return null;

  const order = playlist.episodes.length;
  const episode: PlaylistEpisode = {
    episodeId,
    title,
    artist,
    duration,
    streamUrl,
    addedAt: Date.now(),
    order,
  };

  playlist.episodes.push(episode);
  playlist.updatedAt = Date.now();

  return playlist;
}

/**
 * Remove episode from playlist
 */
export function removeEpisodeFromPlaylist(
  playlistId: string,
  episodeId: string
): Playlist | null {
  const playlist = playlists.get(playlistId);
  if (!playlist) return null;

  playlist.episodes = playlist.episodes.filter((e) => e.episodeId !== episodeId);

  // Reorder remaining episodes
  playlist.episodes.forEach((e, i) => {
    e.order = i;
  });

  playlist.updatedAt = Date.now();
  return playlist;
}

/**
 * Reorder episodes in playlist
 */
export function reorderPlaylistEpisodes(
  playlistId: string,
  episodeIds: string[]
): Playlist | null {
  const playlist = playlists.get(playlistId);
  if (!playlist) return null;

  const episodeMap = new Map(playlist.episodes.map((e) => [e.episodeId, e]));
  const reorderedEpisodes: PlaylistEpisode[] = [];

  for (let i = 0; i < episodeIds.length; i++) {
    const episode = episodeMap.get(episodeIds[i]);
    if (episode) {
      episode.order = i;
      reorderedEpisodes.push(episode);
    }
  }

  playlist.episodes = reorderedEpisodes;
  playlist.updatedAt = Date.now();

  return playlist;
}

/**
 * Update playlist metadata
 */
export function updatePlaylist(
  playlistId: string,
  updates: Partial<Pick<Playlist, "name" | "description" | "isPublic" | "coverImageUrl">>
): Playlist | null {
  const playlist = playlists.get(playlistId);
  if (!playlist) return null;

  if (updates.name) playlist.name = updates.name;
  if (updates.description) playlist.description = updates.description;
  if (typeof updates.isPublic === "boolean") playlist.isPublic = updates.isPublic;
  if (updates.coverImageUrl) playlist.coverImageUrl = updates.coverImageUrl;

  playlist.updatedAt = Date.now();
  return playlist;
}

/**
 * Delete playlist
 */
export function deletePlaylist(playlistId: string): boolean {
  return playlists.delete(playlistId);
}

/**
 * Duplicate playlist
 */
export function duplicatePlaylist(playlistId: string, userId: string): Playlist | null {
  const original = playlists.get(playlistId);
  if (!original) return null;

  const newPlaylist = createPlaylist(userId, `${original.name} (Copy)`, original.description);

  // Copy episodes
  newPlaylist.episodes = original.episodes.map((e, i) => ({
    ...e,
    addedAt: Date.now(),
    order: i,
  }));

  newPlaylist.coverImageUrl = original.coverImageUrl;
  playlists.set(newPlaylist.id, newPlaylist);

  return newPlaylist;
}

/**
 * Get playlist statistics
 */
export function getPlaylistStats(playlistId: string) {
  const playlist = playlists.get(playlistId);
  if (!playlist) return null;

  const totalDuration = playlist.episodes.reduce((sum, e) => sum + e.duration, 0);
  const totalEpisodes = playlist.episodes.length;

  return {
    playlistId,
    totalEpisodes,
    totalDuration,
    averageDuration: totalEpisodes > 0 ? totalDuration / totalEpisodes : 0,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  };
}
