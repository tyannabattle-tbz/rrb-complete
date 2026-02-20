import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Play, Pause, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface VideoTask {
  prompt: string;
  duration: number;
  style: string;
  resolution: "720p" | "1080p" | "4k";
}

interface JobTask {
  taskId: string;
  prompt: string;
  duration: number;
  style: string;
  resolution: "720p" | "1080p" | "4k";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  outputUrl?: string;
  errorMessage?: string;
  processingTime?: number;
}

interface Job {
  jobId: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  videos: JobTask[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalDuration: number;
  errorMessage?: string;
}

export function BatchVideoGenerator() {
  const [tasks, setTasks] = useState<VideoTask[]>([
    {
      prompt: "A beautiful sunset over mountains",
      duration: 10,
      style: "cinematic",
      resolution: "1080p",
    },
  ]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // tRPC queries and mutations
  const listJobsQuery = trpc.entertainment.batchVideo.listJobs.useQuery();
  const createJobMutation = trpc.entertainment.batchVideo.createJob.useMutation();
  const startJobMutation = trpc.entertainment.batchVideo.startJob.useMutation();
  const cancelJobMutation = trpc.entertainment.batchVideo.cancelJob.useMutation();
  const getJobStatsQuery = trpc.entertainment.batchVideo.getJobStats.useQuery();
  const getQueueStatsQuery = trpc.entertainment.batchVideo.getQueueStats.useQuery();

  // Load jobs
  useEffect(() => {
    if (listJobsQuery.data) {
      setJobs(listJobsQuery.data);
    }
  }, [listJobsQuery.data]);

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        prompt: "",
        duration: 10,
        style: "cinematic",
        resolution: "1080p",
      },
    ]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleUpdateTask = (index: number, field: keyof VideoTask, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleCreateJob = async () => {
    if (tasks.length === 0) {
      toast.error("Add at least one video task");
      return;
    }

    if (tasks.some((t) => !t.prompt)) {
      toast.error("All tasks must have a prompt");
      return;
    }

    try {
      const job = await createJobMutation.mutateAsync({ tasks });
      setSelectedJobId(job.jobId);
      toast.success("Batch job created successfully!");
      setTasks([
        {
          prompt: "",
          duration: 10,
          style: "cinematic",
          resolution: "1080p",
        },
      ]);
      listJobsQuery.refetch();
    } catch (error) {
      toast.error("Failed to create batch job");
    }
  };

  const handleStartJob = async (jobId: string) => {
    try {
      await startJobMutation.mutateAsync({ jobId });
      toast.success("Batch job started!");
      listJobsQuery.refetch();
    } catch (error) {
      toast.error("Failed to start job");
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJobMutation.mutateAsync({ jobId });
      toast.success("Batch job cancelled!");
      listJobsQuery.refetch();
    } catch (error) {
      toast.error("Failed to cancel job");
    }
  };

  const selectedJob = selectedJobId ? jobs.find((j) => j.jobId === selectedJobId) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Batch Video Generator</h1>
        <p className="text-gray-500">Create multiple videos in one batch</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getJobStatsQuery.data?.totalJobs || 0}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getQueueStatsQuery.data?.processingJobs || 0}</div>
            <p className="text-xs text-gray-500">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Queue Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getQueueStatsQuery.data?.queueLength || 0}</div>
            <p className="text-xs text-gray-500">Waiting to process</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Job */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Batch Job</CardTitle>
          <CardDescription>Add video generation tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map((task, index) => (
            <div key={`batch-${index}`} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Task {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTask(index)}
                  disabled={tasks.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Prompt</label>
                <Input
                  value={task.prompt}
                  onChange={(e) => handleUpdateTask(index, "prompt", e.target.value)}
                  placeholder="Describe the video you want to generate"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Duration (s)</label>
                  <Input
                    type="number"
                    min="1"
                    max="300"
                    value={task.duration}
                    onChange={(e) => handleUpdateTask(index, "duration", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Style</label>
                  <select
                    value={task.style}
                    onChange={(e) => handleUpdateTask(index, "style", e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="cinematic">Cinematic</option>
                    <option value="animated">Animated</option>
                    <option value="motion-graphics">Motion Graphics</option>
                    <option value="documentary">Documentary</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Resolution</label>
                  <select
                    value={task.resolution}
                    onChange={(e) => handleUpdateTask(index, "resolution", e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4k">4K</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <Button onClick={handleAddTask} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>

          <Button onClick={handleCreateJob} className="w-full">
            Create Batch Job ({tasks.length} {tasks.length === 1 ? "task" : "tasks"})
          </Button>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Jobs</CardTitle>
          <CardDescription>Your video generation jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No batch jobs yet</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedJobId(job.jobId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{job.jobId}</h4>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {job.videos.length} videos • Created{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {job.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartJob(job.jobId);
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {job.status === "processing" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelJob(job.jobId);
                          }}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Details */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details: {selectedJob.jobId}</CardTitle>
            <CardDescription>Tasks and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusColor(selectedJob.status)}>{selectedJob.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasks</p>
                <p className="font-medium">{selectedJob.videos.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{(selectedJob.totalDuration / 1000).toFixed(1)}s</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-medium">{selectedJob.progress}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Tasks</h4>
              {selectedJob.videos.map((video) => (
                <div key={video.taskId} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{video.prompt}</p>
                    <Badge className={getStatusColor(video.status)}>{video.status}</Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {video.duration}s • {video.resolution} • {video.style}
                    </span>
                    {video.processingTime && (
                      <span>{(video.processingTime / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                  {video.progress > 0 && (
                    <Progress value={video.progress} className="h-1" />
                  )}
                  {video.outputUrl && (
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                  {video.errorMessage && (
                    <p className="text-xs text-red-600">{video.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
