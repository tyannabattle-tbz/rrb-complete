/**
 * Entertainment Platform - Monetization System
 * Revenue tracking, payouts, and monetization settings
 */

import { getDb } from './db';
import {
  monetizationEvents,
  entertainmentMetrics,
  mediaProjects,
  users,
} from '../drizzle/schema';
import { eq, and, sum } from 'drizzle-orm';

interface MonetizationEventInput {
  userId?: number;
  contentId?: string;
  projectId?: string;
  eventType: 'ad_impression' | 'ad_click' | 'subscription' | 'donation' | 'merchandise' | 'sponsorship' | 'affiliate';
  platform?: string;
  revenue: number;
  currency?: string;
  metadata?: Record<string, any>;
}

interface RevenueReportInput {
  userId?: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
}

/**
 * Record monetization event
 */
export async function recordMonetizationEvent(input: MonetizationEventInput) {
  try {
    const db = await getDb();
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(monetizationEvents).values({
      eventId,
      userId: input.userId,
      contentId: input.contentId,
      projectId: input.projectId,
      eventType: input.eventType,
      platform: input.platform,
      revenue: input.revenue,
      currency: input.currency || 'USD',
      metadata: input.metadata,
    });

    return {
      eventId,
      eventType: input.eventType,
      revenue: input.revenue,
      currency: input.currency || 'USD',
      message: 'Monetization event recorded',
    };
  } catch (error) {
    console.error('Error recording monetization event:', error);
    throw error;
  }
}

/**
 * Get user's total revenue
 */
export async function getUserTotalRevenue(userId: number) {
  try {
    const db = await getDb();

    const events = await db
      .select()
      .from(monetizationEvents)
      .where(eq(monetizationEvents.userId, userId));

    const totalRevenue = events.reduce((sum, event) => sum + Number(event.revenue || 0), 0);

    return {
      userId,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      eventCount: events.length,
      byType: {
        adImpressions: events.filter((e) => e.eventType === 'ad_impression').length,
        adClicks: events.filter((e) => e.eventType === 'ad_click').length,
        subscriptions: events.filter((e) => e.eventType === 'subscription').length,
        donations: events.filter((e) => e.eventType === 'donation').length,
        merchandise: events.filter((e) => e.eventType === 'merchandise').length,
        sponsorships: events.filter((e) => e.eventType === 'sponsorship').length,
        affiliate: events.filter((e) => e.eventType === 'affiliate').length,
      },
    };
  } catch (error) {
    console.error('Error fetching user total revenue:', error);
    throw error;
  }
}

/**
 * Get revenue by event type
 */
export async function getRevenueByEventType(userId: number) {
  try {
    const db = await getDb();

    const events = await db
      .select()
      .from(monetizationEvents)
      .where(eq(monetizationEvents.userId, userId));

    const byType: Record<string, { count: number; revenue: number }> = {
      ad_impression: { count: 0, revenue: 0 },
      ad_click: { count: 0, revenue: 0 },
      subscription: { count: 0, revenue: 0 },
      donation: { count: 0, revenue: 0 },
      merchandise: { count: 0, revenue: 0 },
      sponsorship: { count: 0, revenue: 0 },
      affiliate: { count: 0, revenue: 0 },
    };

    for (const event of events) {
      if (byType[event.eventType]) {
        byType[event.eventType].count += 1;
        byType[event.eventType].revenue += Number(event.revenue || 0);
      }
    }

    return {
      userId,
      byType,
    };
  } catch (error) {
    console.error('Error fetching revenue by event type:', error);
    throw error;
  }
}

/**
 * Get revenue by platform
 */
export async function getRevenueByPlatform(userId: number) {
  try {
    const db = await getDb();

    const events = await db
      .select()
      .from(monetizationEvents)
      .where(eq(monetizationEvents.userId, userId));

    const byPlatform: Record<string, { count: number; revenue: number }> = {};

    for (const event of events) {
      const platform = event.platform || 'direct';
      if (!byPlatform[platform]) {
        byPlatform[platform] = { count: 0, revenue: 0 };
      }
      byPlatform[platform].count += 1;
      byPlatform[platform].revenue += Number(event.revenue || 0);
    }

    return {
      userId,
      byPlatform,
    };
  } catch (error) {
    console.error('Error fetching revenue by platform:', error);
    throw error;
  }
}

/**
 * Get revenue by content
 */
export async function getRevenueByContent(userId: number, limit: number = 10) {
  try {
    const db = await getDb();

    const events = await db
      .select()
      .from(monetizationEvents)
      .where(eq(monetizationEvents.userId, userId));

    const byContent: Record<string, { count: number; revenue: number }> = {};

    for (const event of events) {
      if (event.contentId) {
        if (!byContent[event.contentId]) {
          byContent[event.contentId] = { count: 0, revenue: 0 };
        }
        byContent[event.contentId].count += 1;
        byContent[event.contentId].revenue += Number(event.revenue || 0);
      }
    }

    // Sort by revenue and limit
    const sorted = Object.entries(byContent)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, limit);

    return {
      userId,
      topContent: Object.fromEntries(sorted),
    };
  } catch (error) {
    console.error('Error fetching revenue by content:', error);
    throw error;
  }
}

/**
 * Get revenue report for period
 */
export async function getRevenueReport(input: RevenueReportInput) {
  try {
    const db = await getDb();

    let query = db.select().from(monetizationEvents);

    if (input.userId) {
      query = query.where(eq(monetizationEvents.userId, input.userId));
    }

    const allEvents = await query;

    // Filter by date range if provided
    let events = allEvents;
    if (input.startDate || input.endDate) {
      events = allEvents.filter((e) => {
        const eventDate = new Date(e.createdAt);
        if (input.startDate && eventDate < input.startDate) return false;
        if (input.endDate && eventDate > input.endDate) return false;
        return true;
      });
    }

    const totalRevenue = events.reduce((sum, e) => sum + Number(e.revenue || 0), 0);
    const avgRevenue = events.length > 0 ? totalRevenue / events.length : 0;

    return {
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRevenue: Math.round(avgRevenue * 100) / 100,
      eventCount: events.length,
      topEventType: getTopEventType(events),
      topPlatform: getTopPlatform(events),
    };
  } catch (error) {
    console.error('Error generating revenue report:', error);
    throw error;
  }
}

/**
 * Helper: Get top event type
 */
function getTopEventType(events: any[]): string {
  const types: Record<string, number> = {};
  for (const event of events) {
    types[event.eventType] = (types[event.eventType] || 0) + 1;
  }
  return Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
}

/**
 * Helper: Get top platform
 */
function getTopPlatform(events: any[]): string {
  const platforms: Record<string, number> = {};
  for (const event of events) {
    const platform = event.platform || 'direct';
    platforms[platform] = (platforms[platform] || 0) + 1;
  }
  return Object.entries(platforms).sort((a, b) => b[1] - a[1])[0]?.[0] || 'direct';
}

/**
 * Get payout history
 */
export async function getPayoutHistory(userId: number, limit: number = 50) {
  try {
    const db = await getDb();

    const events = await db
      .select()
      .from(monetizationEvents)
      .where(eq(monetizationEvents.userId, userId))
      .limit(limit);

    return events.map((e) => ({
      eventId: e.eventId,
      eventType: e.eventType,
      platform: e.platform,
      revenue: e.revenue,
      currency: e.currency,
      createdAt: e.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching payout history:', error);
    throw error;
  }
}

/**
 * Get platform-wide revenue metrics
 */
export async function getPlatformRevenueMetrics() {
  try {
    const db = await getDb();

    const allEvents = await db.select().from(monetizationEvents);

    const totalRevenue = allEvents.reduce((sum, e) => sum + Number(e.revenue || 0), 0);
    const totalEvents = allEvents.length;

    // Get top earners
    const userRevenue: Record<number, number> = {};
    for (const event of allEvents) {
      if (event.userId) {
        userRevenue[event.userId] = (userRevenue[event.userId] || 0) + Number(event.revenue || 0);
      }
    }

    const topEarners = Object.entries(userRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, revenue]) => ({
        userId: Number(userId),
        revenue: Math.round(revenue * 100) / 100,
      }));

    // Get event type distribution
    const eventTypeDistribution: Record<string, number> = {};
    for (const event of allEvents) {
      eventTypeDistribution[event.eventType] = (eventTypeDistribution[event.eventType] || 0) + 1;
    }

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalEvents,
      averageEventRevenue: Math.round((totalRevenue / totalEvents) * 100) / 100,
      topEarners,
      eventTypeDistribution,
    };
  } catch (error) {
    console.error('Error fetching platform revenue metrics:', error);
    throw error;
  }
}

/**
 * Update user entertainment metrics
 */
export async function updateEntertainmentMetrics(userId: number, period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  try {
    const db = await getDb();

    // Get user's revenue for period
    const revenue = await getUserTotalRevenue(userId);

    // Get user's projects
    const projects = await db.select().from(mediaProjects).where(eq(mediaProjects.userId, userId));

    let totalViews = 0;
    let totalEngagement = 0;
    let totalRevenue = revenue.totalRevenue;

    for (const project of projects) {
      totalViews += project.views || 0;
      totalEngagement += (project.likes || 0) + (project.shares || 0) + (project.comments || 0);
    }

    const metricsId = `metrics_${userId}_${period}_${Date.now()}`;

    await db.insert(entertainmentMetrics).values({
      metricsId,
      userId,
      period,
      totalViews,
      totalEngagement,
      totalRevenue,
      averageDuration: 0,
      growthRate: 0,
      activeProjects: projects.length,
      topContent: JSON.stringify(projects.slice(0, 5).map((p) => ({ id: p.projectId, views: p.views }))),
    });

    return {
      userId,
      period,
      totalViews,
      totalEngagement,
      totalRevenue,
      activeProjects: projects.length,
      message: 'Entertainment metrics updated',
    };
  } catch (error) {
    console.error('Error updating entertainment metrics:', error);
    throw error;
  }
}

/**
 * Get monetization settings for user
 */
export async function getMonetizationSettings(userId: number) {
  try {
    const db = await getDb();

    const user = await db.select().from(users).where(eq(users.id, userId));

    if (!user.length) throw new Error('User not found');

    return {
      userId,
      currentTier: user[0].currentTier,
      stripeCustomerId: user[0].stripeCustomerId,
      stripeSubscriptionId: user[0].stripeSubscriptionId,
      subscriptionStatus: user[0].subscriptionStatus,
      monetizationEnabled: !!user[0].stripeCustomerId,
    };
  } catch (error) {
    console.error('Error fetching monetization settings:', error);
    throw error;
  }
}
