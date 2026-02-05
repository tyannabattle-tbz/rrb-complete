/**
 * Podcast Playback Router
 * 
 * Handles real podcast/radio streaming with:
 * - Real audio stream URLs
 * - Playback state management
 * - Episode queue management
 * - Channel switching
 * - Volume and playback controls
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getChannelEpisodes,
  getEpisode,
  getChannel,
  getNextEpisode,
  getPreviousEpisode,
  getFirstEpisode,
  PodcastEpisode,
} from "../services/podcastService";
import { qumusEngine, DecisionPolicy } from "../qumus/decisionEngine";
import { propagationService } from "../qumus/propagationService";
import { auditTrailManager } from "../qumus/auditTrail";

// Real playback state with actual audio stream
interface PodcastPlaybackState {
  userId: number;
  currentEpisode: PodcastEpisode | null;
  currentChannel: number;
  isPlaying: boolean;
  currentTime: number; // in seconds
  volume: number; // 0-100
  queue: PodcastEpisode[];
  queueIndex: number;
  streamUrl: string | null; // Actual audio stream URL
}

// In-memory playback state per user
const playbackStates = new Map<number, PodcastPlaybackState>();

export const podcastPlaybackRouter = router({
  /**
   * Initialize playback for a channel
   */
  initializeChannel: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const episodes = getChannelEpisodes(input.channelId);
        const firstEpisode = episodes.length > 0 ? episodes[0] : null;

        const state: PodcastPlaybackState = {
          userId: ctx.user.id,
          currentEpisode: firstEpisode,
          currentChannel: input.channelId,
          isPlaying: false,
          currentTime: 0,
          volume: 70,
          queue: episodes,
          queueIndex: 0,
          streamUrl: firstEpisode?.streamUrl || null,
        };

        playbackStates.set(ctx.user.id, state);

        return {
          success: true,
          state,
        };
      } catch (error) {
        throw new Error(
          `Failed to initialize channel: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }),

  /**
   * Get current playback state
   */
  getState: protectedProcedure.query(async ({ ctx }) => {
    const state =
      playbackStates.get(ctx.user.id) ||
      ({
        userId: ctx.user.id,
        currentEpisode: null,
        currentChannel: 7,
        isPlaying: false,
        currentTime: 0,
        volume: 70,
        queue: [],
        queueIndex: 0,
        streamUrl: null,
      } as PodcastPlaybackState);

    return state;
  }),

  /**
   * Play current episode - with real audio stream
   */
  play: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason || "User clicked play",
          {
            action: "play",
            timestamp: new Date().toISOString(),
          }
        );

        let state = playbackStates.get(ctx.user.id);
        if (!state) {
          // Initialize with default channel
          const episodes = getChannelEpisodes(7);
          state = {
            userId: ctx.user.id,
            currentEpisode: episodes[0] || null,
            currentChannel: 7,
            isPlaying: false,
            currentTime: 0,
            volume: 70,
            queue: episodes,
            queueIndex: 0,
            streamUrl: episodes[0]?.streamUrl || null,
          };
        }

        state.isPlaying = true;
        playbackStates.set(ctx.user.id, state);

        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "play",
          episode: state.currentEpisode?.title,
          streamUrl: state.streamUrl,
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(
          `Failed to play: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Pause playback
   */
  pause: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason || "User clicked pause",
          {
            action: "pause",
            timestamp: new Date().toISOString(),
          }
        );

        const state = playbackStates.get(ctx.user.id);
        if (state) {
          state.isPlaying = false;
          playbackStates.set(ctx.user.id, state);
        }

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
        throw new Error(
          `Failed to pause: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Skip to next episode
   */
  next: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason || "User clicked next",
          {
            action: "next",
            timestamp: new Date().toISOString(),
          }
        );

        let state = playbackStates.get(ctx.user.id);
        if (state && state.queue.length > 0) {
          state.queueIndex = (state.queueIndex + 1) % state.queue.length;
          state.currentEpisode = state.queue[state.queueIndex];
          state.currentTime = 0;
          state.streamUrl = state.currentEpisode?.streamUrl || null;
          playbackStates.set(ctx.user.id, state);
        }

        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "next",
          episode: state?.currentEpisode?.title,
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(
          `Failed to skip next: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Skip to previous episode
   */
  prev: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          input.reason || "User clicked previous",
          {
            action: "prev",
            timestamp: new Date().toISOString(),
          }
        );

        let state = playbackStates.get(ctx.user.id);
        if (state && state.queue.length > 0) {
          state.queueIndex =
            (state.queueIndex - 1 + state.queue.length) % state.queue.length;
          state.currentEpisode = state.queue[state.queueIndex];
          state.currentTime = 0;
          state.streamUrl = state.currentEpisode?.streamUrl || null;
          playbackStates.set(ctx.user.id, state);
        }

        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "prev",
          episode: state?.currentEpisode?.title,
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(
          `Failed to skip previous: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Switch to a different channel
   */
  switchChannel: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          `User switched to channel ${input.channelId}`,
          {
            action: "switchChannel",
            channelId: input.channelId.toString(),
            timestamp: new Date().toISOString(),
          }
        );

        const episodes = getChannelEpisodes(input.channelId);
        const firstEpisode = episodes.length > 0 ? episodes[0] : null;

        const state: PodcastPlaybackState = {
          userId: ctx.user.id,
          currentEpisode: firstEpisode,
          currentChannel: input.channelId,
          isPlaying: false,
          currentTime: 0,
          volume: 70,
          queue: episodes,
          queueIndex: 0,
          streamUrl: firstEpisode?.streamUrl || null,
        };

        playbackStates.set(ctx.user.id, state);

        await propagationService.propagateDecision(decision);

        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          action: "switchChannel",
          channelId: input.channelId.toString(),
          episode: firstEpisode?.title,
        });

        return {
          success: true,
          decisionId: decision.decisionId,
          state,
        };
      } catch (error) {
        throw new Error(
          `Failed to switch channel: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }),

  /**
   * Set volume
   */
  setVolume: protectedProcedure
    .input(z.object({ volume: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          "engagement" as DecisionPolicy,
          ctx.user.id,
          "User adjusted volume",
          {
            action: "setVolume",
            volume: input.volume.toString(),
            timestamp: new Date().toISOString(),
          }
        );

        let state = playbackStates.get(ctx.user.id);
        if (!state) {
          state = {
            userId: ctx.user.id,
            currentEpisode: null,
            currentChannel: 7,
            isPlaying: false,
            currentTime: 0,
            volume: input.volume,
            queue: [],
            queueIndex: 0,
            streamUrl: null,
          };
        }

        state.volume = Math.round(input.volume);
        playbackStates.set(ctx.user.id, state);

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
        throw new Error(
          `Failed to set volume: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Seek to a specific time
   */
  seek: protectedProcedure
    .input(z.object({ time: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      try {
        let state = playbackStates.get(ctx.user.id);
        if (state && state.currentEpisode) {
          state.currentTime = Math.min(input.time, state.currentEpisode.duration);
          playbackStates.set(ctx.user.id, state);
        }

        return {
          success: true,
          state,
        };
      } catch (error) {
        throw new Error(
          `Failed to seek: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get all available channels
   */
  getChannels: protectedProcedure.query(async () => {
    return [
      { id: 7, name: "Rockin' Rockin' Boogie", description: "Classic rock and roll" },
      { id: 13, name: "Jazz Essentials", description: "Smooth jazz classics" },
      { id: 9, name: "Blues Hour", description: "Classic blues and soul" },
    ];
  }),

  /**
   * Get episodes for a channel
   */
  getEpisodes: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .query(async ({ input }) => {
      return getChannelEpisodes(input.channelId);
    }),
});
