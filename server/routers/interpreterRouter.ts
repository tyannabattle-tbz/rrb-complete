/**
 * Interpreter Router — Real-time translation via LLM
 * Provides server-side translation for the LanguageInterpreter component
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'sw', name: 'Swahili' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'am', name: 'Amharic' },
  { code: 'zu', name: 'Zulu' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ig', name: 'Igbo' },
  { code: 'tw', name: 'Twi (Akan)' },
  { code: 'ga', name: 'Ga' },
];

export const interpreterRouter = router({
  /** Translate text from source language to target language */
  translate: publicProcedure
    .input(z.object({
      text: z.string().min(1).max(5000),
      sourceLang: z.string().min(2).max(5),
      targetLang: z.string().min(2).max(5),
    }))
    .mutation(async ({ input }) => {
      const sourceName = SUPPORTED_LANGUAGES.find(l => l.code === input.sourceLang)?.name || input.sourceLang;
      const targetName = SUPPORTED_LANGUAGES.find(l => l.code === input.targetLang)?.name || input.targetLang;

      if (input.sourceLang === input.targetLang) {
        return { translatedText: input.text, sourceLang: input.sourceLang, targetLang: input.targetLang };
      }

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a professional simultaneous interpreter. Translate the following text from ${sourceName} to ${targetName}. Return ONLY the translated text, nothing else. Preserve the tone, meaning, and nuance of the original. If the text contains proper nouns, keep them as-is. Do not add explanations or notes.`
            },
            {
              role: "user",
              content: input.text
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  translated: { type: "string", description: "The translated text" }
                },
                required: ["translated"],
                additionalProperties: false,
              }
            }
          }
        });

        const content = response.choices?.[0]?.message?.content || '';
        let translatedText = input.text;
        try {
          const parsed = JSON.parse(content);
          translatedText = parsed.translated || content;
        } catch {
          translatedText = content;
        }

        return {
          translatedText,
          sourceLang: input.sourceLang,
          targetLang: input.targetLang,
        };
      } catch (error) {
        console.error('[Interpreter] Translation error:', error);
        return {
          translatedText: `[Translation unavailable] ${input.text}`,
          sourceLang: input.sourceLang,
          targetLang: input.targetLang,
        };
      }
    }),

  /** Batch translate multiple lines */
  batchTranslate: publicProcedure
    .input(z.object({
      texts: z.array(z.string()).max(20),
      sourceLang: z.string().min(2).max(5),
      targetLang: z.string().min(2).max(5),
    }))
    .mutation(async ({ input }) => {
      const sourceName = SUPPORTED_LANGUAGES.find(l => l.code === input.sourceLang)?.name || input.sourceLang;
      const targetName = SUPPORTED_LANGUAGES.find(l => l.code === input.targetLang)?.name || input.targetLang;

      if (input.sourceLang === input.targetLang) {
        return { translations: input.texts };
      }

      try {
        const combined = input.texts.map((t, i) => `[${i}] ${t}`).join('\n');
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a professional simultaneous interpreter. Translate each numbered line from ${sourceName} to ${targetName}. Return a JSON object with a "translations" array containing the translated text for each line in the same order. Preserve tone and meaning.`
            },
            { role: "user", content: combined }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "batch_translation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  translations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of translated texts in the same order as input"
                  }
                },
                required: ["translations"],
                additionalProperties: false,
              }
            }
          }
        });

        const content = response.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        return { translations: parsed.translations || input.texts };
      } catch (error) {
        console.error('[Interpreter] Batch translation error:', error);
        return { translations: input.texts.map(t => `[Translation unavailable] ${t}`) };
      }
    }),

  /** Get supported languages */
  getLanguages: publicProcedure.query(() => {
    return { languages: SUPPORTED_LANGUAGES };
  }),
});
