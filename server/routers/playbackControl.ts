/**
 * Playback Control Router
 * 
 * Exposes playback control procedures for Rockin' Boogie that integrate with:
 * - QUMUS orchestration engine (decision making and control)
 * - All button actions go through QUMUS for autonomous decision-making
 * - QUMUS propagates decisions to the actual playback backend
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { qumusEngine, DecisionPolicy } from "../qumus/decisionEngine";
import { propagationService } from "../qumus/propagationService";
import { auditTrailManager } from "../qumus/auditTrail";

// Playback state type
interface PlaybackState {
  userId: number;
  contentId: number | null;
  isPlaying: boolean;
  currentChannel: number;
  volume: number;
  currentTime: number;
  duration: number;
  queue: number[];
  queueIndex: number;
}

// In-memory playback state (would be in database in production)
const playbackState = new Map<number, PlaybackState>();

export const playbackControlRouter = router({
  /**
   * Get current playback state
   */
  getState: protectedProcedure.query(async ({ ctx }) => {
    const state: PlaybackState = playbackState.get(ctx.user.id) || {
      userId: ctx.user.id,
      contentId: null,
      isPlaying: false,
      currentChannel: 7,
      volume: 70,
      currentTime: 0,
      duration: 0,
      queue: [],
      queueIndex: 0,
    };
    return state;
  }),

  /**
   * Play content - QUMUS decides and controls playback
   */
  play: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        reason: z.string().default("User initiated playback"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // QUMUS makes the decision for playback
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason,
          {
            action: "play",
            contentId: input.contentId.toString(),
            timestamp: new Date().toISOString(),
          }
        );

        // Update playback state based on QUMUS decision
        const state: PlaybackState = playbackState.get(ctx.user.id) || {
          userId: ctx.user.id,
          contentId: null,
          isPlaying: false,
          currentChannel: 7,
          volume: 70,
          currentTime: 0,
          duration: 0,
          queue: [],
          queueIndex: 0,
        };

        state.contentId = input.contentId;
        state.isPlaying = true;
        state.currentTime = 0;
        playbackState.set(ctx.user.id, state);

        // QUMUS propagates the decision to playback backend
        await propagationService.propagateDecision(decision);

        // Log the action
        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "play",
          contentId: input.contentId.toString(),
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(`Failed to play content: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Pause playback - QUMUS decides and controls
   */
  pause: protectedProcedure
    .input(z.object({ reason: z.string().default("User paused playback") }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason,
          {
            action: "pause",
            timestamp: new Date().toISOString(),
          }
        );

        const state = playbackState.get(ctx.user.id);
        if (state) {
          state.isPlaying = false;
          playbackState.set(ctx.user.id, state);
        }

        // QUMUS propagates the decision
        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "pause",
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(`Failed to pause: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Next track - QUMUS decides and controls
   */
  next: protectedProcedure
    .input(z.object({ reason: z.string().default("User skipped to next") }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason,
          {
            action: "next",
            timestamp: new Date().toISOString(),
          }
        );

        const state = playbackState.get(ctx.user.id);
        if (state && state.queue.length > 0) {
          state.queueIndex = (state.queueIndex + 1) % state.queue.length;
          state.contentId = state.queue[state.queueIndex];
          state.currentTime = 0;
          playbackState.set(ctx.user.id, state);
        }

        // QUMUS propagates the decision
        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "next",
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(`Failed to skip next: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Previous track - QUMUS decides and controls
   */
  prev: protectedProcedure
    .input(z.object({ reason: z.string().default("User skipped to previous") }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason,
          {
            action: "prev",
            timestamp: new Date().toISOString(),
          }
        );

        const state = playbackState.get(ctx.user.id);
        if (state && state.queue.length > 0) {
          state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
          state.contentId = state.queue[state.queueIndex];
          state.currentTime = 0;
          playbackState.set(ctx.user.id, state);
        }

        // QUMUS propagates the decision
        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "prev",
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(`Failed to skip previous: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Select channel - QUMUS decides and controls
   */
  selectChannel: protectedProcedure
    .input(
      z.object({
        channel: z.number().min(1).max(100),
        reason: z.string().default("User selected channel"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason,
          {
            action: "selectChannel",
            channel: input.channel.toString(),
            timestamp: new Date().toISOString(),
          }
        );

        const state: PlaybackState = playbackState.get(ctx.user.id) || {
          userId: ctx.user.id,
          contentId: null,
          isPlaying: false,
          currentChannel: 7,
          volume: 70,
          currentTime: 0,
          duration: 0,
          queue: [],
          queueIndex: 0,
        };

        state.currentChannel = Math.round(input.channel);
        playbackState.set(ctx.user.id, state);

        // QUMUS propagates the decision
        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "selectChannel",
          channel: input.channel.toString(),
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(`Failed to select channel: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Set volume - QUMUS decides and controls
   */
  setVolume: protectedProcedure
    .input(
      z.object({
        volume: z.number().min(0).max(100),
        reason: z.string().default("User adjusted volume"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason,
          {
            action: "setVolume",
            volume: input.volume.toString(),
            timestamp: new Date().toISOString(),
          }
        );

        const state: PlaybackState = playbackState.get(ctx.user.id) || {
          userId: ctx.user.id,
          contentId: null,
          isPlaying: false,
          currentChannel: 7,
          volume: 70,
          currentTime: 0,
          duration: 0,
          queue: [],
          queueIndex: 0,
        };

        state.volume = Math.round(input.volume);
        playbackState.set(ctx.user.id, state);

        // QUMUS propagates the decision
        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "setVolume",
          volume: input.volume.toString(),
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(`Failed to set volume: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  /**
   * Power on/off - QUMUS decides and controls
   */
  setPower: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        reason: z.string().default("User toggled power"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "system" as DecisionPolicy,
          ctx.user.id,
          input.reason,
          {
            action: "setPower",
            enabled: input.enabled.toString(),
            timestamp: new Date().toISOString(),
          }
        );

        const state: PlaybackState = playbackState.get(ctx.user.id) || {
          userId: ctx.user.id,
          contentId: null,
          isPlaying: false,
          currentChannel: 7,
          volume: 70,
          currentTime: 0,
          duration: 0,
          queue: [],
          queueIndex: 0,
        };

        if (!input.enabled) {
          state.isPlaying = false;
        }

        playbackState.set(ctx.user.id, state);

        // QUMUS propagates the decision
        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "setPower",
          enabled: input.enabled.toString(),
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(`Failed to set power: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
});
