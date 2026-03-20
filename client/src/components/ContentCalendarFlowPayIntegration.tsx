import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Share2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface ContentCalendarFlowPayIntegrationProps {
  contentId: string;
  contentTitle: string;
  publishDate: Date;
  onMonetizationEnabled?: (contentId: string) => void;
}

export function ContentCalendarFlowPayIntegration({
  contentId,
  contentTitle,
  publishDate,
  onMonetizationEnabled,
}: ContentCalendarFlowPayIntegrationProps) {
  const [showMonetization, setShowMonetization] = useState(false);
  const [monetizationType, setMonetizationType] = useState('pay-what-you-want');
  const [minPrice, setMinPrice] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [isMonetized, setIsMonetized] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [revenue, setRevenue] = useState(0);
  const [purchases, setPurchases] = useState(0);

  const enableMonetization = async () => {
    if (monetizationType === 'fixed' && !suggestedPrice) {
      toast.error('Please enter a price');
      return;
    }

    try {
      const link = `${window.location.origin}/flowpay/links?content=${contentId}&title=${encodeURIComponent(contentTitle)}&type=${monetizationType}&price=${suggestedPrice || minPrice}`;
      setPaymentLink(link);
      setIsMonetized(true);
      onMonetizationEnabled?.(contentId);
      toast.success('Monetization enabled!');
    } catch (error) {
      toast.error('Failed to enable monetization');
    }
  };

  const copyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const shareToTwitter = () => {
    if (paymentLink) {
      const text = `Check out "${contentTitle}" - Support the creator: ${paymentLink}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Content Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-white font-bold">{contentTitle}</h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Published: {publishDate.toLocaleDateString()}</span>
            </div>
            {isMonetized && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Zap className="w-4 h-4" />
                <span>Monetized • ${revenue.toFixed(2)} earned • {purchases} purchases</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monetization Toggle */}
      <Button
        onClick={() => setShowMonetization(!showMonetization)}
        disabled={isMonetized}
        className={`w-full ${
          isMonetized
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white font-bold`}
      >
        <DollarSign className="w-4 h-4 mr-2" />
        {isMonetized ? 'Monetization Active' : 'Enable Monetization'}
      </Button>

      {/* Monetization Setup */}
      {showMonetization && !isMonetized && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Monetization Options</CardTitle>
            <CardDescription>Choose how to monetize this content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Monetization Type */}
            <div className="space-y-2">
              <Label className="text-white">Monetization Type</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="radio"
                    value="pay-what-you-want"
                    checked={monetizationType === 'pay-what-you-want'}
                    onChange={(e) => setMonetizationType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Pay What You Want</span>
                </label>
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="radio"
                    value="minimum-price"
                    checked={monetizationType === 'minimum-price'}
                    onChange={(e) => setMonetizationType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Minimum Price</span>
                </label>
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="radio"
                    value="fixed"
                    checked={monetizationType === 'fixed'}
                    onChange={(e) => setMonetizationType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Fixed Price</span>
                </label>
              </div>
            </div>

            {/* Price Input */}
            {(monetizationType === 'minimum-price' || monetizationType === 'fixed') && (
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">
                  {monetizationType === 'fixed' ? 'Price' : 'Minimum Price'} (USD)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-white">$</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={monetizationType === 'fixed' ? suggestedPrice : minPrice}
                    onChange={(e) =>
                      monetizationType === 'fixed'
                        ? setSuggestedPrice(e.target.value)
                        : setMinPrice(e.target.value)
                    }
                    step="0.01"
                    min="0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}

            {/* Enable Button */}
            <Button
              onClick={enableMonetization}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Enable Monetization
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Monetization */}
      {isMonetized && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Monetization Active</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${revenue.toFixed(2)}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Purchases</p>
                <p className="text-2xl font-bold text-blue-400">{purchases}</p>
              </div>
            </div>

            {/* Payment Link */}
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-2">Payment Link</p>
              <code className="text-gray-300 text-sm break-all">{paymentLink}</code>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={copyLink}
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                Copy Link
              </Button>
              <Button
                onClick={shareToTwitter}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on X
              </Button>
            </div>

            {/* Info */}
            <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300 space-y-1">
              <p>• Payments processed instantly</p>
              <p>• Automatic monthly payouts</p>
              <p>• Full analytics dashboard</p>
              <p>• No setup fees</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
