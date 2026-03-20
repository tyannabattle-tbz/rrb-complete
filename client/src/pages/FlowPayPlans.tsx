import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function FlowPayPlans() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [plans, setPlans] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    amount: '',
    frequency: 'monthly',
    startDate: '',
    endDate: '',
  });

  const createPlanMutation = trpc.flowpay.createPaymentPlan.useMutation({
    onSuccess: () => {
      toast.success('Payment plan created!');
      setFormData({
        recipientEmail: '',
        amount: '',
        frequency: 'monthly',
        startDate: '',
        endDate: '',
      });
      setShowForm(false);
      // Refresh plans
      fetchPlans();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const fetchPlans = async () => {
    if (!user?.id) return;
    try {
      // This would call the actual tRPC procedure
      // const result = await trpc.flowpay.getPaymentPlans.query({ userId: user.id });
      // setPlans(result);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientEmail || !formData.amount || !user?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createPlanMutation.mutateAsync({
        userId: user.id,
        recipientEmail: formData.recipientEmail,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
        startDate: new Date(formData.startDate).getTime(),
        endDate: formData.endDate ? new Date(formData.endDate).getTime() : null,
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage payment plans</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/flowpay/dashboard')}
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Payment Plans</h1>
              <p className="text-gray-400">Set up recurring payments</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>

        {/* Create Plan Form */}
        {showForm && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Create Payment Plan</CardTitle>
              <CardDescription>Set up automatic recurring payments</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recipient */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-white">
                      Recipient Email
                    </Label>
                    <Input
                      id="recipient"
                      type="email"
                      placeholder="recipient@example.com"
                      value={formData.recipientEmail}
                      onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">
                      Amount (USD)
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-white">$</span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        step="0.01"
                        min="0"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-white">
                      Frequency
                    </Label>
                    <select
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-white">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-white">
                      End Date (Optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createPlanMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Plans List */}
        <div className="space-y-4">
          {plans.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No payment plans yet</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            plans.map((plan: any) => (
              <Card key={plan.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">{plan.recipientEmail}</h3>
                      <p className="text-gray-400 text-sm">{plan.frequency} • ${plan.amount.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        Starts: {new Date(plan.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
