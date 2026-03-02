import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Radio, Zap, Shield } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  icon: React.ReactNode;
  features: string[];
  maxBroadcasts?: number;
  maxListeners?: number;
  maxStorageGb?: number;
  stripePriceId: string;
  popular?: boolean;
}

const HYBRIDCAST_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'HybridCast Basic',
    price: 4900, // $49/month
    interval: 'month',
    description: 'Perfect for small communities and local broadcasts',
    icon: <Radio size={24} className="text-cyan-400" />,
    features: [
      'Up to 5 concurrent broadcasts',
      '1,000 simultaneous listeners',
      '100 GB storage',
      'Basic analytics',
      'Email support',
      'Standard quality streaming',
    ],
    maxBroadcasts: 5,
    maxListeners: 1000,
    maxStorageGb: 100,
    stripePriceId: 'price_hybridcast_basic',
  },
  {
    id: 'pro',
    name: 'HybridCast Pro',
    price: 14900, // $149/month
    interval: 'month',
    description: 'Ideal for established broadcasters and networks',
    icon: <Zap size={24} className="text-yellow-400" />,
    features: [
      'Up to 25 concurrent broadcasts',
      '10,000 simultaneous listeners',
      '500 GB storage',
      'Advanced analytics & insights',
      'Priority email & chat support',
      'HD quality streaming',
      'Custom branding',
      'API access',
      'Mesh networking support',
    ],
    maxBroadcasts: 25,
    maxListeners: 10000,
    maxStorageGb: 500,
    stripePriceId: 'price_hybridcast_pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'HybridCast Enterprise',
    price: 49900, // $499/month
    interval: 'month',
    description: 'For large-scale operations and critical infrastructure',
    icon: <Shield size={24} className="text-red-400" />,
    features: [
      'Unlimited concurrent broadcasts',
      '100,000+ simultaneous listeners',
      'Unlimited storage',
      'Real-time analytics & AI insights',
      '24/7 dedicated support',
      '4K quality streaming',
      'Full custom branding',
      'Unlimited API access',
      'Advanced mesh networking',
      'Emergency broadcast priority',
      'SLA guarantee (99.9% uptime)',
      'Custom integrations',
      'Dedicated account manager',
    ],
    stripePriceId: 'price_hybridcast_enterprise',
  },
];

export function HybridCastPricing() {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (plan: PricingPlan) => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          productName: plan.name,
          priceId: plan.stripePriceId,
          currency: 'USD',
          description: plan.description,
          metadata: {
            plan_id: plan.id,
            max_broadcasts: plan.maxBroadcasts,
            max_listeners: plan.maxListeners,
            max_storage_gb: plan.maxStorageGb,
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">HybridCast Pricing</h2>
        <p className="text-xl text-slate-400">
          Choose the perfect plan for your emergency broadcast and mesh networking needs
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {HYBRIDCAST_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative bg-slate-800 border-slate-700 transition-all ${
              plan.popular ? 'ring-2 ring-cyan-500 md:scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700/50 rounded-lg">{plan.icon}</div>
                <div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${(plan.price / 100).toFixed(0)}</span>
                  <span className="text-slate-400">/month</span>
                </div>
                {plan.maxBroadcasts && (
                  <p className="text-sm text-slate-400">
                    Up to {plan.maxBroadcasts} concurrent broadcasts
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Specs */}
              <div className="space-y-2 pt-4 border-t border-slate-700">
                {plan.maxListeners && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Max Listeners:</span>
                    <span className="text-cyan-400 font-semibold">
                      {plan.maxListeners.toLocaleString()}
                    </span>
                  </div>
                )}
                {plan.maxStorageGb && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Storage:</span>
                    <span className="text-cyan-400 font-semibold">
                      {plan.maxStorageGb === 999999 ? 'Unlimited' : `${plan.maxStorageGb} GB`}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleCheckout(plan)}
                disabled={isProcessing}
                className={`w-full h-11 font-semibold ${
                  plan.popular
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Feature</th>
                  {HYBRIDCAST_PLANS.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4 text-slate-300 font-semibold">
                      {plan.name.split(' ')[1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="py-3 px-4 text-slate-400">Concurrent Broadcasts</td>
                  {HYBRIDCAST_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 text-cyan-400">
                      {plan.maxBroadcasts || '∞'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 px-4 text-slate-400">Max Listeners</td>
                  {HYBRIDCAST_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 text-cyan-400">
                      {plan.maxListeners ? plan.maxListeners.toLocaleString() : '∞'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 px-4 text-slate-400">Storage</td>
                  {HYBRIDCAST_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 text-cyan-400">
                      {plan.maxStorageGb ? `${plan.maxStorageGb} GB` : '∞'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 px-4 text-slate-400">API Access</td>
                  {HYBRIDCAST_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.id === 'basic' ? '✗' : '✓'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 px-4 text-slate-400">Support</td>
                  {HYBRIDCAST_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 text-slate-300">
                      {plan.id === 'basic' ? 'Email' : plan.id === 'pro' ? 'Priority' : '24/7'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-white font-semibold mb-2">Can I upgrade or downgrade my plan?</h4>
            <p className="text-slate-400">
              Yes! You can change your plan anytime. Changes take effect on your next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Is there a free trial?</h4>
            <p className="text-slate-400">
              Contact our sales team for a 14-day free trial of any plan.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-slate-400">
              We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Can I cancel anytime?</h4>
            <p className="text-slate-400">
              Yes, you can cancel your subscription at any time. No long-term contracts required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
