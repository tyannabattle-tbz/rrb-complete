import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Policy {
  id: string;
  name: string;
  subsystem: string;
  autonomyThreshold: number;
  description: string;
  rules: Rule[];
  enabled: boolean;
}

interface Rule {
  id: string;
  condition: string;
  action: string;
  priority: number;
}

export default function DecisionPolicyEditor() {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      name: 'Emergency Broadcast Policy',
      subsystem: 'HybridCast',
      autonomyThreshold: 95,
      description: 'Auto-execute emergency broadcasts with 95% autonomy',
      enabled: true,
      rules: [
        { id: '1', condition: 'message contains "emergency"', action: 'broadcast', priority: 1 },
        { id: '2', condition: 'autonomy >= 90', action: 'auto-execute', priority: 2 },
      ],
    },
    {
      id: '2',
      name: 'Music Content Policy',
      subsystem: 'Rockin Rockin Boogie',
      autonomyThreshold: 85,
      description: 'Manage music content with 85% autonomy',
      enabled: true,
      rules: [
        { id: '1', condition: 'action is "publish"', action: 'publish-track', priority: 1 },
      ],
    },
  ]);

  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicySubsystem, setNewPolicySubsystem] = useState('');
  const [newPolicyThreshold, setNewPolicyThreshold] = useState(80);

  const handleAddPolicy = () => {
    if (!newPolicyName || !newPolicySubsystem) {
      toast.error('Fill in all fields');
      return;
    }

    const newPolicy: Policy = {
      id: `policy-${Date.now()}`,
      name: newPolicyName,
      subsystem: newPolicySubsystem,
      autonomyThreshold: newPolicyThreshold,
      description: `Policy for ${newPolicySubsystem}`,
      enabled: true,
      rules: [],
    };

    setPolicies([...policies, newPolicy]);
    setNewPolicyName('');
    setNewPolicySubsystem('');
    setNewPolicyThreshold(80);
    toast.success('Policy created');
  };

  const handleDeletePolicy = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
    toast.success('Policy deleted');
  };

  const handleTogglePolicy = (id: string) => {
    setPolicies(
      policies.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    toast.success('Policy updated');
  };

  const handleUpdateThreshold = (id: string, threshold: number) => {
    setPolicies(
      policies.map(p => (p.id === id ? { ...p, autonomyThreshold: threshold } : p))
    );
    toast.success('Threshold updated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Decision Policy Editor</h1>
          </div>
          <p className="text-slate-400">Create and manage autonomous decision policies</p>
        </div>

        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="policies">Active Policies</TabsTrigger>
            <TabsTrigger value="create">Create Policy</TabsTrigger>
            <TabsTrigger value="rules">Rule Templates</TabsTrigger>
          </TabsList>

          {/* Active Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <div className="space-y-4">
              {policies.map(policy => (
                <Card key={policy.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-white">{policy.name}</CardTitle>
                        <Badge
                          className={
                            policy.enabled
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }
                        >
                          {policy.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleTogglePolicy(policy.id)}
                          className={
                            policy.enabled
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }
                        >
                          {policy.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="border-red-600/50 text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300">{policy.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-700/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Subsystem</p>
                        <p className="font-semibold text-white">{policy.subsystem}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Autonomy Threshold</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={policy.autonomyThreshold}
                            onChange={e =>
                              handleUpdateThreshold(policy.id, parseInt(e.target.value))
                            }
                            className="flex-1"
                          />
                          <span className="font-semibold text-white min-w-12">
                            {policy.autonomyThreshold}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {policy.rules.length > 0 && (
                      <div className="bg-slate-700/30 rounded p-3">
                        <p className="text-xs text-slate-400 mb-2">Rules ({policy.rules.length})</p>
                        <div className="space-y-2">
                          {policy.rules.map(rule => (
                            <div
                              key={rule.id}
                              className="text-sm text-slate-300 flex items-center justify-between"
                            >
                              <span>
                                {rule.condition} → {rule.action}
                              </span>
                              <Badge className="bg-blue-500/20 text-blue-300">
                                P{rule.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Policy Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Policy Name"
                    value={newPolicyName}
                    onChange={e => setNewPolicyName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <select
                    value={newPolicySubsystem}
                    onChange={e => setNewPolicySubsystem(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                  >
                    <option value="">Select Subsystem</option>
                    <option value="HybridCast">HybridCast</option>
                    <option value="Rockin Rockin Boogie">Rockin Rockin Boogie</option>
                    <option value="Sweet Miracles">Sweet Miracles</option>
                    <option value="Canryn">Canryn</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">
                    Autonomy Threshold: {newPolicyThreshold}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newPolicyThreshold}
                    onChange={e => setNewPolicyThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button onClick={handleAddPolicy} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Policy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rule Templates Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Auto-Execute Low Impact', condition: 'impact = "low"', action: 'execute' },
                { name: 'Require Approval High Impact', condition: 'impact = "high"', action: 'request-approval' },
                { name: 'Emergency Broadcast', condition: 'type = "broadcast" AND urgent = true', action: 'broadcast' },
                { name: 'Large Donation', condition: 'amount > 1000', action: 'request-approval' },
              ].map((template, idx) => (
                <Card key={idx} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                    <p className="text-xs text-slate-400 mb-2">Condition: {template.condition}</p>
                    <p className="text-xs text-slate-400 mb-3">Action: {template.action}</p>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
