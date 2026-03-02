/**
 * Real-Time Collaboration Engine
 * Multi-user simultaneous editing with conflict resolution
 */

export interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  isActive: boolean;
  lastSeen: Date;
}

export interface CollaborativeAction {
  id: string;
  userId: string;
  type: 'create' | 'update' | 'delete' | 'move';
  targetId: string;
  targetType: 'scene' | 'effect' | 'voiceover' | 'soundeffect';
  changes: Record<string, unknown>;
  timestamp: number;
  version: number;
}

export interface CollaborativeState {
  filmId: string;
  version: number;
  users: Map<string, CollaborativeUser>;
  actionHistory: CollaborativeAction[];
  undoStack: CollaborativeAction[];
  redoStack: CollaborativeAction[];
  locks: Map<string, { userId: string; timestamp: number }>;
}

/**
 * Collaboration manager for handling multi-user editing
 */
export class CollaborationManager {
  private state: CollaborativeState;
  private listeners: Set<(action: CollaborativeAction) => void> = new Set();
  private conflictResolvers: Map<string, (actions: CollaborativeAction[]) => CollaborativeAction> =
    new Map();

  constructor(filmId: string) {
    this.state = {
      filmId,
      version: 0,
      users: new Map(),
      actionHistory: [],
      undoStack: [],
      redoStack: [],
      locks: new Map(),
    };
  }

  /**
   * Add a user to the collaboration session
   */
  addUser(user: CollaborativeUser): void {
    this.state.users.set(user.id, user);
    this.notifyListeners({
      id: `user-join-${Date.now()}`,
      userId: user.id,
      type: 'create',
      targetId: user.id,
      targetType: 'scene',
      changes: { user },
      timestamp: Date.now(),
      version: this.state.version,
    });
  }

  /**
   * Remove a user from the collaboration session
   */
  removeUser(userId: string): void {
    this.state.users.delete(userId);
    this.state.locks.forEach((lock, key) => {
      if (lock.userId === userId) {
        this.state.locks.delete(key);
      }
    });
  }

  /**
   * Apply an action with conflict detection and resolution
   */
  applyAction(action: CollaborativeAction): boolean {
    // Check for conflicts
    const conflicts = this.detectConflicts(action);

    if (conflicts.length > 0) {
      // Resolve conflicts
      const resolved = this.resolveConflicts([action, ...conflicts]);
      action = resolved;
    }

    // Apply the action
    this.state.actionHistory.push(action);
    this.state.version++;
    action.version = this.state.version;

    // Clear redo stack on new action
    this.state.redoStack = [];

    // Notify listeners
    this.notifyListeners(action);

    return true;
  }

  /**
   * Detect conflicts with existing actions
   */
  private detectConflicts(action: CollaborativeAction): CollaborativeAction[] {
    const conflicts: CollaborativeAction[] = [];
    const recentActions = this.state.actionHistory.slice(-10); // Check last 10 actions

    for (const existingAction of recentActions) {
      // Conflict if same target and different users
      if (
        existingAction.targetId === action.targetId &&
        existingAction.userId !== action.userId &&
        existingAction.timestamp > Date.now() - 5000 // Within 5 seconds
      ) {
        conflicts.push(existingAction);
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts using operational transformation
   */
  private resolveConflicts(actions: CollaborativeAction[]): CollaborativeAction {
    // Simple conflict resolution: last write wins
    // In production, use operational transformation or CRDT
    return actions[actions.length - 1];
  }

  /**
   * Lock a resource for editing
   */
  lockResource(resourceId: string, userId: string): boolean {
    const existingLock = this.state.locks.get(resourceId);

    if (existingLock && existingLock.userId !== userId) {
      // Check if lock is stale (older than 30 seconds)
      if (Date.now() - existingLock.timestamp < 30000) {
        return false; // Resource is locked by another user
      }
    }

    this.state.locks.set(resourceId, { userId, timestamp: Date.now() });
    return true;
  }

  /**
   * Unlock a resource
   */
  unlockResource(resourceId: string, userId: string): boolean {
    const lock = this.state.locks.get(resourceId);

    if (lock && lock.userId === userId) {
      this.state.locks.delete(resourceId);
      return true;
    }

    return false;
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (this.state.actionHistory.length === 0) return false;

    const action = this.state.actionHistory.pop();
    if (action) {
      this.state.undoStack.push(action);
      this.state.version++;
      this.notifyListeners({
        ...action,
        type: 'delete',
        version: this.state.version,
      });
      return true;
    }

    return false;
  }

  /**
   * Redo last undone action
   */
  redo(): boolean {
    if (this.state.undoStack.length === 0) return false;

    const action = this.state.undoStack.pop();
    if (action) {
      this.state.actionHistory.push(action);
      this.state.version++;
      this.notifyListeners({
        ...action,
        version: this.state.version,
      });
      return true;
    }

    return false;
  }

  /**
   * Get action history
   */
  getHistory(): CollaborativeAction[] {
    return [...this.state.actionHistory];
  }

  /**
   * Get active users
   */
  getActiveUsers(): CollaborativeUser[] {
    return Array.from(this.state.users.values()).filter((u) => u.isActive);
  }

  /**
   * Update user presence
   */
  updateUserPresence(userId: string, cursorPosition?: { x: number; y: number }): void {
    const user = this.state.users.get(userId);
    if (user) {
      user.cursorPosition = cursorPosition;
      user.lastSeen = new Date();
    }
  }

  /**
   * Subscribe to action changes
   */
  subscribe(listener: (action: CollaborativeAction) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(action: CollaborativeAction): void {
    this.listeners.forEach((listener) => listener(action));
  }

  /**
   * Get collaboration state
   */
  getState(): CollaborativeState {
    return {
      ...this.state,
      users: new Map(this.state.users),
      actionHistory: [...this.state.actionHistory],
      undoStack: [...this.state.undoStack],
      redoStack: [...this.state.redoStack],
      locks: new Map(this.state.locks),
    };
  }
}

/**
 * Create a collaboration manager instance
 */
export function createCollaborationManager(filmId: string): CollaborationManager {
  return new CollaborationManager(filmId);
}
