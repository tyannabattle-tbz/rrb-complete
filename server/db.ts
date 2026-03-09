import { eq, desc, and, count, sum, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  agentSessions,
  messages,
  toolExecutions,
  apiKeys,
  taskHistory,
  memoryStore,
  webhookEndpoints,
  webhookLogs,
  emailConfigs,
  scheduledReports,
  reportHistory,
  performanceMetrics,
  apiUsage,
  quotas,
  plugins,
  trainingData,
  agentSnapshots,
  integrationLogs,
  featureFlags,
  systemMetrics,
  systemAlerts,
  auditLogs,
  webhookTemplates,
  webhookInstallations,
  webhookMarketplaceReviews,
  finetuningDatasets,
  finetuningJobs,
  finetuningModels,
  finetuningEvaluations,
  modelComparisons,
  sessionVersions,
  autoSaveSettings,
  filterPresets,
  filterHistory,
  notifications,
  notificationPreferences,
  escalationPolicies,
  notificationEvents,
  type SystemMetric,
  type SystemAlert,
  type AuditLog,
  type AgentSession,
  type Message,
  type ToolExecution,
  type TaskHistory,
  type MemoryStore,
  type WebhookEndpoint,
  type WebhookLog,
  type EmailConfig,
  type ScheduledReport,
  type ReportHistory,
  type PerformanceMetric,
  type ApiUsage,
  type Quota,
  type Plugin,
  type TrainingData,
  type AgentSnapshot,
  type IntegrationLog,
  type FeatureFlag,
  emailSubscribers,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Agent Session queries
export async function createAgentSession(userId: number, sessionName: string, config: Partial<AgentSession> = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(agentSessions).values({
      userId,
      sessionName,
      systemPrompt: config.systemPrompt,
      temperature: config.temperature ?? 70,
      model: config.model ?? "gpt-4-turbo",
      maxSteps: config.maxSteps ?? 50,
    });
    
    // Get the inserted session
    const sessions = await db.select().from(agentSessions).where(
      eq(agentSessions.userId, userId)
    ).orderBy(desc(agentSessions.createdAt)).limit(1);
    
    if (!sessions[0]) {
      throw new Error("Failed to create session: Session not found after insert");
    }
    
    return sessions[0].id;
  } catch (error) {
    console.error("[DB] Error creating agent session:", error);
    throw error;
  }
}

export async function getAgentSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(agentSessions).where(eq(agentSessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(agentSessions)
    .where(eq(agentSessions.userId, userId))
    .orderBy(desc(agentSessions.createdAt));
}

export async function updateAgentSession(sessionId: number, updates: Partial<AgentSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(agentSessions).set(updates).where(eq(agentSessions.id, sessionId));
}

// Message queries
export async function addMessage(sessionId: number, role: "user" | "assistant" | "system", content: string, metadata?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(messages).values({
    sessionId,
    role,
    content,
    metadata,
  });
}

export async function getSessionMessages(sessionId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

// Tool Execution queries
export async function createToolExecution(sessionId: number, toolName: string, parameters?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(toolExecutions).values({
    sessionId,
    toolName,
    parameters,
    status: "pending",
  });
}

export async function updateToolExecution(executionId: number, updates: Partial<ToolExecution>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(toolExecutions).set(updates).where(eq(toolExecutions.id, executionId));
}

export async function getSessionToolExecutions(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(toolExecutions)
    .where(eq(toolExecutions.sessionId, sessionId))
    .orderBy(desc(toolExecutions.createdAt));
}

// API Key queries
export async function saveApiKey(userId: number, provider: string, keyName: string, encryptedKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(apiKeys).values({
    userId,
    provider,
    keyName,
    encryptedKey,
  });
}

export async function getUserApiKeys(userId: number, provider?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (provider) {
    return db.select().from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)));
  }
  
  return db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
}

export async function deleteApiKey(keyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(apiKeys).where(eq(apiKeys.id, keyId));
}

// Task History queries
export async function createTask(sessionId: number, taskDescription: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(taskHistory).values({
    sessionId,
    taskDescription,
    status: "pending",
  });
}

export async function updateTask(taskId: number, updates: Partial<TaskHistory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(taskHistory).set(updates).where(eq(taskHistory.id, taskId));
}

export async function getSessionTasks(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(taskHistory)
    .where(eq(taskHistory.sessionId, sessionId))
    .orderBy(desc(taskHistory.createdAt));
}

// Memory Store queries
export async function storeMemory(sessionId: number, key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if key exists
  const existing = await db.select().from(memoryStore)
    .where(and(eq(memoryStore.sessionId, sessionId), eq(memoryStore.key, key)))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    return db.update(memoryStore)
      .set({ value })
      .where(and(eq(memoryStore.sessionId, sessionId), eq(memoryStore.key, key)));
  } else {
    // Insert new
    return db.insert(memoryStore).values({
      sessionId,
      key,
      value,
    });
  }
}

export async function retrieveMemory(sessionId: number, key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(memoryStore)
    .where(and(eq(memoryStore.sessionId, sessionId), eq(memoryStore.key, key)))
    .limit(1);
  
  return result.length > 0 ? result[0].value : null;
}

export async function getSessionMemory(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(memoryStore)
    .where(eq(memoryStore.sessionId, sessionId))
    .orderBy(desc(memoryStore.updatedAt));
}

export async function deleteMemory(sessionId: number, key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(memoryStore)
    .where(and(eq(memoryStore.sessionId, sessionId), eq(memoryStore.key, key)));
}


// ============================================================================
// WEBHOOK FUNCTIONS
// ============================================================================

export async function createWebhook(
  userId: number,
  url: string,
  events: string[],
  secret: string,
  retryCount: number = 3
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(webhookEndpoints).values({
    userId,
    url,
    events: JSON.stringify(events),
    secret,
    retryCount,
    isActive: true,
  });

  return (result as any).insertId;
}

export async function getActiveWebhooks(userId: number): Promise<WebhookEndpoint[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(webhookEndpoints)
    .where(and(eq(webhookEndpoints.userId, userId), eq(webhookEndpoints.isActive, true)));
}

export async function deleteWebhook(webhookId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, webhookId));
}

export async function updateWebhook(
  webhookId: number,
  updates: {
    url?: string;
    events?: string[];
    isActive?: boolean;
    retryCount?: number;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};
  if (updates.url) updateData.url = updates.url;
  if (updates.events) updateData.events = JSON.stringify(updates.events);
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
  if (updates.retryCount !== undefined) updateData.retryCount = updates.retryCount;

  await db.update(webhookEndpoints).set(updateData).where(eq(webhookEndpoints.id, webhookId));
}

export async function addWebhookLog(
  webhookId: number,
  eventType: string,
  payload: string,
  statusCode: number | null,
  response: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(webhookLogs).values({
    webhookId,
    eventType,
    payload,
    statusCode,
    response,
  });
}

export async function getWebhookLogs(webhookId: number, limit: number = 50): Promise<WebhookLog[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(webhookLogs)
    .where(eq(webhookLogs.webhookId, webhookId))
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);
}

// ============================================================================
// EMAIL & REPORTING FUNCTIONS
// ============================================================================

export async function createEmailConfig(
  userId: number,
  provider: "sendgrid" | "mailgun" | "smtp",
  apiKey: string,
  fromEmail: string,
  fromName?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailConfigs).values({
    userId,
    provider,
    apiKey,
    fromEmail,
    fromName,
    isActive: true,
  });

  return (result as any).insertId;
}

export async function getEmailConfig(userId: number): Promise<EmailConfig | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const configs = await db.select().from(emailConfigs)
    .where(and(eq(emailConfigs.userId, userId), eq(emailConfigs.isActive, true)))
    .limit(1);

  return configs[0];
}

export async function createScheduledReport(
  userId: number,
  name: string,
  reportType: "weekly" | "monthly" | "daily" | "custom",
  schedule: string,
  recipients: string[],
  includeMetrics: string[]
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scheduledReports).values({
    userId,
    name,
    reportType,
    schedule,
    recipients: JSON.stringify(recipients),
    includeMetrics,
    isActive: true,
    nextRun: new Date(),
  });

  return (result as any).insertId;
}

export async function getScheduledReports(userId: number): Promise<ScheduledReport[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(scheduledReports)
    .where(and(eq(scheduledReports.userId, userId), eq(scheduledReports.isActive, true)));
}

export async function addReportHistory(
  reportId: number,
  status: "pending" | "generating" | "sent" | "failed",
  sentTo?: string[],
  error?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reportHistory).values({
    reportId,
    status,
    sentTo: sentTo ? JSON.stringify(sentTo) : null,
    error,
    generatedAt: new Date(),
  });

  return (result as any).insertId;
}

// ============================================================================
// PERFORMANCE METRICS FUNCTIONS
// ============================================================================

export async function recordMetric(
  userId: number,
  metricType: string,
  value: number,
  unit?: string,
  sessionId?: number,
  metadata?: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(performanceMetrics).values({
    userId,
    sessionId,
    metricType,
    value: value.toString(),
    unit,
    metadata,
  });
}

export async function recordApiUsage(
  userId: number,
  requestCount: number,
  tokenCount: number,
  errorCount: number,
  totalDuration: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.select().from(apiUsage)
    .where(and(eq(apiUsage.userId, userId), eq(apiUsage.date, today)))
    .limit(1);

  if (existing.length > 0) {
    // Update existing record
    await db.update(apiUsage).set({
      requestCount: (existing[0].requestCount || 0) + requestCount,
      tokenCount: (existing[0].tokenCount || 0) + tokenCount,
      errorCount: (existing[0].errorCount || 0) + errorCount,
      totalDuration: (existing[0].totalDuration || 0) + totalDuration,
    }).where(eq(apiUsage.id, existing[0].id));
  } else {
    // Create new record
    await db.insert(apiUsage).values({
      userId,
      date: today,
      requestCount,
      tokenCount,
      errorCount,
      totalDuration,
    });
  }
}

export async function getApiUsage(userId: number, days: number = 30): Promise<ApiUsage[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db.select().from(apiUsage)
    .where(and(eq(apiUsage.userId, userId)))
    .orderBy(desc(apiUsage.date));
}

export async function getOrCreateQuota(userId: number): Promise<Quota> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(quotas)
    .where(eq(quotas.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create default quota
  const resetDate = new Date();
  resetDate.setDate(resetDate.getDate() + 1);

  const result = await db.insert(quotas).values({
    userId,
    requestsPerDay: 10000,
    tokensPerDay: 1000000,
    concurrentSessions: 10,
    storageGB: "100",
    resetDate,
  });

  return db.select().from(quotas)
    .where(eq(quotas.userId, userId))
    .limit(1)
    .then(rows => rows[0]);
}

// ============================================================================
// PLUGIN & EXTENSION FUNCTIONS
// ============================================================================

export async function createPlugin(
  userId: number,
  name: string,
  type: "tool" | "integration" | "middleware" | "custom",
  code: string,
  config?: Record<string, any>
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(plugins).values({
    userId,
    name,
    type,
    code,
    config,
    isActive: true,
  });

  return (result as any).insertId;
}

export async function getActivePlugins(userId: number): Promise<Plugin[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(plugins)
    .where(and(eq(plugins.userId, userId), eq(plugins.isActive, true)));
}

// ============================================================================
// TRAINING DATA & SNAPSHOTS
// ============================================================================

export async function addTrainingData(
  userId: number,
  input: string,
  output: string,
  quality?: "excellent" | "good" | "fair" | "poor",
  tags?: string[],
  sessionId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trainingData).values({
    userId,
    sessionId,
    input,
    output,
    quality,
    tags: tags ? JSON.stringify(tags) : null,
  });

  return (result as any).insertId;
}

export async function createSnapshot(
  userId: number,
  sessionId: number,
  name: string,
  config: Record<string, any>,
  memory?: string,
  description?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentSnapshots).values({
    userId,
    sessionId,
    name,
    description,
    config,
    memory,
  });

  return (result as any).insertId;
}

export async function getSnapshots(sessionId: number): Promise<AgentSnapshot[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(agentSnapshots)
    .where(eq(agentSnapshots.sessionId, sessionId))
    .orderBy(desc(agentSnapshots.createdAt));
}

// ============================================================================
// INTEGRATION & FEATURE FLAG FUNCTIONS
// ============================================================================

export async function addIntegrationLog(
  userId: number,
  serviceName: string,
  action: string,
  status: "success" | "failure" | "pending",
  request?: string,
  response?: string,
  error?: string,
  duration?: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(integrationLogs).values({
    userId,
    serviceName,
    action,
    status,
    request,
    response,
    error,
    duration,
  });
}

export async function getFeatureFlag(userId: number, flagName: string): Promise<FeatureFlag | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const flags = await db.select().from(featureFlags)
    .where(and(eq(featureFlags.userId, userId), eq(featureFlags.flagName, flagName)))
    .limit(1);

  return flags[0];
}

export async function setFeatureFlag(
  userId: number,
  flagName: string,
  isEnabled: boolean,
  rolloutPercentage?: number,
  config?: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(featureFlags)
    .where(and(eq(featureFlags.userId, userId), eq(featureFlags.flagName, flagName)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(featureFlags).set({
      isEnabled,
      rolloutPercentage,
      config,
    }).where(eq(featureFlags.id, existing[0].id));
  } else {
    await db.insert(featureFlags).values({
      userId,
      flagName,
      isEnabled,
      rolloutPercentage,
      config,
    });
  }
}


// ============================================================================
// ADMIN DASHBOARD FUNCTIONS
// ============================================================================

export async function recordSystemMetric(metrics: Partial<SystemMetric>): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database.insert(systemMetrics).values({
    timestamp: new Date(),
    activeUsers: metrics.activeUsers || 0,
    totalSessions: metrics.totalSessions || 0,
    totalRequests: metrics.totalRequests || 0,
    totalTokens: metrics.totalTokens || 0,
    averageResponseTime: metrics.averageResponseTime?.toString() || "0",
    errorRate: metrics.errorRate?.toString() || "0",
    cpuUsage: metrics.cpuUsage?.toString() || "0",
    memoryUsage: metrics.memoryUsage?.toString() || "0",
    storageUsage: metrics.storageUsage?.toString() || "0",
  });
}

export async function getLatestSystemMetric(): Promise<SystemMetric | undefined> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select()
    .from(systemMetrics)
    .orderBy(desc(systemMetrics.timestamp))
    .limit(1);

  return result[0];
}

export async function getSystemMetricsHistory(hours: number = 24): Promise<SystemMetric[]> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  return database
    .select()
    .from(systemMetrics)
    .where(gte(systemMetrics.timestamp, startTime))
    .orderBy(desc(systemMetrics.timestamp));
}

export async function createSystemAlert(
  severity: "critical" | "warning" | "info",
  title: string,
  description?: string
): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.insert(systemAlerts).values({
    severity,
    title,
    description,
    status: "active",
  });

  return result[0].insertId;
}

export async function getSystemAlerts(status?: "active" | "acknowledged" | "resolved"): Promise<SystemAlert[]> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  let query = database.select().from(systemAlerts);

  if (status) {
    query = query.where(eq(systemAlerts.status, status)) as any;
  }

  return (query.orderBy(desc(systemAlerts.createdAt)) as any)
}

export async function getActiveSystemAlerts(): Promise<SystemAlert[]> {
  return getSystemAlerts("active");
}

export async function acknowledgeSystemAlert(alertId: number, userId: number): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database
    .update(systemAlerts)
    .set({
      status: "acknowledged",
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    })
    .where(eq(systemAlerts.id, alertId));
}

export async function resolveSystemAlert(alertId: number): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database
    .update(systemAlerts)
    .set({
      status: "resolved",
      resolvedAt: new Date(),
    })
    .where(eq(systemAlerts.id, alertId));
}

export async function createAuditLog(data: {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  status?: "success" | "failure";
}): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database.insert(auditLogs).values({
    userId: data.userId,
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId,
    changes: data.changes,
    status: data.status || "success",
  });
}

export async function getAuditLogs(filters?: {
  userId?: number;
  action?: string;
  resource?: string;
  status?: "success" | "failure";
  startDate?: Date;
  endDate?: Date;
}): Promise<AuditLog[]> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const conditions = [];
  if (filters?.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }
  if (filters?.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }
  if (filters?.resource) {
    conditions.push(eq(auditLogs.resource, filters.resource));
  }
  if (filters?.status) {
    conditions.push(eq(auditLogs.status, filters.status));
  }

  let query = database.select().from(auditLogs);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return (query.orderBy(desc(auditLogs.createdAt)) as any);
}

export async function getTotalUserCount(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.select({ count: count() }).from(users);
  return result[0]?.count || 0;
}

export async function getActiveUserCount(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await database
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastSignedIn, sevenDaysAgo));

  return result[0]?.count || 0;
}

export async function getNewUsersThisMonth(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const result = await database
    .select({ count: count() })
    .from(users)
    .where(gte(users.createdAt, firstOfMonth));

  return result[0]?.count || 0;
}

export async function getTopUsersByActivity() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select({
      userId: users.id,
      userName: users.name,
      sessionCount: count(agentSessions.id),
    })
    .from(users)
    .leftJoin(agentSessions, eq(users.id, agentSessions.userId))
    .groupBy(users.id)
    .orderBy(desc(count(agentSessions.id)))
    .limit(10);
}

export async function getTotalApiRequests(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.select({ total: sum(apiUsage.requestCount) }).from(apiUsage);

  return result[0]?.total ? parseInt(result[0].total.toString()) : 0;
}

export async function getTotalTokensUsed(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.select({ total: sum(apiUsage.tokenCount) }).from(apiUsage);

  return result[0]?.total ? parseInt(result[0].total.toString()) : 0;
}

export async function getRequestsPerMinute(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const result = await database
    .select({ count: count() })
    .from(toolExecutions)
    .where(gte(toolExecutions.createdAt, oneMinuteAgo));

  return result[0]?.count || 0;
}

export async function getTopApiEndpoints() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select({
      toolName: toolExecutions.toolName,
      count: count(toolExecutions.id),
    })
    .from(toolExecutions)
    .groupBy(toolExecutions.toolName)
    .orderBy(desc(count(toolExecutions.id)))
    .limit(10);
}

export async function getApiErrorRate(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const total = await database.select({ count: count() }).from(toolExecutions);
  const failed = await database
    .select({ count: count() })
    .from(toolExecutions)
    .where(eq(toolExecutions.status, "failed"));

  const totalCount = total[0]?.count || 0;
  const failedCount = failed[0]?.count || 0;

  return totalCount > 0 ? (failedCount / totalCount) * 100 : 0;
}


// ============================================================================
// WEBHOOK MARKETPLACE FUNCTIONS
// ============================================================================

export async function getPublicWebhookTemplates() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(webhookTemplates)
    .where(eq(webhookTemplates.isPublic, true))
    .orderBy(desc(webhookTemplates.downloads));
}

export async function getWebhookTemplate(templateId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select()
    .from(webhookTemplates)
    .where(eq(webhookTemplates.id, templateId));

  return result[0];
}

export async function getAllWebhookInstallations() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.select().from(webhookInstallations);
}

export async function createWebhookInstallation(
  userId: number,
  templateId: number,
  name: string,
  config: Record<string, any>
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.insert(webhookInstallations).values({
    userId,
    templateId,
    name,
    config,
    isActive: true,
  });

  return result[0].insertId;
}

export async function getWebhookInstallation(installationId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select()
    .from(webhookInstallations)
    .where(eq(webhookInstallations.id, installationId));

  return result[0];
}

export async function getUserWebhookInstallations(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(webhookInstallations)
    .where(eq(webhookInstallations.userId, userId));
}

export async function updateWebhookInstallation(installationId: number, config: Record<string, any>) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database
    .update(webhookInstallations)
    .set({ config, updatedAt: new Date() })
    .where(eq(webhookInstallations.id, installationId));
}

export async function deleteWebhookInstallation(installationId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database.delete(webhookInstallations).where(eq(webhookInstallations.id, installationId));
}

export async function incrementTemplateDownloads(templateId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const template = await getWebhookTemplate(templateId);
  if (template) {
    await database
      .update(webhookTemplates)
      .set({ downloads: (template.downloads || 0) + 1 })
      .where(eq(webhookTemplates.id, templateId));
  }
}

export async function createWebhookMarketplaceReview(
  templateId: number,
  userId: number,
  rating: number,
  review?: string
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database.insert(webhookMarketplaceReviews).values({
    templateId,
    userId,
    rating,
    review,
  });
}

export async function getTemplateReviews(templateId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(webhookMarketplaceReviews)
    .where(eq(webhookMarketplaceReviews.templateId, templateId));
}

export async function getTemplateInstallations(templateId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(webhookInstallations)
    .where(eq(webhookInstallations.templateId, templateId));
}

export async function updateTemplateRating(templateId: number, rating: number, reviewCount: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database
    .update(webhookTemplates)
    .set({ rating: rating.toString(), reviews: reviewCount })
    .where(eq(webhookTemplates.id, templateId));
}

export async function createWebhookTemplate(data: any) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.insert(webhookTemplates).values({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return result[0].insertId;
}

export async function updateTemplatePublicStatus(templateId: number, isPublic: boolean) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database
    .update(webhookTemplates)
    .set({ isPublic, updatedAt: new Date() })
    .where(eq(webhookTemplates.id, templateId));
}

// ============================================================================
// MODEL FINE-TUNING FUNCTIONS
// ============================================================================

export async function createFinetuningDataset(
  userId: number,
  name: string,
  description?: string,
  dataCount: number = 0
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.insert(finetuningDatasets).values({
    userId,
    name,
    description,
    dataCount,
    status: "draft",
    quality: "good",
  });

  return result[0].insertId;
}

export async function getFinetuningDataset(datasetId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select()
    .from(finetuningDatasets)
    .where(eq(finetuningDatasets.id, datasetId));

  return result[0];
}

export async function getUserFinetuningDatasets(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(finetuningDatasets)
    .where(eq(finetuningDatasets.userId, userId))
    .orderBy(desc(finetuningDatasets.createdAt));
}

export async function updateFinetuningDataset(datasetId: number, updates: Partial<any>) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database
    .update(finetuningDatasets)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(finetuningDatasets.id, datasetId));
}

export async function createFinetuningJob(
  userId: number,
  datasetId: number,
  modelName: string,
  baseModel: string,
  epochs: number = 3,
  batchSize: number = 32,
  learningRate: string = "0.0001"
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.insert(finetuningJobs).values({
    userId,
    datasetId,
    modelName,
    baseModel,
    status: "pending",
    epochs,
    batchSize,
    learningRate,
  });

  return result[0].insertId;
}

export async function getFinetuningJob(jobId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select()
    .from(finetuningJobs)
    .where(eq(finetuningJobs.id, jobId));

  return result[0];
}

export async function getUserFinetuningJobs(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(finetuningJobs)
    .where(eq(finetuningJobs.userId, userId))
    .orderBy(desc(finetuningJobs.createdAt));
}

export async function updateFinetuningJob(jobId: number, updates: Partial<any>) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database
    .update(finetuningJobs)
    .set(updates)
    .where(eq(finetuningJobs.id, jobId));
}

export async function createFinetuningModel(
  userId: number,
  jobId: number,
  name: string,
  baseModel: string,
  modelPath: string,
  metrics?: Record<string, any>
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.insert(finetuningModels).values({
    userId,
    jobId,
    name,
    baseModel,
    modelPath,
    status: "active",
  });

  return result[0].insertId;
}

export async function getFinetuningModel(modelId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select()
    .from(finetuningModels)
    .where(eq(finetuningModels.id, modelId));

  return result[0];
}

export async function getUserFinetuningModels(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(finetuningModels)
    .where(eq(finetuningModels.userId, userId))
    .orderBy(desc(finetuningModels.createdAt));
}

export async function createFinetuningEvaluation(
  jobId: number,
  modelId: number,
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    testDataSize?: number;
    confusionMatrix?: number[][];
    classReport?: Record<string, any>;
  }
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.insert(finetuningEvaluations).values({
    jobId,
    modelId,
    accuracy: metrics.accuracy.toString(),
    precision: metrics.precision.toString(),
    recall: metrics.recall.toString(),
    f1Score: metrics.f1Score.toString(),
    testDataSize: metrics.testDataSize,
    confusionMatrix: metrics.confusionMatrix,
    classReport: metrics.classReport,
  });

  return result[0].insertId;
}

export async function getModelEvaluations(modelId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(finetuningEvaluations)
    .where(eq(finetuningEvaluations.modelId, modelId));
}

export async function createModelComparison(
  userId: number,
  baselineModelId: number,
  candidateModelId: number,
  baselineMetrics: Record<string, any>,
  candidateMetrics: Record<string, any>
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const improvement = calculateImprovement(baselineMetrics, candidateMetrics);

  const result = await database.insert(modelComparisons).values({
    userId,
    baselineModelId,
    candidateModelId,
    baselineMetrics,
    candidateMetrics,
    improvement: improvement.toString(),
    recommendation: improvement > 5 ? "use_candidate" : improvement < -5 ? "use_baseline" : "inconclusive",
  });

  return result[0].insertId;
}

export async function getModelComparisons(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database
    .select()
    .from(modelComparisons)
    .where(eq(modelComparisons.userId, userId))
    .orderBy(desc(modelComparisons.comparedAt));
}

function calculateImprovement(baseline: Record<string, any>, candidate: Record<string, any>): number {
  const baselineF1 = baseline.f1Score || 0;
  const candidateF1 = candidate.f1Score || 0;
  return ((candidateF1 - baselineF1) / baselineF1) * 100;
}


// Video Generation Helper
export async function generateVideoFromDescription(params: {
  description: string;
  duration: number;
  style: string;
  resolution: string;
  fps: number;
  aspectRatio: string;
}) {
  try {
    // Import the mock video service
    const { mockVideoService } = await import('./_core/mockVideoService');
    
    // Generate video using the mock service
    const result = await mockVideoService.generateVideo({
      prompt: params.description,
      duration: params.duration,
      style: params.style,
      resolution: (params.resolution as '720p' | '1080p' | '4k') || '1080p',
    });

    if (result.status === 'completed') {
      return {
        success: true,
        videoId: result.videoId,
        videoUrl: result.url,
        duration: result.duration,
        resolution: (result.resolution as '720p' | '1080p' | '4k') || '1080p',
        status: result.status,
      };
    } else {
      return {
        success: false,
        error: 'Video generation failed',
      };
    }
  } catch (error) {
    console.error('[Video Generation] Error:', error);
    return {
      success: false,
      error: String(error),
    };
  }
}


// ─── Email Subscriber Helpers ───
export async function subscribeEmail(email: string, name?: string, source?: string, language?: string) {
  const db = await getDb();
  try {
    await db.insert(emailSubscribers).values({
      email: email.toLowerCase().trim(),
      name: name || null,
      source: source || 'flyer',
      language: language || 'en',
    });
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return { success: true, message: 'Already subscribed' };
    }
    throw error;
  }
}

export async function getSubscriberCount() {
  const db = await getDb();
  const result = await db.select({ count: count() }).from(emailSubscribers).where(eq(emailSubscribers.isActive, true));
  return result[0]?.count || 0;
}


// ─── Agent Session Aliases (used by routers.ts agent section) ───
export async function getAgentSessionsByUserId(userId: number) {
  return getUserSessions(userId);
}

export async function getAgentSessionById(sessionId: number) {
  return getAgentSession(sessionId);
}

export async function deleteAgentSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(agentSessions).where(eq(agentSessions.id, sessionId));
}
