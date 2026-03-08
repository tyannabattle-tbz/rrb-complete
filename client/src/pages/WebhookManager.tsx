import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function WebhookManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: endpoints, refetch: refetchEndpoints } = trpc.chunk5.webhookManager.list.useQuery(undefined, { enabled: !!user });
  const { data: stats } = trpc.chunk5.webhookManager.stats.useQuery();
  const { data: logs } = trpc.chunk5.webhookManager.logs.useQuery({ limit: 20 }, { enabled: !!user });

  const addMutation = trpc.chunk5.webhookManager.add.useMutation({
    onSuccess: () => {
      toast({ title: "Webhook Added", description: "Endpoint registered successfully" });
      setNewUrl("");
      setShowAddForm(false);
      refetchEndpoints();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const removeMutation = trpc.chunk5.webhookManager.remove.useMutation({
    onSuccess: () => {
      toast({ title: "Removed", description: "Webhook endpoint removed" });
      refetchEndpoints();
    },
  });

  const toggleMutation = trpc.chunk5.webhookManager.toggle.useMutation({
    onSuccess: () => refetchEndpoints(),
  });

  const testMutation = trpc.chunk5.webhookManager.test.useMutation({
    onSuccess: (data) => {
      toast({
        title: data.success ? "Test Passed" : "Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
  });

  const dispatchMutation = trpc.chunk5.webhookManager.dispatchUpdate.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Update Dispatched",
        description: `Sent to ${data.successful}/${data.dispatched} endpoints`,
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              Webhook Manager
            </h1>
            <p className="text-gray-400 mt-1">Manage team notification endpoints — Slack, Discord, and custom webhooks</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              + Add Endpoint
            </Button>
            <Button
              onClick={() => dispatchMutation.mutate({
                event: "system.update",
                title: "QUMUS Ecosystem Update Available",
                version: "3.0.0",
                changelog: "New features deployed — check the Team Updates dashboard for details.",
                severity: "info",
                affectedSystems: "all",
              })}
              disabled={dispatchMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {dispatchMutation.isPending ? "Dispatching..." : "Broadcast Update"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900/60 border border-purple-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats?.totalEndpoints ?? 0}</div>
            <div className="text-sm text-gray-400">Total Endpoints</div>
          </div>
          <div className="bg-gray-900/60 border border-green-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats?.activeEndpoints ?? 0}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-900/60 border border-amber-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">{stats?.totalDeliveries ?? 0}</div>
            <div className="text-sm text-gray-400">Total Deliveries</div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-gray-900/80 border border-purple-500/30 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Add Webhook Endpoint</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Webhook URL</label>
                <Input
                  placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Events</label>
                <select
                  value={newEvents}
                  onChange={(e) => setNewEvents(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Events</option>
                  <option value="system.update">System Updates Only</option>
                  <option value="emergency">Emergency Alerts Only</option>
                  <option value="broadcast">Broadcast Events Only</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => addMutation.mutate({ url: newUrl, events: newEvents })}
                disabled={!newUrl || addMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {addMutation.isPending ? "Adding..." : "Add Endpoint"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="text-gray-400">
                Cancel
              </Button>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Supported platforms: Slack Incoming Webhooks, Discord Webhooks, and any custom HTTP endpoint.</p>
              <p>Payloads are auto-formatted for Slack (blocks) and Discord (embeds). Custom endpoints receive raw JSON.</p>
            </div>
          </div>
        )}

        {/* Endpoints List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-purple-300">Registered Endpoints</h2>
          {!endpoints?.length ? (
            <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
              No webhook endpoints configured. Add a Slack or Discord webhook URL to start receiving team notifications.
            </div>
          ) : (
            endpoints.map((ep) => (
              <div key={ep.id} className={`bg-gray-900/60 border rounded-lg p-4 flex items-center justify-between ${ep.isActive ? 'border-purple-500/30' : 'border-gray-700/30 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ep.isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-sm font-mono text-gray-300 truncate">{ep.url}</span>
                    {ep.url.includes("slack.com") && <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">Slack</span>}
                    {ep.url.includes("discord.com") && <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded">Discord</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Events: {ep.events} | Failures: {ep.failureCount} | Last: {ep.lastTriggered ? new Date(ep.lastTriggered).toLocaleString() : 'Never'}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => testMutation.mutate({ id: ep.id })} disabled={testMutation.isPending} className="text-amber-400 border-amber-500/30 hover:bg-amber-900/20">
                    Test
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate({ id: ep.id })} className="text-purple-400 border-purple-500/30 hover:bg-purple-900/20">
                    {ep.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeMutation.mutate({ id: ep.id })} className="text-red-400 border-red-500/30 hover:bg-red-900/20">
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Logs */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-purple-300">Recent Delivery Logs</h2>
          {!logs?.length ? (
            <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 text-center text-gray-500">
              No delivery logs yet. Test a webhook or broadcast an update to see logs here.
            </div>
          ) : (
            <div className="bg-gray-900/40 border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-left p-3">Event</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Retries</th>
                    <th className="text-left p-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 text-gray-300">{log.eventType}</td>
                      <td className="p-3">
                        {log.statusCode ? (
                          <span className={`px-2 py-0.5 rounded text-xs ${log.statusCode < 300 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {log.statusCode}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-300">
                            {log.error ? "Error" : "Unknown"}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-400">{log.retryCount}</td>
                      <td className="p-3 text-gray-500">{new Date(log.createdAt!).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800">
          QUMUS Webhook Manager v3.0 — Canryn Production | Auto-formats for Slack (blocks) and Discord (embeds)
        </div>
      </div>
    </div>
  );
}
