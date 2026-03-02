import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const sessionPinningRouter = router({
  // Pin a session
  pinSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Session pinned", sessionId: input.sessionId };
    }),

  // Unpin a session
  unpinSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Session unpinned", sessionId: input.sessionId };
    }),

  // Get pinned sessions
  getPinnedSessions: protectedProcedure.query(async ({ ctx }) => {
    return { pinnedSessions: [] };
  }),

  // Reorder pinned sessions
  reorderPinnedSessions: protectedProcedure
    .input(z.object({ sessionIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Sessions reordered" };
    }),
});
