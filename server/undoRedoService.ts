/**
 * Undo/Redo Stack Service
 * Manages undo/redo operations for session editing with keyboard shortcuts
 */

export interface UndoRedoAction {
  id: string;
  type: "edit" | "delete" | "create" | "update";
  description: string;
  timestamp: Date;
  data: Record<string, unknown>;
  previousState?: Record<string, unknown>;
}

export interface UndoRedoStack {
  sessionId: number;
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
  maxStackSize: number;
}

export class UndoRedoManager {
  private stacks: Map<number, UndoRedoStack> = new Map();
  private readonly MAX_STACK_SIZE = 100;

  /**
   * Initialize undo/redo stack for a session
   */
  initializeStack(sessionId: number): UndoRedoStack {
    const stack: UndoRedoStack = {
      sessionId,
      undoStack: [],
      redoStack: [],
      maxStackSize: this.MAX_STACK_SIZE,
    };
    this.stacks.set(sessionId, stack);
    return stack;
  }

  /**
   * Push an action onto the undo stack
   */
  pushAction(
    sessionId: number,
    action: UndoRedoAction
  ): UndoRedoStack | null {
    let stack = this.stacks.get(sessionId);
    if (!stack) {
      stack = this.initializeStack(sessionId);
    }

    stack.undoStack.push(action);
    stack.redoStack = []; // Clear redo stack when new action is performed

    // Maintain max stack size
    if (stack.undoStack.length > stack.maxStackSize) {
      stack.undoStack.shift();
    }

    return stack;
  }

  /**
   * Undo the last action
   */
  undo(sessionId: number): UndoRedoAction | null {
    const stack = this.stacks.get(sessionId);
    if (!stack || stack.undoStack.length === 0) {
      return null;
    }

    const action = stack.undoStack.pop();
    if (action) {
      stack.redoStack.push(action);
    }

    return action || null;
  }

  /**
   * Redo the last undone action
   */
  redo(sessionId: number): UndoRedoAction | null {
    const stack = this.stacks.get(sessionId);
    if (!stack || stack.redoStack.length === 0) {
      return null;
    }

    const action = stack.redoStack.pop();
    if (action) {
      stack.undoStack.push(action);
    }

    return action || null;
  }

  /**
   * Check if undo is available
   */
  canUndo(sessionId: number): boolean {
    const stack = this.stacks.get(sessionId);
    return stack ? stack.undoStack.length > 0 : false;
  }

  /**
   * Check if redo is available
   */
  canRedo(sessionId: number): boolean {
    const stack = this.stacks.get(sessionId);
    return stack ? stack.redoStack.length > 0 : false;
  }

  /**
   * Get undo stack history
   */
  getUndoHistory(sessionId: number): UndoRedoAction[] {
    const stack = this.stacks.get(sessionId);
    return stack ? [...stack.undoStack] : [];
  }

  /**
   * Get redo stack history
   */
  getRedoHistory(sessionId: number): UndoRedoAction[] {
    const stack = this.stacks.get(sessionId);
    return stack ? [...stack.redoStack] : [];
  }

  /**
   * Clear all undo/redo history for a session
   */
  clearHistory(sessionId: number): void {
    const stack = this.stacks.get(sessionId);
    if (stack) {
      stack.undoStack = [];
      stack.redoStack = [];
    }
  }

  /**
   * Get stack statistics
   */
  getStackStats(sessionId: number): {
    undoCount: number;
    redoCount: number;
    totalActions: number;
  } | null {
    const stack = this.stacks.get(sessionId);
    if (!stack) {
      return null;
    }

    return {
      undoCount: stack.undoStack.length,
      redoCount: stack.redoStack.length,
      totalActions: stack.undoStack.length + stack.redoStack.length,
    };
  }

  /**
   * Batch multiple actions into a single undo step
   */
  batchActions(
    sessionId: number,
    actions: UndoRedoAction[],
    description: string
  ): UndoRedoStack | null {
    if (actions.length === 0) {
      return this.stacks.get(sessionId) || null;
    }

    const batchAction: UndoRedoAction = {
      id: `batch-${Date.now()}`,
      type: "update",
      description,
      timestamp: new Date(),
      data: { actions },
    };

    return this.pushAction(sessionId, batchAction);
  }

  /**
   * Remove a session's undo/redo stack
   */
  removeStack(sessionId: number): void {
    this.stacks.delete(sessionId);
  }
}

// Export singleton instance
export const undoRedoManager = new UndoRedoManager();
