/**
 * Ecosystem Command Executor
 * Routes and executes commands to all ecosystem entities
 */

import { getDb } from "../db";
import { ecosystemCommands, ecosystemStatus } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export type EcosystemTarget = "rrb" | "hybridcast" | "canryn" | "sweet_miracles";

export interface CommandInput {
  target: EcosystemTarget;
  action: string;
  params: Record<string, any>;
  priority?: number;
  userId: number;
}

export interface CommandExecution {
  id: string;
  target: EcosystemTarget;
  action: string;
  status: "queued" | "executing" | "completed" | "failed";
  result?: any;
  error?: string;
}

class EcosystemExecutor {
  private commandQueue: string[] = [];
  private executingCommands = new Map<string, boolean>();

  /**
   * Submit ecosystem command
   */
  async submitCommand(input: CommandInput): Promise<string> {
    const commandId = uuidv4();
    const now = new Date();

    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Create command record
      await db.insert(ecosystemCommands).values({
        id: commandId,
        userId: input.userId,
        target: input.target,
        action: input.action,
        params: JSON.stringify(input.params),
        priority: input.priority || 5,
        status: "queued",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      // Add to queue
      this.commandQueue.push(commandId);

      // Start processing
      this.processQueue();

      return commandId;
    } catch (error) {
      console.error("[EcosystemExecutor] Error submitting command:", error);
      throw error;
    }
  }

  /**
   * Get command status
   */
  async getCommandStatus(commandId: string): Promise<CommandExecution | null> {
    try {
      const db = await getDb();
      if (!db) return null;
      
      const cmd = await db
        .select()
        .from(ecosystemCommands)
        .where(eq(ecosystemCommands.id, commandId))
        .limit(1);

      if (!cmd || cmd.length === 0) return null;

      const c = cmd[0];
      return {
        id: c.id,
        target: c.target as EcosystemTarget,
        action: c.action,
        status: c.status as any,
        result: c.result ? JSON.parse(c.result as string) : undefined,
        error: c.error || undefined,
      };
    } catch (error) {
      console.error("[EcosystemExecutor] Error getting command status:", error);
      return null;
    }
  }

  /**
   * Get ecosystem entity status
   */
  async getEntityStatus(target: EcosystemTarget) {
    try {
      const db = await getDb();
      if (!db) return null;
      
      const status = await db
        .select()
        .from(ecosystemStatus)
        .where(eq(ecosystemStatus.entity, target))
        .limit(1);

      if (status && status.length > 0) {
        return {
          entity: status[0].entity,
          status: status[0].status,
          lastHeartbeat: status[0].lastHeartbeat,
          commandsProcessed: status[0].commandsProcessed,
          failureRate: status[0].failureRate,
        };
      }

      // Initialize if not exists
      await db.insert(ecosystemStatus).values({
        entity: target,
        status: "online",
        commandsProcessed: 0,
        failureRate: 0,
        updatedAt: new Date().toISOString(),
      });

      return {
        entity: target,
        status: "online",
        commandsProcessed: 0,
        failureRate: 0,
      };
    } catch (error) {
      console.error("[EcosystemExecutor] Error getting entity status:", error);
      return null;
    }
  }

  /**
   * Get all ecosystem statuses
   */
  async getAllEntityStatuses() {
    try {
      const db = await getDb();
      if (!db) return [];
      
      const targets: EcosystemTarget[] = ["rrb", "hybridcast", "canryn", "sweet_miracles"];
      const statuses = [];

      for (const target of targets) {
        const status = await this.getEntityStatus(target);
        if (status) statuses.push(status);
      }

      return statuses;
    } catch (error) {
      console.error("[EcosystemExecutor] Error getting all entity statuses:", error);
      return [];
    }
  }

  /**
   * Process command queue
   */
  private async processQueue() {
    while (this.commandQueue.length > 0) {
      const commandId = this.commandQueue.shift();
      if (!commandId) break;

      if (this.executingCommands.get(commandId)) continue;

      this.executingCommands.set(commandId, true);
      await this.executeCommand(commandId);
      this.executingCommands.set(commandId, false);
    }
  }

  /**
   * Execute a command
   */
  private async executeCommand(commandId: string) {
    const startTime = Date.now();

    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Get command details
      const cmdResult = await db
        .select()
        .from(ecosystemCommands)
        .where(eq(ecosystemCommands.id, commandId))
        .limit(1);

      if (!cmdResult || cmdResult.length === 0) {
        throw new Error("Command not found");
      }

      const cmd = cmdResult[0];

      // Update command status to executing
      await db
        .update(ecosystemCommands)
        .set({
          status: "executing",
          executedAt: new Date().toISOString(),
        })
        .where(eq(ecosystemCommands.id, commandId));

      // Route to appropriate executor
      let result: any;
      switch (cmd.target) {
        case "rrb":
          result = await this.executeRRBCommand(cmd.action, JSON.parse(cmd.params as string));
          break;
        case "hybridcast":
          result = await this.executeHybridCastCommand(cmd.action, JSON.parse(cmd.params as string));
          break;
        case "canryn":
          result = await this.executeCanrynCommand(cmd.action, JSON.parse(cmd.params as string));
          break;
        case "sweet_miracles":
          result = await this.executeSweetMiraclesCommand(cmd.action, JSON.parse(cmd.params as string));
          break;
        default:
          throw new Error(`Unknown target: ${cmd.target}`);
      }

      // Mark command as completed
      const executionTime = Date.now() - startTime;
      await db
        .update(ecosystemCommands)
        .set({
          status: "completed",
          result: JSON.stringify(result),
          executionTime,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ecosystemCommands.id, commandId));

      // Update entity status
      await this.updateEntityStatus(cmd.target, true);

      console.log(`[EcosystemExecutor] Command ${commandId} completed in ${executionTime}ms`);
    } catch (error) {
      console.error(`[EcosystemExecutor] Command ${commandId} failed:`, error);

      const executionTime = Date.now() - startTime;
      await db
        .update(ecosystemCommands)
        .set({
          status: "failed",
          error: String(error),
          executionTime,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ecosystemCommands.id, commandId));

      // Update entity status
      const cmd = await db
        .select()
        .from(ecosystemCommands)
        .where(eq(ecosystemCommands.id, commandId))
        .limit(1);

      if (cmd && cmd.length > 0) {
        await this.updateEntityStatus(cmd[0].target as EcosystemTarget, false);
      }
    }
  }

  /**
   * Update entity status after command execution
   */
  private async updateEntityStatus(target: EcosystemTarget, success: boolean) {
    try {
      const db = await getDb();
      if (!db) return;
      
      const current = await db
        .select()
        .from(ecosystemStatus)
        .where(eq(ecosystemStatus.entity, target))
        .limit(1);

      if (current && current.length > 0) {
        const c = current[0];
        const total = (c.commandsProcessed || 0) + 1;
        const failures = success ? (c.commandsProcessed || 0) - Math.round(((c.failureRate || 0) / 100) * (c.commandsProcessed || 0)) : Math.round(((c.failureRate || 0) / 100) * (c.commandsProcessed || 0)) + 1;
        const failureRate = total > 0 ? (failures / total) * 100 : 0;

        await db
          .update(ecosystemStatus)
          .set({
            commandsProcessed: total,
            failureRate: Math.round(failureRate * 100) / 100,
            lastHeartbeat: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(ecosystemStatus.entity, target));
      }
    } catch (error) {
      console.error("[EcosystemExecutor] Error updating entity status:", error);
    }
  }

  /**
   * Execute RRB (Rockin Rockin Boogie) command
   */
  private async executeRRBCommand(action: string, params: Record<string, any>): Promise<any> {
    // Simulate RRB command execution
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    return {
      action,
      entity: "rrb",
      executed: true,
      params,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute HybridCast command
   */
  private async executeHybridCastCommand(action: string, params: Record<string, any>): Promise<any> {
    // Simulate HybridCast command execution
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    return {
      action,
      entity: "hybridcast",
      executed: true,
      params,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute Canryn command
   */
  private async executeCanrynCommand(action: string, params: Record<string, any>): Promise<any> {
    // Simulate Canryn command execution
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    return {
      action,
      entity: "canryn",
      executed: true,
      params,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute Sweet Miracles command
   */
  private async executeSweetMiraclesCommand(action: string, params: Record<string, any>): Promise<any> {
    // Simulate Sweet Miracles command execution
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    return {
      action,
      entity: "sweet_miracles",
      executed: true,
      params,
      timestamp: new Date().toISOString(),
    };
  }
}

export const ecosystemExecutor = new EcosystemExecutor();
