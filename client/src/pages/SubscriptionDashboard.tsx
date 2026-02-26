import React, { useState, useEffect } from 'react';
import { CreditCard, Download, RotateCcw, Trash2, ChevronDown, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { trpc } from '@/lib/trpc';

interface Subscription {
  id: string;
  tier: string;
  status: 'active' | 'paused' | 'cancelled';
  startDate: Date;
  renewalDate: Date;
  amount: number;
  currency: string;
  autoRenew: boolean;
}

interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

export default function SubscriptionDashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSubscription, setExpandedSubscription] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, [user?.id]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      // Fetch subscriptions and payment history
      // This would typically call a tRPC endpoint
      // const data = await trpc.subscriptions.list.useQuery();
      // setSubscriptions(data.subscriptions);
      // setPaymentHistory(data.payments);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (subscriptionId: string) => {
    // Handle upgrade logic
    console.log('Upgrade subscription:', subscriptionId);
  };

  const handleDowngrade = (subscriptionId: string) => {
    // Handle downgrade logic
    console.log('Downgrade subscription:', subscriptionId);
  };

  const handlePauseResume = (subscriptionId: string, isPaused: boolean) => {
    // Handle pause/resume logic
    console.log(isPaused ? 'Resume subscription:' : 'Pause subscription:', subscriptionId);
  };

  const handleCancel = (subscriptionId: string) => {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      // Handle cancellation logic
      console.log('Cancel subscription:', subscriptionId);
    }
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ar_pro':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'voice_training':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
        <p className="text-slate-400">Manage your active subscriptions and billing</p>
      </div>

      {/* Active Subscriptions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Active Subscriptions</h2>

        {subscriptions.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No active subscriptions</p>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              Browse Plans
            </Button>
          </Card>
        ) : (
          subscriptions.map((sub) => (
            <Card
              key={sub.id}
              className="bg-slate-800 border-slate-700 p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {sub.tier.replace(/_/g, ' ')}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTierBadgeColor(sub.tier)}`}>
                      {sub.tier}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    ${sub.amount} {sub.currency} / month
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setExpandedSubscription(expandedSubscription === sub.id ? null : sub.id)
                  }
                  className="text-slate-400 hover:text-white"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expandedSubscription === sub.id ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Started: {new Date(sub.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Renews: {new Date(sub.renewalDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Expanded Actions */}
              {expandedSubscription === sub.id && (
                <div className="border-t border-slate-700 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Auto-renewal</span>
                    <span className={sub.autoRenew ? 'text-green-400' : 'text-slate-500'}>
                      {sub.autoRenew ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {sub.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpgrade(sub.id)}
                          className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                        >
                          Upgrade
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDowngrade(sub.id)}
                          className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          Downgrade
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePauseResume(sub.id, false)}
                          className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      </>
                    )}

                    {sub.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseResume(sub.id, true)}
                        className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(sub.id)}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10 ml-auto"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Payment History</h2>

        {paymentHistory.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No payment history</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {paymentHistory.map((payment) => (
              <Card
                key={payment.id}
                className="bg-slate-800 border-slate-700 p-4 flex items-center justify-between hover:border-slate-600 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{payment.description}</p>
                  <p className="text-sm text-slate-400">{new Date(payment.date).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      ${payment.amount} {payment.currency}
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        payment.status === 'succeeded'
                          ? 'text-green-400'
                          : payment.status === 'pending'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  {payment.invoiceUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadInvoice(payment.invoiceUrl!)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Billing Info */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
        <div className="space-y-3 text-slate-400">
          <p>
            <span className="text-white">Email:</span> {user?.email}
          </p>
          <p>
            <span className="text-white">Payment Method:</span> Stripe (Secure)
          </p>
          <p className="text-sm">
            All payments are processed securely through Stripe. Your financial information is never stored on our servers.
          </p>
        </div>
      </Card>
    </div>
  );
}
