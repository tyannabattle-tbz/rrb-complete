import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    requests: '10,000/month',
    features: ['Basic analytics', 'Email support', 'API access'],
  },
  {
    name: 'Pro',
    price: '$99',
    requests: '1,000,000/month',
    features: ['Advanced analytics', 'Priority support', 'Webhooks', 'Custom policies'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    requests: 'Unlimited',
    features: ['Unlimited requests', 'Dedicated support', 'SLA', 'Custom integrations'],
  },
];

export function Pricing() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-600">Choose the plan that fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.popular ? 'border-2 border-blue-600 relative' : ''}>
            {tier.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Most Popular</span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <div className="text-3xl font-bold mt-2">{tier.price}</div>
              <p className="text-sm text-gray-600">{tier.requests}</p>
            </CardHeader>
            <CardContent>
              <Button className="w-full mb-6" variant={tier.popular ? 'default' : 'outline'}>
                Get Started
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
    </div>
  );
}
