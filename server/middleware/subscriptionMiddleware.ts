import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export interface SubscriptionRequest extends Request {
  subscription?: {
    tier: 'free' | 'ar_pro' | 'voice_training' | 'enterprise' | 'hybridcast_basic' | 'hybridcast_pro' | 'hybridcast_enterprise';
    status: 'active' | 'cancelled' | 'suspended';
    expiresAt?: Date;
    features: string[];
  };
  user?: {
    id: number;
    email: string;
    role: 'user' | 'admin';
  };
}

/**
 * Subscription tier feature mapping
 */
const tierFeatures: Record<string, string[]> = {
  free: ['basic_tasks', 'limited_storage', 'basic_analytics'],
  ar_pro: ['ar_glass', 'voice_commands', 'advanced_analytics', 'file_storage'],
  voice_training: ['voice_training', 'custom_commands', 'voice_analytics'],
  enterprise: ['all_features', 'unlimited_storage', 'priority_support', 'custom_integrations'],
  hybridcast_basic: ['broadcast', 'basic_streaming', 'limited_listeners'],
  hybridcast_pro: ['advanced_broadcast', 'hd_streaming', 'unlimited_listeners', 'analytics'],
  hybridcast_enterprise: ['all_broadcast_features', 'custom_branding', 'dedicated_support'],
};

/**
 * Get user subscription
 */
async function getUserSubscription(userId: number) {
  try {
    const subscriptions = await db.query(
      `SELECT * FROM subscriptions 
       WHERE userId = ? AND status = 'active' AND (expiresAt IS NULL OR expiresAt > NOW())
       ORDER BY tier DESC
       LIMIT 1`,
      [userId]
    );

    if (subscriptions.length === 0) {
      return {
        tier: 'free' as const,
        status: 'active' as const,
        features: tierFeatures.free,
      };
    }

    const sub = subscriptions[0];
    return {
      tier: sub.tier,
      status: sub.status,
      expiresAt: sub.expiresAt ? new Date(sub.expiresAt) : undefined,
      features: tierFeatures[sub.tier] || [],
    };
  } catch (error) {
    console.error('Failed to get user subscription:', error);
    return {
      tier: 'free' as const,
      status: 'active' as const,
      features: tierFeatures.free,
    };
  }
}

/**
 * Load subscription into request
 */
export async function loadSubscription(req: SubscriptionRequest, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      req.subscription = {
        tier: 'free',
        status: 'active',
        features: tierFeatures.free,
      };
      return next();
    }

    const subscription = await getUserSubscription(userId);
    req.subscription = subscription;

    // Log access
    await db.insert('subscription_access_logs').values({
      userId,
      tier: subscription.tier,
      path: req.path,
      method: req.method,
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown',
    });

    next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    next();
  }
}

/**
 * Require specific tier
 */
export function requireTier(...tiers: string[]) {
  return (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    if (!req.subscription) {
      return res.status(401).json({ error: 'Subscription not loaded' });
    }

    if (tiers.includes(req.subscription.tier)) {
      return next();
    }

    // Log access denial
    db.insert('access_denial_logs').values({
      userId: (req as any).user?.id,
      requiredTier: tiers.join(','),
      currentTier: req.subscription.tier,
      path: req.path,
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown',
    }).catch((err) => console.error('Failed to log access denial:', err));

    return res.status(403).json({
      error: 'Insufficient subscription tier',
      currentTier: req.subscription.tier,
      requiredTiers: tiers,
      upgradeUrl: '/pricing/qumus',
    });
  };
}

/**
 * Require feature
 */
export function requireFeature(...features: string[]) {
  return (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    if (!req.subscription) {
      return res.status(401).json({ error: 'Subscription not loaded' });
    }

    const hasFeature = features.some((feature) => req.subscription!.features.includes(feature));

    if (hasFeature) {
      return next();
    }

    // Log access denial
    db.insert('access_denial_logs').values({
      userId: (req as any).user?.id,
      requiredFeatures: features.join(','),
      currentTier: req.subscription.tier,
      path: req.path,
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown',
    }).catch((err) => console.error('Failed to log access denial:', err));

    return res.status(403).json({
      error: 'Feature not available in current subscription',
      currentTier: req.subscription.tier,
      requiredFeatures: features,
      upgradeUrl: '/pricing/qumus',
    });
  };
}

/**
 * Check subscription expiration
 */
export async function checkSubscriptionExpiration(userId: number) {
  try {
    const subscriptions = await db.query(
      `SELECT * FROM subscriptions 
       WHERE userId = ? AND status = 'active' AND expiresAt < NOW()`,
      [userId]
    );

    if (subscriptions.length > 0) {
      // Expire subscriptions
      await db.query('UPDATE subscriptions SET status = ? WHERE userId = ? AND expiresAt < NOW()', [
        'expired',
        userId,
      ]);

      // Send expiration email
      // await emailService.sendSubscriptionExpired(user.email, subscriptions);
    }
  } catch (error) {
    console.error('Failed to check subscription expiration:', error);
  }
}

/**
 * Redirect to upgrade if needed
 */
export function redirectToUpgradeIfNeeded(requiredTier: string) {
  return (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    if (!req.subscription) {
      return res.redirect('/pricing/qumus');
    }

    const tierHierarchy = ['free', 'ar_pro', 'voice_training', 'enterprise'];
    const requiredIndex = tierHierarchy.indexOf(requiredTier);
    const currentIndex = tierHierarchy.indexOf(req.subscription.tier);

    if (currentIndex >= requiredIndex) {
      return next();
    }

    return res.redirect(`/pricing/qumus?upgrade=${requiredTier}`);
  };
}

/**
 * Get tier upgrade suggestions
 */
export function getUpgradeSuggestions(currentTier: string): string[] {
  const suggestions: Record<string, string[]> = {
    free: ['ar_pro', 'voice_training', 'enterprise'],
    ar_pro: ['enterprise', 'voice_training'],
    voice_training: ['enterprise', 'ar_pro'],
    enterprise: [],
    hybridcast_basic: ['hybridcast_pro', 'hybridcast_enterprise'],
    hybridcast_pro: ['hybridcast_enterprise'],
    hybridcast_enterprise: [],
  };

  return suggestions[currentTier] || [];
}

/**
 * Calculate subscription cost
 */
export function calculateSubscriptionCost(tier: string, billingCycle: 'monthly' | 'yearly'): number {
  const pricing: Record<string, Record<string, number>> = {
    free: { monthly: 0, yearly: 0 },
    ar_pro: { monthly: 99, yearly: 990 },
    voice_training: { monthly: 49, yearly: 490 },
    enterprise: { monthly: 299, yearly: 2990 },
    hybridcast_basic: { monthly: 49, yearly: 490 },
    hybridcast_pro: { monthly: 149, yearly: 1490 },
    hybridcast_enterprise: { monthly: 499, yearly: 4990 },
  };

  return pricing[tier]?.[billingCycle] || 0;
}

/**
 * Get subscription details for user
 */
export async function getSubscriptionDetails(userId: number) {
  try {
    const subscriptions = await db.query(
      `SELECT * FROM subscriptions 
       WHERE userId = ?
       ORDER BY createdAt DESC`,
      [userId]
    );

    return subscriptions.map((sub: any) => ({
      id: sub.id,
      tier: sub.tier,
      status: sub.status,
      billingCycle: sub.billingCycle,
      startDate: new Date(sub.startDate),
      expiresAt: sub.expiresAt ? new Date(sub.expiresAt) : null,
      autoRenew: Boolean(sub.autoRenew),
      stripeSubscriptionId: sub.stripeSubscriptionId,
      features: tierFeatures[sub.tier] || [],
      cost: calculateSubscriptionCost(sub.tier, sub.billingCycle),
    }));
  } catch (error) {
    console.error('Failed to get subscription details:', error);
    return [];
  }
}

/**
 * Validate subscription status
 */
export async function validateSubscriptionStatus(userId: number): Promise<boolean> {
  try {
    const subscriptions = await db.query(
      `SELECT * FROM subscriptions 
       WHERE userId = ? AND status = 'active'`,
      [userId]
    );

    if (subscriptions.length === 0) {
      return false;
    }

    const sub = subscriptions[0];

    // Check expiration
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
      // Expire subscription
      await db.query('UPDATE subscriptions SET status = ? WHERE id = ?', ['expired', sub.id]);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to validate subscription status:', error);
    return false;
  }
}
