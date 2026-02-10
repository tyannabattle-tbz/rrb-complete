/**
 * Bookkeeping Router — Canryn Production
 * General ledger, chart of accounts, journal entries, trial balance
 * QUMUS-integrated with autonomous oversight
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as bizDb from "../db-business";

export const bookkeepingRouter = router({
  // Chart of Accounts
  getAccounts: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return bizDb.getAccounts(input?.subsidiary);
    }),

  getAccount: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return bizDb.getAccountById(input);
    }),

  createAccount: protectedProcedure
    .input(z.object({
      accountCode: z.string().min(1),
      accountName: z.string().min(1),
      accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
      parentAccountId: z.number().optional(),
      description: z.string().optional(),
      subsidiary: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await bizDb.createAccount(input);
      return { success: true, id };
    }),

  updateAccount: protectedProcedure
    .input(z.object({
      id: z.number(),
      accountName: z.string().optional(),
      accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      balance: z.string().optional(),
      subsidiary: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await bizDb.updateAccount(id, data);
      return { success: true };
    }),

  // Journal Entries
  getJournalEntries: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return bizDb.getJournalEntries(input?.subsidiary);
    }),

  createJournalEntry: protectedProcedure
    .input(z.object({
      entryNumber: z.string().min(1),
      entryDate: z.string(),
      description: z.string().min(1),
      reference: z.string().optional(),
      totalDebit: z.string(),
      totalCredit: z.string(),
      subsidiary: z.string().optional(),
      lines: z.array(z.object({
        accountId: z.number(),
        debit: z.string(),
        credit: z.string(),
        memo: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { lines, entryDate, ...entryData } = input;
      // Validate debits = credits
      const totalDebit = lines.reduce((s, l) => s + parseFloat(l.debit || '0'), 0);
      const totalCredit = lines.reduce((s, l) => s + parseFloat(l.credit || '0'), 0);
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Journal entry must balance: total debits must equal total credits');
      }

      const entryId = await bizDb.createJournalEntry({
        ...entryData,
        entryDate: new Date(entryDate),
        createdBy: ctx.user?.id,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
      });

      // Create ledger lines
      for (const line of lines) {
        await bizDb.createLedgerLine({ journalEntryId: entryId, ...line });
      }

      return { success: true, id: entryId };
    }),

  postJournalEntry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await bizDb.updateJournalEntry(input.id, { status: 'posted', approvedBy: ctx.user?.id });
      return { success: true };
    }),

  voidJournalEntry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await bizDb.updateJournalEntry(input.id, { status: 'voided' });
      return { success: true };
    }),

  getLedgerLines: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return bizDb.getLedgerLinesByEntry(input);
    }),

  // Dashboard stats
  getDashboardStats: protectedProcedure.query(async () => {
    return bizDb.getBusinessDashboardStats();
  }),
});
