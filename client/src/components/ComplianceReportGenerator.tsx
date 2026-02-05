import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, BarChart3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ComplianceReportGenerator() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportFormat, setReportFormat] = useState<"json" | "csv" | "html">("json");
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "html">("csv");

  // Mutations
  const generateReportMutation = trpc.complianceReporting.generateComplianceReport.useMutation({
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success("Compliance report generated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });

  const exportAuditTrailMutation = trpc.complianceReporting.exportAuditTrail.useMutation({
    onSuccess: (data) => {
      downloadFile(data.data, `audit-trail.${data.format}`, getMimeType(data.format));
      toast.success("Audit trail exported successfully");
    },
    onError: (error) => {
      toast.error(`Failed to export audit trail: ${error.message}`);
    },
  });

  const getComplianceMetricsMutation = trpc.complianceReporting.getComplianceMetrics.useQuery({
    days: 30,
  });

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    await generateReportMutation.mutateAsync({
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      includeViolations: true,
      format: reportFormat,
    });
  };

  const handleExportAuditTrail = async () => {
    await exportAuditTrailMutation.mutateAsync({
      format: exportFormat,
      limit: 1000,
    });
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getMimeType = (format: string): string => {
    switch (format) {
      case "csv":
        return "text/csv";
      case "html":
        return "text/html";
      default:
        return "application/json";
    }
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;

    const filename = `compliance-report-${generatedReport.reportId}.${reportFormat}`;
    downloadFile(generatedReport.report, filename, getMimeType(reportFormat));
    toast.success("Report downloaded successfully");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Report Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate compliance reports and export audit trails for regulatory audits
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="export">Export Audit Trail</TabsTrigger>
          <TabsTrigger value="metrics">Compliance Metrics</TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Compliance Report</CardTitle>
              <CardDescription>
                Create a compliance report for a specific date range
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Report Format</label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
                className="w-full"
              >
                <FileText size={16} className="mr-2" />
                {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>

          {generatedReport && (
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Decisions</div>
                    <div className="text-2xl font-bold">
                      {generatedReport.summary.totalDecisions}
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Violations</div>
                    <div className="text-2xl font-bold text-red-600">
                      {generatedReport.summary.violations}
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Compliance Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {generatedReport.summary.complianceRate}%
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Policies</div>
                    <div className="text-2xl font-bold">
                      {generatedReport.summary.totalPolicies}
                    </div>
                  </div>
                </div>

                <Button onClick={handleDownloadReport} className="w-full">
                  <Download size={16} className="mr-2" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Audit Trail Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Audit Trail</CardTitle>
              <CardDescription>
                Export complete audit trail for compliance verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <Button
                onClick={handleExportAuditTrail}
                disabled={exportAuditTrailMutation.isPending}
                className="w-full"
              >
                <Download size={16} className="mr-2" />
                {exportAuditTrailMutation.isPending ? "Exporting..." : "Export Audit Trail"}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertTriangle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    Audit trails contain sensitive decision data. Ensure proper access controls
                    before sharing.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Metrics (Last 30 Days)</CardTitle>
              <CardDescription>
                Real-time compliance metrics and policy performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getComplianceMetricsMutation.isLoading ? (
                <div className="text-center text-muted-foreground">Loading metrics...</div>
              ) : getComplianceMetricsMutation.data ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Decisions</div>
                      <div className="text-2xl font-bold">
                        {getComplianceMetricsMutation.data.summary.totalDecisions}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Compliance Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {getComplianceMetricsMutation.data.summary.complianceRate}%
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Successful</div>
                      <div className="text-2xl font-bold">
                        {getComplianceMetricsMutation.data.summary.successfulDecisions}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Failed</div>
                      <div className="text-2xl font-bold text-red-600">
                        {getComplianceMetricsMutation.data.summary.failedDecisions}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Policy Performance</h3>
                    <div className="space-y-2">
                      {getComplianceMetricsMutation.data.policies.map((policy: any) => (
                        <div
                          key={policy.name}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {policy.total} decisions ({policy.successful} successful,{" "}
                              {policy.failed} failed)
                            </div>
                          </div>
                          <Badge
                            variant={
                              policy.complianceRate >= 90
                                ? "default"
                                : policy.complianceRate >= 70
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {Math.round(policy.complianceRate)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 mb-1">Trend</div>
                    <div className="text-sm text-blue-800">
                      {getComplianceMetricsMutation.data.trend === "improving"
                        ? "📈 Compliance rate is improving"
                        : getComplianceMetricsMutation.data.trend === "declining"
                          ? "📉 Compliance rate is declining"
                          : "➡️ Compliance rate is stable"}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
