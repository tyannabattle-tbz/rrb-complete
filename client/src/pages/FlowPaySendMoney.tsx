import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function FlowPaySendMoney() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);

  const sendMoneyMutation = trpc.flowpay.sendMoney.useMutation({
    onSuccess: () => {
      toast.success('Payment sent successfully!');
      setRecipientEmail('');
      setAmount('');
      setDescription('');
      setTimeout(() => setLocation('/flowpay/dashboard'), 2000);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail || !amount || !user?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await sendMoneyMutation.mutateAsync({
        senderId: user.id,
        recipientEmail,
        amount: parseFloat(amount),
        description: description || 'Payment',
        paymentMethod,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to send money</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/flowpay/dashboard')}
            className="text-white hover:bg-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Send Money</h1>
            <p className="text-gray-400">Transfer funds to another user</p>
          </div>
        </div>

        {/* Send Money Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Details</CardTitle>
            <CardDescription>Enter recipient and amount information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient */}
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-white">
                  Recipient Email
                </Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount (USD)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description (Optional)
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="What is this payment for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="method" className="text-white">
                  Payment Method
                </Label>
                <select
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>

              {/* Summary */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Amount:</span>
                  <span className="text-white font-bold">${parseFloat(amount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Fee:</span>
                  <span className="text-white font-bold">$0.00</span>
                </div>
                <div className="border-t border-slate-600 pt-2 flex justify-between">
                  <span className="text-white font-bold">Total:</span>
                  <span className="text-purple-400 font-bold text-lg">${parseFloat(amount || '0').toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !recipientEmail || !amount}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Processing...' : 'Send Money'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white text-sm">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 text-sm space-y-2">
            <p>• Funds are transferred instantly to the recipient</p>
            <p>• Both parties receive transaction confirmation</p>
            <p>• All transactions are secured with Stripe</p>
            <p>• No hidden fees or surprise charges</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
