import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';

export default function DecisionApprovalQueue() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});

  // Fetch pending approvals
  const { data: approvalsData, refetch } = trpc.approvals.getPendingApprovals.useQuery({
    limit: 50,
    offset: 0,
  });

  // Fetch approval statistics
  const { data: statsData } = trpc.approvals.getApprovalStats.useQuery();

  // Approve decision mutation
  const approveMutation = trpc.approvals.approveDecision.useMutation({
    onSuccess: () => {
      refetch();
      setApprovalNotes({});
    },
  });

  // Reject decision mutation
  const rejectMutation = trpc.approvals.rejectDecision.useMutation({
    onSuccess: () => {
      refetch();
      setRejectionReason({});
    },
  });

  // Bulk approve mutation
  const bulkApproveMutation = trpc.approvals.bulkApproveDecisions.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedApprovals([]);
      setApprovalNotes({});
    },
  });

  const approvals = approvalsData?.approvals || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval_required':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'escalation_alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Decision Approval Queue</h1>
          <p className="text-gray-500 mt-1">Review and approve pending autonomous decisions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Overview */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statsData.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statsData.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statsData.approvalRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.avgApprovalTime}s</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="queue" className="w-full">
        <TabsList>
          <TabsTrigger value="queue">Approval Queue</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Approval Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          {selectedApprovals.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedApprovals.length} item(s) selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApprovals([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        bulkApproveMutation.mutate({
                          approvalIds: selectedApprovals,
                          reason: 'Bulk approved',
                        })
                      }
                      disabled={bulkApproveMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Bulk Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {approvals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending approvals</p>
                </CardContent>
              </Card>
            ) : (
              approvals.map((approval) => (
                <Card
                  key={approval.id}
                  className={`cursor-pointer transition-all ${
                    expandedId === approval.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedApprovals.includes(approval.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApprovals([...selectedApprovals, approval.id]);
                          } else {
                            setSelectedApprovals(
                              selectedApprovals.filter((id) => id !== approval.id)
                            );
                          }
                        }}
                        className="mt-1"
                      />

                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() =>
                          setExpandedId(expandedId === approval.id ? null : approval.id)
                        }
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(approval.type)}
                          <h3 className="font-semibold">{approval.decisionId}</h3>
                          <Badge className={getPriorityColor(approval.priority)}>
                            {approval.priority}
                          </Badge>
                          <Badge variant="outline">{approval.subsystem}</Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{approval.description}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Confidence: {approval.confidence}%</span>
                          <span>{format(new Date(approval.createdAt), 'PPpp')}</span>
                        </div>

                        {expandedId === approval.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Decision Details</p>
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {approval.reasoning}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="font-medium">Autonomy Level</p>
                                <p className="text-gray-600">{approval.autonomyLevel}%</p>
                              </div>
                              <div>
                                <p className="font-medium">Impact Score</p>
                                <p className="text-gray-600">{approval.impactScore}</p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Approval Notes</label>
                              <Textarea
                                placeholder="Add notes for this approval..."
                                value={approvalNotes[approval.id] || ''}
                                onChange={(e) =>
                                  setApprovalNotes({
                                    ...approvalNotes,
                                    [approval.id]: e.target.value,
                                  })
                                }
                                className="mt-1 text-sm"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  approveMutation.mutate({
                                    approvalId: approval.id,
                                    notes: approvalNotes[approval.id],
                                  })
                                }
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const reason = rejectionReason[approval.id];
                                  if (reason) {
                                    rejectMutation.mutate({
                                      approvalId: approval.id,
                                      reason,
                                      notes: approvalNotes[approval.id],
                                    });
                                  }
                                }}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>

                            {expandedId === approval.id && (
                              <div>
                                <label className="text-sm font-medium">Rejection Reason</label>
                                <Textarea
                                  placeholder="Explain why you're rejecting this decision..."
                                  value={rejectionReason[approval.id] || ''}
                                  onChange={(e) =>
                                    setRejectionReason({
                                      ...rejectionReason,
                                      [approval.id]: e.target.value,
                                    })
                                  }
                                  className="mt-1 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedId === approval.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          {statsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subsystem Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(statsData.subsystemBreakdown).map(([subsystem, count]) => (
                      <div key={subsystem} className="flex justify-between items-center">
                        <span className="text-sm">{subsystem}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(statsData.priorityBreakdown).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{priority}</span>
                        <Badge className={getPriorityColor(priority)}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
