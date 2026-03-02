/**
 * Project Management and Workflow System for Mega Control Station
 * Track projects, tasks, deadlines, and resources
 */

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  dependencies: string[];
  subtasks: ProjectTask[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'production' | 'post-production' | 'completed' | 'archived';
  owner: string;
  team: string[];
  startDate: Date;
  endDate?: Date;
  budget?: number;
  tasks: ProjectTask[];
  resources: ProjectResource[];
  timeline: ProjectMilestone[];
  progress: number;
}

export interface ProjectResource {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'other';
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
  status: 'draft' | 'approved' | 'final';
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  deliverables: string[];
}

export class ProjectManager {
  private projects: Map<string, Project> = new Map();
  private tasks: Map<string, ProjectTask> = new Map();

  /**
   * Create new project
   */
  createProject(
    name: string,
    description: string,
    owner: string,
    team: string[] = []
  ): Project {
    const project: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      status: 'planning',
      owner,
      team,
      startDate: new Date(),
      tasks: [],
      resources: [],
      timeline: [],
      progress: 0,
    };

    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Add task to project
   */
  addTask(
    projectId: string,
    title: string,
    description: string,
    assignedTo: string,
    dueDate: Date,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): ProjectTask | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const task: ProjectTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      assignedTo,
      status: 'todo',
      priority,
      dueDate,
      createdAt: new Date(),
      dependencies: [],
      subtasks: [],
    };

    project.tasks.push(task);
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Update task status
   */
  updateTaskStatus(
    taskId: string,
    status: 'todo' | 'in-progress' | 'review' | 'completed'
  ): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }

    return true;
  }

  /**
   * Add resource to project
   */
  addResource(
    projectId: string,
    type: 'video' | 'audio' | 'image' | 'document' | 'other',
    name: string,
    size: number,
    uploadedBy: string,
    url: string
  ): ProjectResource | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const resource: ProjectResource = {
      id: `res-${Date.now()}`,
      type,
      name,
      size,
      uploadedBy,
      uploadedAt: new Date(),
      url,
      status: 'draft',
    };

    project.resources.push(resource);
    return resource;
  }

  /**
   * Add milestone to project
   */
  addMilestone(
    projectId: string,
    title: string,
    description: string,
    dueDate: Date,
    deliverables: string[] = []
  ): ProjectMilestone | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const milestone: ProjectMilestone = {
      id: `mile-${Date.now()}`,
      title,
      description,
      dueDate,
      status: 'pending',
      deliverables,
    };

    project.timeline.push(milestone);
    return milestone;
  }

  /**
   * Calculate project progress
   */
  calculateProgress(projectId: string): number {
    const project = this.projects.get(projectId);
    if (!project || project.tasks.length === 0) return 0;

    const completedTasks = project.tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  }

  /**
   * Get project timeline
   */
  getProjectTimeline(projectId: string) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    return {
      projectName: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      duration: project.endDate
        ? Math.round((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      milestones: project.timeline.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
      tasks: project.tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    };
  }

  /**
   * Get project overview
   */
  getProjectOverview(projectId: string) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const progress = this.calculateProgress(projectId);
    const completedTasks = project.tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = project.tasks.filter((t) => t.status === 'in-progress').length;
    const totalResources = project.resources.length;
    const totalResourceSize = project.resources.reduce((sum, r) => sum + r.size, 0);

    return {
      project: project.name,
      status: project.status,
      progress,
      tasks: {
        total: project.tasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: project.tasks.length - completedTasks - inProgressTasks,
      },
      resources: {
        total: totalResources,
        size: totalResourceSize,
        sizeFormatted: this.formatFileSize(totalResourceSize),
      },
      team: {
        owner: project.owner,
        members: project.team.length,
      },
      timeline: {
        startDate: project.startDate,
        endDate: project.endDate,
      },
    };
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get project by ID
   */
  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(projectId: string, status: string): ProjectTask[] {
    const project = this.projects.get(projectId);
    if (!project) return [];

    return project.tasks.filter((t) => t.status === status);
  }

  /**
   * Get overdue tasks
   */
  getOverdueTasks(projectId: string): ProjectTask[] {
    const project = this.projects.get(projectId);
    if (!project) return [];

    const now = new Date();
    return project.tasks.filter((t) => t.dueDate < now && t.status !== 'completed');
  }

  /**
   * Get upcoming milestones
   */
  getUpcomingMilestones(projectId: string, days: number = 30): ProjectMilestone[] {
    const project = this.projects.get(projectId);
    if (!project) return [];

    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return project.timeline.filter(
      (m) => m.dueDate >= now && m.dueDate <= futureDate && m.status !== 'completed'
    );
  }

  /**
   * Helper: Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const projectManager = new ProjectManager();
