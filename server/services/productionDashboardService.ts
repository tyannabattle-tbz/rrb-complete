/**
 * Production Dashboard Service
 * Manages project tracking, transcoding jobs, QA results, and production metrics
 */

export interface ProjectMetrics {
  projectId: string;
  name: string;
  status: 'pre-production' | 'production' | 'post-production' | 'completed';
  progress: number;
  duration: number;
  format: string;
  createdAt: Date;
  updatedAt: Date;
  teamSize: number;
  budget: number;
  spent: number;
}

export interface TranscodingJob {
  jobId: string;
  projectId: string;
  sourceFile: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime: number;
  outputFile?: string;
  errorMessage?: string;
}

export interface QAResult {
  resultId: string;
  projectId: string;
  checkType: 'compliance' | 'quality' | 'accessibility' | 'security';
  status: 'passed' | 'failed' | 'warning';
  issues: Array<{
    severity: 'critical' | 'major' | 'minor';
    description: string;
    location?: string;
  }>;
  completedAt: Date;
}

export const productionDashboardService = {
  /**
   * Get all active projects with real-time status
   */
  getActiveProjects: async (): Promise<ProjectMetrics[]> => {
    return [
      {
        projectId: 'proj-001',
        name: 'Documentary: Legacy Stories',
        status: 'post-production',
        progress: 75,
        duration: 120,
        format: '4K',
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date(),
        teamSize: 8,
        budget: 50000,
        spent: 38000,
      },
      {
        projectId: 'proj-002',
        name: 'Commercial: Brand Campaign',
        status: 'production',
        progress: 45,
        duration: 30,
        format: '1080p',
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date(),
        teamSize: 5,
        budget: 25000,
        spent: 12000,
      },
      {
        projectId: 'proj-003',
        name: 'Podcast Series: Voices',
        status: 'post-production',
        progress: 60,
        duration: 45,
        format: 'audio',
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date(),
        teamSize: 3,
        budget: 15000,
        spent: 9000,
      },
    ];
  },

  /**
   * Get transcoding job queue with progress
   */
  getTranscodingQueue: async (): Promise<TranscodingJob[]> => {
    return [
      {
        jobId: 'job-001',
        projectId: 'proj-001',
        sourceFile: 'documentary-master.mov',
        targetFormat: 'mp4',
        status: 'processing',
        progress: 65,
        startedAt: new Date(Date.now() - 3600000),
        estimatedTime: 7200,
        errorMessage: undefined,
      },
      {
        jobId: 'job-002',
        projectId: 'proj-001',
        sourceFile: 'documentary-master.mov',
        targetFormat: 'prores',
        status: 'pending',
        progress: 0,
        estimatedTime: 5400,
        errorMessage: undefined,
      },
      {
        jobId: 'job-003',
        projectId: 'proj-002',
        sourceFile: 'commercial-edit.mov',
        targetFormat: 'h265',
        status: 'completed',
        progress: 100,
        completedAt: new Date(Date.now() - 1800000),
        estimatedTime: 1800,
        outputFile: 'commercial-h265.mp4',
      },
    ];
  },

  /**
   * Get QA results and compliance status
   */
  getQAResults: async (projectId: string): Promise<QAResult[]> => {
    return [
      {
        resultId: 'qa-001',
        projectId,
        checkType: 'compliance',
        status: 'passed',
        issues: [],
        completedAt: new Date(Date.now() - 3600000),
      },
      {
        resultId: 'qa-002',
        projectId,
        checkType: 'quality',
        status: 'warning',
        issues: [
          {
            severity: 'minor',
            description: 'Audio level slightly below -23 LUFS in segment 3',
            location: '00:15:30 - 00:16:00',
          },
        ],
        completedAt: new Date(Date.now() - 1800000),
      },
      {
        resultId: 'qa-003',
        projectId,
        checkType: 'accessibility',
        status: 'passed',
        issues: [],
        completedAt: new Date(Date.now() - 900000),
      },
    ];
  },

  /**
   * Get production metrics and analytics
   */
  getProductionMetrics: async () => {
    return {
      totalProjects: 12,
      activeProjects: 3,
      completedProjects: 9,
      averageProductionTime: 45,
      totalBudget: 250000,
      totalSpent: 185000,
      teamMembers: 25,
      transcodingJobsCompleted: 156,
      averageQualityScore: 9.2,
      deliveryOnTimePercentage: 94,
    };
  },

  /**
   * Get project timeline with milestones
   */
  getProjectTimeline: async (projectId: string) => {
    return {
      projectId,
      milestones: [
        {
          name: 'Pre-Production',
          startDate: new Date('2026-01-15'),
          endDate: new Date('2026-01-25'),
          status: 'completed',
        },
        {
          name: 'Principal Photography',
          startDate: new Date('2026-01-26'),
          endDate: new Date('2026-02-15'),
          status: 'completed',
        },
        {
          name: 'Post-Production',
          startDate: new Date('2026-02-16'),
          endDate: new Date('2026-03-15'),
          status: 'in-progress',
        },
        {
          name: 'Final Delivery',
          startDate: new Date('2026-03-16'),
          endDate: new Date('2026-03-20'),
          status: 'pending',
        },
      ],
    };
  },

  /**
   * Get team activity and collaboration metrics
   */
  getTeamActivity: async (projectId: string) => {
    return {
      projectId,
      recentActivity: [
        {
          timestamp: new Date(Date.now() - 300000),
          user: 'Alice Johnson',
          action: 'Uploaded color graded footage',
          details: '4 clips, 2.3 GB',
        },
        {
          timestamp: new Date(Date.now() - 600000),
          user: 'Bob Smith',
          action: 'Approved final edit',
          details: 'Version 5 - Ready for delivery',
        },
        {
          timestamp: new Date(Date.now() - 900000),
          user: 'Carol Williams',
          action: 'Added comments to timeline',
          details: '8 comments on audio mixing',
        },
      ],
      collaborators: 8,
      commentsCount: 45,
      versionsCount: 12,
    };
  },

  /**
   * Get budget tracking and resource allocation
   */
  getBudgetTracking: async (projectId: string) => {
    return {
      projectId,
      totalBudget: 50000,
      spent: 38000,
      remaining: 12000,
      byCategory: [
        { category: 'Talent', budget: 15000, spent: 14500, percentage: 97 },
        { category: 'Equipment', budget: 12000, spent: 10000, percentage: 83 },
        { category: 'Post-Production', budget: 15000, spent: 10000, percentage: 67 },
        { category: 'Miscellaneous', budget: 8000, spent: 3500, percentage: 44 },
      ],
    };
  },

  /**
   * Create new project
   */
  createProject: async (name: string, format: string, budget: number) => {
    return {
      projectId: `proj-${Date.now()}`,
      name,
      status: 'pre-production',
      progress: 0,
      duration: 0,
      format,
      createdAt: new Date(),
      updatedAt: new Date(),
      teamSize: 1,
      budget,
      spent: 0,
    };
  },

  /**
   * Update project status
   */
  updateProjectStatus: async (
    projectId: string,
    status: 'pre-production' | 'production' | 'post-production' | 'completed'
  ) => {
    return {
      projectId,
      status,
      updatedAt: new Date(),
    };
  },

  /**
   * Add team member to project
   */
  addTeamMember: async (projectId: string, userId: string, role: string) => {
    return {
      projectId,
      userId,
      role,
      addedAt: new Date(),
    };
  },
};
