import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { executeAgentStep, executeTool, type AgentExecutionContext } from "./agentService";
import { TRPCError } from "@trpc/server";

export const agentExecutionRouter = router({
  // Execute a single agent step
  executeStep: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      userMessage: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session = await db.getAgentSession(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      try {
        // Add user message
        await db.addMessage(input.sessionId, "user", input.userMessage);

        // Get conversation history
        const messages = await db.getSessionMessages(input.sessionId, 20);

        // Build execution context
        const context: AgentExecutionContext = {
          sessionId: input.sessionId,
          userId: session.userId,
          systemPrompt: session.systemPrompt || "You are a helpful AI assistant.",
          temperature: session.temperature || 70,
          model: session.model || "gpt-4-turbo",
          maxSteps: session.maxSteps || 50,
        };

        // Convert messages to format expected by agent
        const formattedMessages = messages.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));

        // Execute agent step
        const stepResponse = await executeAgentStep(context, formattedMessages);

        // Add assistant response
        await db.addMessage(input.sessionId, "assistant", stepResponse.content);

        // Update session status
        await db.updateAgentSession(input.sessionId, {
          status: stepResponse.status === "error" ? "error" : "idle",
        });

        // Execute any tool calls
        const toolResults = [];
        for (const toolCall of stepResponse.toolCalls) {
          // Create execution record
          const executionId = await db.createToolExecution(
            input.sessionId,
            toolCall.toolName,
            JSON.stringify(toolCall.parameters)
          );

          // Execute tool
          const result = await executeTool(toolCall.toolName, toolCall.parameters);
          toolResults.push(result);

          // Update execution record
          await db.updateToolExecution(1, {
            status: result.success ? "completed" : "failed",
            result: result.result ? JSON.stringify(result.result) : undefined,
            error: result.error,
            duration: result.duration,
          });
        }

        return {
          success: true,
          response: stepResponse.content,
          toolCalls: stepResponse.toolCalls.length,
          toolResults,
        };
      } catch (error) {
        console.error("Agent execution failed:", error);
        await db.updateAgentSession(input.sessionId, { status: "error" });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Agent execution failed",
        });
      }
    }),

  // Get agent status
  getStatus: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const session = await db.getAgentSession(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      const recentMessages = await db.getSessionMessages(input.sessionId, 5);
      const recentTools = await db.getSessionToolExecutions(input.sessionId);

      return {
        sessionId: input.sessionId,
        status: session.status,
        model: session.model,
        temperature: session.temperature,
        lastActivity: session.updatedAt,
        messageCount: recentMessages.length,
        toolExecutions: recentTools.length,
      };
    }),

  // Stream agent execution (for real-time updates)
  streamExecution: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      userMessage: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session = await db.getAgentSession(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      try {
        // Add user message
        await db.addMessage(input.sessionId, "user", input.userMessage);

        // Update session status to reasoning
        await db.updateAgentSession(input.sessionId, { status: "reasoning" });

        // Get conversation history
        const messages = await db.getSessionMessages(input.sessionId, 20);

        // Build execution context
        const context: AgentExecutionContext = {
          sessionId: input.sessionId,
          userId: session.userId,
          systemPrompt: session.systemPrompt || "You are a helpful AI assistant.",
          temperature: session.temperature || 70,
          model: session.model || "gpt-4-turbo",
          maxSteps: session.maxSteps || 50,
        };

        // Convert messages to format expected by agent
        const formattedMessages = messages.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));

        // Execute agent step
        const stepResponse = await executeAgentStep(context, formattedMessages);

        // Add assistant response
        await db.addMessage(input.sessionId, "assistant", stepResponse.content);

        // Update session status to executing if tools will be used
        if (stepResponse.toolCalls.length > 0) {
          await db.updateAgentSession(input.sessionId, { status: "executing" });
        }

        // Execute any tool calls
        for (const toolCall of stepResponse.toolCalls) {
          // Create execution record
          const executionResult = await db.createToolExecution(
            input.sessionId,
            toolCall.toolName,
            JSON.stringify(toolCall.parameters)
          );

          // Execute tool
          const result = await executeTool(toolCall.toolName, toolCall.parameters);

          // Update execution record
          await db.updateToolExecution(1, {
            status: result.success ? "completed" : "failed",
            result: result.result ? JSON.stringify(result.result) : undefined,
            error: result.error,
            duration: result.duration,
          });
        }

        // Update session status to completed
        await db.updateAgentSession(input.sessionId, { status: "completed" });

        return {
          success: true,
          response: stepResponse.content,
          toolCalls: stepResponse.toolCalls,
          status: "completed",
        };
      } catch (error) {
        console.error("Stream execution failed:", error);
        await db.updateAgentSession(input.sessionId, { status: "error" });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Execution failed",
        });
      }
    }),
});
