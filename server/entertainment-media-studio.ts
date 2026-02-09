/**
 * Entertainment Platform - Professional Media Studio
 * Video and podcast production with AI capabilities
 */

import { getDb } from './db';
import {
  mediaProjects,
  mediaDistribution,
  users,
} from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { invokeLLM } from './_core/llm';
import { generateImage } from './_core/imageGeneration';

interface CreateProjectInput {
  userId: number;
  title: string;
  description?: string;
  projectType: 'video' | 'podcast' | 'live_stream' | 'shorts' | 'music' | 'other';
}

interface PublishProjectInput {
  projectId: string;
  platforms: Array<'youtube' | 'spotify' | 'tiktok' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'podcast_host' | 'direct'>;
}

interface GenerateContentInput {
  projectId: string;
  contentType: 'title' | 'description' | 'tags' | 'thumbnail_prompt';
  context: Record<string, any>;
}

/**
 * Create new media project
 */
export async function createMediaProject(input: CreateProjectInput) {
  try {
    const db = await getDb();
    const projectId = `project_${Date.now()}`;

    const result = await db.insert(mediaProjects).values({
      projectId,
      userId: input.userId,
      title: input.title,
      description: input.description,
      projectType: input.projectType,
      status: 'draft',
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      engagementRate: 0,
      revenue: 0,
    });

    return {
      projectId,
      title: input.title,
      projectType: input.projectType,
      status: 'draft',
      message: 'Project created successfully',
    };
  } catch (error) {
    console.error('Error creating media project:', error);
    throw error;
  }
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: 'draft' | 'recording' | 'editing' | 'published' | 'archived',
  userId: number
) {
  try {
    const db = await getDb();

    const result = await db
      .update(mediaProjects)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(mediaProjects.projectId, projectId), eq(mediaProjects.userId, userId)));

    return {
      projectId,
      status,
      message: 'Project status updated',
    };
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
}

/**
 * Get user's projects
 */
export async function getUserProjects(userId: number, limit: number = 50) {
  try {
    const db = await getDb();

    const projects = await db
      .select()
      .from(mediaProjects)
      .where(eq(mediaProjects.userId, userId))
      .limit(limit);

    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}

/**
 * Get project details
 */
export async function getProjectDetails(projectId: string) {
  try {
    const db = await getDb();

    const project = await db.select().from(mediaProjects).where(eq(mediaProjects.projectId, projectId));

    return project[0] || null;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
}

/**
 * Generate AI content for project
 */
export async function generateAIContent(input: GenerateContentInput) {
  try {
    const project = await getProjectDetails(input.projectId);
    if (!project) throw new Error('Project not found');

    let content = '';

    switch (input.contentType) {
      case 'title':
        const titleResponse = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are a creative content title generator for media projects.',
            },
            {
              role: 'user',
              content: `Generate a catchy, engaging title for a ${project.projectType} about: ${project.description || project.title}. Return only the title, no quotes.`,
            },
          ],
        });
        content = (titleResponse as any)?.choices?.[0]?.message?.content ?? '';
        break;

      case 'description':
        const descResponse = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are a professional content description writer.',
            },
            {
              role: 'user',
              content: `Write a compelling 2-3 sentence description for a ${project.projectType} titled "${project.title}". Make it engaging and SEO-friendly.`,
            },
          ],
        });
        content = (descResponse as any)?.choices?.[0]?.message?.content ?? '';
        break;

      case 'tags':
        const tagsResponse = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are a content tagging expert.',
            },
            {
              role: 'user',
              content: `Generate 10 relevant tags for a ${project.projectType} about: ${project.description || project.title}. Return as comma-separated list.`,
            },
          ],
        });
        content = (tagsResponse as any)?.choices?.[0]?.message?.content ?? '';
        break;

      case 'thumbnail_prompt':
        const thumbResponse = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert at creating detailed image generation prompts for thumbnails.',
            },
            {
              role: 'user',
              content: `Create a detailed prompt for generating an eye-catching thumbnail for a ${project.projectType} titled "${project.title}". The thumbnail should be visually striking and relevant to the content.`,
            },
          ],
        });
        content = (thumbResponse as any)?.choices?.[0]?.message?.content ?? '';
        break;
    }

    return {
      projectId: input.projectId,
      contentType: input.contentType,
      content,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
}

/**
 * Generate thumbnail image
 */
export async function generateThumbnail(projectId: string, prompt: string) {
  try {
    const { url: imageUrl } = await generateImage({
      prompt: prompt,
    });

    const db = await getDb();
    await db
      .update(mediaProjects)
      .set({ thumbnailUrl: imageUrl })
      .where(eq(mediaProjects.projectId, projectId));

    return {
      projectId,
      thumbnailUrl: imageUrl,
      message: 'Thumbnail generated successfully',
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}

/**
 * Publish project to platforms
 */
export async function publishProject(input: PublishProjectInput, userId: number) {
  try {
    const db = await getDb();
    const project = await getProjectDetails(input.projectId);

    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized');

    // Update project status to published
    await db
      .update(mediaProjects)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(mediaProjects.projectId, input.projectId));

    // Create distribution records for each platform
    const distributions = [];
    for (const platform of input.platforms) {
      const distributionId = `dist_${Date.now()}_${platform}`;
      await db.insert(mediaDistribution).values({
        distributionId,
        projectId: input.projectId,
        platform,
        status: 'pending',
      });
      distributions.push({
        distributionId,
        platform,
        status: 'pending',
      });
    }

    return {
      projectId: input.projectId,
      status: 'published',
      distributions,
      message: 'Project published to selected platforms',
    };
  } catch (error) {
    console.error('Error publishing project:', error);
    throw error;
  }
}

/**
 * Get distribution status
 */
export async function getDistributionStatus(projectId: string) {
  try {
    const db = await getDb();

    const distributions = await db
      .select()
      .from(mediaDistribution)
      .where(eq(mediaDistribution.projectId, projectId));

    return distributions;
  } catch (error) {
    console.error('Error fetching distribution status:', error);
    throw error;
  }
}

/**
 * Update distribution status
 */
export async function updateDistributionStatus(
  distributionId: string,
  status: 'pending' | 'published' | 'failed' | 'scheduled',
  platformUrl?: string
) {
  try {
    const db = await getDb();

    await db
      .update(mediaDistribution)
      .set({
        status,
        platformUrl,
        publishedAt: status === 'published' ? new Date() : undefined,
      })
      .where(eq(mediaDistribution.distributionId, distributionId));

    return {
      distributionId,
      status,
      message: 'Distribution status updated',
    };
  } catch (error) {
    console.error('Error updating distribution status:', error);
    throw error;
  }
}

/**
 * Get project analytics
 */
export async function getProjectAnalytics(projectId: string) {
  try {
    const project = await getProjectDetails(projectId);
    if (!project) throw new Error('Project not found');

    const distributions = await getDistributionStatus(projectId);

    const totalPlatformViews = distributions.reduce((sum, d) => sum + (d.platformViews || 0), 0);
    const totalPlatformEngagement = distributions.reduce((sum, d) => sum + (d.platformEngagement || 0), 0);
    const totalPlatformRevenue = distributions.reduce((sum, d) => sum + Number(d.platformRevenue || 0), 0);

    return {
      projectId,
      title: project.title,
      projectType: project.projectType,
      status: project.status,
      directViews: project.views,
      directEngagement: project.likes + project.shares + project.comments,
      directRevenue: Number(project.revenue),
      totalPlatformViews,
      totalPlatformEngagement,
      totalPlatformRevenue,
      combinedViews: (project.views || 0) + totalPlatformViews,
      combinedEngagement: (project.likes || 0) + (project.shares || 0) + (project.comments || 0) + totalPlatformEngagement,
      combinedRevenue: Number(project.revenue || 0) + totalPlatformRevenue,
      engagementRate: project.engagementRate,
      distributions: distributions.length,
      publishedAt: project.publishedAt,
    };
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    throw error;
  }
}

/**
 * Get trending projects
 */
export async function getTrendingProjects(limit: number = 10) {
  try {
    const db = await getDb();

    const projects = await db
      .select()
      .from(mediaProjects)
      .where(eq(mediaProjects.status, 'published'))
      .orderBy((t) => t.views)
      .limit(limit);

    return projects;
  } catch (error) {
    console.error('Error fetching trending projects:', error);
    throw error;
  }
}

/**
 * Get recent projects
 */
export async function getRecentProjects(limit: number = 10) {
  try {
    const db = await getDb();

    const projects = await db
      .select()
      .from(mediaProjects)
      .where(eq(mediaProjects.status, 'published'))
      .orderBy((t) => t.createdAt)
      .limit(limit);

    return projects;
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    throw error;
  }
}
