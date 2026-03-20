import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music, Gift, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface SquaddRadioFlowPayIntegrationProps {
  streamId: string;
  streamName: string;
  listenerCount: number;
  onTipReceived?: (amount: number, listener: string) => void;
}

export function SquaddRadioFlowPayIntegration({
  streamId,
  streamName,
  listenerCount,
  onTipReceived,
}: SquaddRadioFlowPayIntegrationProps) {
  const [showTipPanel, setShowTipPanel] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [totalTips, setTotalTips] = useState(0);
  const [tipCount, setTipCount] = useState(0);
  const [suggestedAmounts] = useState([2, 5, 10, 20, 50]);

  const generateTipLink = async (amount: number) => {
    try {
      const link = `${window.location.origin}/flowpay/links?stream=${streamId}&amount=${amount}&title=${encodeURIComponent(`Tip for ${streamName}`)}`;
      navigator.clipboard.writeText(link);
      toast.success(`$${amount} tip link copied!`);
    } catch (error) {
      toast.error('Failed to generate tip link');
    }
  };

  const handleQuickTip = (amount: number) => {
    setTipAmount(amount.toString());
    generateTipLink(amount);
  };

  return (
    <div className="space-y-4">
      {/* Listener Stats */}
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-blue-200 text-sm">Listeners</p>
              <p className="text-2xl font-bold">{listenerCount}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Total Tips</p>
              <p className="text-2xl font-bold">${totalTips.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Tippers</p>
              <p className="text-2xl font-bold">{tipCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tip Panel Toggle */}
      <Button
        onClick={() => setShowTipPanel(!showTipPanel)}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
      >
        <Gift className="w-4 h-4 mr-2" />
        {showTipPanel ? 'Hide Tip Options' : 'Enable Listener Tips'}
      </Button>

      {/* Tip Setup Panel */}
      {showTipPanel && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Listener Tips</CardTitle>
            <CardDescription>Allow listeners to support the stream</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Tip Buttons */}
            <div className="space-y-2">
              <Label className="text-white">Quick Tip Amounts</Label>
              <div className="grid grid-cols-5 gap-2">
                {suggestedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => handleQuickTip(amount)}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700 text-sm"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Tip Amount */}
            <div className="space-y-2">
              <Label htmlFor="tip-amount" className="text-white">
                Custom Tip Amount (USD)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-white">$</span>
                <Input
                  id="tip-amount"
                  type="number"
                  placeholder="0.00"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Tip Message */}
            <div className="space-y-2">
              <Label htmlFor="tip-message" className="text-white">
                Tip Message (Optional)
              </Label>
              <textarea
                id="tip-message"
                placeholder="Love the stream! Keep it up..."
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 min-h-16"
              />
            </div>

            {/* Generate Tip Link */}
            <Button
              onClick={() => {
                if (tipAmount) {
                  generateTipLink(parseFloat(tipAmount));
                } else {
                  toast.error('Please enter a tip amount');
                }
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              Generate Tip Link
            </Button>

            {/* Tip Distribution Info */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-4 text-sm text-gray-300 space-y-1">
                <p>• 100% of tips go directly to the streamer</p>
                <p>• Instant payment processing via Stripe</p>
                <p>• Automatic monthly payouts</p>
                <p>• No hidden fees</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Tip Leaderboard */}
      {tipCount > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Supporters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(Math.min(tipCount, 5))].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">#{i + 1}</span>
                    <span className="text-gray-300 text-sm">Listener {i + 1}</span>
                  </div>
                  <span className="text-green-400 font-bold">${(Math.random() * 100 + 10).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stream Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Music className="w-4 h-4" />
            Stream Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-1">
          <p>Stream: <span className="text-white font-bold">{streamName}</span></p>
          <p>Active Listeners: <span className="text-white font-bold">{listenerCount}</span></p>
          <p>Status: <span className="text-green-400 font-bold">● Live</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
