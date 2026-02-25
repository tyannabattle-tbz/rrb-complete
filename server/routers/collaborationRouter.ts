import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const collaborationRouter = router({
  // Create collaborative project
  createCollaborativeProject: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      collaborators: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const projectId = `project-${Date.now()}`;
      return {
        success: true,
        projectId,
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        collaborators: input.collaborators || [],
        createdAt: new Date(),
        status: 'active',
        message: 'Collaborative project created successfully',
      };
    }),

  // Add collaborator to project
  addCollaborator: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      collaboratorEmail: z.string().email(),
      role: z.enum(['viewer', 'editor', 'admin']).default('editor'),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        projectId: input.projectId,
        userId: ctx.user.id,
        collaboratorEmail: input.collaboratorEmail,
        role: input.role,
        invitationSent: true,
        message: `Invitation sent to ${input.collaboratorEmail}`,
        timestamp: new Date(),
      };
    }),

  // Get project collaborators
  getProjectCollaborators: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return {
        projectId: input.projectId,
        userId: ctx.user.id,
        collaborators: [
          {
            id: 'user-1',
            email: 'john@example.com',
            name: 'John Doe',
            role: 'admin',
            joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
          {
            id: 'user-2',
            email: 'jane@example.com',
            name: 'Jane Smith',
            role: 'editor',
            joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
          {
            id: 'user-3',
            email: 'bob@example.com',
            name: 'Bob Johnson',
            role: 'viewer',
            joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isActive: false,
          },
        ],
      };
    }),

  // Update collaborator role
  updateCollaboratorRole: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      collaboratorId: z.string(),
      role: z.enum(['viewer', 'editor', 'admin']),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        projectId: input.projectId,
        collaboratorId: input.collaboratorId,
        newRole: input.role,
        message: `Collaborator role updated to ${input.role}`,
        timestamp: new Date(),
      };
    }),

  // Remove collaborator
  removeCollaborator: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      collaboratorId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        projectId: input.projectId,
        collaboratorId: input.collaboratorId,
        message: 'Collaborator removed from project',
        timestamp: new Date(),
      };
    }),

  // Get version history
  getVersionHistory: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return {
        projectId: input.projectId,
        userId: ctx.user.id,
        versions: [
          {
            id: 'v-1',
            version: 3,
            author: 'John Doe',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            changes: 'Updated video transitions',
            changeCount: 5,
          },
          {
            id: 'v-2',
            version: 2,
            author: 'Jane Smith',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            changes: 'Added color grading',
            changeCount: 3,
          },
          {
            id: 'v-3',
            version: 1,
            author: 'John Doe',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            changes: 'Initial project creation',
            changeCount: 1,
          },
        ],
        total: 3,
        limit: input.limit,
      };
    }),

  // Restore version
  restoreVersion: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      versionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        projectId: input.projectId,
        versionId: input.versionId,
        message: 'Project restored to selected version',
        restoredAt: new Date(),
      };
    }),

  // Add comment
  addComment: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      clipId: z.string().optional(),
      content: z.string(),
      timestamp: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const commentId = `comment-${Date.now()}`;
      return {
        success: true,
        commentId,
        projectId: input.projectId,
        userId: ctx.user.id,
        content: input.content,
        clipId: input.clipId,
        timestamp: input.timestamp,
        createdAt: new Date(),
        author: ctx.user.id,
      };
    }),

  // Get comments
  getComments: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      clipId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return {
        projectId: input.projectId,
        clipId: input.clipId,
        comments: [
          {
            id: 'comment-1',
            author: 'John Doe',
            authorId: 'user-1',
            content: 'Great transition here!',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            replies: 1,
          },
          {
            id: 'comment-2',
            author: 'Jane Smith',
            authorId: 'user-2',
            content: 'Should we add more effects?',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            replies: 2,
          },
        ],
      };
    }),

  // Reply to comment
  replyToComment: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      commentId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const replyId = `reply-${Date.now()}`;
      return {
        success: true,
        replyId,
        projectId: input.projectId,
        commentId: input.commentId,
        userId: ctx.user.id,
        content: input.content,
        createdAt: new Date(),
      };
    }),

  // Get real-time updates
  getRealTimeUpdates: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return {
        projectId: input.projectId,
        userId: ctx.user.id,
        updates: [
          {
            id: 'update-1',
            type: 'edit',
            user: 'Jane Smith',
            action: 'Modified clip duration',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
          },
          {
            id: 'update-2',
            type: 'comment',
            user: 'John Doe',
            action: 'Added comment on clip',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
          },
          {
            id: 'update-3',
            type: 'version',
            user: 'Bob Johnson',
            action: 'Created new version',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
          },
        ],
      };
    }),

  // Get user activity
  getUserActivity: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      userId: z.string(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return {
        projectId: input.projectId,
        userId: input.userId,
        activity: [
          {
            id: 'activity-1',
            type: 'edit',
            description: 'Modified video clip',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
          {
            id: 'activity-2',
            type: 'comment',
            description: 'Added comment',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            id: 'activity-3',
            type: 'version',
            description: 'Created version 5',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
        ],
        total: 3,
        limit: input.limit,
      };
    }),

  // Share project
  shareProject: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      shareType: z.enum(['link', 'email', 'public']),
      recipients: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const shareId = `share-${Date.now()}`;
      return {
        success: true,
        shareId,
        projectId: input.projectId,
        userId: ctx.user.id,
        shareType: input.shareType,
        shareLink: `https://qumus.app/share/${shareId}`,
        recipients: input.recipients || [],
        message: 'Project shared successfully',
        timestamp: new Date(),
      };
    }),

  // Get shared projects
  getSharedProjects: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return {
        userId: ctx.user.id,
        sharedProjects: [
          {
            id: 'project-1',
            name: 'Marketing Video',
            owner: 'John Doe',
            sharedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            role: 'editor',
            lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
          {
            id: 'project-2',
            name: 'Product Demo',
            owner: 'Jane Smith',
            sharedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            role: 'viewer',
            lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
        total: 2,
        limit: input.limit,
      };
    }),
});
