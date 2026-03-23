/**
 * Route Recovery System
 * Handles broken routes with automatic fallbacks and recovery
 */

export interface RouteMapping {
  path: string;
  fallback: string;
  description: string;
}

class RouteRecoverySystem {
  private routeMappings: Map<string, RouteMapping> = new Map();
  private recoveryLog: Array<{ timestamp: string; from: string; to: string; reason: string }> = [];

  constructor() {
    this.initializeRouteMappings();
  }

  private initializeRouteMappings() {
    const mappings: RouteMapping[] = [
      { path: '/rrb-legacy', fallback: '/rrb-radio', description: 'RRB Legacy Site' },
      { path: '/rrb-radio', fallback: '/radio', description: 'RRB Radio Integration' },
      { path: '/radio', fallback: '/radio-station', description: 'Radio Station' },
      { path: '/qumus-dashboard', fallback: '/qumus-chat', description: 'QUMUS Monitoring Dashboard' },
      { path: '/qumus-chat', fallback: '/chat', description: 'QUMUS Chat Interface' },
      { path: '/admin-errors', fallback: '/admin/errors', description: 'Admin Error Dashboard' },
      { path: '/admin/health', fallback: '/qumus-dashboard', description: 'Health Checks Dashboard' },
      { path: '/broadcast-orchestration', fallback: '/broadcast-monitoring', description: 'Broadcast Orchestration Hub' },
      { path: '/broadcast-monitoring', fallback: '/rrb-radio', description: 'RRB Broadcast Monitoring' },
      { path: '/podcasts', fallback: '/podcast-discovery', description: 'Podcasts Hub' },
      { path: '/podcast-discovery', fallback: '/podcasts', description: 'Podcast Discovery' },
      { path: '/analytics-advanced', fallback: '/listener-analytics', description: 'Advanced Analytics Dashboard' },
      { path: '/listener-analytics', fallback: '/analytics-advanced', description: 'Listener Analytics' },
      { path: '/studio-suite', fallback: '/studio', description: 'Studio Suite' },
      { path: '/studio', fallback: '/media-library', description: 'Studio' },
      { path: '/canryn', fallback: '/rrb', description: 'Canryn Production Dashboard' },
      { path: '/hybridcast', fallback: '/broadcast-monitoring', description: 'HybridCast Broadcast Management' },
      { path: '/compliance-audit', fallback: '/admin-errors', description: 'Compliance Audit Viewer' },
      { path: '*', fallback: '/', description: 'Default Home' },
    ];

    mappings.forEach(mapping => {
      this.routeMappings.set(mapping.path, mapping);
    });
  }

  recoverRoute(brokenRoute: string): string {
    const mapping = this.routeMappings.get(brokenRoute) || this.routeMappings.get('*');
    if (!mapping) return '/';
    this.logRecovery(brokenRoute, mapping.fallback, 'Route not found');
    return mapping.fallback;
  }

  isRouteValid(path: string): boolean {
    return this.routeMappings.has(path) || path === '/';
  }

  getAvailableRoutes(): RouteMapping[] {
    return Array.from(this.routeMappings.values()).filter(m => m.path !== '*');
  }

  getFallbackChain(path: string): string[] {
    const chain: string[] = [path];
    let current = path;
    for (let i = 0; i < 10; i++) {
      const mapping = this.routeMappings.get(current);
      if (!mapping || mapping.fallback === current) break;
      chain.push(mapping.fallback);
      current = mapping.fallback;
    }
    return chain;
  }

  private logRecovery(from: string, to: string, reason: string) {
    this.recoveryLog.push({ timestamp: new Date().toISOString(), from, to, reason });
    if (this.recoveryLog.length > 1000) this.recoveryLog.shift();
  }

  getRecoveryLog(limit: number = 50) {
    return this.recoveryLog.slice(-limit).reverse();
  }

  getRecoveryStats() {
    const stats = {
      totalRecoveries: this.recoveryLog.length,
      bySource: {} as Record<string, number>,
      byTarget: {} as Record<string, number>,
      lastRecovery: this.recoveryLog[this.recoveryLog.length - 1],
    };
    this.recoveryLog.forEach(event => {
      stats.bySource[event.from] = (stats.bySource[event.from] || 0) + 1;
      stats.byTarget[event.to] = (stats.byTarget[event.to] || 0) + 1;
    });
    return stats;
  }

  registerRouteMapping(path: string, fallback: string, description: string) {
    this.routeMappings.set(path, { path, fallback, description });
  }

  handle404(attemptedPath: string): string {
    return this.recoverRoute(attemptedPath);
  }

  validateAndRepair(path: string): { isValid: boolean; repairedPath: string } {
    if (this.isRouteValid(path)) {
      return { isValid: true, repairedPath: path };
    }
    const repairedPath = this.recoverRoute(path);
    return { isValid: false, repairedPath };
  }

  getRouteHealthStatus() {
    const totalRoutes = this.routeMappings.size;
    const recoveryRate = this.recoveryLog.length > 0 
      ? (this.recoveryLog.length / (this.recoveryLog.length + totalRoutes)) * 100 
      : 0;
    return {
      totalRoutes,
      totalRecoveries: this.recoveryLog.length,
      recoveryRate: recoveryRate.toFixed(2) + '%',
      status: recoveryRate < 5 ? 'healthy' : 'degraded',
      lastRecovery: this.recoveryLog[this.recoveryLog.length - 1]?.timestamp,
    };
  }
}

export const routeRecoverySystem = new RouteRecoverySystem();
