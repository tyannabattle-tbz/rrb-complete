import { videoAPIService } from './videoApiService';
import { thumbnailService } from './thumbnailService';
import { adaptiveStreamingService } from './adaptiveStreamingService';

/**
 * Integrated Video Service
 * Combines video generation, thumbnail creation, and adaptive streaming
 */

export interface VideoGenerationJob {
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
  streamingProfile?: any;
  error?: string;
}

export class IntegratedVideoService {
  private jobs: Map<string, VideoGenerationJob> = new Map();

  /**
   * Generate video with full pipeline
   */
  async generateVideoWithPipeline(
    prompt: string,
    duration: number,
    style: 'cinematic' | 'animated' | 'motion-graphics' | 'documentary' = 'cinematic',
    resolution: '720p' | '1080p' | '4k' = '1080p'
  ): Promise<VideoGenerationJob> {
    const jobId = `job-${Date.now()}`;
    const videoId = `video-${Date.now()}`;

    const job: VideoGenerationJob = {
      jobId,
      videoId,
      status: 'queued',
      progress: 0,
      prompt,
      duration,
      resolution,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);

    // Start async processing
    this.processVideoJob(jobId, prompt, duration, style, resolution);

    return job;
  }

  /**
   * Process video generation job
   */
  private async processVideoJob(
    jobId: string,
    prompt: string,
    duration: number,
    style: 'cinematic' | 'animated' | 'motion-graphics' | 'documentary',
    resolution: '720p' | '1080p' | '4k'
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      // Step 1: Generate video
      job.status = 'processing';
      job.progress = 10;
      this.jobs.set(jobId, job);

      const videoResponse = await videoAPIService.generateVideo({
        prompt,
        duration,
        style,
        resolution,
      });

      if (videoResponse.status === 'failed') {
        job.status = 'failed';
        job.error = videoResponse.error;
        job.progress = 0;
        this.jobs.set(jobId, job);
        return;
      }

      job.videoId = videoResponse.videoId;
      job.videoUrl = videoResponse.url;
      job.progress = 50;
      this.jobs.set(jobId, job);

      // Step 2: Generate thumbnail
      job.progress = 60;
      const thumbnailUrl = await thumbnailService.generateThumbnail(job.videoId);
      job.thumbnailUrl = thumbnailUrl;
      this.jobs.set(jobId, job);

      // Step 3: Create streaming profile
      job.progress = 80;
      const streamingProfile = adaptiveStreamingService.createStreamingProfile(
        job.videoId,
        duration,
        resolution
      );
      job.streamingProfile = streamingProfile;
      this.jobs.set(jobId, job);

      // Step 4: Complete
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      this.jobs.set(jobId, job);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.progress = 0;
      this.jobs.set(jobId, job);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): VideoGenerationJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get video streaming profile
   */
  getStreamingProfile(videoId: string, bandwidthMbps?: number) {
    const profile = adaptiveStreamingService.createStreamingProfile(videoId, 10);

    if (bandwidthMbps) {
      profile.recommendedQuality = adaptiveStreamingService.recommendQuality(bandwidthMbps);
    }

    return profile;
  }

  /**
   * Get HLS manifest
   */
  getHLSManifest(videoId: string, duration: number): string {
    return adaptiveStreamingService.createHLSManifest(videoId, duration);
  }

  /**
   * Get DASH manifest
   */
  getDASHManifest(videoId: string, duration: number): string {
    return adaptiveStreamingService.createDASHManifest(videoId, duration);
  }

  /**
   * Get quality recommendations for device
   */
  getDeviceRecommendation(deviceType: 'mobile' | 'tablet' | 'desktop') {
    return adaptiveStreamingService.getDeviceRecommendations(deviceType);
  }

  /**
   * List all jobs
   */
  listJobs(limit: number = 20, offset: number = 0): VideoGenerationJob[] {
    const jobs = Array.from(this.jobs.values());
    return jobs.slice(offset, offset + limit);
  }

  /**
   * Get job statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      totalJobs: jobs.length,
      completedJobs: jobs.filter((j) => j.status === 'completed').length,
      failedJobs: jobs.filter((j) => j.status === 'failed').length,
      processingJobs: jobs.filter((j) => j.status === 'processing').length,
      queuedJobs: jobs.filter((j) => j.status === 'queued').length,
      averageProcessingTime:
        jobs.filter((j) => j.completedAt).reduce((acc, j) => {
          if (j.completedAt) {
            return acc + (j.completedAt.getTime() - j.createdAt.getTime());
          }
          return acc;
        }, 0) / Math.max(jobs.filter((j) => j.completedAt).length, 1),
    };
  }
}

export const integratedVideoService = new IntegratedVideoService();
