import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storeDecision, getAuditLogs } from "../_core/redis";
import { generateId } from "../_core/utils";

/**
 * Policy Versioning Router
 * Manages policy versions, history, and rollback capability
 */

interface PolicyVersion {
  versionId: string;
  policyName: string;
  version: number;
  rules: Array<{
    condition: string;
    action: string;
    priority: number;
  }>;
  description: string;
  createdBy: number;
  createdAt: string;
  active: boolean;
  changeLog: string;
}

// In-memory policy version store (in production, use database)
const policyVersions: Map<string, PolicyVersion[]> = new Map();

export const policyVersioningRouter = router({
  /**
   * Create a new policy version
   */
  createPolicyVersion: adminProcedure
    .input(
      z.object({
        policyName: z.string(),
        rules: z.array(
          z.object({
            condition: z.string(),
            action: z.string(),
            priority: z.number(),
          })
        ),
        description: z.string(),
        changeLog: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = generateId("decision");

      try {
        const policyKey = `policy-${input.policyName}`;
        const existingVersions = policyVersions.get(policyKey) || [];
        const nextVersion = existingVersions.length + 1;

        const newVersion: PolicyVersion = {
          versionId: generateId("version"),
          policyName: input.policyName,
          version: nextVersion,
          rules: input.rules,
          description: input.description,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          active: true,
          changeLog: input.changeLog,
        };

        // Deactivate previous version
        if (existingVersions.length > 0) {
          existingVersions[existingVersions.length - 1].active = false;
        }

        existingVersions.push(newVersion);
        policyVersions.set(policyKey, existingVersions);

        const decision = {
          decisionId,
          userId: ctx.user.id,
          policy: "policy-versioning-policy",
          action: "create_policy_version",
          reason: `Created version ${nextVersion} of ${input.policyName}`,
          state: {
            policyName: input.policyName,
            version: nextVersion,
            versionId: newVersion.versionId,
            changeLog: input.changeLog,
          },
          timestamp: new Date().toISOString(),
          success: true,
        };

        await storeDecision(decision);
        console.log(
          `[QUMUS Decision] ${decisionId} - Policy version created: ${input.policyName} v${nextVersion}`
        );

        return {
          decisionId,
          versionId: newVersion.versionId,
          version: nextVersion,
          policyName: input.policyName,
          createdAt: newVersion.createdAt,
        };
      } catch (error) {
        console.error("[Policy Versioning] Failed to create version:", error);
        throw error;
      }
    }),

  /**
   * Get policy version history
   */
  getPolicyHistory: protectedProcedure
    .input(z.object({ policyName: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const policyKey = `policy-${input.policyName}`;
        const versions = policyVersions.get(policyKey) || [];

        return versions.map((v: PolicyVersion) => ({
          versionId: v.versionId,
          version: v.version,
          description: v.description,
          createdBy: v.createdBy,
          createdAt: v.createdAt,
          active: v.active,
          changeLog: v.changeLog,
          ruleCount: v.rules.length,
        }));
      } catch (error) {
        console.error("[Policy Versioning] Failed to get history:", error);
        throw error;
      }
    }),

  /**
   * Get specific policy version details
   */
  getPolicyVersion: protectedProcedure
    .input(z.object({ versionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        for (const versions of Array.from(policyVersions.values())) {
          const version = versions.find((v: PolicyVersion) => v.versionId === input.versionId);
          if (version) {
            return {
              versionId: version.versionId,
              policyName: version.policyName,
              version: version.version,
              rules: version.rules,
              description: version.description,
              createdBy: version.createdBy,
              createdAt: version.createdAt,
              active: version.active,
              changeLog: version.changeLog,
            };
          }
        }

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Policy version not found",
        });
      } catch (error) {
        console.error("[Policy Versioning] Failed to get version:", error);
        throw error;
      }
    }),

  /**
   * Rollback to previous policy version
   */
  rollbackPolicyVersion: adminProcedure
    .input(
      z.object({
        policyName: z.string(),
        targetVersion: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = generateId("decision");

      try {
        const policyKey = `policy-${input.policyName}`;
        const versions = policyVersions.get(policyKey);

        if (!versions || versions.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Policy not found",
          });
        }

        const targetVersion = versions.find(
          (v) => v.version === input.targetVersion
        );
        if (!targetVersion) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Version ${input.targetVersion} not found`,
          });
        }

        // Deactivate current version
        const currentVersion = versions.find((v) => v.active);
        if (currentVersion) {
          currentVersion.active = false;
        }

        // Activate target version
        targetVersion.active = true;

        const decision = {
          decisionId,
          userId: ctx.user.id,
          policy: "policy-versioning-policy",
          action: "rollback_policy_version",
          reason: `Rolled back ${input.policyName} from v${currentVersion?.version} to v${input.targetVersion}`,
          state: {
            policyName: input.policyName,
            fromVersion: currentVersion?.version,
            toVersion: input.targetVersion,
            rollbackReason: "Manual rollback by admin",
          },
          timestamp: new Date().toISOString(),
          success: true,
        };

        await storeDecision(decision);
        console.log(
          `[QUMUS Decision] ${decisionId} - Policy rollback: ${input.policyName} to v${input.targetVersion}`
        );

        return {
          decisionId,
          policyName: input.policyName,
          activeVersion: input.targetVersion,
          rollbackTime: new Date().toISOString(),
          success: true,
        };
      } catch (error) {
        console.error("[Policy Versioning] Failed to rollback:", error);
        throw error;
      }
    }),

  /**
   * Compare two policy versions
   */
  comparePolicyVersions: protectedProcedure
    .input(
      z.object({
        versionId1: z.string(),
        versionId2: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let version1: PolicyVersion | undefined;
        let version2: PolicyVersion | undefined;

        for (const versions of Array.from(policyVersions.values())) {
          if (!version1) {
            version1 = versions.find((v: PolicyVersion) => v.versionId === input.versionId1);
          }
          if (!version2) {
            version2 = versions.find((v: PolicyVersion) => v.versionId === input.versionId2);
          }
        }

        if (!version1 || !version2) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or both versions not found",
          });
        }

        // Calculate differences
        const addedRules = version2.rules.filter(
          (r: any) =>
            !version1!.rules.some(
              (r1: any) => r1.condition === r.condition && r1.action === r.action
            )
        );

        const removedRules = version1.rules.filter(
          (r: any) =>
            !version2!.rules.some(
              (r2: any) => r2.condition === r.condition && r2.action === r.action
            )
        );

        const modifiedRules = version1.rules.filter((r1: any) => {
          const matching = version2!.rules.find(
            (r2: any) => r2.condition === r1.condition && r2.action === r1.action
          );
          return matching && matching.priority !== r1.priority;
        });

        return {
          version1: {
            versionId: version1.versionId,
            version: version1.version,
            description: version1.description,
            createdAt: version1.createdAt,
          },
          version2: {
            versionId: version2.versionId,
            version: version2.version,
            description: version2.description,
            createdAt: version2.createdAt,
          },
          differences: {
            addedRules: addedRules.length,
            removedRules: removedRules.length,
            modifiedRules: modifiedRules.length,
            details: {
              added: addedRules,
              removed: removedRules,
              modified: modifiedRules,
            },
          },
          summary: `${addedRules.length} added, ${removedRules.length} removed, ${modifiedRules.length} modified`,
        };
      } catch (error) {
        console.error("[Policy Versioning] Failed to compare:", error);
        throw error;
      }
    }),

  /**
   * Get all policy versions across all policies
   */
  getAllPolicyVersions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const allVersions: Array<{
        policyName: string;
        versions: number;
        activeVersion: number;
        lastUpdated: string;
      }> = [];

      for (const [key, versions] of Array.from(policyVersions.entries())) {
        const policyName = key.replace("policy-", "");
        const activeVersion = versions.find((v: PolicyVersion) => v.active);

        allVersions.push({
          policyName,
          versions: versions.length,
          activeVersion: activeVersion?.version || 0,
          lastUpdated: versions[versions.length - 1]?.createdAt || "",
        });
      }

      return allVersions;
    } catch (error) {
      console.error("[Policy Versioning] Failed to get all versions:", error);
      throw error;
    }
  }),

  /**
   * Delete old policy versions (keep last N versions)
   */
  cleanupOldVersions: adminProcedure
    .input(
      z.object({
        policyName: z.string(),
        keepVersions: z.number().min(1).default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = generateId("decision");

      try {
        const policyKey = `policy-${input.policyName}`;
        const versions = policyVersions.get(policyKey);

        if (!versions) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Policy not found",
          });
        }

        const versionsToDelete = Math.max(0, versions.length - input.keepVersions);
        if (versionsToDelete === 0) {
          return {
            decisionId,
            policyName: input.policyName,
            deleted: 0,
            remaining: versions.length,
          };
        }

        // Keep only the last N versions
        const keptVersions = versions.slice(-input.keepVersions);
        policyVersions.set(policyKey, keptVersions);

        const decision = {
          decisionId,
          userId: ctx.user.id,
          policy: "policy-versioning-policy",
          action: "cleanup_old_versions",
          reason: `Deleted ${versionsToDelete} old versions of ${input.policyName}`,
          state: {
            policyName: input.policyName,
            deleted: versionsToDelete,
            remaining: keptVersions.length,
          },
          timestamp: new Date().toISOString(),
          success: true,
        };

        await storeDecision(decision);
        console.log(
          `[QUMUS Decision] ${decisionId} - Cleanup: deleted ${versionsToDelete} versions`
        );

        return {
          decisionId,
          policyName: input.policyName,
          deleted: versionsToDelete,
          remaining: keptVersions.length,
        };
      } catch (error) {
        console.error("[Policy Versioning] Failed to cleanup:", error);
        throw error;
      }
    }),
});
