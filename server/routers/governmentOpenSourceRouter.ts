import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { createOpenSourceLLM, DEFAULT_OLLAMA_CONFIG } from '../openSourceLLMService';
import { autonomousAgentService, AgentRole } from '../autonomousAgentService';
import { governmentSecurityService } from '../governmentSecurityService';

export const governmentOpenSourceRouter = router({
  // LLM Operations
  llm: router({
    // Chat with open source LLM
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string(),
        })),
        provider: z.enum(['ollama', 'localai']).optional(),
        model: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const config = {
          ...DEFAULT_OLLAMA_CONFIG,
          provider: (input.provider || 'ollama') as any,
          model: input.model || DEFAULT_OLLAMA_CONFIG.model,
        };

        const llm = createOpenSourceLLM(config);
        return await llm.chat(input.messages);
      }),

    // Stream chat response
    chatStream: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const llm = createOpenSourceLLM(DEFAULT_OLLAMA_CONFIG);
        const chunks: string[] = [];

        for await (const chunk of llm.chatStream(input.messages)) {
          chunks.push(chunk);
        }

        return { response: chunks.join('') };
      }),

    // Generate embeddings
    embed: protectedProcedure
      .input(z.object({
        text: z.string(),
      }))
      .mutation(async ({ input }) => {
        const llm = createOpenSourceLLM(DEFAULT_OLLAMA_CONFIG);
        const embedding = await llm.embed(input.text);
        return { embedding };
      }),

    // List available models
    listModels: protectedProcedure
      .query(async () => {
        const llm = createOpenSourceLLM(DEFAULT_OLLAMA_CONFIG);
        const models = await llm.listModels();
        return { models };
      }),

    // Health check
    healthCheck: protectedProcedure
      .query(async () => {
        const llm = createOpenSourceLLM(DEFAULT_OLLAMA_CONFIG);
        const healthy = await llm.healthCheck();
        return { healthy };
      }),
  }),

  // Autonomous Agent Operations
  agents: router({
    // Register new agent
    register: protectedProcedure
      .input(z.object({
        name: z.string(),
        role: z.object({
          name: z.string(),
          description: z.string(),
          responsibilities: z.array(z.string()),
          autonomyLevel: z.number().min(0).max(100),
          approvalRequired: z.boolean(),
        }),
      }))
      .mutation(({ input }) => {
        const role: AgentRole = {
          id: input.role.name.toLowerCase().replace(/\s+/g, '-'),
          ...input.role,
        };
        return autonomousAgentService.registerAgent(input.name, role);
      }),

    // Get all agents
    list: protectedProcedure
      .query(() => {
        return autonomousAgentService.getAllAgents();
      }),

    // Get agent details
    get: protectedProcedure
      .input(z.object({ agentId: z.string() }))
      .query(({ input }) => {
        return autonomousAgentService.getAgent(input.agentId);
      }),

    // Create task for agent
    createTask: protectedProcedure
      .input(z.object({
        agentId: z.string(),
        title: z.string(),
        description: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      }))
      .mutation(({ input }) => {
        return autonomousAgentService.createTask(
          input.agentId,
          input.title,
          input.description,
          input.priority
        );
      }),

    // Get agent tasks
    getTasks: protectedProcedure
      .input(z.object({ agentId: z.string() }))
      .query(({ input }) => {
        return autonomousAgentService.getAgentTasks(input.agentId);
      }),

    // Get system metrics
    getMetrics: protectedProcedure
      .query(() => {
        return autonomousAgentService.getSystemMetrics();
      }),

    // Get audit trail
    getAuditTrail: protectedProcedure
      .input(z.object({ agentId: z.string().optional() }))
      .query(({ input }) => {
        return autonomousAgentService.getAuditTrail(input.agentId);
      }),
  }),

  // Decision Management
  decisions: router({
    // Record decision
    record: protectedProcedure
      .input(z.object({
        agentId: z.string(),
        taskId: z.string(),
        decision: z.string(),
        reasoning: z.string(),
        confidence: z.number().min(0).max(1),
      }))
      .mutation(({ input }) => {
        return autonomousAgentService.recordDecision(
          input.agentId,
          input.taskId,
          input.decision,
          input.reasoning,
          input.confidence
        );
      }),

    // Approve decision
    approve: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
      }))
      .mutation(({ input, ctx }) => {
        return autonomousAgentService.approveDecision(input.decisionId, ctx.user?.id || 'system');
      }),

    // Reject decision
    reject: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
      }))
      .mutation(({ input, ctx }) => {
        return autonomousAgentService.rejectDecision(input.decisionId, ctx.user?.id || 'system');
      }),

    // Get pending decisions
    getPending: protectedProcedure
      .query(() => {
        return autonomousAgentService.getPendingDecisions();
      }),
  }),

  // Security Operations
  security: router({
    // Encrypt data
    encrypt: protectedProcedure
      .input(z.object({
        data: z.string(),
      }))
      .mutation(({ input }) => {
        return governmentSecurityService.encrypt(input.data);
      }),

    // Decrypt data
    decrypt: protectedProcedure
      .input(z.object({
        ciphertext: z.string(),
        iv: z.string(),
        authTag: z.string(),
      }))
      .mutation(({ input }) => {
        const decrypted = governmentSecurityService.decrypt({
          ciphertext: input.ciphertext,
          iv: input.iv,
          authTag: input.authTag,
          algorithm: 'aes-256-gcm',
        });
        return { data: decrypted };
      }),

    // Hash data
    hash: protectedProcedure
      .input(z.object({
        data: z.string(),
      }))
      .mutation(({ input }) => {
        return { hash: governmentSecurityService.hash(input.data) };
      }),

    // Generate secure token
    generateToken: protectedProcedure
      .mutation(() => {
        return { token: governmentSecurityService.generateSecureToken() };
      }),

    // Log audit event
    logAudit: protectedProcedure
      .input(z.object({
        action: z.string(),
        resource: z.string(),
        status: z.enum(['success', 'failure']),
        details: z.record(z.any()).optional(),
      }))
      .mutation(({ input, ctx }) => {
        return governmentSecurityService.logAudit(
          ctx.user?.id || 'system',
          input.action,
          input.resource,
          input.status,
          input.details
        );
      }),

    // Get audit logs
    getAuditLogs: protectedProcedure
      .input(z.object({
        userId: z.string().optional(),
        action: z.string().optional(),
        status: z.enum(['success', 'failure']).optional(),
      }))
      .query(({ input }) => {
        return governmentSecurityService.getAuditLogs({
          userId: input.userId,
          action: input.action,
          status: input.status,
        });
      }),

    // Get security report
    getReport: protectedProcedure
      .query(() => {
        return governmentSecurityService.generateSecurityReport();
      }),

    // Validate FIPS compliance
    validateFIPS: protectedProcedure
      .query(() => {
        return governmentSecurityService.validateFIPSCompliance();
      }),
  }),
});
