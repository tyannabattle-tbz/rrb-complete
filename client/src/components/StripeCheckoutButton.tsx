import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface StripeCheckoutProps {
  productName: string;
  priceId: string;
  amount: number;
  currency: string;
  description?: string;
  onSuccess?: () => void;
}

export function StripeCheckoutButton({
  productName,
  priceId,
  amount,
  currency,
  description,
  onSuccess,
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Call backend to create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          productName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionUrl } = await response.json();

      // Redirect to Stripe Checkout
      if (sessionUrl) {
        window.open(sessionUrl, '_blank');
        toast.success('Redirecting to checkout...');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard size={18} className="text-blue-400" />
          {productName}
        </CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-cyan-400">
            {(amount / 100).toFixed(2)}
          </span>
          <span className="text-slate-400 uppercase">{currency}</span>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={16} className="mr-2" />
              Upgrade Now
            </>
          )}
        </Button>

        <p className="text-xs text-slate-400 text-center">
          Secure payment powered by Stripe
        </p>
      </CardContent>
    </Card>
  );
}
