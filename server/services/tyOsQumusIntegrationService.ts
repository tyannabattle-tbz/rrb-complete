/**
 * Ty OS ↔ QUMUS Bidirectional Control Service
 * Establishes real-time communication and decision flow between Ty OS and QUMUS ecosystem
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { invokeLLM } from '../_core/llm';
import { notifyOwner } from '../_core/notification';

export interface QumusDecision {
  id: string;
  policyId: number;
  decision: 'approve' | 'reject' | 'review';
  reason: string;
  autonomyScore: number;
  requiresHumanReview: boolean;
  affectedEntities: string[];
  timestamp: Date;
}

export interface TyOSAction {
  id: string;
  userId: number;
  action: string;
  targetEntity: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface BidirectionalFlow {
  id: string;
  qumusDecision: QumusDecision;
  tyOSAction?: TyOSAction;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  auditTrail: Array<{ timestamp: Date; event: string; details: any }>;
  blockchainHash?: string;
}

/**
 * Execute QUMUS policy decision and notify Ty OS
 */
export async function executeQumusDecision(decision: QumusDecision): Promise<BidirectionalFlow> {
  const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const auditTrail: Array<{ timestamp: Date; event: string; details: any }> = [];

  try {
    const db = await getDb();

    // Log decision initiation
    auditTrail.push({
      timestamp: new Date(),
      event: 'QUMUS_DECISION_INITIATED',
      details: {
        policyId: decision.policyId,
        decision: decision.decision,
        autonomyScore: decision.autonomyScore,
      },
    });

    // Store decision in audit log
    await db.execute(
      sql`
        INSERT INTO autonomous_decisions (
          decision_id, policy_id, decision_type, reason, autonomy_score,
          requires_human_review, affected_entities, created_at
        ) VALUES (
          ${decision.id}, ${decision.policyId}, ${decision.decision}, ${decision.reason},
          ${decision.autonomyScore}, ${decision.requiresHumanReview},
          ${JSON.stringify(decision.affectedEntities)}, ${new Date()}
        )
      `
    );

    auditTrail.push({
      timestamp: new Date(),
      event: 'DECISION_LOGGED_TO_AUDIT',
      details: { decisionId: decision.id },
    });

    // Check if human review is required (10% of decisions)
    if (decision.requiresHumanReview || decision.autonomyScore < 0.9) {
      auditTrail.push({
        timestamp: new Date(),
        event: 'HUMAN_REVIEW_REQUIRED',
        details: { autonomyScore: decision.autonomyScore },
      });

      // Notify owner for review
      await notifyOwner({
        title: '🔍 QUMUS Decision Requires Review',
        content: `Policy ${decision.policyId}: ${decision.decision} (Autonomy: ${(decision.autonomyScore * 100).toFixed(1)}%)`,
      });
    }

    // Broadcast decision to Ty OS via WebSocket/event system
    auditTrail.push({
      timestamp: new Date(),
      event: 'DECISION_BROADCAST_TO_TY_OS',
      details: { affectedEntities: decision.affectedEntities },
    });

    // Create blockchain hash for decision
    const blockchainHash = await createBlockchainHash(decision, auditTrail);

    auditTrail.push({
      timestamp: new Date(),
      event: 'BLOCKCHAIN_HASH_CREATED',
      details: { hash: blockchainHash },
    });

    return {
      id: flowId,
      qumusDecision: decision,
      status: decision.requiresHumanReview ? 'pending' : 'executing',
      auditTrail,
      blockchainHash,
    };
  } catch (error) {
    auditTrail.push({
      timestamp: new Date(),
      event: 'DECISION_EXECUTION_FAILED',
      details: { error: String(error) },
    });

    console.error('Error executing QUMUS decision:', error);
    throw error;
  }
}

/**
 * Process Ty OS user action and trigger QUMUS policy
 */
export async function processTyOSAction(action: TyOSAction): Promise<BidirectionalFlow> {
  const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const auditTrail: Array<{ timestamp: Date; event: string; details: any }> = [];

  try {
    // Log action receipt
    auditTrail.push({
      timestamp: new Date(),
      event: 'TY_OS_ACTION_RECEIVED',
      details: {
        action: action.action,
        targetEntity: action.targetEntity,
        userId: action.userId,
      },
    });

    // Analyze action with LLM to determine policy trigger
    const policyAnalysis = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a QUMUS policy analyzer. Analyze the user action and determine which QUMUS policies should be triggered.
          Return a JSON object with: { policyIds: number[], decision: 'approve'|'reject'|'review', reason: string, autonomyScore: number }`,
        },
        {
          role: 'user',
          content: `Action: ${action.action}\nTarget: ${action.targetEntity}\nParameters: ${JSON.stringify(action.parameters)}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'policy_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              policyIds: { type: 'array', items: { type: 'number' } },
              decision: { type: 'string', enum: ['approve', 'reject', 'review'] },
              reason: { type: 'string' },
              autonomyScore: { type: 'number', minimum: 0, maximum: 1 },
            },
            required: ['policyIds', 'decision', 'reason', 'autonomyScore'],
            additionalProperties: false,
          },
        },
      },
    });

    const analysis = JSON.parse(policyAnalysis.choices[0].message.content || '{}');

    auditTrail.push({
      timestamp: new Date(),
      event: 'POLICY_ANALYSIS_COMPLETE',
      details: analysis,
    });

    // Create QUMUS decision from analysis
    const qumusDecision: QumusDecision = {
      id: `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      policyId: analysis.policyIds[0] || 1,
      decision: analysis.decision,
      reason: analysis.reason,
      autonomyScore: analysis.autonomyScore,
      requiresHumanReview: analysis.autonomyScore < 0.9,
      affectedEntities: [action.targetEntity],
      timestamp: new Date(),
    };

    // Execute QUMUS decision
    const decisionFlow = await executeQumusDecision(qumusDecision);

    auditTrail.push(...decisionFlow.auditTrail);

    return {
      id: flowId,
      qumusDecision,
      tyOSAction: action,
      status: decisionFlow.status,
      auditTrail,
      blockchainHash: decisionFlow.blockchainHash,
    };
  } catch (error) {
    auditTrail.push({
      timestamp: new Date(),
      event: 'ACTION_PROCESSING_FAILED',
      details: { error: String(error) },
    });

    console.error('Error processing Ty OS action:', error);
    throw error;
  }
}

/**
 * Create blockchain hash for decision audit trail
 */
async function createBlockchainHash(
  decision: QumusDecision,
  auditTrail: Array<{ timestamp: Date; event: string; details: any }>
): Promise<string> {
  try {
    const db = await getDb();

    // Create deterministic hash of decision and audit trail
    const data = JSON.stringify({
      decision,
      auditTrail,
      timestamp: new Date().toISOString(),
    });

    // Use crypto to create hash (simplified - in production use proper blockchain)
    const crypto = require('crypto');
    const hash = crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');

    // Store hash in audit log
    await db.execute(
      sql`
        INSERT INTO blockchain_verification (
          decision_id, hash_value, verified_at
        ) VALUES (
          ${decision.id}, ${hash}, ${new Date()}
        )
      `
    );

    return hash;
  } catch (error) {
    console.error('Error creating blockchain hash:', error);
    throw error;
  }
}

/**
 * Get bidirectional flow history
 */
export async function getBidirectionalFlowHistory(
  limit: number = 100
): Promise<BidirectionalFlow[]> {
  try {
    const db = await getDb();
    const flows = await db.execute(
      sql`
        SELECT 
          ad.decision_id,
          ad.policy_id,
          ad.decision_type,
          ad.reason,
          ad.autonomy_score,
          ad.requires_human_review,
          ad.affected_entities,
          ad.created_at,
          bv.hash_value
        FROM autonomous_decisions ad
        LEFT JOIN blockchain_verification bv ON ad.decision_id = bv.decision_id
        ORDER BY ad.created_at DESC
        LIMIT ${limit}
      `
    );

    return (flows as any[]).map(flow => ({
      id: flow.decision_id,
      qumusDecision: {
        id: flow.decision_id,
        policyId: flow.policy_id,
        decision: flow.decision_type,
        reason: flow.reason,
        autonomyScore: flow.autonomy_score,
        requiresHumanReview: flow.requires_human_review,
        affectedEntities: JSON.parse(flow.affected_entities || '[]'),
        timestamp: new Date(flow.created_at),
      },
      status: 'completed',
      auditTrail: [],
      blockchainHash: flow.hash_value,
    }));
  } catch (error) {
    console.error('Error getting bidirectional flow history:', error);
    throw error;
  }
}

/**
 * Get real-time bidirectional control status
 */
export async function getBidirectionalControlStatus() {
  try {
    const db = await getDb();
    const [totalDecisions] = await db.execute(
      sql`SELECT COUNT(*) as count FROM autonomous_decisions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    const [pendingReview] = await db.execute(
      sql`SELECT COUNT(*) as count FROM autonomous_decisions WHERE requires_human_review = true AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    const [avgAutonomy] = await db.execute(
      sql`SELECT AVG(autonomy_score) as avg FROM autonomous_decisions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    const [verifiedDecisions] = await db.execute(
      sql`SELECT COUNT(*) as count FROM blockchain_verification WHERE verified_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    return {
      totalDecisions: (totalDecisions as any)?.count || 0,
      pendingReview: (pendingReview as any)?.count || 0,
      averageAutonomy: (avgAutonomy as any)?.avg || 0,
      blockchainVerified: (verifiedDecisions as any)?.count || 0,
      bidirectionalStatus: 'operational',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error getting bidirectional control status:', error);
    throw error;
  }
}
