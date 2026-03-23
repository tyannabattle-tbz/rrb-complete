/**
 * Real-Time Metrics Router
 * Provides live system metrics from QUMUS ecosystem
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  getSystemMetrics,
  getChannelMetrics,
  getListenerMetrics,
  getRevenueMetrics,
  updateMetricsCache,
} from '../services/realtimeMetricsService';

export const realtimeMetricsRouter = router({
  /**
   * Get current system metrics
   */
  getSystemMetrics: publicProcedure.query(async () => {
    try {
      return await getSystemMetrics();
    } catch (error) {
      console.error('Error getting system metrics:', error);
      throw error;
    }
  }),

  /**
   * Get channel metrics
   */
  getChannelMetrics: publicProcedure.query(async () => {
    try {
      return await getChannelMetrics();
    } catch (error) {
      console.error('Error getting channel metrics:', error);
      throw error;
    }
  }),

  /**
   * Get listener metrics
   */
  getListenerMetrics: publicProcedure.query(async () => {
    try {
      return await getListenerMetrics();
    } catch (error) {
      console.error('Error getting listener metrics:', error);
      throw error;
    }
  }),

  /**
   * Get revenue metrics
   */
  getRevenueMetrics: publicProcedure.query(async () => {
    try {
      return await getRevenueMetrics();
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      throw error;
    }
  }),

  /**
   * Get all metrics (system, channels, listeners, revenue)
   */
  getAllMetrics: publicProcedure.query(async () => {
    try {
      const [system, channels, listeners, revenue] = await Promise.all([
        getSystemMetrics(),
        getChannelMetrics(),
        getListenerMetrics(),
        getRevenueMetrics(),
      ]);

      return {
        system,
        channels,
        listeners,
        revenue,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error getting all metrics:', error);
      throw error;
    }
  }),

  /**
   * Get metrics dashboard data (admin only)
   */
  getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const metrics = await updateMetricsCache();
      return metrics;
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }),

  /**
   * Get specific channel metrics
   */
  getChannelDetail: publicProcedure
    .input(z.object({ channelId: z.number() }))
    .query(async ({ input }) => {
      try {
        const channels = await getChannelMetrics();
        const channel = channels.find(ch => ch.id === input.channelId);
        
        if (!channel) {
          throw new Error('Channel not found');
        }

        return channel;
      } catch (error) {
        console.error('Error getting channel detail:', error);
        throw error;
      }
    }),

  /**
   * Get listener geographic distribution
   */
  getListenerGeography: publicProcedure.query(async () => {
    try {
      const metrics = await getListenerMetrics();
      return metrics.geographicDistribution;
    } catch (error) {
      console.error('Error getting listener geography:', error);
      throw error;
    }
  }),

  /**
   * Get listener device types
   */
  getListenerDevices: publicProcedure.query(async () => {
    try {
      const metrics = await getListenerMetrics();
      return metrics.deviceTypes;
    } catch (error) {
      console.error('Error getting listener devices:', error);
      throw error;
    }
  }),

  /**
   * Get top channels by listeners
   */
  getTopChannels: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const channels = await getChannelMetrics();
        return channels
          .sort((a, b) => b.currentListeners - a.currentListeners)
          .slice(0, input.limit);
      } catch (error) {
        console.error('Error getting top channels:', error);
        throw error;
      }
    }),

  /**
   * Get top channels by revenue
   */
  getTopRevenueChannels: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const revenue = await getRevenueMetrics();
        return revenue.topChannels.slice(0, input.limit);
      } catch (error) {
        console.error('Error getting top revenue channels:', error);
        throw error;
      }
    }),

  /**
   * Get top creators by revenue
   */
  getTopCreators: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const revenue = await getRevenueMetrics();
        return revenue.topCreators.slice(0, input.limit);
      } catch (error) {
        console.error('Error getting top creators:', error);
        throw error;
      }
    }),

  /**
   * Get system health status
   */
  getSystemHealth: publicProcedure.query(async () => {
    try {
      const metrics = await getSystemMetrics();
      
      return {
        status: metrics.systemUptime >= 99.9 ? 'healthy' : 'degraded',
        uptime: metrics.systemUptime,
        autonomyLevel: metrics.autonomyLevel,
        activeChannels: metrics.activeChannels,
        activeUsers: metrics.activeUsers,
        totalListeners: metrics.totalListeners,
        timestamp: metrics.timestamp,
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  }),
});
