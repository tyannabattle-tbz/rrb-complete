/**
 * Podcast Monetization Service
 * Handles premium episodes, sponsorships, and listener donations with Stripe
 */

export interface PremiumEpisode {
  episodeId: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  releaseDate: Date;
  accessLevel: 'free' | 'premium' | 'vip';
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface Sponsorship {
  sponsorshipId: string;
  episodeId: string;
  sponsorName: string;
  amount: number;
  currency: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  description: string;
  status: 'active' | 'pending' | 'completed';
  stripePaymentIntentId?: string;
}

export interface ListenerDonation {
  donationId: string;
  listenerId: string;
  amount: number;
  currency: string;
  message?: string;
  timestamp: Date;
  stripeChargeId?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface RevenueReport {
  period: string;
  premiumEpisodeRevenue: number;
  sponsorshipRevenue: number;
  donationRevenue: number;
  totalRevenue: number;
  transactions: number;
  topEpisodes: { episodeId: string; revenue: number }[];
  topSponsors: { name: string; revenue: number }[];
}

class PodcastMonetizationService {
  private premiumEpisodes: Map<string, PremiumEpisode> = new Map();
  private sponsorships: Map<string, Sponsorship> = new Map();
  private donations: Map<string, ListenerDonation> = new Map();
  private revenueHistory: RevenueReport[] = [];

  /**
   * Create a premium episode
   */
  createPremiumEpisode(
    episodeId: string,
    title: string,
    price: number,
    currency: string,
    description: string,
    releaseDate: Date,
    accessLevel: 'free' | 'premium' | 'vip' = 'premium'
  ): PremiumEpisode {
    const episode: PremiumEpisode = {
      episodeId,
      title,
      price,
      currency,
      description,
      releaseDate,
      accessLevel,
      stripeProductId: `prod_${episodeId}`,
      stripePriceId: `price_${episodeId}`
    };

    this.premiumEpisodes.set(episodeId, episode);
    console.log(`[Monetization] Premium episode created: ${title} ($${price})`);
    return episode;
  }

  /**
   * Get premium episode
   */
  getPremiumEpisode(episodeId: string): PremiumEpisode | undefined {
    return this.premiumEpisodes.get(episodeId);
  }

  /**
   * Create sponsorship
   */
  createSponsorship(
    episodeId: string,
    sponsorName: string,
    amount: number,
    currency: string,
    duration: number,
    description: string
  ): Sponsorship {
    const sponsorshipId = `sponsor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    const sponsorship: Sponsorship = {
      sponsorshipId,
      episodeId,
      sponsorName,
      amount,
      currency,
      duration,
      startDate,
      endDate,
      description,
      status: 'pending',
      stripePaymentIntentId: `pi_${sponsorshipId}`
    };

    this.sponsorships.set(sponsorshipId, sponsorship);
    console.log(`[Monetization] Sponsorship created: ${sponsorName} - $${amount}`);
    return sponsorship;
  }

  /**
   * Confirm sponsorship payment
   */
  confirmSponsorshipPayment(sponsorshipId: string): Sponsorship | null {
    const sponsorship = this.sponsorships.get(sponsorshipId);
    if (sponsorship) {
      sponsorship.status = 'active';
      console.log(`[Monetization] Sponsorship confirmed: ${sponsorship.sponsorName}`);
      return sponsorship;
    }
    return null;
  }

  /**
   * Record listener donation
   */
  recordDonation(
    listenerId: string,
    amount: number,
    currency: string,
    message?: string
  ): ListenerDonation {
    const donationId = `donation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const donation: ListenerDonation = {
      donationId,
      listenerId,
      amount,
      currency,
      message,
      timestamp: new Date(),
      stripeChargeId: `ch_${donationId}`,
      status: 'completed'
    };

    this.donations.set(donationId, donation);
    console.log(`[Monetization] Donation recorded: $${amount} from ${listenerId}`);
    return donation;
  }

  /**
   * Get donation
   */
  getDonation(donationId: string): ListenerDonation | undefined {
    return this.donations.get(donationId);
  }

  /**
   * Get all donations
   */
  getAllDonations(): ListenerDonation[] {
    return Array.from(this.donations.values());
  }

  /**
   * Get revenue report
   */
  getRevenueReport(period: string = 'monthly'): RevenueReport {
    const premiumRevenue = Array.from(this.premiumEpisodes.values()).reduce(
      (sum, ep) => sum + ep.price,
      0
    );

    const sponsorshipRevenue = Array.from(this.sponsorships.values())
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.amount, 0);

    const donationRevenue = Array.from(this.donations.values())
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    const totalRevenue = premiumRevenue + sponsorshipRevenue + donationRevenue;

    // Calculate top episodes
    const topEpisodes = Array.from(this.premiumEpisodes.values())
      .map((ep) => ({
        episodeId: ep.episodeId,
        revenue: ep.price
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate top sponsors
    const sponsorMap: Record<string, number> = {};
    this.sponsorships.forEach((s) => {
      sponsorMap[s.sponsorName] = (sponsorMap[s.sponsorName] || 0) + s.amount;
    });

    const topSponsors = Object.entries(sponsorMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const report: RevenueReport = {
      period,
      premiumEpisodeRevenue: premiumRevenue,
      sponsorshipRevenue,
      donationRevenue,
      totalRevenue,
      transactions: this.donations.size + this.sponsorships.size,
      topEpisodes,
      topSponsors
    };

    this.revenueHistory.push(report);
    return report;
  }

  /**
   * Get monetization dashboard
   */
  getMonetizationDashboard(): {
    premiumEpisodes: number;
    activeSponsors: number;
    totalDonations: number;
    totalRevenue: number;
    topEpisodes: PremiumEpisode[];
    recentDonations: ListenerDonation[];
    revenueReport: RevenueReport;
  } {
    const activeSponsors = Array.from(this.sponsorships.values()).filter(
      (s) => s.status === 'active'
    ).length;

    const totalDonations = Array.from(this.donations.values())
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    const totalRevenue = Array.from(this.premiumEpisodes.values()).reduce(
      (sum, ep) => sum + ep.price,
      0
    );

    const topEpisodes = Array.from(this.premiumEpisodes.values())
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    const recentDonations = Array.from(this.donations.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      premiumEpisodes: this.premiumEpisodes.size,
      activeSponsors,
      totalDonations,
      totalRevenue,
      topEpisodes,
      recentDonations,
      revenueReport: this.getRevenueReport()
    };
  }

  /**
   * Check if listener has access to premium episode
   */
  hasAccessToPremiumEpisode(listenerId: string, episodeId: string): boolean {
    const episode = this.premiumEpisodes.get(episodeId);
    if (!episode) return true; // Free episode

    // Check if listener has purchased this episode
    // This would integrate with Stripe customer records
    return false; // Default: no access until purchased
  }

  /**
   * Get listener subscription status
   */
  getListenerSubscriptionStatus(listenerId: string): {
    isSubscribed: boolean;
    tier: 'free' | 'premium' | 'vip';
    expiryDate?: Date;
  } {
    // This would check Stripe subscription status
    return {
      isSubscribed: false,
      tier: 'free'
    };
  }
}

export const podcastMonetizationService = new PodcastMonetizationService();
