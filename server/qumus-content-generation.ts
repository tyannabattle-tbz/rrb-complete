/**
 * QUMUS Autonomous Content Generation Engine
 * AI-powered content generation for broadcasts
 * Generates scripts, descriptions, thumbnails, titles, hashtags, and summaries
 */

import { getDb } from './db';
import { generatedContent } from '../drizzle/schema';
import { invokeLLM } from './_core/llm';
import { generateImage } from './_core/imageGeneration';
import { eq } from 'drizzle-orm';

interface ContentGenerationRequest {
  broadcastId: string;
  contentType: 'script' | 'description' | 'thumbnail' | 'title' | 'hashtags' | 'summary';
  context: Record<string, any>;
  userId?: number;
}

interface GeneratedContentResult {
  contentId: string;
  content: string;
  confidence: number;
  approved: boolean;
}

/**
 * Generate broadcast script
 */
async function generateScript(context: Record<string, any>): Promise<string> {
  const prompt = `Generate a professional broadcast script for:
Title: ${context.title}
Duration: ${context.duration || 60} minutes
Type: ${context.broadcastType || 'live'}
Topics: ${context.topics?.join(', ') || 'General'}
Tone: ${context.tone || 'professional'}

Include:
- Opening hook
- Main segments
- Transitions
- Closing remarks
- Timing cues`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content:
          'You are a professional broadcast scriptwriter. Generate engaging, well-structured scripts for live broadcasts.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content || '';
}

/**
 * Generate broadcast description
 */
async function generateDescription(context: Record<string, any>): Promise<string> {
  const prompt = `Generate a compelling broadcast description for:
Title: ${context.title}
Type: ${context.broadcastType || 'live'}
Topics: ${context.topics?.join(', ') || 'General'}
Highlights: ${context.highlights?.join(', ') || 'None'}

The description should:
- Be 2-3 sentences
- Include key topics
- Be SEO-friendly
- Encourage viewers to watch`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are an expert at writing engaging broadcast descriptions.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content || '';
}

/**
 * Generate broadcast title
 */
async function generateTitle(context: Record<string, any>): Promise<string> {
  const prompt = `Generate 5 compelling broadcast titles for:
Topics: ${context.topics?.join(', ') || 'General'}
Type: ${context.broadcastType || 'live'}
Audience: ${context.audience || 'General'}

Requirements:
- Catchy and engaging
- Under 60 characters
- Include relevant keywords
- Encourage clicks`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are an expert at creating viral broadcast titles.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content || '';
}

/**
 * Generate hashtags
 */
async function generateHashtags(context: Record<string, any>): Promise<string> {
  const prompt = `Generate 10-15 relevant hashtags for:
Title: ${context.title}
Topics: ${context.topics?.join(', ') || 'General'}
Platform: ${context.platform || 'multi-platform'}
Audience: ${context.audience || 'General'}

Requirements:
- Mix of trending and niche hashtags
- Relevant to content
- Include brand hashtags if applicable
- Format: #hashtag`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are an expert at creating viral hashtag strategies.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content || '';
}

/**
 * Generate broadcast summary
 */
async function generateSummary(context: Record<string, any>): Promise<string> {
  const prompt = `Generate a concise broadcast summary for:
Title: ${context.title}
Duration: ${context.duration || 60} minutes
Topics: ${context.topics?.join(', ') || 'General'}
Key Points: ${context.keyPoints?.join(', ') || 'None'}

The summary should:
- Be 1-2 paragraphs
- Highlight main takeaways
- Be suitable for social media
- Include call-to-action`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are an expert at creating engaging broadcast summaries.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content || '';
}

/**
 * Generate thumbnail image
 */
async function generateThumbnail(context: Record<string, any>): Promise<string> {
  const prompt = `Create a professional broadcast thumbnail image:
Title: ${context.title}
Type: ${context.broadcastType || 'live'}
Style: ${context.style || 'modern'}
Colors: ${context.colors?.join(', ') || 'blue, white'}

Requirements:
- 1280x720 pixels
- Attention-grabbing
- Text overlay with title
- Professional design
- Suitable for YouTube/Twitch`;

  const result = await generateImage({
    prompt,
  });

  return result.url;
}

/**
 * Generate content with AI
 */
export async function generateContent(
  request: ContentGenerationRequest
): Promise<GeneratedContentResult> {
  try {
    let content = '';
    let confidence = 85;

    // Generate content based on type
    switch (request.contentType) {
      case 'script':
        content = await generateScript(request.context);
        confidence = 90;
        break;

      case 'description':
        content = await generateDescription(request.context);
        confidence = 85;
        break;

      case 'title':
        content = await generateTitle(request.context);
        confidence = 80;
        break;

      case 'hashtags':
        content = await generateHashtags(request.context);
        confidence = 75;
        break;

      case 'summary':
        content = await generateSummary(request.context);
        confidence = 85;
        break;

      case 'thumbnail':
        content = await generateThumbnail(request.context);
        confidence = 70;
        break;

      default:
        throw new Error(`Unknown content type: ${request.contentType}`);
    }

    // Save generated content
    const contentId = `content_${Date.now()}`;

    await db.insert(generatedContent).values({
      contentId,
      broadcastId: request.broadcastId,
      contentType: request.contentType,
      generatedBy: 'gpt-4',
      prompt: JSON.stringify(request.context),
      content,
      confidence,
      approved: false,
    });

    return {
      contentId,
      content,
      confidence,
      approved: false,
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

/**
 * Approve generated content
 */
export async function approveGeneratedContent(
  contentId: string,
  userId: number,
  notes?: string
) {
  try {
    await db
      .update(generatedContent)
      .set({
        approved: true,
        approvedBy: userId,
        approvedAt: new Date(),
      })
      .where(eq(generatedContent.contentId, contentId));

    return {
      success: true,
      message: 'Content approved',
      contentId,
    };
  } catch (error) {
    console.error('Error approving content:', error);
    return {
      success: false,
      message: 'Failed to approve content',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reject generated content
 */
export async function rejectGeneratedContent(
  contentId: string,
  userId: number,
  reason?: string
) {
  try {
    // Delete rejected content
    await db
      .delete(generatedContent)
      .where(eq(generatedContent.contentId, contentId));

    return {
      success: true,
      message: 'Content rejected and deleted',
      contentId,
    };
  } catch (error) {
    console.error('Error rejecting content:', error);
    return {
      success: false,
      message: 'Failed to reject content',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get pending content approvals
 */
export async function getPendingContentApprovals(limit: number = 50) {
  try {
    const pending = await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.approved, false))
      .limit(limit);

    return {
      success: true,
      pending,
      count: pending.length,
    };
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return {
      success: false,
      message: 'Failed to fetch pending approvals',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get approved content for broadcast
 */
export async function getApprovedContent(broadcastId: string) {
  try {
    const approved = await db
      .select()
      .from(generatedContent)
      .where(
        eq(generatedContent.broadcastId, broadcastId) &&
          eq(generatedContent.approved, true)
      );

    return {
      success: true,
      content: approved,
      count: approved.length,
    };
  } catch (error) {
    console.error('Error fetching approved content:', error);
    return {
      success: false,
      message: 'Failed to fetch approved content',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate complete content package
 */
export async function generateCompleteContentPackage(
  broadcastId: string,
  context: Record<string, any>,
  userId?: number
) {
  try {
    const results = {
      script: null as any,
      description: null as any,
      title: null as any,
      hashtags: null as any,
      summary: null as any,
      thumbnail: null as any,
    };

    // Generate all content types in parallel
    const promises = [
      generateContent({
        broadcastId,
        contentType: 'script',
        context,
        userId,
      }).then(r => (results.script = r)),
      generateContent({
        broadcastId,
        contentType: 'description',
        context,
        userId,
      }).then(r => (results.description = r)),
      generateContent({
        broadcastId,
        contentType: 'title',
        context,
        userId,
      }).then(r => (results.title = r)),
      generateContent({
        broadcastId,
        contentType: 'hashtags',
        context,
        userId,
      }).then(r => (results.hashtags = r)),
      generateContent({
        broadcastId,
        contentType: 'summary',
        context,
        userId,
      }).then(r => (results.summary = r)),
      generateContent({
        broadcastId,
        contentType: 'thumbnail',
        context,
        userId,
      }).then(r => (results.thumbnail = r)),
    ];

    await Promise.all(promises);

    return {
      success: true,
      message: 'Complete content package generated',
      results,
      avgConfidence:
        (results.script.confidence +
          results.description.confidence +
          results.title.confidence +
          results.hashtags.confidence +
          results.summary.confidence +
          results.thumbnail.confidence) /
        6,
    };
  } catch (error) {
    console.error('Error generating content package:', error);
    return {
      success: false,
      message: 'Failed to generate content package',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  generateContent,
  approveGeneratedContent,
  rejectGeneratedContent,
  getPendingContentApprovals,
  getApprovedContent,
  generateCompleteContentPackage,
};
