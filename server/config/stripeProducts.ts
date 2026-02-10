/**
 * Stripe Products Configuration
 * DONATIONS ONLY — In Support of Legacy Recovery Efforts
 * 
 * Sweet Miracles Foundation 501(c)(3)
 * All proceeds support the preservation and continuation of the
 * Rockin' Rockin' Boogie legacy and community empowerment programs.
 * 
 * For studio services, production packages, and commercial pricing,
 * contact Canryn Production directly.
 */

export const STRIPE_PRODUCTS = {
  /**
   * Monthly recurring donations — Legacy Recovery Support
   */
  legacyRecoveryDonations: {
    productId: process.env.STRIPE_SWEET_MIRACLES_PRODUCT_ID || 'prod_sweet_miracles',
    name: 'Sweet Miracles Foundation — Legacy Recovery Donation',
    description: 'Your donation supports the recovery, preservation, and continuation of the Rockin\' Rockin\' Boogie legacy through Sweet Miracles Foundation 501(c)(3).',
    tiers: {
      friend: {
        priceId: process.env.STRIPE_BRONZE_PRICE_ID || 'price_bronze',
        amount: 500, // $5.00 in cents
        label: 'Friend of the Legacy',
        interval: 'month',
        description: '$5/month — Every dollar counts toward legacy recovery',
        features: [
          'Monthly supporter recognition',
          'Access to legacy recovery updates',
          'Digital thank you from the family',
        ],
      },
      supporter: {
        priceId: process.env.STRIPE_SILVER_PRICE_ID || 'price_silver',
        amount: 1000, // $10.00 in cents
        label: 'Legacy Supporter',
        interval: 'month',
        description: '$10/month — Sustaining the voice for the voiceless',
        features: [
          'All Friend benefits',
          'Monthly impact report',
          'Name listed on supporters wall',
          'Early access to new archival content',
        ],
      },
      champion: {
        priceId: process.env.STRIPE_GOLD_PRICE_ID || 'price_gold',
        amount: 2500, // $25.00 in cents
        label: 'Legacy Champion',
        interval: 'month',
        description: '$25/month — Championing legacy recovery efforts',
        features: [
          'All Supporter benefits',
          'Quarterly video updates from the family',
          'VIP access to legacy events',
          'Recognition in annual report',
        ],
      },
      guardian: {
        priceId: process.env.STRIPE_PLATINUM_PRICE_ID || 'price_platinum',
        amount: 5000, // $50.00 in cents
        label: 'Legacy Guardian',
        interval: 'month',
        description: '$50/month — Guarding the legacy for future generations',
        features: [
          'All Champion benefits',
          'Direct updates from the family',
          'Custom content requests',
          'Lifetime recognition',
          'Advisory board consideration',
        ],
      },
      benefactor: {
        priceId: process.env.STRIPE_BENEFACTOR_PRICE_ID || 'price_benefactor',
        amount: 10000, // $100.00 in cents
        label: 'Legacy Benefactor',
        interval: 'month',
        description: '$100/month — Transforming legacy recovery into generational wealth',
        features: [
          'All Guardian benefits',
          'Monthly one-on-one calls',
          'Named recognition on all platforms',
          'Exclusive behind-the-scenes access',
          'Board member consideration',
          'Lifetime premium access to all content',
        ],
      },
    },
  },

  /**
   * One-time donations — Legacy Recovery Fund
   */
  oneTimeDonation: {
    productId: process.env.STRIPE_ONE_TIME_PRODUCT_ID || 'prod_one_time',
    name: 'One-Time Donation — Legacy Recovery Fund',
    description: 'Make a one-time contribution in support of legacy recovery efforts. Sweet Miracles Foundation 501(c)(3) — A Voice for the Voiceless.',
    amounts: [
      { amount: 500, label: '$5' },
      { amount: 1000, label: '$10' },
      { amount: 2500, label: '$25' },
      { amount: 5000, label: '$50' },
      { amount: 10000, label: '$100' },
      { amount: 25000, label: '$250' },
      { amount: 50000, label: '$500' },
      { amount: 100000, label: '$1,000' },
    ],
  },

  /**
   * Donation purposes — what the funds support
   */
  donationPurposes: [
    {
      id: 'legacy-recovery',
      name: 'Legacy Recovery Efforts',
      description: 'Recovering and preserving the musical legacy of Seabrun "Candy" Hunter and the Rockin\' Rockin\' Boogie heritage.',
      icon: 'music',
    },
    {
      id: 'community-support',
      name: 'Community Support & Empowerment',
      description: 'Providing communities with tools for media production, broadcasting, and communication — A Voice for the Voiceless.',
      icon: 'heart',
    },
    {
      id: 'emergency-broadcast',
      name: 'Emergency Broadcast & Crisis Communication',
      description: 'Funding HybridCast emergency broadcast infrastructure for communities in crisis.',
      icon: 'radio',
    },
    {
      id: 'education-wellness',
      name: 'Education & Wellness Programs',
      description: 'Supporting healing frequency research, meditation programs, and educational initiatives.',
      icon: 'book',
    },
    {
      id: 'general-fund',
      name: 'General Fund — Where Needed Most',
      description: 'Your donation goes where it\'s needed most across all Sweet Miracles programs.',
      icon: 'star',
    },
  ],

  /**
   * Grant program information (outgoing — not a payment product)
   * These are grants Sweet Miracles GIVES, not receives
   */
  grantProgram: {
    productId: process.env.STRIPE_GRANT_PRODUCT_ID || 'prod_grants',
    name: 'Sweet Miracles Grant Program',
    description: 'Community grants funded by donations and institutional support',
    grantTypes: [
      {
        id: 'community',
        name: 'Community Support Grant',
        maxAmount: 500000,
        description: 'Support for community programs and initiatives',
      },
      {
        id: 'emergency',
        name: 'Emergency Relief Grant',
        maxAmount: 250000,
        description: 'Emergency assistance for individuals in crisis',
      },
      {
        id: 'education',
        name: 'Education & Wellness Grant',
        maxAmount: 300000,
        description: 'Support for education and wellness programs',
      },
    ],
  },
};

// Backward compatibility aliases
export const DONATION_TIERS = STRIPE_PRODUCTS.legacyRecoveryDonations.tiers;
export const DONATION_PURPOSES = STRIPE_PRODUCTS.donationPurposes;

/**
 * Get all donation tiers
 */
export function getDonationTiers() {
  return Object.entries(STRIPE_PRODUCTS.legacyRecoveryDonations.tiers).map(
    ([key, tier]) => ({
      id: key,
      ...tier,
    })
  );
}

/**
 * Get tier by ID
 */
export function getTierById(tierId: string) {
  const tier =
    STRIPE_PRODUCTS.legacyRecoveryDonations.tiers[
      tierId as keyof typeof STRIPE_PRODUCTS.legacyRecoveryDonations.tiers
    ];
  return tier ? { id: tierId, ...tier } : null;
}

/**
 * Get one-time donation amounts
 */
export function getOneTimeDonationAmounts() {
  return STRIPE_PRODUCTS.oneTimeDonation.amounts;
}

/**
 * Get donation purposes
 */
export function getDonationPurposes() {
  return STRIPE_PRODUCTS.donationPurposes;
}

/**
 * Get grant types
 */
export function getGrantTypes() {
  return STRIPE_PRODUCTS.grantProgram.grantTypes;
}

/**
 * Validate donation amount
 */
export function isValidDonationAmount(amount: number): boolean {
  // Amount must be at least $0.50 (50 cents) for Stripe
  return amount >= 50;
}

/**
 * Format amount for display
 */
export function formatAmount(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}
