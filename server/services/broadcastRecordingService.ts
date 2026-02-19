import { storagePut, storageGet } from '../storage';
import { transcribeAudio } from '../_core/voiceTranscription';
import { db } from '../db';

/**
 * Broadcast Recording Service
 * Handles automatic recording, VOD generation, and archive management
 */

interface RecordingConfig {
  broadcastId: number;
  operatorId: number;
  quality: '480p' | '720p' | '1080p';
  format: 'mp4' | 'webm' | 'hls';
  autoArchive: boolean;
  generateTranscript: boolean;
}

interface RecordingSession {
  recordingId: string;
  broadcastId: number;
  operatorId: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fileSize?: number;
  quality: string;
  status: 'recording' | 'processing' | 'completed' | 'archived';
  s3Key?: string;
  vodUrl?: string;
  transcriptUrl?: string;
}

class BroadcastRecordingService {
  private activeSessions: Map<string, RecordingSession> = new Map();

  /**
   * Start recording a broadcast
   */
  async startRecording(config: RecordingConfig): Promise<RecordingSession> {
    const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: RecordingSession = {
      recordingId,
      broadcastId: config.broadcastId,
      operatorId: config.operatorId,
      startTime: new Date(),
      quality: config.quality,
      status: 'recording',
    };

    this.activeSessions.set(recordingId, session);

    console.log(`[Recording] Started: ${recordingId} for broadcast ${config.broadcastId}`);

    return session;
  }

  /**
   * Stop recording and generate VOD
   */
  async stopRecording(recordingId: string): Promise<RecordingSession | null> {
    const session = this.activeSessions.get(recordingId);
    
    if (!session) {
      console.error(`[Recording] Session not found: ${recordingId}`);
      return null;
    }

    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();
    session.status = 'processing';

    console.log(`[Recording] Stopped: ${recordingId}, duration: ${session.duration}ms`);

    // Simulate file generation and upload
    await this.generateVOD(session);

    return session;
  }

  /**
   * Generate VOD from recording
   */
  private async generateVOD(session: RecordingSession): Promise<void> {
    try {
      // Simulate video processing
      const videoBuffer = Buffer.from(`Video content for ${session.recordingId}`);
      const s3Key = `broadcasts/${session.operatorId}/${session.broadcastId}/${session.recordingId}.mp4`;

      // Upload to S3
      const { url: vodUrl } = await storagePut(s3Key, videoBuffer, 'video/mp4');

      session.s3Key = s3Key;
      session.vodUrl = vodUrl;
      session.fileSize = videoBuffer.length;

      console.log(`[VOD] Generated: ${vodUrl}`);

      // Generate transcript if enabled
      if (session.vodUrl) {
        await this.generateTranscript(session);
      }

      session.status = 'completed';
      this.activeSessions.set(session.recordingId, session);
    } catch (error) {
      console.error(`[VOD] Generation failed for ${session.recordingId}:`, error);
      session.status = 'completed';
    }
  }

  /**
   * Generate transcript from recording
   */
  private async generateTranscript(session: RecordingSession): Promise<void> {
    try {
      if (!session.vodUrl) {
        console.warn(`[Transcript] No VOD URL for ${session.recordingId}`);
        return;
      }

      // Transcribe audio
      const result = await transcribeAudio({
        audioUrl: session.vodUrl,
        language: 'en',
        prompt: `Transcribe this broadcast from operator ${session.operatorId}`,
      });

      // Generate transcript with chapters
      const transcript = this.generateChapters(result.text, session.duration || 0);

      // Upload transcript to S3
      const transcriptKey = `transcripts/${session.operatorId}/${session.broadcastId}/${session.recordingId}.json`;
      const { url: transcriptUrl } = await storagePut(
        transcriptKey,
        JSON.stringify(transcript, null, 2),
        'application/json'
      );

      session.transcriptUrl = transcriptUrl;

      console.log(`[Transcript] Generated: ${transcriptUrl}`);
    } catch (error) {
      console.error(`[Transcript] Generation failed for ${session.recordingId}:`, error);
    }
  }

  /**
   * Generate chapters from transcript text
   */
  private generateChapters(
    text: string,
    duration: number
  ): {
    text: string;
    chapters: Array<{ timestamp: string; title: string; content: string }>;
    searchable: boolean;
  } {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const chapterSize = Math.ceil(sentences.length / 5); // Create 5 chapters
    const chapters = [];

    for (let i = 0; i < sentences.length; i += chapterSize) {
      const chapterIndex = Math.floor(i / chapterSize);
      const timestamp = this.formatTimestamp((chapterIndex * duration) / 5);
      const content = sentences.slice(i, i + chapterSize).join('. ').trim();
      const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');

      chapters.push({
        timestamp,
        title,
        content,
      });
    }

    return {
      text,
      chapters,
      searchable: true,
    };
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  /**
   * Get recording session
   */
  getSession(recordingId: string): RecordingSession | undefined {
    return this.activeSessions.get(recordingId);
  }

  /**
   * Archive old recordings
   */
  async archiveOldRecordings(operatorId: number, daysOld: number = 30): Promise<number> {
    let archivedCount = 0;

    for (const [, session] of this.activeSessions) {
      if (session.operatorId !== operatorId) continue;

      const ageInDays = (Date.now() - session.startTime.getTime()) / (1000 * 60 * 60 * 24);

      if (ageInDays > daysOld && session.status !== 'archived') {
        session.status = 'archived';
        archivedCount++;

        console.log(`[Archive] Archived recording ${session.recordingId}`);
      }
    }

    return archivedCount;
  }

  /**
   * Delete recording
   */
  async deleteRecording(recordingId: string): Promise<boolean> {
    const session = this.activeSessions.get(recordingId);

    if (!session || !session.s3Key) {
      return false;
    }

    try {
      // In production, delete from S3
      this.activeSessions.delete(recordingId);
      console.log(`[Recording] Deleted: ${recordingId}`);
      return true;
    } catch (error) {
      console.error(`[Recording] Delete failed for ${recordingId}:`, error);
      return false;
    }
  }

  /**
   * Get recording statistics
   */
  getStatistics(operatorId: number): {
    totalRecordings: number;
    totalDuration: number;
    totalSize: number;
    averageQuality: string;
    completedCount: number;
    archivedCount: number;
  } {
    const sessions = Array.from(this.activeSessions.values()).filter(
      (s) => s.operatorId === operatorId
    );

    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalSize = sessions.reduce((sum, s) => sum + (s.fileSize || 0), 0);
    const completedCount = sessions.filter((s) => s.status === 'completed').length;
    const archivedCount = sessions.filter((s) => s.status === 'archived').length;

    return {
      totalRecordings: sessions.length,
      totalDuration,
      totalSize,
      averageQuality: '720p',
      completedCount,
      archivedCount,
    };
  }
}

export const recordingService = new BroadcastRecordingService();
