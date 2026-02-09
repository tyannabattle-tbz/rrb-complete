import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Heart } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [selectedTier, setSelectedTier] = useState<'supporter' | 'patron' | 'champion' | 'benefactor' | 'founder' | 'custom'>('supporter');
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: tiers = [], isLoading: tiersLoading } = trpc.donations.getDonationTiers.useQuery();
  const createCheckoutMutation = trpc.donations.createCheckoutSession.useMutation();

  const handleDonate = async () => {
    try {
      setIsLoading(true);

      const amount = selectedTier === 'custom' 
        ? Math.round(parseFloat(customAmount) * 100)
        : undefined;

      if (selectedTier === 'custom' && (!customAmount || parseFloat(customAmount) < 0.50)) {
        toast.error('Minimum donation is $0.50');
        setIsLoading(false);
        return;
      }

      const result = await createCheckoutMutation.mutateAsync({
        tier: selectedTier as any,
        customAmount: amount,
      });

      if (result.checkoutUrl) {
        toast.success('Redirecting to checkout...');
        window.open(result.checkoutUrl, '_blank');
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            Support the Legacy
          </DialogTitle>
          <DialogDescription className="text-base">
            Your donation directly supports the preservation and documentation of Seabrun Candy Hunter's legacy and future documentary work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Impact Statement */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h3 className="font-bold text-foreground mb-3">How Your Donation Helps</h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Archive digitization and preservation</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Documentary production and distribution</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Research and historical verification</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Public access to materials and records</span>
              </li>
            </ul>
          </div>

          {/* Donation Tiers */}
          {tiersLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Choose a donation tier:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setSelectedTier(tier.id as any);
                      setCustomAmount('');
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTier === tier.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="font-bold text-foreground">{tier.name}</div>
                    <div className="text-sm text-foreground/70">{tier.description}</div>
                    <div className="text-lg font-bold text-accent mt-2">{tier.amountFormatted}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <button
                onClick={() => setSelectedTier('custom')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTier === 'custom'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="font-bold text-foreground mb-2">Custom Amount</div>
                <Input
                  type="number"
                  placeholder="Enter amount in USD (minimum $0.50)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedTier('custom');
                  }}
                  min="0.50"
                  step="0.01"
                  className="mt-2"
                  onClick={(e) => e.stopPropagation()}
                />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDonate}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading || tiersLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2 fill-current" />
                  Donate Now
                </>
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-foreground/60 text-center">
            Donations are processed securely through Stripe. Your payment information is never stored on our servers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
