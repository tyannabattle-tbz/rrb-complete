import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';
import { QumusIdentitySystem } from '../_core/qumusIdentity';
import { CandyIdentitySystem } from '../_core/candyIdentity';
import { SeraphIdentitySystem } from '../_core/seraphIdentity';

export const chatStreamingRouter = router({
  /**
   * Stream chat responses in real-time — supports text + file attachments (images, docs, audio)
   */
  streamChat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
      query: z.string(),
      // Which AI persona to use — Valanna (default), Candy, or Seraph
      persona: z.enum(['valanna', 'candy', 'seraph']).default('valanna'),
      // Optional file attachments for multimodal input
      attachments: z.array(z.object({
        url: z.string(),           // S3 URL of the uploaded file
        mimeType: z.string(),      // e.g. image/png, application/pdf, audio/mp3
        fileName: z.string(),      // Original file name
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Use the selected persona's identity system for system prompt
        const systemPrompt = input.persona === 'candy' 
          ? CandyIdentitySystem.getSystemPrompt() 
          : input.persona === 'seraph'
          ? SeraphIdentitySystem.getSystemPrompt()
          : QumusIdentitySystem.getSystemPrompt();

        // Build message history
        const historyMessages = input.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // Build the user message — may be multimodal if attachments present
        let userMessage: any;

        if (input.attachments && input.attachments.length > 0) {
          // Multimodal message with text + files
          const contentParts: any[] = [];

          // Add text part
          if (input.query.trim()) {
            contentParts.push({
              type: 'text',
              text: input.query,
            });
          }

          // Add file parts based on MIME type
          for (const attachment of input.attachments) {
            if (attachment.mimeType.startsWith('image/')) {
              // Image attachment — use image_url content type
              contentParts.push({
                type: 'image_url',
                image_url: {
                  url: attachment.url,
                  detail: 'auto',
                },
              });
            } else if (attachment.mimeType === 'application/pdf' || 
                       attachment.mimeType.startsWith('audio/') ||
                       attachment.mimeType.startsWith('video/')) {
              // PDF, audio, video — use file_url content type
              contentParts.push({
                type: 'file_url',
                file_url: {
                  url: attachment.url,
                  mime_type: attachment.mimeType,
                },
              });
            } else {
              // Other file types — describe in text
              contentParts.push({
                type: 'text',
                text: `[Attached file: ${attachment.fileName} (${attachment.mimeType})]`,
              });
            }
          }

          // If no text was provided, add a default prompt
          if (!input.query.trim()) {
            contentParts.unshift({
              type: 'text',
              text: `Please analyze this file I've shared with you: ${input.attachments.map(a => a.fileName).join(', ')}`,
            });
          }

          userMessage = {
            role: 'user' as const,
            content: contentParts,
          };
        } else {
          // Text-only message
          userMessage = {
            role: 'user' as const,
            content: input.query,
          };
        }

        const messages = [
          {
            role: 'system' as const,
            content: systemPrompt,
          },
          ...historyMessages,
          userMessage,
        ];

        // Call LLM with streaming support
        const response = await invokeLLM({
          messages: messages,
          stream: true,
        });

        // Return streaming response
        return {
          success: true,
          stream: response,
        };
      } catch (error) {
        console.error('Chat streaming error:', error);
        return {
          success: false,
          message: 'Failed to stream response. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Upload a file for Valanna chat — stores in S3 and returns URL
   */
  uploadChatFile: publicProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 encoded file data
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { storagePut } = await import('../storage');
        
        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Max 16MB
        if (buffer.length > 16 * 1024 * 1024) {
          throw new Error('File too large. Maximum size is 16MB.');
        }

        // Generate unique key
        const fileKey = `valanna-chat/${Date.now()}-${Math.random().toString(36).substring(7)}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return {
          success: true,
          url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: buffer.length,
        };
      } catch (error) {
        console.error('Chat file upload error:', error);
        return {
          success: false,
          url: '',
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: 0,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
      }
    }),

  /**
   * Conference Mode — All three AIs respond to the same message in sequence
   * Each AI sees the other AIs' responses so they can build on each other
   */
  conferenceChat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        persona: z.string().optional(),
      })),
      query: z.string(),
      attachments: z.array(z.object({
        url: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const personas = [
          { key: 'valanna', name: 'Valanna', getPrompt: () => QumusIdentitySystem.getSystemPrompt() },
          { key: 'seraph', name: 'Seraph', getPrompt: () => SeraphIdentitySystem.getSystemPrompt() },
          { key: 'candy', name: 'Candy', getPrompt: () => CandyIdentitySystem.getSystemPrompt() },
        ];

        const conferenceContext = `\n\n[CONFERENCE MODE] You are in a live conference call with the other two AIs. The user asked a question and all three of you are responding in turn. Keep your response focused and concise (2-4 sentences). Don't repeat what the others said — add your unique perspective. Address the others by name when building on their points. Be natural, like a real conversation.`;

        // Build the user message (may be multimodal)
        let userContent: any = input.query;
        if (input.attachments && input.attachments.length > 0) {
          const parts: any[] = [];
          if (input.query.trim()) parts.push({ type: 'text', text: input.query });
          for (const att of input.attachments) {
            if (att.mimeType.startsWith('image/')) {
              parts.push({ type: 'image_url', image_url: { url: att.url, detail: 'auto' } });
            } else if (att.mimeType === 'application/pdf' || att.mimeType.startsWith('audio/') || att.mimeType.startsWith('video/')) {
              parts.push({ type: 'file_url', file_url: { url: att.url, mime_type: att.mimeType } });
            } else {
              parts.push({ type: 'text', text: `[Attached: ${att.fileName}]` });
            }
          }
          if (!input.query.trim()) parts.unshift({ type: 'text', text: `Analyze: ${input.attachments.map(a => a.fileName).join(', ')}` });
          userContent = parts;
        }

        // Build shared conversation history
        const sharedHistory = input.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.persona && msg.role === 'assistant'
            ? `[${msg.persona}]: ${msg.content}`
            : msg.content,
        }));

        const responses: Array<{ persona: string; name: string; content: string }> = [];

        // Query each AI in sequence, each seeing the previous responses
        for (const ai of personas) {
          const priorInThisRound = responses.map(r => ({
            role: 'assistant' as const,
            content: `[${r.name}]: ${r.content}`,
          }));

          const messages = [
            { role: 'system' as const, content: ai.getPrompt() + conferenceContext },
            ...sharedHistory,
            { role: 'user' as const, content: userContent },
            ...priorInThisRound,
          ];

          const response = await invokeLLM({ messages });
          const content = (response as any)?.choices?.[0]?.message?.content || `${ai.name} is thinking...`;
          responses.push({ persona: ai.key, name: ai.name, content });
        }

        return { success: true, responses };
      } catch (error) {
        console.error('Conference chat error:', error);
        return {
          success: false,
          responses: [],
          error: error instanceof Error ? error.message : 'Conference failed',
        };
      }
    }),

  /**
   * Get streaming status
   */
  getStreamStatus: publicProcedure.query(async () => {
    return {
      streaming: false,
      active: 0,
      timestamp: new Date(),
    };
  }),
});
