import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { collaborationInvites, sessionCollaborators, agentSessions, users } from "../../drizzle/schema";
import { EmailNotificationService } from "../services/emailNotifications";
import crypto from "crypto";

export const collaborationInvitesRouter = router({
  // Create invite
  createInvite: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      invitedEmail: z.string().email(),
      permission: z.enum(["view", "edit", "admin"]).default("view"),
      expiresInDays: z.number().default(7),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Verify session ownership
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Generate unique invite code
        const inviteCode = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);

        // Create invite
        const result = await database.insert(collaborationInvites).values({
          sessionId: input.sessionId,
          invitedBy: ctx.user.id,
          inviteCode,
          invitedEmail: input.invitedEmail,
          permission: input.permission,
          status: "pending",
          expiresAt,
        });

        // Send email notification
        await EmailNotificationService.sendCollaborationNotification(
          input.invitedEmail,
          ctx.user.name || "A user",
          session.sessionName
        );

        return {
          success: true,
          inviteCode,
          inviteUrl: `/invite/${inviteCode}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Accept invite
  acceptInvite: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Find invite
        const invite = await (database as any).query.collaborationInvites.findFirst({
          where: eq(collaborationInvites.inviteCode, input.inviteCode),
        }) as any;

        if (!invite) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
        }

        if (invite.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invite is no longer valid" });
        }

        if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invite has expired" });
        }

        // Add collaborator
        await database.insert(sessionCollaborators).values({
          sessionId: invite.sessionId,
          userId: ctx.user.id,
          permission: invite.permission,
        });

        // Update invite status
        await database.update(collaborationInvites)
          .set({
            status: "accepted",
            acceptedAt: new Date(),
          })
          .where(eq(collaborationInvites.id, invite.id));

        // Get session details
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, invite.sessionId),
        }) as any;

        return {
          success: true,
          sessionId: invite.sessionId,
          sessionName: session?.sessionName,
          permission: invite.permission,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get pending invites
  getPendingInvites: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const invites = await (database as any).query.collaborationInvites.findMany({
        where: eq(collaborationInvites.invitedEmail, ctx.user.email || ""),
      }) as any[];

      // Filter out expired invites
      const validInvites = invites.filter((invite) => {
        if (invite.status !== "pending") return false;
        if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) return false;
        return true;
      });

      return validInvites;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
    }
  }),

  // Get session collaborators
  getCollaborators: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Verify access
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;

        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Check if user is owner or collaborator
        const isOwner = session.userId === ctx.user.id;
        const isCollaborator = await (database as any).query.sessionCollaborators.findFirst({
          where: eq(sessionCollaborators.sessionId, input.sessionId),
        }) as any;

        if (!isOwner && !isCollaborator) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Get all collaborators
        const collaborators = await (database as any).query.sessionCollaborators.findMany({
          where: eq(sessionCollaborators.sessionId, input.sessionId),
        }) as any[];

        // Get user details for each collaborator
        const collaboratorDetails = await Promise.all(
          collaborators.map(async (collab: any) => {
            const user = await (database as any).query.users.findFirst({
              where: eq(users.id, collab.userId),
            }) as any;
            return {
              ...collab,
              userName: user?.name,
              userEmail: user?.email,
            };
          })
        );

        return collaboratorDetails;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Remove collaborator
  removeCollaborator: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      collaboratorId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Verify ownership
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Remove collaborator
        await database.delete(sessionCollaborators)
          .where(eq(sessionCollaborators.sessionId, input.sessionId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Revoke invite
  revokeInvite: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Find invite
        const invite = await (database as any).query.collaborationInvites.findFirst({
          where: eq(collaborationInvites.inviteCode, input.inviteCode),
        }) as any;

        if (!invite || invite.invitedBy !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Update status
        await database.update(collaborationInvites)
          .set({ status: "expired" })
          .where(eq(collaborationInvites.inviteCode, input.inviteCode));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),
});
