import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { webrtcService } from '../services/webrtcService';
import { streamEncoderService } from '../services/streamEncoderService';
import { audienceQAService } from '../services/audienceQAService';

export const broadcastRouter = router({
  // WebRTC Procedures
  webrtc: router({
    createSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const session = await webrtcService.createSession(input.sessionId);
        return {
          id: session.id,
          sessionId: session.sessionId,
          stunServers: session.stunServers,
        };
      }),

    addPeer: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string(), panelistId: z.string() }))
      .mutation(async ({ input }) => {
        const peer = await webrtcService.addPeer(input.webrtcSessionId, input.panelistId);
        return {
          id: peer.id,
          panelistId: peer.panelistId,
          status: peer.status,
          videoEnabled: peer.videoEnabled,
          audioEnabled: peer.audioEnabled,
        };
      }),

    createOffer: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string(), peerId: z.string() }))
      .query(async ({ input }) => {
        const offer = await webrtcService.createOffer(input.webrtcSessionId, input.peerId);
        return { offer };
      }),

    handleAnswer: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string(), peerId: z.string(), answer: z.string() }))
      .mutation(async ({ input }) => {
        await webrtcService.handleAnswer(input.webrtcSessionId, input.peerId, input.answer);
        return { success: true };
      }),

    addIceCandidate: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string(), peerId: z.string(), candidate: z.string() }))
      .mutation(async ({ input }) => {
        await webrtcService.addIceCandidate(input.webrtcSessionId, input.peerId, input.candidate);
        return { success: true };
      }),

    updateStats: protectedProcedure
      .input(z.object({
        webrtcSessionId: z.string(),
        peerId: z.string(),
        bitrate: z.number(),
        latency: z.number(),
        packetLoss: z.number(),
      }))
      .mutation(async ({ input }) => {
        await webrtcService.updateStats(input.webrtcSessionId, input.peerId, {
          bitrate: input.bitrate,
          latency: input.latency,
          packetLoss: input.packetLoss,
        });
        return { success: true };
      }),

    toggleVideo: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string(), peerId: z.string() }))
      .mutation(async ({ input }) => {
        const enabled = await webrtcService.toggleVideo(input.webrtcSessionId, input.peerId);
        return { videoEnabled: enabled };
      }),

    toggleAudio: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string(), peerId: z.string() }))
      .mutation(async ({ input }) => {
        const enabled = await webrtcService.toggleAudio(input.webrtcSessionId, input.peerId);
        return { audioEnabled: enabled };
      }),

    getPeers: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string() }))
      .query(async ({ input }) => {
        const peers = await webrtcService.getPeers(input.webrtcSessionId);
        return peers.map(p => ({
          id: p.id,
          panelistId: p.panelistId,
          status: p.status,
          videoEnabled: p.videoEnabled,
          audioEnabled: p.audioEnabled,
          bitrate: p.bitrate,
          latency: p.latency,
          packetLoss: p.packetLoss,
        }));
      }),

    getPeerStats: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string(), peerId: z.string() }))
      .query(async ({ input }) => {
        return await webrtcService.getPeerStats(input.webrtcSessionId, input.peerId);
      }),

    closeSession: protectedProcedure
      .input(z.object({ webrtcSessionId: z.string() }))
      .mutation(async ({ input }) => {
        await webrtcService.closeSession(input.webrtcSessionId);
        return { success: true };
      }),
  }),

  // Stream Encoder Procedures
  encoder: router({
    createEncoder: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const encoder = await streamEncoderService.createEncoder(input.sessionId);
        return {
          id: encoder.id,
          sessionId: encoder.sessionId,
          status: encoder.status,
          outputResolution: encoder.outputResolution,
          outputBitrate: encoder.outputBitrate,
        };
      }),

    addVideoStream: protectedProcedure
      .input(z.object({
        encoderId: z.string(),
        panelistId: z.string(),
        resolution: z.string().optional(),
        bitrate: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const stream = await streamEncoderService.addVideoStream(
          input.encoderId,
          input.panelistId,
          input.resolution,
          input.bitrate
        );
        return {
          id: stream.id,
          panelistId: stream.panelistId,
          resolution: stream.resolution,
          bitrate: stream.bitrate,
        };
      }),

    configureOutput: protectedProcedure
      .input(z.object({
        encoderId: z.string(),
        resolution: z.string().optional(),
        bitrate: z.number().optional(),
        frameRate: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await streamEncoderService.configureOutput(input.encoderId, {
          resolution: input.resolution,
          bitrate: input.bitrate,
          frameRate: input.frameRate,
        });
        return { success: true };
      }),

    startEncoding: protectedProcedure
      .input(z.object({ encoderId: z.string() }))
      .mutation(async ({ input }) => {
        await streamEncoderService.startEncoding(input.encoderId);
        return { success: true };
      }),

    startRTMPStream: protectedProcedure
      .input(z.object({ encoderId: z.string(), rtmpUrl: z.string() }))
      .mutation(async ({ input }) => {
        const result = await streamEncoderService.startRTMPStream(input.encoderId, input.rtmpUrl);
        return result;
      }),

    startHLSStream: protectedProcedure
      .input(z.object({ encoderId: z.string() }))
      .mutation(async ({ input }) => {
        const result = await streamEncoderService.startHLSStream(input.encoderId);
        return result;
      }),

    pauseEncoding: protectedProcedure
      .input(z.object({ encoderId: z.string() }))
      .mutation(async ({ input }) => {
        await streamEncoderService.pauseEncoding(input.encoderId);
        return { success: true };
      }),

    resumeEncoding: protectedProcedure
      .input(z.object({ encoderId: z.string() }))
      .mutation(async ({ input }) => {
        await streamEncoderService.resumeEncoding(input.encoderId);
        return { success: true };
      }),

    stopEncoding: protectedProcedure
      .input(z.object({ encoderId: z.string() }))
      .mutation(async ({ input }) => {
        await streamEncoderService.stopEncoding(input.encoderId);
        return { success: true };
      }),

    getStatus: protectedProcedure
      .input(z.object({ encoderId: z.string() }))
      .query(async ({ input }) => {
        return await streamEncoderService.getStatus(input.encoderId);
      }),

    getMetrics: protectedProcedure
      .input(z.object({ encoderId: z.string() }))
      .query(async ({ input }) => {
        return await streamEncoderService.getMetrics(input.encoderId);
      }),

    updateAdaptiveBitrate: protectedProcedure
      .input(z.object({
        encoderId: z.string(),
        networkCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
      }))
      .mutation(async ({ input }) => {
        const bitrate = await streamEncoderService.updateAdaptiveBitrate(
          input.encoderId,
          input.networkCondition
        );
        return { bitrate };
      }),
  }),

  // Audience Q&A Procedures
  qa: router({
    createQASession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const session = await audienceQAService.createQASession(input.sessionId);
        return {
          id: session.id,
          sessionId: session.sessionId,
          status: session.status,
        };
      }),

    submitQuestion: publicProcedure
      .input(z.object({
        qaSessionId: z.string(),
        viewerId: z.string(),
        viewerName: z.string(),
        question: z.string(),
      }))
      .mutation(async ({ input }) => {
        const question = await audienceQAService.submitQuestion(
          input.qaSessionId,
          input.viewerId,
          input.viewerName,
          input.question
        );
        return {
          id: question.id,
          viewerName: question.viewerName,
          question: question.question,
          votes: question.votes,
          status: question.status,
        };
      }),

    upvoteQuestion: publicProcedure
      .input(z.object({ qaSessionId: z.string(), questionId: z.string() }))
      .mutation(async ({ input }) => {
        const votes = await audienceQAService.upvoteQuestion(input.qaSessionId, input.questionId);
        return { votes };
      }),

    approveQuestion: protectedProcedure
      .input(z.object({ qaSessionId: z.string(), questionId: z.string() }))
      .mutation(async ({ input }) => {
        await audienceQAService.approveQuestion(input.qaSessionId, input.questionId);
        return { success: true };
      }),

    rejectQuestion: protectedProcedure
      .input(z.object({ qaSessionId: z.string(), questionId: z.string() }))
      .mutation(async ({ input }) => {
        await audienceQAService.rejectQuestion(input.qaSessionId, input.questionId);
        return { success: true };
      }),

    getNextQuestion: protectedProcedure
      .input(z.object({ qaSessionId: z.string() }))
      .query(async ({ input }) => {
        const question = await audienceQAService.getNextQuestion(input.qaSessionId);
        return question ? {
          id: question.id,
          viewerName: question.viewerName,
          question: question.question,
          votes: question.votes,
        } : null;
      }),

    answerQuestion: protectedProcedure
      .input(z.object({
        qaSessionId: z.string(),
        questionId: z.string(),
        answer: z.string(),
        answeredBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        await audienceQAService.answerQuestion(
          input.qaSessionId,
          input.questionId,
          input.answer,
          input.answeredBy
        );
        return { success: true };
      }),

    getPendingQuestions: protectedProcedure
      .input(z.object({ qaSessionId: z.string() }))
      .query(async ({ input }) => {
        const questions = await audienceQAService.getPendingQuestions(input.qaSessionId);
        return questions.map(q => ({
          id: q.id,
          viewerName: q.viewerName,
          question: q.question,
          votes: q.votes,
          priority: q.priority,
        }));
      }),

    getApprovedQuestions: publicProcedure
      .input(z.object({ qaSessionId: z.string() }))
      .query(async ({ input }) => {
        const questions = await audienceQAService.getApprovedQuestions(input.qaSessionId);
        return questions.map(q => ({
          id: q.id,
          viewerName: q.viewerName,
          question: q.question,
        }));
      }),

    getAnsweredQuestions: publicProcedure
      .input(z.object({ qaSessionId: z.string() }))
      .query(async ({ input }) => {
        const questions = await audienceQAService.getAnsweredQuestions(input.qaSessionId);
        return questions.map(q => ({
          id: q.id,
          viewerName: q.viewerName,
          question: q.question,
          answer: q.answer,
          answeredBy: q.answeredBy,
        }));
      }),

    getStats: publicProcedure
      .input(z.object({ qaSessionId: z.string() }))
      .query(async ({ input }) => {
        return await audienceQAService.getStats(input.qaSessionId);
      }),

    closeQASession: protectedProcedure
      .input(z.object({ qaSessionId: z.string() }))
      .mutation(async ({ input }) => {
        await audienceQAService.closeQASession(input.qaSessionId);
        return { success: true };
      }),
  }),
});
