import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  RotateCcw,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface BatchJob {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  estimatedTime: number;
  elapsedTime: number;
  createdAt: Date;
}

interface BatchQueue {
  id: string;
  name: string;
  jobs: BatchJob[];
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  isPaused: boolean;
}

export const BatchProcessingDashboard: React.FC = () => {
  const [queues, setQueues] = useState<BatchQueue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobPriority, setNewJobPriority] = useState<
    'low' | 'medium' | 'high' | 'critical'
  >('medium');
  const [bulkCount, setBulkCount] = useState('10');

  // Fetch queues
  const { data: fetchedQueues } = (trpc as any).batch.getQueues.useQuery();

  useEffect(() => {
    if (fetchedQueues) {
      setQueues(fetchedQueues);
      if (!selectedQueue && fetchedQueues.length > 0) {
        setSelectedQueue(fetchedQueues[0].id);
      }
    }
  }, [fetchedQueues]);

  // Create new queue
  const createQueueMutation = (trpc as any).batch.createQueue.useMutation({
    onSuccess: (newQueue) => {
      setQueues((prev) => [...prev, newQueue]);
      setSelectedQueue(newQueue.id);
      toast.success('Queue created');
    },
  });

  // Add job to queue
  const addJobMutation = (trpc as any).batch.addJob.useMutation({
    onSuccess: (job) => {
      setQueues((prev) =>
        prev.map((q) =>
          q.id === selectedQueue
            ? {
                ...q,
                jobs: [job, ...q.jobs],
                totalJobs: q.totalJobs + 1,
              }
            : q
        )
      );
      setNewJobTitle('');
      toast.success('Job added to queue');
    },
  });

  // Add bulk jobs
  const addBulkJobsMutation = (trpc as any).batch.addBulkJobs.useMutation({
    onSuccess: (jobs) => {
      setQueues((prev) =>
        prev.map((q) =>
          q.id === selectedQueue
            ? {
                ...q,
                jobs: [...jobs, ...q.jobs],
                totalJobs: q.totalJobs + jobs.length,
              }
            : q
        )
      );
      toast.success(`${jobs.length} jobs added to queue`);
    },
  });

  // Pause/Resume queue
  const pauseQueueMutation = (trpc as any).batch.pauseQueue.useMutation({
    onSuccess: () => {
      setQueues((prev) =>
        prev.map((q) =>
          q.id === selectedQueue ? { ...q, isPaused: true } : q
        )
      );
      toast.success('Queue paused');
    },
  });

  const resumeQueueMutation = (trpc as any).batch.resumeQueue.useMutation({
    onSuccess: () => {
      setQueues((prev) =>
        prev.map((q) =>
          q.id === selectedQueue ? { ...q, isPaused: false } : q
        )
      );
      toast.success('Queue resumed');
    },
  });

  // Cancel job
  const cancelJobMutation = (trpc as any).batch.cancelJob.useMutation({
    onSuccess: () => {
      toast.success('Job cancelled');
    },
  });

  const currentQueue = queues.find((q) => q.id === selectedQueue);

  const handleCreateQueue = () => {
    createQueueMutation.mutate({ name: `Queue ${Date.now()}` });
  };

  const handleAddJob = () => {
    if (!selectedQueue || !newJobTitle.trim()) {
      toast.error('Please select a queue and enter a job title');
      return;
    }
    addJobMutation.mutate({
      queueId: selectedQueue,
      title: newJobTitle,
      priority: newJobPriority,
    });
  };

  const handleAddBulkJobs = () => {
    if (!selectedQueue) {
      toast.error('Please select a queue');
      return;
    }
    const count = parseInt(bulkCount);
    if (count <= 0 || count > 100) {
      toast.error('Enter a number between 1 and 100');
      return;
    }
    addBulkJobsMutation.mutate({
      queueId: selectedQueue,
      count,
    });
  };

  const handlePauseResume = () => {
    if (!selectedQueue) return;
    if (currentQueue?.isPaused) {
      resumeQueueMutation.mutate({ queueId: selectedQueue });
    } else {
      pauseQueueMutation.mutate({ queueId: selectedQueue });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="queues" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Queues Tab */}
        <TabsContent value="queues" className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleCreateQueue}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Queue
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {queues.map((queue) => (
              <Card
                key={queue.id}
                onClick={() => setSelectedQueue(queue.id)}
                className={`p-4 cursor-pointer transition-all ${
                  selectedQueue === queue.id
                    ? 'bg-blue-900 border-blue-500'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white">{queue.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        queue.isPaused
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-green-900 text-green-200'
                      }`}
                    >
                      {queue.isPaused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">Total</p>
                      <p className="text-white font-semibold">
                        {queue.totalJobs}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Completed</p>
                      <p className="text-green-400 font-semibold">
                        {queue.completedJobs}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Failed</p>
                      <p className="text-red-400 font-semibold">
                        {queue.failedJobs}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          {currentQueue && (
            <>
              <Card className="p-4 bg-slate-900 border-slate-700">
                <h3 className="font-semibold text-white mb-4">
                  {currentQueue.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Job title"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                    />
                    <Select
                      value={newJobPriority}
                      onValueChange={(v: any) => setNewJobPriority(v)}
                    >
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAddJob}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Number of jobs"
                      value={bulkCount}
                      onChange={(e) => setBulkCount(e.target.value)}
                      min="1"
                      max="100"
                      className="bg-slate-800 border-slate-700"
                    />
                    <Button
                      onClick={handleAddBulkJobs}
                      className="gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                      Bulk Add
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={handlePauseResume}
                  className={`flex-1 gap-2 ${
                    currentQueue.isPaused
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {currentQueue.isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  )}
                </Button>
              </div>

              <ScrollArea className="h-96 border border-slate-700 rounded-lg p-4">
                {currentQueue.jobs.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No jobs in this queue
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentQueue.jobs.map((job) => (
                      <Card
                        key={job.id}
                        className="p-3 bg-slate-800 border-slate-700"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              {getStatusIcon(job.status)}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                  {job.title}
                                </p>
                                <p
                                  className={`text-xs font-semibold ${getPriorityColor(
                                    job.priority
                                  )}`}
                                >
                                  {job.priority.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => cancelJobMutation.mutate(job.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <Progress
                              value={job.progress}
                              className="h-2"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                            <div>
                              <p>Status</p>
                              <p className="text-white capitalize">
                                {job.status}
                              </p>
                            </div>
                            <div>
                              <p>Elapsed</p>
                              <p className="text-white">
                                {Math.floor(job.elapsedTime / 60)}m
                              </p>
                            </div>
                            <div>
                              <p>Estimated</p>
                              <p className="text-white">
                                {Math.floor(job.estimatedTime / 60)}m
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          {currentQueue && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-4 bg-slate-900 border-slate-700">
                <p className="text-xs text-slate-400">Total Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {currentQueue.totalJobs}
                </p>
              </Card>

              <Card className="p-4 bg-slate-900 border-slate-700">
                <p className="text-xs text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">
                  {currentQueue.completedJobs}
                </p>
              </Card>

              <Card className="p-4 bg-slate-900 border-slate-700">
                <p className="text-xs text-slate-400">Failed</p>
                <p className="text-2xl font-bold text-red-400">
                  {currentQueue.failedJobs}
                </p>
              </Card>

              <Card className="p-4 bg-slate-900 border-slate-700">
                <p className="text-xs text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-blue-400">
                  {currentQueue.totalJobs > 0
                    ? Math.round(
                        (currentQueue.completedJobs /
                          (currentQueue.completedJobs +
                            currentQueue.failedJobs)) *
                          100
                      )
                    : 0}
                  %
                </p>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BatchProcessingDashboard;
