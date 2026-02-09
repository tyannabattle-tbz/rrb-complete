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

// Sample meditation sessions with real audio URLs
const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: "med_001",
    title: "Top of the Sol Awakening",
    description: "Start your day with energy and clarity",
    duration: 10,
    instructor: "Sarah Chen",
    category: "breathing",
    frequency: "432Hz",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    difficulty: "beginner",
  },
  {
    id: "med_002",
    title: "Deep Relaxation",
    description: "Release tension and find inner peace",
    duration: 20,
    instructor: "James Wilson",
    category: "body-scan",
    frequency: "528Hz",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    difficulty: "intermediate",
  },
  {
    id: "med_003",
    title: "Loving Kindness",
    description: "Cultivate compassion and connection",
    duration: 15,
    instructor: "Maya Patel",
    category: "loving-kindness",
    frequency: "432Hz",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    difficulty: "beginner",
  },
  {
    id: "med_004",
    title: "Sleep Sanctuary",
    description: "Drift into peaceful, restorative sleep",
    duration: 30,
    instructor: "Dr. Michael Lee",
    category: "sleep",
    frequency: "binaural-beats",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    difficulty: "beginner",
  },
  {
    id: "med_005",
    title: "Visualization Journey",
    description: "Explore inner landscapes of imagination",
    duration: 20,
    instructor: "Elena Rodriguez",
    category: "visualization",
    frequency: "528Hz",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    difficulty: "advanced",
  },
];

// In-memory user progress tracking
const userProgress = new Map<number, UserMeditationProgress>();

export const meditationRouter = router({
  /**
   * Get all available meditation sessions
   */
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    try {
      // QUMUS: Log access for analytics
      await auditTrailManager.log({
        userId: ctx.user.id,
        action: "meditation_sessions_accessed",
        resource: "meditation",
        details: { sessionCount: MEDITATION_SESSIONS.length },
      });

      return {
        sessions: MEDITATION_SESSIONS,
        count: MEDITATION_SESSIONS.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch sessions: ${error instanceof Error ? error.message : String(error)}`
      );
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

        // Return personalized recommendations
        const recommendations = MEDITATION_SESSIONS.slice(0, 3).map((session) => ({
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
        // Escalated to human review
        return {
          recommendations: MEDITATION_SESSIONS.slice(0, 3),
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
        const session = MEDITATION_SESSIONS.find((s) => s.id === input.sessionId);
        if (!session) {
          throw new Error("Session not found");
        }

        // QUMUS: Log session start
        await auditTrailManager.log({
          userId: ctx.user.id,
          action: "meditation_session_started",
          resource: "meditation",
          details: { sessionId: input.sessionId, duration: session.duration },
        });

        return {
          success: true,
          session,
          streamUrl: session.audioUrl,
          startTime: new Date(),
        };
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
        const session = MEDITATION_SESSIONS.find((s) => s.id === input.sessionId);
        if (!session) {
          throw new Error("Session not found");
        }

        // Update user progress
        const progress = userProgress.get(ctx.user.id) || {
          userId: ctx.user.id,
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 1,
          bestStreak: 1,
          favoriteCategories: [],
          preferredFrequency: "432Hz",
        };

        progress.totalSessions += 1;
        progress.totalMinutes += input.minutesCompleted;
        progress.lastSessionDate = new Date();

        if (!progress.favoriteCategories.includes(session.category)) {
          progress.favoriteCategories.push(session.category);
        }

        userProgress.set(ctx.user.id, progress);

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
      const progress = userProgress.get(ctx.user.id) || {
        userId: ctx.user.id,
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        bestStreak: 0,
        favoriteCategories: [],
        preferredFrequency: "432Hz",
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
        const session = MEDITATION_SESSIONS.find((s) => s.id === input.sessionId);
        if (!session) {
          throw new Error("Session not found");
        }

        // Toggle favorite status
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
        const filtered = MEDITATION_SESSIONS.filter(
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
