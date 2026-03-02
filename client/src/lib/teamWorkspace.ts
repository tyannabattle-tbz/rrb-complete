/**
 * Team Workspace Management System
 * Create teams, manage members, and control permissions
 */

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  joinedAt: Date;
  lastActive: Date;
}

export interface TeamPermissions {
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canManageMembers: boolean;
  canPublishContent: boolean;
  canAccessAnalytics: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  owner: string;
  members: Map<string, TeamMember>;
  permissions: Map<UserRole, TeamPermissions>;
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  userId: string;
  teams: Map<string, Team>;
  personalProjects: string[];
  sharedProjects: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_PERMISSIONS: Record<UserRole, TeamPermissions> = {
  admin: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canManageMembers: true,
    canPublishContent: true,
    canAccessAnalytics: true,
  },
  editor: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canManageMembers: false,
    canPublishContent: true,
    canAccessAnalytics: false,
  },
  viewer: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canManageMembers: false,
    canPublishContent: false,
    canAccessAnalytics: false,
  },
};

export class TeamWorkspaceManager {
  private workspaces: Map<string, Workspace> = new Map();
  private teams: Map<string, Team> = new Map();

  /**
   * Create a new team
   */
  createTeam(
    name: string,
    description: string,
    ownerId: string,
    ownerName: string,
    ownerEmail: string
  ): Team {
    const teamId = `team-${Date.now()}`;
    const team: Team = {
      id: teamId,
      name,
      description,
      owner: ownerId,
      members: new Map(),
      permissions: new Map(Object.entries(DEFAULT_PERMISSIONS) as [UserRole, TeamPermissions][]),
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add owner as admin
    team.members.set(ownerId, {
      userId: ownerId,
      name: ownerName,
      email: ownerEmail,
      role: 'admin',
      joinedAt: new Date(),
      lastActive: new Date(),
    });

    this.teams.set(teamId, team);
    return team;
  }

  /**
   * Add member to team
   */
  addTeamMember(
    teamId: string,
    userId: string,
    name: string,
    email: string,
    role: UserRole = 'viewer'
  ): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    if (team.members.has(userId)) return false;

    team.members.set(userId, {
      userId,
      name,
      email,
      role,
      joinedAt: new Date(),
      lastActive: new Date(),
    });

    team.updatedAt = new Date();
    return true;
  }

  /**
   * Remove member from team
   */
  removeTeamMember(teamId: string, userId: string): boolean {
    const team = this.teams.get(teamId);
    if (!team || team.owner === userId) return false;

    team.members.delete(userId);
    team.updatedAt = new Date();
    return true;
  }

  /**
   * Update member role
   */
  updateMemberRole(teamId: string, userId: string, newRole: UserRole): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const member = team.members.get(userId);
    if (!member) return false;

    member.role = newRole;
    team.updatedAt = new Date();
    return true;
  }

  /**
   * Check if user has permission
   */
  hasPermission(teamId: string, userId: string, permission: keyof TeamPermissions): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const member = team.members.get(userId);
    if (!member) return false;

    const rolePermissions = team.permissions.get(member.role);
    if (!rolePermissions) return false;

    return rolePermissions[permission];
  }

  /**
   * Get team members
   */
  getTeamMembers(teamId: string): TeamMember[] {
    const team = this.teams.get(teamId);
    if (!team) return [];

    const members: TeamMember[] = [];
    team.members.forEach((member) => members.push(member));
    return members;
  }

  /**
   * Get user's teams
   */
  getUserTeams(userId: string): Team[] {
    const userTeams: Team[] = [];
    this.teams.forEach((team) => {
      if (team.members.has(userId)) {
        userTeams.push(team);
      }
    });
    return userTeams;
  }

  /**
   * Create workspace for user
   */
  createWorkspace(userId: string): Workspace {
    const workspaceId = `workspace-${userId}`;
    const workspace: Workspace = {
      id: workspaceId,
      userId,
      teams: new Map(),
      personalProjects: [],
      sharedProjects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workspaces.set(workspaceId, workspace);
    return workspace;
  }

  /**
   * Get user workspace
   */
  getUserWorkspace(userId: string): Workspace | undefined {
    return Array.from(this.workspaces.values()).find((w) => w.userId === userId);
  }

  /**
   * Add project to team
   */
  addProjectToTeam(teamId: string, projectId: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    if (!team.projects.includes(projectId)) {
      team.projects.push(projectId);
      team.updatedAt = new Date();
    }

    return true;
  }

  /**
   * Remove project from team
   */
  removeProjectFromTeam(teamId: string, projectId: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const index = team.projects.indexOf(projectId);
    if (index > -1) {
      team.projects.splice(index, 1);
      team.updatedAt = new Date();
      return true;
    }

    return false;
  }

  /**
   * Get team projects
   */
  getTeamProjects(teamId: string): string[] {
    const team = this.teams.get(teamId);
    return team ? [...team.projects] : [];
  }

  /**
   * Update team info
   */
  updateTeamInfo(teamId: string, name?: string, description?: string, avatar?: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    if (name) team.name = name;
    if (description) team.description = description;
    if (avatar) team.avatar = avatar;

    team.updatedAt = new Date();
    return true;
  }

  /**
   * Delete team
   */
  deleteTeam(teamId: string): boolean {
    return this.teams.delete(teamId);
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  /**
   * Update member last active
   */
  updateMemberActivity(teamId: string, userId: string): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    const member = team.members.get(userId);
    if (member) {
      member.lastActive = new Date();
    }
  }
}

export function createTeamWorkspaceManager(): TeamWorkspaceManager {
  return new TeamWorkspaceManager();
}
