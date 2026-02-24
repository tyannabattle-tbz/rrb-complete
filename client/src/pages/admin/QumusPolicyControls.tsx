/**
 * QUMUS Policy Controls
 * Admin interface for managing autonomous policies and autonomy levels
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Save, RefreshCw, Lock, Unlock } from 'lucide-react';
import { useQumusPolicies } from '@/hooks/useQumus';
import { qumusClient } from '@/lib/qumusClient';

interface PolicyControl {
  policyId: string;
  autonomyLevel: number;
  enabled: boolean;
  locked: boolean;
}

export function QumusPolicyControls() {
  const { policies, loading, refresh } = useQumusPolicies();
  const [controls, setControls] = useState<Map<string, PolicyControl>>(new Map());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize controls from policies
  useEffect(() => {
    if (policies.length > 0) {
      const newControls = new Map<string, PolicyControl>();
      policies.forEach((policy) => {
        newControls.set(policy.id, {
          policyId: policy.id,
          autonomyLevel: policy.autonomyLevel,
          enabled: policy.enabled,
          locked: false,
        });
      });
      setControls(newControls);
    }
  }, [policies]);

  // Handle autonomy level change
  const handleAutonomyChange = (policyId: string, level: number) => {
    const control = controls.get(policyId);
    if (control && !control.locked) {
      setControls(
        new Map(controls).set(policyId, {
          ...control,
          autonomyLevel: level,
        })
      );
    }
  };

  // Handle enable/disable toggle
  const handleToggle = (policyId: string) => {
    const control = controls.get(policyId);
    if (control && !control.locked) {
      setControls(
        new Map(controls).set(policyId, {
          ...control,
          enabled: !control.enabled,
        })
      );
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = Array.from(controls.values());
      for (const control of updates) {
        await qumusClient.updatePolicyAutonomy(control.policyId, control.autonomyLevel);
      }
      setMessage({ type: 'success', text: 'All policies updated successfully' });
      refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update policies',
      });
    } finally {
      setSaving(false);
    }
  };

  // Lock/unlock policy
  const toggleLock = (policyId: string) => {
    const control = controls.get(policyId);
    if (control) {
      setControls(
        new Map(controls).set(policyId, {
          ...control,
          locked: !control.locked,
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Policy Controls</h2>
          <p className="text-slate-400 mt-1">Manage autonomy levels and enable/disable policies</p>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-900 text-green-200'
              : 'bg-red-900 text-red-200'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          {message.text}
        </div>
      )}

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from(controls.entries()).map(([policyId, control]) => {
          const policy = policies.find((p) => p.id === policyId);
          if (!policy) return null;

          return (
            <Card
              key={policyId}
              className={`bg-slate-800 border-slate-700 ${
                control.locked ? 'opacity-75' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {policy.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLock(policyId)}
                    className="gap-1"
                  >
                    {control.locked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Unlocked
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Autonomy Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Autonomy Level
                    </label>
                    <span className="text-lg font-bold text-blue-400">
                      {control.autonomyLevel}%
                    </span>
                  </div>
                  <Slider
                    value={[control.autonomyLevel]}
                    onValueChange={(value) =>
                      handleAutonomyChange(policyId, value[0])
                    }
                    min={0}
                    max={100}
                    step={5}
                    disabled={control.locked}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {control.autonomyLevel < 50
                      ? 'Mostly manual control'
                      : control.autonomyLevel < 80
                        ? 'Balanced autonomy'
                        : 'Highly autonomous'}
                  </p>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <span className="text-sm font-medium text-slate-300">
                    {control.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Switch
                    checked={control.enabled}
                    onCheckedChange={() => handleToggle(policyId)}
                    disabled={control.locked}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-700 rounded">
                    <p className="text-slate-500">Executions</p>
                    <p className="font-bold text-slate-200">{policy.executionCount}</p>
                  </div>
                  <div className="p-2 bg-slate-700 rounded">
                    <p className="text-slate-500">Last Run</p>
                    <p className="font-bold text-slate-200">
                      {policy.lastExecuted
                        ? new Date(policy.lastExecuted).toLocaleTimeString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Warning */}
      <div className="p-4 bg-yellow-900 text-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Caution</p>
          <p className="text-sm mt-1">
            Reducing autonomy levels increases manual intervention requirements. Ensure adequate
            human oversight is available before lowering autonomy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default QumusPolicyControls;
