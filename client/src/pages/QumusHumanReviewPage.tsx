import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function QumusHumanReviewPage() {
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  const { data: pendingDecisions } = trpc.qumus.getPendingDecisions.useQuery();
  const { data: decisionDetails } = trpc.qumus.getDecisionDetails.useQuery(
    { decisionId: selectedDecision || '' },
    { enabled: !!selectedDecision }
  );

  const approveMutation = trpc.qumus.approveDecision.useMutation();
  const rejectMutation = trpc.qumus.rejectDecision.useMutation();

  const handleApprove = async (decisionId: string, feedback?: string) => {
    await approveMutation.mutateAsync({ decisionId, feedback });
    setSelectedDecision(null);
  };

  const handleReject = async (decisionId: string, reason: string) => {
    await rejectMutation.mutateAsync({ decisionId, reason });
    setSelectedDecision(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">QUMUS Human Review</h1>
          <p className="text-slate-300">
            Review and approve autonomous decisions made by the QUMUS system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Decisions List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <h2 className="text-xl font-bold text-white mb-4">Pending Decisions</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingDecisions?.map((decision) => (
                  <button
                    key={decision.id}
                    onClick={() => setSelectedDecision(decision.id)}
                    className={`w-full text-left p-3 rounded transition-all ${
                      selectedDecision === decision.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-sm">{decision.type}</div>
                    <div className="text-xs opacity-75 mt-1">{decision.timestamp}</div>
                    <Badge className="mt-2 text-xs" variant="outline">
                      {decision.confidence}% confidence
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Decision Details */}
          <div className="lg:col-span-2">
            {selectedDecision && decisionDetails ? (
              <Card className="bg-slate-800 border-slate-700 p-6 space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{decisionDetails.type}</h2>
                    <Badge className={`text-sm ${
                      decisionDetails.confidence > 80
                        ? 'bg-green-600'
                        : decisionDetails.confidence > 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}>
                      {decisionDetails.confidence}% Confidence
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">{decisionDetails.timestamp}</p>
                </div>

                {/* Decision Context */}
                <div className="bg-slate-700/50 p-4 rounded">
                  <h3 className="font-bold text-white mb-3">Decision Context</h3>
                  <p className="text-slate-300 leading-relaxed">{decisionDetails.context}</p>
                </div>

                {/* Reasoning */}
                <div className="bg-slate-700/50 p-4 rounded">
                  <h3 className="font-bold text-white mb-3">QUMUS Reasoning</h3>
                  <p className="text-slate-300 leading-relaxed">{decisionDetails.reasoning}</p>
                </div>

                {/* Policy Applied */}
                {decisionDetails.policyApplied && (
                  <div className="bg-blue-900/30 border border-blue-700/50 p-4 rounded">
                    <h3 className="font-bold text-blue-300 mb-2">Policy Applied</h3>
                    <p className="text-slate-300 text-sm">{decisionDetails.policyApplied}</p>
                  </div>
                )}

                {/* Recommended Action */}
                <div className="bg-slate-700/50 p-4 rounded">
                  <h3 className="font-bold text-white mb-3">Recommended Action</h3>
                  <p className="text-slate-300 mb-4">{decisionDetails.recommendedAction}</p>
                  <Badge className="bg-amber-600">Awaiting Human Approval</Badge>
                </div>

                {/* Audit Trail */}
                {decisionDetails.auditTrail && (
                  <div className="bg-slate-700/50 p-4 rounded">
                    <h3 className="font-bold text-white mb-3">Audit Trail</h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      {decisionDetails.auditTrail.map((entry, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-slate-500">{entry.timestamp}</span>
                          <span>{entry.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(selectedDecision)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Decision
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleReject(selectedDecision, 'Rejected by human reviewer')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Decision
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedDecision(null)}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Flag for Review
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Select a decision to review</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
