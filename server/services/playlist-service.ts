/**
 * Playlist Management Service
 * Create, edit, and manage video playlists
 * A Canryn Production
 */

interface PlaylistVideo {
  videoId: string;
  title: string;
  duration: number;
  order: number;
}

interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  videos: PlaylistVideo[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

const playlists = new Map<string, Playlist>();
const userPlaylists = new Map<string, string[]>();

export const playlistService = {
  createPlaylist(userId: string, name: string, description?: string): Playlist {
    const playlistId = `pl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const playlist: Playlist = {
      id: playlistId,
      userId,
      name,
      description,
      videos: [],
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    playlists.set(playlistId, playlist);
    if (!userPlaylists.has(userId)) {
      userPlaylists.set(userId, []);
    }
    userPlaylists.get(userId)!.push(playlistId);

    return playlist;
  },

  getPlaylist(playlistId: string): Playlist | null {
    return playlists.get(playlistId) || null;
  },

  getUserPlaylists(userId: string): Playlist[] {
    const playlistIds = userPlaylists.get(userId) || [];
    return playlistIds
      .map(id => playlists.get(id))
      .filter((p): p is Playlist => p !== undefined);
  },

  addVideoToPlaylist(playlistId: string, videoId: string, title: string, duration: number): Playlist | null {
    const playlist = playlists.get(playlistId);
    if (!playlist) return null;

    const order = playlist.videos.length + 1;
    playlist.videos.push({ videoId, title, duration, order });
    playlist.updatedAt = Date.now();

    return playlist;
  },

  removeVideoFromPlaylist(playlistId: string, videoId: string): Playlist | null {
    const playlist = playlists.get(playlistId);
    if (!playlist) return null;

    const index = playlist.videos.findIndex(v => v.videoId === videoId);
    if (index > -1) {
      playlist.videos.splice(index, 1);
      playlist.videos.forEach((v, i) => {
        v.order = i + 1;
      });
      playlist.updatedAt = Date.now();
    }

    return playlist;
  },

  reorderPlaylistVideos(playlistId: string, videoOrder: string[]): Playlist | null {
    const playlist = playlists.get(playlistId);
    if (!playlist) return null;

    const newVideos: PlaylistVideo[] = [];
    videoOrder.forEach((videoId, index) => {
      const video = playlist.videos.find(v => v.videoId === videoId);
      if (video) {
        newVideos.push({ ...video, order: index + 1 });
      }
    });

    playlist.videos = newVideos;
    playlist.updatedAt = Date.now();

    return playlist;
  },

  updatePlaylist(playlistId: string, updates: { name?: string; description?: string; isPublic?: boolean; thumbnail?: string }): Playlist | null {
    const playlist = playlists.get(playlistId);
    if (!playlist) return null;

    if (updates.name) playlist.name = updates.name;
    if (updates.description !== undefined) playlist.description = updates.description;
    if (updates.isPublic !== undefined) playlist.isPublic = updates.isPublic;
    if (updates.thumbnail) playlist.thumbnail = updates.thumbnail;
    playlist.updatedAt = Date.now();

    return playlist;
  },

  deletePlaylist(playlistId: string): boolean {
    const playlist = playlists.get(playlistId);
    if (!playlist) return false;

    playlists.delete(playlistId);
    const userIds = userPlaylists.get(playlist.userId);
    if (userIds) {
      const index = userIds.indexOf(playlistId);
      if (index > -1) {
        userIds.splice(index, 1);
      }
    }

    return true;
  },

  getPublicPlaylists(limit: number = 20): Playlist[] {
    return Array.from(playlists.values())
      .filter(p => p.isPublic)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },

  searchPlaylists(query: string): Playlist[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(playlists.values()).filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    );
  },

  getPlaylistStats(playlistId: string) {
    const playlist = playlists.get(playlistId);
    if (!playlist) return null;

    const totalDuration = playlist.videos.reduce((sum, v) => sum + v.duration, 0);
    const videoCount = playlist.videos.length;

    return {
      videoCount,
      totalDuration,
      averageVideoDuration: videoCount > 0 ? totalDuration / videoCount : 0,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    };
  },
};
