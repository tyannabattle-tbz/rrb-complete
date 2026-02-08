import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  createdAt: number;
}

const TRIGGERS = [
  'broadcast.completed',
  'broadcast.started',
  'rockin-boogie.schedule-next',
  'content.generate',
  'content.generated',
];

const ACTIONS = [
  'schedule-next-broadcast',
  'generate-content',
  'insert-commercials',
  'update-analytics',
  'send-notification',
  'update-dashboard',
];

export default function AutomationRuleEditor() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: TRIGGERS[0],
    action: ACTIONS[0],
  });
  const [loading, setLoading] = useState(false);

  // Load rules on mount
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      // Simulated load - in production, this would call a tRPC procedure
      const defaultRules: AutomationRule[] = [
        {
          id: 'auto-schedule-next',
          name: 'Auto-schedule next broadcast',
          trigger: 'broadcast.completed',
          action: 'schedule-next-broadcast',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'auto-generate-content',
          name: 'Auto-generate content for broadcasts',
          trigger: 'rockin-boogie.schedule-next',
          action: 'generate-content',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'auto-insert-commercials',
          name: 'Auto-insert commercials',
          trigger: 'broadcast.started',
          action: 'insert-commercials',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'auto-update-analytics',
          name: 'Auto-update analytics',
          trigger: 'broadcast.completed',
          action: 'update-analytics',
          enabled: true,
          createdAt: Date.now(),
        },
      ];
      setRules(defaultRules);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    if (!newRule.name.trim()) {
      alert('Please enter a rule name');
      return;
    }

    const rule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      trigger: newRule.trigger,
      action: newRule.action,
      enabled: true,
      createdAt: Date.now(),
    };

    setRules([...rules, rule]);
    setNewRule({ name: '', trigger: TRIGGERS[0], action: ACTIONS[0] });
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const updateRule = (id: string, updates: Partial<AutomationRule>) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, ...updates } : rule
      )
    );
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Automation Rules</h1>
          <p className="text-lg text-muted-foreground">
            Create and manage automation rules to automatically execute actions when events occur
          </p>
        </div>

        {/* Add New Rule */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Rule
            </CardTitle>
            <CardDescription>
              Define a trigger event and the action to execute automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rule Name
                </label>
                <Input
                  placeholder="e.g., Auto-schedule broadcasts"
                  value={newRule.name}
                  onChange={(e) =>
                    setNewRule({ ...newRule, name: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Trigger Event
                </label>
                <select
                  value={newRule.trigger}
                  onChange={(e) =>
                    setNewRule({ ...newRule, trigger: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                >
                  {TRIGGERS.map((trigger) => (
                    <option key={trigger} value={trigger}>
                      {trigger}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Action
                </label>
                <select
                  value={newRule.action}
                  onChange={(e) =>
                    setNewRule({ ...newRule, action: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                >
                  {ACTIONS.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={addRule}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Active Rules</h2>

          {rules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No automation rules created yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card
                  key={rule.id}
                  className={`transition-all ${
                    rule.enabled
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-muted bg-muted/5'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === rule.id ? (
                          <div className="space-y-4">
                            <Input
                              value={rule.name}
                              onChange={(e) =>
                                updateRule(rule.id, { name: e.target.value })
                              }
                              className="bg-background border-border"
                              placeholder="Rule name"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Trigger
                                </label>
                                <select
                                  value={rule.trigger}
                                  onChange={(e) =>
                                    updateRule(rule.id, { trigger: e.target.value })
                                  }
                                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                                >
                                  {TRIGGERS.map((trigger) => (
                                    <option key={trigger} value={trigger}>
                                      {trigger}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Action
                                </label>
                                <select
                                  value={rule.action}
                                  onChange={(e) =>
                                    updateRule(rule.id, { action: e.target.value })
                                  }
                                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                                >
                                  {ACTIONS.map((action) => (
                                    <option key={action} value={action}>
                                      {action}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {rule.name}
                            </h3>
                            <div className="flex gap-4 flex-wrap">
                              <div>
                                <p className="text-sm text-muted-foreground">Trigger</p>
                                <Badge variant="outline" className="mt-1">
                                  {rule.trigger}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Action</p>
                                <Badge variant="outline" className="mt-1">
                                  {rule.action}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge
                                  className="mt-1"
                                  variant={rule.enabled ? 'default' : 'secondary'}
                                >
                                  {rule.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {editingId === rule.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(rule.id)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRule(rule.id)}
                              className={rule.enabled ? 'text-yellow-600' : 'text-gray-600'}
                            >
                              {rule.enabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRule(rule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              How Automation Rules Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-900 dark:text-blue-100">
            <p>
              Automation rules automatically execute actions when specific trigger events occur in your broadcast system.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Triggers:</strong> Events that occur in your system (e.g., broadcast completion)
              </li>
              <li>
                <strong>Actions:</strong> Tasks that execute automatically when a trigger fires
              </li>
              <li>
                <strong>Enabled/Disabled:</strong> Control whether a rule is active
              </li>
              <li>
                <strong>Real-time Execution:</strong> Rules execute immediately when triggers occur
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
