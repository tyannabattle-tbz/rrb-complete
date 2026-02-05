"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface BatchJob {
  jobId: string;
  jobName: string;
  status: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  progressPercent: number;
  createdAt: Date | string;
  completedAt?: Date | string | null;
}

/**
 * Batch Processing Component
 * Manages video export queues with progress tracking
 */
export default function BatchProcessing() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch batch jobs
  const { data: jobsData } = trpc.batchProcessing.listBatchJobs.useQuery(
    { limit: 10, offset: 0 },
    { refetchInterval: 2000 }
  );

  // Fetch job status
  const { data: jobStatus } = trpc.batchProcessing.getBatchJobStatus.useQuery(
    { jobId: selectedJobId || "" },
    { enabled: !!selectedJobId, refetchInterval: 1000 }
  );

  const cancelJobMutation = trpc.batchProcessing.cancelBatchJob.useMutation();
  const retryJobMutation = trpc.batchProcessing.retryBatchJob.useMutation();

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJobMutation.mutateAsync({ jobId });
    } catch (error) {
      console.error("Failed to cancel job:", error);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await retryJobMutation.mutateAsync({ jobId });
    } catch (error) {
      console.error("Failed to retry job:", error);
    }
  };

  const handleDownload = async (jobId: string) => {
    try {
      const downloadUrl = `https://batch-results.s3.amazonaws.com/job_${jobId}.zip?download=true`;
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "processing":
        return "bg-blue-600";
      case "queued":
        return "bg-yellow-600";
      case "failed":
        return "bg-red-600";
      case "cancelled":
        return "bg-gray-600";
      default:
        return "bg-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Play className="w-4 h-4" />;
      case "queued":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Batch Job */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Batch Export Job
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Batch Job
          </Button>
        </CardContent>
      </Card>

      {/* Batch Jobs List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Active & Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!jobsData || jobsData.jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No batch jobs yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobsData.jobs.map((job: BatchJob) => (
                <div
                  key={job.jobId}
                  onClick={() => setSelectedJobId(job.jobId)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedJobId === job.jobId
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{job.jobName}</h4>
                        <Badge className={`${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{job.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {job.completedItems}/{job.totalItems} videos •{" "}
                        {job.failedItems > 0 && `${job.failedItems} failed • `}
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{job.progressPercent}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <Progress value={job.progressPercent} className="mb-3" />

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {job.status === "processing" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelJob(job.jobId);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:text-red-300"
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                    {job.status === "failed" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetryJob(job.jobId);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:text-yellow-300"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    )}
                    {job.status === "completed" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(job.jobId);
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelJob(job.jobId);
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Details */}
      {selectedJobId && jobStatus && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <p className="text-sm font-medium text-white">{jobStatus.status}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Progress</p>
                <p className="text-sm font-medium text-white">{jobStatus.progressPercent}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Current Video</p>
                <p className="text-sm font-medium text-white">{jobStatus.currentVideo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Time Elapsed</p>
                <p className="text-sm font-medium text-white">
                  {jobStatus.timeElapsedMinutes}m
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Est. Time Remaining</p>
                <p className="text-sm font-medium text-white">
                  {jobStatus.estimatedTimeRemainingMinutes}m
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Items</p>
                <p className="text-sm font-medium text-white">
                  {jobStatus.completedItems}/{jobStatus.totalItems}
                </p>
              </div>
            </div>

            {/* Detailed Progress */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Detailed Progress</p>
              <Progress value={jobStatus.progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
