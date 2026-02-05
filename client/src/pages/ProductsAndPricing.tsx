import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, Heart, Music, Headphones, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  category: 'meditation' | 'studio' | 'donation';
}

const pricingTiers: PricingTier[] = [
  // Meditation Subscription Tiers
  {
    id: 'meditation-free',
    name: 'Free Listener',
    description: 'Start your meditation journey',
    price: 0,
    period: 'forever',
    category: 'meditation',
    icon: <Music className="w-6 h-6" />,
    features: [
      'Access to 50+ free meditations',
      'Basic breathing exercises',
      'Community support',
      'Ad-supported experience',
    ],
  },
  {
    id: 'meditation-premium',
    name: 'Premium',
    description: 'Enhanced meditation experience',
    price: 9.99,
    period: 'month',
    category: 'meditation',
    icon: <Sparkles className="w-6 h-6" />,
    popular: true,
    features: [
      'Unlimited access to 500+ meditations',
      'Ad-free listening',
      'Offline downloads',
      'Personalized recommendations',
      'Sleep stories & soundscapes',
      'Priority support',
    ],
  },
  {
    id: 'meditation-vip',
    name: 'VIP',
    description: 'Ultimate meditation mastery',
    price: 19.99,
    period: 'month',
    category: 'meditation',
    icon: <Star className="w-6 h-6" />,
    features: [
      'Everything in Premium',
      'Live guided sessions (weekly)',
      'One-on-one coaching (monthly)',
      'Advanced analytics & insights',
      'Early access to new content',
      'Exclusive VIP community',
      'Custom meditation creation',
    ],
  },

  // Studio Production Packages
  {
    id: 'studio-starter',
    name: 'Starter Studio',
    description: 'Perfect for beginners',
    price: 49.99,
    period: 'month',
    category: 'studio',
    icon: <Headphones className="w-6 h-6" />,
    features: [
      '10 hours of studio time/month',
      'Basic editing tools',
      'Standard quality export (MP3)',
      'Email support',
      'Access to sample library',
    ],
  },
  {
    id: 'studio-professional',
    name: 'Professional',
    description: 'For serious producers',
    price: 149.99,
    period: 'month',
    category: 'studio',
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    features: [
      'Unlimited studio time',
      'Advanced mixing & mastering',
      'High-quality export (FLAC, WAV)',
      'Priority support',
      'Premium sound library (10K+ samples)',
      'Collaboration tools',
      'Monthly masterclass',
    ],
  },
  {
    id: 'studio-enterprise',
    name: 'Enterprise',
    description: 'For production studios',
    price: 499.99,
    period: 'month',
    category: 'studio',
    icon: <Star className="w-6 h-6" />,
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Team collaboration (up to 10)',
      'Priority feature requests',
      'Custom SLA & support',
    ],
  },

  // Donation Tiers
  {
    id: 'donate-supporter',
    name: 'Supporter',
    description: 'Help us grow',
    price: 5,
    period: 'one-time',
    category: 'donation',
    icon: <Heart className="w-6 h-6" />,
    features: [
      'Supporter badge on profile',
      'Early access to new features',
      'Thank you in monthly newsletter',
      'Exclusive supporter content',
    ],
  },
  {
    id: 'donate-champion',
    name: 'Champion',
    description: 'Make a real impact',
    price: 25,
    period: 'one-time',
    category: 'donation',
    icon: <Star className="w-6 h-6" />,
    popular: true,
    features: [
      'Champion badge on profile',
      'Everything in Supporter',
      'Exclusive podcast episode',
      'Direct message with founder',
      'Custom meditation request',
    ],
  },
  {
    id: 'donate-benefactor',
    name: 'Benefactor',
    description: 'Transform the platform',
    price: 100,
    period: 'one-time',
    category: 'donation',
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      'Benefactor badge on profile',
      'Everything in Champion',
      'Lifetime premium access',
      'Quarterly strategy calls',
      'Feature naming rights',
      'Annual recognition event',
    ],
  },
];

export default function ProductsAndPricing() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'meditation' | 'studio' | 'donation'>('meditation');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Stripe checkout mutation
  const checkoutMutation = trpc.stripeCheckout.createCheckoutSession.useMutation();

  const handleSelectTier = async (tier: PricingTier) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setSelectedTier(tier.id);

    if (tier.price === 0) {
      // Free tier - no checkout needed
      console.log('Selected free tier:', tier.name);
      setSelectedTier(null);
      return;
    }

    try {
      const result = await checkoutMutation.mutateAsync({
        priceId: tier.id,
      } as any);

      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout. Please try again.');
    }

    setSelectedTier(null);
  };

  const filteredTiers = pricingTiers.filter(tier => tier.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Products & Pricing</h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Choose the perfect plan for your meditation journey or production needs
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap px-4">
        <Button
          onClick={() => setSelectedCategory('meditation')}
          variant={selectedCategory === 'meditation' ? 'default' : 'outline'}
          className="px-6 py-2"
        >
          <Music className="w-4 h-4 mr-2" />
          Meditation Tiers
        </Button>
        <Button
          onClick={() => setSelectedCategory('studio')}
          variant={selectedCategory === 'studio' ? 'default' : 'outline'}
          className="px-6 py-2"
        >
          <Headphones className="w-4 h-4 mr-2" />
          Studio Packages
        </Button>
        <Button
          onClick={() => setSelectedCategory('donation')}
          variant={selectedCategory === 'donation' ? 'default' : 'outline'}
          className="px-6 py-2"
        >
          <Heart className="w-4 h-4 mr-2" />
          Donations
        </Button>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTiers.map(tier => (
            <Card
              key={tier.id}
              className={`relative flex flex-col h-full transition-all ${
                tier.popular
                  ? 'ring-2 ring-blue-500 md:scale-105 shadow-2xl'
                  : 'hover:shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-blue-400">{tier.icon}</div>
                </div>
                <p className="text-slate-400 text-sm">{tier.description}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    {tier.period !== 'one-time' && (
                      <span className="text-slate-400">/{tier.period}</span>
                    )}
                  </div>
                  {tier.period === 'one-time' && (
                    <p className="text-slate-400 text-sm mt-1">One-time donation</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectTier(tier)}
                  disabled={selectedTier === tier.id || checkoutMutation.isPending}
                  className={`w-full ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {tier.price === 0
                    ? 'Get Started Free'
                    : tier.period === 'one-time'
                    ? 'Donate Now'
                    : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-800 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change my subscription tier?</h3>
              <p className="text-slate-300">
                Yes! You can upgrade or downgrade your subscription anytime. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-slate-300">
                Our Free Listener tier gives you unlimited access to 50+ meditations. Premium and VIP tiers offer 7-day free trials.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-300">
                We accept all major credit cards, PayPal, and Apple Pay through our secure Stripe payment processor.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-300">
                Absolutely! Cancel your subscription anytime with no penalties. You'll retain access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
