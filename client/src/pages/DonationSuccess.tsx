import { useEffect, useState } from 'react';
import { useSearch, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, CheckCircle2, ArrowLeft, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DonationSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get('session_id');
  const [shared, setShared] = useState(false);

  const { data: session, isLoading, error } = trpc.stripePayments.getCheckoutSession.useQuery(
    { sessionId: sessionId || '' },
    { enabled: !!sessionId, retry: 2 }
  );

  useEffect(() => {
    if (session?.status === 'paid') {
      toast.success('Thank you for your generous donation!');
    }
  }, [session?.status]);

  const handleShare = () => {
    const text = "I just donated to the Sweet Miracles Foundation in support of legacy recovery efforts! Join me in making a difference.";
    if (navigator.share) {
      navigator.share({ title: 'Sweet Miracles Donation', text, url: window.location.origin + '/sweet-miracles' });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Message copied to clipboard!');
    }
    setShared(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto" />
          <p className="text-muted-foreground">Confirming your donation...</p>
        </div>
      </div>
    );
  }

  const amount = session?.amountTotal ? (session.amountTotal / 100).toFixed(2) : null;
  const donorName = session?.metadata?.customer_name || session?.metadata?.donorName || 'Friend';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950/20 to-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-amber-500/30 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Thank You, {donorName}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {amount && (
            <div className="bg-amber-500/10 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Your Donation</p>
              <p className="text-4xl font-bold text-amber-500">${amount}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-amber-500">
              <Heart className="h-5 w-5 fill-current" />
              <span className="font-semibold">Sweet Miracles Foundation</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your generous contribution supports legacy recovery efforts through the
              Sweet Miracles Foundation — a 501(c)(3) / 508(c) nonprofit.
              "A Voice for the Voiceless."
            </p>
          </div>

          {session?.metadata?.purpose && session.metadata.purpose !== 'general-fund' && (
            <p className="text-sm text-muted-foreground">
              Designated for: <span className="font-medium text-foreground capitalize">{session.metadata.purpose.replace(/-/g, ' ')}</span>
            </p>
          )}

          {session?.metadata?.message && (
            <blockquote className="border-l-2 border-amber-500/50 pl-4 text-sm italic text-muted-foreground">
              "{session.metadata.message}"
            </blockquote>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/sweet-miracles" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Sweet Miracles
              </Button>
            </Link>
            <Button
              onClick={handleShare}
              variant="default"
              className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Share2 className="h-4 w-4" />
              {shared ? 'Shared!' : 'Share Your Impact'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            A receipt has been sent to your email. For tax purposes, please retain this confirmation.
            <br />
            Donation ID: {sessionId ? sessionId.slice(0, 20) + '...' : 'N/A'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
