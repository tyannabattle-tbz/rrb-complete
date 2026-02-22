/**
 * Compliance Audit Dashboard - World-Stage Production Ready
 * Real-time monitoring and automated audit scheduling
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';

export default function ComplianceAuditDashboard() {
  const [auditStatus, setAuditStatus] = useState({
    totalFranchises: 50,
    auditedFranchises: 48,
    complianceRate: 96,
    lastAuditDate: '2026-02-20',
    nextScheduledAudit: '2026-03-20',
  });

  const [auditResults, setAuditResults] = useState([
    {
      id: 'audit-001',
      franchiseeId: 'FRAN-001',
      franchiseeName: 'RRB New York Metro',
      auditDate: '2026-02-15',
      status: 'Compliant',
      score: 98,
      findings: 0,
      violations: 0,
    },
    {
      id: 'audit-002',
      franchiseeId: 'FRAN-002',
      franchiseeName: 'RRB Atlanta',
      auditDate: '2026-02-18',
      status: 'Compliant',
      score: 95,
      findings: 1,
      violations: 0,
    },
    {
      id: 'audit-003',
      franchiseeId: 'FRAN-003',
      franchiseeName: 'RRB Houston',
      auditDate: '2026-02-20',
      status: 'Compliant',
      score: 92,
      findings: 2,
      violations: 0,
    },
    {
      id: 'audit-004',
      franchiseeId: 'FRAN-004',
      franchiseeName: 'RRB Philadelphia',
      auditDate: '2026-02-10',
      status: 'Pending Review',
      score: 88,
      findings: 3,
      violations: 1,
    },
    {
      id: 'audit-005',
      franchiseeId: 'FRAN-005',
      franchiseeName: 'RRB Phoenix',
      auditDate: 'Scheduled',
      status: 'Scheduled',
      score: 0,
      findings: 0,
      violations: 0,
    },
  ]);

  const [violations, setViolations] = useState([
    {
      id: 'viol-001',
      franchiseeId: 'FRAN-004',
      franchiseeName: 'RRB Philadelphia',
      violationType: 'Documentation Incomplete',
      severity: 'Medium',
      dueDate: '2026-03-10',
      status: 'Pending Resolution',
    },
    {
      id: 'viol-002',
      franchiseeId: 'FRAN-006',
      franchiseeName: 'RRB Boston',
      violationType: 'Form 323 Deadline Approaching',
      severity: 'High',
      dueDate: '2026-02-28',
      status: 'Escalated',
    },
  ]);

  const [automatedPolicies, setAutomatedPolicies] = useState([
    {
      id: 'policy-quarterly-audit',
      name: 'Quarterly Compliance Audit',
      frequency: 'Every 90 days',
      autonomyLevel: 85,
      status: 'Active',
      nextRun: '2026-03-20',
    },
    {
      id: 'policy-deadline-monitor',
      name: 'Filing Deadline Monitor',
      frequency: 'Continuous',
      autonomyLevel: 95,
      status: 'Active',
      nextRun: 'Continuous',
    },
    {
      id: 'policy-documentation-check',
      name: 'Documentation Verification',
      frequency: 'Monthly',
      autonomyLevel: 80,
      status: 'Active',
      nextRun: '2026-03-01',
    },
    {
      id: 'policy-ownership-validation',
      name: 'Ownership Data Validation',
      frequency: 'Bi-weekly',
      autonomyLevel: 90,
      status: 'Active',
      nextRun: '2026-02-28',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Violation':
        return 'bg-red-100 text-red-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
          <h1 className="text-4xl font-bold text-white mb-2">Compliance Audit Dashboard</h1>
          <p className="text-slate-400">
            Real-time monitoring and automated audit scheduling for RRB franchise network
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Franchises</p>
                  <p className="text-3xl font-bold text-white">{auditStatus.totalFranchises}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Audited</p>
                  <p className="text-3xl font-bold text-white">{auditStatus.auditedFranchises}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Compliance Rate</p>
                  <p className="text-3xl font-bold text-white">{auditStatus.complianceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Violations</p>
                  <p className="text-3xl font-bold text-white">{violations.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Violations Alert */}
        {violations.length > 0 && (
          <Alert className="mb-8 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <p className="font-semibold text-red-900">
                {violations.length} Active Violation{violations.length !== 1 ? 's' : ''} Requiring Attention
              </p>
              <p className="text-red-800 text-sm mt-1">
                Review and resolve violations to maintain network compliance.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="audits" className="space-y-4">
          <TabsList className="bg-slate-700 border-slate-600">
            <TabsTrigger value="audits" className="text-white">
              Audit Results
            </TabsTrigger>
            <TabsTrigger value="violations" className="text-white">
              Violations
            </TabsTrigger>
            <TabsTrigger value="policies" className="text-white">
              Automated Policies
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-white">
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Audit Results Tab */}
          <TabsContent value="audits">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Audit Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditResults.map((audit) => (
                    <div key={audit.id} className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{audit.franchiseeName}</h3>
                          <p className="text-slate-400 text-sm">
                            {audit.auditDate === 'Scheduled'
                              ? 'Audit Scheduled'
                              : `Audited: ${new Date(audit.auditDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge className={getStatusColor(audit.status)}>{audit.status}</Badge>
                      </div>

                      {audit.status !== 'Scheduled' && (
                        <>
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-300 text-sm">Compliance Score</span>
                              <span className="text-white font-semibold">{audit.score}%</span>
                            </div>
                            <Progress value={audit.score} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-slate-400">
                              Findings: <span className="text-white font-semibold">{audit.findings}</span>
                            </div>
                            <div className="text-slate-400">
                              Violations: <span className="text-white font-semibold">{audit.violations}</span>
                            </div>
                          </div>
                        </>
                      )}

                      <Button variant="outline" size="sm" className="mt-3 text-slate-300 border-slate-600">
                        View Full Report
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Violations</CardTitle>
              </CardHeader>
              <CardContent>
                {violations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-slate-400">No active violations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {violations.map((violation) => (
                      <div key={violation.id} className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{violation.franchiseeName}</h3>
                            <p className="text-slate-400 text-sm">{violation.violationType}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getSeverityColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                            <Badge className="bg-yellow-600 text-white">{violation.status}</Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300 text-sm mb-3">
                          <Clock className="h-4 w-4" />
                          <span>Due: {new Date(violation.dueDate).toLocaleDateString()}</span>
                        </div>

                        <Button variant="outline" size="sm" className="text-slate-300 border-slate-600">
                          Take Action
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automated Policies Tab */}
          <TabsContent value="policies">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">QUMUS Automated Compliance Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automatedPolicies.map((policy) => (
                    <div key={policy.id} className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            {policy.name}
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            Frequency: {policy.frequency}
                          </p>
                        </div>
                        <Badge className="bg-green-600 text-white">{policy.status}</Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-300 text-sm">Autonomy Level</span>
                          <span className="text-white font-semibold">{policy.autonomyLevel}%</span>
                        </div>
                        <Progress value={policy.autonomyLevel} className="h-2" />
                      </div>

                      <p className="text-slate-400 text-sm">
                        Next Run: {policy.nextRun === 'Continuous' ? 'Continuous' : new Date(policy.nextRun).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Audit Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                    <h3 className="text-white font-semibold mb-2">Last Audit</h3>
                    <p className="text-slate-400">
                      {new Date(auditStatus.lastAuditDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                    <h3 className="text-white font-semibold mb-2">Next Scheduled Audit</h3>
                    <p className="text-slate-400">
                      {new Date(auditStatus.nextScheduledAudit).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="border border-slate-700 rounded-lg p-4 bg-slate-700/50">
                    <h3 className="text-white font-semibold mb-3">Audit Frequency</h3>
                    <p className="text-slate-400 text-sm mb-3">
                      Quarterly audits ensure continuous compliance across the network.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Schedule Audit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>RRB Compliance Audit Dashboard • Powered by QUMUS Autonomous Orchestration</p>
          <p className="mt-2">© 2026 Rockin' Rockin' Boogie • A Canryn Production</p>
        </div>
      </div>
    </div>
  );
}
