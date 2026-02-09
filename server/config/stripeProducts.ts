/**
 * Stripe Products Configuration
 * Defines all product and pricing tiers for Sweet Miracles fundraising
 */

export const STRIPE_PRODUCTS = {
  sweetMiraclesDonations: {
    productId: process.env.STRIPE_SWEET_MIRACLES_PRODUCT_ID || 'prod_sweet_miracles',
    name: 'Sweet Miracles - Support the Legacy',
    description: 'Support the preservation and continuation of the Rockin\' Rockin\' Boogie legacy',
    tiers: {
      bronze: {
        priceId: process.env.STRIPE_BRONZE_PRICE_ID || 'price_bronze',
        amount: 2500, // $25.00 in cents
        label: 'Bronze Supporter',
        interval: 'month',
        description: '$25/month - Bronze Tier Supporter',
        features: [
          'Monthly supporter recognition',
          'Access to exclusive updates',
          'Digital thank you certificate',
        ],
      },
      silver: {
        priceId: process.env.STRIPE_SILVER_PRICE_ID || 'price_silver',
        amount: 5000, // $50.00 in cents
        label: 'Silver Supporter',
        interval: 'month',
        description: '$50/month - Silver Tier Supporter',
        features: [
          'All Bronze benefits',
          'Monthly impact report',
          'Name listed on website',
          'Early access to new content',
        ],
      },
      gold: {
        priceId: process.env.STRIPE_GOLD_PRICE_ID || 'price_gold',
        amount: 10000, // $100.00 in cents
        label: 'Gold Supporter',
        interval: 'month',
        description: '$100/month - Gold Tier Supporter',
        features: [
          'All Silver benefits',
          'Quarterly video updates',
          'Direct message access',
          'VIP event invitations',
        ],
      },
      platinum: {
        priceId: process.env.STRIPE_PLATINUM_PRICE_ID || 'price_platinum',
        amount: 25000, // $250.00 in cents
        label: 'Platinum Supporter',
        interval: 'month',
        description: '$250/month - Platinum Tier Supporter',
        features: [
          'All Gold benefits',
          'Monthly one-on-one calls',
          'Custom content requests',
          'Lifetime recognition',
          'Board member consideration',
        ],
      },
    },
  },
  oneTimeDonation: {
    productId: process.env.STRIPE_ONE_TIME_PRODUCT_ID || 'prod_one_time',
    name: 'One-Time Donation',
    description: 'Make a one-time contribution to support the legacy',
    amounts: [
      { amount: 1000, label: '$10' },
      { amount: 2500, label: '$25' },
      { amount: 5000, label: '$50' },
      { amount: 10000, label: '$100' },
      { amount: 25000, label: '$250' },
      { amount: 50000, label: '$500' },
    ],
  },
  grantProgram: {
    productId: process.env.STRIPE_GRANT_PRODUCT_ID || 'prod_grants',
    name: 'Sweet Miracles Grant Program',
    description: 'Apply for grants to support community initiatives',
    grantTypes: [
      {
        id: 'community',
        name: 'Community Support Grant',
        maxAmount: 500000, // $5,000 in cents
        description: 'Support for community programs and initiatives',
      },
      {
        id: 'emergency',
        name: 'Emergency Relief Grant',
        maxAmount: 250000, // $2,500 in cents
        description: 'Emergency assistance for individuals in crisis',
      },
      {
        id: 'education',
        name: 'Education & Wellness Grant',
        maxAmount: 300000, // $3,000 in cents
        description: 'Support for education and wellness programs',
      },
    ],
  },
};

/**
 * Get all donation tiers
 */
export function getDonationTiers() {
  return Object.entries(STRIPE_PRODUCTS.sweetMiraclesDonations.tiers).map(
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
    STRIPE_PRODUCTS.sweetMiraclesDonations.tiers[
      tierId as keyof typeof STRIPE_PRODUCTS.sweetMiraclesDonations.tiers
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
