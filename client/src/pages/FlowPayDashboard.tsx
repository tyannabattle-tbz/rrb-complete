import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { ArrowUpRight, ArrowDownLeft, Plus, Link as LinkIcon, Calendar } from 'lucide-react';

export default function FlowPayDashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Fetch user balance and transactions
  const { data: userBalance } = trpc.flowpay.getUserBalance.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const { data: transactions } = trpc.flowpay.getTransactionHistory.useQuery(
    { userId: user?.id || 0, limit: 5 },
    { enabled: !!user?.id }
  );

  useEffect(() => {
    if (userBalance) setBalance(userBalance.balance);
    if (transactions) setRecentTransactions(transactions);
  }, [userBalance, transactions]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access FlowPay</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">FlowPay Dashboard</h1>
          <p className="text-gray-400">Manage your payments and transfers</p>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-0 text-white">
            <CardHeader>
              <CardDescription className="text-purple-200">Available Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">${balance.toFixed(2)}</div>
              <div className="flex gap-2">
                <Link href="/flowpay/send">
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 flex-1">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send Money
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/flowpay/plans">
                <Button variant="outline" className="w-full justify-start text-white border-slate-600 hover:bg-slate-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Payment Plans
                </Button>
              </Link>
              <Link href="/flowpay/links">
                <Button variant="outline" className="w-full justify-start text-white border-slate-600 hover:bg-slate-700">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Payment Links
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Sent</p>
                  <p className="text-2xl font-bold text-green-400">$0.00</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Received</p>
                  <p className="text-2xl font-bold text-blue-400">$0.00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <CardDescription>Your latest payment activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions yet</p>
                <Link href="/flowpay/send">
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Send Your First Payment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {tx.type === 'send' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">{tx.description}</p>
                        <p className="text-gray-400 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'send' ? '-' : '+'}${tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
