/**
 * Team Collaboration Workspace Service
 * Enables shared video projects, permissions, and workflows
 */

export type UserRole = 'owner' | 'editor' | 'viewer' | 'commenter';

export interface TeamMember {
  userId: string;
  email: string;
  role: UserRole;
  joinedAt: Date;
  lastActive: Date;
}

export interface ProjectComment {
  commentId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies: ProjectComment[];
}

export interface ProjectVersion {
  versionId: string;
  createdBy: string;
  createdAt: Date;
  description: string;
  videoId: string;
  changes: string[];
}

export interface SharedProject {
  projectId: string;
  name: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  status: 'draft' | 'in-review' | 'approved' | 'published';
  createdAt: Date;
  updatedAt: Date;
  versions: ProjectVersion[];
  comments: ProjectComment[];
  permissions: Record<string, string[]>; // role -> permissions
}

export class TeamCollaborationService {
  private projects: Map<string, SharedProject> = new Map();
  private userProjects: Map<string, Set<string>> = new Map(); // userId -> projectIds
  private activityLog: Array<{ timestamp: Date; userId: string; action: string; projectId: string }> = [];

  /**
   * Create a shared project
   */
  createProject(projectId: string, name: string, ownerId: string, description: string = ''): SharedProject {
    const project: SharedProject = {
      projectId,
      name,
      description,
      ownerId,
      members: [
        {
          userId: ownerId,
          email: '',
          role: 'owner',
          joinedAt: new Date(),
          lastActive: new Date(),
        },
      ],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: [],
      comments: [],
      permissions: {
        owner: ['edit', 'delete', 'share', 'approve', 'publish', 'comment'],
        editor: ['edit', 'comment', 'view-history'],
        commenter: ['comment', 'view'],
        viewer: ['view'],
      },
    };

    this.projects.set(projectId, project);
    this.addUserProject(ownerId, projectId);
    this.logActivity(ownerId, 'created_project', projectId);

    return project;
  }

  /**
   * Add team member to project
   */
  addTeamMember(projectId: string, userId: string, email: string, role: UserRole): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    // Check if member already exists
    if (project.members.some((m) => m.userId === userId)) {
      return false;
    }

    project.members.push({
      userId,
      email,
      role,
      joinedAt: new Date(),
      lastActive: new Date(),
    });

    this.addUserProject(userId, projectId);
    this.logActivity(project.ownerId, 'added_member', projectId);

    return true;
  }

  /**
   * Remove team member from project
   */
  removeTeamMember(projectId: string, userId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const initialLength = project.members.length;
    project.members = project.members.filter((m) => m.userId !== userId);

    if (project.members.length < initialLength) {
      this.removeUserProject(userId, projectId);
      this.logActivity(project.ownerId, 'removed_member', projectId);
      return true;
    }

    return false;
  }

  /**
   * Update member role
   */
  updateMemberRole(projectId: string, userId: string, newRole: UserRole): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const member = project.members.find((m) => m.userId === userId);
    if (!member) return false;

    member.role = newRole;
    this.logActivity(project.ownerId, 'updated_role', projectId);

    return true;
  }

  /**
   * Add comment to project
   */
  addComment(projectId: string, userId: string, userName: string, content: string): ProjectComment | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const comment: ProjectComment = {
      commentId: `comment-${Date.now()}`,
      userId,
      userName,
      content,
      timestamp: new Date(),
      resolved: false,
      replies: [],
    };

    project.comments.push(comment);
    this.logActivity(userId, 'added_comment', projectId);

    return comment;
  }

  /**
   * Reply to comment
   */
  replyToComment(projectId: string, commentId: string, userId: string, userName: string, content: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const findAndReply = (comments: ProjectComment[]): boolean => {
      for (const comment of comments) {
        if (comment.commentId === commentId) {
          comment.replies.push({
            commentId: `reply-${Date.now()}`,
            userId,
            userName,
            content,
            timestamp: new Date(),
            resolved: false,
            replies: [],
          });
          return true;
        }
        if (findAndReply(comment.replies)) {
          return true;
        }
      }
      return false;
    };

    return findAndReply(project.comments);
  }

  /**
   * Resolve comment
   */
  resolveComment(projectId: string, commentId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const findAndResolve = (comments: ProjectComment[]): boolean => {
      for (const comment of comments) {
        if (comment.commentId === commentId) {
          comment.resolved = true;
          return true;
        }
        if (findAndResolve(comment.replies)) {
          return true;
        }
      }
      return false;
    };

    return findAndResolve(project.comments);
  }

  /**
   * Create project version
   */
  createVersion(projectId: string, userId: string, videoId: string, description: string, changes: string[]): ProjectVersion | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const version: ProjectVersion = {
      versionId: `v-${Date.now()}`,
      createdBy: userId,
      createdAt: new Date(),
      description,
      videoId,
      changes,
    };

    project.versions.push(version);
    project.updatedAt = new Date();
    this.logActivity(userId, 'created_version', projectId);

    return version;
  }

  /**
   * Update project status
   */
  updateProjectStatus(projectId: string, status: 'draft' | 'in-review' | 'approved' | 'published'): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    project.status = status;
    project.updatedAt = new Date();

    return true;
  }

  /**
   * Get project
   */
  getProject(projectId: string): SharedProject | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Get user's projects
   */
  getUserProjects(userId: string): SharedProject[] {
    const projectIds = this.userProjects.get(userId) || new Set();
    return Array.from(projectIds)
      .map((id) => this.projects.get(id))
      .filter((p) => p !== undefined) as SharedProject[];
  }

  /**
   * Check permission
   */
  hasPermission(projectId: string, userId: string, permission: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const member = project.members.find((m) => m.userId === userId);
    if (!member) return false;

    const permissions = project.permissions[member.role] || [];
    return permissions.includes(permission);
  }

  /**
   * Get team members
   */
  getTeamMembers(projectId: string): TeamMember[] {
    const project = this.projects.get(projectId);
    return project ? project.members : [];
  }

  /**
   * Get activity log
   */
  getActivityLog(projectId: string, limit: number = 50): Array<{ timestamp: Date; userId: string; action: string }> {
    return this.activityLog
      .filter((log) => log.projectId === projectId)
      .slice(-limit)
      .map(({ timestamp, userId, action }) => ({ timestamp, userId, action }));
  }

  /**
   * Private helper: Add user project
   */
  private addUserProject(userId: string, projectId: string): void {
    if (!this.userProjects.has(userId)) {
      this.userProjects.set(userId, new Set());
    }
    this.userProjects.get(userId)!.add(projectId);
  }

  /**
   * Private helper: Remove user project
   */
  private removeUserProject(userId: string, projectId: string): void {
    const projects = this.userProjects.get(userId);
    if (projects) {
      projects.delete(projectId);
    }
  }

  /**
   * Private helper: Log activity
   */
  private logActivity(userId: string, action: string, projectId: string): void {
    this.activityLog.push({ timestamp: new Date(), userId, action, projectId });
    if (this.activityLog.length > 10000) {
      this.activityLog = this.activityLog.slice(-5000);
    }
  }

  /**
   * Export project for sharing
   */
  exportProject(projectId: string): string | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    return JSON.stringify(project, null, 2);
  }

  /**
   * Import project
   */
  importProject(data: string, newOwnerId: string): SharedProject | null {
    try {
      const project = JSON.parse(data) as SharedProject;
      project.projectId = `project-${Date.now()}`;
      project.ownerId = newOwnerId;
      project.createdAt = new Date();
      project.updatedAt = new Date();

      this.projects.set(project.projectId, project);
      this.addUserProject(newOwnerId, project.projectId);

      return project;
    } catch (error) {
      console.error('Failed to import project:', error);
      return null;
    }
  }
}

export const teamCollaborationService = new TeamCollaborationService();
