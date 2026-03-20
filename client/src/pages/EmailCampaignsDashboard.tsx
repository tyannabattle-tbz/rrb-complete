import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailCampaignsDashboard() {
  const [campaigns] = useState([
    {
      id: 'camp_001',
      name: 'Grant Discovery - March 2026',
      type: 'grant_discovery',
      subject: '🎯 New Grant Opportunity: NIH Grant (92% match)',
      recipients: 156,
      status: 'sent',
      sentAt: new Date(Date.now() - 2 * 60 * 60000),
      metrics: { sent: 156, opened: 89, clicked: 34, bounced: 2 },
    },
    {
      id: 'camp_002',
      name: 'Campaign Milestone - Emergency Fund',
      type: 'campaign_milestone',
      subject: '🎉 Campaign Update: Emergency Fund reached 97%!',
      recipients: 234,
      status: 'sent',
      sentAt: new Date(Date.now() - 24 * 60 * 60000),
      metrics: { sent: 234, opened: 156, clicked: 67, bounced: 3 },
    },
    {
      id: 'camp_003',
      name: 'Donor Update - Monthly Impact',
      type: 'donor_update',
      subject: '💝 Thank You! Your Impact This Month',
      recipients: 412,
      status: 'scheduled',
      sentAt: null,
      metrics: { sent: 0, opened: 0, clicked: 0, bounced: 0 },
    },
    {
      id: 'camp_004',
      name: 'Impact Report - March 2026',
      type: 'impact_report',
      subject: '📊 Monthly Impact Report - March',
      recipients: 1200,
      status: 'draft',
      sentAt: null,
      metrics: { sent: 0, opened: 0, clicked: 0, bounced: 0 },
    },
  ]);

  const [emailSequences] = useState([
    {
      id: 'seq_001',
      userId: 'user_alice',
      sequenceType: 'onboarding',
      currentStep: 3,
      totalSteps: 5,
      status: 'active',
      emails: [
        'Welcome to FlowPay',
        'Getting Started Guide',
        'First Donation Tips',
        'Community Features',
        'Advanced Tools',
      ],
    },
    {
      id: 'seq_002',
      userId: 'user_bob',
      sequenceType: 'engagement',
      currentStep: 2,
      totalSteps: 4,
      status: 'active',
      emails: ['Weekly Digest', 'Grant Opportunities', 'Community Highlights', 'Exclusive Offers'],
    },
    {
      id: 'seq_003',
      userId: 'user_carol',
      sequenceType: 'retention',
      currentStep: 4,
      totalSteps: 4,
      status: 'completed',
      emails: ['We Miss You', 'Special Offer', 'Success Stories', 'Welcome Back'],
    },
  ]);

  const [templates] = useState([
    {
      id: 'tpl_grant',
      name: 'Grant Discovery',
      type: 'grant_discovery',
      subject: '🎯 New Grant Opportunity: {{grantTitle}} ({{matchPercentage}}% match)',
      preview: 'We found a grant that matches your profile...',
    },
    {
      id: 'tpl_campaign',
      name: 'Campaign Milestone',
      type: 'campaign_milestone',
      subject: '🎉 Campaign Update: {{campaignName}} reached {{milestone}}!',
      preview: 'Your campaign has reached an important milestone...',
    },
    {
      id: 'tpl_donor',
      name: 'Donor Update',
      type: 'donor_update',
      subject: '💝 Thank You {{donorName}}! Your Impact This Month',
      preview: 'Here is what your contributions helped achieve...',
    },
    {
      id: 'tpl_impact',
      name: 'Impact Report',
      type: 'impact_report',
      subject: '📊 Monthly Impact Report - {{month}}',
      preview: 'Here is our monthly summary of impact and achievements...',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500/20 text-green-300';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300';
      case 'draft':
        return 'bg-gray-500/20 text-gray-300';
      case 'failed':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Email Campaigns Dashboard</h1>
        <p className="text-gray-400 mt-1">Automated campaigns for grants, donations, and impact reports</p>
      </div>

      {/* Campaign Templates */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Email Templates</CardTitle>
          <CardDescription>Pre-built templates for automated campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white">{template.name}</h4>
                  <Badge className="bg-purple-500/20 text-purple-300">{template.type}</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2">{template.subject}</p>
                <p className="text-xs text-gray-500">{template.preview}</p>
                <Button size="sm" className="mt-3 w-full bg-purple-600 hover:bg-purple-700">
                  <Mail className="w-4 h-4 mr-1" />
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Campaigns</CardTitle>
          <CardDescription>Email campaigns sent and scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">{campaign.name}</h4>
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{campaign.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{campaign.subject}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-white border-slate-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400">Recipients</p>
                    <p className="font-bold text-white">{campaign.recipients}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Sent</p>
                    <p className="font-bold text-white">{campaign.metrics.sent}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Opened</p>
                    <p className="font-bold text-cyan-400">{campaign.metrics.opened}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Clicked</p>
                    <p className="font-bold text-green-400">{campaign.metrics.clicked}</p>
                  </div>
                </div>

                {campaign.sentAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    {campaign.status === 'sent' ? 'Sent' : 'Scheduled'}: {campaign.sentAt.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Sequences */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Active Email Sequences</CardTitle>
          <CardDescription>Multi-step automated email journeys for donors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emailSequences.map((sequence) => (
              <div key={sequence.id} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white">{sequence.sequenceType.toUpperCase()} Sequence</h4>
                    <p className="text-xs text-gray-400 mt-1">User: {sequence.userId}</p>
                  </div>
                  <Badge
                    className={
                      sequence.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }
                  >
                    {sequence.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-bold text-white">
                      {sequence.currentStep}/{sequence.totalSteps}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${(sequence.currentStep / sequence.totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {sequence.emails.map((email, idx) => (
                    <Badge
                      key={idx}
                      className={
                        idx < sequence.currentStep
                          ? 'bg-green-500/20 text-green-300'
                          : idx === sequence.currentStep
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-gray-500/20 text-gray-300'
                      }
                    >
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Statistics */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Campaign Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">Total Campaigns</p>
              <p className="text-3xl font-bold text-purple-400">
                {campaigns.filter((c) => c.status === 'sent').length}
              </p>
              <p className="text-xs text-gray-400 mt-1">sent</p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">Total Recipients</p>
              <p className="text-3xl font-bold text-blue-400">
                {campaigns.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">emails sent</p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">Avg Open Rate</p>
              <p className="text-3xl font-bold text-cyan-400">
                {Math.round(
                  campaigns.reduce((sum, c) => sum + c.metrics.opened, 0) /
                    Math.max(campaigns.reduce((sum, c) => sum + c.metrics.sent, 0), 1) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-gray-400 mt-1">engagement</p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">Avg Click Rate</p>
              <p className="text-3xl font-bold text-green-400">
                {Math.round(
                  campaigns.reduce((sum, c) => sum + c.metrics.clicked, 0) /
                    Math.max(campaigns.reduce((sum, c) => sum + c.metrics.sent, 0), 1) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-gray-400 mt-1">conversion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
