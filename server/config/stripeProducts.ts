/**
 * Stripe Products Configuration
 * Contains product and price IDs for Sweet Miracles donations
 */

export const STRIPE_PRODUCTS = {
  sweetMiraclesDonations: {
    productId: "prod_TuzEOdvwd93AWX",
    priceId: "price_1Sx9GRIJkobYtCWEH3KjllEF",
    name: "Sweet Miracles Donations",
    description: "Support Sweet Miracles in providing voice and advocacy services to seniors",
    tiers: [
      {
        name: "Bronze",
        amount: 2500, // $25.00 in cents
        description: "Bronze Tier - $25/month",
        benefits: ["Monthly donor recognition", "Impact updates"],
      },
      {
        name: "Silver",
        amount: 5000, // $50.00 in cents
        description: "Silver Tier - $50/month",
        benefits: ["Monthly donor recognition", "Impact updates", "Quarterly reports"],
      },
      {
        name: "Gold",
        amount: 10000, // $100.00 in cents
        description: "Gold Tier - $100/month",
        benefits: [
          "Monthly donor recognition",
          "Impact updates",
          "Quarterly reports",
          "Exclusive events",
        ],
      },
      {
        name: "Platinum",
        amount: 25000, // $250.00 in cents
        description: "Platinum Tier - $250/month",
        benefits: [
          "Monthly donor recognition",
          "Impact updates",
          "Quarterly reports",
          "Exclusive events",
          "Direct impact tracking",
          "VIP status",
        ],
      },
    ],
  },
};

export type DonationTier = "bronze" | "silver" | "gold" | "platinum";

export const getTierByAmount = (amount: number): DonationTier => {
  if (amount >= 25000) return "platinum";
  if (amount >= 10000) return "gold";
  if (amount >= 5000) return "silver";
  return "bronze";
};

export const getTierInfo = (tier: DonationTier) => {
  const tiers = STRIPE_PRODUCTS.sweetMiraclesDonations.tiers;
  const tierMap: Record<DonationTier, number> = {
    bronze: 0,
    silver: 1,
    gold: 2,
    platinum: 3,
  };
  return tiers[tierMap[tier]];
};
