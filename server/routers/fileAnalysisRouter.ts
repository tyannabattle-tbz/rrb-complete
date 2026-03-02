import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';
import { transcribeAudio } from '../_core/voiceTranscription';

export const fileAnalysisRouter = router({
  /**
   * Analyze uploaded file and extract content
   */
  analyzeFile: protectedProcedure
    .input(z.object({
      fileUrl: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
      fileSize: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        const analysis: any = {
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          analysisType: 'unknown',
          content: '',
          summary: '',
          keyPoints: [],
        };

        // Analyze based on file type
        if (input.mimeType.startsWith('image/')) {
          analysis.analysisType = 'image';
          // Use vision API to analyze image
          const response = await invokeLLM({
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this image and provide a detailed description, key objects, text content, and any relevant information.',
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: input.fileUrl,
                      detail: 'high',
                    },
                  },
                ],
              },
            ],
          });

          analysis.content = response.choices?.[0]?.message?.content || '';
          analysis.summary = analysis.content.substring(0, 200) + '...';
        } else if (input.mimeType.startsWith('audio/')) {
          analysis.analysisType = 'audio';
          // Transcribe audio
          const transcription = await transcribeAudio({
            audioUrl: input.fileUrl,
            language: 'en',
          });

          analysis.content = transcription.text || '';
          analysis.summary = analysis.content.substring(0, 200) + '...';
          analysis.keyPoints = transcription.segments?.map((s: any) => ({
            timestamp: s.start,
            text: s.text,
          })) || [];
        } else if (input.mimeType === 'application/pdf') {
          analysis.analysisType = 'pdf';
          // For PDF, we would need a PDF extraction library
          // This is a placeholder for the actual implementation
          analysis.content = 'PDF content extraction requires additional setup';
          analysis.summary = 'PDF file detected and ready for analysis';
        } else if (input.mimeType.includes('text')) {
          analysis.analysisType = 'text';
          // For text files, fetch and analyze
          const response = await fetch(input.fileUrl);
          const text = await response.text();
          analysis.content = text;
          analysis.summary = text.substring(0, 200) + '...';
        }

        // Generate key points using LLM if we have content
        if (analysis.content) {
          const summaryResponse = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that extracts key points and summarizes content.',
              },
              {
                role: 'user',
                content: `Please analyze the following content and provide:
1. A brief summary (2-3 sentences)
2. Top 5 key points (as bullet points)
3. Main topics covered

Content:
${analysis.content.substring(0, 2000)}`,
              },
            ],
          });

          const summaryText = summaryResponse.choices?.[0]?.message?.content || '';
          analysis.summary = summaryText;

          // Extract key points
          const keyPointsMatch = summaryText.match(/(?:^|\n)[-•]\s*(.+?)(?=\n|$)/gm);
          analysis.keyPoints = keyPointsMatch?.map((p: string) => p.replace(/^[-•]\s*/, '').trim()) || [];
        }

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error('File analysis error:', error);
        return {
          success: false,
          analysis: null,
          error: error instanceof Error ? error.message : 'Failed to analyze file',
        };
      }
    }),

  /**
   * Extract text from multiple files
   */
  extractBatchContent: protectedProcedure
    .input(z.object({
      files: z.array(z.object({
        fileUrl: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      try {
        const results = await Promise.all(
          input.files.map(async (file) => {
            try {
              const response = await fetch(file.fileUrl);
              const content = await response.text();
              return {
                fileName: file.fileName,
                success: true,
                content: content.substring(0, 5000), // Limit to 5000 chars
              };
            } catch (error) {
              return {
                fileName: file.fileName,
                success: false,
                content: '',
                error: error instanceof Error ? error.message : 'Failed to extract',
              };
            }
          })
        );

        return {
          success: true,
          results,
        };
      } catch (error) {
        console.error('Batch extraction error:', error);
        return {
          success: false,
          results: [],
          error: error instanceof Error ? error.message : 'Failed to extract files',
        };
      }
    }),

  /**
   * Get analysis history
   */
  getAnalysisHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async () => {
      try {
        // This would query from database in a real implementation
        return {
          success: true,
          history: [],
        };
      } catch (error) {
        console.error('Error fetching analysis history:', error);
        return {
          success: false,
          history: [],
          error: error instanceof Error ? error.message : 'Failed to fetch history',
        };
      }
    }),
});
