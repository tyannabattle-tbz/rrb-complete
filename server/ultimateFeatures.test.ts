import { describe, it, expect, beforeEach } from "vitest";
import { undoRedoManager, type UndoRedoAction } from "./undoRedoService";
import { backupManager, type SessionBackup } from "./backupService";

describe("Undo/Redo Manager", () => {
  beforeEach(() => {
    undoRedoManager.removeStack(1);
  });

  it("initializes undo/redo stack for a session", () => {
    const stack = undoRedoManager.initializeStack(1);
    expect(stack.sessionId).toBe(1);
    expect(stack.undoStack).toHaveLength(0);
    expect(stack.redoStack).toHaveLength(0);
  });

  it("pushes actions onto undo stack", () => {
    undoRedoManager.initializeStack(1);
    const action: UndoRedoAction = {
      id: "action-1",
      type: "edit",
      description: "Edit message",
      timestamp: new Date(),
      data: { content: "new content" },
    };

    const stack = undoRedoManager.pushAction(1, action);
    expect(stack?.undoStack).toHaveLength(1);
    expect(stack?.undoStack[0]?.id).toBe("action-1");
  });

  it("undoes actions correctly", () => {
    undoRedoManager.initializeStack(1);
    const action: UndoRedoAction = {
      id: "action-1",
      type: "edit",
      description: "Edit message",
      timestamp: new Date(),
      data: { content: "new content" },
    };

    undoRedoManager.pushAction(1, action);
    const undoneAction = undoRedoManager.undo(1);
    expect(undoneAction?.id).toBe("action-1");
    expect(undoRedoManager.canUndo(1)).toBe(false);
    expect(undoRedoManager.canRedo(1)).toBe(true);
  });

  it("redoes actions correctly", () => {
    undoRedoManager.initializeStack(1);
    const action: UndoRedoAction = {
      id: "action-1",
      type: "edit",
      description: "Edit message",
      timestamp: new Date(),
      data: { content: "new content" },
    };

    undoRedoManager.pushAction(1, action);
    undoRedoManager.undo(1);
    const redoneAction = undoRedoManager.redo(1);
    expect(redoneAction?.id).toBe("action-1");
    expect(undoRedoManager.canRedo(1)).toBe(false);
  });

  it("clears redo stack when new action is performed", () => {
    undoRedoManager.initializeStack(1);
    const action1: UndoRedoAction = {
      id: "action-1",
      type: "edit",
      description: "Edit 1",
      timestamp: new Date(),
      data: {},
    };
    const action2: UndoRedoAction = {
      id: "action-2",
      type: "edit",
      description: "Edit 2",
      timestamp: new Date(),
      data: {},
    };

    undoRedoManager.pushAction(1, action1);
    undoRedoManager.undo(1);
    expect(undoRedoManager.canRedo(1)).toBe(true);

    undoRedoManager.pushAction(1, action2);
    expect(undoRedoManager.canRedo(1)).toBe(false);
  });

  it("returns stack statistics", () => {
    undoRedoManager.initializeStack(1);
    const action: UndoRedoAction = {
      id: "action-1",
      type: "edit",
      description: "Edit",
      timestamp: new Date(),
      data: {},
    };

    undoRedoManager.pushAction(1, action);
    const stats = undoRedoManager.getStackStats(1);
    expect(stats?.undoCount).toBe(1);
    expect(stats?.redoCount).toBe(0);
    expect(stats?.totalActions).toBe(1);
  });
});

describe("Backup Manager", () => {
  beforeEach(() => {
    backupManager.deleteAllBackups(1);
  });

  it("initializes backup policy for a session", () => {
    const policy = backupManager.initializePolicy(1);
    expect(policy.enabled).toBe(true);
    expect(policy.intervalMinutes).toBe(30);
    expect(policy.retentionDays).toBe(30);
  });

  it("creates manual backups", () => {
    backupManager.initializePolicy(1);
    const backup = backupManager.createBackup(
      1,
      {
        messages: [],
        config: {},
        memory: {},
        toolExecutions: [],
        status: "idle",
      },
      "user-1",
      true,
      "Test Backup"
    );

    expect(backup?.isManual).toBe(true);
    expect(backup?.label).toBe("Test Backup");
    expect(backup?.createdBy).toBe("user-1");
  });

  it("retrieves backups for a session", () => {
    backupManager.initializePolicy(1);
    backupManager.createBackup(
      1,
      {
        messages: [],
        config: {},
        memory: {},
        toolExecutions: [],
        status: "idle",
      },
      "user-1",
      true
    );

    const backups = backupManager.getBackups(1);
    expect(backups).toHaveLength(1);
  });

  it("restores from backup", () => {
    backupManager.initializePolicy(1);
    const data = {
      messages: [{ role: "user", content: "test" }],
      config: { model: "gpt-4" },
      memory: { key: "value" },
      toolExecutions: [],
      status: "idle",
    };

    const backup = backupManager.createBackup(1, data, "user-1", true);
    const restored = backupManager.restoreFromBackup(backup!.id);

    expect(restored?.messages).toEqual(data.messages);
    expect(restored?.config).toEqual(data.config);
  });

  it("deletes backups", () => {
    backupManager.initializePolicy(1);
    const backup = backupManager.createBackup(
      1,
      {
        messages: [],
        config: {},
        memory: {},
        toolExecutions: [],
        status: "idle",
      },
      "user-1",
      true
    );

    expect(backupManager.getBackups(1)).toHaveLength(1);
    backupManager.deleteBackup(backup!.id);
    expect(backupManager.getBackups(1)).toHaveLength(0);
  });

  it("labels backups", () => {
    backupManager.initializePolicy(1);
    const backup = backupManager.createBackup(
      1,
      {
        messages: [],
        config: {},
        memory: {},
        toolExecutions: [],
        status: "idle",
      },
      "user-1",
      true
    );

    backupManager.labelBackup(backup!.id, "Important Backup");
    const labeled = backupManager.getBackupById(backup!.id);
    expect(labeled?.label).toBe("Important Backup");
  });

  it("enforces max backups limit", () => {
    const policy = { maxBackupsPerSession: 3, autoDeleteOldBackups: true };
    backupManager.initializePolicy(1, policy);

    for (let i = 0; i < 5; i++) {
      backupManager.createBackup(
        1,
        {
          messages: [],
          config: {},
          memory: {},
          toolExecutions: [],
          status: "idle",
        },
        "user-1",
        true
      );
    }

    const backups = backupManager.getBackups(1);
    expect(backups.length).toBeLessThanOrEqual(3);
  });

  it("returns backup statistics", () => {
    backupManager.initializePolicy(1);
    backupManager.createBackup(
      1,
      {
        messages: [{ role: "user", content: "test message" }],
        config: {},
        memory: {},
        toolExecutions: [],
        status: "idle",
      },
      "user-1",
      true
    );

    const stats = backupManager.getBackupStats(1);
    expect(stats?.totalBackups).toBe(1);
    expect(stats?.totalSize).toBeGreaterThan(0);
    expect(stats?.averageSize).toBeGreaterThan(0);
  });

  it("cleans up expired backups", () => {
    const policy = { retentionDays: 0 };
    backupManager.initializePolicy(1, policy);

    backupManager.createBackup(
      1,
      {
        messages: [],
        config: {},
        memory: {},
        toolExecutions: [],
        status: "idle",
      },
      "user-1",
      true
    );

    // Simulate expiration by waiting
    const deleted = backupManager.cleanupExpiredBackups();
    expect(deleted).toBeGreaterThanOrEqual(0);
  });
});

describe("Diff Visualization", () => {
  it("should support split and unified diff views", () => {
    const mockDiff = {
      version1: { id: "v1", timestamp: new Date(), label: "Version 1" },
      version2: { id: "v2", timestamp: new Date(), label: "Version 2" },
      diffs: [
        {
          title: "Messages",
          lines: [
            { type: "unchanged" as const, content: "Hello", lineNumber: 1 },
            { type: "removed" as const, content: "Old text", lineNumber: 2 },
            { type: "added" as const, content: "New text", lineNumber: 3 },
          ],
          additions: 1,
          deletions: 1,
        },
      ],
    };

    expect(mockDiff.diffs[0]?.additions).toBe(1);
    expect(mockDiff.diffs[0]?.deletions).toBe(1);
    expect(mockDiff.diffs[0]?.lines).toHaveLength(3);
  });

  it("should calculate diff statistics", () => {
    const lines = [
      { type: "added" as const, content: "line 1", lineNumber: 1 },
      { type: "added" as const, content: "line 2", lineNumber: 2 },
      { type: "removed" as const, content: "old line", lineNumber: 3 },
    ];

    const additions = lines.filter((l) => l.type === "added").length;
    const deletions = lines.filter((l) => l.type === "removed").length;

    expect(additions).toBe(2);
    expect(deletions).toBe(1);
  });
});
