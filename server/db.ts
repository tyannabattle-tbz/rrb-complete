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
  type AgentSession,
  type Message,
  type ToolExecution,
  type TaskHistory,
  type MemoryStore,
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
  
  return result;
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
