/**
 * Content Moderation Service
 * AI-powered content review system with automated flagging and manual approval workflow
 * Integrates with QUMUS for autonomous decision-making
 */

import { invokeLLM } from '../_core/llm';
import * as db from '../db';
import { sql } from 'drizzle-orm';

export interface ContentReviewRequest {
  contentId: number;
  contentType: 'audio' | 'video' | 'image' | 'text' | 'metadata';
  creatorId: number;
  title: string;
  description?: string;
  contentUrl: string;
  thumbnailUrl?: string;
}

export interface ModerationResult {
  contentId: number;
  riskScore: number;
  flags: string[];
  categories: string[];
  shouldReview: boolean;
  recommendation: 'approve' | 'review' | 'reject';
}

/**
 * Analyze content for policy violations using AI
 */
export async function analyzeContentWithAI(request: ContentReviewRequest): Promise<ModerationResult> {
  try {
    const prompt = `
You are a content moderation expert. Analyze the following content for policy violations.

Content Type: ${request.contentType}
Title: ${request.title}
Description: ${request.description || 'N/A'}
URL: ${request.contentUrl}

Evaluate for:
1. Violence or graphic content
2. Hate speech or discrimination
3. Explicit or adult content
4. Misinformation or false claims
5. Spam or promotional content
6. Copyright violations
7. Personal information exposure

Respond with JSON:
{
  "riskScore": 0-100,
  "flags": ["flag1", "flag2"],
  "categories": ["category1"],
  "recommendation": "approve|review|reject"
}
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a content moderation expert. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    let result;
    try {
      const content = response.choices[0].message.content;
      result = JSON.parse(content);
    } catch {
      result = {
        riskScore: 50,
        flags: ['parse_error'],
        categories: ['unknown'],
        recommendation: 'review',
      };
    }

    return {
      contentId: request.contentId,
      riskScore: result.riskScore || 50,
      flags: result.flags || [],
      categories: result.categories || [],
      shouldReview: result.riskScore > 30,
      recommendation: result.recommendation || 'review',
    };
  } catch (error) {
    console.error('[Moderation] AI analysis error:', error);
    return {
      contentId: request.contentId,
      riskScore: 50,
      flags: ['analysis_error'],
      categories: ['error'],
      shouldReview: true,
      recommendation: 'review',
    };
  }
}

/**
 * Submit content for moderation review
 */
export async function submitContentForReview(request: ContentReviewRequest): Promise<{
  success: boolean;
  moderationId?: number;
  result?: ModerationResult;
}> {
  try {
    // Run AI analysis
    const aiResult = await analyzeContentWithAI(request);

    // Get moderation policies
    const policies = await db.query(sql`
      SELECT * FROM content_moderation_policies 
      WHERE category IN (${aiResult.categories.join(',')})
    `);

    // Determine if manual review is needed
    const manualReviewNeeded = aiResult.shouldReview || 
      (policies && policies.some((p: any) => parseFloat(p.autoRejectThreshold) < aiResult.riskScore));

    // Insert moderation queue record
    const result = await db.query(sql`
      INSERT INTO content_moderation_queue 
      (contentId, contentType, creatorId, title, description, contentUrl, thumbnailUrl,
       aiFlags, aiRiskScore, manualReviewRequired, status)
      VALUES (${request.contentId}, ${request.contentType}, ${request.creatorId}, 
              ${request.title}, ${request.description || null}, ${request.contentUrl},
              ${request.thumbnailUrl || null}, ${JSON.stringify(aiResult.flags)},
              ${aiResult.riskScore}, ${manualReviewNeeded ? 1 : 0}, 
              ${manualReviewNeeded ? 'pending' : 'approved'})
    `);

    const moderationId = (result as any).insertId;

    // If auto-approved, notify creator
    if (!manualReviewNeeded) {
      await notifyCreatorApproved(request.creatorId, request.contentId, request.title);
    }

    return { success: true, moderationId, result: aiResult };
  } catch (error) {
    console.error('[Moderation] Submit error:', error);
    return { success: false };
  }
}

/**
 * Get moderation queue for admins
 */
export async function getModerationQueue(limit: number = 50, offset: number = 0) {
  try {
    const queue = await db.query(sql`
      SELECT * FROM content_moderation_queue 
      WHERE status IN ('pending', 'in_review')
      ORDER BY aiRiskScore DESC, createdAt ASC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return queue || [];
  } catch (error) {
    console.error('[Moderation] Get queue error:', error);
    return [];
  }
}

/**
 * Review content and make moderation decision
 */
export async function reviewContent(
  moderationId: number,
  decision: 'approved' | 'rejected',
  reviewNotes: string,
  reviewedBy: number
): Promise<{ success: boolean }> {
  try {
    // Get moderation record
    const records = await db.query(sql`
      SELECT * FROM content_moderation_queue WHERE id = ${moderationId}
    `);

    if (!records || records.length === 0) {
      return { success: false };
    }

    const record = records[0];

    // Update moderation record
    await db.query(sql`
      UPDATE content_moderation_queue 
      SET status = ${decision === 'approved' ? 'approved' : 'rejected'},
          reviewedBy = ${reviewedBy},
          reviewNotes = ${reviewNotes},
          reviewedAt = NOW()
      WHERE id = ${moderationId}
    `);

    // Notify creator
    if (decision === 'approved') {
      await notifyCreatorApproved(record.creatorId, record.contentId, record.title);
    } else {
      await notifyCreatorRejected(record.creatorId, record.contentId, record.title, reviewNotes);
    }

    return { success: true };
  } catch (error) {
    console.error('[Moderation] Review error:', error);
    return { success: false };
  }
}

/**
 * Appeal a rejected content decision
 */
export async function appealModeration(
  moderationId: number,
  creatorId: number,
  reason: string,
  evidence?: any
): Promise<{ success: boolean; appealId?: number }> {
  try {
    const result = await db.query(sql`
      INSERT INTO content_moderation_appeal 
      (moderationId, creatorId, reason, evidence, status)
      VALUES (${moderationId}, ${creatorId}, ${reason}, 
              ${evidence ? JSON.stringify(evidence) : null}, 'pending')
    `);

    return { success: true, appealId: (result as any).insertId };
  } catch (error) {
    console.error('[Moderation] Appeal error:', error);
    return { success: false };
  }
}

/**
 * Review appeal
 */
export async function reviewAppeal(
  appealId: number,
  decision: 'approved' | 'rejected',
  reviewNotes: string,
  reviewedBy: number
): Promise<{ success: boolean }> {
  try {
    // Get appeal record
    const appeals = await db.query(sql`
      SELECT * FROM content_moderation_appeal WHERE id = ${appealId}
    `);

    if (!appeals || appeals.length === 0) {
      return { success: false };
    }

    const appeal = appeals[0];

    // Update appeal
    await db.query(sql`
      UPDATE content_moderation_appeal 
      SET status = ${decision === 'approved' ? 'approved' : 'rejected'},
          reviewedBy = ${reviewedBy},
          reviewNotes = ${reviewNotes},
          reviewedAt = NOW()
      WHERE id = ${appealId}
    `);

    // If appeal approved, update moderation status
    if (decision === 'approved') {
      await db.query(sql`
        UPDATE content_moderation_queue 
        SET status = 'approved'
        WHERE id = ${appeal.moderationId}
      `);
    }

    return { success: true };
  } catch (error) {
    console.error('[Moderation] Review appeal error:', error);
    return { success: false };
  }
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(days: number = 30) {
  try {
    const stats = await db.query(sql`
      SELECT 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        AVG(aiRiskScore) as avg_risk_score,
        MAX(aiRiskScore) as max_risk_score
      FROM content_moderation_queue 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    `);

    return stats?.[0] || null;
  } catch (error) {
    console.error('[Moderation] Get stats error:', error);
    return null;
  }
}

/**
 * Get creator moderation history
 */
export async function getCreatorModerationHistory(creatorId: number, limit: number = 50) {
  try {
    const history = await db.query(sql`
      SELECT * FROM content_moderation_queue 
      WHERE creatorId = ${creatorId}
      ORDER BY createdAt DESC
      LIMIT ${limit}
    `);
    return history || [];
  } catch (error) {
    console.error('[Moderation] Get history error:', error);
    return [];
  }
}

/**
 * Get policy violations by category
 */
export async function getViolationsByCategory(days: number = 30) {
  try {
    const violations = await db.query(sql`
      SELECT 
        JSON_EXTRACT(violationCategories, '$[0]') as category,
        COUNT(*) as count,
        AVG(aiRiskScore) as avg_risk
      FROM content_moderation_queue 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
        AND status = 'rejected'
      GROUP BY category
      ORDER BY count DESC
    `);
    return violations || [];
  } catch (error) {
    console.error('[Moderation] Get violations error:', error);
    return [];
  }
}

/**
 * Notify creator that content was approved
 */
async function notifyCreatorApproved(creatorId: number, contentId: number, title: string) {
  try {
    await db.query(sql`
      INSERT INTO notifications 
      (userId, type, title, content, severity)
      VALUES (${creatorId}, 'info', 'Content Approved', 
              'Your content "${title}" has been approved and is now live!', 'low')
    `);
  } catch (error) {
    console.error('[Moderation] Notify approved error:', error);
  }
}

/**
 * Notify creator that content was rejected
 */
async function notifyCreatorRejected(creatorId: number, contentId: number, title: string, reason: string) {
  try {
    await db.query(sql`
      INSERT INTO notifications 
      (userId, type, title, content, severity)
      VALUES (${creatorId}, 'warning', 'Content Rejected', 
              'Your content "${title}" was rejected. Reason: ${reason}', 'medium')
    `);
  } catch (error) {
    console.error('[Moderation] Notify rejected error:', error);
  }
}

/**
 * Create moderation policy
 */
export async function createModerationPolicy(
  name: string,
  category: string,
  severity: string,
  autoRejectThreshold: number,
  action: string
): Promise<{ success: boolean; policyId?: number }> {
  try {
    const result = await db.query(sql`
      INSERT INTO content_moderation_policies 
      (name, category, severity, autoRejectThreshold, action)
      VALUES (${name}, ${category}, ${severity}, ${autoRejectThreshold}, ${action})
    `);

    return { success: true, policyId: (result as any).insertId };
  } catch (error) {
    console.error('[Moderation] Create policy error:', error);
    return { success: false };
  }
}

/**
 * Get all moderation policies
 */
export async function getModerationPolicies() {
  try {
    const policies = await db.query(sql`
      SELECT * FROM content_moderation_policies 
      ORDER BY severity DESC, category ASC
    `);
    return policies || [];
  } catch (error) {
    console.error('[Moderation] Get policies error:', error);
    return [];
  }
}

/**
 * Update moderation policy
 */
export async function updateModerationPolicy(
  policyId: number,
  updates: Record<string, any>
): Promise<{ success: boolean }> {
  try {
    const setClauses = Object.entries(updates)
      .map(([key, value]) => {
        if (typeof value === 'string') return `${key} = '${value}'`;
        if (typeof value === 'number') return `${key} = ${value}`;
        return `${key} = '${JSON.stringify(value)}'`;
      })
      .join(', ');

    await db.query(sql`
      UPDATE content_moderation_policies 
      SET ${sql.raw(setClauses)}
      WHERE id = ${policyId}
    `);

    return { success: true };
  } catch (error) {
    console.error('[Moderation] Update policy error:', error);
    return { success: false };
  }
}
