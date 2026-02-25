import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

export const commandExecutionRouter = router({
  executeCommand: protectedProcedure
    .input(z.object({ userMessage: z.string() }))
    .mutation(async ({ input }) => {
      const command = parseCommand(input.userMessage);
      return { success: true, command };
    }),

  getSuggestions: protectedProcedure
    .input(z.object({ message: z.string() }))
    .query(async ({ input }) => {
      return { suggestions: generateSuggestions(input.message) };
    }),
});

function parseCommand(message: string) {
  const lower = message.toLowerCase();
  let type = 'unknown', subsystem = 'unknown', autonomyLevel = 75, impact = 'low', requiresApproval = false;

  if (/broadcast|emergency|alert/i.test(message)) {
    type = 'broadcast';
    subsystem = 'HybridCast';
    autonomyLevel = /emergency|urgent/i.test(message) ? 95 : 80;
    impact = /emergency|urgent/i.test(message) ? 'high' : 'medium';
    requiresApproval = /emergency|urgent/i.test(message);
  } else if (/play|music|song|content|upload|publish/i.test(message)) {
    type = 'content';
    subsystem = 'Rockin Rockin Boogie';
    autonomyLevel = 85;
    impact = 'low';
    requiresApproval = /delete|remove|archive/i.test(message);
  } else if (/donate|donation|fundraise|fund|payment/i.test(message)) {
    type = 'donation';
    subsystem = 'Sweet Miracles';
    const match = message.match(/\$?([\d,]+(?:\.\d{2})?)/);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      autonomyLevel = amount > 1000 ? 40 : amount > 500 ? 60 : 80;
      impact = amount > 1000 ? 'high' : amount > 500 ? 'medium' : 'low';
      requiresApproval = amount > 500;
    }
  } else if (/meditate|meditation|healing|frequency|relax|calm/i.test(message)) {
    type = 'meditation';
    subsystem = 'Canryn';
    autonomyLevel = 90;
    impact = 'low';
  }

  return { type, subsystem, message, autonomyLevel, impact, requiresApproval, timestamp: new Date() };
}

function generateSuggestions(message: string): string[] {
  const suggestions: string[] = [];
  if (/broadcast|emergency/i.test(message)) {
    suggestions.push('Start emergency broadcast', 'Send announcement');
  }
  if (/music|play|song/i.test(message)) {
    suggestions.push('Play music from Rockin Rockin Boogie', 'Upload new content');
  }
  if (/donate|fundraise/i.test(message)) {
    suggestions.push('Process donation to Sweet Miracles', 'Create fundraising campaign');
  }
  if (/meditate|healing/i.test(message)) {
    suggestions.push('Start meditation session', 'Play healing frequency');
  }
  return suggestions;
}
