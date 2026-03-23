/**
 * TBZ OS Integration System
 * Manages navigation and subsystem integration for TBZ Operating System
 */

export interface Subsystem {
  id: string;
  name: string;
  icon: string;
  route: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface TBZSystem {
  id: string;
  name: string;
  description: string;
  subsystems: Subsystem[];
  status: 'operational' | 'degraded' | 'critical';
}

export interface Breadcrumb {
  label: string;
  route: string;
}

class TBZOSIntegrationSystem {
  private systems: Map<string, TBZSystem> = new Map();
  private routeToSystem: Map<string, { system: TBZSystem; subsystem?: Subsystem }> = new Map();

  constructor() {
    this.initializeSystems();
  }

  private initializeSystems() {
    // RRB Radio System
    const rrbRadio: TBZSystem = {
      id: 'rrb-radio',
      name: 'RRB Radio',
      description: 'Rockin\' Rockin\' Boogie Radio Network',
      status: 'operational',
      subsystems: [
        { id: 'channels', name: 'Channels', icon: 'Radio', route: '/rrb-radio/channels', status: 'active' },
        { id: 'listeners', name: 'Listeners', icon: 'Users', route: '/rrb-radio/listeners', status: 'active' },
        { id: 'broadcast', name: 'Broadcast Control', icon: 'Zap', route: '/rrb-radio/broadcast', status: 'active' },
        { id: 'analytics', name: 'Analytics', icon: 'BarChart3', route: '/rrb-radio/analytics', status: 'active' },
      ],
    };

    // QUMUS System
    const qumus: TBZSystem = {
      id: 'qumus',
      name: 'QUMUS Control Center',
      description: 'Autonomous Orchestration Engine',
      status: 'operational',
      subsystems: [
        { id: 'dashboard', name: 'Dashboard', icon: 'Gauge', route: '/qumus-dashboard', status: 'active' },
        { id: 'policies', name: 'Policies', icon: 'Settings', route: '/qumus-policies', status: 'active' },
        { id: 'health', name: 'Health Check', icon: 'Activity', route: '/admin/health', status: 'active' },
        { id: 'chat', name: 'Chat Interface', icon: 'MessageCircle', route: '/qumus-chat', status: 'active' },
      ],
    };

    // HybridCast System
    const hybridCast: TBZSystem = {
      id: 'hybridcast',
      name: 'HybridCast',
      description: 'Emergency Broadcast Platform',
      status: 'operational',
      subsystems: [
        { id: 'broadcast', name: 'Broadcast', icon: 'AlertCircle', route: '/hybridcast/broadcast', status: 'active' },
        { id: 'emergency', name: 'Emergency', icon: 'AlertTriangle', route: '/hybridcast/emergency', status: 'maintenance' },
        { id: 'mesh', name: 'Mesh Network', icon: 'Network', route: '/hybridcast/mesh', status: 'active' },
      ],
    };

    // Canryn Production System
    const canryn: TBZSystem = {
      id: 'canryn',
      name: 'Canryn Production',
      description: 'Production Management',
      status: 'operational',
      subsystems: [
        { id: 'studio', name: 'Studio Suite', icon: 'Mic2', route: '/studio-suite', status: 'active' },
        { id: 'projects', name: 'Projects', icon: 'Folder', route: '/canryn/projects', status: 'active' },
        { id: 'team', name: 'Team', icon: 'Users', route: '/canryn/team', status: 'active' },
      ],
    };

    // Sweet Miracles System
    const sweetMiracles: TBZSystem = {
      id: 'sweet-miracles',
      name: 'Sweet Miracles',
      description: 'Nonprofit & Donations',
      status: 'operational',
      subsystems: [
        { id: 'donations', name: 'Donations', icon: 'Heart', route: '/sweet-miracles/donations', status: 'active' },
        { id: 'campaigns', name: 'Campaigns', icon: 'Target', route: '/sweet-miracles/campaigns', status: 'active' },
        { id: 'impact', name: 'Impact', icon: 'TrendingUp', route: '/sweet-miracles/impact', status: 'active' },
      ],
    };

    // Admin System
    const admin: TBZSystem = {
      id: 'admin',
      name: 'Admin',
      description: 'System Administration',
      status: 'operational',
      subsystems: [
        { id: 'errors', name: 'Error Dashboard', icon: 'AlertCircle', route: '/admin/errors', status: 'active' },
        { id: 'health', name: 'Health Checks', icon: 'Activity', route: '/admin/health', status: 'active' },
        { id: 'users', name: 'Users', icon: 'Users', route: '/admin/users', status: 'active' },
      ],
    };

    this.systems.set('rrb-radio', rrbRadio);
    this.systems.set('qumus', qumus);
    this.systems.set('hybridcast', hybridCast);
    this.systems.set('canryn', canryn);
    this.systems.set('sweet-miracles', sweetMiracles);
    this.systems.set('admin', admin);

    this.buildRouteMap();
  }

  private buildRouteMap() {
    this.systems.forEach(system => {
      this.routeToSystem.set(`/${system.id}`, { system });
      system.subsystems.forEach(subsystem => {
        this.routeToSystem.set(subsystem.route, { system, subsystem });
      });
    });
  }

  getSystemByRoute(route: string) {
    return this.routeToSystem.get(route) || { system: undefined, subsystem: undefined };
  }

  getBreadcrumbs(systemId: string, subsystemId?: string): Breadcrumb[] {
    const system = this.systems.get(systemId);
    if (!system) return [{ label: 'Home', route: '/' }];

    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', route: '/' },
      { label: system.name, route: `/${system.id}` },
    ];

    if (subsystemId) {
      const subsystem = system.subsystems.find(s => s.id === subsystemId);
      if (subsystem) {
        breadcrumbs.push({ label: subsystem.name, route: subsystem.route });
      }
    }

    return breadcrumbs;
  }

  getAllSystems(): TBZSystem[] {
    return Array.from(this.systems.values());
  }

  getSystemStatus(systemId: string) {
    return this.systems.get(systemId);
  }

  getLiveSystemsStatus() {
    return {
      rrbRadio: {
        status: 'active',
        listeners: 3847,
        channels: 54,
        uptime: '99.8%',
      },
      qumus: {
        status: 'active',
        subsystems: 20,
        autonomy: '90%',
        policies: 20,
      },
      hybridCast: {
        status: 'maintenance',
        uptime: '98.5%',
        regions: 12,
      },
      smartGlasses: {
        status: 'active',
        devices: 42,
        connected: 38,
      },
      studiMic: {
        status: 'active',
        channels: 8,
        recording: true,
      },
      robotBridge: {
        status: 'maintenance',
        units: 15,
        operational: 12,
      },
    };
  }

  registerSystem(system: TBZSystem) {
    this.systems.set(system.id, system);
    this.buildRouteMap();
  }

  updateSystemStatus(systemId: string, status: 'operational' | 'degraded' | 'critical') {
    const system = this.systems.get(systemId);
    if (system) {
      system.status = status;
    }
  }
}

export const tbzOSIntegrationSystem = new TBZOSIntegrationSystem();
