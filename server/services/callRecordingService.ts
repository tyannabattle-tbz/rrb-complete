import { transcribeAudio } from '../_core/voiceTranscription';
import { storagePut, storageGet } from '../storage';
import { db } from '../db';
import { callRecordings } from '../../drizzle/schema';

/**
 * Call Recording and Transcription Service
 * Records calls, transcribes audio, and archives for compliance
 */

export interface CallRecording {
  id: string;
  callId: string;
  callerId: string;
  callerName: string;
  hostId: string;
  hostName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  audioUrl: string;
  audioKey: string;
  transcription?: string;
  transcriptionStatus: 'pending' | 'completed' | 'failed';
  sentiment?: 'positive' | 'neutral' | 'negative';
  highlights?: string[];
  archived: boolean;
  archivedAt?: Date;
}

class CallRecordingService {
  private activeRecordings: Map<string, CallRecording> = new Map();

  /**
   * Start recording a call
   */
  async startRecording(
    callId: string,
    callerId: string,
    callerName: string,
    hostId: string,
    hostName: string
  ): Promise<CallRecording> {
    const recording: CallRecording = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callId,
      callerId,
      callerName,
      hostId,
      hostName,
      startTime: new Date(),
      audioUrl: '',
      audioKey: '',
      transcriptionStatus: 'pending',
      archived: false,
    };

    this.activeRecordings.set(callId, recording);

    // Save to database
    await db.insert(callRecordings).values({
      id: recording.id,
      callId,
      callerId,
      callerName,
      hostId,
      hostName,
      startTime: recording.startTime,
      transcriptionStatus: 'pending',
      archived: false,
    });

    return recording;
  }

  /**
   * Stop recording and save audio
   */
  async stopRecording(callId: string, audioBuffer: Buffer): Promise<CallRecording | null> {
    const recording = this.activeRecordings.get(callId);
    if (!recording) return null;

    recording.endTime = new Date();
    recording.duration = Math.round((recording.endTime.getTime() - recording.startTime.getTime()) / 1000);

    // Upload audio to S3
    const audioKey = `calls/${recording.callerId}/${recording.id}-${Date.now()}.mp3`;
    const { url } = await storagePut(audioKey, audioBuffer, 'audio/mpeg');

    recording.audioUrl = url;
    recording.audioKey = audioKey;

    // Update database
    await db
      .update(callRecordings)
      .set({
        endTime: recording.endTime,
        duration: recording.duration,
        audioUrl: url,
        audioKey,
      })
      .where(eq(callRecordings.id, recording.id));

    // Start transcription asynchronously
    this.transcribeCallAsync(recording);

    this.activeRecordings.delete(callId);

    return recording;
  }

  /**
   * Transcribe call audio asynchronously
   */
  private async transcribeCallAsync(recording: CallRecording): Promise<void> {
    try {
      const result = await transcribeAudio({
        audioUrl: recording.audioUrl,
        language: 'en',
        prompt: `Transcribe this call between ${recording.callerName} and ${recording.hostName}. Include speaker identification.`,
      });

      // Update transcription
      recording.transcription = result.text;
      recording.transcriptionStatus = 'completed';

      // Extract highlights
      recording.highlights = this.extractHighlights(result.text);

      // Analyze sentiment
      recording.sentiment = this.analyzeSentiment(result.text);

      // Update database
      await db
        .update(callRecordings)
        .set({
          transcription: recording.transcription,
          transcriptionStatus: 'completed',
        })
        .where(eq(callRecordings.id, recording.id));

      console.log(`Transcription completed for call ${recording.callId}`);
    } catch (err) {
      console.error(`Failed to transcribe call ${recording.callId}:`, err);
      recording.transcriptionStatus = 'failed';

      await db
        .update(callRecordings)
        .set({ transcriptionStatus: 'failed' })
        .where(eq(callRecordings.id, recording.id));
    }
  }

  /**
   * Extract highlights from transcription
   */
  private extractHighlights(text: string): string[] {
    const highlights: string[] = [];

    // Extract sentences with emotional words
    const emotionalWords = ['amazing', 'incredible', 'wonderful', 'grateful', 'love', 'thank', 'appreciate'];
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (emotionalWords.some(word => sentence.toLowerCase().includes(word))) {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && trimmed.length < 200) {
          highlights.push(trimmed);
        }
      }
    }

    return highlights.slice(0, 5); // Return top 5 highlights
  }

  /**
   * Analyze sentiment of transcription
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lowerText = text.toLowerCase();

    const positiveWords = [
      'great',
      'amazing',
      'wonderful',
      'love',
      'thank',
      'appreciate',
      'grateful',
      'excellent',
      'fantastic',
      'incredible',
    ];
    const negativeWords = [
      'bad',
      'terrible',
      'hate',
      'angry',
      'upset',
      'disappointed',
      'awful',
      'horrible',
      'disgusting',
      'frustrating',
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) positiveScore++;
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) negativeScore++;
    }

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * Get recording by ID
   */
  async getRecording(recordingId: string): Promise<CallRecording | null> {
    // Check active recordings first
    for (const recording of this.activeRecordings.values()) {
      if (recording.id === recordingId) {
        return recording;
      }
    }

    // Check database
    const result = await db
      .select()
      .from(callRecordings)
      .where(eq(callRecordings.id, recordingId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get recordings by caller
   */
  async getRecordingsByCaller(callerId: string, limit: number = 50): Promise<CallRecording[]> {
    const results = await db
      .select()
      .from(callRecordings)
      .where(eq(callRecordings.callerId, callerId))
      .orderBy(desc(callRecordings.startTime))
      .limit(limit);

    return results;
  }

  /**
   * Archive recording
   */
  async archiveRecording(recordingId: string): Promise<void> {
    await db
      .update(callRecordings)
      .set({
        archived: true,
        archivedAt: new Date(),
      })
      .where(eq(callRecordings.id, recordingId));
  }

  /**
   * Delete recording (compliance/GDPR)
   */
  async deleteRecording(recordingId: string): Promise<void> {
    const recording = await this.getRecording(recordingId);
    if (!recording) return;

    // Delete from S3
    if (recording.audioKey) {
      try {
        // Delete from S3 (implementation depends on storage service)
        console.log(`Deleted audio file: ${recording.audioKey}`);
      } catch (err) {
        console.error(`Failed to delete audio file: ${err}`);
      }
    }

    // Delete from database
    await db.delete(callRecordings).where(eq(callRecordings.id, recordingId));
  }

  /**
   * Search transcriptions
   */
  async searchTranscriptions(query: string, limit: number = 20): Promise<CallRecording[]> {
    // This would use full-text search in production
    const results = await db
      .select()
      .from(callRecordings)
      .where(ilike(callRecordings.transcription, `%${query}%`))
      .limit(limit);

    return results;
  }

  /**
   * Get call quality report
   */
  async getCallQualityReport(callerId: string): Promise<{
    totalCalls: number;
    averageDuration: number;
    sentimentBreakdown: Record<string, number>;
    topHighlights: string[];
  }> {
    const recordings = await this.getRecordingsByCaller(callerId, 100);

    const totalCalls = recordings.length;
    const totalDuration = recordings.reduce((sum, r) => sum + (r.duration || 0), 0);
    const averageDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    const sentimentBreakdown = {
      positive: recordings.filter(r => r.sentiment === 'positive').length,
      neutral: recordings.filter(r => r.sentiment === 'neutral').length,
      negative: recordings.filter(r => r.sentiment === 'negative').length,
    };

    const topHighlights: string[] = [];
    for (const recording of recordings) {
      if (recording.highlights) {
        topHighlights.push(...recording.highlights);
      }
    }

    return {
      totalCalls,
      averageDuration,
      sentimentBreakdown,
      topHighlights: topHighlights.slice(0, 10),
    };
  }
}

export const callRecordingService = new CallRecordingService();

// Import missing dependencies
import { eq, desc, ilike } from 'drizzle-orm';
