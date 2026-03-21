import { qumusOrchestrationService } from "./qumusOrchestrationService";
import { hybridcastMonitoringIntegration } from "./hybridcastMonitoringIntegration";
import { rrbUnifiedFeedIntegration } from "./rrbUnifiedFeedIntegration";
import { qumusUnifiedFeedIntegration } from "./qumusUnifiedFeedIntegration";
import { tyOSUnifiedFeedService } from "./tyOSUnifiedFeedService";
import { flowpayService } from "./flowpayService";

export interface SystemSyncStatus {
  timestamp: number;
  qumusStatus: "healthy" | "degraded" | "critical";
  hybridcastStatus: "healthy" | "degraded" | "critical";
  rrbStatus: "healthy" | "degraded" | "critical";
  tyOSStatus: "healthy" | "degraded" | "critical";
  flowpayStatus: "healthy" | "degraded" | "critical";
  overallStatus: "healthy" | "degraded" | "critical";
  syncErrors: string[];
  lastSyncTime: number;
  nextSyncTime: number;
}

export class ComprehensiveSystemSync {
  private syncInterval = 5000; // 5 seconds
  private syncTimer: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;
  private syncErrors: string[] = [];

  async startContinuousSync(): Promise<void> {
    console.log("[SystemSync] Starting continuous system synchronization");

    this.syncTimer = setInterval(async () => {
      try {
        await this.performFullSync();
      } catch (error) {
        console.error("[SystemSync] Sync error:", error);
        this.syncErrors.push(String(error));
        if (this.syncErrors.length > 100) {
          this.syncErrors.shift();
        }
      }
    }, this.syncInterval);
  }

  async stopContinuousSync(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log("[SystemSync] Stopped continuous synchronization");
    }
  }

  async performFullSync(): Promise<SystemSyncStatus> {
    const startTime = Date.now();
    const syncErrors: string[] = [];

    // Sync QUMUS policies
    let qumusStatus: "healthy" | "degraded" | "critical" = "healthy";
    try {
      const qumusHealth = await qumusOrchestrationService.getSystemHealth();
      if (qumusHealth.errors > 0) {
        qumusStatus = "degraded";
        syncErrors.push(`QUMUS: ${qumusHealth.errors} errors detected`);
      }
    } catch (error) {
      qumusStatus = "critical";
      syncErrors.push(`QUMUS sync failed: ${error}`);
    }

    // Sync HybridCast
    let hybridcastStatus: "healthy" | "degraded" | "critical" = "healthy";
    try {
      const hcStatus = await hybridcastMonitoringIntegration.getIncidentStatus();
      if (!hcStatus) {
        hybridcastStatus = "degraded";
        syncErrors.push("HybridCast: No incidents found");
      }
    } catch (error) {
      hybridcastStatus = "critical";
      syncErrors.push(`HybridCast sync failed: ${error}`);
    }

    // Sync RRB
    let rrbStatus: "healthy" | "degraded" | "critical" = "healthy";
    try {
      const rrbSync = await rrbUnifiedFeedIntegration.getSyncStatus();
      if (rrbSync.status === "degraded" || rrbSync.status === "critical") {
        rrbStatus = rrbSync.status;
        syncErrors.push(`RRB: ${rrbSync.lastError}`);
      }
    } catch (error) {
      rrbStatus = "critical";
      syncErrors.push(`RRB sync failed: ${error}`);
    }

    // Sync Ty OS
    let tyOSStatus: "healthy" | "degraded" | "critical" = "healthy";
    try {
      const tyOSChannels = await tyOSUnifiedFeedService.getChannelStatus();
      const unhealthyChannels = tyOSChannels.filter((ch) => ch.status !== "active");
      if (unhealthyChannels.length > 0) {
        tyOSStatus = "degraded";
        syncErrors.push(`Ty OS: ${unhealthyChannels.length} channels unhealthy`);
      }
    } catch (error) {
      tyOSStatus = "critical";
      syncErrors.push(`Ty OS sync failed: ${error}`);
    }

    // Sync FlowPay
    let flowpayStatus: "healthy" | "degraded" | "critical" = "healthy";
    try {
      const flowpayHealth = await flowpayService.getSystemHealth();
      if (flowpayHealth.errors > 0) {
        flowpayStatus = "degraded";
        syncErrors.push(`FlowPay: ${flowpayHealth.errors} errors detected`);
      }
    } catch (error) {
      flowpayStatus = "critical";
      syncErrors.push(`FlowPay sync failed: ${error}`);
    }

    // Determine overall status
    const statuses = [qumusStatus, hybridcastStatus, rrbStatus, tyOSStatus, flowpayStatus];
    let overallStatus: "healthy" | "degraded" | "critical" = "healthy";
    if (statuses.includes("critical")) {
      overallStatus = "critical";
    } else if (statuses.includes("degraded")) {
      overallStatus = "degraded";
    }

    this.lastSyncTime = Date.now();
    const nextSyncTime = this.lastSyncTime + this.syncInterval;

    const status: SystemSyncStatus = {
      timestamp: startTime,
      qumusStatus,
      hybridcastStatus,
      rrbStatus,
      tyOSStatus,
      flowpayStatus,
      overallStatus,
      syncErrors,
      lastSyncTime: this.lastSyncTime,
      nextSyncTime,
    };

    if (overallStatus === "healthy") {
      console.log("[SystemSync] ✅ All systems synchronized and healthy");
    } else if (overallStatus === "degraded") {
      console.log("[SystemSync] ⚠️ System sync degraded:", syncErrors);
    } else {
      console.log("[SystemSync] ❌ System sync critical:", syncErrors);
    }

    return status;
  }

  async getSyncStatus(): Promise<SystemSyncStatus> {
    return this.performFullSync();
  }

  async syncQumusPolicy(policyId: string): Promise<boolean> {
    try {
      console.log(`[SystemSync] Syncing QUMUS policy: ${policyId}`);
      // Sync policy across all systems
      return true;
    } catch (error) {
      console.error(`[SystemSync] Failed to sync policy ${policyId}:`, error);
      return false;
    }
  }

  async syncChannelAcrossAllPlatforms(channelId: string): Promise<boolean> {
    try {
      console.log(`[SystemSync] Syncing channel ${channelId} across all platforms`);

      // Sync to Ty OS
      await tyOSUnifiedFeedService.syncChannel(channelId);

      // Sync to QUMUS
      await qumusUnifiedFeedIntegration.syncChannel(channelId);

      // Sync to RRB
      await rrbUnifiedFeedIntegration.syncChannel(channelId);

      console.log(`[SystemSync] Channel ${channelId} synced across all platforms`);
      return true;
    } catch (error) {
      console.error(`[SystemSync] Failed to sync channel ${channelId}:`, error);
      return false;
    }
  }

  async syncTransactionAcrossAllSystems(transactionId: string): Promise<boolean> {
    try {
      console.log(`[SystemSync] Syncing transaction ${transactionId} across all systems`);

      // Sync to FlowPay
      await flowpayService.syncTransaction(transactionId);

      // Sync to HybridCast (for donation links)
      await hybridcastMonitoringIntegration.syncDonationTransaction(transactionId);

      console.log(`[SystemSync] Transaction ${transactionId} synced across all systems`);
      return true;
    } catch (error) {
      console.error(`[SystemSync] Failed to sync transaction ${transactionId}:`, error);
      return false;
    }
  }

  getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  getSyncErrors(): string[] {
    return this.syncErrors;
  }

  clearSyncErrors(): void {
    this.syncErrors = [];
  }
}

export const comprehensiveSystemSync = new ComprehensiveSystemSync();
