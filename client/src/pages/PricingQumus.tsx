import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeatureGate } from '@/components/FeatureGate';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';

const tiers = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started with QUMUS',
    features: {
      voiceCommands: false,
      arVisualization: false,
      customBranding: false,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
      unlimitedTasks: false,
      webhookIntegration: false,
    },
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'AR Pro',
    price: 99,
    period: 'month',
    description: 'Advanced AR visualization and metrics',
    features: {
      voiceCommands: true,
      arVisualization: true,
      customBranding: false,
      advancedAnalytics: true,
      apiAccess: false,
      prioritySupport: false,
      unlimitedTasks: true,
      webhookIntegration: false,
    },
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Voice Training',
    price: 49,
    period: 'month',
    description: 'Custom voice commands and ML training',
    features: {
      voiceCommands: true,
      arVisualization: false,
      customBranding: false,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: false,
      unlimitedTasks: true,
      webhookIntegration: true,
    },
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 299,
    period: 'month',
    description: 'Full suite with priority support',
    features: {
      voiceCommands: true,
      arVisualization: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
      unlimitedTasks: true,
      webhookIntegration: true,
    },
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const featureLabels = {
  voiceCommands: 'Voice Commands',
  arVisualization: 'AR Visualization',
  customBranding: 'Custom Branding',
  advancedAnalytics: 'Advanced Analytics',
  apiAccess: 'API Access',
  prioritySupport: 'Priority Support',
  unlimitedTasks: 'Unlimited Tasks',
  webhookIntegration: 'Webhook Integration',
};

export default function PricingQumus() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleCheckout = (tier: string) => {
    if (tier === 'Free') {
      // Redirect to signup or dashboard
      navigate('/');
    } else {
      // Trigger Stripe checkout
      setSelectedTier(tier);
      // Call checkout mutation
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">QUMUS Pricing</h1>
          <p className="text-xl text-slate-300">
            Choose the perfect plan for your autonomous orchestration needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.highlighted
                  ? 'ring-2 ring-cyan-500 scale-105 shadow-2xl'
                  : 'border-slate-700'
              } bg-slate-800 border-slate-700 hover:border-slate-600 transition-all`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{tier.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  {tier.period && <span className="text-slate-400 ml-2">/{tier.period}</span>}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6 flex-1">
                  {Object.entries(tier.features).map(([key, included]) => (
                    <div key={key} className="flex items-center gap-3">
                      {included ? (
                        <Check className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={included ? 'text-white' : 'text-slate-500'}>
                        {featureLabels[key as keyof typeof featureLabels]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(tier.name)}
                  className={`w-full ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } text-white font-semibold py-2 rounded-lg transition-all`}
                >
                  {tier.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-slate-400">
                Yes! You can change your plan at any time. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-slate-400">
                Yes, all paid plans include a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-400">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-slate-400">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
