import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Radio, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface VideoGenerationJob {
  jobId: string;
  videoId: string;
  title: string;
  status: 'generated' | 'processing' | 'scheduled' | 'broadcasting' | 'completed';
  stage: string;
  progress: number;
  videoUrl?: string;
  scheduledTime?: Date;
}

export function VideoGenerationWithWorkflow() {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobs, setJobs] = useState<VideoGenerationJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<VideoGenerationJob | null>(null);

  // Simulated video generation - in production this would call the actual API
  const handleGenerateVideo = async () => {
    if (!title || !prompt) {
      alert('Please enter title and prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate video generation
      const videoId = `video-${Date.now()}`;
      const jobId = `job-${videoId}-${Date.now()}`;

      const newJob: VideoGenerationJob = {
        jobId,
        videoId,
        title,
        status: 'processing',
        stage: 'Initializing production workflow',
        progress: 10,
      };

      setJobs([newJob, ...jobs]);
      setSelectedJob(newJob);

      // Simulate production workflow stages
      const stages = [
        { stage: 'Analyzing video content', progress: 20 },
        { stage: 'Generating metadata and tags', progress: 40 },
        { stage: 'Scheduling for production', progress: 60 },
        { stage: 'Integrating with RRB Radio', progress: 80 },
        { stage: 'Ready for broadcast', progress: 100 },
      ];

      for (const { stage, progress } of stages) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const updatedJob = { ...newJob, stage, progress };
        setJobs((prev) => prev.map((j) => (j.jobId === jobId ? updatedJob : j)));
        setSelectedJob(updatedJob);
      }

      // Mark as scheduled
      const completedJob: VideoGenerationJob = {
        ...newJob,
        status: 'scheduled',
        stage: 'Scheduled for RRB Radio broadcast',
        progress: 100,
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      setJobs((prev) => prev.map((j) => (j.jobId === jobId ? completedJob : j)));
      setSelectedJob(completedJob);

      // Reset form
      setTitle('');
      setPrompt('');
      setDescription('');
      setDuration('60');
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBroadcastNow = (job: VideoGenerationJob) => {
    const updatedJob: VideoGenerationJob = {
      ...job,
      status: 'broadcasting',
      stage: 'Live on RRB Radio',
      progress: 100,
    };

    setJobs((prev) => prev.map((j) => (j.jobId === job.jobId ? updatedJob : j)));
    setSelectedJob(updatedJob);

    alert(`Video "${job.title}" is now broadcasting on RRB Radio!`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'broadcasting':
        return <Radio className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Video Generation with Production Workflow</CardTitle>
          <CardDescription>
            Generate videos and automatically schedule them for RRB Radio broadcast
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video Title</label>
            <Input
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video Prompt</label>
            <Textarea
              placeholder="Describe the video content you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <Textarea
              placeholder="Additional details about the video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isGenerating}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
            <Input
              type="number"
              min="15"
              max="300"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={handleGenerateVideo}
            disabled={isGenerating || !title || !prompt}
            className="w-full"
          >
            {isGenerating ? 'Generating & Processing...' : 'Generate Video & Schedule for RRB Radio'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Job Details */}
      {selectedJob && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(selectedJob.status)}
              {selectedJob.title}
            </CardTitle>
            <CardDescription>{selectedJob.stage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Production Progress</span>
                <span className="text-sm text-gray-600">{selectedJob.progress}%</span>
              </div>
              <Progress value={selectedJob.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status</span>
                <p className="font-medium capitalize">{selectedJob.status}</p>
              </div>
              <div>
                <span className="text-gray-600">Video ID</span>
                <p className="font-medium text-xs break-all">{selectedJob.videoId}</p>
              </div>
            </div>

            {selectedJob.status === 'scheduled' && (
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-gray-700 mb-3">
                  ✓ Video is ready for broadcast on RRB Radio
                </p>
                <Button
                  onClick={() => handleBroadcastNow(selectedJob)}
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Broadcast Now on RRB Radio
                </Button>
              </div>
            )}

            {selectedJob.status === 'broadcasting' && (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  🔴 LIVE: Video is currently broadcasting on RRB Radio
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Production Workflow Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Production Workflow Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Video Generation</p>
                <p className="text-sm text-gray-600">AI generates video from prompt</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Content Analysis</p>
                <p className="text-sm text-gray-600">LLM analyzes video content and quality</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Metadata Generation</p>
                <p className="text-sm text-gray-600">Automatic tags, categories, and descriptions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Production Scheduling</p>
                <p className="text-sm text-gray-600">Schedule video in production queue</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                5
              </div>
              <div>
                <p className="font-medium">RRB Radio Integration</p>
                <p className="text-sm text-gray-600">Integrate with RRB Radio broadcast system</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                6
              </div>
              <div>
                <p className="font-medium">Broadcast Ready</p>
                <p className="text-sm text-gray-600">Video scheduled for automatic broadcast</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job History */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Video Generation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  onClick={() => setSelectedJob(job)}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-gray-600">{job.stage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{job.progress}%</p>
                    <p className="text-xs text-gray-600 capitalize">{job.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
