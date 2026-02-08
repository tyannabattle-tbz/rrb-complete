/**
 * Autonomous Agent Service
 * Provides orchestration for autonomous AI agents with government-grade oversight
 * Implements multi-agent collaboration, task execution, and decision tracking
 */

import { v4 as uuid } from 'uuid';

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  autonomyLevel: number; // 0-100: 0=manual, 100=fully autonomous
  approvalRequired: boolean;
}

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'awaiting_approval';
  priority: 'low' | 'medium' | 'high' | 'critical';
  autonomyLevel: number;
  result?: any;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  approvedBy?: string;
  approvedAt?: number;
}

export interface AgentDecision {
  id: string;
  agentId: string;
  taskId: string;
  decision: string;
  reasoning: string;
  confidence: number;
  autonomyLevel: number;
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  approvedBy?: string;
  approvedAt?: number;
  executedAt?: number;
  createdAt: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'idle' | 'executing' | 'waiting_approval' | 'error';
  currentTask?: AgentTask;
  tasks: AgentTask[];
  decisions: AgentDecision[];
  metrics: {
    tasksCompleted: number;
    tasksApproved: number;
    tasksRejected: number;
    averageExecutionTime: number;
    successRate: number;
  };
}

export class AutonomousAgentService {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private decisions: Map<string, AgentDecision> = new Map();
  private taskQueue: AgentTask[] = [];

  /**
   * Register a new agent
   */
  registerAgent(name: string, role: AgentRole): Agent {
    const agent: Agent = {
      id: uuid(),
      name,
      role,
      status: 'idle',
      tasks: [],
      decisions: [],
      metrics: {
        tasksCompleted: 0,
        tasksApproved: 0,
        tasksRejected: 0,
        averageExecutionTime: 0,
        successRate: 0,
      },
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  /**
   * Create a task for an agent
   */
  createTask(
    agentId: string,
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): AgentTask {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const task: AgentTask = {
      id: uuid(),
      agentId,
      title,
      description,
      status: 'pending',
      priority,
      autonomyLevel: agent.role.autonomyLevel,
      createdAt: Date.now(),
    };

    this.tasks.set(task.id, task);
    agent.tasks.push(task);
    this.taskQueue.push(task);

    return task;
  }

  /**
   * Record an agent decision
   */
  recordDecision(
    agentId: string,
    taskId: string,
    decision: string,
    reasoning: string,
    confidence: number
  ): AgentDecision {
    const agent = this.agents.get(agentId);
    const task = this.tasks.get(taskId);

    if (!agent || !task) {
      throw new Error('Agent or task not found');
    }

    const autonomyLevel = agent.role.autonomyLevel;
    const requiresApproval = autonomyLevel < 100 || task.priority === 'critical';

    const agentDecision: AgentDecision = {
      id: uuid(),
      agentId,
      taskId,
      decision,
      reasoning,
      confidence,
      autonomyLevel,
      requiresApproval,
      status: requiresApproval ? 'pending' : 'approved',
      createdAt: Date.now(),
    };

    this.decisions.set(agentDecision.id, agentDecision);
    agent.decisions.push(agentDecision);

    if (!requiresApproval) {
      agentDecision.status = 'approved';
      agentDecision.approvedAt = Date.now();
      this.executeDecision(agentDecision);
    }

    return agentDecision;
  }

  /**
   * Approve a decision
   */
  approveDecision(decisionId: string, approvedBy: string): AgentDecision {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    decision.status = 'approved';
    decision.approvedBy = approvedBy;
    decision.approvedAt = Date.now();

    this.executeDecision(decision);

    return decision;
  }

  /**
   * Reject a decision
   */
  rejectDecision(decisionId: string, approvedBy: string): AgentDecision {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    decision.status = 'rejected';
    decision.approvedBy = approvedBy;
    decision.approvedAt = Date.now();

    return decision;
  }

  /**
   * Execute a decision
   */
  private executeDecision(decision: AgentDecision): void {
    decision.status = 'executed';
    decision.executedAt = Date.now();

    const task = this.tasks.get(decision.taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = Date.now();
      task.result = decision.decision;
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent tasks
   */
  getAgentTasks(agentId: string): AgentTask[] {
    const agent = this.agents.get(agentId);
    return agent?.tasks || [];
  }

  /**
   * Get agent decisions
   */
  getAgentDecisions(agentId: string): AgentDecision[] {
    const agent = this.agents.get(agentId);
    return agent?.decisions || [];
  }

  /**
   * Get pending decisions
   */
  getPendingDecisions(): AgentDecision[] {
    return Array.from(this.decisions.values()).filter(d => d.status === 'pending');
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Update task status
   */
  updateTaskStatus(
    taskId: string,
    status: AgentTask['status'],
    result?: any,
    error?: string
  ): AgentTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = status;
    if (result) task.result = result;
    if (error) task.error = error;

    if (status === 'executing' && !task.startedAt) {
      task.startedAt = Date.now();
    } else if (status === 'completed' && !task.completedAt) {
      task.completedAt = Date.now();
    }

    return task;
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    pendingApprovals: number;
    averageAutonomy: number;
  } {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());
    const decisions = Array.from(this.decisions.values());

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status !== 'idle').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingApprovals: decisions.filter(d => d.status === 'pending').length,
      averageAutonomy: agents.length > 0
        ? agents.reduce((sum, a) => sum + a.role.autonomyLevel, 0) / agents.length
        : 0,
    };
  }

  /**
   * Get audit trail
   */
  getAuditTrail(agentId?: string): Array<{
    timestamp: number;
    type: string;
    agentId: string;
    taskId?: string;
    decisionId?: string;
    details: any;
  }> {
    const trail: any[] = [];

    if (agentId) {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.tasks.forEach(task => {
          trail.push({
            timestamp: task.createdAt,
            type: 'task_created',
            agentId,
            taskId: task.id,
            details: { title: task.title, priority: task.priority },
          });

          if (task.startedAt) {
            trail.push({
              timestamp: task.startedAt,
              type: 'task_started',
              agentId,
              taskId: task.id,
              details: {},
            });
          }

          if (task.completedAt) {
            trail.push({
              timestamp: task.completedAt,
              type: 'task_completed',
              agentId,
              taskId: task.id,
              details: { status: task.status },
            });
          }
        });

        agent.decisions.forEach(decision => {
          trail.push({
            timestamp: decision.createdAt,
            type: 'decision_created',
            agentId,
            decisionId: decision.id,
            taskId: decision.taskId,
            details: { decision: decision.decision, confidence: decision.confidence },
          });

          if (decision.approvedAt) {
            trail.push({
              timestamp: decision.approvedAt,
              type: `decision_${decision.status}`,
              agentId,
              decisionId: decision.id,
              taskId: decision.taskId,
              details: { approvedBy: decision.approvedBy },
            });
          }
        });
      }
    } else {
      // Return all audit trail
      this.agents.forEach((agent, id) => {
        agent.tasks.forEach(task => {
          trail.push({
            timestamp: task.createdAt,
            type: 'task_created',
            agentId: id,
            taskId: task.id,
            details: { title: task.title },
          });
        });

        agent.decisions.forEach(decision => {
          trail.push({
            timestamp: decision.createdAt,
            type: 'decision_created',
            agentId: id,
            decisionId: decision.id,
            details: { decision: decision.decision },
          });
        });
      });
    }

    return trail.sort((a, b) => a.timestamp - b.timestamp);
  }
}

// Export singleton instance
export const autonomousAgentService = new AutonomousAgentService();
