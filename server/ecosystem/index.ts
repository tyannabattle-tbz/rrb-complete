/**
 * Ecosystem Integration - Main Entry Point
 * Exports all ecosystem components for unified platform integration
 */

// Import functions needed for initialization
import { getEventBus } from "./event-bus";
import { getDataSyncEngine } from "./data-sync";
import { getQumusOrchestrator } from "./qumus-integration";
import { getWebhookSystem } from "./webhook-system";

// Event Bus
export {
  EcosystemEventBus,
  getEventBus,
  resetEventBus,
  type EcosystemEvent,
  type EventType,
  type EventHandler,
  type EventBusConfig,
} from "./event-bus";

// API Gateway
export {
  ApiGateway,
  createApiGateway,
  type ApiRequest,
  type ApiGatewayConfig,
} from "./api-gateway";

// Data Synchronization
export {
  DataSyncEngine,
  getDataSyncEngine,
  type SyncConfig,
  type SyncRecord,
  type SyncConflict,
} from "./data-sync";

// QUMUS Orchestration
export {
  QumusEcosystemOrchestrator,
  getQumusOrchestrator,
  type QumusDecision,
  type QumusPolicy,
} from "./qumus-integration";

// Webhook System
export {
  WebhookSystem,
  getWebhookSystem,
  type WebhookConfig,
  type WebhookRegistration,
  type WebhookDelivery,
} from "./webhook-system";

// Admin Dashboard
export { adminDashboardRouter, type AdminDashboardRouter } from "./admin-dashboard";

/**
 * Initialize entire ecosystem
 */
export async function initializeEcosystem(): Promise<void> {
  console.log("🚀 Initializing Unified Ecosystem...");

  try {
    // Initialize event bus
    const eventBus = getEventBus();
    console.log("✓ Event Bus initialized");

    // Initialize data sync engine
    const dataSync = getDataSyncEngine();
    console.log("✓ Data Sync Engine initialized");

    // Initialize QUMUS orchestrator
    const qumusOrchestrator = getQumusOrchestrator();
    console.log("✓ QUMUS Orchestrator initialized");

    // Initialize webhook system
    const webhookSystem = getWebhookSystem();
    console.log("✓ Webhook System initialized");

    console.log("✅ Unified Ecosystem initialized successfully");

    // Log ecosystem status
    const eventStats = await eventBus.getStats();
    const syncStats = dataSync.getStats();
    const qumusStats = qumusOrchestrator.getStats();
    const webhookStats = webhookSystem.getStats();

    console.log("\n📊 Ecosystem Status:");
    console.log(`  Event Bus: ${eventStats.handlerCount} handlers, ${eventStats.eventTypeCount} event types`);
    console.log(`  Data Sync: ${syncStats.recordCount} records, ${syncStats.queueSize} pending syncs`);
    console.log(`  QUMUS: ${qumusStats.policiesEnabled} policies enabled, ${qumusStats.humanReviewQueueSize} pending reviews`);
    console.log(`  Webhooks: ${webhookStats.totalWebhooks} webhooks, ${webhookStats.activeWebhooks} active`);
  } catch (error) {
    console.error("❌ Failed to initialize ecosystem:", error);
    throw error;
  }
}

/**
 * Shutdown entire ecosystem
 */
export async function shutdownEcosystem(): Promise<void> {
  console.log("🛑 Shutting down Unified Ecosystem...");

  try {
    const eventBus = getEventBus();
    await eventBus.shutdown();
    console.log("✓ Event Bus shutdown");

    console.log("✅ Unified Ecosystem shutdown complete");
  } catch (error) {
    console.error("❌ Error during ecosystem shutdown:", error);
  }
}

/**
 * Get comprehensive ecosystem status
 */
export async function getEcosystemStatus(): Promise<Record<string, any>> {
  const eventBus = getEventBus();
  const dataSync = getDataSyncEngine();
  const qumusOrchestrator = getQumusOrchestrator();
  const webhookSystem = getWebhookSystem();

  const eventStats = await eventBus.getStats();
  const syncStats = dataSync.getStats();
  const qumusStats = qumusOrchestrator.getStats();
  const webhookStats = webhookSystem.getStats();

  return {
    timestamp: new Date().toISOString(),
    eventBus: eventStats,
    dataSync: syncStats,
    qumus: qumusStats,
    webhooks: webhookStats,
    systemHealth: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    },
  };
}
