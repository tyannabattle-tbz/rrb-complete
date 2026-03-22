/**
 * Podcast Features tRPC Router
 * Handles interactive podcast player, studio booking, and distribution
 */

import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { interactivePodcastPlayerService } from '../services/interactivePodcastPlayerService';
import { studioBookingService } from '../services/studioBookingService';
import { podcastDistributionService } from '../services/podcastDistributionService';

export const podcastFeaturesRouter = router({
  // Interactive Podcast Player procedures
  player: router({
    createPlayer: publicProcedure
      .input(
        z.object({
          episodeId: z.string(),
          title: z.string(),
          description: z.string(),
          audioUrl: z.string(),
          videoUrl: z.string().optional(),
          duration: z.number(),
          transcript: z.string(),
          aiAssistant: z.enum(['seraph', 'candy', 'none']),
          gameEnabled: z.boolean(),
          callInEnabled: z.boolean()
        })
      )
      .mutation(({ input }) => {
        return interactivePodcastPlayerService.createPlayerConfig({
          ...input,
          chapters: []
        });
      }),

    getPlayer: publicProcedure.input(z.object({ episodeId: z.string() })).query(({ input }) => {
      return interactivePodcastPlayerService.getPlayerConfig(input.episodeId);
    }),

    createGameScreen: publicProcedure
      .input(
        z.object({
          episodeId: z.string(),
          type: z.enum(['trivia', 'poll', 'quiz', 'interactive_story']),
          questionCount: z.number().default(5),
          mobileOptimized: z.boolean().default(true)
        })
      )
      .mutation(async ({ input }) => {
        const transcript = interactivePodcastPlayerService.getPlayerConfig(input.episodeId)
          ?.transcript;
        if (!transcript) throw new Error('Episode not found');

        const questions = await interactivePodcastPlayerService.generateTriviaQuestions(
          transcript,
          input.questionCount
        );

        const gameConfig = {
          type: input.type,
          questions: questions.map((q, i) => ({
            id: `q-${i}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 10
          })),
          duration: 300,
          mobileOptimized: input.mobileOptimized
        };

        return interactivePodcastPlayerService.createGameScreen(input.episodeId, gameConfig);
      }),

    getGameScreen: publicProcedure.input(z.object({ episodeId: z.string() })).query(({ input }) => {
      return interactivePodcastPlayerService.getGameScreen(input.episodeId);
    }),

    createCallIn: publicProcedure
      .input(
        z.object({
          episodeId: z.string(),
          callerName: z.string(),
          callerId: z.string()
        })
      )
      .mutation(({ input }) => {
        return interactivePodcastPlayerService.createCallInSession(
          input.episodeId,
          input.callerName,
          input.callerId
        );
      }),

    startCallIn: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return interactivePodcastPlayerService.startCallInSession(input.sessionId);
      }),

    endCallIn: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return interactivePodcastPlayerService.endCallInSession(input.sessionId);
      }),

    configureAI: publicProcedure
      .input(
        z.object({
          episodeId: z.string(),
          assistantType: z.enum(['seraph', 'candy'])
        })
      )
      .mutation(({ input }) => {
        return interactivePodcastPlayerService.configureAIAssistant(
          input.episodeId,
          input.assistantType
        );
      }),

    getPlayerAnalytics: publicProcedure
      .input(z.object({ episodeId: z.string() }))
      .query(({ input }) => {
        return interactivePodcastPlayerService.getPlayerAnalytics(input.episodeId);
      })
  }),

  // Studio Booking procedures
  booking: router({
    createReservation: publicProcedure
      .input(
        z.object({
          studioId: z.string(),
          studioName: z.string(),
          userId: z.string(),
          userName: z.string(),
          startTime: z.date(),
          endTime: z.date(),
          purpose: z.string(),
          equipment: z.array(z.string()).optional(),
          recordingEnabled: z.boolean().default(true)
        })
      )
      .mutation(({ input }) => {
        return studioBookingService.createReservation(
          input.studioId,
          input.studioName,
          input.userId,
          input.userName,
          input.startTime,
          input.endTime,
          input.purpose,
          input.equipment,
          input.recordingEnabled
        );
      }),

    confirmReservation: publicProcedure
      .input(z.object({ reservationId: z.string() }))
      .mutation(({ input }) => {
        return studioBookingService.confirmReservation(input.reservationId);
      }),

    startSession: publicProcedure
      .input(z.object({ reservationId: z.string() }))
      .mutation(({ input }) => {
        return studioBookingService.startSession(input.reservationId);
      }),

    endSession: publicProcedure
      .input(z.object({ reservationId: z.string() }))
      .mutation(({ input }) => {
        return studioBookingService.endSession(input.reservationId);
      }),

    getReservation: publicProcedure
      .input(z.object({ reservationId: z.string() }))
      .query(({ input }) => {
        return studioBookingService.getReservation(input.reservationId);
      }),

    getUserReservations: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(({ input }) => {
        return studioBookingService.getUserReservations(input.userId);
      }),

    getStudioAvailability: publicProcedure
      .input(
        z.object({
          studioId: z.string(),
          date: z.date()
        })
      )
      .query(({ input }) => {
        return studioBookingService.getStudioAvailability(input.studioId, input.date);
      }),

    startRecording: publicProcedure
      .input(
        z.object({
          reservationId: z.string(),
          studioId: z.string(),
          title: z.string(),
          artist: z.string(),
          genre: z.string()
        })
      )
      .mutation(({ input }) => {
        return studioBookingService.startRecording(
          input.reservationId,
          input.studioId,
          input.title,
          input.artist,
          input.genre
        );
      }),

    stopRecording: publicProcedure
      .input(z.object({ recordingId: z.string() }))
      .mutation(({ input }) => {
        return studioBookingService.stopRecording(input.recordingId);
      })
  }),

  // Podcast Distribution procedures
  distribution: router({
    registerEpisode: publicProcedure
      .input(
        z.object({
          episodeId: z.string(),
          title: z.string(),
          description: z.string(),
          audioUrl: z.string(),
          duration: z.number(),
          releaseDate: z.date(),
          author: z.string(),
          artwork: z.string(),
          transcript: z.string(),
          tags: z.array(z.string()),
          explicit: z.boolean().default(false)
        })
      )
      .mutation(({ input }) => {
        return podcastDistributionService.registerEpisode(input);
      }),

    publishToAllPlatforms: publicProcedure
      .input(z.object({ episodeId: z.string() }))
      .mutation(async ({ input }) => {
        return await podcastDistributionService.publishEpisodeToAllPlatforms(input.episodeId);
      }),

    getDistributionResults: publicProcedure
      .input(z.object({ episodeId: z.string() }))
      .query(({ input }) => {
        return podcastDistributionService.getDistributionResults(input.episodeId);
      }),

    getPlatformStatus: publicProcedure
      .input(z.object({ platformName: z.string() }))
      .query(({ input }) => {
        return podcastDistributionService.getPlatformStatus(input.platformName);
      }),

    getAllPlatforms: publicProcedure.query(() => {
      return podcastDistributionService.getAllPlatforms();
    }),

    enablePlatform: publicProcedure
      .input(z.object({ platformName: z.string() }))
      .mutation(({ input }) => {
        return podcastDistributionService.enablePlatform(input.platformName);
      }),

    disablePlatform: publicProcedure
      .input(z.object({ platformName: z.string() }))
      .mutation(({ input }) => {
        return podcastDistributionService.disablePlatform(input.platformName);
      }),

    getDistributionStats: publicProcedure.query(() => {
      return podcastDistributionService.getDistributionStats();
    })
  })
});
