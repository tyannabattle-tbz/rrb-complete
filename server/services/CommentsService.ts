import { db } from '../db';
import { comments } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface CommentInput {
  contentId: string;
  contentType: 'song' | 'podcast' | 'video' | 'article';
  userId: string;
  userName: string;
  content: string;
  parentCommentId?: string;
}

export interface CommentUpdate {
  content: string;
}

export class CommentsService {
  async createComment(input: CommentInput) {
    const comment = await db.insert(comments).values({
      id: `cmt_${Date.now()}`,
      contentId: input.contentId,
      contentType: input.contentType,
      userId: input.userId,
      userName: input.userName,
      content: input.content,
      parentCommentId: input.parentCommentId,
      likes: 0,
      isModerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return comment[0];
  }

  async getCommentsByContent(
    contentId: string,
    contentType: string,
    limit = 50,
    offset = 0
  ) {
    return await db.query.comments.findMany({
      where: and(
        eq(comments.contentId, contentId),
        eq(comments.contentType, contentType as any),
        eq(comments.isModerated, false)
      ),
      orderBy: [desc(comments.likes), desc(comments.createdAt)],
      limit,
      offset,
    });
  }

  async getThreadedComments(contentId: string, contentType: string) {
    const allComments = await db.query.comments.findMany({
      where: and(
        eq(comments.contentId, contentId),
        eq(comments.contentType, contentType as any),
        eq(comments.isModerated, false)
      ),
      orderBy: [desc(comments.createdAt)],
    });

    // Build threaded structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    for (const comment of allComments) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    for (const comment of allComments) {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    }

    return rootComments;
  }

  async updateComment(
    commentId: string,
    userId: string,
    updates: CommentUpdate
  ) {
    const comment = await db
      .update(comments)
      .set({
        content: updates.content,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.userId, userId)
        )
      )
      .returning();
    return comment[0];
  }

  async deleteComment(commentId: string, userId: string) {
    // Delete comment and its replies
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });

    if (comment?.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete replies first
    await db
      .delete(comments)
      .where(eq(comments.parentCommentId, commentId));

    // Delete the comment
    await db.delete(comments).where(eq(comments.id, commentId));
  }

  async likeComment(commentId: string) {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });

    if (!comment) throw new Error('Comment not found');

    return await db
      .update(comments)
      .set({
        likes: (comment.likes || 0) + 1,
      })
      .where(eq(comments.id, commentId))
      .returning();
  }

  async moderateComment(commentId: string, isModerated: boolean) {
    return await db
      .update(comments)
      .set({
        isModerated,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();
  }

  async getCommentCount(contentId: string, contentType: string) {
    const result = await db.query.comments.findMany({
      where: and(
        eq(comments.contentId, contentId),
        eq(comments.contentType, contentType as any),
        eq(comments.isModerated, false)
      ),
    });
    return result.length;
  }

  async searchComments(query: string, limit = 20) {
    return await db.query.comments.findMany({
      where: eq(comments.isModerated, false),
      limit,
    }).then((results) =>
      results.filter(
        (c) =>
          c.content.toLowerCase().includes(query.toLowerCase()) ||
          c.userName.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
}

export const commentsService = new CommentsService();
