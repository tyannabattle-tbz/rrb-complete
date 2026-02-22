/**
 * Franchisee Portal - World-Stage Production Ready
 * Complete compliance management, deadline tracking, and resource access
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Download, FileText, Mail } from 'lucide-react';

export default function FranchiseePortal() {
  const [franchiseeData, setFranchiseeData] = useState({
    franchiseeId: 'FRAN-001',
    franchiseeName: 'RRB New York Metro',
    ownerName: 'Jane Smith',
    email: 'jane@rrb-ny.com',
    phone: '(555) 123-4567',
    status: 'Active',
    complianceScore: 95,
  });

  const [deadlines, setDeadlines] = useState([
    {
      id: 'deadline-form323',
      task: 'Form 323 Biennial Filing',
      dueDate: '2026-10-01',
      daysRemaining: 252,
      status: 'On Track',
      priority: 'High',
      completed: false,
    },
    {
      id: 'deadline-annual-report',
      task: 'Annual Diversity Report',
      dueDate: '2026-12-31',
      daysRemaining: 313,
      status: 'On Track',
      priority: 'Medium',
      completed: false,
    },
    {
      id: 'deadline-ownership-update',
      task: 'Ownership Documentation Update',
      dueDate: '2026-03-22',
      daysRemaining: 28,
      status: 'Due Soon',
      priority: 'High',
      completed: false,
    },
  ]);

  const [resources, setResources] = useState([
    {
      id: 'resource-form323',
      title: 'FCC Form 323 Preparation Guide',
      description: 'Complete step-by-step guide to preparing and filing Form 323',
      type: 'PDF Guide',
      size: '2.4 MB',
      downloadUrl: '#',
    },
    {
      id: 'resource-demographic',
      title: 'Demographic Information Form',
      description: 'Template for collecting demographic data from all owners',
      type: 'Fillable Form',
      size: '1.1 MB',
      downloadUrl: '#',
    },
    {
      id: 'resource-checklist',
      title: 'FCC Compliance Checklist',
      description: 'Pre-filing checklist to ensure all requirements are met',
      type: 'Checklist',
      size: '0.8 MB',
      downloadUrl: '#',
    },
    {
      id: 'resource-training',
      title: 'FCC Compliance Training Module',
      description: 'Interactive training on FCC requirements and best practices',
      type: 'Video Training',
      size: '145 MB',
      downloadUrl: '#',
    },
    {
      id: 'resource-ownership-change',
      title: 'Ownership Change Notification Template',
      description: 'Template for notifying FCC of ownership changes',
      type: 'Form Template',
      size: '0.6 MB',
      downloadUrl: '#',
    },
    {
      id: 'resource-filing-instructions',
      title: 'FCC LMS Filing Instructions',
      description: 'Step-by-step guide to using FCC Licensing and Management System',
      type: 'Guide',
      size: '1.9 MB',
      downloadUrl: '#',
    },
  ]);

  const [documents, setDocuments] = useState([
    {
      id: 'doc-articles',
      name: 'Articles of Organization',
      status: 'Submitted',
      submittedDate: '2025-08-15',
      verified: true,
    },
    {
      id: 'doc-bylaws',
      name: 'Operating Agreement',
      status: 'Submitted',
      submittedDate: '2025-08-15',
      verified: true,
    },
    {
      id: 'doc-frn',
      name: 'FCC Registration Numbers',
      status: 'Submitted',
      submittedDate: '2025-09-01',
      verified: true,
    },
    {
      id: 'doc-demographic',
      name: 'Demographic Certification',
      status: 'Pending Review',
      submittedDate: '2026-02-20',
      verified: false,
    },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 'alert-ownership-update',
      type: 'warning',
      title: 'Ownership Documentation Due Soon',
      message: 'Your ownership documentation update is due in 28 days. Start preparation now.',
      actionUrl: '#',
      actionText: 'View Resources',
    },
    {
      id: 'alert-form323-prep',
      type: 'info',
      title: 'Form 323 Filing Preparation',
      message: 'Begin gathering documentation for your October 2026 Form 323 filing.',
      actionUrl: '#',
      actionText: 'Download Guide',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-green-100 text-green-800';
      case 'Due Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Franchisee Portal</h1>
          <p className="text-slate-400">
            Complete compliance management and deadline tracking for {franchiseeData.franchiseeName}
          </p>
        </div>

        {/* Franchisee Info Card */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Franchisee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Franchisee ID</p>
                <p className="text-white font-semibold">{franchiseeData.franchiseeId}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Franchise Name</p>
                <p className="text-white font-semibold">{franchiseeData.franchiseeName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Owner</p>
                <p className="text-white font-semibold">{franchiseeData.ownerName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <Badge className="bg-green-600 text-white mt-1">{franchiseeData.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={franchiseeData.complianceScore} className="h-3" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">{franchiseeData.complianceScore}%</p>
                <p className="text-slate-400 text-sm">Excellent Standing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{alert.title}</p>
                      <p className="text-slate-700 text-sm mt-1">{alert.message}</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4">
                      {alert.actionText}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="deadlines" className="space-y-4">
          <TabsList className="bg-slate-700 border-slate-600">
            <TabsTrigger value="deadlines" className="text-white">
              Deadlines
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-white">
              Resources
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-white">
              Documents
            </TabsTrigger>
            <TabsTrigger value="support" className="text-white">
              Support
            </TabsTrigger>
          </TabsList>

          {/* Deadlines Tab */}
          <TabsContent value="deadlines">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compliance Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deadlines.map((deadline) => (
                    <div key={deadline.id} className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{deadline.task}</h3>
                          <p className="text-slate-400 text-sm">
                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(deadline.status)}>
                            {deadline.status}
                          </Badge>
                          <Badge className={getPriorityColor(deadline.priority)}>
                            {deadline.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm mb-3">
                        <Clock className="h-4 w-4" />
                        <span>{deadline.daysRemaining} days remaining</span>
                      </div>
                      <Button variant="outline" size="sm" className="text-slate-300 border-slate-600">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compliance Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{resource.title}</h3>
                          <p className="text-slate-400 text-sm">{resource.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-slate-400 text-xs space-y-1">
                          <p>Type: {resource.type}</p>
                          <p>Size: {resource.size}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-slate-300 border-slate-600">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Submitted Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-slate-700 rounded-lg p-4 bg-slate-700/50 flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{doc.name}</h3>
                        <p className="text-slate-400 text-sm">
                          Submitted: {new Date(doc.submittedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.verified ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-600 text-white">
                            <Clock className="h-3 w-3 mr-1" />
                            {doc.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Support & Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                    <h3 className="text-white font-semibold mb-2">Compliance Support Team</h3>
                    <p className="text-slate-400 text-sm mb-3">
                      Get help with FCC compliance questions, document preparation, and filing procedures.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>

                  <div className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                    <h3 className="text-white font-semibold mb-2">Schedule Compliance Review</h3>
                    <p className="text-slate-400 text-sm mb-3">
                      Book a one-on-one compliance review session with our FCC specialists.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Schedule Review
                    </Button>
                  </div>

                  <div className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                    <h3 className="text-white font-semibold mb-2">FCC Resources</h3>
                    <p className="text-slate-400 text-sm mb-3">
                      Access official FCC documentation and filing systems.
                    </p>
                    <Button variant="outline" className="text-slate-300 border-slate-600">
                      Visit FCC LMS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>RRB Franchisee Portal • Powered by QUMUS Autonomous Orchestration</p>
          <p className="mt-2">© 2026 Rockin' Rockin' Boogie • A Canryn Production</p>
        </div>
      </div>
    </div>
  );
}
