import { db } from '../db';
import { flowpayTransactions, flowpayAuditLog } from '../../drizzle/schema';
import { invokeLLM } from '../_core/llm';
import { notifyOwner } from '../_core/notification';

interface LedgerAccount {
  id: string;
  userId: number;
  accountType: 'available' | 'pending' | 'reserved' | 'treasury';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalEntry {
  id: string;
  timestamp: Date;
  description: string;
  entries: {
    accountId: string;
    debit?: number;
    credit?: number;
  }[];
  status: 'posted' | 'draft' | 'reversed';
}

interface TrustScoreEvent {
  userId: number;
  eventType: 'on_time_payment' | 'late_payment' | 'communication' | 'dispute' | 'refund';
  points: number;
  timestamp: Date;
  description: string;
}

interface TrustScore {
  userId: number;
  score: number; // 0-100
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEvents: number;
  lastUpdated: Date;
}

/**
 * Ledger-First v2 Service
 * Implements double-entry accounting with behavior-based trust scoring
 * All money movement recorded through journal entries (source of truth)
 * Wallet balances derived from ledger, never mutated directly
 */
export class LedgerFirstV2Service {
  private ledgerAccounts: Map<string, LedgerAccount> = new Map();
  private journalEntries: Map<string, JournalEntry> = new Map();
  private trustScores: Map<number, TrustScore> = new Map();
  private trustEvents: TrustScoreEvent[] = [];

  /**
   * Initialize ledger-first v2 system
   */
  async initialize(): Promise<void> {
    console.log('[LedgerFirstV2] Initializing double-entry ledger system...');

    // Initialize system treasury account
    this.createLedgerAccount('system_treasury', 1, 'treasury', 0);

    console.log('[LedgerFirstV2] Initialization complete. Double-entry ledger ready.');
  }

  /**
   * Create ledger account for user
   */
  private createLedgerAccount(
    accountId: string,
    userId: number,
    accountType: LedgerAccount['accountType'],
    initialBalance: number
  ): LedgerAccount {
    const account: LedgerAccount = {
      id: accountId,
      userId,
      accountType,
      balance: initialBalance,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.ledgerAccounts.set(accountId, account);
    console.log(`[LedgerFirstV2] Created ledger account: ${accountId} (${accountType})`);

    return account;
  }

  /**
   * Record double-entry journal entry
   * All money movement goes through journal entries (source of truth)
   */
  async recordJournalEntry(
    description: string,
    entries: { accountId: string; debit?: number; credit?: number }[]
  ): Promise<JournalEntry | null> {
    try {
      // Validate double-entry balance
      const totalDebits = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
      const totalCredits = entries.reduce((sum, e) => sum + (e.credit || 0), 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        console.error('[LedgerFirstV2] Journal entry does not balance!');
        return null;
      }

      const entryId = `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const journalEntry: JournalEntry = {
        id: entryId,
        timestamp: new Date(),
        description,
        entries,
        status: 'posted',
      };

      this.journalEntries.set(entryId, journalEntry);

      // Update ledger account balances
      for (const entry of entries) {
        const account = this.ledgerAccounts.get(entry.accountId);
        if (account) {
          if (entry.debit) {
            account.balance += entry.debit;
          }
          if (entry.credit) {
            account.balance -= entry.credit;
          }
          account.updatedAt = new Date();
        }
      }

      // Log to audit trail
      await db.insert(flowpayAuditLog).values({
        event_type: 'journal_entry_posted',
        event_id: entryId,
        details: JSON.stringify({
          description,
          totalDebits,
          totalCredits,
          entries,
        }),
        timestamp: new Date(),
      });

      console.log(`[LedgerFirstV2] Journal entry posted: ${entryId} - ${description}`);

      return journalEntry;
    } catch (error) {
      console.error('[LedgerFirstV2] Error recording journal entry:', error);
      return null;
    }
  }

  /**
   * Record P2P transfer using double-entry
   * User A sends $100 to User B:
   * 1. Debit A Available $100 / Credit Clearing $100
   * 2. Debit Clearing $100 / Credit B Pending $100
   * 3. (clear) Debit B Pending $100 / Credit B Available $100
   */
  async recordTransfer(
    fromUserId: number,
    toUserId: number,
    amount: number,
    description: string
  ): Promise<{ success: boolean; journalEntryId?: string }> {
    try {
      // Step 1: Move from user's available to clearing
      const step1 = await this.recordJournalEntry(`Transfer step 1: ${description}`, [
        { accountId: `user_${fromUserId}_available`, debit: amount },
        { accountId: `clearing_account`, credit: amount },
      ]);

      if (!step1) return { success: false };

      // Step 2: Move from clearing to recipient's pending
      const step2 = await this.recordJournalEntry(`Transfer step 2: ${description}`, [
        { accountId: `clearing_account`, debit: amount },
        { accountId: `user_${toUserId}_pending`, credit: amount },
      ]);

      if (!step2) return { success: false };

      // Step 3: Move from recipient's pending to available
      const step3 = await this.recordJournalEntry(`Transfer step 3: ${description}`, [
        { accountId: `user_${toUserId}_pending`, debit: amount },
        { accountId: `user_${toUserId}_available`, credit: amount },
      ]);

      if (!step3) return { success: false };

      // Record trust score events
      await this.recordTrustEvent(fromUserId, 'on_time_payment', 5, 'Completed transfer');
      await this.recordTrustEvent(toUserId, 'on_time_payment', 3, 'Received transfer');

      console.log(`[LedgerFirstV2] Transfer recorded: $${amount} from user ${fromUserId} to user ${toUserId}`);

      return { success: true, journalEntryId: step3.id };
    } catch (error) {
      console.error('[LedgerFirstV2] Error recording transfer:', error);
      return { success: false };
    }
  }

  /**
   * Record trust score event (behavior-based trust)
   */
  async recordTrustEvent(
    userId: number,
    eventType: TrustScoreEvent['eventType'],
    points: number,
    description: string
  ): Promise<void> {
    try {
      const event: TrustScoreEvent = {
        userId,
        eventType,
        points,
        timestamp: new Date(),
        description,
      };

      this.trustEvents.push(event);

      // Update trust score
      await this.updateTrustScore(userId);

      console.log(`[LedgerFirstV2] Trust event recorded: User ${userId} - ${eventType} (+${points} points)`);
    } catch (error) {
      console.error('[LedgerFirstV2] Error recording trust event:', error);
    }
  }

  /**
   * Update trust score based on events (behavior-based, not credit-based)
   */
  private async updateTrustScore(userId: number): Promise<void> {
    try {
      const userEvents = this.trustEvents.filter((e) => e.userId === userId);

      // Calculate score based on behavior
      let score = 50; // Start at 50

      // On-time payments
      const onTimePayments = userEvents.filter((e) => e.eventType === 'on_time_payment').length;
      score += Math.min(onTimePayments * 2, 30);

      // Late payments (negative)
      const latePayments = userEvents.filter((e) => e.eventType === 'late_payment').length;
      score -= latePayments * 5;

      // Communication (positive)
      const communications = userEvents.filter((e) => e.eventType === 'communication').length;
      score += Math.min(communications, 10);

      // Disputes (negative)
      const disputes = userEvents.filter((e) => e.eventType === 'dispute').length;
      score -= disputes * 10;

      // Refunds (slight negative)
      const refunds = userEvents.filter((e) => e.eventType === 'refund').length;
      score -= refunds * 2;

      // Clamp score to 0-100
      score = Math.max(0, Math.min(100, score));

      // Determine trust level
      let level: TrustScore['level'];
      if (score >= 90) level = 'platinum';
      else if (score >= 75) level = 'gold';
      else if (score >= 60) level = 'silver';
      else level = 'bronze';

      const trustScore: TrustScore = {
        userId,
        score,
        level,
        totalEvents: userEvents.length,
        lastUpdated: new Date(),
      };

      this.trustScores.set(userId, trustScore);

      console.log(
        `[LedgerFirstV2] Trust score updated: User ${userId} - ${score}/100 (${level.toUpperCase()})`
      );

      // Notify owner of significant trust changes
      if (score >= 90 || score <= 30) {
        await notifyOwner({
          title: `🎖️ Trust Score Update (LedgerFirstV2)`,
          content: `User ${userId} trust score: ${score}/100 (${level.toUpperCase()}). Events: ${userEvents.length}`,
        });
      }
    } catch (error) {
      console.error('[LedgerFirstV2] Error updating trust score:', error);
    }
  }

  /**
   * Get user's derived wallet balance from ledger
   */
  getWalletBalance(userId: number): number {
    const availableAccount = this.ledgerAccounts.get(`user_${userId}_available`);
    return availableAccount ? availableAccount.balance : 0;
  }

  /**
   * Get user's trust score
   */
  getTrustScore(userId: number): TrustScore | null {
    return this.trustScores.get(userId) || null;
  }

  /**
   * Get all journal entries for user
   */
  getUserJournalEntries(userId: number): JournalEntry[] {
    return Array.from(this.journalEntries.values()).filter((je) =>
      je.entries.some((e) => e.accountId.includes(`user_${userId}`))
    );
  }

  /**
   * Get ledger audit trail
   */
  getLedgerAuditTrail(limit: number = 50): JournalEntry[] {
    return Array.from(this.journalEntries.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Verify ledger integrity (all accounts balance)
   */
  verifyLedgerIntegrity(): { isValid: boolean; totalDebits: number; totalCredits: number } {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const entry of this.journalEntries.values()) {
      for (const line of entry.entries) {
        if (line.debit) totalDebits += line.debit;
        if (line.credit) totalCredits += line.credit;
      }
    }

    const isValid = Math.abs(totalDebits - totalCredits) < 0.01;

    console.log(`[LedgerFirstV2] Ledger integrity check: ${isValid ? 'VALID' : 'INVALID'}`);
    console.log(`  Total debits: $${totalDebits.toFixed(2)}`);
    console.log(`  Total credits: $${totalCredits.toFixed(2)}`);

    return { isValid, totalDebits, totalCredits };
  }

  /**
   * Get community treasury balance
   */
  getTreasuryBalance(): number {
    const treasuryAccount = this.ledgerAccounts.get('system_treasury');
    return treasuryAccount ? treasuryAccount.balance : 0;
  }

  /**
   * Get ledger statistics
   */
  getLedgerStats(): {
    totalAccounts: number;
    totalJournalEntries: number;
    totalTrustEvents: number;
    treasuryBalance: number;
    averageTrustScore: number;
  } {
    const trustScores = Array.from(this.trustScores.values());
    const avgTrust =
      trustScores.length > 0
        ? trustScores.reduce((sum, ts) => sum + ts.score, 0) / trustScores.length
        : 0;

    return {
      totalAccounts: this.ledgerAccounts.size,
      totalJournalEntries: this.journalEntries.size,
      totalTrustEvents: this.trustEvents.length,
      treasuryBalance: this.getTreasuryBalance(),
      averageTrustScore: Math.round(avgTrust),
    };
  }
}

// Export singleton instance
export const ledgerFirstV2Service = new LedgerFirstV2Service();
