import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';
import { QumusIdentitySystem } from '../_core/qumusIdentity';

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
      // Optional file attachments for multimodal input
      attachments: z.array(z.object({
        url: z.string(),           // S3 URL of the uploaded file
        mimeType: z.string(),      // e.g. image/png, application/pdf, audio/mp3
        fileName: z.string(),      // Original file name
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Use QUMUS identity system for system prompt
        const systemPrompt = QumusIdentitySystem.getSystemPrompt();

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
