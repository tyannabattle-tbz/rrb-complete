import { storagePut, storageGet } from '../storage';

export interface ShowRecording {
  id: string;
  showId: string;
  channelId: string;
  djName: string;
  title: string;
  description: string;
  recordingUrl: string;
  duration: number;
  fileSize: number;
  recordedAt: number;
  uploadedAt: number;
  listenerCount: number;
  tags: string[];
  isPublished: boolean;
}

export interface ShowArchive {
  id: string;
  channelId: string;
  shows: ShowRecording[];
  createdAt: number;
  updatedAt: number;
}

class ArchiveService {
  private archives: Map<string, ShowArchive> = new Map();
  private recordings: Map<string, ShowRecording> = new Map();

  // Create or get archive for channel
  getOrCreateArchive(channelId: string): ShowArchive {
    if (!this.archives.has(channelId)) {
      const archive: ShowArchive = {
        id: `archive-${channelId}`,
        channelId,
        shows: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.archives.set(channelId, archive);
    }
    return this.archives.get(channelId)!;
  }

  // Add recording to archive
  async addRecording(
    showId: string,
    channelId: string,
    djName: string,
    title: string,
    description: string,
    audioBuffer: Buffer,
    duration: number,
    listenerCount: number,
    tags: string[] = []
  ): Promise<ShowRecording> {
    const recordingId = `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileKey = `shows/${channelId}/${recordingId}.mp3`;

    // Upload to S3
    const { url: recordingUrl } = await storagePut(fileKey, audioBuffer, 'audio/mpeg');

    const recording: ShowRecording = {
      id: recordingId,
      showId,
      channelId,
      djName,
      title,
      description,
      recordingUrl,
      duration,
      fileSize: audioBuffer.length,
      recordedAt: Date.now(),
      uploadedAt: Date.now(),
      listenerCount,
      tags,
      isPublished: true,
    };

    this.recordings.set(recordingId, recording);

    // Add to archive
    const archive = this.getOrCreateArchive(channelId);
    archive.shows.push(recording);
    archive.updatedAt = Date.now();

    return recording;
  }

  // Get recordings for channel
  getChannelRecordings(channelId: string, limit: number = 50): ShowRecording[] {
    const archive = this.archives.get(channelId);
    if (!archive) return [];
    return archive.shows.slice(-limit).reverse();
  }

  // Get recording by ID
  getRecording(recordingId: string): ShowRecording | undefined {
    return this.recordings.get(recordingId);
  }

  // Get all recordings
  getAllRecordings(limit: number = 100): ShowRecording[] {
    return Array.from(this.recordings.values())
      .sort((a, b) => b.recordedAt - a.recordedAt)
      .slice(0, limit);
  }

  // Search recordings
  searchRecordings(query: string): ShowRecording[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.recordings.values()).filter(
      rec =>
        rec.title.toLowerCase().includes(lowerQuery) ||
        rec.description.toLowerCase().includes(lowerQuery) ||
        rec.djName.toLowerCase().includes(lowerQuery) ||
        rec.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get trending shows (by listener count)
  getTrendingShows(limit: number = 10): ShowRecording[] {
    return Array.from(this.recordings.values())
      .sort((a, b) => b.listenerCount - a.listenerCount)
      .slice(0, limit);
  }

  // Get recent shows
  getRecentShows(limit: number = 10): ShowRecording[] {
    return Array.from(this.recordings.values())
      .sort((a, b) => b.recordedAt - a.recordedAt)
      .slice(0, limit);
  }

  // Delete recording
  deleteRecording(recordingId: string): boolean {
    const recording = this.recordings.get(recordingId);
    if (!recording) return false;

    // Remove from archive
    const archive = this.archives.get(recording.channelId);
    if (archive) {
      archive.shows = archive.shows.filter(s => s.id !== recordingId);
      archive.updatedAt = Date.now();
    }

    this.recordings.delete(recordingId);
    return true;
  }

  // Get archive statistics
  getArchiveStats(channelId: string) {
    const archive = this.getOrCreateArchive(channelId);
    const shows = archive.shows;

    return {
      totalShows: shows.length,
      totalDuration: shows.reduce((sum, s) => sum + s.duration, 0),
      totalListeners: shows.reduce((sum, s) => sum + s.listenerCount, 0),
      averageListeners: shows.length > 0 ? Math.floor(shows.reduce((sum, s) => sum + s.listenerCount, 0) / shows.length) : 0,
      mostPopularShow: shows.length > 0 ? shows.reduce((max, s) => (s.listenerCount > max.listenerCount ? s : max)) : null,
    };
  }
}

// Export singleton instance
export const archiveService = new ArchiveService();
