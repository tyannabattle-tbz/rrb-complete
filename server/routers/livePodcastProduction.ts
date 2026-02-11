import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import { storagePut } from "../storage";

/**
 * Live Podcast Production Router
 * Real-time editing tools for podcast production:
 * - Session management (start/stop/pause recording)
 * - Timeline markers (drop markers at key moments)
 * - Segment management (intro, discussion, break, outro, ad-read)
 * - Production notes (timestamped notes during recording)
 * - Sound board (stingers, transitions, jingles, SFX)
 * - Audio level monitoring
 * - Export with all metadata preserved
 * 
 * A Canryn Production system — QUMUS orchestrated
 */

// Types
interface ProductionMarker {
  id: string;
  timestamp: number; // seconds from session start
  label: string;
  type: 'highlight' | 'cut' | 'edit' | 'review' | 'keep' | 'remove';
  color: string;
  note?: string;
}

interface ProductionSegment {
  id: string;
  startTime: number;
  endTime: number | null; // null = still active
  type: 'intro' | 'discussion' | 'interview' | 'break' | 'ad-read' | 'music' | 'outro' | 'custom';
  label: string;
  status: 'active' | 'completed';
}

interface ProductionNote {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface SoundBoardTrigger {
  id: string;
  timestamp: number;
  soundId: string;
  soundName: string;
}

interface ProductionSession {
  sessionId: string;
  title: string;
  description: string;
  userId: string;
  status: 'preparing' | 'recording' | 'paused' | 'stopped' | 'exporting';
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedDuration: number;
  stoppedAt: number | null;
  markers: ProductionMarker[];
  segments: ProductionSegment[];
  notes: ProductionNote[];
  soundTriggers: SoundBoardTrigger[];
  guests: string[];
  tags: string[];
  episodeNumber?: number;
  season?: number;
  audioLevels: { timestamp: number; left: number; right: number }[];
}

// In-memory session store
const sessions: Map<string, ProductionSession> = new Map();

// Sound board presets
const SOUND_BOARD_PRESETS = [
  { id: 'transition-whoosh', name: 'Whoosh Transition', category: 'transitions', duration: 1.5, key: '1' },
  { id: 'transition-sweep', name: 'Sweep', category: 'transitions', duration: 2.0, key: '2' },
  { id: 'stinger-news', name: 'News Stinger', category: 'stingers', duration: 3.0, key: '3' },
  { id: 'stinger-break', name: 'Break Stinger', category: 'stingers', duration: 2.5, key: '4' },
  { id: 'jingle-rrb', name: 'RRB Jingle', category: 'jingles', duration: 5.0, key: '5' },
  { id: 'jingle-canryn', name: 'Canryn Jingle', category: 'jingles', duration: 4.0, key: '6' },
  { id: 'sfx-applause', name: 'Applause', category: 'sfx', duration: 3.0, key: '7' },
  { id: 'sfx-rimshot', name: 'Rimshot', category: 'sfx', duration: 1.0, key: '8' },
  { id: 'sfx-airhorn', name: 'Air Horn', category: 'sfx', duration: 2.0, key: '9' },
  { id: 'sfx-bell', name: 'Bell Ding', category: 'sfx', duration: 1.5, key: '0' },
  { id: 'music-bed-chill', name: 'Chill Music Bed', category: 'music-beds', duration: 30.0, key: 'q' },
  { id: 'music-bed-upbeat', name: 'Upbeat Music Bed', category: 'music-beds', duration: 30.0, key: 'w' },
  { id: 'music-bed-dramatic', name: 'Dramatic Music Bed', category: 'music-beds', duration: 30.0, key: 'e' },
  { id: 'countdown-3', name: '3-2-1 Countdown', category: 'utility', duration: 4.0, key: 'r' },
  { id: 'silence-2s', name: '2s Silence', category: 'utility', duration: 2.0, key: 't' },
  { id: 'tone-440', name: '440Hz Tone', category: 'utility', duration: 1.0, key: 'y' },
];

// Marker color presets
const MARKER_COLORS: Record<string, string> = {
  highlight: '#22c55e',
  cut: '#ef4444',
  edit: '#f59e0b',
  review: '#3b82f6',
  keep: '#10b981',
  remove: '#dc2626',
};

function getElapsedSeconds(session: ProductionSession): number {
  if (!session.startedAt) return 0;
  const now = session.status === 'stopped' && session.stoppedAt ? session.stoppedAt : Date.now();
  const pauseOffset = session.status === 'paused' && session.pausedAt
    ? Date.now() - session.pausedAt
    : 0;
  return Math.floor((now - session.startedAt - session.totalPausedDuration - pauseOffset) / 1000);
}

export const livePodcastProductionRouter = router({
  /**
   * Create a new production session
   */
  createSession: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().default(''),
      guests: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      episodeNumber: z.number().optional(),
      season: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const sessionId = `pod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const session: ProductionSession = {
        sessionId,
        title: input.title,
        description: input.description,
        userId: ctx.user.id.toString(),
        status: 'preparing',
        startedAt: null,
        pausedAt: null,
        totalPausedDuration: 0,
        stoppedAt: null,
        markers: [],
        segments: [],
        notes: [],
        soundTriggers: [],
        guests: input.guests,
        tags: input.tags,
        episodeNumber: input.episodeNumber,
        season: input.season,
        audioLevels: [],
      };
      sessions.set(sessionId, session);

      await notifyOwner({
        title: 'Podcast Session Created',
        content: `"${input.title}" — ready to record. ${input.guests.length > 0 ? `Guests: ${input.guests.join(', ')}` : 'Solo session'}`,
      });

      return { sessionId, status: 'preparing', message: 'Production session created. Ready to record.' };
    }),

  /**
   * Start recording
   */
  startRecording: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      if (session.status === 'paused') {
        // Resume from pause
        const pauseDuration = session.pausedAt ? Date.now() - session.pausedAt : 0;
        session.totalPausedDuration += pauseDuration;
        session.pausedAt = null;
        session.status = 'recording';
        return { status: 'recording', elapsed: getElapsedSeconds(session), message: 'Recording resumed' };
      }

      session.startedAt = Date.now();
      session.status = 'recording';

      // Auto-create intro segment
      session.segments.push({
        id: `seg_${Date.now()}`,
        startTime: 0,
        endTime: null,
        type: 'intro',
        label: 'Introduction',
        status: 'active',
      });

      return { status: 'recording', elapsed: 0, message: 'Recording started — you\'re live!' };
    }),

  /**
   * Pause recording
   */
  pauseRecording: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session || session.status !== 'recording') throw new Error('Not recording');

      session.pausedAt = Date.now();
      session.status = 'paused';
      const elapsed = getElapsedSeconds(session);

      // Auto-drop a pause marker
      session.markers.push({
        id: `mkr_${Date.now()}`,
        timestamp: elapsed,
        label: 'Paused',
        type: 'edit',
        color: MARKER_COLORS.edit,
        note: 'Recording paused',
      });

      return { status: 'paused', elapsed, message: 'Recording paused' };
    }),

  /**
   * Stop recording
   */
  stopRecording: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      session.stoppedAt = Date.now();
      session.status = 'stopped';
      const elapsed = getElapsedSeconds(session);

      // Close any active segments
      session.segments.forEach(seg => {
        if (seg.status === 'active') {
          seg.endTime = elapsed;
          seg.status = 'completed';
        }
      });

      await notifyOwner({
        title: 'Podcast Recording Complete',
        content: `"${session.title}" — ${Math.floor(elapsed / 60)}m ${elapsed % 60}s | ${session.markers.length} markers | ${session.segments.length} segments | ${session.notes.length} notes`,
      });

      return {
        status: 'stopped',
        duration: elapsed,
        markers: session.markers.length,
        segments: session.segments.length,
        notes: session.notes.length,
        message: `Recording complete — ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
      };
    }),

  /**
   * Get session status with all production data
   */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      return {
        ...session,
        elapsed: getElapsedSeconds(session),
        markerCount: session.markers.length,
        segmentCount: session.segments.length,
        noteCount: session.notes.length,
      };
    }),

  /**
   * List all sessions
   */
  listSessions: protectedProcedure.query(async ({ ctx }) => {
    const userSessions = Array.from(sessions.values())
      .filter(s => s.userId === ctx.user.id.toString())
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));

    return userSessions.map(s => ({
      sessionId: s.sessionId,
      title: s.title,
      status: s.status,
      duration: getElapsedSeconds(s),
      markers: s.markers.length,
      segments: s.segments.length,
      notes: s.notes.length,
      startedAt: s.startedAt,
    }));
  }),

  // ========== MARKERS ==========

  /**
   * Drop a marker at the current timestamp
   */
  addMarker: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      label: z.string().default('Marker'),
      type: z.enum(['highlight', 'cut', 'edit', 'review', 'keep', 'remove']).default('highlight'),
      note: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      const timestamp = getElapsedSeconds(session);
      const marker: ProductionMarker = {
        id: `mkr_${Date.now()}`,
        timestamp,
        label: input.label,
        type: input.type,
        color: MARKER_COLORS[input.type] || '#6b7280',
        note: input.note,
      };
      session.markers.push(marker);

      return { marker, message: `${input.type} marker dropped at ${Math.floor(timestamp / 60)}:${String(timestamp % 60).padStart(2, '0')}` };
    }),

  /**
   * Remove a marker
   */
  removeMarker: protectedProcedure
    .input(z.object({ sessionId: z.string(), markerId: z.string() }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');
      session.markers = session.markers.filter(m => m.id !== input.markerId);
      return { success: true };
    }),

  // ========== SEGMENTS ==========

  /**
   * Start a new segment (closes any active segment)
   */
  startSegment: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      type: z.enum(['intro', 'discussion', 'interview', 'break', 'ad-read', 'music', 'outro', 'custom']),
      label: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      const timestamp = getElapsedSeconds(session);

      // Close any active segment
      session.segments.forEach(seg => {
        if (seg.status === 'active') {
          seg.endTime = timestamp;
          seg.status = 'completed';
        }
      });

      const segment: ProductionSegment = {
        id: `seg_${Date.now()}`,
        startTime: timestamp,
        endTime: null,
        type: input.type,
        label: input.label || input.type.charAt(0).toUpperCase() + input.type.slice(1).replace('-', ' '),
        status: 'active',
      };
      session.segments.push(segment);

      return { segment, message: `Started "${segment.label}" segment at ${Math.floor(timestamp / 60)}:${String(timestamp % 60).padStart(2, '0')}` };
    }),

  /**
   * End the current active segment
   */
  endSegment: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      const timestamp = getElapsedSeconds(session);
      const activeSeg = session.segments.find(s => s.status === 'active');
      if (activeSeg) {
        activeSeg.endTime = timestamp;
        activeSeg.status = 'completed';
      }

      return { success: true, message: 'Segment ended' };
    }),

  // ========== PRODUCTION NOTES ==========

  /**
   * Add a timestamped production note
   */
  addNote: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      content: z.string().min(1),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      const timestamp = getElapsedSeconds(session);
      const note: ProductionNote = {
        id: `note_${Date.now()}`,
        timestamp,
        content: input.content,
        author: ctx.user.name || 'Producer',
        priority: input.priority,
      };
      session.notes.push(note);

      return { note, message: `Note added at ${Math.floor(timestamp / 60)}:${String(timestamp % 60).padStart(2, '0')}` };
    }),

  /**
   * Remove a note
   */
  removeNote: protectedProcedure
    .input(z.object({ sessionId: z.string(), noteId: z.string() }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');
      session.notes = session.notes.filter(n => n.id !== input.noteId);
      return { success: true };
    }),

  // ========== SOUND BOARD ==========

  /**
   * Get available sound board presets
   */
  getSoundBoard: protectedProcedure.query(async () => {
    return {
      sounds: SOUND_BOARD_PRESETS,
      categories: ['transitions', 'stingers', 'jingles', 'sfx', 'music-beds', 'utility'],
    };
  }),

  /**
   * Trigger a sound effect (logs it to the timeline)
   */
  triggerSound: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      soundId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      const sound = SOUND_BOARD_PRESETS.find(s => s.id === input.soundId);
      if (!sound) throw new Error('Sound not found');

      const timestamp = getElapsedSeconds(session);
      session.soundTriggers.push({
        id: `snd_${Date.now()}`,
        timestamp,
        soundId: input.soundId,
        soundName: sound.name,
      });

      return { sound, timestamp, message: `Played "${sound.name}" at ${Math.floor(timestamp / 60)}:${String(timestamp % 60).padStart(2, '0')}` };
    }),

  // ========== EXPORT ==========

  /**
   * Export production session with all metadata
   * Generates a JSON manifest + summary for post-production
   */
  exportSession: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      format: z.enum(['json', 'edl', 'markers-only']).default('json'),
    }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);
      if (!session) throw new Error('Session not found');

      session.status = 'exporting';
      const duration = getElapsedSeconds(session);

      const manifest = {
        title: session.title,
        description: session.description,
        production: 'Canryn Production and its subsidiaries',
        platform: "Rockin' Rockin' Boogie",
        episodeNumber: session.episodeNumber,
        season: session.season,
        guests: session.guests,
        tags: session.tags,
        duration,
        durationFormatted: `${Math.floor(duration / 3600)}:${String(Math.floor((duration % 3600) / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`,
        recordedAt: session.startedAt ? new Date(session.startedAt).toISOString() : null,
        markers: session.markers.map(m => ({
          ...m,
          timestampFormatted: `${Math.floor(m.timestamp / 60)}:${String(m.timestamp % 60).padStart(2, '0')}`,
        })),
        segments: session.segments.map(s => ({
          ...s,
          startFormatted: `${Math.floor(s.startTime / 60)}:${String(s.startTime % 60).padStart(2, '0')}`,
          endFormatted: s.endTime ? `${Math.floor(s.endTime / 60)}:${String(s.endTime % 60).padStart(2, '0')}` : 'ongoing',
          durationSeconds: s.endTime ? s.endTime - s.startTime : null,
        })),
        notes: session.notes.map(n => ({
          ...n,
          timestampFormatted: `${Math.floor(n.timestamp / 60)}:${String(n.timestamp % 60).padStart(2, '0')}`,
        })),
        soundTriggers: session.soundTriggers.map(t => ({
          ...t,
          timestampFormatted: `${Math.floor(t.timestamp / 60)}:${String(t.timestamp % 60).padStart(2, '0')}`,
        })),
        exportedAt: new Date().toISOString(),
      };

      // Upload manifest to S3
      const manifestJson = JSON.stringify(manifest, null, 2);
      const key = `podcast-productions/${session.sessionId}/manifest-${Date.now()}.json`;
      const { url } = await storagePut(key, Buffer.from(manifestJson), 'application/json');

      return {
        manifestUrl: url,
        summary: {
          title: session.title,
          duration: manifest.durationFormatted,
          markers: session.markers.length,
          segments: session.segments.length,
          notes: session.notes.length,
          soundTriggers: session.soundTriggers.length,
        },
        message: 'Production manifest exported to S3',
      };
    }),
});
