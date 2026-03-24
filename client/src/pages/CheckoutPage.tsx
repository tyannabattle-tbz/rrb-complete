'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc';

export function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<'professional' | 'advanced' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: pricing } = trpc.audio.getTierPricing.useQuery();
  const createCheckout = trpc.audio.createCheckout.useMutation();

  const handleCheckout = async (tier: 'professional' | 'advanced') => {
    if (!user) {
      setError('Please log in to upgrade your tier');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createCheckout.mutateAsync({
        userId: user.id,
        userEmail: user.email || 'user@example.com',
        tier,
        successUrl: `${window.location.origin}/studio?upgraded=true`,
        cancelUrl: `${window.location.origin}/checkout`,
      });

      if (result.url) {
        window.location.href = result.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Get started with RRB Studio',
      features: [
        'Band Chat',
        'Recording Archive',
        'Setlist Generator',
        'Basic Audio Quality',
        'Community Support',
      ],
      notIncluded: [
        'Sound DNA Engine',
        'AI Mastering',
        'Video Production',
        'Holographic Capture',
        'Priority Support',
      ],
      cta: 'Current Plan',
      disabled: true,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 49.99,
      description: 'Advanced production tools',
      features: [
        'Everything in Free',
        'Sound DNA Engine',
        'AI Mastering',
        'Video Production',
        'HD Audio Quality',
        'Unlimited Storage',
        'Email Support',
      ],
      notIncluded: ['Holographic Capture', 'Wellness Integration', 'Priority Support'],
      cta: 'Upgrade to Professional',
      disabled: false,
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: 99.99,
      description: 'Complete production ecosystem',
      features: [
        'Everything in Professional',
        'Holographic Capture',
        'Wellness Integration',
        '100% QUMUS Autonomous Control',
        'Premium Audio Quality',
        'Unlimited Everything',
        'Priority 24/7 Support',
      ],
      notIncluded: [],
      cta: 'Upgrade to Advanced',
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => setLocation('/studio')}
          variant="ghost"
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Studio
        </Button>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your Plan</h1>
          <p className="text-slate-400">Upgrade your RRB Studio experience</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={`bg-slate-800/40 border-slate-700/30 flex flex-col ${
              tier.id === 'advanced' ? 'ring-2 ring-purple-500 md:scale-105' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-white">{tier.name}</CardTitle>
                {tier.id === 'advanced' && (
                  <Badge className="bg-purple-600 text-white">RECOMMENDED</Badge>
                )}
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${tier.price.toFixed(2)}</span>
                {tier.price > 0 && <span className="text-slate-400 ml-2">/month</span>}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6 flex-1">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}

                {tier.notIncluded.length > 0 && (
                  <>
                    <div className="border-t border-slate-700/30 my-3" />
                    {tier.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 opacity-50">
                        <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-400">{feature}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleCheckout(tier.id as 'professional' | 'advanced')}
                disabled={tier.disabled || isLoading}
                className={
                  tier.id === 'advanced'
                    ? 'w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold'
                    : tier.id === 'professional'
                      ? 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold'
                      : 'w-full bg-slate-700 text-slate-400 cursor-not-allowed'
                }
              >
                {isLoading ? 'Processing...' : tier.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Can I change my plan anytime?</h4>
            <p className="text-slate-400 text-sm">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Is there a free trial?</h4>
            <p className="text-slate-400 text-sm">
              The Free tier is always available with core features. Try it first before upgrading!
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">What payment methods do you accept?</h4>
            <p className="text-slate-400 text-sm">
              We accept all major credit cards through Stripe. Your payment information is secure and encrypted.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Need help?</h4>
            <p className="text-slate-400 text-sm">
              Contact Canryn for pricing packages and custom solutions. Email: support@rrb.studio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
