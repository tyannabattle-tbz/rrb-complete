/**
 * Sweet Miracles Donation Service
 * Nonprofit giving and impact tracking
 */

export interface Donation {
  id: string;
  amount: number;
  donorEmail: string;
  message: string;
  impact: string;
  createdAt: string;
}

class SweetMiraclesDonationService {
  private donations: Map<string, Donation> = new Map();
  private totalRaised: number = 0;

  async createDonation(
    amount: number,
    donorEmail: string,
    message?: string
  ): Promise<Donation> {
    const id = `donation-${Date.now()}`;
    const donation: Donation = {
      id,
      amount,
      donorEmail,
      message: message || '',
      impact: this.calculateImpact(amount),
      createdAt: new Date().toISOString(),
    };

    this.donations.set(id, donation);
    this.totalRaised += amount;

    return donation;
  }

  private calculateImpact(amount: number): string {
    if (amount < 10) return 'Helped 1 person';
    if (amount < 50) return 'Provided meals for a family';
    if (amount < 100) return 'Funded emergency supplies';
    return 'Supported community programs';
  }

  async getTotalRaised(): Promise<number> {
    return this.totalRaised;
  }

  async getDonationCount(): Promise<number> {
    return this.donations.size;
  }

  async getImpactMetrics(): Promise<{
    totalRaised: number;
    donationCount: number;
    averageDonation: number;
  }> {
    return {
      totalRaised: this.totalRaised,
      donationCount: this.donations.size,
      averageDonation: this.donations.size > 0 ? this.totalRaised / this.donations.size : 0,
    };
  }
}

export const sweetMiraclesDonationService = new SweetMiraclesDonationService();
