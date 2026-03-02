/**
 * Session Tagging & Organization Service
 * Manages tags, collections, and smart filtering for sessions
 */

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  usageCount: number;
}

export interface SessionTag {
  sessionId: string;
  tagId: string;
  addedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sessionIds: string[];
  createdAt: Date;
  createdBy: string;
  isSmartCollection: boolean;
  smartFilter?: SmartFilter;
}

export interface SmartFilter {
  tags?: string[];
  status?: string;
  dateRange?: { start: Date; end: Date };
  minExecutionTime?: number;
  maxExecutionTime?: number;
  toolTypes?: string[];
}

export class SessionTagManager {
  private tags: Map<string, Tag> = new Map();
  private sessionTags: Map<string, Set<string>> = new Map(); // sessionId -> tagIds
  private collections: Map<string, Collection> = new Map();

  /**
   * Create a new tag
   */
  createTag(
    name: string,
    color: string,
    userId: string,
    description?: string
  ): Tag {
    const tag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color,
      description,
      createdAt: new Date(),
      createdBy: userId,
      usageCount: 0,
    };

    this.tags.set(tag.id, tag);
    return tag;
  }

  /**
   * Get all tags
   */
  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }

  /**
   * Delete a tag
   */
  deleteTag(tagId: string): boolean {
    // Remove from all sessions
    const sessionTagsArray = Array.from(this.sessionTags.values());
    for (const sessionTags of sessionTagsArray) {
      sessionTags.delete(tagId);
    }

    return this.tags.delete(tagId);
  }

  /**
   * Add tag to session
   */
  addTagToSession(sessionId: string, tagId: string): boolean {
    const tag = this.tags.get(tagId);
    if (!tag) return false;

    if (!this.sessionTags.has(sessionId)) {
      this.sessionTags.set(sessionId, new Set());
    }

    const added = !this.sessionTags.get(sessionId)!.has(tagId);
    this.sessionTags.get(sessionId)!.add(tagId);

    if (added) {
      tag.usageCount++;
    }

    return true;
  }

  /**
   * Remove tag from session
   */
  removeTagFromSession(sessionId: string, tagId: string): boolean {
    const sessionTags = this.sessionTags.get(sessionId);
    if (!sessionTags) return false;

    const removed = sessionTags.has(tagId);
    sessionTags.delete(tagId);

    if (removed) {
      const tag = this.tags.get(tagId);
      if (tag) tag.usageCount--;
    }

    return removed;
  }

  /**
   * Get tags for a session
   */
  getSessionTags(sessionId: string): Tag[] {
    const tagIds = this.sessionTags.get(sessionId) || new Set();
    return Array.from(tagIds)
      .map((id) => this.tags.get(id))
      .filter((tag): tag is Tag => tag !== undefined);
  }

  /**
   * Get sessions with a specific tag
   */
  getSessionsWithTag(tagId: string): string[] {
    const sessions: string[] = [];

    const entriesArray = Array.from(this.sessionTags.entries());
    for (const [sessionId, tagIds] of entriesArray) {
      if (tagIds.has(tagId)) {
        sessions.push(sessionId);
      }
    }

    return sessions;
  }

  /**
   * Create a collection
   */
  createCollection(
    name: string,
    color: string,
    userId: string,
    description?: string,
    icon?: string
  ): Collection {
    const collection: Collection = {
      id: `collection-${Date.now()}`,
      name,
      color,
      icon,
      description,
      sessionIds: [],
      createdAt: new Date(),
      createdBy: userId,
      isSmartCollection: false,
    };

    this.collections.set(collection.id, collection);
    return collection;
  }

  /**
   * Create a smart collection
   */
  createSmartCollection(
    name: string,
    color: string,
    filter: SmartFilter,
    userId: string,
    description?: string
  ): Collection {
    const collection: Collection = {
      id: `collection-${Date.now()}`,
      name,
      color,
      description,
      sessionIds: [],
      createdAt: new Date(),
      createdBy: userId,
      isSmartCollection: true,
      smartFilter: filter,
    };

    this.collections.set(collection.id, collection);
    return collection;
  }

  /**
   * Add session to collection
   */
  addSessionToCollection(collectionId: string, sessionId: string): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection || collection.isSmartCollection) return false;

    if (!collection.sessionIds.includes(sessionId)) {
      collection.sessionIds.push(sessionId);
      return true;
    }

    return false;
  }

  /**
   * Remove session from collection
   */
  removeSessionFromCollection(
    collectionId: string,
    sessionId: string
  ): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection || collection.isSmartCollection) return false;

    const index = collection.sessionIds.indexOf(sessionId);
    if (index > -1) {
      collection.sessionIds.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get all collections
   */
  getAllCollections(): Collection[] {
    return Array.from(this.collections.values());
  }

  /**
   * Get collection by ID
   */
  getCollection(collectionId: string): Collection | null {
    return this.collections.get(collectionId) || null;
  }

  /**
   * Delete collection
   */
  deleteCollection(collectionId: string): boolean {
    return this.collections.delete(collectionId);
  }

  /**
   * Get sessions in collection
   */
  getCollectionSessions(collectionId: string): string[] {
    const collection = this.collections.get(collectionId);
    return collection?.sessionIds || [];
  }

  /**
   * Get popular tags
   */
  getPopularTags(limit = 10): Tag[] {
    return Array.from(this.tags.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Search tags
   */
  searchTags(query: string): Tag[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tags.values()).filter(
      (tag) =>
        tag.name.toLowerCase().includes(lowerQuery) ||
        tag.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get tag statistics
   */
  getTagStatistics(): {
    totalTags: number;
    totalCollections: number;
    smartCollections: number;
    averageTagsPerSession: number;
  } {
    const totalTags = this.tags.size;
    const totalCollections = this.collections.size;
    const smartCollections = Array.from(this.collections.values()).filter(
      (c) => c.isSmartCollection
    ).length;

    let totalSessionTags = 0;
    let sessionCount = 0;

    const sessionTagsArray = Array.from(this.sessionTags.values());
    for (const tagIds of sessionTagsArray) {
      totalSessionTags += tagIds.size;
      sessionCount++;
    }

    const averageTagsPerSession =
      sessionCount > 0 ? totalSessionTags / sessionCount : 0;

    return {
      totalTags,
      totalCollections,
      smartCollections,
      averageTagsPerSession: Math.round(averageTagsPerSession * 100) / 100,
    };
  }

  /**
   * Bulk tag sessions
   */
  bulkTagSessions(sessionIds: string[], tagIds: string[]): number {
    let count = 0;

    for (const sessionId of sessionIds) {
      for (const tagId of tagIds) {
        if (this.addTagToSession(sessionId, tagId)) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Bulk remove tags from sessions
   */
  bulkRemoveTags(sessionIds: string[], tagIds: string[]): number {
    let count = 0;

    for (const sessionId of sessionIds) {
      for (const tagId of tagIds) {
        if (this.removeTagFromSession(sessionId, tagId)) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Rename tag
   */
  renameTag(tagId: string, newName: string): Tag | null {
    const tag = this.tags.get(tagId);
    if (!tag) return null;

    tag.name = newName;
    return tag;
  }

  /**
   * Update tag color
   */
  updateTagColor(tagId: string, newColor: string): Tag | null {
    const tag = this.tags.get(tagId);
    if (!tag) return null;

    tag.color = newColor;
    return tag;
  }

  /**
   * Get sessions by multiple tags (AND operation)
   */
  getSessionsByTags(tagIds: string[]): string[] {
    if (tagIds.length === 0) return [];

    const sessionSets = tagIds.map((tagId) => new Set(this.getSessionsWithTag(tagId)));

    // Intersection of all sets
    let result = sessionSets[0] || new Set();
    for (let i = 1; i < sessionSets.length; i++) {
      const resultArray = Array.from(result);
      result = new Set(resultArray.filter((x) => sessionSets[i]!.has(x)));
    }

    return Array.from(result);
  }
}

// Export singleton instance
export const sessionTagManager = new SessionTagManager();
