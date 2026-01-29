/**
 * Session Versioning Service
 * Handles version history, branching, and state restoration
 */

export interface SessionVersion {
  id: string;
  sessionId: number;
  versionNumber: number;
  parentVersionId?: string;
  branchName?: string;
  snapshot: SessionSnapshot;
  createdBy: string;
  createdAt: Date;
  description?: string;
  tags?: string[];
}

export interface SessionSnapshot {
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  config: {
    systemPrompt: string;
    temperature: number;
    model: string;
    maxSteps: number;
  };
  memory: Record<string, unknown>;
  toolExecutions: Array<{
    toolName: string;
    input: unknown;
    output: unknown;
    timestamp: Date;
  }>;
  status: string;
}

export interface SessionBranch {
  id: string;
  sessionId: number;
  name: string;
  headVersionId: string;
  createdAt: Date;
  createdBy: string;
  description?: string;
}

export class SessionVersionManager {
  /**
   * Create a new version from current session state
   */
  static createVersion(
    sessionId: number,
    snapshot: SessionSnapshot,
    createdBy: string,
    description?: string,
    parentVersionId?: string
  ): SessionVersion {
    return {
      id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      versionNumber: 1,
      parentVersionId,
      snapshot,
      createdBy,
      createdAt: new Date(),
      description,
      tags: [],
    };
  }

  /**
   * Create a branch from a version
   */
  static createBranch(
    sessionId: number,
    versionId: string,
    branchName: string,
    createdBy: string,
    description?: string
  ): SessionBranch {
    return {
      id: `branch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      name: branchName,
      headVersionId: versionId,
      createdAt: new Date(),
      createdBy,
      description,
    };
  }

  /**
   * Get version history for a session
   */
  static getVersionHistory(versions: SessionVersion[]): SessionVersion[] {
    return versions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Compare two versions
   */
  static compareVersions(
    version1: SessionVersion,
    version2: SessionVersion
  ): {
    messagesDiff: { added: number; removed: number; modified: number };
    configDiff: Record<string, { before: unknown; after: unknown }>;
    toolExecutionsDiff: { added: number; removed: number };
  } {
    const messagesDiff = {
      added: Math.max(
        0,
        version2.snapshot.messages.length - version1.snapshot.messages.length
      ),
      removed: Math.max(
        0,
        version1.snapshot.messages.length - version2.snapshot.messages.length
      ),
      modified: 0,
    };

    const configDiff: Record<string, { before: unknown; after: unknown }> = {};
    for (const key of Object.keys(version1.snapshot.config)) {
      const v1Val = (version1.snapshot.config as Record<string, unknown>)[key];
      const v2Val = (version2.snapshot.config as Record<string, unknown>)[key];
      if (v1Val !== v2Val) {
        configDiff[key] = { before: v1Val, after: v2Val };
      }
    }

    const toolExecutionsDiff = {
      added: Math.max(
        0,
        version2.snapshot.toolExecutions.length -
          version1.snapshot.toolExecutions.length
      ),
      removed: Math.max(
        0,
        version1.snapshot.toolExecutions.length -
          version2.snapshot.toolExecutions.length
      ),
    };

    return { messagesDiff, configDiff, toolExecutionsDiff };
  }

  /**
   * Restore session to a specific version
   */
  static restoreVersion(version: SessionVersion): SessionSnapshot {
    return {
      ...version.snapshot,
      messages: [...version.snapshot.messages],
      config: { ...version.snapshot.config },
      memory: { ...version.snapshot.memory },
      toolExecutions: [...version.snapshot.toolExecutions],
    };
  }

  /**
   * Merge two versions
   */
  static mergeVersions(
    baseVersion: SessionVersion,
    version1: SessionVersion,
    version2: SessionVersion
  ): SessionSnapshot {
    // Merge messages: combine unique messages
    const messageMap = new Map<string, unknown>();
    baseVersion.snapshot.messages.forEach((m, i) => {
      messageMap.set(`${i}`, m);
    });

    version1.snapshot.messages.forEach((m, i) => {
      if (!messageMap.has(`${i}`)) {
        messageMap.set(`${i}`, m);
      }
    });

    version2.snapshot.messages.forEach((m, i) => {
      if (!messageMap.has(`${i}`)) {
        messageMap.set(`${i}`, m);
      }
    });

    // Merge config: prefer version2, fallback to version1
    const mergedConfig = {
      ...baseVersion.snapshot.config,
      ...version1.snapshot.config,
      ...version2.snapshot.config,
    };

    // Merge memory: combine all keys
    const mergedMemory = {
      ...baseVersion.snapshot.memory,
      ...version1.snapshot.memory,
      ...version2.snapshot.memory,
    };

    // Merge tool executions: combine unique executions
    const toolMap = new Map<string, unknown>();
    baseVersion.snapshot.toolExecutions.forEach((t, i) => {
      toolMap.set(`${i}`, t);
    });
    version1.snapshot.toolExecutions.forEach((t, i) => {
      if (!toolMap.has(`${i}`)) {
        toolMap.set(`${i}`, t);
      }
    });
    version2.snapshot.toolExecutions.forEach((t, i) => {
      if (!toolMap.has(`${i}`)) {
        toolMap.set(`${i}`, t);
      }
    });

    return {
      messages: Array.from(messageMap.values()) as SessionSnapshot["messages"],
      config: mergedConfig,
      memory: mergedMemory,
      toolExecutions: Array.from(toolMap.values()) as SessionSnapshot["toolExecutions"],
      status: version2.snapshot.status,
    };
  }

  /**
   * Tag a version
   */
  static tagVersion(version: SessionVersion, tag: string): SessionVersion {
    return {
      ...version,
      tags: [...(version.tags || []), tag],
    };
  }

  /**
   * Get versions by tag
   */
  static getVersionsByTag(versions: SessionVersion[], tag: string): SessionVersion[] {
    return versions.filter((v) => v.tags?.includes(tag));
  }
}
