import { automatedSyncJob } from './automatedSyncJob';

/**
 * Initialize all background sync jobs
 * Called when the server starts
 */
export function initializeSyncJobs(): void {
  console.log('[Jobs] Initializing background sync jobs...');

  try {
    // Start automated sync job (runs every hour)
    automatedSyncJob.start(3600000); // 1 hour in milliseconds
    console.log('[Jobs] Automated sync job started');

    // Log initial status
    const status = automatedSyncJob.getStatus();
    console.log('[Jobs] Sync job status:', status);
  } catch (error) {
    console.error('[Jobs] Error initializing sync jobs:', error);
  }
}

/**
 * Cleanup sync jobs on server shutdown
 */
export function cleanupSyncJobs(): void {
  console.log('[Jobs] Cleaning up sync jobs...');

  try {
    automatedSyncJob.stop();
    console.log('[Jobs] Sync jobs stopped');
  } catch (error) {
    console.error('[Jobs] Error cleaning up sync jobs:', error);
  }
}

/**
 * Get status of all sync jobs
 */
export function getSyncJobsStatus(): any {
  return {
    automatedSync: automatedSyncJob.getStatus(),
  };
}
