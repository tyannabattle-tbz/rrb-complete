import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Play, Pause, Settings } from 'lucide-react';

interface RemediationWorkflow {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused' | 'completed';
  lastRun?: number;
  nextRun?: number;
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

interface RemediationExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'waiting_approval';
  startTime: number;
  endTime?: number;
  actions: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: string;
  }[];
}

export default function AutomatedRemediationWorkflows() {
  const [workflows, setWorkflows] = useState<RemediationWorkflow[]>([
    {
      id: '1',
      name: 'High Latency Recovery',
      trigger: 'Service latency > 500ms',
      actions: ['Retry request', 'Scale service', 'Route to backup', 'Alert admin'],
      status: 'active',
      lastRun: Date.now() - 3600000,
      requiresApproval: false,
    },
    {
      id: '2',
      name: 'Database Connection Pool Exhaustion',
      trigger: 'Connection pool usage > 90%',
      actions: ['Increase pool size', 'Terminate idle connections', 'Alert DBA'],
      status: 'active',
      requiresApproval: true,
      approvalStatus: 'pending',
    },
    {
      id: '3',
      name: 'Payment Service Failure',
      trigger: 'Payment service error rate > 5%',
      actions: ['Switch to backup provider', 'Queue transactions', 'Alert finance team'],
      status: 'active',
      requiresApproval: true,
    },
  ]);

  const [executions, setExecutions] = useState<RemediationExecution[]>([
    {
      id: 'exec1',
      workflowId: '1',
      status: 'completed',
      startTime: Date.now() - 1800000,
      endTime: Date.now() - 1700000,
      actions: [
        { name: 'Retry request', status: 'completed', result: 'Success' },
        { name: 'Scale service', status: 'completed', result: 'Scaled to 5 instances' },
        { name: 'Route to backup', status: 'completed' },
        { name: 'Alert admin', status: 'completed' },
      ],
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedForApproval, setSelectedForApproval] = useState<string | null>(null);

  const toggleWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w, idx) =>
        w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w
      )
    );
  };

  const approveWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w, idx) =>
        w.id === id ? { ...w, approvalStatus: 'approved' } : w
      )
    );
    setShowApprovalModal(false);
  };

  const rejectWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w, idx) =>
        w.id === id ? { ...w, approvalStatus: 'rejected' } : w
      )
    );
    setShowApprovalModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'waiting_approval':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Automated Remediation</h1>
          <p className="text-slate-600 dark:text-slate-400">Configure automated workflows for common issues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflows List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Active Workflows</h2>
            {workflows.map((workflow, idx) => (
              <Card
                key={workflow.id}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{workflow.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Trigger: {workflow.trigger}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.actions.map((action, idx) => (
                      <span
                        key={`item-${idx}`}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-300"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Approval Status */}
                {workflow.requiresApproval && (
                  <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ Requires approval: {workflow.approvalStatus || 'pending'}
                    </p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWorkflow(workflow.id);
                    }}
                    className="gap-1"
                  >
                    {workflow.status === 'active' ? (
                      <>
                        <Pause className="w-3 h-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        Resume
                      </>
                    )}
                  </Button>
                  {workflow.requiresApproval && workflow.approvalStatus === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedForApproval(workflow.id);
                        setShowApprovalModal(true);
                      }}
                      className="gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Review
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Executions */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Executions</h2>
            <div className="space-y-3">
              {executions.map((execution, idx) => {
                const workflow = workflows.find((w) => w.id === execution.workflowId);
                return (
                  <Card
                    key={execution.id}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{workflow?.name}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {execution.actions.map((action, idx) => (
                        <div key={`item-${idx}`} className="flex items-center gap-2 text-xs">
                          {action.status === 'completed' && (
                            <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                          )}
                          {action.status === 'running' && (
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />
                          )}
                          {action.status === 'failed' && (
                            <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          )}
                          <span className="text-slate-700 dark:text-slate-300">{action.name}</span>
                          {action.result && (
                            <span className="text-slate-500 dark:text-slate-400">- {action.result}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {new Date(execution.startTime).toLocaleString()}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedForApproval && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Review Workflow</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {workflows.find((w) => w.id === selectedForApproval)?.name}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => rejectWorkflow(selectedForApproval)}
                  className="flex-1 text-red-600"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => approveWorkflow(selectedForApproval)}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
