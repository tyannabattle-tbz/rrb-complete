import { router, publicProcedure } from "../_core/trpc";
import {
  fetchSomaFMChannels,
  getChannelListeners,
  getAllChannelListeners,
} from "../services/somaFmApi";

export const somaFmRouter = router({
  /**
   * Get all SomaFM channels with real listener counts
   */
  getAllChannels: publicProcedure.query(async () => {
    try {
      const channels = await fetchSomaFMChannels();
      return {
        success: true,
        channels,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching SomaFM channels:", error);
      return {
        success: false,
        channels: [],
        error: "Failed to fetch channels",
        timestamp: Date.now(),
      };
    }
  }),

  /**
   * Get listener count for a specific channel
   */
  getChannelListeners: publicProcedure
    .input((val: unknown) => {
      if (typeof val === "string") return val;
      throw new Error("Channel ID must be a string");
    })
    .query(async ({ input: channelId }) => {
      try {
        const listeners = await getChannelListeners(channelId);
        return {
          success: true,
          channelId,
          listeners,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error(`Error fetching listeners for ${channelId}:`, error);
        return {
          success: false,
          channelId,
          listeners: 0,
          error: "Failed to fetch listener count",
          timestamp: Date.now(),
        };
      }
    }),

  /**
   * Get all channels with their listener counts
   */
  getAllListeners: publicProcedure.query(async () => {
    try {
      const listeners = await getAllChannelListeners();
      return {
        success: true,
        listeners,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching all listeners:", error);
      return {
        success: false,
        listeners: {},
        error: "Failed to fetch listener counts",
        timestamp: Date.now(),
      };
    }
  }),
});
