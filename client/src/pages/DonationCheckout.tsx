import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface DonationTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  benefits: string[];
  popular?: boolean;
}

const DONATION_TIERS: DonationTier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    amount: 5,
    description: 'Support our mission',
    benefits: [
      'Early access to new episodes',
      'Ad-free listening',
      'Monthly supporter newsletter',
    ],
  },
  {
    id: 'champion',
    name: 'Champion',
    amount: 25,
    description: 'Make a real impact',
    benefits: [
      'Everything in Supporter',
      'Exclusive behind-the-scenes content',
      'Direct access to creators',
      'Custom playlist creation',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'benefactor',
    name: 'Benefactor',
    amount: 100,
    description: 'Transform the platform',
    benefits: [
      'Everything in Champion',
      'Naming recognition',
      'Quarterly strategy calls',
      'Custom feature requests',
      'VIP event invitations',
      'Lifetime premium access',
    ],
  },
];

export function DonationCheckout() {
  const [selectedTier, setSelectedTier] = useState<string>('champion');
  const [isLoading, setIsLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleCheckout = async (tier: DonationTier) => {
    setIsLoading(true);
    try {
      // Call existing Stripe checkout endpoint
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierName: tier.name,
          amount: tier.amount * 100, // Convert to cents
          tierId: tier.id,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDonation = async () => {
    const amount = parseFloat(customAmount);
    if (amount < 1) {
      alert('Minimum donation is $1');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierName: 'Custom Donation',
          amount: amount * 100,
          tierId: 'custom',
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Custom donation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Support Our Mission</h1>
          <p className="text-xl text-slate-300">
            Help us preserve and celebrate the legacy of Rockin' Rockin' Boogie
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {DONATION_TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={`relative p-8 transition-all cursor-pointer ${
                selectedTier === tier.id
                  ? 'ring-2 ring-amber-500 bg-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${tier.amount}</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(tier)}
                disabled={isLoading}
                className={`w-full ${
                  tier.popular
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {isLoading ? 'Processing...' : `Donate $${tier.amount}`}
              </Button>
            </Card>
          ))}
        </div>

        {/* Custom Donation */}
        <Card className="bg-slate-800 p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-4">Custom Donation</h3>
          <p className="text-slate-400 mb-6">
            Choose your own amount to support our mission
          </p>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Donation Amount ($)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCustomDonation}
                disabled={isLoading || !customAmount}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {isLoading ? 'Processing...' : 'Donate'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <Card className="bg-slate-800 p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Why Support Us?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-amber-500 mb-2">Preserve History</h4>
              <p className="text-slate-400">
                Help us maintain and archive the legacy of classic rock music
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-500 mb-2">Support Creators</h4>
              <p className="text-slate-400">
                Your donations directly support content creators and producers
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-500 mb-2">Grow Community</h4>
              <p className="text-slate-400">
                Build a thriving community of music enthusiasts and collectors
              </p>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          All donations are processed securely through Stripe. Your payment information is never stored on our servers.
        </p>
      </div>
    </div>
  );
}
