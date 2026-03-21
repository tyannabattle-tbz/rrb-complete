import Stripe from 'stripe';
import { db } from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface SponsorshipTier {
  id: string;
  name: string;
  monthlyPrice: number;
  benefits: string[];
  episodesPerMonth: number;
}

export interface PremiumTier {
  id: string;
  name: string;
  monthlyPrice: number;
  features: string[];
}

export interface MonetizationMetrics {
  totalRevenue: number;
  sponsorshipRevenue: number;
  donationRevenue: number;
  premiumRevenue: number;
  activeSponsors: number;
  activeDonors: number;
  premiumSubscribers: number;
}

export class PodcastMonetization {
  private sponsorshipTiers: SponsorshipTier[] = [
    {
      id: 'bronze',
      name: 'Bronze Sponsor',
      monthlyPrice: 500,
      benefits: ['1 episode mention', 'Logo on website', 'Social media shoutout'],
      episodesPerMonth: 1,
    },
    {
      id: 'silver',
      name: 'Silver Sponsor',
      monthlyPrice: 1500,
      benefits: ['2 episode mentions', 'Premium logo placement', 'Weekly social posts', 'Newsletter feature'],
      episodesPerMonth: 2,
    },
    {
      id: 'gold',
      name: 'Gold Sponsor',
      monthlyPrice: 5000,
      benefits: ['4 episode mentions', 'Premium branding', 'Daily social posts', 'Custom content integration'],
      episodesPerMonth: 4,
    },
  ];

  private premiumTiers: PremiumTier[] = [
    {
      id: 'listener',
      name: 'Premium Listener',
      monthlyPrice: 499,
      features: ['Ad-free episodes', 'Early access', 'Exclusive content', 'Community access'],
    },
    {
      id: 'supporter',
      name: 'Premium Supporter',
      monthlyPrice: 999,
      features: ['All Listener benefits', 'Monthly bonus episode', 'Direct message access', 'Custom shoutouts'],
    },
    {
      id: 'vip',
      name: 'VIP Member',
      monthlyPrice: 2999,
      features: ['All Supporter benefits', 'Weekly bonus episodes', 'Private Discord channel', 'Monthly video call'],
    },
  ];

  async createSponsorshipAgreement(
    podcastId: string,
    sponsorId: string,
    tierId: string
  ): Promise<{ success: boolean; agreementId?: string; error?: string }> {
    try {
      const tier = this.sponsorshipTiers.find((t) => t.id === tierId);
      if (!tier) {
        return { success: false, error: 'Sponsorship tier not found' };
      }

      // Create Stripe product and price
      const product = await stripe.products.create({
        name: `${tier.name} - Podcast Sponsorship`,
        description: `${tier.episodesPerMonth} episode mentions per month`,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.monthlyPrice * 100,
        currency: 'usd',
        recurring: { interval: 'month' },
      });

      // Store in database
      const agreementId = `sponsor_${Date.now()}`;

      return {
        success: true,
        agreementId,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create sponsorship agreement: ${error}`,
      };
    }
  }

  async setupPremiumSubscription(
    podcastId: string,
    userId: string,
    tierId: string
  ): Promise<{ success: boolean; subscriptionId?: string; checkoutUrl?: string; error?: string }> {
    try {
      const tier = this.premiumTiers.find((t) => t.id === tierId);
      if (!tier) {
        return { success: false, error: 'Premium tier not found' };
      }

      // Create Stripe product and price
      const product = await stripe.products.create({
        name: `${tier.name} - Podcast Premium`,
        description: tier.features.join(', '),
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.monthlyPrice,
        currency: 'usd',
        recurring: { interval: 'month' },
      });

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.VITE_FRONTEND_URL}/premium?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_FRONTEND_URL}/podcast`,
        customer_email: '', // Set from user context
      });

      return {
        success: true,
        subscriptionId: session.id,
        checkoutUrl: session.url || '',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to setup premium subscription: ${error}`,
      };
    }
  }

  async processDonation(
    podcastId: string,
    donorId: string,
    amount: number,
    message?: string
  ): Promise<{ success: boolean; donationId?: string; error?: string }> {
    try {
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        metadata: {
          podcastId,
          donorId,
          message: message || '',
        },
      });

      return {
        success: true,
        donationId: paymentIntent.id,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process donation: ${error}`,
      };
    }
  }

  async getMonetizationMetrics(podcastId: string): Promise<MonetizationMetrics> {
    try {
      // Query sponsorships
      const sponsorships = await db.query.sponsorships.findMany({
        where: (sponsorships, { eq }) => eq(sponsorships.podcastId, podcastId),
      });

      // Query donations
      const donations = await db.query.donations.findMany({
        where: (donations, { eq }) => eq(donations.podcastId, podcastId),
      });

      // Query premium subscriptions
      const subscriptions = await db.query.subscriptions.findMany({
        where: (subscriptions, { eq }) => eq(subscriptions.podcastId, podcastId),
      });

      const sponsorshipRevenue = sponsorships.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
      const donationRevenue = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      const premiumRevenue = subscriptions.reduce((sum: number, s: any) => sum + (s.monthlyPrice || 0), 0);

      return {
        totalRevenue: sponsorshipRevenue + donationRevenue + premiumRevenue,
        sponsorshipRevenue,
        donationRevenue,
        premiumRevenue,
        activeSponsors: sponsorships.length,
        activeDonors: donations.length,
        premiumSubscribers: subscriptions.length,
      };
    } catch (error) {
      console.error('Failed to get monetization metrics:', error);
      return {
        totalRevenue: 0,
        sponsorshipRevenue: 0,
        donationRevenue: 0,
        premiumRevenue: 0,
        activeSponsors: 0,
        activeDonors: 0,
        premiumSubscribers: 0,
      };
    }
  }

  getSponsorshipTiers(): SponsorshipTier[] {
    return this.sponsorshipTiers;
  }

  getPremiumTiers(): PremiumTier[] {
    return this.premiumTiers;
  }
}

export const podcastMonetization = new PodcastMonetization();
