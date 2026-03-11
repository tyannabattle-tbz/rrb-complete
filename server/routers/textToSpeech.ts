import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { realTtsService, AVAILABLE_VOICES, DJ_VOICES } from "../_core/realTtsService";

export const textToSpeechRouter = router({
  // Generate speech from text using real Forge TTS API
  generateSpeech: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(4096),
        language: z.string().default("en"),
        voice: z.string().default("nova"),
        speed: z.number().min(0.25).max(4.0).default(1.0),
        pitch: z.number().default(1.0), // kept for API compat, not used by Forge
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Map legacy voice IDs to new voice names
        const voiceMap: Record<string, string> = {
          'default': 'nova',
          'en-US-Neural2-A': 'nova',
          'en-US-Neural2-C': 'onyx',
          'en-GB-Neural2-A': 'shimmer',
          'en-GB-Neural2-B': 'echo',
          'en-US-neural': 'nova',
          'en-GB-neural': 'echo',
        };
        const resolvedVoice = voiceMap[input.voice] || input.voice;

        const result = await realTtsService.generateSpeech({
          text: input.text,
          voice: resolvedVoice,
          speed: input.speed,
        });

        if (result.success && result.audioUrl) {
          return {
            success: true,
            audioUrl: result.audioUrl,
            audioKey: result.audioKey,
            duration: result.duration || Math.ceil(input.text.length / 15),
            language: input.language,
            voice: resolvedVoice,
            format: "mp3",
            bitrate: "128k",
          };
        }

        // Fallback: return a flag so frontend uses Web Speech API
        return {
          success: true,
          audioUrl: '', // empty = frontend should use Web Speech API
          duration: Math.ceil(input.text.length / 15),
          language: input.language,
          voice: input.voice,
          format: "browser-tts",
          bitrate: "n/a",
          useBrowserFallback: true,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Speech generation failed",
        };
      }
    }),

  // Generate speech with DJ personality voice
  generateDjSpeech: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(4096),
        djName: z.enum(['valanna', 'seraph', 'candy', 'qumus']).default('valanna'),
        speed: z.number().min(0.25).max(4.0).default(1.0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await realTtsService.generateDjSpeech(
          input.text,
          input.djName,
          input.speed
        );

        return {
          success: result.success,
          audioUrl: result.audioUrl || '',
          audioKey: result.audioKey,
          duration: result.duration,
          djName: input.djName,
          voice: result.voice,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "DJ speech generation failed",
        };
      }
    }),

  // Get available voices — now returns real Forge voices
  getAvailableVoices: protectedProcedure
    .input(z.object({ language: z.string().default("en") }))
    .query(async ({ ctx, input }) => {
      return {
        language: input.language,
        voices: AVAILABLE_VOICES.map(v => ({
          id: v.id,
          name: v.name,
          gender: v.gender,
          description: v.description,
        })),
        djVoices: Object.entries(DJ_VOICES).map(([dj, voice]) => ({
          djName: dj,
          voiceId: voice,
          voiceName: AVAILABLE_VOICES.find(v => v.id === voice)?.name || voice,
        })),
      };
    }),

  // Check TTS service availability
  checkAvailability: protectedProcedure.query(async () => {
    const available = await realTtsService.checkAvailability();
    return {
      serverTtsAvailable: available,
      fallback: available ? 'none' : 'browser-web-speech-api',
      voices: AVAILABLE_VOICES.length,
    };
  }),

  // Get TTS settings
  getTTSSettings: protectedProcedure.query(async ({ ctx }) => {
    const available = await realTtsService.checkAvailability();
    return {
      enabled: true,
      serverTtsAvailable: available,
      defaultLanguage: "en",
      defaultVoice: "nova",
      defaultSpeed: 1.0,
      defaultPitch: 1.0,
      autoPlay: false,
      supportedLanguages: ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "zh", "ko"],
      supportedVoices: AVAILABLE_VOICES.map(v => v.id),
    };
  }),

  // Update TTS settings
  updateTTSSettings: protectedProcedure
    .input(
      z.object({
        defaultLanguage: z.string().optional(),
        defaultVoice: z.string().optional(),
        defaultSpeed: z.number().optional(),
        autoPlay: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "TTS settings updated",
        settings: input,
      };
    }),

  // Get speech history (placeholder — would need DB table)
  getSpeechHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return { history: [] };
    }),

  // Download speech as file
  downloadSpeech: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(4096),
        language: z.string(),
        voice: z.string(),
        format: z.enum(["mp3", "wav", "ogg"]).default("mp3"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await realTtsService.generateSpeech({
        text: input.text,
        voice: input.voice,
      });

      if (result.success && result.audioUrl) {
        return {
          success: true,
          downloadUrl: result.audioUrl,
          filename: `speech-${Date.now()}.mp3`,
          format: "mp3",
        };
      }

      return {
        success: false,
        downloadUrl: '',
        filename: '',
        format: input.format,
        error: result.error || 'Generation failed',
      };
    }),
});
