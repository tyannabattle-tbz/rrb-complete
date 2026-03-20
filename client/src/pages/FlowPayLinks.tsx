import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Copy, Share2, Trash2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function FlowPayLinks() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    title: '',
  });

  const createLinkMutation = trpc.flowpay.generatePaymentLink.useMutation({
    onSuccess: (data) => {
      toast.success('Payment link created!');
      setPaymentLinks([...paymentLinks, data]);
      setFormData({
        amount: '',
        description: '',
        title: '',
      });
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.title || !user?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createLinkMutation.mutateAsync({
        userId: user.id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        title: formData.title,
      });
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to create payment links</CardDescription>
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
              <h1 className="text-3xl font-bold text-white">Payment Links</h1>
              <p className="text-gray-400">Create shareable payment requests</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Link
          </Button>
        </div>

        {/* Create Link Form */}
        {showForm && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Create Payment Link</CardTitle>
              <CardDescription>Generate a shareable link for payments</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      Link Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Donation, Invoice, Subscription"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Add details about this payment request..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 min-h-24"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createLinkMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {createLinkMutation.isPending ? 'Creating...' : 'Create Link'}
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

        {/* Links List */}
        <div className="space-y-4">
          {paymentLinks.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="text-center py-12">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No payment links yet</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Link
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentLinks.map((link: any) => (
              <Card key={link.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-bold text-lg">{link.title}</h3>
                        <p className="text-purple-400 font-bold text-xl">${link.amount.toFixed(2)}</p>
                        {link.description && (
                          <p className="text-gray-400 text-sm mt-2">{link.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(link.url)}
                          className="text-blue-400 hover:bg-blue-900/20"
                          title="Copy link"
                        >
                          <Copy className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-400 hover:bg-green-900/20"
                          title="Share link"
                        >
                          <Share2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-red-900/20"
                          title="Delete link"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Link Display */}
                    <div className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                      <code className="text-gray-300 text-sm truncate">{link.url}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(link.url)}
                        className="text-purple-400 hover:bg-slate-600"
                      >
                        Copy
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Created</p>
                        <p className="text-white">{new Date(link.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Clicks</p>
                        <p className="text-white">{link.clicks || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white text-sm">Share Payment Links</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 text-sm space-y-2">
            <p>• Share links on social media (Twitter, Facebook, etc.)</p>
            <p>• Include in emails and messages</p>
            <p>• Track clicks and engagement</p>
            <p>• Recipients can pay without creating an account</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
