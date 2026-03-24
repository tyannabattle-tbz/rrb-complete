/**
 * Solbones Game & Sweet Miracles Integration
 * Cross-promotes sacred math dice game and nonprofit fundraising with RRB Media Studio
 */

export interface SolbonesGameSession {
  id: string;
  performanceId: string;
  playerId: string;
  playerName: string;
  gameType: 'classic' | 'frequency' | 'challenge';
  score: number;
  diceRolls: number[];
  frequencyUsed: number; // Hz
  rewardPoints: number;
  startedAt: number;
  endedAt?: number;
}

export interface SweetMiraclesCampaign {
  id: string;
  performanceId: string;
  campaignName: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  donors: SweetMiraclesDonor[];
  startedAt: number;
  endedAt?: number;
  isActive: boolean;
}

export interface SweetMiraclesDonor {
  id: string;
  name: string;
  email: string;
  amount: number;
  message?: string;
  timestamp: number;
}

class SolbonesSweetMiraclesIntegration {
  private gameSessions: Map<string, SolbonesGameSession> = new Map();
  private campaigns: Map<string, SweetMiraclesCampaign> = new Map();
  private totalDonations: number = 0;

  /**
   * Start Solbones game session during performance
   */
  startGameSession(
    performanceId: string,
    playerId: string,
    playerName: string,
    gameType: 'classic' | 'frequency' | 'challenge' = 'classic'
  ): SolbonesGameSession {
    const session: SolbonesGameSession = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performanceId,
      playerId,
      playerName,
      gameType,
      score: 0,
      diceRolls: [],
      frequencyUsed: 0,
      rewardPoints: 0,
      startedAt: Date.now(),
    };

    this.gameSessions.set(session.id, session);
    console.log(`[Solbones] Game session started: ${playerName} (${gameType})`);
    return session;
  }

  /**
   * Roll dice in Solbones game
   */
  rollDice(sessionId: string): number[] {
    const session = this.gameSessions.get(sessionId);
    if (!session) {
      throw new Error('Game session not found');
    }

    // Sacred math: 4+3+2 = 9 dice
    const diceRolls = Array.from({ length: 9 }, () => Math.floor(Math.random() * 6) + 1);
    const sum = diceRolls.reduce((a, b) => a + b, 0);

    session.diceRolls.push(...diceRolls);
    session.score += sum;

    // Award reward points based on score
    session.rewardPoints += Math.floor(sum / 2);

    console.log(`[Solbones] Dice rolled: ${diceRolls.join(',')} = ${sum}`);
    return diceRolls;
  }

  /**
   * Apply Solfeggio frequency to game
   */
  applyFrequency(sessionId: string, frequency: number): void {
    const session = this.gameSessions.get(sessionId);
    if (!session) {
      throw new Error('Game session not found');
    }

    session.frequencyUsed = frequency;

    // Frequency bonus multiplier
    const bonusMultiplier = this.getFrequencyBonus(frequency);
    session.rewardPoints = Math.floor(session.rewardPoints * bonusMultiplier);

    console.log(`[Solbones] Frequency applied: ${frequency}Hz (${bonusMultiplier}x bonus)`);
  }

  /**
   * End game session and award rewards
   */
  endGameSession(sessionId: string): SolbonesGameSession {
    const session = this.gameSessions.get(sessionId);
    if (!session) {
      throw new Error('Game session not found');
    }

    session.endedAt = Date.now();
    console.log(`[Solbones] Game session ended: ${session.playerName} earned ${session.rewardPoints} points`);
    return session;
  }

  /**
   * Create Sweet Miracles fundraising campaign
   */
  createCampaign(
    performanceId: string,
    campaignName: string,
    description: string,
    goalAmount: number
  ): SweetMiraclesCampaign {
    const campaign: SweetMiraclesCampaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performanceId,
      campaignName,
      description,
      goalAmount,
      raisedAmount: 0,
      donors: [],
      startedAt: Date.now(),
      isActive: true,
    };

    this.campaigns.set(campaign.id, campaign);
    console.log(`[Sweet Miracles] Campaign created: ${campaignName} (Goal: $${goalAmount})`);
    return campaign;
  }

  /**
   * Process donation
   */
  processDonation(
    campaignId: string,
    donorName: string,
    donorEmail: string,
    amount: number,
    message?: string
  ): SweetMiraclesDonor {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const donor: SweetMiraclesDonor = {
      id: `donor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: donorName,
      email: donorEmail,
      amount,
      message,
      timestamp: Date.now(),
    };

    campaign.donors.push(donor);
    campaign.raisedAmount += amount;
    this.totalDonations += amount;

    console.log(`[Sweet Miracles] Donation received: $${amount} from ${donorName}`);

    // Check if goal reached
    if (campaign.raisedAmount >= campaign.goalAmount) {
      campaign.isActive = false;
      console.log(`[Sweet Miracles] Campaign goal reached: ${campaignName}`);
    }

    return donor;
  }

  /**
   * Get campaign status
   */
  getCampaignStatus(campaignId: string): SweetMiraclesCampaign | null {
    return this.campaigns.get(campaignId) || null;
  }

  /**
   * Get all active campaigns
   */
  getActiveCampaigns(): SweetMiraclesCampaign[] {
    return Array.from(this.campaigns.values()).filter(c => c.isActive);
  }

  /**
   * Link game rewards to campaign
   */
  linkGameRewardsToCampaign(sessionId: string, campaignId: string): void {
    const session = this.gameSessions.get(sessionId);
    const campaign = this.campaigns.get(campaignId);

    if (!session || !campaign) {
      throw new Error('Session or campaign not found');
    }

    // Convert game points to donation (1 point = $0.01)
    const donationAmount = session.rewardPoints * 0.01;

    this.processDonation(
      campaignId,
      session.playerName,
      `player_${session.playerId}@rrb.local`,
      donationAmount,
      `Donated from Solbones game rewards`
    );

    console.log(`[Integration] Game rewards linked to campaign: $${donationAmount}`);
  }

  /**
   * Get frequency bonus multiplier
   */
  private getFrequencyBonus(frequency: number): number {
    // Solfeggio frequencies provide bonuses
    const bonuses: Record<number, number> = {
      174: 1.1,
      285: 1.15,
      396: 1.2,
      417: 1.2,
      528: 1.5, // Miracle frequency
      639: 1.2,
      741: 1.15,
      852: 1.1,
      963: 1.25,
    };

    return bonuses[frequency] || 1.0;
  }

  /**
   * Get integration statistics
   */
  getStatistics(): {
    totalGameSessions: number;
    totalDonations: number;
    activeCampaigns: number;
    totalRaised: number;
    averageDonation: number;
  } {
    const activeCampaigns = this.getActiveCampaigns().length;
    const totalRaised = Array.from(this.campaigns.values()).reduce(
      (sum, c) => sum + c.raisedAmount,
      0
    );
    const totalDonors = Array.from(this.campaigns.values()).reduce(
      (sum, c) => sum + c.donors.length,
      0
    );
    const averageDonation = totalDonors > 0 ? totalRaised / totalDonors : 0;

    return {
      totalGameSessions: this.gameSessions.size,
      totalDonations: totalDonors,
      activeCampaigns,
      totalRaised,
      averageDonation: Math.round(averageDonation * 100) / 100,
    };
  }

  /**
   * Get leaderboard (top game players)
   */
  getGameLeaderboard(limit: number = 10): Array<{
    playerName: string;
    score: number;
    rewardPoints: number;
  }> {
    return Array.from(this.gameSessions.values())
      .sort((a, b) => b.rewardPoints - a.rewardPoints)
      .slice(0, limit)
      .map(s => ({
        playerName: s.playerName,
        score: s.score,
        rewardPoints: s.rewardPoints,
      }));
  }
}

export const solbonesSweetMiraclesIntegration = new SolbonesSweetMiraclesIntegration();
