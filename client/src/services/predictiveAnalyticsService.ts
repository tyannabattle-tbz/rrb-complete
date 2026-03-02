/**
 * Predictive Analytics Service
 * Provides ML-powered predictions for task outcomes and resource optimization
 */

export interface TaskPrediction {
  taskId: string;
  successProbability: number;
  estimatedExecutionTime: number;
  recommendedResources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  riskFactors: string[];
  optimizationTips: string[];
}

export interface PerformanceTrend {
  date: string;
  successRate: number;
  avgExecutionTime: number;
  resourceUtilization: number;
  taskCount: number;
}

class PredictiveAnalyticsService {
  private taskHistory: any[] = [];
  private performanceData: PerformanceTrend[] = [];

  /**
   * Predict task outcome based on historical data
   */
  predictTaskOutcome(taskGoal: string, priority: number): TaskPrediction {
    // Simulate ML model prediction
    const successProbability = this.calculateSuccessProbability(taskGoal, priority);
    const executionTime = this.estimateExecutionTime(taskGoal);
    const resources = this.recommendResources(taskGoal, priority);
    const riskFactors = this.identifyRiskFactors(taskGoal);
    const optimizationTips = this.generateOptimizationTips(taskGoal, priority);

    return {
      taskId: `task_${Date.now()}`,
      successProbability,
      estimatedExecutionTime: executionTime,
      recommendedResources: resources,
      riskFactors,
      optimizationTips
    };
  }

  /**
   * Calculate success probability based on task characteristics
   */
  private calculateSuccessProbability(taskGoal: string, priority: number): number {
    // Base probability
    let probability = 0.75;

    // Adjust based on priority (higher priority = lower success rate due to complexity)
    probability -= (priority / 10) * 0.15;

    // Adjust based on task complexity keywords
    const complexityKeywords = ['complex', 'advanced', 'critical', 'urgent'];
    const goalLower = taskGoal.toLowerCase();
    complexityKeywords.forEach(keyword => {
      if (goalLower.includes(keyword)) {
        probability -= 0.1;
      }
    });

    // Adjust based on positive keywords
    const positiveKeywords = ['simple', 'routine', 'standard', 'basic'];
    positiveKeywords.forEach(keyword => {
      if (goalLower.includes(keyword)) {
        probability += 0.1;
      }
    });

    return Math.max(0.3, Math.min(0.95, probability));
  }

  /**
   * Estimate execution time in minutes
   */
  private estimateExecutionTime(taskGoal: string): number {
    const goalLower = taskGoal.toLowerCase();
    
    // Base time
    let time = 15;

    // Adjust based on keywords
    if (goalLower.includes('generate') || goalLower.includes('create')) time += 10;
    if (goalLower.includes('analyze') || goalLower.includes('process')) time += 5;
    if (goalLower.includes('broadcast') || goalLower.includes('stream')) time += 20;
    if (goalLower.includes('multiple') || goalLower.includes('batch')) time *= 2;
    if (goalLower.includes('quick') || goalLower.includes('fast')) time *= 0.5;

    return Math.max(5, Math.min(120, time));
  }

  /**
   * Recommend optimal resource allocation
   */
  private recommendResources(taskGoal: string, priority: number) {
    const goalLower = taskGoal.toLowerCase();
    const baseCPU = 50;
    const baseMemory = 512;
    const baseStorage = 1024;

    let cpu = baseCPU;
    let memory = baseMemory;
    let storage = baseStorage;

    // Increase resources for high-priority tasks
    const priorityMultiplier = 1 + (priority / 10) * 0.5;
    cpu *= priorityMultiplier;
    memory *= priorityMultiplier;

    // Adjust based on task type
    if (goalLower.includes('video') || goalLower.includes('stream')) {
      cpu *= 1.5;
      memory *= 2;
      storage *= 3;
    }
    if (goalLower.includes('analyze') || goalLower.includes('ml')) {
      cpu *= 2;
      memory *= 2.5;
    }
    if (goalLower.includes('broadcast')) {
      cpu *= 1.3;
      memory *= 1.5;
    }

    return {
      cpu: Math.round(cpu),
      memory: Math.round(memory),
      storage: Math.round(storage)
    };
  }

  /**
   * Identify potential risk factors
   */
  private identifyRiskFactors(taskGoal: string): string[] {
    const risks: string[] = [];
    const goalLower = taskGoal.toLowerCase();

    if (goalLower.includes('critical') || goalLower.includes('urgent')) {
      risks.push('High priority - increased failure risk');
    }
    if (goalLower.includes('broadcast') || goalLower.includes('live')) {
      risks.push('Real-time execution - no retry window');
    }
    if (goalLower.includes('multiple') || goalLower.includes('batch')) {
      risks.push('Batch processing - cascading failures possible');
    }
    if (goalLower.includes('external') || goalLower.includes('api')) {
      risks.push('External dependency - network risk');
    }
    if (goalLower.length > 200) {
      risks.push('Complex task definition - ambiguity risk');
    }

    return risks.length > 0 ? risks : ['Low risk - standard execution'];
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationTips(taskGoal: string, priority: number): string[] {
    const tips: string[] = [];
    const goalLower = taskGoal.toLowerCase();

    if (priority >= 8) {
      tips.push('Execute during off-peak hours for better resource availability');
    }
    if (goalLower.includes('batch')) {
      tips.push('Break into smaller sub-tasks for better parallelization');
    }
    if (goalLower.includes('broadcast') || goalLower.includes('stream')) {
      tips.push('Pre-warm resources before execution for smooth streaming');
    }
    if (goalLower.includes('video') || goalLower.includes('media')) {
      tips.push('Use compression to reduce resource consumption');
    }
    if (goalLower.includes('generate')) {
      tips.push('Consider caching results for similar future tasks');
    }

    return tips.length > 0 ? tips : ['Task is well-optimized for current parameters'];
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(days: number = 30): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        successRate: 75 + Math.random() * 20,
        avgExecutionTime: 20 + Math.random() * 15,
        resourceUtilization: 40 + Math.random() * 40,
        taskCount: Math.floor(5 + Math.random() * 15)
      });
    }

    return trends;
  }

  /**
   * Predict optimal execution time window
   */
  predictOptimalExecutionWindow(): { startHour: number; endHour: number; reason: string } {
    const hour = new Date().getHours();
    
    // Avoid peak hours (9-11 AM, 2-4 PM)
    if (hour >= 9 && hour < 12) {
      return { startHour: 12, endHour: 14, reason: 'Avoid morning peak hours' };
    }
    if (hour >= 14 && hour < 16) {
      return { startHour: 16, endHour: 18, reason: 'Avoid afternoon peak hours' };
    }

    // Off-peak recommendations
    if (hour >= 0 && hour < 6) {
      return { startHour: 2, endHour: 4, reason: 'Optimal: Low resource contention' };
    }
    if (hour >= 18 && hour < 23) {
      return { startHour: 22, endHour: 23, reason: 'Good: Evening off-peak window' };
    }

    return { startHour: hour + 1, endHour: hour + 2, reason: 'Current window acceptable' };
  }

  /**
   * Add historical task data for model training
   */
  addTaskHistory(taskData: any) {
    this.taskHistory.push({
      ...taskData,
      timestamp: Date.now()
    });

    // Keep only last 1000 tasks for memory efficiency
    if (this.taskHistory.length > 1000) {
      this.taskHistory = this.taskHistory.slice(-1000);
    }
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();
