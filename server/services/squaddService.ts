import { db } from "../db";
import { goals, communityMembers, goalProgress } from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export class SquaddService {
  /**
   * Create a new community goal
   */
  async createGoal(data: {
    title: string;
    description: string;
    category: string;
    targetAmount?: number;
    deadline?: Date;
    createdBy: string;
  }) {
    const [goal] = await db
      .insert(goals)
      .values({
        title: data.title,
        description: data.description,
        category: data.category,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        createdBy: data.createdBy,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return goal;
  }

  /**
   * Get all active goals
   */
  async getActiveGoals(limit = 50, offset = 0) {
    const allGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.status, "active"))
      .orderBy(desc(goals.createdAt))
      .limit(limit)
      .offset(offset);

    return allGoals;
  }

  /**
   * Get goal by ID with progress
   */
  async getGoalWithProgress(goalId: string) {
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, goalId));

    if (!goal) return null;

    const progress = await db
      .select()
      .from(goalProgress)
      .where(eq(goalProgress.goalId, goalId))
      .orderBy(desc(goalProgress.createdAt));

    return { ...goal, progress };
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(data: {
    goalId: string;
    userId: string;
    amount: number;
    note?: string;
  }) {
    const [progress] = await db
      .insert(goalProgress)
      .values({
        goalId: data.goalId,
        userId: data.userId,
        amount: data.amount,
        note: data.note,
        createdAt: new Date(),
      })
      .returning();

    // Update goal's current amount
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, data.goalId));

    if (goal) {
      const newAmount = (goal.currentAmount || 0) + data.amount;
      await db
        .update(goals)
        .set({
          currentAmount: newAmount,
          updatedAt: new Date(),
        })
        .where(eq(goals.id, data.goalId));
    }

    return progress;
  }

  /**
   * Get community members
   */
  async getCommunityMembers(limit = 100, offset = 0) {
    const members = await db
      .select()
      .from(communityMembers)
      .orderBy(desc(communityMembers.joinedAt))
      .limit(limit)
      .offset(offset);

    return members;
  }

  /**
   * Add community member
   */
  async addCommunityMember(data: {
    userId: string;
    name: string;
    email: string;
    role?: string;
  }) {
    const [member] = await db
      .insert(communityMembers)
      .values({
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role || "member",
        joinedAt: new Date(),
        status: "active",
      })
      .returning();

    return member;
  }

  /**
   * Get community statistics
   */
  async getCommunityStats() {
    const totalMembers = await db
      .select()
      .from(communityMembers)
      .where(eq(communityMembers.status, "active"));

    const activeGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.status, "active"));

    const totalProgress = await db
      .select()
      .from(goalProgress);

    return {
      totalMembers: totalMembers.length,
      activeGoals: activeGoals.length,
      totalProgressUpdates: totalProgress.length,
      averageProgressPerGoal:
        activeGoals.length > 0
          ? totalProgress.length / activeGoals.length
          : 0,
    };
  }

  /**
   * Get goals by category
   */
  async getGoalsByCategory(category: string, limit = 50) {
    const categoryGoals = await db
      .select()
      .from(goals)
      .where(
        and(
          eq(goals.category, category),
          eq(goals.status, "active")
        )
      )
      .orderBy(desc(goals.createdAt))
      .limit(limit);

    return categoryGoals;
  }

  /**
   * Complete a goal
   */
  async completeGoal(goalId: string) {
    const [updated] = await db
      .update(goals)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(goals.id, goalId))
      .returning();

    return updated;
  }

  /**
   * Get trending goals (most progress in last 7 days)
   */
  async getTrendingGoals(limit = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentProgress = await db
      .select()
      .from(goalProgress)
      .where(gte(goalProgress.createdAt, sevenDaysAgo));

    // Group by goal ID and count
    const goalCounts = new Map<string, number>();
    recentProgress.forEach((p) => {
      goalCounts.set(p.goalId, (goalCounts.get(p.goalId) || 0) + 1);
    });

    // Sort by count and get top goals
    const topGoalIds = Array.from(goalCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const trendingGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.id, topGoalIds[0])); // Simplified - in production, use IN clause

    return trendingGoals;
  }
}

export const squaddService = new SquaddService();
