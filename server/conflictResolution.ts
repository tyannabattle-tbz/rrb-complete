/**
 * Conflict Resolution Service
 * Handles automatic conflict resolution for concurrent edits
 */

export interface Edit {
  id: string;
  userId: string;
  timestamp: Date;
  type: "message" | "config" | "memory" | "tool";
  path: string;
  oldValue: unknown;
  newValue: unknown;
  sessionId: number;
}

export interface Conflict {
  id: string;
  edits: Edit[];
  type: "insert" | "update" | "delete";
  resolved: boolean;
  resolution?: "keep_first" | "keep_latest" | "merge" | "manual";
  resolvedValue?: unknown;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export class ConflictResolver {
  /**
   * Detect conflicts between concurrent edits
   */
  static detectConflicts(edits: Edit[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const editsByPath = new Map<string, Edit[]>();

    // Group edits by path
    for (const edit of edits) {
      const key = `${edit.sessionId}:${edit.path}`;
      if (!editsByPath.has(key)) {
        editsByPath.set(key, []);
      }
      editsByPath.get(key)!.push(edit);
    }

    // Find conflicts
    editsByPath.forEach((pathEdits) => {
      if (pathEdits.length > 1) {
        // Check if edits overlap in time or affect the same value
        const sorted = pathEdits.sort(
          (a: Edit, b: Edit) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        for (let i = 0; i < sorted.length - 1; i++) {
          const current = sorted[i];
          const next = sorted[i + 1];

          // Check if edits conflict
          if (this.editsConflict(current, next)) {
            conflicts.push({
              id: `conflict-${current.id}-${next.id}`,
              edits: [current, next],
              type: this.getConflictType(current, next),
              resolved: false,
            });
          }
        }
      }
    });

    return conflicts;
  }

  /**
   * Check if two edits conflict
   */
  private static editsConflict(edit1: Edit, edit2: Edit): boolean {
    // Same path and different users
    if (edit1.path === edit2.path && edit1.userId !== edit2.userId) {
      // Check if they modify the same value
      if (edit1.oldValue !== edit2.oldValue) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determine conflict type
   */
  private static getConflictType(
    edit1: Edit,
    edit2: Edit
  ): "insert" | "update" | "delete" {
    if (edit1.oldValue === null) return "insert";
    if (edit2.newValue === null) return "delete";
    return "update";
  }

  /**
   * Resolve conflicts automatically
   */
  static resolveConflicts(
    conflicts: Conflict[],
    strategy: "keep_first" | "keep_latest" | "merge" = "keep_latest"
  ): Conflict[] {
    return conflicts.map((conflict) => {
      let resolvedValue: unknown;

      switch (strategy) {
        case "keep_first":
          resolvedValue = conflict.edits[0].newValue;
          break;
        case "keep_latest":
          resolvedValue =
            conflict.edits[conflict.edits.length - 1].newValue;
          break;
        case "merge":
          resolvedValue = this.mergeValues(
            conflict.edits.map((e) => e.newValue)
          );
          break;
      }

      return {
        ...conflict,
        resolved: true,
        resolution: strategy,
        resolvedValue,
        resolvedAt: new Date(),
      };
    });
  }

  /**
   * Merge multiple values
   */
  private static mergeValues(values: unknown[]): unknown {
    // For arrays, merge unique values
    if (Array.isArray(values[0])) {
      const merged = new Set<unknown>();
      for (const arr of values) {
        if (Array.isArray(arr)) {
          arr.forEach((v) => merged.add(v));
        }
      }
      return Array.from(merged);
    }

    // For objects, merge properties
    if (typeof values[0] === "object" && values[0] !== null) {
      const merged = {};
      for (const obj of values) {
        if (typeof obj === "object" && obj !== null) {
          Object.assign(merged, obj);
        }
      }
      return merged;
    }

    // For primitives, return the latest value
    return values[values.length - 1];
  }

  /**
   * Get conflict summary for UI
   */
  static getConflictSummary(conflict: Conflict): string {
    const userIds = conflict.edits.map((e) => e.userId).join(" vs ");
    const type = conflict.type;
    return `Conflict: ${userIds} both tried to ${type} at ${conflict.edits[0].path}`;
  }

  /**
   * Get visual diff for conflict
   */
  static getConflictDiff(conflict: Conflict): {
    before: unknown;
    after1: unknown;
    after2: unknown;
  } {
    return {
      before: conflict.edits[0].oldValue,
      after1: conflict.edits[0].newValue,
      after2: conflict.edits[1].newValue,
    };
  }
}
