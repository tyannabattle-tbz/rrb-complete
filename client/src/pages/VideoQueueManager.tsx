import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { Play, Pause, Trash2, Download, Eye } from 'lucide-react';

interface VideoJob {
  jobId: string;
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  prompt: string;
  duration: number;
  resolution: string;
  createdAt: Date;
  completedAt?: Date;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export default function VideoQueueManager() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<VideoJob | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate fetching jobs (in production, use tRPC)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Mock data for demonstration
        const mockJobs: VideoJob[] = [
          {
            jobId: 'job-001',
            videoId: 'video-001',
            status: 'completed',
            progress: 100,
            prompt: 'A cinematic shot of a sunrise over mountains',
            duration: 10,
            resolution: '1080p',
            createdAt: new Date(Date.now() - 3600000),
            completedAt: new Date(Date.now() - 1800000),
            videoUrl: '/videos/video-001.mp4',
            thumbnailUrl: '/thumbnails/video-001.jpg',
          },
          {
            jobId: 'job-002',
            videoId: 'video-002',
            status: 'processing',
            progress: 65,
            prompt: 'An animated logo reveal with music',
            duration: 5,
            resolution: '720p',
            createdAt: new Date(Date.now() - 600000),
          },
          {
            jobId: 'job-003',
            videoId: 'video-003',
            status: 'queued',
            progress: 0,
            prompt: 'Motion graphics for product demo',
            duration: 15,
            resolution: '4k',
            createdAt: new Date(Date.now() - 300000),
          },
        ];
        setJobs(mockJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      }
    };

    fetchJobs();
    const interval = autoRefresh ? setInterval(fetchJobs, 5000) : undefined;
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: jobs.length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    processing: jobs.filter((j) => j.status === 'processing').length,
    queued: jobs.filter((j) => j.status === 'queued').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Video Queue Manager</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage video generation jobs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Queued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.queued}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant={autoRefresh ? 'default' : 'outline'}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
        </Button>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Video Generation Jobs</CardTitle>
          <CardDescription>All video generation tasks and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No jobs yet</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{job.prompt.substring(0, 50)}...</h3>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.duration}s • {job.resolution}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{job.progress}%</div>
                      <Progress value={job.progress} className="w-32 mt-2" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <Progress value={job.progress} className="h-2" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    {job.status === 'processing' && (
                      <Button size="sm" variant="outline">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {job.status === 'completed' && (
                      <>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                    {job.status !== 'completed' && (
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Job ID</p>
                <p className="font-mono text-sm">{selectedJob.jobId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Video ID</p>
                <p className="font-mono text-sm">{selectedJob.videoId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getStatusColor(selectedJob.status)}>{selectedJob.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="font-semibold">{selectedJob.progress}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p>{selectedJob.duration} seconds</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolution</p>
                <p>{selectedJob.resolution}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prompt</p>
              <p className="mt-1">{selectedJob.prompt}</p>
            </div>
            {selectedJob.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{selectedJob.error}</p>
              </div>
            )}
            {selectedJob.videoUrl && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Video Preview</p>
                <video
                  src={selectedJob.videoUrl}
                  controls
                  className="w-full rounded border"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
