/**
 * QUMUS Memory System
 * 
 * Provides persistent memory for the autonomous agent
 * Includes: facts, experiences, context, and learning
 */

export interface Fact {
  key: string;
  value: any;
  timestamp: Date;
  confidence: number;
  source: string;
}

export interface Experience {
  id: string;
  taskId: string;
  action: string;
  result: any;
  outcome: "success" | "failure";
  timestamp: Date;
  learnings: string[];
}

export interface ContextEntry {
  key: string;
  value: any;
  expiresAt?: Date;
}

export class MemorySystem {
  private facts: Map<string, Fact> = new Map();
  private experiences: Experience[] = [];
  private context: Map<string, ContextEntry> = new Map();
  private maxExperiences = 10000;

  /**
   * Store a fact
   */
  storeFact(
    key: string,
    value: any,
    confidence: number = 1.0,
    source: string = "system"
  ): void {
    const fact: Fact = {
      key,
      value,
      timestamp: new Date(),
      confidence,
      source,
    };
    this.facts.set(key, fact);
    console.log(`[Memory] Fact stored: ${key} (confidence: ${confidence})`);
  }

  /**
   * Retrieve a fact
   */
  retrieveFact(key: string): Fact | undefined {
    return this.facts.get(key);
  }

  /**
   * Search facts by pattern
   */
  searchFacts(pattern: string): Fact[] {
    const regex = new RegExp(pattern, "i");
    return Array.from(this.facts.values()).filter((f) =>
      regex.test(f.key)
    );
  }

  /**
   * Store an experience
   */
  storeExperience(
    taskId: string,
    action: string,
    result: any,
    outcome: "success" | "failure",
    learnings: string[] = []
  ): Experience {
    const experience: Experience = {
      id: `exp-${Date.now()}`,
      taskId,
      action,
      result,
      outcome,
      timestamp: new Date(),
      learnings,
    };

    this.experiences.push(experience);

    // Trim old experiences if exceeding limit
    if (this.experiences.length > this.maxExperiences) {
      this.experiences = this.experiences.slice(-this.maxExperiences);
    }

    console.log(
      `[Memory] Experience stored: ${experience.id} (${outcome})`
    );
    return experience;
  }

  /**
   * Get recent experiences
   */
  getRecentExperiences(count: number = 10): Experience[] {
    return this.experiences.slice(-count);
  }

  /**
   * Get experiences for a task
   */
  getTaskExperiences(taskId: string): Experience[] {
    return this.experiences.filter((e) => e.taskId === taskId);
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.experiences.length === 0) return 0;
    const successes = this.experiences.filter(
      (e) => e.outcome === "success"
    ).length;
    return successes / this.experiences.length;
  }

  /**
   * Get learnings from experiences
   */
  getLearnings(): string[] {
    const learnings = new Set<string>();
    for (const exp of this.experiences) {
      exp.learnings.forEach((l) => learnings.add(l));
    }
    return Array.from(learnings);
  }

  /**
   * Set context
   */
  setContext(key: string, value: any, expiresIn?: number): void {
    const entry: ContextEntry = {
      key,
      value,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
    };
    this.context.set(key, entry);
    console.log(`[Memory] Context set: ${key}`);
  }

  /**
   * Get context
   */
  getContext(key: string): any {
    const entry = this.context.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.context.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Clear expired context
   */
  clearExpiredContext(): void {
    const now = new Date();
    for (const [key, entry] of this.context.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.context.delete(key);
      }
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    factCount: number;
    experienceCount: number;
    contextSize: number;
    successRate: number;
    learningCount: number;
  } {
    return {
      factCount: this.facts.size,
      experienceCount: this.experiences.length,
      contextSize: this.context.size,
      successRate: this.getSuccessRate(),
      learningCount: this.getLearnings().length,
    };
  }

  /**
   * Clear all memory
   */
  clearAll(): void {
    this.facts.clear();
    this.experiences = [];
    this.context.clear();
    console.log("[Memory] All memory cleared");
  }

  /**
   * Export memory to JSON
   */
  export(): {
    facts: Record<string, Fact>;
    experiences: Experience[];
    context: Record<string, ContextEntry>;
  } {
    return {
      facts: Object.fromEntries(this.facts),
      experiences: this.experiences,
      context: Object.fromEntries(this.context),
    };
  }

  /**
   * Import memory from JSON
   */
  import(data: {
    facts?: Record<string, Fact>;
    experiences?: Experience[];
    context?: Record<string, ContextEntry>;
  }): void {
    if (data.facts) {
      this.facts = new Map(Object.entries(data.facts));
    }
    if (data.experiences) {
      this.experiences = data.experiences;
    }
    if (data.context) {
      this.context = new Map(Object.entries(data.context));
    }
    console.log("[Memory] Memory imported");
  }
}

// Global memory instance
let memoryInstance: MemorySystem | null = null;

export function getMemorySystem(): MemorySystem {
  if (!memoryInstance) {
    memoryInstance = new MemorySystem();
  }
  return memoryInstance;
}
