import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { virtualPanelService } from '../services/virtualPanelService';

export const virtualPanelRouter = router({
  /**
   * Create a new panel session
   */
  createSession: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        startTime: z.date(),
        moderatorName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await virtualPanelService.createPanelSession(input);
    }),

  /**
   * Get panel session
   */
  getSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return await virtualPanelService.getSession(input.sessionId);
    }),

  /**
   * List all sessions
   */
  listSessions: publicProcedure.query(async () => {
    return await virtualPanelService.listSessions();
  }),

  /**
   * Add panelist to session
   */
  addPanelist: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await virtualPanelService.addPanelist(input.sessionId, input.name);
    }),

  /**
   * Get all panelists in session
   */
  getPanelists: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return await virtualPanelService.getPanelists(input.sessionId);
    }),

  /**
   * Remove panelist from session
   */
  removePanelist: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        panelistId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await virtualPanelService.removePanelist(input.sessionId, input.panelistId);
      return { success: true };
    }),

  /**
   * Toggle panelist mute
   */
  toggleMute: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        panelistId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const isMuted = await virtualPanelService.togglePanelistMute(
        input.sessionId,
        input.panelistId
      );
      return { isMuted };
    }),

  /**
   * Set active speaker
   */
  setSpeaker: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        panelistId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await virtualPanelService.setSpeaker(input.sessionId, input.panelistId);
      return { success: true };
    }),

  /**
   * Update panelist connection status
   */
  updatePanelistStatus: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        panelistId: z.string(),
        status: z.enum(['connected', 'connecting', 'disconnected']),
      })
    )
    .mutation(async ({ input }) => {
      await virtualPanelService.updatePanelistStatus(
        input.sessionId,
        input.panelistId,
        input.status
      );
      return { success: true };
    }),

  /**
   * Start session
   */
  startSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await virtualPanelService.startSession(input.sessionId);
      return { success: true };
    }),

  /**
   * Pause session
   */
  pauseSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await virtualPanelService.pauseSession(input.sessionId);
      return { success: true };
    }),

  /**
   * End session
   */
  endSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await virtualPanelService.endSession(input.sessionId);
      return { success: true };
    }),

  /**
   * Add stream output
   */
  addStreamOutput: publicProcedure
    .input(
      z.object({
        panelSessionId: z.string(),
        platform: z.enum(['un-wcs', 'custom', 'youtube', 'facebook']),
        streamUrl: z.string(),
        bitrate: z.number(),
        resolution: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await virtualPanelService.addStreamOutput(input);
    }),

  /**
   * Get stream outputs
   */
  getStreamOutputs: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return await virtualPanelService.getStreamOutputs(input.sessionId);
    }),

  /**
   * Update stream status
   */
  updateStreamStatus: publicProcedure
    .input(
      z.object({
        outputId: z.string(),
        status: z.enum(['active', 'inactive', 'error']),
      })
    )
    .mutation(async ({ input }) => {
      await virtualPanelService.updateStreamStatus(input.outputId, input.status);
      return { success: true };
    }),

  /**
   * Start recording
   */
  startRecording: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      return await virtualPanelService.recordSession(input.sessionId);
    }),

  /**
   * Stop recording
   */
  stopRecording: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      return await virtualPanelService.stopRecording(input.sessionId);
    }),

  /**
   * Get session statistics
   */
  getStats: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return await virtualPanelService.getSessionStats(input.sessionId);
    }),
});
