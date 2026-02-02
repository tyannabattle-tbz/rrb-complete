/**
 * Team Management and Permissions System
 * Manage users, roles, permissions, and team collaboration
 */

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer' | 'guest';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'share';
  allowed: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  joinedAt: Date;
  lastActive: Date;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'pending';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: TeamMember[];
  createdAt: Date;
  settings: TeamSettings;
}

export interface TeamSettings {
  maxMembers: number;
  allowPublicProjects: boolean;
  requireApprovalForNewMembers: boolean;
  defaultRole: UserRole;
  storageQuota: number; // in GB
}

export class TeamManager {
  private teams: Map<string, Team> = new Map();
  private rolePermissions: Map<UserRole, Permission[]> = new Map();

  constructor() {
    this.initializeRolePermissions();
  }

  /**
   * Initialize role-based permissions
   */
  private initializeRolePermissions(): void {
    this.rolePermissions.set('admin', [
      { resource: 'team', action: 'create', allowed: true },
      { resource: 'team', action: 'read', allowed: true },
      { resource: 'team', action: 'update', allowed: true },
      { resource: 'team', action: 'delete', allowed: true },
      { resource: 'project', action: 'create', allowed: true },
      { resource: 'project', action: 'read', allowed: true },
      { resource: 'project', action: 'update', allowed: true },
      { resource: 'project', action: 'delete', allowed: true },
      { resource: 'project', action: 'share', allowed: true },
      { resource: 'user', action: 'create', allowed: true },
      { resource: 'user', action: 'read', allowed: true },
      { resource: 'user', action: 'update', allowed: true },
      { resource: 'user', action: 'delete', allowed: true },
    ]);

    this.rolePermissions.set('manager', [
      { resource: 'project', action: 'create', allowed: true },
      { resource: 'project', action: 'read', allowed: true },
      { resource: 'project', action: 'update', allowed: true },
      { resource: 'project', action: 'delete', allowed: true },
      { resource: 'project', action: 'share', allowed: true },
      { resource: 'user', action: 'read', allowed: true },
      { resource: 'user', action: 'update', allowed: true },
    ]);

    this.rolePermissions.set('editor', [
      { resource: 'project', action: 'read', allowed: true },
      { resource: 'project', action: 'update', allowed: true },
      { resource: 'project', action: 'create', allowed: true },
      { resource: 'user', action: 'read', allowed: true },
    ]);

    this.rolePermissions.set('viewer', [
      { resource: 'project', action: 'read', allowed: true },
      { resource: 'user', action: 'read', allowed: true },
    ]);

    this.rolePermissions.set('guest', [
      { resource: 'project', action: 'read', allowed: true },
    ]);
  }

  /**
   * Create team
   */
  createTeam(
    name: string,
    description: string,
    owner: string,
    settings?: Partial<TeamSettings>
  ): Team {
    const team: Team = {
      id: `team-${Date.now()}`,
      name,
      description,
      owner,
      members: [
        {
          id: owner,
          email: 'owner@team.local',
          name: 'Owner',
          role: 'admin',
          joinedAt: new Date(),
          lastActive: new Date(),
          permissions: this.rolePermissions.get('admin') || [],
          status: 'active',
        },
      ],
      createdAt: new Date(),
      settings: {
        maxMembers: 50,
        allowPublicProjects: true,
        requireApprovalForNewMembers: false,
        defaultRole: 'editor',
        storageQuota: 500,
        ...settings,
      },
    };

    this.teams.set(team.id, team);
    return team;
  }

  /**
   * Add team member
   */
  addMember(teamId: string, email: string, name: string, role: UserRole = 'editor'): TeamMember | null {
    const team = this.teams.get(teamId);
    if (!team) return null;

    if (team.members.length >= team.settings.maxMembers) {
      return null; // Team is full
    }

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      email,
      name,
      role,
      joinedAt: new Date(),
      lastActive: new Date(),
      permissions: this.rolePermissions.get(role) || [],
      status: team.settings.requireApprovalForNewMembers ? 'pending' : 'active',
    };

    team.members.push(member);
    return member;
  }

  /**
   * Update member role
   */
  updateMemberRole(teamId: string, memberId: string, newRole: UserRole): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const member = team.members.find((m) => m.id === memberId);
    if (!member) return false;

    member.role = newRole;
    member.permissions = this.rolePermissions.get(newRole) || [];
    return true;
  }

  /**
   * Remove team member
   */
  removeMember(teamId: string, memberId: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const index = team.members.findIndex((m) => m.id === memberId);
    if (index === -1) return false;

    team.members.splice(index, 1);
    return true;
  }

  /**
   * Check permission
   */
  hasPermission(
    teamId: string,
    memberId: string,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'share'
  ): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const member = team.members.find((m) => m.id === memberId);
    if (!member || member.status !== 'active') return false;

    const permission = member.permissions.find((p) => p.resource === resource && p.action === action);
    return permission?.allowed || false;
  }

  /**
   * Get team members
   */
  getTeamMembers(teamId: string): TeamMember[] {
    const team = this.teams.get(teamId);
    return team?.members || [];
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  /**
   * Get all teams
   */
  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  /**
   * Get team statistics
   */
  getTeamStats(teamId: string) {
    const team = this.teams.get(teamId);
    if (!team) return null;

    const activeMembers = team.members.filter((m) => m.status === 'active').length;
    const pendingMembers = team.members.filter((m) => m.status === 'pending').length;
    const membersByRole = {
      admin: team.members.filter((m) => m.role === 'admin').length,
      manager: team.members.filter((m) => m.role === 'manager').length,
      editor: team.members.filter((m) => m.role === 'editor').length,
      viewer: team.members.filter((m) => m.role === 'viewer').length,
      guest: team.members.filter((m) => m.role === 'guest').length,
    };

    return {
      totalMembers: team.members.length,
      activeMembers,
      pendingMembers,
      membersByRole,
      storageQuota: team.settings.storageQuota,
      createdAt: team.createdAt,
    };
  }

  /**
   * Update team settings
   */
  updateTeamSettings(teamId: string, settings: Partial<TeamSettings>): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    team.settings = { ...team.settings, ...settings };
    return true;
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions.get(role) || [];
  }
}

export const teamManager = new TeamManager();
