/**
 * Affiliate Program Service
 * Manages referral links, commission tracking, and payout management
 */

export interface AffiliateProfile {
  affiliateId: string;
  name: string;
  email: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  commissionRate: number; // Percentage
  totalReferrals: number;
  totalCommissions: number;
  totalPayouts: number;
  bankAccount?: string;
}

export interface ReferralLink {
  linkId: string;
  affiliateId: string;
  code: string;
  url: string;
  createdAt: Date;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface Commission {
  id: string;
  affiliateId: string;
  referralId: string;
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date;
  paidAt?: Date;
}

export interface Payout {
  id: string;
  affiliateId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'check';
  createdAt: Date;
  completedAt?: Date;
  transactionId?: string;
}

class AffiliateProgramService {
  private affiliates: Map<string, AffiliateProfile> = new Map();
  private referralLinks: Map<string, ReferralLink> = new Map();
  private commissions: Map<string, Commission[]> = new Map();
  private payouts: Map<string, Payout[]> = new Map();

  /**
   * Create affiliate account
   */
  createAffiliateAccount(name: string, email: string, commissionRate: number = 10): AffiliateProfile {
    const affiliateId = `aff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const profile: AffiliateProfile = {
      affiliateId,
      name,
      email,
      joinDate: new Date(),
      status: 'active',
      commissionRate,
      totalReferrals: 0,
      totalCommissions: 0,
      totalPayouts: 0,
    };

    this.affiliates.set(affiliateId, profile);
    this.commissions.set(affiliateId, []);
    this.payouts.set(affiliateId, []);

    return profile;
  }

  /**
   * Get affiliate profile
   */
  getAffiliateProfile(affiliateId: string): AffiliateProfile | undefined {
    return this.affiliates.get(affiliateId);
  }

  /**
   * Generate referral link
   */
  generateReferralLink(affiliateId: string): ReferralLink {
    const affiliate = this.affiliates.get(affiliateId);
    if (!affiliate) throw new Error('Affiliate not found');

    const code = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const linkId = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const url = `https://tyos.manus.space/?ref=${code}`;

    const link: ReferralLink = {
      linkId,
      affiliateId,
      code,
      url,
      createdAt: new Date(),
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };

    this.referralLinks.set(linkId, link);
    return link;
  }

  /**
   * Track referral link click
   */
  trackReferralClick(code: string): boolean {
    for (const link of this.referralLinks.values()) {
      if (link.code === code) {
        link.clicks++;
        return true;
      }
    }
    return false;
  }

  /**
   * Track referral conversion
   */
  trackReferralConversion(code: string, revenue: number): Commission | null {
    for (const link of this.referralLinks.values()) {
      if (link.code === code) {
        link.conversions++;
        link.revenue += revenue;

        const affiliate = this.affiliates.get(link.affiliateId);
        if (!affiliate) return null;

        const commissionAmount = (revenue * affiliate.commissionRate) / 100;
        const commission: Commission = {
          id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          affiliateId: link.affiliateId,
          referralId: link.linkId,
          amount: commissionAmount,
          rate: affiliate.commissionRate,
          status: 'pending',
          createdAt: new Date(),
        };

        const affiliateCommissions = this.commissions.get(link.affiliateId) || [];
        affiliateCommissions.push(commission);
        this.commissions.set(link.affiliateId, affiliateCommissions);

        affiliate.totalReferrals++;
        affiliate.totalCommissions += commissionAmount;

        return commission;
      }
    }
    return null;
  }

  /**
   * Get affiliate referral links
   */
  getAffiliateReferralLinks(affiliateId: string): ReferralLink[] {
    return Array.from(this.referralLinks.values()).filter((link) => link.affiliateId === affiliateId);
  }

  /**
   * Get affiliate commissions
   */
  getAffiliateCommissions(affiliateId: string, status?: string): Commission[] {
    const commissions = this.commissions.get(affiliateId) || [];
    if (status) {
      return commissions.filter((c) => c.status === status);
    }
    return commissions;
  }

  /**
   * Approve commission
   */
  approveCommission(commissionId: string): Commission | null {
    for (const commissions of this.commissions.values()) {
      const commission = commissions.find((c) => c.id === commissionId);
      if (commission) {
        commission.status = 'approved';
        return commission;
      }
    }
    return null;
  }

  /**
   * Request payout
   */
  requestPayout(affiliateId: string, method: 'bank_transfer' | 'paypal' | 'check'): Payout | null {
    const affiliate = this.affiliates.get(affiliateId);
    if (!affiliate) return null;

    const pendingCommissions = this.getAffiliateCommissions(affiliateId, 'approved');
    const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

    if (totalAmount <= 0) return null;

    const payout: Payout = {
      id: `payout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      affiliateId,
      amount: totalAmount,
      status: 'pending',
      method,
      createdAt: new Date(),
    };

    const affiliatePayouts = this.payouts.get(affiliateId) || [];
    affiliatePayouts.push(payout);
    this.payouts.set(affiliateId, affiliatePayouts);

    // Mark commissions as paid
    pendingCommissions.forEach((c) => {
      c.status = 'paid';
      c.paidAt = new Date();
    });

    affiliate.totalPayouts += totalAmount;

    return payout;
  }

  /**
   * Get affiliate payouts
   */
  getAffiliatePayouts(affiliateId: string): Payout[] {
    return this.payouts.get(affiliateId) || [];
  }

  /**
   * Update payout status
   */
  updatePayoutStatus(payoutId: string, status: 'processing' | 'completed' | 'failed', transactionId?: string): Payout | null {
    for (const payouts of this.payouts.values()) {
      const payout = payouts.find((p) => p.id === payoutId);
      if (payout) {
        payout.status = status;
        if (status === 'completed') {
          payout.completedAt = new Date();
          payout.transactionId = transactionId;
        }
        return payout;
      }
    }
    return null;
  }

  /**
   * Get affiliate analytics
   */
  getAffiliateAnalytics(affiliateId: string): {
    profile: AffiliateProfile | undefined;
    links: ReferralLink[];
    commissions: Commission[];
    payouts: Payout[];
    statistics: {
      totalClicks: number;
      totalConversions: number;
      totalRevenue: number;
      conversionRate: number;
      averageCommissionPerConversion: number;
    };
  } {
    const profile = this.affiliates.get(affiliateId);
    const links = this.getAffiliateReferralLinks(affiliateId);
    const commissions = this.getAffiliateCommissions(affiliateId);
    const payouts = this.getAffiliatePayouts(affiliateId);

    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
    const totalConversions = links.reduce((sum, l) => sum + l.conversions, 0);
    const totalRevenue = links.reduce((sum, l) => sum + l.revenue, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const averageCommissionPerConversion = totalConversions > 0 ? commissions.reduce((sum, c) => sum + c.amount, 0) / totalConversions : 0;

    return {
      profile,
      links,
      commissions,
      payouts,
      statistics: {
        totalClicks,
        totalConversions,
        totalRevenue,
        conversionRate,
        averageCommissionPerConversion,
      },
    };
  }

  /**
   * Get top affiliates
   */
  getTopAffiliates(limit: number = 10): Array<AffiliateProfile & { earnings: number }> {
    return Array.from(this.affiliates.values())
      .map((profile) => ({
        ...profile,
        earnings: profile.totalCommissions,
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, limit);
  }

  /**
   * Get program statistics
   */
  getProgramStatistics(): {
    totalAffiliates: number;
    activeAffiliates: number;
    totalReferrals: number;
    totalCommissions: number;
    totalPayouts: number;
    topAffiliates: Array<AffiliateProfile & { earnings: number }>;
  } {
    const allAffiliates = Array.from(this.affiliates.values());
    const activeAffiliates = allAffiliates.filter((a) => a.status === 'active');

    return {
      totalAffiliates: allAffiliates.length,
      activeAffiliates: activeAffiliates.length,
      totalReferrals: allAffiliates.reduce((sum, a) => sum + a.totalReferrals, 0),
      totalCommissions: allAffiliates.reduce((sum, a) => sum + a.totalCommissions, 0),
      totalPayouts: allAffiliates.reduce((sum, a) => sum + a.totalPayouts, 0),
      topAffiliates: this.getTopAffiliates(5),
    };
  }
}

export const affiliateProgramService = new AffiliateProgramService();
