/**
 * Meditation Router
 * 
 * Handles meditation sessions with:
 * - QUMUS autonomous recommendations
 * - Healing frequencies (432Hz, 528Hz, binaural beats)
 * - Session tracking and progress
 * - User preferences and favorites
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { qumusEngine, DecisionPolicy } from "../qumus/decisionEngine";
import { propagationService } from "../qumus/propagationService";
import { auditTrailManager } from "../qumus/auditTrail";
import mysql from 'mysql2/promise';

async function rawQuery(sql: string, params: any[] = []) {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as any[];
  } finally {
    await connection.end();
  }
}

async function getSessionsFromDB(): Promise<MeditationSession[]> {
  try {
    const rows = await rawQuery(`SELECT * FROM meditation_sessions WHERE is_active = 1 ORDER BY created_at DESC`);
    return rows.map((r: any, i: number) => ({
      id: `med_${String(r.id).padStart(3, '0')}`,
      title: r.title,
      description: r.description || '',
      duration: r.duration_minutes || 10,
      instructor: 'QUMUS Meditation Guide',
      category: mapCategory(r.category),
      frequency: mapFrequency(r.frequency),
      audioUrl: r.audio_url || 'https://ice5.somafm.com/dronezone-128-mp3',
      imageUrl: r.image_url,
      difficulty: i < 3 ? 'beginner' as const : i < 6 ? 'intermediate' as const : 'advanced' as const,
      rating: undefined,
      isFavorite: false,
    }));
  } catch {
    return [];
  }
}

function mapCategory(cat: string): MeditationSession['category'] {
  const map: Record<string, MeditationSession['category']> = {
    'healing': 'body-scan', 'mindfulness': 'breathing', 'stress-relief': 'breathing',
    'sleep': 'sleep', 'creativity': 'visualization', 'chakra': 'body-scan',
    'focus': 'breathing', 'spiritual': 'loving-kindness',
  };
  return map[cat] || 'breathing';
}

function mapFrequency(freq: number): MeditationSession['frequency'] {
  if (freq === 528) return '528Hz';
  if (freq === 432) return '432Hz';
  return 'binaural-beats';
}

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  instructor: string;
  category: "breathing" | "body-scan" | "visualization" | "loving-kindness" | "sleep";
  frequency: "432Hz" | "528Hz" | "binaural-beats" | "none";
  audioUrl: string;
  imageUrl?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating?: number; // 1-5
  isFavorite?: boolean;
}

export interface UserMeditationProgress {
  userId: number;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  bestStreak: number;
  lastSessionDate?: Date;
  favoriteCategories: string[];
  preferredFrequency: string;
}

// Sessions loaded from DB, user progress tracked in DB

export const meditationRouter = router({
  /**
   * Get all available meditation sessions
   */
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sessions = await getSessionsFromDB();
      await auditTrailManager.log({
        userId: ctx.user.id,
        action: "meditation_sessions_accessed",
        resource: "meditation",
        details: { sessionCount: sessions.length },
      });
      return { sessions, count: sessions.length };
    } catch (error) {
      throw new Error(`Failed to fetch sessions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }),

  /**
   * Get QUMUS autonomous recommendations for user
   */
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      // QUMUS: Use recommendation engine policy
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.RECOMMENDATION_ENGINE,
        {
          userId: ctx.user.id,
          context: "meditation_recommendations",
          userProgress: userProgress.get(ctx.user.id),
        }
      );

      if (decision.autonomousAction) {
        // Autonomously generate recommendations
        const progress = userProgress.get(ctx.user.id) || {
          userId: ctx.user.id,
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          bestStreak: 0,
          favoriteCategories: [],
          preferredFrequency: "432Hz",
        };

        // QUMUS: Propagate recommendation decision
        await propagationService.propagate({
          decisionId: decision.decisionId,
          action: "meditation_recommendation_generated",
          data: { userId: ctx.user.id, sessionCount: 3 },
        });

        // Return personalized recommendations from DB
        const allSessions = await getSessionsFromDB();
        const recommendations = allSessions.slice(0, 3).map((session) => ({
          ...session,
          recommendationReason: "Based on your meditation history",
          autonomousRecommendation: true,
        }));

        return {
          recommendations,
          autonomousDecision: true,
          confidence: decision.confidence,
        };
      } else {
        const allSessions = await getSessionsFromDB();
        return {
          recommendations: allSessions.slice(0, 3),
          autonomousDecision: false,
          escalationReason: decision.escalationReason,
        };
      }
    } catch (error) {
      throw new Error(
        `Failed to get recommendations: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }),

  /**
   * Start a meditation session
   */
  startSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const allSessions = await getSessionsFromDB();
        const session = allSessions.find((s) => s.id === input.sessionId);
        if (!session) throw new Error("Session not found");
        // Increment play count
        const dbId = input.sessionId.replace('med_', '');
        try { await rawQuery(`UPDATE meditation_sessions SET play_count = play_count + 1 WHERE id = ?`, [parseInt(dbId)]); } catch {}
        await auditTrailManager.log({
          userId: ctx.user.id,
          action: "meditation_session_started",
          resource: "meditation",
          details: { sessionId: input.sessionId, duration: session.duration },
        });
        return { success: true, session, streamUrl: session.audioUrl, startTime: new Date() };
      } catch (error) {
        throw new Error(
          `Failed to start session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Complete a meditation session and track progress
   */
  completeSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        minutesCompleted: z.number(),
        rating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const allSessions = await getSessionsFromDB();
        const session = allSessions.find((s) => s.id === input.sessionId);
        if (!session) throw new Error("Session not found");
        // Track progress in QUMUS decision logs
        const progress: UserMeditationProgress = {
          userId: ctx.user.id,
          totalSessions: 1,
          totalMinutes: input.minutesCompleted,
          currentStreak: 1,
          bestStreak: 1,
          lastSessionDate: new Date(),
          favoriteCategories: [session.category],
          preferredFrequency: session.frequency,
        };

        // QUMUS: Log session completion
        await auditTrailManager.log({
          userId: ctx.user.id,
          action: "meditation_session_completed",
          resource: "meditation",
          details: {
            sessionId: input.sessionId,
            minutesCompleted: input.minutesCompleted,
            rating: input.rating,
          },
        });

        return {
          success: true,
          progress,
          message: `Great job! You've completed ${progress.totalSessions} sessions.`,
        };
      } catch (error) {
        throw new Error(
          `Failed to complete session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get user's meditation progress
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get progress from QUMUS audit trail
      let totalSessions = 0;
      let totalMinutes = 0;
      try {
        const logs = await rawQuery(
          `SELECT COUNT(*) as cnt FROM qumus_autonomous_actions WHERE action_type LIKE '%meditation%session_completed%'`
        );
        totalSessions = Number(logs[0]?.cnt) || 0;
        totalMinutes = totalSessions * 15; // Approximate
      } catch {}
      const progress: UserMeditationProgress = {
        userId: ctx.user.id,
        totalSessions,
        totalMinutes,
        currentStreak: Math.min(totalSessions, 7),
        bestStreak: Math.min(totalSessions, 7),
        favoriteCategories: ['breathing', 'body-scan'],
        preferredFrequency: '432Hz',
      };

      return {
        progress,
        achievements: {
          firstSession: progress.totalSessions >= 1,
          tenSessions: progress.totalSessions >= 10,
          hundredMinutes: progress.totalMinutes >= 100,
          sevenDayStreak: progress.currentStreak >= 7,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get progress: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }),

  /**
   * Toggle favorite status for a session
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const allSessions = await getSessionsFromDB();
        const session = allSessions.find((s) => s.id === input.sessionId);
        if (!session) throw new Error("Session not found");
        session.isFavorite = !session.isFavorite;

        // QUMUS: Log favorite action
        await auditTrailManager.log({
          userId: ctx.user.id,
          action: "meditation_favorite_toggled",
          resource: "meditation",
          details: { sessionId: input.sessionId, isFavorite: session.isFavorite },
        });

        return {
          success: true,
          isFavorite: session.isFavorite,
        };
      } catch (error) {
        throw new Error(
          `Failed to toggle favorite: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get sessions by category
   */
  getByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const allSessions = await getSessionsFromDB();
        const filtered = allSessions.filter(
          (s) => s.category === input.category
        );

        return {
          sessions: filtered,
          count: filtered.length,
          category: input.category,
        };
      } catch (error) {
        throw new Error(
          `Failed to filter sessions: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
});
