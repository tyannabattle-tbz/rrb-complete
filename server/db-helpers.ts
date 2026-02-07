/**
 * Database helper functions for Solbones, Client Portal, and Review components
 */

import * as db from "./db";
import {
  solbonesFrequencyRolls,
  solbonesLeaderboard,
  clientProfiles,
  clientDonationHistory,
  clientContentUploads,
  reviews,
  reviewHelpfulness,
  reviewResponses,
} from "drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { db as drizzleDb } from "./db";

// ============================================================================
// Solbones Helpers
// ============================================================================

export async function recordFrequencyRoll(
  userId: number,
  frequencyName: string,
  frequency: number,
  notes?: string
) {
  return db.insert(solbonesFrequencyRolls).values({
    userId,
    frequencyName,
    frequency,
    notes,
  });
}

export async function getUserFrequencyHistory(userId: number, limit = 20) {
  return db
    .select()
    .from(solbonesFrequencyRolls)
    .where(eq(solbonesFrequencyRolls.userId, userId))
    .orderBy(desc(solbonesFrequencyRolls.createdAt))
    .limit(limit);
}

export async function getOrCreateLeaderboardEntry(userId: number) {
  const existing = await db
    .select()
    .from(solbonesLeaderboard)
    .where(eq(solbonesLeaderboard.userId, userId));

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(solbonesLeaderboard).values({
    userId,
    totalRolls: 0,
    streak: 0,
    score: 0,
  });

  return db
    .select()
    .from(solbonesLeaderboard)
    .where(eq(solbonesLeaderboard.userId, userId));
}

export async function updateLeaderboardStats(
  userId: number,
  totalRolls: number,
  favoriteFrequency?: string,
  score?: number
) {
  return db
    .update(solbonesLeaderboard)
    .set({
      totalRolls,
      favoriteFrequency,
      score,
      lastRollDate: new Date().toISOString(),
    })
    .where(eq(solbonesLeaderboard.userId, userId));
}

export async function getTopLeaderboard(limit = 10) {
  return db
    .select()
    .from(solbonesLeaderboard)
    .orderBy(desc(solbonesLeaderboard.score))
    .limit(limit);
}

// ============================================================================
// Client Portal Helpers
// ============================================================================

export async function getOrCreateClientProfile(userId: number, email: string) {
  const existing = await db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.userId, userId));

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(clientProfiles).values({
    userId,
    fullName: "Client",
    email,
  });

  return db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.userId, userId));
}

export async function updateClientProfile(userId: number, updates: any) {
  return db
    .update(clientProfiles)
    .set(updates)
    .where(eq(clientProfiles.userId, userId));
}

export async function getClientProfile(userId: number) {
  return db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.userId, userId));
}

export async function recordDonation(
  userId: number,
  amount: number,
  purpose?: string,
  transactionId?: string
) {
  return db.insert(clientDonationHistory).values({
    userId,
    amount,
    purpose,
    transactionId,
    status: "completed",
  });
}

export async function getDonationHistory(userId: number) {
  return db
    .select()
    .from(clientDonationHistory)
    .where(eq(clientDonationHistory.userId, userId))
    .orderBy(desc(clientDonationHistory.createdAt));
}

export async function recordContentUpload(
  userId: number,
  title: string,
  contentUrl: string,
  contentType: "audio" | "video" | "document" | "image",
  fileSize?: number,
  duration?: number
) {
  return db.insert(clientContentUploads).values({
    userId,
    title,
    contentUrl,
    contentType,
    fileSize,
    duration,
    status: "published",
  });
}

export async function getClientContentUploads(userId: number) {
  return db
    .select()
    .from(clientContentUploads)
    .where(eq(clientContentUploads.userId, userId))
    .orderBy(desc(clientContentUploads.createdAt));
}

// ============================================================================
// Review Helpers
// ============================================================================

export async function createReview(
  userId: number,
  rating: number,
  title: string,
  content: string,
  category: string = "general"
) {
  return db.insert(reviews).values({
    userId,
    rating,
    title,
    content,
    category: category as any,
    status: "approved",
    isVerified: 1,
  });
}

export async function getReviews(limit = 10, offset = 0) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getReviewsByCategory(category: string, limit = 10) {
  return db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.status, "approved"),
        eq(reviews.category, category as any)
      )
    )
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getReviewById(reviewId: number) {
  return db.select().from(reviews).where(eq(reviews.id, reviewId));
}

export async function recordReviewHelpfulness(
  reviewId: number,
  userId: number,
  isHelpful: boolean
) {
  const existing = await db
    .select()
    .from(reviewHelpfulness)
    .where(
      and(
        eq(reviewHelpfulness.reviewId, reviewId),
        eq(reviewHelpfulness.userId, userId)
      )
    );

  if (existing.length > 0) {
    return db
      .update(reviewHelpfulness)
      .set({ isHelpful: isHelpful ? 1 : 0 })
      .where(
        and(
          eq(reviewHelpfulness.reviewId, reviewId),
          eq(reviewHelpfulness.userId, userId)
        )
      );
  }

  return db.insert(reviewHelpfulness).values({
    reviewId,
    userId,
    isHelpful: isHelpful ? 1 : 0,
  });
}

export async function getReviewHelpfulnessStats(reviewId: number) {
  const stats = await db
    .select({
      helpful: sql<number>`SUM(CASE WHEN is_helpful = 1 THEN 1 ELSE 0 END)`,
      notHelpful: sql<number>`SUM(CASE WHEN is_helpful = 0 THEN 1 ELSE 0 END)`,
    })
    .from(reviewHelpfulness)
    .where(eq(reviewHelpfulness.reviewId, reviewId));

  return stats[0];
}

export async function getAverageRating() {
  const result = await db
    .select({
      average: sql<number>`AVG(rating)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.status, "approved"));

  return result[0];
}

export async function addReviewResponse(
  reviewId: number,
  responderId: number,
  response: string
) {
  return db.insert(reviewResponses).values({
    reviewId,
    responderId,
    response,
  });
}

export async function getReviewResponses(reviewId: number) {
  return db
    .select()
    .from(reviewResponses)
    .where(eq(reviewResponses.reviewId, reviewId))
    .orderBy(desc(reviewResponses.createdAt));
}
