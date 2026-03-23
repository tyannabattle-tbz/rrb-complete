import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { multiLanguageSupport } from '../services/multiLanguageSupport';

export const multiLanguageSupportRouter = router({
  /**
   * Get supported languages
   */
  getSupportedLanguages: publicProcedure.query(async () => {
    return multiLanguageSupport.getSupportedLanguages();
  }),

  /**
   * Translate content to target language
   */
  translateContent: publicProcedure
    .input(
      z.object({
        text: z.string(),
        sourceLanguage: z.string(),
        targetLanguage: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await multiLanguageSupport.translateContent(
        input.text,
        input.sourceLanguage,
        input.targetLanguage
      );
    }),

  /**
   * Generate multilingual subtitles
   */
  generateMultilingualSubtitles: publicProcedure
    .input(
      z.object({
        episodeId: z.string(),
        englishSubtitles: z.string(),
        targetLanguages: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await multiLanguageSupport.generateMultilingualSubtitles(
        input.episodeId,
        input.englishSubtitles,
        input.targetLanguages
      );
      return Object.fromEntries(result);
    }),

  /**
   * Generate localized metadata
   */
  generateLocalizedMetadata: publicProcedure
    .input(
      z.object({
        episodeId: z.string(),
        englishTitle: z.string(),
        englishDescription: z.string(),
        targetLanguages: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await multiLanguageSupport.generateLocalizedMetadata(
        input.episodeId,
        input.englishTitle,
        input.englishDescription,
        input.targetLanguages
      );
      return Object.fromEntries(result);
    }),

  /**
   * Detect language of text
   */
  detectLanguage: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      return await multiLanguageSupport.detectLanguage(input.text);
    }),

  /**
   * Generate accessible audio
   */
  generateAccessibleAudio: publicProcedure
    .input(
      z.object({
        episodeId: z.string(),
        text: z.string(),
        language: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await multiLanguageSupport.generateAccessibleAudio(
        input.episodeId,
        input.text,
        input.language
      );
    }),

  /**
   * Create localized episode
   */
  createLocalizedEpisode: publicProcedure
    .input(
      z.object({
        episodeId: z.string(),
        englishContent: z.object({
          title: z.string(),
          description: z.string(),
          transcription: z.string(),
          subtitles: z.string(),
          audioUrl: z.string(),
        }),
        targetLanguages: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await multiLanguageSupport.createLocalizedEpisode(
        input.episodeId,
        input.englishContent,
        input.targetLanguages
      );
      return Object.fromEntries(result);
    }),

  /**
   * Transcribe audio to text
   */
  transcribeAudio: publicProcedure
    .input(
      z.object({
        contentId: z.string(),
        audioUrl: z.string(),
        language: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await multiLanguageSupport.transcribeAudio(
        input.contentId,
        input.audioUrl,
        input.language
      );
    }),

  /**
   * Generate subtitles
   */
  generateSubtitles: publicProcedure
    .input(
      z.object({
        contentId: z.string(),
        transcription: z.string(),
        language: z.string(),
        format: z.enum(['vtt', 'srt', 'json']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await multiLanguageSupport.generateSubtitles(
        input.contentId,
        input.transcription,
        input.language,
        input.format as 'vtt' | 'srt' | 'json' | undefined
      );
    }),

  /**
   * Get accessibility features
   */
  getAccessibilityFeatures: publicProcedure
    .input(z.object({ language: z.string() }))
    .query(async ({ input }) => {
      return await multiLanguageSupport.getAccessibilityFeatures(input.language);
    }),

  /**
   * Get subtitle customization options
   */
  getSubtitleCustomization: publicProcedure.query(async () => {
    return await multiLanguageSupport.getSubtitleCustomization();
  }),

  /**
   * Get locale-specific formatting
   */
  getLocaleFormatting: publicProcedure
    .input(z.object({ language: z.string() }))
    .query(async ({ input }) => {
      return await multiLanguageSupport.getLocaleFormatting(input.language);
    }),
});
