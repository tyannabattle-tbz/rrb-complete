import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { squaddMembers, fundraisingGoals } from "../../drizzle/schema";
import { eq, asc, desc } from "drizzle-orm";

export const squaddGoalsRouter = router({
  // Get all SQUADD members
  getMembers: publicProcedure.query(async () => {
    const db = await getDb();
    const members = await db
      .select()
      .from(squaddMembers)
      .where(eq(squaddMembers.isActive, true))
      .orderBy(asc(squaddMembers.displayOrder));
    return members;
  }),

  // Get a single SQUADD member by slug
  getMemberBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [member] = await db
        .select()
        .from(squaddMembers)
        .where(eq(squaddMembers.slug, input.slug))
        .limit(1);
      return member || null;
    }),

  // Get all active fundraising goals
  getFundraisingGoals: publicProcedure.query(async () => {
    const db = await getDb();
    const goals = await db
      .select()
      .from(fundraisingGoals)
      .where(eq(fundraisingGoals.isActive, true))
      .orderBy(desc(fundraisingGoals.createdAt));
    return goals;
  }),

  // Get a specific fundraising goal by campaign
  getFundraisingGoalByCampaign: publicProcedure
    .input(z.object({ campaign: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [goal] = await db
        .select()
        .from(fundraisingGoals)
        .where(eq(fundraisingGoals.campaign, input.campaign))
        .limit(1);
      return goal || null;
    }),
});
