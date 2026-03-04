/**
 * Cron Scheduler Initialization Module
 * Deploys and initializes all scheduled tasks on server startup
 */

import { cronSchedulerService } from '../services/cronSchedulerService';
import { automatedPostingScheduleService } from '../services/automatedPostingScheduleService';
import { credentialRotationService } from '../services/credentialRotationService';

/**
 * Initialize cron scheduler on server startup
 */
export async function initializeCronScheduler(): Promise<void> {
  try {
    console.log('[Init] Starting Cron Scheduler initialization...');

    // Initialize all scheduled tasks
    await cronSchedulerService.initializeSchedules();

    // Log initialization status
    const jobStatuses = cronSchedulerService.getAllJobStatuses();
    console.log('[Init] Cron Scheduler Status:', jobStatuses);

    // Verify all jobs are running
    const allJobsRunning = Object.values(jobStatuses).every(status => status === true);

    if (allJobsRunning) {
      console.log('[Init] ✓ Cron Scheduler fully initialized and operational');
      return;
    } else {
      console.warn('[Init] ⚠️ Some cron jobs failed to start');
    }
  } catch (error) {
    console.error('[Init] Failed to initialize Cron Scheduler:', error);
    throw error;
  }
}

/**
 * Graceful shutdown of cron scheduler
 */
export async function shutdownCronScheduler(): Promise<void> {
  try {
    console.log('[Shutdown] Stopping Cron Scheduler...');
    cronSchedulerService.stopAll();
    console.log('[Shutdown] ✓ Cron Scheduler stopped gracefully');
  } catch (error) {
    console.error('[Shutdown] Error stopping Cron Scheduler:', error);
  }
}

/**
 * Health check for cron scheduler
 */
export async function healthCheckCronScheduler(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  jobs: Record<string, boolean>;
  message: string;
}> {
  try {
    const jobStatuses = cronSchedulerService.getAllJobStatuses();
    const allJobsRunning = Object.values(jobStatuses).every(status => status === true);

    if (allJobsRunning) {
      return {
        status: 'healthy',
        jobs: jobStatuses,
        message: 'All cron jobs running normally',
      };
    } else {
      const failedJobs = Object.entries(jobStatuses)
        .filter(([_, status]) => !status)
        .map(([jobId, _]) => jobId);

      return {
        status: 'degraded',
        jobs: jobStatuses,
        message: `Some jobs not running: ${failedJobs.join(', ')}`,
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      jobs: {},
      message: `Health check failed: ${String(error)}`,
    };
  }
}

/**
 * Get cron scheduler statistics
 */
export async function getCronSchedulerStats() {
  try {
    const jobStatuses = cronSchedulerService.getAllJobStatuses();
    const scheduleStats = await automatedPostingScheduleService.getScheduleStats();
    const rotationStats = await credentialRotationService.getRotationStats();

    return {
      timestamp: new Date().toISOString(),
      cron_jobs: jobStatuses,
      scheduled_posts: scheduleStats,
      credential_rotations: rotationStats,
      system_status: 'operational',
    };
  } catch (error) {
    console.error('[Stats] Failed to get cron scheduler stats:', error);
    return {
      timestamp: new Date().toISOString(),
      cron_jobs: {},
      scheduled_posts: {},
      credential_rotations: {},
      system_status: 'error',
      error: String(error),
    };
  }
}
