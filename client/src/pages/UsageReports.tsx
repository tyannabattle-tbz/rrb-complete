import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, Calendar } from "lucide-react";

export function UsageReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    try {
      // Mock data for demonstration
      setReports([
        {
          reportId: "report_user_202401",
          period: "January 2024",
          generatedAt: new Date(Date.now() - 86400000),
          metrics: {
            totalRequests: 45000,
            totalErrors: 120,
            averageResponseTime: 245,
            costEstimate: 45.0,
            videoMinutesGenerated: 1200,
            storageUsedGB: 125.5,
            topFeatures: [
              { feature: "Video Generation", usage: 18000 },
              { feature: "Batch Processing", usage: 13500 },
              { feature: "Voice Commands", usage: 9000 },
              { feature: "Analytics", usage: 4500 },
            ],
          },
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      alert("Report generation initiated. This may take a few moments.");
      fetchReports();
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  const downloadReport = (format: "pdf" | "csv" | "json") => {
    try {
      alert(`Downloading report as ${format.toUpperCase()}...`);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading reports...</div>;
  }

  const report = reports[0];

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usage Reports</h1>
          <p className="text-gray-600 mt-2">Analyze your Qumus usage and costs</p>
        </div>
        <Button onClick={generateReport} className="gap-2">
          <FileText className="w-4 h-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${report?.metrics.costEstimate.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Video Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.metrics.videoMinutesGenerated.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">Generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.metrics.storageUsedGB.toFixed(1)} GB</div>
            <p className="text-xs text-gray-600 mt-1">Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report?.metrics.topFeatures || []}
                  dataKey="usage"
                  nameKey="feature"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {report?.metrics.topFeatures.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report?.metrics.topFeatures || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Download Reports</CardTitle>
          <CardDescription>Export your usage data in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" onClick={() => downloadReport("pdf")} className="gap-2">
            <Download className="w-4 h-4" />
            PDF Report
          </Button>
          <Button variant="outline" onClick={() => downloadReport("csv")} className="gap-2">
            <Download className="w-4 h-4" />
            CSV Export
          </Button>
          <Button variant="outline" onClick={() => downloadReport("json")} className="gap-2">
            <Download className="w-4 h-4" />
            JSON Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
