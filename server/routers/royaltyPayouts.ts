/**
 * Royalty Payouts Router — Stripe Connect Integration
 * 
 * Handles artist onboarding to Stripe Connect and automated
 * royalty distribution payouts via Stripe Transfers.
 * 
 * A Canryn Production
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  royaltyCollaborators,
  royaltyDistributions,
  royaltyPayments,
  royaltyProjects,
} from "../../drizzle/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

export const royaltyPayoutsRouter = router({
  /**
   * Create a Stripe Connect Express account for an artist collaborator
   * and return an onboarding link
   */
  createConnectOnboarding: protectedProcedure
    .input(z.object({ collaboratorId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify the collaborator belongs to a project the user owns
      const [collab] = await db
        .select()
        .from(royaltyCollaborators)
        .where(eq(royaltyCollaborators.id, input.collaboratorId));
      if (!collab) throw new Error("Collaborator not found");

      const [project] = await db
        .select()
        .from(royaltyProjects)
        .where(
          and(
            eq(royaltyProjects.id, collab.projectId),
            eq(royaltyProjects.createdBy, ctx.user.id)
          )
        );
      if (!project) throw new Error("Access denied — only project owner can set up payouts");

      // If they already have a Connect account, create a new onboarding link
      let accountId = collab.stripeConnectAccountId;

      if (!accountId) {
        // Create a new Express Connect account
        const account = await stripe.accounts.create({
          type: "express",
          email: collab.email || undefined,
          metadata: {
            collaboratorId: collab.id.toString(),
            projectId: collab.projectId.toString(),
            artistName: collab.artistName,
          },
          capabilities: {
            transfers: { requested: true },
          },
        });
        accountId = account.id;

        // Save the account ID
        await db
          .update(royaltyCollaborators)
          .set({
            stripeConnectAccountId: accountId,
            payoutMethod: "stripe_connect",
          })
          .where(eq(royaltyCollaborators.id, input.collaboratorId));
      }

      // Create an account link for onboarding
      const origin =
        ctx.req?.headers?.origin ||
        process.env.VITE_APP_URL ||
        "http://localhost:3000";
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/rrb/royalties?onboarding=refresh&collaboratorId=${input.collaboratorId}`,
        return_url: `${origin}/rrb/royalties?onboarding=complete&collaboratorId=${input.collaboratorId}`,
        type: "account_onboarding",
      });

      return {
        url: accountLink.url,
        accountId,
      };
    }),

  /**
   * Check if a collaborator's Stripe Connect onboarding is complete
   */
  checkOnboardingStatus: protectedProcedure
    .input(z.object({ collaboratorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [collab] = await db
        .select()
        .from(royaltyCollaborators)
        .where(eq(royaltyCollaborators.id, input.collaboratorId));
      if (!collab) throw new Error("Collaborator not found");

      if (!collab.stripeConnectAccountId) {
        return {
          hasAccount: false,
          onboardingComplete: false,
          payoutsEnabled: false,
          payoutMethod: collab.payoutMethod,
        };
      }

      try {
        const account = await stripe.accounts.retrieve(
          collab.stripeConnectAccountId
        );
        const isComplete =
          account.details_submitted && account.charges_enabled;

        // Update onboarding status if changed
        if (isComplete && !collab.stripeOnboardingComplete) {
          await db
            .update(royaltyCollaborators)
            .set({ stripeOnboardingComplete: true })
            .where(eq(royaltyCollaborators.id, input.collaboratorId));
        }

        return {
          hasAccount: true,
          onboardingComplete: !!account.details_submitted,
          payoutsEnabled: !!account.payouts_enabled,
          chargesEnabled: !!account.charges_enabled,
          payoutMethod: collab.payoutMethod,
          accountId: collab.stripeConnectAccountId,
        };
      } catch (err) {
        return {
          hasAccount: true,
          onboardingComplete: false,
          payoutsEnabled: false,
          payoutMethod: collab.payoutMethod,
          error: "Could not verify account status",
        };
      }
    }),

  /**
   * Update a collaborator's payout method
   */
  updatePayoutMethod: protectedProcedure
    .input(
      z.object({
        collaboratorId: z.number(),
        payoutMethod: z.enum([
          "stripe_connect",
          "manual",
          "check",
          "wire",
          "paypal",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [collab] = await db
        .select()
        .from(royaltyCollaborators)
        .where(eq(royaltyCollaborators.id, input.collaboratorId));
      if (!collab) throw new Error("Collaborator not found");

      const [project] = await db
        .select()
        .from(royaltyProjects)
        .where(
          and(
            eq(royaltyProjects.id, collab.projectId),
            eq(royaltyProjects.createdBy, ctx.user.id)
          )
        );
      if (!project) throw new Error("Access denied");

      await db
        .update(royaltyCollaborators)
        .set({ payoutMethod: input.payoutMethod })
        .where(eq(royaltyCollaborators.id, input.collaboratorId));

      return { success: true };
    }),

  /**
   * Execute a Stripe Transfer payout for a specific distribution
   * Only works if the collaborator has completed Stripe Connect onboarding
   */
  payDistribution: protectedProcedure
    .input(
      z.object({
        distributionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the distribution
      const [dist] = await db
        .select()
        .from(royaltyDistributions)
        .where(eq(royaltyDistributions.id, input.distributionId));
      if (!dist) throw new Error("Distribution not found");
      if (dist.status === "paid")
        throw new Error("Distribution already paid");

      // Get the collaborator
      const [collab] = await db
        .select()
        .from(royaltyCollaborators)
        .where(eq(royaltyCollaborators.id, dist.collaboratorId));
      if (!collab) throw new Error("Collaborator not found");

      // Verify project ownership
      const [project] = await db
        .select()
        .from(royaltyProjects)
        .where(
          and(
            eq(royaltyProjects.id, collab.projectId),
            eq(royaltyProjects.createdBy, ctx.user.id)
          )
        );
      if (!project) throw new Error("Access denied");

      if (!collab.stripeConnectAccountId || !collab.stripeOnboardingComplete) {
        throw new Error(
          "Collaborator has not completed Stripe Connect onboarding. Set up their payout account first."
        );
      }

      const amountCents = Math.round(parseFloat(dist.amount) * 100);
      if (amountCents < 50) {
        throw new Error(
          "Payout amount must be at least $0.50. Current amount: $" +
            dist.amount
        );
      }

      try {
        // Create a Stripe Transfer to the connected account
        const transfer = await stripe.transfers.create({
          amount: amountCents,
          currency: "usd",
          destination: collab.stripeConnectAccountId,
          description: `Royalty payout for "${project.title}" — ${collab.artistName} (${dist.splitPercentage}% split)`,
          metadata: {
            distributionId: dist.id.toString(),
            collaboratorId: collab.id.toString(),
            projectId: project.id.toString(),
            artistName: collab.artistName,
          },
        });

        // Mark distribution as paid
        await db
          .update(royaltyDistributions)
          .set({
            status: "paid",
            paidAt: sql`NOW()`,
            transactionRef: transfer.id,
          })
          .where(eq(royaltyDistributions.id, input.distributionId));

        // Notify owner
        await notifyOwner({
          title: "💰 Royalty Payout Sent",
          content: `Payout of $${dist.amount} sent to ${collab.artistName} for "${project.title}" via Stripe Connect. Transfer ID: ${transfer.id}`,
        });

        return {
          success: true,
          transferId: transfer.id,
          amount: dist.amount,
          artistName: collab.artistName,
        };
      } catch (err: any) {
        throw new Error(
          `Stripe transfer failed: ${err.message || "Unknown error"}`
        );
      }
    }),

  /**
   * Batch pay all pending distributions for a project
   */
  batchPayProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project ownership
      const [project] = await db
        .select()
        .from(royaltyProjects)
        .where(
          and(
            eq(royaltyProjects.id, input.projectId),
            eq(royaltyProjects.createdBy, ctx.user.id)
          )
        );
      if (!project) throw new Error("Project not found or access denied");

      // Get all unpaid distributions for this project
      const pendingDists = await db
        .select({
          distribution: royaltyDistributions,
          collaborator: royaltyCollaborators,
        })
        .from(royaltyDistributions)
        .innerJoin(
          royaltyCollaborators,
          eq(royaltyDistributions.collaboratorId, royaltyCollaborators.id)
        )
        .innerJoin(
          royaltyPayments,
          eq(royaltyDistributions.paymentId, royaltyPayments.id)
        )
        .where(
          and(
            eq(royaltyPayments.projectId, input.projectId),
            eq(royaltyDistributions.status, "calculated")
          )
        );

      const results: Array<{
        collaboratorId: number;
        artistName: string;
        amount: string;
        status: "paid" | "skipped" | "failed";
        reason?: string;
        transferId?: string;
      }> = [];

      for (const row of pendingDists) {
        const { distribution: dist, collaborator: collab } = row;

        // Skip if no Stripe Connect
        if (
          !collab.stripeConnectAccountId ||
          !collab.stripeOnboardingComplete
        ) {
          results.push({
            collaboratorId: collab.id,
            artistName: collab.artistName,
            amount: dist.amount,
            status: "skipped",
            reason: "No Stripe Connect account",
          });
          continue;
        }

        const amountCents = Math.round(parseFloat(dist.amount) * 100);
        if (amountCents < 50) {
          results.push({
            collaboratorId: collab.id,
            artistName: collab.artistName,
            amount: dist.amount,
            status: "skipped",
            reason: "Amount below $0.50 minimum",
          });
          continue;
        }

        try {
          const transfer = await stripe.transfers.create({
            amount: amountCents,
            currency: "usd",
            destination: collab.stripeConnectAccountId,
            description: `Royalty payout for "${project.title}" — ${collab.artistName}`,
            metadata: {
              distributionId: dist.id.toString(),
              collaboratorId: collab.id.toString(),
              projectId: project.id.toString(),
            },
          });

          await db
            .update(royaltyDistributions)
            .set({
              status: "paid",
              paidAt: sql`NOW()`,
              transactionRef: transfer.id,
            })
            .where(eq(royaltyDistributions.id, dist.id));

          results.push({
            collaboratorId: collab.id,
            artistName: collab.artistName,
            amount: dist.amount,
            status: "paid",
            transferId: transfer.id,
          });
        } catch (err: any) {
          results.push({
            collaboratorId: collab.id,
            artistName: collab.artistName,
            amount: dist.amount,
            status: "failed",
            reason: err.message || "Transfer failed",
          });
        }
      }

      const paidCount = results.filter((r) => r.status === "paid").length;
      const totalPaid = results
        .filter((r) => r.status === "paid")
        .reduce((s, r) => s + parseFloat(r.amount), 0);

      if (paidCount > 0) {
        await notifyOwner({
          title: "💰 Batch Royalty Payouts Complete",
          content: `${paidCount} payouts totaling $${totalPaid.toFixed(2)} sent for "${project.title}". ${results.filter((r) => r.status === "skipped").length} skipped, ${results.filter((r) => r.status === "failed").length} failed.`,
        });
      }

      return {
        results,
        summary: {
          total: results.length,
          paid: paidCount,
          skipped: results.filter((r) => r.status === "skipped").length,
          failed: results.filter((r) => r.status === "failed").length,
          totalPaid: totalPaid.toFixed(2),
        },
      };
    }),

  /**
   * Get payout history for a project (all transfers)
   */
  getPayoutHistory: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const paidDists = await db
        .select({
          distribution: royaltyDistributions,
          artistName: royaltyCollaborators.artistName,
          role: royaltyCollaborators.role,
          paymentSource: royaltyPayments.source,
          paymentSourceType: royaltyPayments.sourceType,
        })
        .from(royaltyDistributions)
        .innerJoin(
          royaltyCollaborators,
          eq(royaltyDistributions.collaboratorId, royaltyCollaborators.id)
        )
        .innerJoin(
          royaltyPayments,
          eq(royaltyDistributions.paymentId, royaltyPayments.id)
        )
        .where(
          and(
            eq(royaltyPayments.projectId, input.projectId),
            eq(royaltyDistributions.status, "paid")
          )
        )
        .orderBy(desc(royaltyDistributions.paidAt));

      return paidDists;
    }),

  /**
   * Get pending payouts summary for a project
   */
  getPendingPayouts: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const pendingDists = await db
        .select({
          distribution: royaltyDistributions,
          artistName: royaltyCollaborators.artistName,
          role: royaltyCollaborators.role,
          stripeConnectAccountId:
            royaltyCollaborators.stripeConnectAccountId,
          stripeOnboardingComplete:
            royaltyCollaborators.stripeOnboardingComplete,
          payoutMethod: royaltyCollaborators.payoutMethod,
          paymentSource: royaltyPayments.source,
        })
        .from(royaltyDistributions)
        .innerJoin(
          royaltyCollaborators,
          eq(royaltyDistributions.collaboratorId, royaltyCollaborators.id)
        )
        .innerJoin(
          royaltyPayments,
          eq(royaltyDistributions.paymentId, royaltyPayments.id)
        )
        .where(
          and(
            eq(royaltyPayments.projectId, input.projectId),
            eq(royaltyDistributions.status, "calculated")
          )
        )
        .orderBy(desc(royaltyDistributions.createdAt));

      return pendingDists;
    }),
});
