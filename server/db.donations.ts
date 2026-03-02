/**
 * Donation Database Helpers
 * CRUD operations for donations and tiers
 */

import { getDb } from './db';
import { donations, donationTiers, type InsertDonation, type Donation, type DonationTier } from '../drizzle/donationSchema';
import { eq } from 'drizzle-orm';

/**
 * Get all active donation tiers
 */
export async function getActiveDonationTiers(): Promise<DonationTier[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const allTiers = await db.select().from(donationTiers);
    return allTiers.filter(t => t.isActive);
  } catch (error) {
    console.error('[Donations] Failed to fetch tiers:', error);
    return [];
  }
}

/**
 * Get a specific donation tier
 */
export async function getDonationTierById(id: number): Promise<DonationTier | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(donationTiers).where(eq(donationTiers.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('[Donations] Failed to fetch tier:', error);
    return null;
  }
}

/**
 * Create a new donation
 */
export async function createDonation(donation: InsertDonation): Promise<Donation | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(donations).values(donation);
    // Fetch and return the created donation
    const result = await db.select().from(donations).where(eq(donations.userId, donation.userId));
    return result[result.length - 1] || null;
  } catch (error) {
    console.error('[Donations] Failed to create donation:', error);
    return null;
  }
}

/**
 * Get donations by user ID
 */
export async function getDonationsByUserId(userId: number): Promise<Donation[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(donations).where(eq(donations.userId, userId));
  } catch (error) {
    console.error('[Donations] Failed to fetch donations:', error);
    return [];
  }
}

/**
 * Get a donation by Stripe payment intent ID
 */
export async function getDonationByStripePaymentIntent(
  paymentIntentId: string
): Promise<Donation | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(donations)
      .where(eq(donations.stripePaymentIntentId, paymentIntentId));
    return result[0] || null;
  } catch (error) {
    console.error('[Donations] Failed to fetch donation by payment intent:', error);
    return null;
  }
}

/**
 * Update a donation
 */
export async function updateDonation(
  id: number,
  updates: Partial<InsertDonation>
): Promise<Donation | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.update(donations).set(updates).where(eq(donations.id, id));
    const result = await db.select().from(donations).where(eq(donations.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('[Donations] Failed to update donation:', error);
    return null;
  }
}

/**
 * Get donation statistics
 */
export async function getDonationStats(): Promise<{
  totalDonations: number;
  totalAmount: string;
  completedDonations: number;
  recurringDonors: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalDonations: 0,
      totalAmount: '0',
      completedDonations: 0,
      recurringDonors: 0,
    };
  }

  try {
    const allDonations = await db.select().from(donations);
    const completedDonations = allDonations.filter(d => d.status === 'completed');
    const recurringDonors = new Set(
      allDonations.filter(d => d.isRecurring && d.status === 'completed').map(d => d.userId)
    ).size;

    const totalAmount = completedDonations
      .reduce((sum, d) => sum + parseFloat(d.amount), 0)
      .toFixed(2);

    return {
      totalDonations: allDonations.length,
      totalAmount,
      completedDonations: completedDonations.length,
      recurringDonors,
    };
  } catch (error) {
    console.error('[Donations] Failed to fetch stats:', error);
    return {
      totalDonations: 0,
      totalAmount: '0',
      completedDonations: 0,
      recurringDonors: 0,
    };
  }
}

/**
 * Get user's highest tier donation
 */
export async function getUserHighestTier(userId: number): Promise<DonationTier | null> {
  const userDonations = await getDonationsByUserId(userId);
  const completedDonations = userDonations.filter(d => d.status === 'completed');

  if (completedDonations.length === 0) return null;

  // Get the tier with the highest amount
  let highestTier: DonationTier | null = null;
  let highestAmount = 0;

  for (const donation of completedDonations) {
    const tier = await getDonationTierById(donation.tierId);
    if (tier) {
      const amount = parseFloat(tier.amount);
      if (amount > highestAmount) {
        highestAmount = amount;
        highestTier = tier;
      }
    }
  }

  return highestTier;
}
