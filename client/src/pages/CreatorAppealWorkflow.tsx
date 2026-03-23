/**
 * Creator Appeal Workflow
 * Manage content moderation appeals with evidence review
 * Support decision reversal and creator communication
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, FileText, MessageSquare, Clock, User } from 'lucide-react';

interface ContentViolation {
  id: string;
  contentId: string;
  creatorId: string;
  creatorName: string;
  contentTitle: string;
  violationType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  flaggedAt: number;
  reason: string;
  evidence: string[];
}

interface Appeal {
  id: string;
  violationId: string;
  creatorId: string;
  creatorName: string;
  contentTitle: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  submittedAt: number;
  appealReason: string;
  supportingEvidence: string[];
  reviewedBy?: string;
  reviewedAt?: number;
  decision?: string;
  decisionReason?: string;
  messages: AppealMessage[];
}

interface AppealMessage {
  id: string;
  sender: 'creator' | 'admin';
  senderName: string;
  message: string;
  timestamp: number;
  attachments?: string[];
}

const CreatorAppealWorkflow: React.FC = () => {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [violations, setViolations] = useState<ContentViolation[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    loadAppeals();
  }, []);

  const loadAppeals = async () => {
    try {
      setLoading(true);

      // Simulate loading appeals
      const mockViolations: ContentViolation[] = [
        {
          id: 'viol_001',
          contentId: 'content_001',
          creatorId: 'creator_001',
          creatorName: 'Alex Creator',
          contentTitle: 'Healing Meditation Session',
          violationType: 'Potentially Harmful Content',
          severity: 'medium',
          flaggedAt: Date.now() - 259200000,
          reason: 'Content flagged for potentially misleading health claims',
          evidence: ['/evidence/flagged-content-001.mp4', '/evidence/transcript-001.txt'],
        },
        {
          id: 'viol_002',
          contentId: 'content_002',
          creatorId: 'creator_002',
          creatorName: 'Jordan Podcaster',
          contentTitle: 'Weekly News Roundup',
          violationType: 'Misinformation',
          severity: 'high',
          flaggedAt: Date.now() - 172800000,
          reason: 'Contains unverified claims about current events',
          evidence: ['/evidence/fact-check-002.pdf'],
        },
      ];

      const mockAppeals: Appeal[] = [
        {
          id: 'appeal_001',
          violationId: 'viol_001',
          creatorId: 'creator_001',
          creatorName: 'Alex Creator',
          contentTitle: 'Healing Meditation Session',
          status: 'pending',
          submittedAt: Date.now() - 86400000,
          appealReason: 'The content is educational and includes proper disclaimers. I have medical credentials.',
          supportingEvidence: ['/evidence/medical-license.pdf', '/evidence/content-disclaimers.txt'],
          messages: [
            {
              id: 'msg_001',
              sender: 'creator',
              senderName: 'Alex Creator',
              message: 'I believe this content was incorrectly flagged. I have included all necessary disclaimers.',
              timestamp: Date.now() - 86400000,
            },
          ],
        },
        {
          id: 'appeal_002',
          violationId: 'viol_002',
          creatorId: 'creator_002',
          creatorName: 'Jordan Podcaster',
          contentTitle: 'Weekly News Roundup',
          status: 'under_review',
          submittedAt: Date.now() - 172800000,
          appealReason: 'All claims are sourced from reputable news outlets. I can provide citations.',
          supportingEvidence: ['/evidence/sources-002.pdf', '/evidence/citations-002.txt'],
          reviewedBy: 'admin_user',
          messages: [
            {
              id: 'msg_002',
              sender: 'creator',
              senderName: 'Jordan Podcaster',
              message: 'These are all verified facts from major news sources.',
              timestamp: Date.now() - 172800000,
            },
            {
              id: 'msg_003',
              sender: 'admin',
              senderName: 'Content Review Team',
              message: 'Thank you for your appeal. We are reviewing the sources you provided.',
              timestamp: Date.now() - 86400000,
            },
          ],
        },
        {
          id: 'appeal_003',
          violationId: 'viol_001',
          creatorId: 'creator_001',
          creatorName: 'Alex Creator',
          contentTitle: 'Healing Meditation Session',
          status: 'approved',
          submittedAt: Date.now() - 432000000,
          appealReason: 'The content is educational and includes proper disclaimers.',
          supportingEvidence: [],
          reviewedBy: 'admin_user',
          reviewedAt: Date.now() - 345600000,
          decision: 'APPROVED',
          decisionReason: 'Content includes proper medical disclaimers and creator has verified credentials.',
          messages: [
            {
              id: 'msg_004',
              sender: 'admin',
              senderName: 'Content Review Team',
              message: 'Your appeal has been approved. The content violation has been reversed.',
              timestamp: Date.now() - 345600000,
            },
          ],
        },
      ];

      setViolations(mockViolations);
      setAppeals(mockAppeals);
    } catch (error) {
      console.error('Failed to load appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAppeal = async (appealId: string) => {
    try {
      setAppeals(
        appeals.map(a =>
          a.id === appealId
            ? {
                ...a,
                status: 'approved',
                reviewedBy: 'admin_user',
                reviewedAt: Date.now(),
                decision: 'APPROVED',
                decisionReason: 'Appeal approved after evidence review',
                messages: [
                  ...a.messages,
                  {
                    id: `msg_${Date.now()}`,
                    sender: 'admin',
                    senderName: 'Content Review Team',
                    message: 'Your appeal has been approved. The content violation has been reversed.',
                    timestamp: Date.now(),
                  },
                ],
              }
            : a
        )
      );

      console.log('[Appeal Workflow] Appeal approved:', appealId);
    } catch (error) {
      console.error('Failed to approve appeal:', error);
    }
  };

  const handleRejectAppeal = async (appealId: string, reason: string) => {
    try {
      setAppeals(
        appeals.map(a =>
          a.id === appealId
            ? {
                ...a,
                status: 'rejected',
                reviewedBy: 'admin_user',
                reviewedAt: Date.now(),
                decision: 'REJECTED',
                decisionReason: reason,
                messages: [
                  ...a.messages,
                  {
                    id: `msg_${Date.now()}`,
                    sender: 'admin',
                    senderName: 'Content Review Team',
                    message: `Your appeal has been rejected. Reason: ${reason}`,
                    timestamp: Date.now(),
                  },
                ],
              }
            : a
        )
      );

      console.log('[Appeal Workflow] Appeal rejected:', appealId);
    } catch (error) {
      console.error('Failed to reject appeal:', error);
    }
  };

  const handleSendMessage = async (appealId: string) => {
    if (!replyMessage.trim()) return;

    try {
      setAppeals(
        appeals.map(a =>
          a.id === appealId
            ? {
                ...a,
                messages: [
                  ...a.messages,
                  {
                    id: `msg_${Date.now()}`,
                    sender: 'admin',
                    senderName: 'Content Review Team',
                    message: replyMessage,
                    timestamp: Date.now(),
                  },
                ],
              }
            : a
        )
      );

      setReplyMessage('');
      console.log('[Appeal Workflow] Message sent for appeal:', appealId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppeals = filter === 'all' ? appeals : appeals.filter(a => a.status === filter);
  const pendingCount = appeals.filter(a => a.status === 'pending').length;
  const approvedCount = appeals.filter(a => a.status === 'approved').length;
  const rejectedCount = appeals.filter(a => a.status === 'rejected').length;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Creator Appeal Workflow</h1>
          <p className="text-slate-400">Manage content moderation appeals with evidence review and decision reversal</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Total Appeals</p>
                <p className="text-3xl font-bold text-white">{appeals.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Approved</p>
                <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Rejected</p>
                <p className="text-3xl font-bold text-red-400">{rejectedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={
                f === 'pending'
                  ? 'border-yellow-500 text-yellow-500'
                  : f === 'approved'
                    ? 'border-green-500 text-green-500'
                    : f === 'rejected'
                      ? 'border-red-500 text-red-500'
                      : ''
              }
            >
              {f === 'all'
                ? 'All'
                : f === 'under_review'
                  ? 'Under Review'
                  : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appeals List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">Loading appeals...</p>
                </CardContent>
              </Card>
            ) : filteredAppeals.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">No appeals found</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppeals.map(appeal => (
                <Card
                  key={appeal.id}
                  className={`bg-slate-800 border-slate-700 cursor-pointer transition-all ${
                    selectedAppeal?.id === appeal.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedAppeal(appeal)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getStatusIcon(appeal.status)}</div>
                        <div>
                          <h3 className="font-semibold text-white">{appeal.creatorName}</h3>
                          <p className="text-sm text-slate-400 mt-1">{appeal.contentTitle}</p>
                        </div>
                      </div>
                      <Badge className={appeal.status === 'approved' ? 'bg-green-600' : appeal.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'}>
                        {appeal.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="bg-slate-700 rounded p-3 mb-4">
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold">Appeal:</span> {appeal.appealReason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Submitted {new Date(appeal.submittedAt).toLocaleDateString()}</span>
                      <span className="text-slate-400">{appeal.messages.length} messages</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Appeal Details */}
          {selectedAppeal && (
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Appeal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-slate-500 text-sm">Creator</p>
                    <p className="text-white font-semibold">{selectedAppeal.creatorName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Content</p>
                    <p className="text-white font-semibold">{selectedAppeal.contentTitle}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Status</p>
                    <Badge className={selectedAppeal.status === 'approved' ? 'bg-green-600' : selectedAppeal.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'}>
                      {selectedAppeal.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Submitted</p>
                    <p className="text-white font-semibold">{new Date(selectedAppeal.submittedAt).toLocaleString()}</p>
                  </div>

                  {selectedAppeal.status === 'pending' || selectedAppeal.status === 'under_review' ? (
                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <Button
                        onClick={() => handleApproveAppeal(selectedAppeal.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectAppeal(selectedAppeal.id, 'Evidence does not support appeal')}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {selectedAppeal.messages.map(msg => (
                      <div key={msg.id} className={`p-3 rounded ${msg.sender === 'admin' ? 'bg-blue-900' : 'bg-slate-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {msg.sender === 'admin' ? (
                            <AlertCircle className="w-4 h-4 text-blue-400" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-sm font-semibold text-white">{msg.senderName}</span>
                        </div>
                        <p className="text-sm text-slate-200">{msg.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {selectedAppeal.status === 'pending' || selectedAppeal.status === 'under_review' ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                        placeholder="Send a message to the creator..."
                        rows={3}
                      />
                      <Button
                        onClick={() => handleSendMessage(selectedAppeal.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorAppealWorkflow;
