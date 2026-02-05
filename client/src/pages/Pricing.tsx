import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

function useAuth() {
  const { data: user } = trpc.auth.me.useQuery();
  return { user };
}

const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    displayPrice: '$0',
    requests: '10,000/month',
    features: ['Basic analytics', 'Email support', 'API access'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    displayPrice: '$99',
    requests: '1,000,000/month',
    features: ['Advanced analytics', 'Priority support', 'Webhooks', 'Custom policies'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    displayPrice: 'Custom',
    requests: 'Unlimited',
    features: ['Unlimited requests', 'Dedicated support', 'SLA', 'Custom integrations'],
  },
];

export function Pricing() {
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  
  const createCheckoutMutation = trpc.stripeCheckout.createCheckoutSession.useMutation();
  const subscriptionQuery = trpc.stripeCheckout.getSubscriptionStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const handleCheckout = async (tier: typeof tiers[0]) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (tier.id === 'free') {
      // Free tier - no checkout needed
      alert('You are already on the Free plan');
      return;
    }

    if (tier.id === 'enterprise') {
      // Enterprise - contact sales
      alert('Please contact our sales team at sales@example.com for enterprise pricing');
      return;
    }

    setLoadingTier(tier.id);

    try {
      const result = await createCheckoutMutation.mutateAsync({
        tierId: tier.id,
        tierName: tier.name,
        price: tier.price,
        features: tier.features,
      });

      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const currentTier = subscriptionQuery.data?.tier || 'free';

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-600">Choose the plan that fits your needs</p>
        {user && subscriptionQuery.data && (
          <p className="text-sm text-blue-600 mt-4">
            Current plan: <span className="font-semibold capitalize">{currentTier}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`${tier.popular ? 'border-2 border-blue-600 relative' : ''} ${
              currentTier === tier.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Most Popular</span>
              </div>
            )}
            {currentTier === tier.id && (
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
                Current Plan
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <div className="text-3xl font-bold mt-2">{tier.displayPrice}</div>
              <p className="text-sm text-gray-600">{tier.requests}</p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full mb-6" 
                variant={tier.popular ? 'default' : 'outline'}
                onClick={() => handleCheckout(tier)}
                disabled={loadingTier === tier.id || currentTier === tier.id}
              >
                {loadingTier === tier.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentTier === tier.id ? (
                  'Current Plan'
                ) : tier.id === 'enterprise' ? (
                  'Contact Sales'
                ) : (
                  'Get Started'
                )}
              </Button>
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="text-left">
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.</p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-sm text-gray-600">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-gray-600">We accept all major credit cards through Stripe. Bank transfers available for enterprise customers.</p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-sm text-gray-600">Yes, start with our Free plan and upgrade anytime. No credit card required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
