/**
 * Proof Vault Database Helpers
 * CRUD operations for proof vault entries
 */

import { getDb } from './db';
import { proofVault, type InsertProofVault, type ProofVault } from '../drizzle/proofVaultSchema';
import { eq, and } from 'drizzle-orm';

/**
 * Create a new proof vault entry
 */
export async function createProofVaultEntry(
  entry: InsertProofVault
): Promise<ProofVault | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(proofVault).values(entry);
    // Fetch and return the created entry
    const result = await db.select().from(proofVault).where(eq(proofVault.userId, entry.userId));
    return result[result.length - 1] || null;
  } catch (error) {
    console.error('[ProofVault] Failed to create entry:', error);
    return null;
  }
}

/**
 * Get proof vault entries by user ID
 */
export async function getProofVaultByUserId(userId: number): Promise<ProofVault[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(proofVault).where(eq(proofVault.userId, userId));
  } catch (error) {
    console.error('[ProofVault] Failed to fetch entries:', error);
    return [];
  }
}

/**
 * Get proof vault entries by category
 */
export async function getProofVaultByCategory(
  userId: number,
  category: 'discogs' | 'usco' | 'bmi_mlc' | 'soundexchange'
): Promise<ProofVault[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(proofVault)
      .where(and(eq(proofVault.userId, userId), eq(proofVault.category, category)));
  } catch (error) {
    console.error('[ProofVault] Failed to fetch entries by category:', error);
    return [];
  }
}

/**
 * Get proof vault entry by ID
 */
export async function getProofVaultById(id: number): Promise<ProofVault | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(proofVault).where(eq(proofVault.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('[ProofVault] Failed to fetch entry by ID:', error);
    return null;
  }
}

/**
 * Update proof vault entry
 */
export async function updateProofVaultEntry(
  id: number,
  updates: Partial<InsertProofVault>
): Promise<ProofVault | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.update(proofVault).set(updates).where(eq(proofVault.id, id));
    return getProofVaultById(id);
  } catch (error) {
    console.error('[ProofVault] Failed to update entry:', error);
    return null;
  }
}

/**
 * Delete proof vault entry
 */
export async function deleteProofVaultEntry(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.delete(proofVault).where(eq(proofVault.id, id));
    return true;
  } catch (error) {
    console.error('[ProofVault] Failed to delete entry:', error);
    return false;
  }
}

/**
 * Get verified proof vault entries
 */
export async function getVerifiedProofVault(userId: number): Promise<ProofVault[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(proofVault)
      .where(
        and(
          eq(proofVault.userId, userId),
          eq(proofVault.verificationStatus, 'verified')
        )
      );
  } catch (error) {
    console.error('[ProofVault] Failed to fetch verified entries:', error);
    return [];
  }
}

/**
 * Get proof vault statistics
 */
export async function getProofVaultStats(userId: number): Promise<{
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  byCategory: Record<string, number>;
}> {
  const entries = await getProofVaultByUserId(userId);
  
  const stats = {
    total: entries.length,
    verified: entries.filter(e => e.verificationStatus === 'verified').length,
    pending: entries.filter(e => e.verificationStatus === 'pending').length,
    rejected: entries.filter(e => e.verificationStatus === 'rejected').length,
    byCategory: {
      discogs: entries.filter(e => e.category === 'discogs').length,
      usco: entries.filter(e => e.category === 'usco').length,
      bmi_mlc: entries.filter(e => e.category === 'bmi_mlc').length,
      soundexchange: entries.filter(e => e.category === 'soundexchange').length,
    },
  };

  return stats;
}
