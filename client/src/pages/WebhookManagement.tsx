import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  deliveryCount: number;
  failureCount: number;
  lastTriggeredAt?: Date;
}

export default function WebhookManagement() {
  const [, navigate] = useLocation();
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: 'wh_example1',
      name: 'Emergency Alert System',
      url: 'https://alerts.example.com/webhooks/broadcast',
      secret: 'whs_secret123456789',
      events: ['broadcast.created', 'broadcast.sent', 'broadcast.delivered'],
      active: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      deliveryCount: 156,
      failureCount: 2,
      lastTriggeredAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });

  const AVAILABLE_EVENTS = [
    'broadcast.created',
    'broadcast.sent',
    'broadcast.delivered',
    'broadcast.failed',
    'broadcast.viewed',
    'user.created',
    'template.created',
    'template.updated',
  ];

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      new URL(newWebhook.url);
    } catch {
      toast.error('Invalid webhook URL');
      return;
    }

    const webhook: Webhook = {
      id: `wh_${Math.random().toString(36).substr(2, 9)}`,
      name: newWebhook.name,
      url: newWebhook.url,
      secret: `whs_${Math.random().toString(36).substr(2, 32)}`,
      events: newWebhook.events,
      active: true,
      createdAt: new Date(),
      deliveryCount: 0,
      failureCount: 0,
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setShowCreateDialog(false);
    toast.success('Webhook created successfully');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success('Webhook deleted');
  };

  const handleToggleActive = (id: string) => {
    setWebhooks(
      webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const handleCopySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  const handleRotateSecret = (id: string) => {
    setWebhooks(
      webhooks.map((w) =>
        w.id === id
          ? {
              ...w,
              secret: `whs_${Math.random().toString(36).substr(2, 32)}`,
            }
          : w
      )
    );
    toast.success('Secret rotated successfully');
  };

  const getSuccessRate = (webhook: Webhook) => {
    const total = webhook.deliveryCount + webhook.failureCount;
    if (total === 0) return 0;
    return ((webhook.deliveryCount / total) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Webhook Management</h1>
              <p className="text-slate-400 text-sm mt-1">
                Integrate external systems with webhook endpoints
              </p>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Webhook</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Webhook Name
                  </label>
                  <Input
                    placeholder="e.g., Emergency Alert System"
                    value={newWebhook.name}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, name: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Webhook URL
                  </label>
                  <Input
                    placeholder="https://example.com/webhooks/broadcast"
                    value={newWebhook.url}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, url: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Must be a valid HTTPS URL
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Events
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {AVAILABLE_EVENTS.map((event) => (
                      <label
                        key={event}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newWebhook.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhook({
                                ...newWebhook,
                                events: [...newWebhook.events, event],
                              });
                            } else {
                              setNewWebhook({
                                ...newWebhook,
                                events: newWebhook.events.filter(
                                  (ev) => ev !== event
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-600"
                        />
                        <span className="text-sm text-slate-300">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateWebhook}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    Create Webhook
                  </Button>
                  <Button
                    onClick={() => setShowCreateDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Webhooks List */}
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card
              key={webhook.id}
              className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {webhook.name}
                    </h3>
                    <Badge
                      className={
                        webhook.active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }
                    >
                      {webhook.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 break-all">{webhook.url}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs mb-1">Deliveries</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {webhook.deliveryCount}
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs mb-1">Failures</div>
                  <div className="text-xl font-bold text-red-400">
                    {webhook.failureCount}
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs mb-1">Success Rate</div>
                  <div className="text-xl font-bold text-green-400">
                    {getSuccessRate(webhook)}%
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs mb-1">Last Triggered</div>
                  <div className="text-sm font-semibold text-slate-300">
                    {webhook.lastTriggeredAt
                      ? new Date(webhook.lastTriggeredAt).toLocaleString()
                      : 'Never'}
                  </div>
                </div>
              </div>

              {/* Events */}
              <div className="mb-4">
                <div className="text-sm text-slate-400 mb-2">Events:</div>
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <Badge
                      key={event}
                      className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Secret */}
              <div className="mb-4 p-3 bg-slate-700/30 rounded border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 mb-1">Secret</div>
                    <div className="text-sm font-mono text-slate-300">
                      {showSecrets[webhook.id]
                        ? webhook.secret
                        : '•'.repeat(webhook.secret.length)}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() =>
                        setShowSecrets({
                          ...showSecrets,
                          [webhook.id]: !showSecrets[webhook.id],
                        })
                      }
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      {showSecrets[webhook.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => handleCopySecret(webhook.secret)}
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleToggleActive(webhook.id)}
                  size="sm"
                  variant="outline"
                  className={
                    webhook.active
                      ? 'text-orange-400 border-orange-600 hover:bg-orange-500/10'
                      : 'text-green-400 border-green-600 hover:bg-green-500/10'
                  }
                >
                  {webhook.active ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  onClick={() => handleRotateSecret(webhook.id)}
                  size="sm"
                  variant="outline"
                  className="text-blue-400 border-blue-600 hover:bg-blue-500/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Rotate Secret
                </Button>
                <Button
                  onClick={() => handleDeleteWebhook(webhook.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-400 border-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {webhooks.length === 0 && (
          <Card className="p-12 bg-slate-800 border-slate-700 text-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Webhooks Created
            </h3>
            <p className="text-slate-500 mb-4">
              Create your first webhook to integrate external systems.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </Card>
        )}

        {/* Info Box */}
        <Card className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <strong>Webhook Security:</strong> All webhook payloads are signed with
              HMAC-SHA256. Verify the signature using the webhook secret to ensure
              authenticity. Rotate your secret regularly for security.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
