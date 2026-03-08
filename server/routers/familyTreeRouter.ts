import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { familyTree } from "../../drizzle/schema";
import { eq, isNull } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export const familyTreeRouter = router({
  list: publicProcedure.query(async () => {
    try {
      const db = await requireDb();
      return await db.select().from(familyTree).orderBy(familyTree.generation, familyTree.name);
    } catch (e) {
      return [];
    }
  }),

  roots: publicProcedure.query(async () => {
    try {
      const db = await requireDb();
      return await db.select().from(familyTree).where(isNull(familyTree.parentId)).orderBy(familyTree.generation, familyTree.name);
    } catch (e) {
      return [];
    }
  }),

  children: publicProcedure.input(z.number()).query(async ({ input }) => {
    try {
      const db = await requireDb();
      return await db.select().from(familyTree).where(eq(familyTree.parentId, input)).orderBy(familyTree.name);
    } catch (e) {
      return [];
    }
  }),

  keyFigures: publicProcedure.query(async () => {
    try {
      const db = await requireDb();
      return await db.select().from(familyTree).where(eq(familyTree.isKeyFigure, true)).orderBy(familyTree.generation, familyTree.name);
    } catch (e) {
      return [];
    }
  }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    try {
      const db = await requireDb();
      const [member] = await db.select().from(familyTree).where(eq(familyTree.id, input)).limit(1);
      if (!member) throw new TRPCError({ code: "NOT_FOUND" });
      return member;
    } catch (e) {
      if (e instanceof TRPCError) throw e;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      nickname: z.string().optional(),
      relationship: z.string().optional(),
      birthYear: z.number().optional(),
      deathYear: z.number().optional(),
      bio: z.string().optional(),
      imageUrl: z.string().optional(),
      parentId: z.number().optional(),
      generation: z.number().optional(),
      isKeyFigure: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: "FORBIDDEN" });
      const db = await requireDb();
      const [result] = await db.insert(familyTree).values(input);
      return { success: true, id: result.insertId };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nickname: z.string().optional(),
      relationship: z.string().optional(),
      birthYear: z.number().optional(),
      deathYear: z.number().optional(),
      bio: z.string().optional(),
      imageUrl: z.string().optional(),
      parentId: z.number().nullable().optional(),
      generation: z.number().optional(),
      isKeyFigure: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: "FORBIDDEN" });
      const db = await requireDb();
      const { id, ...data } = input;
      await db.update(familyTree).set(data).where(eq(familyTree.id, id));
      return { success: true };
    }),
});
