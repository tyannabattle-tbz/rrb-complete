import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  createBatchProcessor,
  BATCH_PRESETS,
  type BatchVideoJob,
} from '@/lib/batchVideoProcessing';
import { Play, Pause, Trash2, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export interface BatchVideoProcessorProps {
  imageUrl: string;
  onJobsComplete?: (jobs: BatchVideoJob[]) => void;
}

export function BatchVideoProcessorComponent({
  imageUrl,
  onJobsComplete,
}: BatchVideoProcessorProps) {
  const [processor] = useState(() =>
    createBatchProcessor({
      maxConcurrentJobs: 3,
      onProgress: (job) => setJobs((prev) => [...prev.filter((j) => j.id !== job.id), job]),
      onComplete: (job) => {
        setJobs((prev) => [...prev.filter((j) => j.id !== job.id), job]);
      },
      onError: (job) => {
        setJobs((prev) => [...prev.filter((j) => j.id !== job.id), job]);
      },
    })
  );

  const [jobs, setJobs] = useState<BatchVideoJob[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof BATCH_PRESETS>('socialMedia');

  const handleStartBatch = useCallback(() => {
    const preset = BATCH_PRESETS[selectedPreset];
    const newJobs = processor.addBatch(
      preset.jobs.map((job, idx) => ({
        ...job,
        imageUrl,
        name: `${preset.name} - ${job.preset}`,
      }))
    );
    setJobs((prev) => [...prev, ...processor.getAllJobs()]);
  }, [processor, selectedPreset, imageUrl]);

  const handleCancelJob = (jobId: string) => {
    processor.cancelJob(jobId);
    setJobs(processor.getAllJobs());
  };

  const handleClearCompleted = () => {
    processor.clearCompleted();
    setJobs(processor.getAllJobs());
  };

  const stats = processor.getStats();
  const preset = BATCH_PRESETS[selectedPreset];

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Select Batch Preset</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {Object.entries(BATCH_PRESETS).map(([key, preset]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPreset === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPreset(key as keyof typeof BATCH_PRESETS)}
            >
              <p className="font-semibold">{preset.name}</p>
              <p className="text-sm text-gray-600">{preset.description}</p>
              <p className="text-xs text-gray-500 mt-2">{preset.jobs.length} videos</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm font-semibold mb-2">Preset Details:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {preset.jobs.map((job, idx) => (
              <li key={`item-${idx}`}>
                • {job.preset} - {job.format.toUpperCase()} @ {job.quality} ({job.duration}s)
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={handleStartBatch} className="w-full" size="lg">
          <Play className="w-4 h-4 mr-2" />
          Start Batch Processing
        </Button>
      </Card>

      {/* Statistics */}
      {jobs.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-semibold mb-4">Batch Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(0)}%</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
            <Progress value={stats.averageProgress} className="h-2" />
          </div>
        </Card>
      )}

      {/* Jobs List */}
      {jobs.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Processing Jobs</h3>
            {stats.completed > 0 && (
              <Button size="sm" variant="outline" onClick={handleClearCompleted}>
                Clear Completed
              </Button>
            )}
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({stats.completed})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({stats.processing})
              </TabsTrigger>
              <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
            </TabsList>

            {/* All Jobs */}
            <TabsContent value="all" className="space-y-3 mt-4">
              {jobs.map((job, idx) => (
                <JobCard key={job.id} job={job} onCancel={handleCancelJob} />
              ))}
            </TabsContent>

            {/* Completed */}
            <TabsContent value="completed" className="space-y-3 mt-4">
              {jobs
                .filter((j) => j.status === 'completed')
                .map((job, idx) => (
                  <JobCard key={job.id} job={job} onCancel={handleCancelJob} />
                ))}
            </TabsContent>

            {/* Processing */}
            <TabsContent value="processing" className="space-y-3 mt-4">
              {jobs
                .filter((j) => j.status === 'processing')
                .map((job, idx) => (
                  <JobCard key={job.id} job={job} onCancel={handleCancelJob} />
                ))}
            </TabsContent>

            {/* Failed */}
            <TabsContent value="failed" className="space-y-3 mt-4">
              {jobs
                .filter((j) => j.status === 'failed')
                .map((job, idx) => (
                  <JobCard key={job.id} job={job} onCancel={handleCancelJob} />
                ))}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}

interface JobCardProps {
  job: BatchVideoJob;
  onCancel: (jobId: string) => void;
}

function JobCard({ job, onCancel }: JobCardProps) {
  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-orange-500" />,
    processing: <Play className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  const statusColors = {
    pending: 'bg-orange-50 border-orange-200',
    processing: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
    failed: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[job.status]} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {statusIcons[job.status]}
          <div className="flex-1">
            <p className="font-semibold">{job.name}</p>
            <p className="text-sm text-gray-600">
              {job.format.toUpperCase()} • {job.quality} • {job.duration}s
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{job.progress.toFixed(0)}%</p>
          {job.startTime && job.endTime && (
            <p className="text-xs text-gray-600">
              {((job.endTime - job.startTime) / 1000).toFixed(1)}s
            </p>
          )}
        </div>
      </div>

      <Progress value={job.progress} className="h-2" />

      {job.error && <p className="text-sm text-red-600">{job.error}</p>}

      <div className="flex gap-2">
        {job.outputUrl && (
          <Button size="sm" variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        {job.status === 'processing' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(job.id)}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
