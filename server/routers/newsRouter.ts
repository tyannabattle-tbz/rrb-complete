import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { newsArticles } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export const newsRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().min(1).max(50).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    }).optional())
    .query(async ({ input }) => {
      const params = input ?? { limit: 20, offset: 0 };
      try {
        const db = await requireDb();
        const conditions = [];
        if (params.category) {
          conditions.push(eq(newsArticles.category, params.category));
        }
        const articles = await db
          .select()
          .from(newsArticles)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(newsArticles.publishedAt))
          .limit(params.limit)
          .offset(params.offset);
        return articles;
      } catch (e) {
        return [];
      }
    }),

  breaking: publicProcedure.query(async () => {
    try {
      const db = await requireDb();
      return await db.select().from(newsArticles).where(eq(newsArticles.isBreaking, true)).orderBy(desc(newsArticles.publishedAt)).limit(5);
    } catch (e) {
      return [];
    }
  }),

  featured: publicProcedure.query(async () => {
    try {
      const db = await requireDb();
      return await db.select().from(newsArticles).where(eq(newsArticles.isFeatured, true)).orderBy(desc(newsArticles.publishedAt)).limit(10);
    } catch (e) {
      return [];
    }
  }),

  getBySlug: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const db = await requireDb();
      const [article] = await db.select().from(newsArticles).where(eq(newsArticles.slug, input)).limit(1);
      if (!article) throw new TRPCError({ code: "NOT_FOUND" });
      return article;
    } catch (e) {
      if (e instanceof TRPCError) throw e;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      summary: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      source: z.string().optional(),
      sourceUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      isBreaking: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: "FORBIDDEN" });
      const db = await requireDb();
      const [result] = await db.insert(newsArticles).values({ ...input, authorId: ctx.user.id });
      return { success: true, id: result.insertId };
    }),
});
