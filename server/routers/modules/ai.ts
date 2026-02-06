/**
 * AI & Chat Module Router
 * Groups all AI, chat, and LLM-related routers
 */

import { router } from '../../_core/trpc';
import { aiChatRouter } from '../aiChatRouter';
import { qumusChatRouter } from '../qumusChatRouter';
import { qumusIdentityRouter } from '../qumusIdentityRouter';
import { chatHistoryRouter } from '../chatHistoryRouter';
import { conversationExportRouter } from '../conversationExport';
import { conversationSummariesRouter } from '../conversationSummaries';
import { llmStoryboardingRouter } from '../llmStoryboardingRouter';
import { promptLibraryRouter } from '../promptLibrary';
import { contentGenerationRouter } from '../contentGeneration';
import { contentGenerationPolicyRouter } from '../contentGenerationPolicy';
import { storyboardRouter } from '../storyboardRouter';
import { voiceInputRouter } from '../voiceInput';
import { speechToTextRouter } from '../speechToText';
import { textToSpeechRouter } from '../textToSpeech';
import { voiceFeedbackRouter } from '../voiceFeedbackRouter';

export const aiChatRouter_module = router({
  // Core Chat
  aiChat: aiChatRouter,
  qumusChat: qumusChatRouter,
  qumusIdentity: qumusIdentityRouter,

  // Chat Management
  chatHistory: chatHistoryRouter,
  conversationExport: conversationExportRouter,
  conversationSummaries: conversationSummariesRouter,

  // LLM & Content
  llmStoryboarding: llmStoryboardingRouter,
  promptLibrary: promptLibraryRouter,
  contentGeneration: contentGenerationRouter,
  contentGenerationPolicy: contentGenerationPolicyRouter,
  storyboard: storyboardRouter,

  // Voice & Speech
  voiceInput: voiceInputRouter,
  speechToText: speechToTextRouter,
  textToSpeech: textToSpeechRouter,
  voiceFeedback: voiceFeedbackRouter,
});
