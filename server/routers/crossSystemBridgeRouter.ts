/**
 * Cross-System Bridge Router
 * Manages secure communication between RRB, Ty OS, and QUMUS systems
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  createCrossSystemRequest,
  getCrosSystemBridgeStatus,
  verifyRequestSignature,
  checkRateLimit,
  logCrosSystemCommunication,
} from '../middleware/crossSystemBridgeSecurity';

export const crossSystemBridgeRouter = router({
  /**
   * Send cross-system request
   */
  sendCrossSystemRequest: protectedProcedure
    .input(
      z.object({
        sourceSystem: z.enum(['rrb', 'tyos', 'qumus']),
        targetSystem: z.enum(['rrb', 'tyos', 'qumus']),
        action: z.string(),
        payload: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // Check rate limit
        if (!checkRateLimit(input.sourceSystem, input.targetSystem)) {
          throw new Error('Rate limit exceeded for this bridge');
        }

        // Create signed request
        const request = createCrossSystemRequest(
          input.sourceSystem,
          input.targetSystem,
          input.action,
          input.payload
        );

        // Log communication
        await logCrosSystemCommunication(
          input.sourceSystem,
          input.targetSystem,
          input.action,
          input.payload,
          true
        );

        return {
          success: true,
          request,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('Error sending cross-system request:', error);
        throw error;
      }
    }),

  /**
   * Verify cross-system request signature
   */
  verifyCrossSystemRequest: publicProcedure
    .input(
      z.object({
        sourceSystem: z.enum(['rrb', 'tyos', 'qumus']),
        payload: z.record(z.any()),
        signature: z.string(),
        timestamp: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const isValid = verifyRequestSignature(
          input.sourceSystem,
          input.payload,
          input.signature,
          input.timestamp
        );

        return {
          valid: isValid,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('Error verifying cross-system request:', error);
        throw error;
      }
    }),

  /**
   * Get cross-system bridge status
   */
  getBridgeStatus: publicProcedure.query(async () => {
    try {
      return await getCrosSystemBridgeStatus();
    } catch (error) {
      console.error('Error getting bridge status:', error);
      throw error;
    }
  }),

  /**
   * Get bridge health metrics
   */
  getBridgeHealthMetrics: publicProcedure.query(async () => {
    try {
      const status = await getCrosSystemBridgeStatus();

      const metrics = {
        overallStatus: status.status,
        operationalBridges: status.bridges.filter(b => b.status === 'operational').length,
        totalBridges: status.bridges.length,
        averageLatency: status.bridges.reduce((sum, b) => sum + b.latency, 0) / status.bridges.length,
        totalRequests: status.bridges.reduce((sum, b) => sum + b.requestCount, 0),
        bridges: status.bridges,
        timestamp: status.timestamp,
      };

      return metrics;
    } catch (error) {
      console.error('Error getting bridge health metrics:', error);
      throw error;
    }
  }),

  /**
   * Check specific bridge status
   */
  checkBridgeStatus: publicProcedure
    .input(
      z.object({
        sourceSystem: z.enum(['rrb', 'tyos', 'qumus']),
        targetSystem: z.enum(['rrb', 'tyos', 'qumus']),
      })
    )
    .query(async ({ input }) => {
      try {
        const status = await getCrosSystemBridgeStatus();
        const bridge = status.bridges.find(
          b => b.source === input.sourceSystem && b.target === input.targetSystem
        );

        if (!bridge) {
          throw new Error('Bridge not found');
        }

        return {
          ...bridge,
          operational: bridge.status === 'operational',
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('Error checking bridge status:', error);
        throw error;
      }
    }),

  /**
   * Get all bridge connections
   */
  getAllBridgeConnections: publicProcedure.query(async () => {
    try {
      const status = await getCrosSystemBridgeStatus();

      return {
        connections: status.bridges.map(bridge => ({
          id: `${bridge.source}-${bridge.target}`,
          source: bridge.source,
          target: bridge.target,
          status: bridge.status,
          latency: `${bridge.latency.toFixed(2)}ms`,
          requestsPerMinute: bridge.requestCount,
          operational: bridge.status === 'operational',
        })),
        summary: {
          totalConnections: status.bridges.length,
          operationalConnections: status.bridges.filter(b => b.status === 'operational').length,
          overallHealth: status.status,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error getting all bridge connections:', error);
      throw error;
    }
  }),

  /**
   * Get cross-system communication audit log
   */
  getAuditLog: protectedProcedure
    .input(
      z.object({
        sourceSystem: z.enum(['rrb', 'tyos', 'qumus']).optional(),
        targetSystem: z.enum(['rrb', 'tyos', 'qumus']).optional(),
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // TODO: Query audit log from database
        return {
          logs: [],
          total: 0,
          limit: input.limit,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('Error getting audit log:', error);
        throw error;
      }
    }),

  /**
   * Test bridge connectivity
   */
  testBridgeConnectivity: protectedProcedure
    .input(
      z.object({
        sourceSystem: z.enum(['rrb', 'tyos', 'qumus']),
        targetSystem: z.enum(['rrb', 'tyos', 'qumus']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        const startTime = Date.now();

        // Create test request
        const testRequest = createCrossSystemRequest(
          input.sourceSystem,
          input.targetSystem,
          'test_connectivity',
          { test: true }
        );

        const latency = Date.now() - startTime;

        // Log test
        await logCrosSystemCommunication(
          input.sourceSystem,
          input.targetSystem,
          'test_connectivity',
          { test: true },
          true
        );

        return {
          success: true,
          sourceSystem: input.sourceSystem,
          targetSystem: input.targetSystem,
          latency,
          request: testRequest,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('Error testing bridge connectivity:', error);
        throw error;
      }
    }),

  /**
   * Get system interconnection map
   */
  getInterconnectionMap: publicProcedure.query(async () => {
    try {
      const status = await getCrosSystemBridgeStatus();

      const systems = ['rrb', 'tyos', 'qumus'];
      const interconnectionMap: Record<string, Record<string, any>> = {};

      systems.forEach(system => {
        interconnectionMap[system] = {
          outgoing: status.bridges
            .filter(b => b.source === system)
            .map(b => ({
              target: b.target,
              status: b.status,
              latency: b.latency,
            })),
          incoming: status.bridges
            .filter(b => b.target === system)
            .map(b => ({
              source: b.source,
              status: b.status,
              latency: b.latency,
            })),
        };
      });

      return {
        interconnectionMap,
        overallStatus: status.status,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error getting interconnection map:', error);
      throw error;
    }
  }),
});
