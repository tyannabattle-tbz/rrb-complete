import { ReactNode } from 'react';
import { useFeatureAccess, useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: 'voiceCommands' | 'arVisualization' | 'customBranding' | 'advancedAnalytics' | 'apiAccess' | 'prioritySupport' | 'unlimitedBroadcasts' | 'meshNetworking' | 'slaGuarantee';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({ feature, children, fallback, showUpgradePrompt = true }: FeatureGateProps) {
  const hasAccess = useFeatureAccess(feature);
  const { tier } = useSubscription();

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const featureNames: Record<string, string> = {
    voiceCommands: 'Voice Commands',
    arVisualization: 'AR Visualization',
    customBranding: 'Custom Branding',
    advancedAnalytics: 'Advanced Analytics',
    apiAccess: 'API Access',
    prioritySupport: 'Priority Support',
    unlimitedBroadcasts: 'Unlimited Broadcasts',
    meshNetworking: 'Mesh Networking',
    slaGuarantee: 'SLA Guarantee',
  };

  return (
    <Card className="bg-slate-800 border-slate-700 border-dashed">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Lock size={32} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{featureNames[feature]} Locked</h3>
            <p className="text-slate-400 text-sm mt-1">
              Upgrade your subscription to unlock {featureNames[feature].toLowerCase()}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => window.location.href = '/pricing/qumus'}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              View Pricing
            </Button>
            <Button
              onClick={() => window.location.href = '/pricing/hybridcast'}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              HybridCast Plans
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Current tier: <span className="capitalize font-semibold text-slate-300">{tier}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simplified version for inline use
 */
export function FeatureGateBadge({ feature }: { feature: string }) {
  const hasAccess = useFeatureAccess(feature as any);

  if (hasAccess) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300">
      <Lock size={12} />
      Premium
    </span>
  );
}
