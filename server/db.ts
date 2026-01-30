import { eq, desc, and } from "drizzle-orm";
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
  
  return sessions[0]?.id || 0;
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
