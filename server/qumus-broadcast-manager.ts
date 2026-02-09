/**
 * QUMUS Broadcast Manager
 * Broadcast scheduling and music management service
 * Handles broadcast lifecycle, playlists, and commercial insertion
 */

import { getDb } from './db';
import {
  broadcastSchedules,
  musicTracks,
  musicPlaylists,
  playlistTracks,
  commercialBreaks,
  commercials,
  broadcastAuditLog,
} from '../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface BroadcastScheduleInput {
  title: string;
  description?: string;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  broadcastType: 'live' | 'prerecorded' | 'streaming' | 'podcast' | 'radio' | 'video';
  channels: string[];
  createdBy?: number;
}

interface MusicTrackInput {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  genre?: string;
  releaseDate?: Date;
  fileUrl: string;
  coverArtUrl?: string;
  isrc?: string;
  rights?: string;
}

interface PlaylistInput {
  name: string;
  description?: string;
  createdBy?: number;
  isPublic?: boolean;
}

/**
 * Create new broadcast schedule
 */
export async function createBroadcastSchedule(
  input: BroadcastScheduleInput
) {
  try {
    const broadcastId = `broadcast_${Date.now()}`;

    const db = await getDb();
    const result = await db.insert(broadcastSchedules).values({
      broadcastId,
      title: input.title,
      description: input.description,
      scheduledStartTime: input.scheduledStartTime,
      scheduledEndTime: input.scheduledEndTime,
      status: 'scheduled',
      broadcastType: input.broadcastType,
      channels: input.channels,
      createdBy: input.createdBy,
      autonomousScheduling: true,
    });

    // Log audit
    await db.insert(broadcastAuditLog).values({
      auditId: `audit_${Date.now()}`,
      broadcastId,
      action: 'broadcast_scheduled',
      performedBy: input.createdBy,
      details: {
        title: input.title,
        type: input.broadcastType,
        channels: input.channels,
      },
      complianceStatus: 'compliant',
    });

    return {
      success: true,
      broadcastId,
      message: `Broadcast scheduled: ${input.title}`,
    };
  } catch (error) {
    console.error('Error creating broadcast schedule:', error);
    return {
      success: false,
      message: 'Failed to create broadcast schedule',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get broadcast schedule
 */
export async function getBroadcastSchedule(broadcastId: string) {
  try {
    const broadcast = await db
      .select()
      .from(broadcastSchedules)
      .where(eq(broadcastSchedules.broadcastId, broadcastId))
      .limit(1);

    if (broadcast.length === 0) {
      return {
        success: false,
        message: `Broadcast not found: ${broadcastId}`,
      };
    }

    return {
      success: true,
      broadcast: broadcast[0],
    };
  } catch (error) {
    console.error('Error fetching broadcast schedule:', error);
    return {
      success: false,
      message: 'Failed to fetch broadcast schedule',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update broadcast status
 */
export async function updateBroadcastStatus(
  broadcastId: string,
  status: 'scheduled' | 'live' | 'completed' | 'cancelled' | 'paused',
  userId?: number
) {
  try {
    const updateData: any = { status };

    if (status === 'live') {
      updateData.actualStartTime = new Date();
    } else if (status === 'completed') {
      updateData.actualEndTime = new Date();
    }

    await db
      .update(broadcastSchedules)
      .set(updateData)
      .where(eq(broadcastSchedules.broadcastId, broadcastId));

    // Log audit
    await db.insert(broadcastAuditLog).values({
      auditId: `audit_${Date.now()}`,
      broadcastId,
      action: `broadcast_${status}`,
      performedBy: userId,
      complianceStatus: 'compliant',
    });

    return {
      success: true,
      message: `Broadcast status updated to: ${status}`,
    };
  } catch (error) {
    console.error('Error updating broadcast status:', error);
    return {
      success: false,
      message: 'Failed to update broadcast status',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get upcoming broadcasts
 */
export async function getUpcomingBroadcasts(limit: number = 10) {
  try {
    const now = new Date();

    const broadcasts = await db
      .select()
      .from(broadcastSchedules)
      .where(
        and(
          gte(broadcastSchedules.scheduledStartTime, now),
          eq(broadcastSchedules.status, 'scheduled')
        )
      )
      .limit(limit);

    return {
      success: true,
      broadcasts,
      count: broadcasts.length,
    };
  } catch (error) {
    console.error('Error fetching upcoming broadcasts:', error);
    return {
      success: false,
      message: 'Failed to fetch upcoming broadcasts',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add music track
 */
export async function addMusicTrack(input: MusicTrackInput) {
  try {
    const trackId = `track_${Date.now()}`;

    const db = await getDb();
    const result = await db.insert(musicTracks).values({
      trackId,
      title: input.title,
      artist: input.artist,
      album: input.album,
      duration: input.duration,
      genre: input.genre,
      releaseDate: input.releaseDate,
      fileUrl: input.fileUrl,
      coverArtUrl: input.coverArtUrl,
      isrc: input.isrc,
      rights: input.rights,
    });

    return {
      success: true,
      trackId,
      message: `Track added: ${input.title} by ${input.artist}`,
    };
  } catch (error) {
    console.error('Error adding music track:', error);
    return {
      success: false,
      message: 'Failed to add music track',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create playlist
 */
export async function createPlaylist(input: PlaylistInput) {
  try {
    const playlistId = `playlist_${Date.now()}`;

    const db = await getDb();
    const result = await db.insert(musicPlaylists).values({
      playlistId,
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
      isPublic: input.isPublic || false,
      trackCount: 0,
      totalDuration: 0,
    });

    return {
      success: true,
      playlistId,
      message: `Playlist created: ${input.name}`,
    };
  } catch (error) {
    console.error('Error creating playlist:', error);
    return {
      success: false,
      message: 'Failed to create playlist',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add track to playlist
 */
export async function addTrackToPlaylist(
  playlistId: number,
  trackId: number,
  position?: number
) {
  try {
    // Get current track count
    const playlist = await db
      .select()
      .from(musicPlaylists)
      .where(eq(musicPlaylists.id, playlistId))
      .limit(1);

    if (playlist.length === 0) {
      return {
        success: false,
        message: 'Playlist not found',
      };
    }

    const pos = position || (playlist[0].trackCount || 0) + 1;

    // Get track duration
    const track = await db
      .select()
      .from(musicTracks)
      .where(eq(musicTracks.id, trackId))
      .limit(1);

    if (track.length === 0) {
      return {
        success: false,
        message: 'Track not found',
      };
    }

    // Add track to playlist
    await db.insert(playlistTracks).values({
      playlistId,
      trackId,
      position: pos,
    });

    // Update playlist metadata
    const newDuration = (playlist[0].totalDuration || 0) + track[0].duration;
    const newCount = (playlist[0].trackCount || 0) + 1;

    await db
      .update(musicPlaylists)
      .set({
        trackCount: newCount,
        totalDuration: newDuration,
      })
      .where(eq(musicPlaylists.id, playlistId));

    return {
      success: true,
      message: `Track added to playlist at position ${pos}`,
      data: {
        playlistId,
        trackId,
        position: pos,
        newCount,
        newDuration,
      },
    };
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return {
      success: false,
      message: 'Failed to add track to playlist',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get playlist with tracks
 */
export async function getPlaylistWithTracks(playlistId: number) {
  try {
    const playlist = await db
      .select()
      .from(musicPlaylists)
      .where(eq(musicPlaylists.id, playlistId))
      .limit(1);

    if (playlist.length === 0) {
      return {
        success: false,
        message: 'Playlist not found',
      };
    }

    const tracks = await db
      .select()
      .from(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId));

    return {
      success: true,
      playlist: playlist[0],
      tracks,
      trackCount: tracks.length,
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return {
      success: false,
      message: 'Failed to fetch playlist',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Schedule commercial break
 */
export async function scheduleCommercialBreak(
  broadcastId: string,
  scheduledTime: Date,
  duration: number,
  userId?: number
) {
  try {
    const breakId = `break_${Date.now()}`;

    await db.insert(commercialBreaks).values({
      breakId,
      broadcastId,
      scheduledTime,
      duration,
      status: 'scheduled',
    });

    // Log audit
    await db.insert(broadcastAuditLog).values({
      auditId: `audit_${Date.now()}`,
      broadcastId,
      action: 'commercial_break_scheduled',
      performedBy: userId,
      details: {
        breakId,
        duration,
        scheduledTime,
      },
      complianceStatus: 'compliant',
    });

    return {
      success: true,
      breakId,
      message: `Commercial break scheduled for ${duration}s`,
    };
  } catch (error) {
    console.error('Error scheduling commercial break:', error);
    return {
      success: false,
      message: 'Failed to schedule commercial break',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add commercial to break
 */
export async function addCommercialToBreak(
  breakId: string,
  commercialId: number
) {
  try {
    // Get commercial
    const commercial = await db
      .select()
      .from(commercials)
      .where(eq(commercials.id, commercialId))
      .limit(1);

    if (commercial.length === 0) {
      return {
        success: false,
        message: 'Commercial not found',
      };
    }

    // Get break
    const breakData = await db
      .select()
      .from(commercialBreaks)
      .where(eq(commercialBreaks.breakId, breakId))
      .limit(1);

    if (breakData.length === 0) {
      return {
        success: false,
        message: 'Commercial break not found',
      };
    }

    // Update break
    const newCount = (breakData[0].commercialCount || 0) + 1;
    const newValue = (breakData[0].totalValue || 0) + commercial[0].rate;

    await db
      .update(commercialBreaks)
      .set({
        commercialCount: newCount,
        totalValue: newValue,
      })
      .where(eq(commercialBreaks.breakId, breakId));

    return {
      success: true,
      message: `Commercial added to break`,
      data: {
        breakId,
        commercialId,
        newCount,
        newValue,
      },
    };
  } catch (error) {
    console.error('Error adding commercial to break:', error);
    return {
      success: false,
      message: 'Failed to add commercial to break',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get broadcast audit log
 */
export async function getBroadcastAuditLog(
  broadcastId: string,
  limit: number = 50
) {
  try {
    const logs = await db
      .select()
      .from(broadcastAuditLog)
      .where(eq(broadcastAuditLog.broadcastId, broadcastId))
      .limit(limit);

    return {
      success: true,
      logs,
      count: logs.length,
    };
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return {
      success: false,
      message: 'Failed to fetch audit log',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  createBroadcastSchedule,
  getBroadcastSchedule,
  updateBroadcastStatus,
  getUpcomingBroadcasts,
  addMusicTrack,
  createPlaylist,
  addTrackToPlaylist,
  getPlaylistWithTracks,
  scheduleCommercialBreak,
  addCommercialToBreak,
  getBroadcastAuditLog,
};
