/**
 * Accounting Router — Canryn Production
 * Invoices (AR/AP), payments, reconciliation
 * Covers all 6 subsidiaries with QUMUS autonomous oversight
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as bizDb from "../db-business";

export const accountingRouter = router({
  // Invoices
  getInvoices: protectedProcedure
    .input(z.object({
      type: z.enum(['receivable', 'payable']).optional(),
      subsidiary: z.string().optional(),
    }).optional())
    .query(async ({ input }) => bizDb.getInvoices(input?.type, input?.subsidiary)),

  getInvoice: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => bizDb.getInvoiceById(input)),

  createInvoice: protectedProcedure
    .input(z.object({
      invoiceNumber: z.string().min(1),
      type: z.enum(['receivable', 'payable']),
      clientName: z.string().min(1),
      clientEmail: z.string().optional(),
      issueDate: z.string(),
      dueDate: z.string(),
      subtotal: z.string(),
      tax: z.string().optional(),
      total: z.string(),
      subsidiary: z.string().optional(),
      notes: z.string().optional(),
      lineItems: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const { issueDate, dueDate, ...rest } = input;
      const id = await bizDb.createInvoice({
        ...rest,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
      });
      return { success: true, id };
    }),

  updateInvoice: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'void']).optional(),
      amountPaid: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await bizDb.updateInvoice(id, data);
      return { success: true };
    }),

  // Payments
  getPayments: protectedProcedure
    .input(z.object({ invoiceId: z.number().optional() }).optional())
    .query(async ({ input }) => bizDb.getPayments(input?.invoiceId)),

  createPayment: protectedProcedure
    .input(z.object({
      invoiceId: z.number().optional(),
      paymentDate: z.string(),
      amount: z.string(),
      method: z.enum(['cash', 'check', 'wire', 'ach', 'credit_card', 'stripe', 'paypal', 'other']).optional(),
      reference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { paymentDate, ...rest } = input;
      await bizDb.createPayment({ ...rest, paymentDate: new Date(paymentDate) });
      return { success: true };
    }),

  // Reconciliation
  getReconciliations: protectedProcedure.query(async () => bizDb.getReconciliations()),

  createReconciliation: protectedProcedure
    .input(z.object({
      accountId: z.number(),
      reconciliationDate: z.string(),
      statementBalance: z.string(),
      bookBalance: z.string(),
      difference: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { reconciliationDate, ...rest } = input;
      await bizDb.createReconciliation({
        ...rest,
        reconciliationDate: new Date(reconciliationDate),
        reconciledBy: ctx.user?.id,
      });
      return { success: true };
    }),

  // Financial Summary (client-side calculations for offline support)
  getFinancialSummary: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const [invoicesAR, invoicesAP, payments] = await Promise.all([
        bizDb.getInvoices('receivable', input?.subsidiary),
        bizDb.getInvoices('payable', input?.subsidiary),
        bizDb.getPayments(),
      ]);

      const totalReceivable = invoicesAR
        .filter(i => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'void')
        .reduce((sum, i) => sum + parseFloat(i.total || '0'), 0);

      const totalPayable = invoicesAP
        .filter(i => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'void')
        .reduce((sum, i) => sum + parseFloat(i.total || '0'), 0);

      const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

      const overdueAR = invoicesAR.filter(i =>
        i.status !== 'paid' && i.status !== 'cancelled' && i.dueDate && new Date(i.dueDate) < new Date()
      ).length;

      const overdueAP = invoicesAP.filter(i =>
        i.status !== 'paid' && i.status !== 'cancelled' && i.dueDate && new Date(i.dueDate) < new Date()
      ).length;

      return {
        totalReceivable: totalReceivable.toFixed(2),
        totalPayable: totalPayable.toFixed(2),
        totalCollected: totalCollected.toFixed(2),
        netPosition: (totalReceivable - totalPayable).toFixed(2),
        overdueReceivables: overdueAR,
        overduePayables: overdueAP,
        invoiceCountAR: invoicesAR.length,
        invoiceCountAP: invoicesAP.length,
      };
    }),
});
