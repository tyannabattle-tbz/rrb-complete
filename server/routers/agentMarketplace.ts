import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentMarketplace, agentReviews, agentInstallations, agentRegistry } from "../../drizzle/schema";
import { eq, desc, and, gte, lte, like, or } from "drizzle-orm";

export const agentMarketplaceRouter = router({
  // List marketplace agents with filtering
  listAgents: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["rating", "downloads", "recent", "trending"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const conditions = [eq(agentMarketplace.isPublished, true)];

      if (input.category) {
        conditions.push(eq(agentMarketplace.category, input.category));
      }

      if (input.search) {
        conditions.push(like(agentMarketplace.agentName, `%${input.search}%`));
      }

      let query = db.select().from(agentMarketplace).where(and(...conditions)).orderBy(desc(agentMarketplace.createdAt));

      if (input.sortBy === "rating") {
        query = db.select().from(agentMarketplace).where(and(...conditions)).orderBy(desc(agentMarketplace.rating));
      } else if (input.sortBy === "downloads") {
        query = db.select().from(agentMarketplace).where(and(...conditions)).orderBy(desc(agentMarketplace.downloads));
      } else if (input.sortBy === "recent") {
        query = db.select().from(agentMarketplace).where(and(...conditions)).orderBy(desc(agentMarketplace.createdAt));
      }

      const agents = await query.limit(input.limit).offset(input.offset);
      return agents;
    }),

  // Get agent details
  getAgent: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const agent = await db.select().from(agentMarketplace).where(eq(agentMarketplace.id, input.agentId)).limit(1);

      if (!agent[0]) return null;

      const reviews = await db.select().from(agentReviews).where(eq(agentReviews.agentId, input.agentId));

      return { ...agent[0], reviews };
    }),

  // Publish agent to marketplace
  publishAgent: protectedProcedure
    .input(
      z.object({
        agentName: z.string(),
        description: z.string(),
        category: z.string(),
        agentType: z.enum(["reasoning", "execution", "monitoring", "coordination", "custom"]),
        capabilities: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(agentMarketplace).values({
        agentName: input.agentName,
        description: input.description,
        category: input.category,
        agentType: input.agentType as any,
        capabilities: input.capabilities || [],
        tags: input.tags || [],
        author: ctx.user.name || "Anonymous",
        authorId: ctx.user.id,
        isPublished: true,
      } as any);

      return { success: true };
    }),

  // Add review to agent
  addReview: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        rating: z.number().min(1).max(5),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(agentReviews).values({
        agentId: input.agentId,
        userId: ctx.user.id,
        rating: input.rating,
        review: input.review,
      } as any);

      // Update agent rating
      const reviews = await db.select().from(agentReviews).where(eq(agentReviews.agentId, input.agentId));

      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

      await db
        .update(agentMarketplace)
        .set({ rating: avgRating.toString() as any })
        .where(eq(agentMarketplace.id, input.agentId));

      return { success: true };
    }),

  // Install agent from marketplace
  installAgent: protectedProcedure
    .input(
      z.object({
        marketplaceAgentId: z.number(),
        agentName: z.string(),
        configuration: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Create local agent instance
      const result = await db.insert(agentRegistry).values({
        userId: ctx.user.id,
        agentName: input.agentName,
        agentType: "custom" as any,
        configuration: input.configuration || {},
      } as any);

      const localAgentId = (result as any).insertId || 1;

      // Record installation
      await db.insert(agentInstallations).values({
        userId: ctx.user.id,
        marketplaceAgentId: input.marketplaceAgentId,
        localAgentId: localAgentId,
        version: "1.0.0",
        status: "installed" as any,
      } as any);

      // Increment downloads
      const agent = await db
        .select()
        .from(agentMarketplace)
        .where(eq(agentMarketplace.id, input.marketplaceAgentId))
        .limit(1);

      if (agent[0]) {
        await db
          .update(agentMarketplace)
          .set({ downloads: (agent[0].downloads || 0) + 1 })
          .where(eq(agentMarketplace.id, input.marketplaceAgentId));
      }

      return { success: true, localAgentId };
    }),

  // Get user's installed agents
  getInstalledAgents: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const installations = await db
      .select()
      .from(agentInstallations)
      .where(eq(agentInstallations.userId, ctx.user.id));

    return installations;
  }),

  // Get marketplace categories
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const categories = [
      "Data Analysis",
      "Content Generation",
      "Code Generation",
      "Task Automation",
      "Research",
      "Customer Service",
      "Business Intelligence",
      "Security",
      "DevOps",
      "Other",
    ];

    return categories;
  }),

  // Get trending agents
  getTrendingAgents: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const agents = await db
      .select()
      .from(agentMarketplace)
      .where(eq(agentMarketplace.isPublished, true))
      .orderBy(desc(agentMarketplace.downloads))
      .limit(10);

    return agents;
  }),
});
