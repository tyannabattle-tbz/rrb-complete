import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { documentationPages } from "../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export const documentationRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      try {
        const db = await requireDb();
        const conditions = [eq(documentationPages.isPublished, true)];
        if (input?.category) {
          conditions.push(eq(documentationPages.category, input.category));
        }
        return await db.select().from(documentationPages).where(and(...conditions)).orderBy(asc(documentationPages.sortOrder), asc(documentationPages.title));
      } catch (e) {
        return [];
      }
    }),

  getBySlug: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const db = await requireDb();
      const [page] = await db.select().from(documentationPages).where(eq(documentationPages.slug, input)).limit(1);
      if (!page) throw new TRPCError({ code: "NOT_FOUND" });
      return page;
    } catch (e) {
      if (e instanceof TRPCError) throw e;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  categories: publicProcedure.query(async () => {
    try {
      const db = await requireDb();
      const pages = await db.select({ category: documentationPages.category }).from(documentationPages).where(eq(documentationPages.isPublished, true)).groupBy(documentationPages.category);
      return pages.map(p => p.category).filter(Boolean);
    } catch (e) {
      return [];
    }
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().optional(),
      category: z.string().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: "FORBIDDEN" });
      const db = await requireDb();
      const [result] = await db.insert(documentationPages).values(input);
      return { success: true, id: result.insertId };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: "FORBIDDEN" });
      const db = await requireDb();
      const { id, ...data } = input;
      await db.update(documentationPages).set(data).where(eq(documentationPages.id, id));
      return { success: true };
    }),
});
