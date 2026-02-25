/**
 * Solbones Frequency Dice Game Router
 * Handles frequency rolls, leaderboard, and user statistics
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as dbHelpers from "../db-helpers";
import { TRPCError } from "@trpc/server";

const SOLFEGGIO_FREQUENCIES = [
  { name: "UT", frequency: 174, description: "Foundation and security" },
  { name: "RE", frequency: 285, description: "Tissue repair" },
  { name: "MI", frequency: 369, description: "Emotional healing" },
  { name: "FA", frequency: 432, description: "Heart chakra harmony" },
  { name: "SOL", frequency: 528, description: "DNA repair and miracles" },
  { name: "LA", frequency: 639, description: "Relationships" },
  { name: "TI", frequency: 741, description: "Spiritual awakening" },
  { name: "DO", frequency: 852, description: "Spiritual order" },
];

export const solbonesRouter = router({
  // Roll the frequency dice
  rollDice: protectedProcedure
    .input(z.object({
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Select random frequency
      const randomFreq = SOLFEGGIO_FREQUENCIES[
        Math.floor(Math.random() * SOLFEGGIO_FREQUENCIES.length)
      ];

      // Record the roll
      await dbHelpers.recordFrequencyRoll(
        ctx.user.id,
        randomFreq.name,
        randomFreq.frequency,
        input.notes
      );

      // Update leaderboard
      const history = await dbHelpers.getUserFrequencyHistory(ctx.user.id, 100);
      const totalRolls = history.length + 1;
      const frequencies = history.map((h) => h.frequencyName);
      const favorite = frequencies.length > 0
        ? frequencies.sort(
            (a, b) =>
              frequencies.filter((x) => x === b).length -
              frequencies.filter((x) => x === a).length
          )[0]
        : randomFreq.name;

      await dbHelpers.updateLeaderboardStats(
        ctx.user.id,
        totalRolls,
        favorite,
        totalRolls * 10
      );

      return {
        success: true,
        frequency: randomFreq,
        totalRolls,
      };
    }),

  // Get user's frequency history
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return dbHelpers.getUserFrequencyHistory(ctx.user.id, input.limit);
    }),

  // Get user's leaderboard stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const result = await dbHelpers.getOrCreateLeaderboardEntry(ctx.user.id);
    return result[0] || null;
  }),

  // Get top leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      return dbHelpers.getTopLeaderboard(input.limit);
    }),

  // Get all frequencies
  getFrequencies: publicProcedure.query(async () => {
    return SOLFEGGIO_FREQUENCIES;
  }),
});

export type SolbonesRouter = typeof solbonesRouter;
