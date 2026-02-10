/**
 * Contracts & Legal Router — Canryn Production
 * Contract management, intellectual property, compliance tracking
 * Covers all 6 subsidiaries with QUMUS autonomous oversight
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as bizDb from "../db-business";

export const legalRouter = router({
  // Contracts
  getContracts: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => bizDb.getContracts(input?.subsidiary)),

  getContract: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => bizDb.getContractById(input)),

  createContract: protectedProcedure
    .input(z.object({
      contractNumber: z.string().min(1),
      title: z.string().min(1),
      contractType: z.enum([
        'artist_agreement', 'licensing', 'nda', 'employment', 'vendor',
        'distribution', 'publishing', 'sponsorship', 'partnership', 'other',
      ]),
      counterparty: z.string().min(1),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      value: z.string().optional(),
      subsidiary: z.string().optional(),
      description: z.string().optional(),
      terms: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { startDate, endDate, ...rest } = input;
      const id = await bizDb.createContract({
        ...rest,
        assignedTo: ctx.user?.id,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      });
      return { success: true, id };
    }),

  updateContract: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      status: z.enum(['draft', 'review', 'approved', 'active', 'expired', 'terminated', 'disputed']).optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      terms: z.string().optional(),
      documentUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, endDate, ...data } = input;
      await bizDb.updateContract(id, {
        ...data,
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        ...(data.status === 'approved' ? { approvedBy: ctx.user?.id } : {}),
      });
      return { success: true };
    }),

  // Intellectual Property
  getIntellectualProperty: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => bizDb.getIntellectualProperty(input?.subsidiary)),

  createIntellectualProperty: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      ipType: z.enum([
        'copyright', 'trademark', 'patent', 'trade_secret',
        'licensing_right', 'masters', 'publishing_right',
      ]),
      owner: z.string().min(1),
      registrationNumber: z.string().optional(),
      filingDate: z.string().optional(),
      expirationDate: z.string().optional(),
      description: z.string().optional(),
      subsidiary: z.string().optional(),
      value: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { filingDate, expirationDate, ...rest } = input;
      const id = await bizDb.createIntellectualProperty({
        ...rest,
        ...(filingDate ? { filingDate: new Date(filingDate) } : {}),
        ...(expirationDate ? { expirationDate: new Date(expirationDate) } : {}),
      });
      return { success: true, id };
    }),

  updateIntellectualProperty: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      status: z.enum(['pending', 'registered', 'active', 'expired', 'disputed', 'transferred']).optional(),
      registrationNumber: z.string().optional(),
      description: z.string().optional(),
      value: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await bizDb.updateIntellectualProperty(id, data);
      return { success: true };
    }),

  // Compliance
  getComplianceItems: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => bizDb.getComplianceItems(input?.subsidiary)),

  createComplianceItem: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      category: z.enum([
        'fcc', 'copyright', 'gdpr', 'ccpa', 'ada',
        'tax', 'employment_law', 'broadcast_license', 'other',
      ]),
      dueDate: z.string().optional(),
      description: z.string().optional(),
      subsidiary: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { dueDate, ...rest } = input;
      const id = await bizDb.createComplianceItem({
        ...rest,
        assignedTo: ctx.user?.id,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      });
      return { success: true, id };
    }),

  updateComplianceItem: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      status: z.enum(['compliant', 'non_compliant', 'pending_review', 'in_progress', 'waived']).optional(),
      resolution: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await bizDb.updateComplianceItem(id, data);
      return { success: true };
    }),
});
